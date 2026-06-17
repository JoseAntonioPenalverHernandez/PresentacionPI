import React, { useState, useEffect } from 'react';
import { Shield, Volume2, VolumeX } from 'lucide-react';
import { playClickSound, playHoverSound, startBGM, stopBGM } from '../utils/audio';

const MENU_ITEMS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'video', label: 'Vídeo' },
  { id: 'documentacion', label: 'Documentación' },
  { id: 'creditos', label: 'Créditos' }
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [scrolled, setScrolled] = useState(false);
  const [isBgmOn, setIsBgmOn] = useState(false);

  const toggleBgm = () => {
    playClickSound();
    if (isBgmOn) {
      stopBGM();
    } else {
      startBGM();
    }
    setIsBgmOn(!isBgmOn);
  };

  useEffect(() => {
    // Detect window scroll to toggle background opacity/blur
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    // Set up IntersectionObserver to automatically detect active section
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -50% 0px', // Trigger when section occupies the center area
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    MENU_ITEMS.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo Section */}
        <a 
          href="#inicio" 
          className="navbar-logo" 
          onClick={(e) => { playClickSound(); handleNavClick(e, 'inicio'); }}
          onMouseEnter={() => playHoverSound()}
        >
          <div className="logo-icon-container">
            <Shield className="logo-icon" size={24} />
          </div>
          <span className="logo-text">El Ascenso del barajas</span>
        </a>

        {/* Navigation Items */}
        <nav className="navbar-menu">
          {MENU_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`navbar-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={(e) => { playClickSound(); handleNavClick(e, item.id); }}
              onMouseEnter={() => playHoverSound()}
            >
              {item.label}
            </a>
          ))}

          {/* BGM Toggle Button */}
          <button 
            onClick={toggleBgm} 
            className={`bgm-toggle-btn ${isBgmOn ? 'active' : ''}`}
            title={isBgmOn ? "Silenciar música RPG" : "Activar música RPG"}
            onMouseEnter={() => playHoverSound()}
          >
            {isBgmOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="bgm-btn-text">BGM</span>
          </button>
        </nav>
      </div>

      <style>{`
        .navbar-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 80px;
          z-index: 1000;
          display: flex;
          align-items: center;
          transition: all 0.4s ease;
          border-bottom: 1px solid rgba(243, 183, 0, 0);
          background: transparent;
        }

        .navbar-header.scrolled {
          height: 70px;
          background: rgba(13, 13, 22, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(243, 183, 0, 0.15);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .navbar-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 4%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: white;
          transition: all 0.3s ease;
        }

        .logo-icon-container {
          background: linear-gradient(135deg, rgba(243, 183, 0, 0.2), rgba(229, 124, 4, 0.2));
          border: 1px solid var(--gold-light);
          border-radius: 8px;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--glow-gold);
          transition: all 0.3s ease;
        }

        .navbar-logo:hover .logo-icon-container {
          box-shadow: var(--glow-gold-strong);
          transform: rotate(5deg) scale(1.05);
        }

        .logo-icon {
          color: var(--gold-light);
        }

        .logo-text {
          font-family: var(--font-title);
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--text-white);
          letter-spacing: 0.05em;
          transition: color 0.3s ease;
        }

        .navbar-logo:hover .logo-text {
          color: var(--gold-light);
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .navbar-link {
          text-decoration: none;
          color: var(--text-muted);
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.95rem;
          letter-spacing: 0.05em;
          position: relative;
          padding: 8px 0;
          transition: all 0.3s ease;
        }

        .navbar-link:hover {
          color: var(--text-white);
        }

        .navbar-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--grad-fire);
          transition: width 0.3s ease;
          box-shadow: var(--glow-gold);
        }

        .navbar-link.active {
          color: var(--gold-light);
          text-shadow: 0 0 10px rgba(243, 183, 0, 0.3);
        }

        .navbar-link.active::after {
          width: 100%;
        }

        .bgm-toggle-btn {
          background: rgba(243, 183, 0, 0.08);
          border: 1px solid rgba(243, 183, 0, 0.2);
          border-radius: 6px;
          color: var(--gold-light);
          padding: 6px 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-family: var(--font-title);
          font-size: 0.75rem;
          font-weight: 700;
          transition: all 0.3s ease;
          box-shadow: var(--glow-gold);
        }
        .bgm-toggle-btn:hover {
          background: rgba(243, 183, 0, 0.18);
          border-color: var(--gold-light);
          box-shadow: var(--glow-gold-strong);
          color: white;
        }
        .bgm-toggle-btn.active {
          background: var(--grad-gold);
          color: var(--text-dark);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: var(--glow-gold-strong);
        }

        @media (max-width: 768px) {
          .navbar-menu {
            gap: 16px;
          }
          .logo-text {
            display: none; /* Keep just the logo icon on small screens to save space */
          }
          .navbar-link {
            font-size: 0.85rem;
          }
          .bgm-btn-text {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
