import React, { useRef, useState } from 'react';
import { playCardSwish, playClickSound } from '../utils/audio';

export default function CardTilt({ cost, name, type, description, rarity = 'Common', color = 'gold' }) {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [shineStyle, setShineStyle] = useState({});

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinate within the card
    const y = e.clientY - rect.top;  // y coordinate within the card

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation angle (max 20 degrees)
    const rotateX = ((centerY - y) / centerY) * 15;
    const rotateY = ((x - centerX) / centerX) * 15;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`);

    // Dynamic glossy sheen overlay position
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;
    setShineStyle({
      background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 60%)`,
    });
  };

  const handleMouseEnter = () => {
    playCardSwish();
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
    setShineStyle({});
  };

  const handleClick = () => {
    playClickSound();
  };

  // Assign color styles depending on rarity or type
  const getBorderColor = () => {
    if (rarity === 'Rare') return 'var(--orange)';
    if (rarity === 'Uncommon') return 'var(--gold-medium)';
    return 'var(--gold-light)';
  };

  const getCardIcon = () => {
    if (type === 'Ataque') return '⚔️';
    if (type === 'Habilidad') return '🛡️';
    if (type === 'Poder') return '🔥';
    return '💎';
  };

  return (
    <div
      ref={cardRef}
      className={`sts-card rarity-${rarity.toLowerCase()}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ transform: transformStyle }}
    >
      {/* Shine effect */}
      <div className="card-shine" style={shineStyle} />

      {/* Card Header */}
      <div className="card-header">
        <span className="card-name">{name}</span>
        <div className="card-energy">{cost}</div>
      </div>

      {/* Card Illustration Box */}
      <div className="card-art-box">
        <div className="art-gradient" />
        <span className="art-icon">{getCardIcon()}</span>
      </div>

      {/* Card Type Bar */}
      <div className="card-type-bar" style={{ borderColor: getBorderColor() }}>
        {type} - {rarity === 'Rare' ? 'Rara' : rarity === 'Uncommon' ? 'Poco Común' : 'Común'}
      </div>

      {/* Card Description */}
      <div className="card-body">
        <p className="card-desc" dangerouslySetInnerHTML={{ __html: description }}></p>
      </div>

      {/* Godot Tag */}
      <div className="card-footer-tag">
        Godot 4.2 Clone
      </div>

      <style>{`
        .sts-card {
          width: 230px;
          height: 320px;
          border-radius: 14px;
          background: #111116;
          border: 3px solid var(--gold-light);
          padding: 12px;
          display: flex;
          flex-direction: column;
          position: relative;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
          transition: transform 0.1s ease, box-shadow 0.3s ease;
          user-select: none;
          transform-style: preserve-3d;
        }

        .sts-card.rarity-rare {
          border-color: var(--orange);
          box-shadow: 0 15px 35px rgba(229, 124, 4, 0.2), 0 0 15px rgba(229, 124, 4, 0.1);
        }

        .sts-card.rarity-uncommon {
          border-color: var(--gold-medium);
          box-shadow: 0 15px 35px rgba(250, 163, 0, 0.2), 0 0 15px rgba(250, 163, 0, 0.1);
        }

        .sts-card.rarity-common {
          border-color: var(--gold-light);
          box-shadow: 0 15px 35px rgba(243, 183, 0, 0.15), 0 0 15px rgba(243, 183, 0, 0.05);
        }

        .sts-card:hover {
          box-shadow: 0 20px 45px rgba(0,0,0,0.8), var(--glow-gold-strong);
        }

        .card-shine {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 10;
          transition: background 0.05s ease;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          transform: translateZ(20px);
        }

        .card-name {
          font-family: var(--font-title);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-white);
          text-shadow: 0 2px 4px black;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 155px;
        }

        .card-energy {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--orange) 0%, #a80000 100%);
          border: 2px solid var(--gold-light);
          color: white;
          font-family: var(--font-title);
          font-weight: 900;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.5), 0 0 5px var(--orange);
          flex-shrink: 0;
        }

        .card-art-box {
          height: 110px;
          background: #1c1c24;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          transform: translateZ(10px);
        }

        .art-gradient {
          position: absolute;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle, rgba(243, 183, 0, 0.15) 0%, rgba(0,0,0,0) 80%);
          animation: pulseGlow 5s infinite ease-in-out;
        }

        .art-icon {
          font-size: 3rem;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
          z-index: 1;
        }

        .card-type-bar {
          background: rgba(0, 0, 0, 0.4);
          border-bottom: 2px solid;
          color: var(--text-muted);
          font-size: 0.65rem;
          text-align: center;
          padding: 3px 0;
          font-family: var(--font-title);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          transform: translateZ(15px);
        }

        .card-body {
          flex-grow: 1;
          background: rgba(0,0,0,0.25);
          border-radius: 6px;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.03);
          transform: translateZ(15px);
        }

        .card-desc {
          color: var(--text-silver);
          font-size: 0.75rem;
          text-align: center;
          line-height: 1.35;
          font-weight: 400;
        }

        .card-desc strong {
          color: var(--gold-light);
          font-weight: 600;
        }

        .card-footer-tag {
          font-size: 0.55rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 6px;
          font-family: var(--font-title);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
