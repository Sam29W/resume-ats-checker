interface ResumeUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

function ResumeUpload({ file, onFileChange }: ResumeUploadProps) {
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
          accept=".pdf,.docx"
          className="file-input"
          onChange={(event) =>
            onFileChange(event.target.files?.[0] ?? null)
          }
        />

        <div className="upload-icon">↑</div>
        <h3>{file ? file.name : "Drop your resume here"}</h3>
        <p>{file ? "Click to choose another file" : "or click to browse files"}</p>
        <span className="file-types">PDF, DOCX · Max 10 MB</span>
      </label>

      <div className="privacy-note">
        <span>🔒</span>
        <p>Your resume is processed in your browser for this analysis.</p>
      </div>
    </section>
  );
}

export default ResumeUpload;