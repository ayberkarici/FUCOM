import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

/**
 * Authenticate with Google Drive using Service Account credentials
 */
function getAuthClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error(
      "Missing Google credentials. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY environment variables."
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });

  return auth;
}

/**
 * Upload a file buffer to Google Drive
 * @param buffer - The file buffer to upload
 * @param fileName - The name of the file
 * @param mimeType - The MIME type of the file
 * @param folderId - The Google Drive folder ID to upload to
 * @returns The uploaded file metadata
 */
export async function uploadToGoogleDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  folderId?: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const auth = getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const targetFolderId = folderId || process.env.DRIVE_FOLDER_ID;

  if (!targetFolderId) {
    throw new Error(
      "Missing Drive folder ID. Please set DRIVE_FOLDER_ID environment variable."
    );
  }

  // Convert buffer to readable stream
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const fileMetadata = {
    name: fileName,
    parents: [targetFolderId],
  };

  const media = {
    mimeType: mimeType,
    body: stream,
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink",
    });

    return {
      id: response.data.id || "",
      name: response.data.name || fileName,
      webViewLink: response.data.webViewLink || undefined,
    };
  } catch (error: unknown) {
    const err = error as Error & { code?: number; errors?: unknown[] };
    console.error("Error uploading to Google Drive:", err);
    throw new Error(`Failed to upload file to Google Drive: ${err.message}`);
  }
}

/**
 * Check if the service account has access to the specified folder
 * @param folderId - The folder ID to check access for
 * @returns Boolean indicating if access is available
 */
export async function checkFolderAccess(folderId?: string): Promise<boolean> {
  const auth = getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const targetFolderId = folderId || process.env.DRIVE_FOLDER_ID;

  if (!targetFolderId) {
    return false;
  }

  try {
    await drive.files.get({
      fileId: targetFolderId,
      fields: "id, name",
    });
    return true;
  } catch {
    return false;
  }
}
