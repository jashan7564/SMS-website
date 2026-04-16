import React from 'react';

// Animated decorative SVG background — circuit/mesh pattern with floating nodes
export default function SvgBackground({ variant = 'mesh' }) {
  if (variant === 'auth') return <AuthBackground />;
  return <DashboardBackground />;
}

function DashboardBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
    }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {/* Soft radial gradient mask */}
          <radialGradient id="bgFade" cx="60%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
          </radialGradient>
          {/* Dot grid pattern */}
          <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#6366f1" fillOpacity="0.12" />
          </pattern>
          {/* Line grid */}
          <pattern id="grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.07" />
          </pattern>
          <filter id="blur4">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="blur12">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* Background base */}
        <rect width="100%" height="100%" fill="#f8fafc" />

        {/* Dot grid */}
        <rect width="100%" height="100%" fill="url(#dots)" />

        {/* Line grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Large soft color blobs */}
        <ellipse cx="80%" cy="10%" rx="400" ry="300" fill="#eef2ff" fillOpacity="0.8" filter="url(#blur12)" />
        <ellipse cx="10%" cy="70%" rx="300" ry="250" fill="#f0f9ff" fillOpacity="0.7" filter="url(#blur12)" />
        <ellipse cx="60%" cy="85%" rx="250" ry="200" fill="#faf5ff" fillOpacity="0.5" filter="url(#blur12)" />

        {/* Circuit lines — horizontal */}
        <g stroke="#6366f1" strokeOpacity="0.12" strokeWidth="1" fill="none">
          <path d="M 0 120 L 200 120 L 220 140 L 400 140" strokeDasharray="4 8" />
          <path d="M 100 280 L 300 280 L 320 300 L 520 300" strokeDasharray="4 8" />
          <path d="M 500 180 L 700 180 L 720 200 L 900 200" strokeDasharray="4 8" />
        </g>

        {/* Animated floating nodes */}
        <g fill="#6366f1" fillOpacity="0.15">
          <circle cx="15%" cy="20%" r="5">
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-8; 0,0" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="80%" cy="15%" r="4">
            <animateTransform attributeName="transform" type="translate" values="0,0; 6,0; 0,0" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle cx="70%" cy="75%" r="6">
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,10; 0,0" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="25%" cy="80%" r="4">
            <animateTransform attributeName="transform" type="translate" values="0,0; -6,4; 0,0" dur="7s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Accent rings */}
        <circle cx="85%" cy="12%" r="60" fill="none" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="6 10">
          <animateTransform attributeName="transform" type="rotate" from="0 1224 10" to="360 1224 108" dur="30s" repeatCount="indefinite" />
        </circle>
        <circle cx="12%" cy="75%" r="45" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4 8">
          <animateTransform attributeName="transform" type="rotate" from="360 12% 75%" to="0 12% 75%" dur="25s" repeatCount="indefinite" />
        </circle>

        {/* Top-right decorative hexagon mesh */}
        <g transform="translate(1080, -45)" fill="none" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.08">
          {[0,1,2,3,4].map(i =>
            [0,1,2,3].map(j => {
              const x = i * 40 + (j % 2) * 20;
              const y = j * 35;
              return <polygon key={`${i}-${j}`} points={`${x},${y+12} ${x+10},${y+6} ${x+10},${y-6} ${x},${y-12} ${x-10},${y-6} ${x-10},${y+6}`} />;
            })
          )}
        </g>
      </svg>
    </div>
  );
}

function AuthBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0f9ff 100%)',
    }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="authDots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1.2" fill="#6366f1" fillOpacity="0.15" />
          </pattern>
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="20" />
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#authDots)" />

        {/* Soft gradient blobs */}
        <ellipse cx="20%" cy="20%" rx="350" ry="280" fill="#c7d2fe" fillOpacity="0.35" filter="url(#softBlur)" />
        <ellipse cx="80%" cy="75%" rx="300" ry="250" fill="#ddd6fe" fillOpacity="0.3" filter="url(#softBlur)" />
        <ellipse cx="60%" cy="30%" rx="200" ry="160" fill="#bae6fd" fillOpacity="0.25" filter="url(#softBlur)" />

        {/* Large decorative arcs */}
        <g fill="none" stroke="#6366f1" strokeOpacity="0.07" strokeWidth="1.5">
          <path d="M -100 300 Q 200 100 500 400 T 1100 300">
            <animate attributeName="d" values="M -100 300 Q 200 100 500 400 T 1100 300; M -100 320 Q 200 80 500 420 T 1100 280; M -100 300 Q 200 100 500 400 T 1100 300" dur="8s" repeatCount="indefinite" />
          </path>
          <path d="M -100 500 Q 300 200 700 500 T 1500 300">
            <animate attributeName="d" values="M -100 500 Q 300 200 700 500 T 1500 300; M -100 480 Q 300 220 700 480 T 1500 320; M -100 500 Q 300 200 700 500 T 1500 300" dur="10s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Floating envelope icons */}
        <g opacity="0.06" stroke="#6366f1" strokeWidth="1.5" fill="none">
          {/* Envelope 1 */}
          <g transform="translate(8%, 15%)">
            <rect x="0" y="0" width="36" height="24" rx="2" />
            <polyline points="0,0 18,14 36,0" />
            <animateTransform attributeName="transform" type="translate" additive="sum" values="0,0; 0,-12; 0,0" dur="5s" repeatCount="indefinite" />
          </g>
          {/* Envelope 2 */}
          <g transform="translate(85%, 25%)">
            <rect x="0" y="0" width="28" height="18" rx="2" />
            <polyline points="0,0 14,10 28,0" />
            <animateTransform attributeName="transform" type="translate" additive="sum" values="0,0; 4,8; 0,0" dur="7s" repeatCount="indefinite" />
          </g>
          {/* Envelope 3 */}
          <g transform="translate(15%, 70%)">
            <rect x="0" y="0" width="22" height="15" rx="2" />
            <polyline points="0,0 11,8 22,0" />
            <animateTransform attributeName="transform" type="translate" additive="sum" values="0,0; -5,6; 0,0" dur="6s" repeatCount="indefinite" />
          </g>
          {/* Signal waves */}
          <g transform="translate(78%, 65%)" strokeWidth="1.2">
            <path d="M 0 10 Q 5 4 10 10 Q 15 16 20 10" />
            <path d="M -5 10 Q 4 1 13 10 Q 22 19 31 10" />
            <animateTransform attributeName="transform" type="translate" additive="sum" values="0,0; 3,-5; 0,0" dur="4s" repeatCount="indefinite" />
          </g>
        </g>

        {/* Corner ornaments */}
        <g opacity="0.08" stroke="#8b5cf6" strokeWidth="1" fill="none">
          <circle cx="5%" cy="5%" r="80" strokeDasharray="5 10" />
          <circle cx="5%" cy="5%" r="50" strokeDasharray="3 8" />
          <circle cx="95%" cy="90%" r="100" strokeDasharray="5 10">
            <animateTransform attributeName="transform" type="rotate" from="0 95% 90%" to="360 95% 90%" dur="40s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
}
