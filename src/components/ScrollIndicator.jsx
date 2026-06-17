import React, { useState, useEffect } from 'react';
import { playClickSound, playHoverSound } from '../utils/audio';

const SECTIONS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'video', label: 'Vídeo' },
  { id: 'documentacion', label: 'Documentación' },
  { id: 'creditos', label: 'Créditos' }
];

export default function ScrollIndicator() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate total page scroll percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }

      // Check which section is in view
      const scrollPos = window.scrollY + window.innerHeight / 2;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section.id);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDotClick = (id) => {
    playClickSound();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="scroll-indicator-container">
      {/* Background track line */}
      <div className="scroll-line-track">
        {/* Dynamic active progress line filling up */}
        <div 
          className="scroll-line-progress" 
          style={{ height: `${scrollProgress}%` }}
        />
      </div>

      {/* Interactive Dots for each section */}
      <div className="scroll-dots-list">
        {SECTIONS.map((section) => (
          <div
            key={section.id}
            className={`scroll-dot-wrapper ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => handleDotClick(section.id)}
            onMouseEnter={() => playHoverSound()}
          >
            {/* Tooltip containing section title */}
            <span className="scroll-dot-tooltip">{section.label}</span>
            <div className="scroll-dot-circle" />
          </div>
        ))}
      </div>

      <style>{`
        .scroll-indicator-container {
          position: fixed;
          right: 30px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 999;
          display: flex;
          align-items: center;
          height: 250px;
        }

        .scroll-line-track {
          position: absolute;
          right: 11px; /* Centered relative to the 24px wide wrapper */
          top: 0;
          width: 2px;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .scroll-line-progress {
          width: 100%;
          background: var(--grad-fire);
          box-shadow: var(--glow-gold);
          transition: height 0.1s linear;
        }

        .scroll-dots-list {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          position: relative;
          z-index: 2;
        }

        .scroll-dot-wrapper {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          position: relative;
          width: 24px;
          height: 24px;
          cursor: pointer;
        }

        .scroll-dot-circle {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(0, 0, 0, 0.5);
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .scroll-dot-wrapper:hover .scroll-dot-circle {
          background: var(--gold-light);
          transform: scale(1.4);
          box-shadow: var(--glow-gold);
        }

        .scroll-dot-wrapper.active .scroll-dot-circle {
          background: var(--orange);
          border-color: var(--gold-light);
          transform: scale(1.6);
          box-shadow: var(--glow-gold-strong);
        }

        .scroll-dot-tooltip {
          position: absolute;
          right: 35px;
          background: rgba(13, 13, 22, 0.95);
          border: 1px solid rgba(243, 183, 0, 0.3);
          color: var(--text-white);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-family: var(--font-title);
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.3s ease;
          box-shadow: var(--shadow-dark);
        }

        .scroll-dot-wrapper:hover .scroll-dot-tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        @media (max-width: 768px) {
          .scroll-indicator-container {
            display: none; /* Hide on small mobile screens to prevent clutter */
          }
        }
      `}</style>
    </div>
  );
}
