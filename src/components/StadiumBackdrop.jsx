import { memo } from 'react';

const ROLE_COLORS = {
  admin: {
    primary: 'rgba(244, 63, 94, 0.25)',    // rose-500
    secondary: 'rgba(251, 146, 60, 0.12)', // orange-400
    glow: 'rgba(244, 63, 94, 0.04)',
  },
  manager: {
    primary: 'rgba(139, 92, 246, 0.25)',   // violet-500
    secondary: 'rgba(192, 132, 252, 0.12)', // purple-400
    glow: 'rgba(139, 92, 246, 0.04)',
  },
  security: {
    primary: 'rgba(245, 158, 11, 0.25)',   // amber-500
    secondary: 'rgba(251, 191, 36, 0.12)',  // yellow-400
    glow: 'rgba(245, 158, 11, 0.04)',
  },
  operator: {
    primary: 'rgba(51, 120, 255, 0.25)',   // brand-500
    secondary: 'rgba(34, 211, 238, 0.12)',  // accent-400
    glow: 'rgba(51, 120, 255, 0.04)',
  },
};

function StadiumBackdropComponent({ role = 'operator' }) {
  const colors = ROLE_COLORS[role] || ROLE_COLORS.operator;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Dynamic Grid Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${colors.primary} 1px, transparent 1px),
            linear-gradient(to bottom, ${colors.primary} 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 85%)',
        }}
      />

      {/* Ambient Glows */}
      <div 
        className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] transition-all duration-1000 ease-in-out" 
        style={{ backgroundColor: colors.glow }}
      />
      <div 
        className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] transition-all duration-1000 ease-in-out" 
        style={{ backgroundColor: colors.glow }}
      />

      {/* SVG Stadium Wireframe */}
      <svg 
        className="absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out" 
        viewBox="0 0 1440 900" 
        preserveAspectRatio="xMidYMid slice"
        style={{ color: colors.primary }}
      >
        <g stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.45" className="transition-all duration-1000">
          {/* Seating Ring Tier 1 (Outer Stadium Boundary) */}
          <path d="M 160,760 C 160,760 240,810 720,810 C 1200,810 1280,760 1280,760 C 1280,760 1340,510 1280,260 C 1220,200 720,200 720,200 C 720,200 220,200 160,260 C 100,510 160,760 160,760 Z" strokeWidth="1" />
          
          {/* Seating Ring Tier 2 (Mid Stadium Aisle) */}
          <path d="M 240,690 C 240,690 300,720 720,720 C 1140,720 1200,690 1200,690 C 1200,690 1240,490 1200,320 C 1160,260 720,260 720,260 C 720,260 280,260 240,320 C 200,490 240,690 240,690 Z" strokeWidth="1" strokeDasharray="6 4" />

          {/* Seating Ring Tier 3 (Inner Stands) */}
          <path d="M 310,630 C 310,630 360,650 720,650 C 1080,650 1130,630 1130,630 C 1130,630 1160,470 1130,360 C 1100,310 720,310 720,310 C 720,310 340,310 310,360 C 280,470 310,630 310,630 Z" strokeWidth="0.8" />

          {/* Perspective Pitch / Playing Field */}
          <polygon points="420,590 1020,590 910,390 530,390" strokeWidth="2" />
          
          {/* Midfield Line */}
          <line x1="720" y1="390" x2="720" y2="590" strokeWidth="1.5" />
          
          {/* Center Circle */}
          <ellipse cx="720" cy="490" rx="70" ry="32" strokeWidth="1.5" />
          <circle cx="720" cy="490" r="3.5" fill="currentColor" />

          {/* Penalty Area Bottom */}
          <polygon points="520,590 920,590 890,530 550,530" />
          <ellipse cx="720" cy="530" rx="55" ry="12" strokeDasharray="3 3" />
          <circle cx="720" cy="560" r="2" fill="currentColor" />

          {/* Penalty Area Top */}
          <polygon points="560,390 880,390 860,440 580,440" />
          <ellipse cx="720" cy="440" rx="45" ry="10" strokeDasharray="3 3" />
          <circle cx="720" cy="415" r="2" fill="currentColor" />

          {/* Goal posts representation */}
          <line x1="670" y1="590" x2="670" y2="598" />
          <line x1="770" y1="590" x2="770" y2="598" />
          <line x1="670" y1="598" x2="770" y2="598" />

          <line x1="680" y1="390" x2="680" y2="383" />
          <line x1="760" y1="390" x2="760" y2="383" />
          <line x1="680" y1="383" x2="760" y2="383" />
          
          {/* Outer track or safety border */}
          <polygon points="370,615 1070,615 950,365 490,365" strokeWidth="0.8" strokeDasharray="8 6" />
        </g>

        {/* Pulsing Sensors / Camera Nodes / IoT Points */}
        <g fill="currentColor">
          {[
            { x: 420, y: 590, id: 'c1', rate: '2.5s' },
            { x: 1020, y: 590, id: 'c2', rate: '3.1s' },
            { x: 910, y: 390, id: 'c3', rate: '2.8s' },
            { x: 530, y: 390, id: 'c4', rate: '3.4s' },
            { x: 720, y: 490, id: 'c5', rate: '4s' },
            // Stand coordinates
            { x: 240, y: 320, id: 's1', rate: '3.2s' },
            { x: 1200, y: 690, id: 's2', rate: '2.7s' },
            { x: 720, y: 200, id: 's3', rate: '3.7s' },
            { x: 720, y: 810, id: 's4', rate: '3.5s' },
            { x: 200, y: 510, id: 's5', rate: '2.9s' },
            { x: 1240, y: 510, id: 's6', rate: '3.3s' }
          ].map((node) => (
            <g key={node.id} className="transition-all duration-1000">
              {/* Pulsing outer ring */}
              <circle cx={node.x} cy={node.y} r="8" opacity="0.2">
                <animate 
                  attributeName="r" 
                  values="3;14;3" 
                  dur={node.rate} 
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="opacity" 
                  values="0.45;0;0.45" 
                  dur={node.rate} 
                  repeatCount="indefinite" 
                />
              </circle>
              {/* Solid core */}
              <circle cx={node.x} cy={node.y} r="2.5" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export const StadiumBackdrop = memo(StadiumBackdropComponent);
