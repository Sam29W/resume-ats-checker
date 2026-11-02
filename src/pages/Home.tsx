import { useState } from "react";
import Navbar from "../components/Navbar";
import ResumeUpload from "../components/ResumeUpload";
import JobDescription from "../components/JobDescription";
import { analyzeResume, extractResumeText } from "../services/resumeAnalyzer";
import type { ResumeAnalysis } from "../types/resume";

function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setError("");
    setAnalysis(null);

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

      const result = analyzeResume(resumeText, jobDescription);
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
                setError("");
              }}
            />

            <JobDescription
              jobTitle={jobTitle}
              jobDescription={jobDescription}
              onJobTitleChange={setJobTitle}
              onJobDescriptionChange={(value) => {
                setJobDescription(value);
                setAnalysis(null);
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
              <span className="step-label">ANALYSIS COMPLETE</span>
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