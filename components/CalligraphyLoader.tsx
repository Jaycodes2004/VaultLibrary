'use client';

import React from 'react';

interface CalligraphyLoaderProps {
  label?: string;
  subtext?: string;
}

export const CalligraphyLoader: React.FC<CalligraphyLoaderProps> = ({
  label = 'Loading',
  subtext = 'Inscribing parchment & decrypting chapters...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="relative flex flex-col items-center">
        {/* Animated Calligraphy Writing SVG */}
        <div className="relative w-64 h-24 flex items-center justify-center">
          {/* Cursive SVG Path of 'Loading' with drawing stroke-dasharray animation */}
          <svg
            className="w-full h-full text-[#3c2a1e] dark:text-[#f2e6d6]"
            viewBox="0 0 320 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Elegant Calligraphic Flourish Underline */}
            <path
              d="M 30 75 Q 160 90 290 75 Q 220 85 140 78 Q 70 82 40 76"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="flourish-path"
              opacity="0.7"
            />

            {/* Stylized cursive text 'Loading' */}
            <text
              x="50%"
              y="55"
              textAnchor="middle"
              className="calligraphy-drawing-text"
              fill="currentColor"
              style={{
                fontFamily: "'Marck Script', 'Alex Brush', cursive",
                fontSize: '52px',
                letterSpacing: '2px',
              }}
            >
              {label}
            </text>
          </svg>

          {/* Golden Fountain Pen Nib that animates as if writing */}
          <div className="absolute top-1 pointer-events-none pen-nib-anim">
            <svg
              width="28"
              height="36"
              viewBox="0 0 28 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-md"
            >
              {/* Pen Nib Body */}
              <path
                d="M 14 36 L 6 16 L 9 2 L 19 2 L 22 16 Z"
                fill="url(#goldGradient)"
                stroke="#644820"
                strokeWidth="1.2"
              />
              {/* Pen Nib Slit & Breather Hole */}
              <circle cx="14" cy="18" r="2.2" fill="#2d1c0b" />
              <line x1="14" y1="18" x2="14" y2="36" stroke="#2d1c0b" strokeWidth="1.2" />
              {/* Gold gradient definition */}
              <defs>
                <linearGradient id="goldGradient" x1="6" y1="2" x2="22" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f5dfa2" />
                  <stop offset="0.5" stopColor="#d4af37" />
                  <stop offset="1" stopColor="#996515" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Subtitle in archival serif style */}
        <p className="mt-3 text-xs tracking-wider uppercase font-serif text-[#78614a] dark:text-[#c4b5a2] animate-pulse">
          {subtext}
        </p>

        {/* Small ink droplet animation */}
        <div className="mt-2 flex items-center gap-1.5 opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8c6742] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#8c6742] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#8c6742] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
