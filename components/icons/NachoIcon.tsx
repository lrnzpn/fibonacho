'use client';

interface NachoIconProps {
  className?: string;
  animate?: boolean;
}

export default function NachoIcon({ className = 'w-16 h-16', animate = false }: NachoIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} ${animate ? 'animate-bounce' : ''}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        {`
          @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
          .nacho-wiggle {
            animation: wiggle 2s ease-in-out infinite;
            transform-origin: center;
          }
        `}
      </style>

      {/* Main nacho chip - triangular shape */}
      <g className={animate ? 'nacho-wiggle' : ''}>
        {/* Base chip */}
        <path d="M50 20 L80 70 L20 70 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />

        {/* Chip texture/highlights */}
        <path d="M50 25 L75 65 L25 65 Z" fill="#FBBF24" opacity="0.6" />

        {/* Cheese drips */}
        <ellipse cx="50" cy="45" rx="8" ry="6" fill="#FACC15" opacity="0.9" />
        <path d="M50 48 Q48 52 46 55 L54 55 Q52 52 50 48 Z" fill="#FACC15" opacity="0.9" />

        <ellipse cx="38" cy="55" rx="6" ry="5" fill="#FACC15" opacity="0.9" />
        <path d="M38 58 Q37 61 35 63 L41 63 Q40 61 38 58 Z" fill="#FACC15" opacity="0.9" />

        <ellipse cx="62" cy="52" rx="7" ry="5" fill="#FACC15" opacity="0.9" />
        <path d="M62 55 Q61 58 59 61 L65 61 Q64 58 62 55 Z" fill="#FACC15" opacity="0.9" />

        {/* Jalapeño slice */}
        <ellipse cx="45" cy="40" rx="4" ry="3" fill="#22C55E" opacity="0.8" />
        <ellipse cx="45" cy="40" rx="2" ry="1.5" fill="#16A34A" opacity="0.6" />

        {/* Tomato piece */}
        <circle cx="58" cy="38" r="3.5" fill="#EF4444" opacity="0.8" />

        {/* Salt/seasoning dots */}
        <circle cx="42" cy="32" r="0.8" fill="#FEF3C7" opacity="0.7" />
        <circle cx="56" cy="30" r="0.8" fill="#FEF3C7" opacity="0.7" />
        <circle cx="48" cy="35" r="0.8" fill="#FEF3C7" opacity="0.7" />
        <circle cx="52" cy="48" r="0.8" fill="#FEF3C7" opacity="0.7" />
        <circle cx="35" cy="50" r="0.8" fill="#FEF3C7" opacity="0.7" />
        <circle cx="65" cy="48" r="0.8" fill="#FEF3C7" opacity="0.7" />
      </g>

      {/* Cute face on the nacho */}
      <g className={animate ? 'nacho-wiggle' : ''}>
        {/* Eyes */}
        <circle cx="44" cy="50" r="2.5" fill="#1F2937" />
        <circle cx="56" cy="50" r="2.5" fill="#1F2937" />
        <circle cx="44.8" cy="49.5" r="1" fill="#FFFFFF" />
        <circle cx="56.8" cy="49.5" r="1" fill="#FFFFFF" />

        {/* Happy smile */}
        <path
          d="M42 56 Q50 60 58 56"
          stroke="#1F2937"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
