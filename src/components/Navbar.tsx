function Navbar() {
  return (
    <nav className="navbar">
      <a href="/" className="brand">
        <span className="brand-icon">R</span>
        <span>Resume<span className="brand-highlight">IQ</span></span>
      </a>

      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it works</a>
        <a href="#analyzer" className="nav-cta">
          Analyze Resume
        </a>
      </div>
    </nav>
  );
}

export default Navbar;