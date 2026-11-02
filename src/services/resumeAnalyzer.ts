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

// Common words that add little value to a resume/job-description comparison.
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "been",
  "being",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "doing",
  "for",
  "from",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "him",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "me",
  "more",
  "most",
  "my",
  "of",
  "on",
  "or",
  "our",
  "ours",
  "she",
  "so",
  "such",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "to",
  "too",
  "under",
  "up",
  "us",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
]);

/**
 * Extract useful terms while preserving common technical tokens:
 * C++, C#, Node.js, CI/CD, etc.
 */
function tokenize(text: string): string[] {
  const words =
    text.toLowerCase().match(/[a-z0-9]+(?:[+#./-][a-z0-9+#./-]*)*/g) ?? [];

  return words
    .map((word) => word.replace(/^[./-]+|[./-]+$/g, ""))
    .filter((word) => {
      if (!word || STOP_WORDS.has(word)) return false;

      // Keep short technical names such as C, R, Go, and C++.
      if (["c", "r", "go", "c++", "c#", "ai", "ml"].includes(word)) {
        return true;
      }

      return word.length > 2;
    });
}

/**
 * Normalize a few common English endings for comparison.
 * This is intentionally lightweight; it is not a full linguistic stemmer.
 */
function normalizeWord(word: string): string {
  // Do not alter programming languages or technical tokens.
  if (/[+#./-]/.test(word)) {
    return word;
  }

  if (word.length > 5 && word.endsWith("ies")) {
    return `${word.slice(0, -3)}y`;
  }

  if (word.length > 5 && word.endsWith("ing")) {
    const base = word.slice(0, -3);

    // Example: running -> run
    if (
      base.length > 2 &&
      base[base.length - 1] === base[base.length - 2]
    ) {
      return base.slice(0, -1);
    }

    // Example: deploying -> deploy
    if (base.endsWith("y")) {
      return base;
    }

    return base;
  }

  if (word.length > 4 && word.endsWith("ed")) {
    return word.slice(0, -2);
  }

  if (word.length > 4 && word.endsWith("es")) {
    return word.slice(0, -2);
  }

  if (word.length > 3 && word.endsWith("s")) {
    return word.slice(0, -1);
  }

  return word;
}

const ROLE_SKILLS: Record<string, string[]> = {
  sales: [
    "communication",
    "customer interaction",
    "persuasion",
    "lead generation",
    "product knowledge",
    "negotiation",
  ],
  marketing: [
    "communication",
    "market research",
    "content creation",
    "analytics",
    "campaign management",
  ],
  "product management": [
    "user research",
    "prioritization",
    "product strategy",
    "communication",
    "data analysis",
  ],
  "software engineer": [
    "programming",
    "debugging",
    "software development",
    "version control",
    "problem solving",
  ],
  "data analyst": [
    "SQL",
    "data analysis",
    "data visualization",
    "statistics",
    "Excel",
  ],
  "customer support": [
    "communication",
    "customer service",
    "problem solving",
    "issue resolution",
    "empathy",
  ],
};

export function analyzeResume(
  resumeText: string,
  jobDescription: string,
  jobTitle = "",
): ResumeAnalysis {
  const resumeTokens = tokenize(resumeText);
  const resumeWords = new Set(resumeTokens.map(normalizeWord));

  const jobTokens = [
    ...new Set(
      tokenize(jobDescription).map((word) => ({
        display: word,
        normalized: normalizeWord(word),
      })),
    ),
  ];

  const matchedKeywords = jobTokens
    .filter((word) => resumeWords.has(word.normalized))
    .map((word) => word.display);

  const missingKeywords = jobTokens
    .filter((word) => !resumeWords.has(word.normalized))
    .map((word) => word.display);

  const score =
    jobTokens.length === 0
      ? 0
      : Math.round((matchedKeywords.length / jobTokens.length) * 100);

  const normalizedTitle = jobTitle.toLowerCase();

  const matchedRole = Object.keys(ROLE_SKILLS).find((role) =>
    normalizedTitle.includes(role),
  );

  const roleSkills = matchedRole ? ROLE_SKILLS[matchedRole] : [];

  const roleSuggestions = roleSkills.filter(
    (skill) => !resumeText.toLowerCase().includes(skill.toLowerCase()),
  );

  return {
    score,
    matchedKeywords,
    missingKeywords,
    resumeWordCount: resumeTokens.length,
    jobWordCount: jobTokens.length,
    jobTitle,
    limitedData: jobTokens.length < 8,
    roleSuggestions,
  };
}