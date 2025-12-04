import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { uploadToGoogleDrive } from "@/lib/googleDrive";

// Types
interface Criterion {
  id: string;
  code: string;
  name: string;
  nameTR?: string;
}

interface Demographics {
  nameSurname: string;
  age: string;
  profession: string;
  gender: string;
  education: string;
}

interface PairwiseComparison {
  first: string;
  second: string;
  value: string;
}

interface FormData {
  demographics: Demographics;
  mainCriteriaOrder: Criterion[];
  economicalSubOrder: Criterion[];
  socialSubOrder: Criterion[];
  environmentalSubOrder: Criterion[];
  mainComparisons: PairwiseComparison[];
  economicalComparisons: PairwiseComparison[];
  socialComparisons: PairwiseComparison[];
  environmentalComparisons: PairwiseComparison[];
}

// Cell styling helpers
function applyHeaderStyle(cell: ExcelJS.Cell) {
  cell.font = { bold: true, size: 11 };
  cell.alignment = { vertical: "middle", horizontal: "left" };
}

function applyCenterStyle(cell: ExcelJS.Cell) {
  cell.alignment = { vertical: "middle", horizontal: "center" };
}

function applyBorderStyle(cell: ExcelJS.Cell) {
  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json();

    // Validate required fields
    if (!formData.demographics.nameSurname) {
      return NextResponse.json(
        { error: "Ad-Soyad alanı zorunludur." },
        { status: 400 }
      );
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "FUCOM Survey App";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("FUCOM Veri Formu", {
      views: [{ showGridLines: true }],
    });

    // Set column widths
    sheet.columns = [
      { width: 15 }, // A
      { width: 12 }, // B
      { width: 12 }, // C
      { width: 12 }, // D
      { width: 12 }, // E
      { width: 12 }, // F
      { width: 12 }, // G
      { width: 15 }, // H
      { width: 15 }, // I
      { width: 15 }, // J
      { width: 15 }, // K
      { width: 5 },  // L
      { width: 12 }, // M
      { width: 12 }, // N
      { width: 12 }, // O
      { width: 12 }, // P
    ];

    // ========== ROW 1: Header ==========
    sheet.getCell("A1").value = "DEĞERLENDİRİCİ İLE İLGİLİ BİLGİLER:";
    applyHeaderStyle(sheet.getCell("A1"));
    sheet.getCell("A1").font = { bold: true, size: 12 };

    // ========== ROW 2: Demographics - Line 1 ==========
    sheet.getCell("A2").value = "AD-SOYAD:";
    applyHeaderStyle(sheet.getCell("A2"));
    sheet.getCell("B2").value = formData.demographics.nameSurname;
    sheet.mergeCells("B2:C2");

    sheet.getCell("D2").value = "YAŞ:";
    applyHeaderStyle(sheet.getCell("D2"));
    sheet.getCell("E2").value = formData.demographics.age;

    sheet.getCell("H2").value = "MESLEK:";
    applyHeaderStyle(sheet.getCell("H2"));
    sheet.getCell("I2").value = formData.demographics.profession;
    sheet.mergeCells("I2:K2");

    // ========== ROW 3: Demographics - Line 2 ==========
    sheet.getCell("A3").value = "CİNSİYET:";
    applyHeaderStyle(sheet.getCell("A3"));
    sheet.getCell("B3").value = formData.demographics.gender;

    sheet.getCell("D3").value = "EĞİTİM DURUMU:";
    applyHeaderStyle(sheet.getCell("D3"));
    sheet.getCell("F3").value = formData.demographics.education;
    sheet.mergeCells("F3:G3");

    // ========== ROW 4: Step 1 Header ==========
    sheet.getCell("A4").value = "1. ADIM:  SIRALAMA BELİRLEME";
    applyHeaderStyle(sheet.getCell("A4"));
    sheet.getCell("A4").font = { bold: true, size: 12, color: { argb: "FF1E40AF" } };

    // ========== ROW 5: Instructions & Headers ==========
    sheet.getCell("A5").value =
      "Bu adımda verilen kriter arasında öncelik sıralaması yapılmalıdır. Önce size göre en önemli kriter 1. sıraya atanır.";
    sheet.mergeCells("A5:G5");
    sheet.getRow(5).height = 40;
    sheet.getCell("A5").alignment = { wrapText: true, vertical: "top" };

    sheet.getCell("I5").value = "ANA KRİTERLER";
    applyHeaderStyle(sheet.getCell("I5"));
    applyCenterStyle(sheet.getCell("I5"));
    sheet.getCell("I5").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E7FF" },
    };
    sheet.mergeCells("I5:K5");

    sheet.getCell("N5").value = "ALT KRİTERLER";
    applyHeaderStyle(sheet.getCell("N5"));
    applyCenterStyle(sheet.getCell("N5"));
    sheet.getCell("N5").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDCFCE7" },
    };
    sheet.mergeCells("N5:P5");

    // ========== ROW 6: Sub-headers ==========
    sheet.getCell("K6").value = "Sıralama";
    applyCenterStyle(sheet.getCell("K6"));
    sheet.getCell("P6").value = "Sıralama";
    applyCenterStyle(sheet.getCell("P6"));

    // ========== ROWS 7-9: Main Criteria Rankings ==========
    formData.mainCriteriaOrder.forEach((criterion, index) => {
      const row = 7 + index;
      sheet.getCell(`I${row}`).value = criterion.code;
      applyBorderStyle(sheet.getCell(`I${row}`));
      applyCenterStyle(sheet.getCell(`I${row}`));

      sheet.getCell(`J${row}`).value = criterion.name;
      applyBorderStyle(sheet.getCell(`J${row}`));

      sheet.getCell(`K${row}`).value = index + 1;
      applyBorderStyle(sheet.getCell(`K${row}`));
      applyCenterStyle(sheet.getCell(`K${row}`));
    });

    // ========== ROWS 7-9: Economical Sub-Criteria (C11, C12, C13) ==========
    formData.economicalSubOrder.forEach((criterion, index) => {
      const row = 7 + index;
      sheet.getCell(`N${row}`).value = criterion.code;
      applyBorderStyle(sheet.getCell(`N${row}`));
      applyCenterStyle(sheet.getCell(`N${row}`));

      sheet.getCell(`O${row}`).value = criterion.name;
      applyBorderStyle(sheet.getCell(`O${row}`));

      sheet.getCell(`P${row}`).value = index + 1;
      applyBorderStyle(sheet.getCell(`P${row}`));
      applyCenterStyle(sheet.getCell(`P${row}`));
    });

    // ========== ROWS 11-13: Social Sub-Criteria (C21, C22, C23) ==========
    formData.socialSubOrder.forEach((criterion, index) => {
      const row = 11 + index;
      sheet.getCell(`N${row}`).value = criterion.code;
      applyBorderStyle(sheet.getCell(`N${row}`));
      applyCenterStyle(sheet.getCell(`N${row}`));

      sheet.getCell(`O${row}`).value = criterion.name;
      applyBorderStyle(sheet.getCell(`O${row}`));

      sheet.getCell(`P${row}`).value = index + 1;
      applyBorderStyle(sheet.getCell(`P${row}`));
      applyCenterStyle(sheet.getCell(`P${row}`));
    });

    // ========== ROWS 15-18: Environmental Sub-Criteria (C31, C32, C33, C34) ==========
    formData.environmentalSubOrder.forEach((criterion, index) => {
      const row = 15 + index;
      sheet.getCell(`N${row}`).value = criterion.code;
      applyBorderStyle(sheet.getCell(`N${row}`));
      applyCenterStyle(sheet.getCell(`N${row}`));

      sheet.getCell(`O${row}`).value = criterion.name;
      applyBorderStyle(sheet.getCell(`O${row}`));

      sheet.getCell(`P${row}`).value = index + 1;
      applyBorderStyle(sheet.getCell(`P${row}`));
      applyCenterStyle(sheet.getCell(`P${row}`));
    });

    // ========== ROW 22: Step 2 Header ==========
    sheet.getCell("A22").value = "2. ADIM:  İKİLİ ÖNEM BELİRLEME";
    applyHeaderStyle(sheet.getCell("A22"));
    sheet.getCell("A22").font = { bold: true, size: 12, color: { argb: "FF1E40AF" } };

    // ========== ROW 23: Instructions ==========
    sheet.getCell("A23").value =
      "Bu adımda sıralaması yapılmış kriterler arasında ikili ilişki verilen değerlendirme skalası göz önünde bulundurularak değerlendirilmelidir.";
    sheet.mergeCells("A23:G23");
    sheet.getRow(23).height = 40;
    sheet.getCell("A23").alignment = { wrapText: true, vertical: "top" };

    // ========== ROW 24: Scale Header ==========
    sheet.getCell("I24").value = "Değerlendirme Skalası";
    applyHeaderStyle(sheet.getCell("I24"));
    sheet.mergeCells("I24:K24");
    sheet.getCell("I24").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFEF3C7" },
    };

    sheet.getCell("M24").value = "ALT KRİTERLER";
    applyHeaderStyle(sheet.getCell("M24"));
    applyCenterStyle(sheet.getCell("M24"));
    sheet.mergeCells("M24:O24");

    // ========== ROWS 25-29: Scale Values ==========
    const scaleData = [
      { label: "Çok Az Önemli", code: "WI" },
      { label: "Orta Seviye Önemli", code: "FI" },
      { label: "Eşit Önemde", code: "EI" },
      { label: "Çok Önemli", code: "VI" },
      { label: "Kesinlikle Çok Önemli", code: "AI" },
    ];

    scaleData.forEach((scale, index) => {
      const row = 25 + index;
      sheet.getCell(`I${row}`).value = scale.label;
      sheet.getCell(`K${row}`).value = scale.code;
      applyBorderStyle(sheet.getCell(`I${row}`));
      applyBorderStyle(sheet.getCell(`K${row}`));
    });

    // ========== ECONOMICAL SUB-CRITERIA COMPARISONS (Rows 26-27) ==========
    // Based on economicalSubOrder
    if (formData.economicalComparisons.length >= 2) {
      // Row 26: first comparison
      sheet.getCell("M26").value = formData.economicalComparisons[0].first;
      sheet.getCell("N26").value = formData.economicalComparisons[0].second;
      sheet.getCell("O26").value = formData.economicalComparisons[0].value;
      applyBorderStyle(sheet.getCell("M26"));
      applyBorderStyle(sheet.getCell("N26"));
      applyBorderStyle(sheet.getCell("O26"));
      applyCenterStyle(sheet.getCell("M26"));
      applyCenterStyle(sheet.getCell("N26"));
      applyCenterStyle(sheet.getCell("O26"));

      // Row 27: second comparison
      sheet.getCell("M27").value = formData.economicalComparisons[1].first;
      sheet.getCell("N27").value = formData.economicalComparisons[1].second;
      sheet.getCell("O27").value = formData.economicalComparisons[1].value;
      applyBorderStyle(sheet.getCell("M27"));
      applyBorderStyle(sheet.getCell("N27"));
      applyBorderStyle(sheet.getCell("O27"));
      applyCenterStyle(sheet.getCell("M27"));
      applyCenterStyle(sheet.getCell("N27"));
      applyCenterStyle(sheet.getCell("O27"));
    }

    // ========== SOCIAL SUB-CRITERIA COMPARISONS (Rows 29-30) ==========
    if (formData.socialComparisons.length >= 2) {
      sheet.getCell("M29").value = formData.socialComparisons[0].first;
      sheet.getCell("N29").value = formData.socialComparisons[0].second;
      sheet.getCell("O29").value = formData.socialComparisons[0].value;
      applyBorderStyle(sheet.getCell("M29"));
      applyBorderStyle(sheet.getCell("N29"));
      applyBorderStyle(sheet.getCell("O29"));
      applyCenterStyle(sheet.getCell("M29"));
      applyCenterStyle(sheet.getCell("N29"));
      applyCenterStyle(sheet.getCell("O29"));

      sheet.getCell("M30").value = formData.socialComparisons[1].first;
      sheet.getCell("N30").value = formData.socialComparisons[1].second;
      sheet.getCell("O30").value = formData.socialComparisons[1].value;
      applyBorderStyle(sheet.getCell("M30"));
      applyBorderStyle(sheet.getCell("N30"));
      applyBorderStyle(sheet.getCell("O30"));
      applyCenterStyle(sheet.getCell("M30"));
      applyCenterStyle(sheet.getCell("N30"));
      applyCenterStyle(sheet.getCell("O30"));
    }

    // ========== ROW 31: Main Criteria Header ==========
    sheet.getCell("I31").value = "ANA KRiTERLER";
    applyHeaderStyle(sheet.getCell("I31"));
    sheet.getCell("I31").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E7FF" },
    };
    sheet.mergeCells("I31:K31");

    // ========== ENVIRONMENTAL SUB-CRITERIA COMPARISONS (Rows 32-34) ==========
    if (formData.environmentalComparisons.length >= 3) {
      sheet.getCell("M32").value = formData.environmentalComparisons[0].first;
      sheet.getCell("N32").value = formData.environmentalComparisons[0].second;
      sheet.getCell("O32").value = formData.environmentalComparisons[0].value;
      applyBorderStyle(sheet.getCell("M32"));
      applyBorderStyle(sheet.getCell("N32"));
      applyBorderStyle(sheet.getCell("O32"));
      applyCenterStyle(sheet.getCell("M32"));
      applyCenterStyle(sheet.getCell("N32"));
      applyCenterStyle(sheet.getCell("O32"));

      sheet.getCell("M33").value = formData.environmentalComparisons[1].first;
      sheet.getCell("N33").value = formData.environmentalComparisons[1].second;
      sheet.getCell("O33").value = formData.environmentalComparisons[1].value;
      applyBorderStyle(sheet.getCell("M33"));
      applyBorderStyle(sheet.getCell("N33"));
      applyBorderStyle(sheet.getCell("O33"));
      applyCenterStyle(sheet.getCell("M33"));
      applyCenterStyle(sheet.getCell("N33"));
      applyCenterStyle(sheet.getCell("O33"));

      sheet.getCell("M34").value = formData.environmentalComparisons[2].first;
      sheet.getCell("N34").value = formData.environmentalComparisons[2].second;
      sheet.getCell("O34").value = formData.environmentalComparisons[2].value;
      applyBorderStyle(sheet.getCell("M34"));
      applyBorderStyle(sheet.getCell("N34"));
      applyBorderStyle(sheet.getCell("O34"));
      applyCenterStyle(sheet.getCell("M34"));
      applyCenterStyle(sheet.getCell("N34"));
      applyCenterStyle(sheet.getCell("O34"));
    }

    // ========== ROW 32: Pairwise header for main ==========
    sheet.getCell("K32").value = "İkili Önem İlişkisi";
    applyCenterStyle(sheet.getCell("K32"));

    // ========== ROWS 33-34: Main Criteria Pairwise Comparisons ==========
    if (formData.mainComparisons.length >= 2) {
      // First comparison
      sheet.getCell("I33").value = formData.mainComparisons[0].first;
      sheet.getCell("J33").value = formData.mainComparisons[0].second;
      sheet.getCell("K33").value = formData.mainComparisons[0].value;
      applyBorderStyle(sheet.getCell("I33"));
      applyBorderStyle(sheet.getCell("J33"));
      applyBorderStyle(sheet.getCell("K33"));
      applyCenterStyle(sheet.getCell("I33"));
      applyCenterStyle(sheet.getCell("J33"));
      applyCenterStyle(sheet.getCell("K33"));

      // Second comparison
      sheet.getCell("I34").value = formData.mainComparisons[1].first;
      sheet.getCell("J34").value = formData.mainComparisons[1].second;
      sheet.getCell("K34").value = formData.mainComparisons[1].value;
      applyBorderStyle(sheet.getCell("I34"));
      applyBorderStyle(sheet.getCell("J34"));
      applyBorderStyle(sheet.getCell("K34"));
      applyCenterStyle(sheet.getCell("I34"));
      applyCenterStyle(sheet.getCell("J34"));
      applyCenterStyle(sheet.getCell("K34"));
    }

    // Generate file buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Generate filename (remove spaces from name)
    const sanitizedName = formData.demographics.nameSurname
      .replace(/\s+/g, "")
      .replace(/[^a-zA-ZğüşöçıİĞÜŞÖÇ]/g, "");
    const fileName = `FUCOM-${sanitizedName}.xlsx`;

    // Upload to Google Drive
    const uploadResult = await uploadToGoogleDrive(
      Buffer.from(buffer),
      fileName,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return NextResponse.json({
      success: true,
      fileName: fileName,
      fileId: uploadResult.id,
      message: "Form başarıyla gönderildi ve Google Drive'a yüklendi.",
    });
  } catch (error: unknown) {
    console.error("Error processing form:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
