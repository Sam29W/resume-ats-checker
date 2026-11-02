export interface ResumeAnalysis {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  resumeWordCount: number;
  jobWordCount: number;
}