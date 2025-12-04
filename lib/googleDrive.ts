import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

/**
 * Authenticate with Google Drive using Service Account credentials
 */
function getAuthClient() {
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error(
      "Missing Google credentials. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY environment variables."
    );
  }

  // Handle different formats of private key from environment variables
  // Vercel and other platforms may escape newlines differently
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  
  // Remove surrounding quotes if present (some platforms add them)
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  
  // Ensure proper PEM format
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error("Invalid private key format. Key must be in PEM format.");
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
      supportsAllDrives: true, // Support shared drives
    });

    return {
      id: response.data.id || "",
      name: response.data.name || fileName,
      webViewLink: response.data.webViewLink || undefined,
    };
  } catch (error: unknown) {
    const err = error as Error & { code?: number; errors?: Array<{ reason?: string; message?: string }> };
    console.error("Error uploading to Google Drive:", err);
    
    // Provide user-friendly error messages
    const errorMessage = err.message || '';
    
    // Check for storage quota error (Service Accounts don't have storage)
    if (errorMessage.includes('storage quota') || errorMessage.includes('Service Accounts')) {
      throw new Error("Service Account depolama kotası hatası. Lütfen Google Drive klasörünü service account email'i ile 'Editor' olarak paylaşın: fucom-service-account@fucom-480220.iam.gserviceaccount.com");
    }
    
    if (err.errors && err.errors.length > 0) {
      const firstError = err.errors[0];
      if (firstError.reason === 'accessNotConfigured') {
        throw new Error("Google Drive API etkinleştirilmemiş. Lütfen Google Cloud Console'dan Drive API'yi etkinleştirin.");
      }
      if (firstError.reason === 'notFound') {
        throw new Error("Google Drive klasörü bulunamadı. Klasör ID'sini kontrol edin.");
      }
      if (firstError.reason === 'forbidden' || firstError.reason === 'insufficientPermissions') {
        throw new Error("Google Drive klasörüne erişim izni yok. Service account'u klasöre 'Editor' olarak ekleyin.");
      }
      if (firstError.reason === 'storageQuotaExceeded') {
        throw new Error("Depolama kotası aşıldı. Klasörü service account ile paylaşın.");
      }
    }
    
    throw new Error(`Google Drive yükleme hatası: ${err.message}`);
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
