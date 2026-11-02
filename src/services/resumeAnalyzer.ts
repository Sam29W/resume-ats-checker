import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";
import type { ResumeAnalysis } from "../types/resume";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export async function extractResumeText(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "pdf") {
    const data = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data }).promise;

    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");

      pages.push(pageText);
    }

    return pages.join("\n");
  }

  if (extension === "docx") {
    const data = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: data });

    return result.value;
  }

  throw new Error("Please upload a PDF or DOCX resume.");
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

export function analyzeResume(
  resumeText: string,
  jobDescription: string,
): ResumeAnalysis {
  const resumeWords = new Set(tokenize(resumeText));
  const jobWords = [...new Set(tokenize(jobDescription))];

  const matchedKeywords = jobWords.filter((word) => resumeWords.has(word));
  const missingKeywords = jobWords.filter((word) => !resumeWords.has(word));

  const score =
    jobWords.length === 0
      ? 0
      : Math.round((matchedKeywords.length / jobWords.length) * 100);

  return {
    score,
    matchedKeywords,
    missingKeywords,
    resumeWordCount: tokenize(resumeText).length,
    jobWordCount: jobWords.length,
  };
}