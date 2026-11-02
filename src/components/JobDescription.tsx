function JobDescription() {
  return (
    <section className="panel job-panel">
      <div className="panel-heading">
        <div>
          <span className="step-label">STEP 02</span>
          <h2>Target job description</h2>
          <p>Tell us what role you're applying for.</p>
        </div>

        <span className="panel-icon">⌕</span>
      </div>

      <label className="field-label" htmlFor="job-title">
        Target job title
      </label>

      <input
        id="job-title"
        type="text"
        className="text-input"
        placeholder="e.g. AI Engineer, Product Manager"
      />

      <label className="field-label" htmlFor="job-description">
        Job description
      </label>

      <textarea
        id="job-description"
        className="text-area"
        placeholder="Paste the job description here..."
        rows={7}
      />

      <p className="field-hint">
        Adding a job description helps us identify relevant keywords and skills.
      </p>
    </section>
  );
}

export default JobDescription;