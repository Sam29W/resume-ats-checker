import { CreateMLCEngine } from "@mlc-ai/web-llm";

const MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

let enginePromise: ReturnType<typeof CreateMLCEngine> | null = null;

export interface AIResumeReview {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendations: string[];
  improvedBullets: {
    original: string;
    suggested: string;
    explanation: string;
  }[];
}

export type AIProgressCallback = (progress: {
  text: string;
  progress: number;
}) => void;

export function isWebGPUAvailable(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export async function loadAIModel(
  onProgress?: AIProgressCallback,
) {
  if (!isWebGPUAvailable()) {
    throw new Error(
      "WebGPU is not available in this browser. Try a recent version of Chrome or Edge.",
    );
  }

  if (!enginePromise) {
    enginePromise = CreateMLCEngine(MODEL_ID, {
      initProgressCallback: (report) => {
        onProgress?.({
          text: report.text,
          progress: report.progress,
        });
      },
    });
  }

  try {
    return await enginePromise;
  } catch (error) {
    enginePromise = null;
    throw error;
  }
}

function parseAIResponse(content: string): AIResumeReview {
  const cleaned = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("The AI returned an invalid response. Please try again.");
  }

  const parsed = JSON.parse(
    cleaned.slice(firstBrace, lastBrace + 1),
  ) as AIResumeReview;

  return {
    summary: parsed.summary ?? "",
    strengths: parsed.strengths ?? [],
    weaknesses: parsed.weaknesses ?? [],
    missingSkills: parsed.missingSkills ?? [],
    recommendations: parsed.recommendations ?? [],
    improvedBullets: parsed.improvedBullets ?? [],
  };
}

export async function reviewResumeWithAI(
  resumeText: string,
  jobDescription: string,
  onProgress?: AIProgressCallback,
): Promise<AIResumeReview> {
  const engine = await loadAIModel(onProgress);

  const response = await engine.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
You are an expert resume reviewer and career coach.

Compare a candidate's resume with the target job description.
Be honest, specific, constructive, and concise.

Rules:
- Never invent experience, skills, certifications, tools, or achievements.
- Only suggest improvements supported by the resume.
- If a metric is missing, ask the candidate to provide it. Never fabricate one.
- Distinguish between a skill that is absent and one that is merely not clearly demonstrated.
- Do not claim to calculate an official ATS score.
- Return only valid JSON. Do not include markdown fences.

Use exactly this JSON structure:
{
  "summary": "A concise overall assessment",
  "strengths": ["Strength supported by resume evidence"],
  "weaknesses": ["Specific weakness or concern"],
  "missingSkills": ["Relevant job requirement not clearly shown"],
  "recommendations": ["Actionable improvement"],
  "improvedBullets": [
    {
      "original": "An existing resume bullet",
      "suggested": "A stronger truthful rewrite",
      "explanation": "Why this is better"
    }
  ]
}

Provide up to 4 items in each list.
If no suitable bullet can be improved, return an empty improvedBullets array.
`,
      },
      {
        role: "user",
        content: `
TARGET JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

Review the resume for this specific role.
`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1400,
  });

  const content = response.choices[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("The AI did not return a review. Please try again.");
  }

  return parseAIResponse(content);
}