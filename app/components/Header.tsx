'use client';

export default function Header() {
  const scrollToWaitlist = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="site-header">
      <div className="header-content">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2L4 10L8 26L16 30L24 26L28 10L16 2Z" fill="url(#logoGradient)" />
            <path d="M12 14L16 10L20 14L18 20H14L12 14Z" fill="white" opacity="0.9" />
            <defs>
              <linearGradient id="logoGradient" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
          <span>Aempy</span>
        </div>
        
        <nav className="nav-links">
          <a href="/">Home</a>
          <a href="#about">About</a>
          <a href="#coming-soon">Coming Soon</a>
        </nav>
        
        <button className="join-waitlist-btn" onClick={scrollToWaitlist}>
          Join Waitlist
        </button>
      </div>
    </header>
  );
}
