import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Eye, ShieldCheck, Wind, Award, Zap } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function CourtVisualizer({ courts, activeCourtId, setActiveCourtId }) {
  const visualizerRef = useRef(null);
  const shuttleRef = useRef(null);

  const activeCourt = courts.find((c) => c.id === activeCourtId) || courts[0];

  useGSAP(() => {
    // Subtle smash trajectory animation for the mini shuttlecock over the net
    if (shuttleRef.current) {
      gsap.to(shuttleRef.current, {
        x: 60,
        y: -15,
        rotation: 45,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    }

    // Court change transition
    gsap.from('.court-floor-container', {
      scale: 0.98,
      opacity: 0.7,
      duration: 0.4,
      ease: 'power2.out'
    });
  }, { scope: visualizerRef, dependencies: [activeCourtId] });

  return (
    <div className="court-visualizer-card" ref={visualizerRef}>
      <div className="visualizer-header">
        <div className="court-switcher-tabs">
          {courts.map((court) => (
            <button
              key={court.id}
              type="button"
              onClick={() => setActiveCourtId(court.id)}
              className={`court-tab-btn ${court.id === activeCourtId ? 'active' : ''}`}
            >
              <span>{court.name.split(' - ')[0]}</span>
              {court.isVip && <span className="vip-mini-tag">VIP</span>}
            </button>
          ))}
        </div>

        <div className="court-badge-info">
          <span className="court-type-pill">
            <Award size={13} className="text-emerald" />
            {activeCourt.type}
          </span>
        </div>
      </div>

      {/* Badminton Court Realistic SVG Schematic */}
      <div className="court-preview-stage">
        <div className="court-floor-container">
          {/* Subtle court lighting effect */}
          <div className="court-light-beam"></div>

          <svg
            className="badminton-svg"
            viewBox="0 0 600 320"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Outer Boundary & Run-off Area */}
            <rect x="0" y="0" width="600" height="320" rx="14" fill="#064E3B" />
            <rect x="15" y="15" width="570" height="290" rx="8" fill="#047857" opacity="0.95" />

            {/* Doubles Outer Lines */}
            <rect x="40" y="35" width="520" height="250" fill="#047857" stroke="#FFFFFF" strokeWidth="3" />

            {/* Singles Side Lines (Top and Bottom inside doubles) */}
            <line x1="40" y1="58" x2="560" y2="58" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.9" />
            <line x1="40" y1="262" x2="560" y2="262" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.9" />

            {/* Doubles Long Service Lines (Left and Right ends) */}
            <line x1="68" y1="35" x2="68" y2="285" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.9" />
            <line x1="532" y1="35" x2="532" y2="285" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.9" />

            {/* Short Service Lines (Near the net) */}
            <line x1="225" y1="35" x2="225" y2="285" stroke="#FFFFFF" strokeWidth="3" />
            <line x1="375" y1="35" x2="375" y2="285" stroke="#FFFFFF" strokeWidth="3" />

            {/* Center Service Line (Left half: from doubles baseline to short service line) */}
            <line x1="40" y1="160" x2="225" y2="160" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Center Service Line (Right half: from short service line to doubles baseline) */}
            <line x1="375" y1="160" x2="560" y2="160" stroke="#FFFFFF" strokeWidth="2.5" />

            {/* Net Post Shadows & Net Mesh in the exact middle (x = 300) */}
            <line x1="300" y1="25" x2="300" y2="295" stroke="#1E293B" strokeWidth="7" strokeDasharray="2,3" strokeOpacity="0.7" />
            <line x1="300" y1="25" x2="300" y2="295" stroke="#F8FAFC" strokeWidth="3" />

            {/* Net Posts */}
            <circle cx="300" cy="28" r="4.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="300" cy="292" r="4.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />

            {/* Court Name Label Watermark */}
            <text x="300" y="166" fill="#FFFFFF" fillOpacity="0.18" fontSize="28" fontWeight="800" textAnchor="middle" letterSpacing="4">
              SMASH ARENA • {activeCourt.name.split(' - ')[0].toUpperCase()}
            </text>

            {/* Animated Shuttlecock floating over court */}
            <g ref={shuttleRef} transform="translate(280, 110)">
              <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
              <path d="M0,0 L-10,-5 L-7,0 L-10,5 Z" fill="#E2E8F0" opacity="0.9" />
              <circle cx="0" cy="0" r="2" fill="#10B981" />
            </g>
          </svg>

          {/* Quick Specs Under Court */}
          <div className="court-specs-overlay">
            <div className="spec-item">
              <span className="spec-dot"></span>
              <span>Kích thước: 13.4m × 6.1m (Tiêu chuẩn BWF)</span>
            </div>
            <div className="spec-item">
              <ShieldCheck size={14} className="text-emerald" />
              <span>{activeCourt.surface}</span>
            </div>
            <div className="spec-item">
              <Wind size={14} className="text-blue" />
              <span>Trần cao 9.2m • Hệ thống gió đối lưu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
