import { useState } from "react";
import Navbar from "../components/Navbar";
import ResumeUpload from "../components/ResumeUpload";
import JobDescription from "../components/JobDescription";
import {
  analyzeResume,
  extractResumeText,
} from "../services/resumeAnalyzer";
import type { ResumeAnalysis } from "../types/resume";
type AIResumeReview = {
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
};

function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [aiReview, setAIReview] = useState<AIResumeReview | null>(null);

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAILoading] = useState(false);
  
  const [error, setError] = useState("");
  const [aiError, setAIError] = useState("");

  async function handleAnalyze() {
    setError("");
    setAnalysis(null);
    setAIReview(null);

    if (!resumeFile) {
      setError("Please upload your resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste the target job description.");
      return;
    }

    if (resumeFile.size > 10 * 1024 * 1024) {
      setError("Your resume must be smaller than 10 MB.");
      return;
    }

    setLoading(true);

    try {
      const resumeText = await extractResumeText(resumeFile);

      if (!resumeText.trim()) {
        throw new Error(
          "We couldn't extract text from this file. It may be a scanned PDF.",
        );
      }

      const result = analyzeResume(resumeText, jobDescription, jobTitle);
      
      setAnalysis(result);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while analyzing your resume.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAIReview() {
  setAIError("");
  setAIReview(null);

  if (!resumeFile) {
    setAIError("Please upload your resume first.");
    return;
  }

  if (!jobDescription.trim()) {
    setAIError("Please enter the target job description.");
    return;
  }

  setAILoading(true);

  try {
    const resumeText = await extractResumeText(resumeFile);

    if (!resumeText.trim()) {
      throw new Error("We couldn't extract readable text from this resume.");
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resumeText,
        jobDescription,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "The AI review failed.");
    }

    const result: AIResumeReview = {
      summary: data.summary ?? "Review completed.",
      strengths: data.strengths ?? [],
      weaknesses: data.improvements ?? [],
      missingSkills: data.missingKeywords ?? [],
      recommendations: data.improvements ?? [],
      improvedBullets: [],
    };

    setAIReview(result);
  } catch (caughtError) {
    setAIError(
      caughtError instanceof Error
        ? caughtError.message
        : "The AI review failed. Please try again.",
    );
  } finally {
    setAILoading(false);
  }
}
  return (
    <div className="app-shell">
      <Navbar />

      <main>
        <section className="hero" id="features">
          <div className="hero-badge">
            <span className="status-dot" />
            Resume analysis, right in your browser
          </div>

          <h1>
            Your next opportunity
            <br />
            starts with a <span>better resume.</span>
          </h1>

          <p className="hero-description">
            Compare your resume with a target job description.
            Find keyword gaps and discover ways to strengthen your application.
          </p>
        </section>

        <section className="analyzer-section" id="analyzer">
          <div className="section-heading">
            <div>
              <span className="step-label">RESUME ANALYZER</span>
              <h2>Let's optimize your resume</h2>
            </div>

            <span className="free-badge">Free to start</span>
          </div>

          <div className="analyzer-grid">
            <ResumeUpload
              file={resumeFile}
              onFileChange={(file) => {
                setResumeFile(file);
                setAnalysis(null);
                setAIReview(null);
                setError("");
                setAIError("");
              }}
            />

            <JobDescription
              jobTitle={jobTitle}
              jobDescription={jobDescription}
              onJobTitleChange={setJobTitle}
              onJobDescriptionChange={(value) => {
                setJobDescription(value);
                setAnalysis(null);
                setAIReview(null);
              }}
            />
          </div>

          <button
            className="analyze-button"
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "Analyzing resume..." : "Analyze my resume"}
            {!loading && <span>→</span>}
          </button>

          <p className="analyze-caption">
            Your resume is processed locally in your browser.
          </p>

          {error && <p className="analysis-error">{error}</p>}

          {analysis && (
            <section className="results-panel">
              <span className="step-label">KEYWORD ANALYSIS</span>
              <h2>Your resume keyword match</h2>

              <div className="score-display">
                <span className="score-number">{analysis.score}%</span>
                <span className="score-caption">Keyword match</span>
              </div>

              <p className="result-summary">
                Found {analysis.matchedKeywords.length} matching keywords out
                of {analysis.jobWordCount} unique job-description words.
                This is a keyword comparison—not a guaranteed ATS score.
              </p>

              {analysis.limitedData && (
                <p className="result-summary">
                  This is a limited-data estimate because the job description is
                  short. You can still use the results, but they may not
                  represent all job requirements.
                </p>
              )}

              {analysis.roleSuggestions?.length > 0 && (
                <div className="role-suggestions">
                  <h3>Potentially relevant skills for {analysis.jobTitle}</h3>
                  <p>
                    These are role-based suggestions, not confirmed requirements
                    from the job description.
                  </p>
                  <div className="keyword-list">
                    {analysis.roleSuggestions.map((skill) => (
                      <span className="keyword" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="result-columns">
                <div>
                  <h3>Matched keywords</h3>
                  <div className="keyword-list">
                    {analysis.matchedKeywords.length > 0 ? (
                      analysis.matchedKeywords.map((keyword) => (
                        <span className="keyword matched" key={keyword}>
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <p>No matching keywords found yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3>Keywords to review</h3>
                  <div className="keyword-list">
                    {analysis.missingKeywords.length > 0 ? (
                      analysis.missingKeywords.map((keyword) => (
                        <span className="keyword missing" key={keyword}>
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <p>No missing keywords in this comparison.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="result-stats">
                <div>
                  <strong>{analysis.resumeWordCount}</strong>
                  <span>Resume words extracted</span>
                </div>
                <div>
                  <strong>{analysis.jobWordCount}</strong>
                  <span>Unique job-description words</span>
                </div>
              </div>
            </section>
          )}

          <section className="ai-section">
            <span className="step-label">AI-POWERED REVIEW</span>
            <h2>Get feedback from AI</h2>

            <p className="ai-description">
              Load the local AI model to get contextual feedback about your
              resume, strengths, weaknesses, and improvements.
            </p>

           <p className="ai-description">
  Get contextual feedback about your resume, strengths, weaknesses,
  and improvements using Gemini AI.
</p>

<button
  className="analyze-button ai-button"
  type="button"
  onClick={handleAIReview}
  disabled={aiLoading}
>
  {aiLoading ? "AI is reviewing your resume..." : "Review with AI"}
</button>
                

            {aiError && <p className="analysis-error">{aiError}</p>}

            {aiReview && (
              <div className="ai-review-results">
                <span className="step-label">AI REVIEW COMPLETE</span>
                <h2>AI feedback</h2>

                <p className="ai-summary">{aiReview.summary}</p>

                <div className="ai-result-grid">
                  <div>
                    <h3>Strengths</h3>
                    <ul>
                      {aiReview.strengths.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3>Areas to improve</h3>
                    <ul>
                      {aiReview.weaknesses.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3>Skills to review</h3>
                    <ul>
                      {aiReview.missingSkills.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3>Recommendations</h3>
                    <ul>
                      {aiReview.recommendations.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {aiReview.improvedBullets.length > 0 && (
                  <div className="improved-bullets">
                    <h3>Suggested resume improvements</h3>

                    {aiReview.improvedBullets.map((item, index) => (
                      <article className="improved-bullet" key={index}>
                        <p>
                          <strong>Original</strong>
                          <br />
                          {item.original}
                        </p>

                        <p>
                          <strong>Suggested</strong>
                          <br />
                          {item.suggested}
                        </p>

                        <p className="bullet-explanation">
                          {item.explanation}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </section>

        <section className="how-it-works" id="how-it-works">
          <span className="step-label">SIMPLE. SMART. EFFECTIVE.</span>
          <h2>Get closer to your next opportunity.</h2>

          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-number">01</span>
              <h3>Upload</h3>
              <p>Share your current resume in seconds.</p>
            </article>

            <article className="feature-card">
              <span className="feature-number">02</span>
              <h3>Analyze</h3>
              <p>Compare your resume with the job requirements.</p>
            </article>

            <article className="feature-card">
              <span className="feature-number">03</span>
              <h3>Improve</h3>
              <p>Discover actionable ways to strengthen your application.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>ResumeIQ</span>
        <p>Build a resume that gets noticed.</p>
      </footer>
    </div>
  );
}

export default Home;