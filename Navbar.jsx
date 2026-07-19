function Navbar() {
  return (
    <nav className="navbar">
      <div className="brand">
        <svg className="brand-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 20.5c-.3 0-.6-.1-.8-.3-1.7-1.4-3.3-2.7-4.7-4-1.2-1.1-2.2-2.1-3-3.1C2.3 11.6 1.7 10.2 1.7 8.7c0-2.9 2.3-5.2 5.2-5.2 1.6 0 3.1.8 4.1 2 .3.4.9.4 1.2 0 1-1.2 2.5-2 4.1-2 2.9 0 5.2 2.3 5.2 5.2 0 1.5-.6 2.9-1.8 4.4-.8 1-1.8 2-3 3.1-1.4 1.3-3 2.6-4.7 4-.2.2-.5.3-.8.3z"
            fill="currentColor"
          />
        </svg>
        <span className="brand-mark">Sahaara</span>
        <span className="brand-tag">Community Dispatch</span>
      </div>
      <div className="status-pill">
        <span className="status-dot" />
        System online
      </div>
    </nav>
  );
}

export default Navbar;