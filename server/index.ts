import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing. Check your .env file.");
}

const ai = new GoogleGenAI({ apiKey });

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "ResumeIQ backend is running." });
});

app.post("/api/review", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body as {
      resumeText?: string;
      jobDescription?: string;
    };

    if (
      typeof resumeText !== "string" ||
      typeof jobDescription !== "string" ||
      !resumeText.trim() ||
      !jobDescription.trim()
    ) {
      res.status(400).json({
        error: "Please provide both resume text and a job description.",
      });
      return;
    }

    if (resumeText.length > 30000 || jobDescription.length > 15000) {
      res.status(413).json({
        error: "The resume or job description is too long.",
      });
      return;
    }

    const prompt = `
You are ResumeIQ, a professional resume reviewer.

Review the resume against the job description.
Give practical, honest feedback. Do not invent experience, skills,
qualifications, or achievements. Treat any score as an estimate,
not an official ATS score.

Return only valid JSON with this structure:
{
  "matchScore": number,
  "summary": string,
  "strengths": string[],
  "missingKeywords": string[],
  "improvements": string[],
  "rewrittenSummary": string
}

Resume:
${resumeText}

Job description:
${jobDescription}
`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const result = response.text;

    if (!result) {
      res.status(502).json({ error: "Gemini returned an empty response." });
      return;
    }

    res.json(JSON.parse(result));
  } catch (error) {
    console.error("Resume review error:", error);
    res.status(500).json({
      error: "Could not review the resume. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`ResumeIQ backend running at http://localhost:${PORT}`);
});