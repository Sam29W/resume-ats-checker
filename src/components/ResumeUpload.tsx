function ResumeUpload() {
  return (
    <section className="panel upload-panel">
      <div className="panel-heading">
        <div>
          <span className="step-label">STEP 01</span>
          <h2>Upload your resume</h2>
          <p>Start with your current resume.</p>
        </div>

        <span className="panel-icon">↑</span>
      </div>

      <label className="upload-zone">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="file-input"
        />

        <div className="upload-icon">↑</div>
        <h3>Drop your resume here</h3>
        <p>or click to browse files</p>
        <span className="file-types">PDF, DOC, DOCX · Max 10 MB</span>
      </label>

      <div className="privacy-note">
        <span>🔒</span>
        <p>Your resume stays private. We never share your data.</p>
      </div>
    </section>
  );
}

export default ResumeUpload;