import React, { useState } from 'react';
import { isDeadBlobUrl } from '../utils/imageStorage';

interface OfficialLogoProps {
  variant?: 'full' | 'compact' | 'light' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  customLogoUrl?: string;
}

export const OfficialLogo: React.FC<OfficialLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  showSubtitle = true,
  customLogoUrl,
}) => {
  const [imgError, setImgError] = useState(false);

  // Size dimensions
  const dimensions = {
    sm: { height: 36, iconSize: 32, titleSize: 'text-base', subSize: 'text-[9px]', subSubSize: 'text-[6px]' },
    md: { height: 48, iconSize: 42, titleSize: 'text-xl', subSize: 'text-[11px]', subSubSize: 'text-[7.5px]' },
    lg: { height: 60, iconSize: 52, titleSize: 'text-2xl', subSize: 'text-xs', subSubSize: 'text-[8.5px]' },
    xl: { height: 78, iconSize: 68, titleSize: 'text-3xl', subSize: 'text-sm', subSubSize: 'text-[10px]' },
  }[size];

  const isLight = variant === 'light';
  const textColor = isLight ? '#FAF8F5' : '#0F263E';
  const subtextColor = isLight ? '#E5D6C5' : '#142C44';
  const subtitleColor = isLight ? '#C5A880' : '#2A435E';

  // If a custom official logo is uploaded by admin, display it with automatic fallback
  if (customLogoUrl && customLogoUrl.trim() !== '' && !imgError && !isDeadBlobUrl(customLogoUrl)) {
    return (
      <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`} id="brand-official-logo">
        <img
          src={customLogoUrl}
          alt="Maryam Trade Center Official Logo"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-auto object-contain transition-transform duration-200"
          style={{ maxHeight: `${dimensions.height}px`, maxWidth: '240px' }}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`} id="brand-official-logo">
      {/* Official Emblem Icon */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: dimensions.iconSize, height: dimensions.iconSize }}>
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background subtle circle guide */}
          <circle cx="80" cy="80" r="72" fill={isLight ? 'rgba(255,255,255,0.06)' : 'rgba(20,44,68,0.03)'} />

          {/* Building 1 (Back Gold/Bronze Tower with windows/ribs) */}
          <path
            d="M84 28L112 44V124H84V28Z"
            fill="url(#goldGrad)"
            stroke="#997A44"
            strokeWidth="1.5"
          />
          {/* Gold building vertical architectural slats */}
          <line x1="92" y1="46" x2="92" y2="120" stroke="#FAF8F5" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="100" y1="51" x2="100" y2="120" stroke="#FAF8F5" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="106" y1="55" x2="106" y2="120" stroke="#FAF8F5" strokeWidth="1.5" strokeOpacity="0.6" />

          {/* Building 2 (Main Teal/Navy Highrise Tower) */}
          <path
            d="M60 48L84 34V124H60V48Z"
            fill="url(#tealTowerGrad)"
            stroke="#0B304A"
            strokeWidth="1.5"
          />
          {/* Main Tower internal facet */}
          <path
            d="M60 48L72 41V124H60V48Z"
            fill="#0F4164"
          />

          {/* Building 3 (Left Front Stepped Tower) */}
          <path
            d="M44 68L60 58V124H44V68Z"
            fill="#1B557A"
            stroke="#0C3450"
            strokeWidth="1.2"
          />
          <path
            d="M44 68L52 63V124H44V68Z"
            fill="#27709E"
          />

          {/* Dynamic Swirling Green Growth Arrow */}
          <path
            d="M32 118C34 94 56 82 86 68L120 48L112 40L144 42L136 74L128 66L92 84C66 96 52 108 50 122C46 128 36 126 32 118Z"
            fill="url(#greenArrowGrad)"
          />
          <path
            d="M144 42L120 48L128 66L144 42Z"
            fill="#1E7B58"
          />

          {/* Dynamic Swirling Gold Arrow */}
          <path
            d="M42 126C54 116 78 104 106 90L126 80L120 74L142 76L136 98L130 92L110 102C82 116 62 128 54 136C46 138 38 132 42 126Z"
            fill="url(#goldArrowGrad)"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="goldGrad" x1="84" y1="28" x2="112" y2="124" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D8BA7A" />
              <stop offset="0.5" stopColor="#C49F58" />
              <stop offset="1" stopColor="#9C7938" />
            </linearGradient>
            <linearGradient id="tealTowerGrad" x1="60" y1="34" x2="84" y2="124" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1B557A" />
              <stop offset="1" stopColor="#0B2B44" />
            </linearGradient>
            <linearGradient id="greenArrowGrad" x1="32" y1="120" x2="144" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0E4B3E" />
              <stop offset="0.4" stopColor="#1D7858" />
              <stop offset="0.8" stopColor="#2BA377" />
              <stop offset="1" stopColor="#219169" />
            </linearGradient>
            <linearGradient id="goldArrowGrad" x1="42" y1="130" x2="142" y2="76" gradientUnits="userSpaceOnUse">
              <stop stopColor="#96722B" />
              <stop offset="0.5" stopColor="#CAA458" />
              <stop offset="1" stopColor="#E6C983" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Official Typography */}
      <div className="flex flex-col tracking-tight leading-none text-left">
        <span
          className={`font-serif font-bold tracking-tight ${dimensions.titleSize}`}
          style={{ color: textColor }}
        >
          Maryam
        </span>
        <span
          className={`font-sans font-bold tracking-[0.16em] uppercase -mt-0.5 ${dimensions.subSize}`}
          style={{ color: subtextColor }}
        >
          TRADE CENTER
        </span>
        {showSubtitle && (
          <span
            className={`font-sans font-medium tracking-[0.18em] uppercase mt-0.5 ${dimensions.subSubSize}`}
            style={{ color: subtitleColor }}
          >
            GLOBAL COMMERCE | CONNECTING BUSINESSES
          </span>
        )}
      </div>
    </div>
  );
};
