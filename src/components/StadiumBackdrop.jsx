import { memo } from 'react';

const ROLE_COLORS = {
  admin: {
    stroke: 'rgba(244, 63, 94, 0.12)',
    glow: 'rgba(244, 63, 94, 0.02)',
    node: '#fb7185',
  },
  manager: {
    stroke: 'rgba(139, 92, 246, 0.12)',
    glow: 'rgba(139, 92, 246, 0.02)',
    node: '#a78bfa',
  },
  security: {
    stroke: 'rgba(245, 158, 11, 0.12)',
    glow: 'rgba(245, 158, 11, 0.02)',
    node: '#fbbf24',
  },
  operator: {
    stroke: 'rgba(34, 197, 94, 0.12)',
    glow: 'rgba(34, 197, 94, 0.02)',
    node: '#4ade80',
  },
};

function StadiumBackdropComponent({ role = 'operator' }) {
  const colors = ROLE_COLORS[role] || ROLE_COLORS.operator;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Subtle radial ambient glow behind command center */}
      <div
        className="absolute top-0 left-1/3 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: colors.glow }}
      />

      {/* SVG Stadium Wireframe with clean subtle low-opacity vector lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 transition-colors duration-1000"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ color: colors.stroke }}
      >
        <g stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.6">
          {/* Seating Ring Tier 1 */}
          <path d="M 160,760 C 160,760 240,810 720,810 C 1200,810 1280,760 1280,760 C 1280,760 1340,510 1280,260 C 1220,200 720,200 720,200 C 720,200 220,200 160,260 C 100,510 160,760 160,760 Z" />
          
          {/* Seating Ring Tier 2 */}
          <path d="M 240,690 C 240,690 300,720 720,720 C 1140,720 1200,690 1200,690 C 1200,690 1240,490 1200,320 C 1160,260 720,260 720,260 C 720,260 280,260 240,320 C 200,490 240,690 240,690 Z" strokeDasharray="4 4" />

          {/* Perspective Pitch */}
          <polygon points="420,590 1020,590 910,390 530,390" strokeWidth="1.2" />
          
          {/* Midfield Line */}
          <line x1="720" y1="390" x2="720" y2="590" strokeWidth="1" />
          
          {/* Center Circle */}
          <ellipse cx="720" cy="490" rx="70" ry="32" strokeWidth="1" />
          <circle cx="720" cy="490" r="2.5" fill="currentColor" />

          {/* Penalty Areas */}
          <polygon points="520,590 920,590 890,530 550,530" />
          <polygon points="560,390 880,390 860,440 580,440" />
        </g>

        {/* Micro Sensor Nodes */}
        <g fill={colors.node} opacity="0.7">
          {[
            { x: 420, y: 590, id: 'c1' },
            { x: 1020, y: 590, id: 'c2' },
            { x: 910, y: 390, id: 'c3' },
            { x: 530, y: 390, id: 'c4' },
            { x: 720, y: 490, id: 'c5' },
            { x: 240, y: 320, id: 's1' },
            { x: 1200, y: 690, id: 's2' },
          ].map((node) => (
            <circle key={node.id} cx={node.x} cy={node.y} r="1.5" />
          ))}
        </g>
      </svg>
    </div>
  );
}

export const StadiumBackdrop = memo(StadiumBackdropComponent);
