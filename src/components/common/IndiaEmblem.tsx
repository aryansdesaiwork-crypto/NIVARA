import React, { useState } from 'react';

interface IndiaEmblemProps {
  className?: string;
  size?: number;
  showText?: boolean;
  light?: boolean;
}

export const IndiaEmblem: React.FC<IndiaEmblemProps> = ({
  className = '',
  size = 40,
  showText = true,
  light = false
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Government of India Emblem (Ashoka Lion Capital) */}
      {!imgError ? (
        <div
          className={`relative flex items-center justify-center flex-shrink-0 overflow-hidden rounded-md transition-all ${
            light ? 'bg-white/95 p-1 shadow-sm border border-white/20' : 'bg-transparent p-0.5'
          }`}
          style={{ width: size, height: Math.round(size * 1.38) }}
        >
          <img
            src="/src/assets/images/india_state_emblem_1791087406249.jpg"
            alt="State Emblem of India"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain filter contrast-125"
          />
        </div>
      ) : (
        /* High-Precision Vector Fallback */
        <svg
          width={size}
          height={Math.round(size * 1.35)}
          viewBox="0 0 100 135"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
          aria-label="State Emblem of India"
        >
          {/* Central Lion Head and Detailed Mane */}
          <path
            d="M50 6C42 6 36 10 34 16C31 15 28 17 26 21C24 26 26 31 28 34C25 37 24 42 26 46C28 51 33 54 38 55C40 61 44 65 50 66C56 65 60 61 62 55C67 54 72 51 74 46C76 42 75 37 72 34C74 31 76 26 74 21C72 17 69 15 66 16C64 10 58 6 50 6Z"
            fill={light ? '#F8FAFC' : '#0F172A'}
          />
          {/* Left Profile Lion */}
          <path
            d="M24 22C20 24 16 29 16 34C16 40 20 45 23 47C21 52 22 58 25 61C29 65 34 66 38 66C36 62 34 58 34 53C30 52 27 48 26 44C24 40 25 35 27 32C25 29 23 25 24 22Z"
            fill={light ? '#E2E8F0' : '#1E293B'}
          />
          {/* Right Profile Lion */}
          <path
            d="M76 22C80 24 84 29 84 34C84 40 80 45 77 47C79 52 78 58 75 61C71 65 66 66 62 66C64 62 66 58 66 53C70 52 73 48 74 44C76 40 75 35 73 32C75 29 77 25 76 22Z"
            fill={light ? '#E2E8F0' : '#1E293B'}
          />
          {/* Detailed Abacus Frieze */}
          <rect
            x="14"
            y="70"
            width="72"
            height="14"
            rx="2.5"
            fill={light ? '#F8FAFC' : '#0F172A'}
          />
          {/* Center Ashoka Dharma Chakra (24-spoke wheel) */}
          <circle
            cx="50"
            cy="77"
            r="5.5"
            stroke={light ? '#0284C7' : '#0369A1'}
            strokeWidth="1.6"
            fill={light ? '#FFFFFF' : '#F8FAFC'}
          />
          <circle cx="50" cy="77" r="1.5" fill={light ? '#0284C7' : '#0369A1'} />
          {/* Left Galloping Horse Representation */}
          <path
            d="M22 75C24 73 28 73 30 76C32 78 30 80 28 80C26 80 24 81 22 79Z"
            fill={light ? '#94A3B8' : '#475569'}
          />
          {/* Right Bull Representation */}
          <path
            d="M70 79C68 81 72 81 74 79C76 77 78 75 76 73C74 73 72 75 70 79Z"
            fill={light ? '#94A3B8' : '#475569'}
          />
          {/* Lotus Base */}
          <path
            d="M20 86C25 86 28 88 30 94C33 102 41 107 50 107C59 107 67 102 70 94C72 88 75 86 80 86C82 86 84 88 84 90C82 98 75 109 65 113C59 115 55 116 50 116C45 116 41 115 35 113C25 109 18 98 16 90C16 88 18 86 20 86Z"
            fill={light ? '#CBD5E1' : '#334155'}
          />
          {/* Plinth Base */}
          <rect
            x="24"
            y="120"
            width="52"
            height="4"
            rx="2"
            fill={light ? '#E2E8F0' : '#1E293B'}
          />
          {/* Official Motto: Satyameva Jayate in Devanagari */}
          <text
            x="50"
            y="131"
            textAnchor="middle"
            fontSize="7"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.8"
            fill={light ? '#F8FAFC' : '#0F172A'}
          >
            सत्यमेव जयते
          </text>
        </svg>
      )}

      {showText && (
        <div className="flex flex-col justify-center leading-tight">
          <span
            className={`text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase font-mono ${
              light ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Government of India
          </span>
          <span
            className={`text-xs sm:text-sm font-extrabold tracking-tight ${
              light ? 'text-white' : 'text-[#17213A]'
            }`}
          >
            MINISTRY OF EARTH SCIENCES
          </span>
        </div>
      )}
    </div>
  );
};
