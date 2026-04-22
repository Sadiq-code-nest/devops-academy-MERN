import { useState, useEffect } from 'react';

const links = ['home','outcomes','curriculum','workflow','projects','instructor','reviews','pricing'];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark]         = useState(() =>
    localStorage.getItem('devops-theme') === 'dark' ||
    (!localStorage.getItem('devops-theme') &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('devops-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 66, behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      <header className="nav" id="mainNav">
        <a href="#home" className="nav-brand">
          <span className="brand-prefix">Dev</span>
          <span className="brand-suffix">Ops</span>
          <span className="brand-dot">.</span>Academy
        </a>
        <nav className="nav-links">
          {links.map(l => (
            <button key={l} className="nav-link" onClick={() => scrollTo(l)}>
              {l === 'workflow' ? 'DevOps Flow' : l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </nav>
        <div className="nav-right">
          <button className="dark-toggle" onClick={() => setDark(d => !d)}>
            <span className="toggle-icon">{dark ? '☀' : '◐'}</span>
          </button>
          <button className="nav-cta" onClick={() => scrollTo('pricing')}>Enroll Now</button>
          <button className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu open">
          {links.map(l => (
            <button key={l} className="mob-link" onClick={() => scrollTo(l)}>
              {l === 'workflow' ? 'DevOps Flow' : l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
          <button className="mob-cta" onClick={() => scrollTo('pricing')}>Enroll Now →</button>
        </div>
      )}
    </>
  );
}
