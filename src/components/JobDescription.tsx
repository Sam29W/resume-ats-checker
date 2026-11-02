interface JobDescriptionProps {
  jobTitle: string;
  jobDescription: string;
  onJobTitleChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
}

function JobDescription({
  jobTitle,
  jobDescription,
  onJobTitleChange,
  onJobDescriptionChange,
}: JobDescriptionProps) {
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
        value={jobTitle}
        onChange={(event) => onJobTitleChange(event.target.value)}
      />

      <label className="field-label" htmlFor="job-description">
        Job description
      </label>

      <textarea
        id="job-description"
        className="text-area"
        placeholder="Paste the job description here..."
        rows={7}
        value={jobDescription}
        onChange={(event) => onJobDescriptionChange(event.target.value)}
      />

      <p className="field-hint">
        Adding a job description helps identify relevant keywords and skills.
      </p>
    </section>
  );
}

export default JobDescription;