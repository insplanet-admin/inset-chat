import * as mammoth from "mammoth";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const extractTextFromFile = async (file: File): Promise<string> => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  try {
    if (extension === "txt") return await file.text();

    if (extension === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText +=
          textContent.items.map((item: any) => item.str).join(" ") + "\n";
      }
      return fullText.trim();
    }

    if (extension === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    }

    if (extension === "xlsx" || extension === "xls") {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      let fullText = "";
      workbook.SheetNames.forEach((sheetName) => {
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        fullText += `\n--- Sheet: ${sheetName} ---\n${csv}\n`;
      });
      return fullText.trim();
    }

    if (extension === "hwp") {
      const arrayBuffer = await file.arrayBuffer();
      const HWP = await import("hwp.js");
      const getModel =
        (HWP as any).getHwpModel || (HWP as any).default?.getHwpModel;
      const hwpModel = getModel(new Uint8Array(arrayBuffer));
      let fullText = "";
      hwpModel.sections.forEach((s: any) =>
        s.paragraphs.forEach((p: any) => {
          p.texts?.forEach((t: any) => t.text && (fullText += t.text));
          fullText += "\n";
        }),
      );
      return fullText.trim();
    }

    throw new Error(`지원하지 않는 파일 형식: ${extension}`);
  } catch (error) {
    console.error("파일 파싱 에러:", error);
    return "";
  }
};

export { extractTextFromFile };
