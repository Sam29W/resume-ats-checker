import Navbar from "../components/Navbar";
import ResumeUpload from "../components/ResumeUpload";
import JobDescription from "../components/JobDescription";

function Home() {
  return (
    <div className="app-shell">
      <Navbar />

      <main>
        <section className="hero" id="features">
          <div className="hero-badge">
            <span className="status-dot" />
            AI-powered resume analysis
          </div>

          <h1>
            Your next opportunity
            <br />
            starts with a <span>better resume.</span>
          </h1>

          <p className="hero-description">
            Optimize your resume for applicant tracking systems.
            Find missing keywords, improve your content, and apply with confidence.
          </p>
        </section>

        <section className="analyzer-section" id="analyzer">
          <div className="section-heading">
            <div>
              <span className="step-label">RESUME ANALYZER</span>
              <h2>Let's optimize your resume</h2>
            </div>

            <span className="free-badge">100% free to start</span>
          </div>

          <div className="analyzer-grid">
            <ResumeUpload />
            <JobDescription />
          </div>

          <button className="analyze-button" type="button">
            Analyze my resume
            <span>→</span>
          </button>

          <p className="analyze-caption">
            Your resume is analyzed against your target role.
          </p>
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