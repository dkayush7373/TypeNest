'use client';

import React from 'react';

interface BackgroundLayersProps {
  isTyping?: boolean;
}

export const BackgroundLayers: React.FC<BackgroundLayersProps> = React.memo(function BackgroundLayers({
  isTyping = false,
}) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* Layer 2: Depth - single soft radial light behind typing area */}
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{
          background: `radial-gradient(ellipse 900px 500px at 50% 36%, var(--radial-light) 0%, transparent 75%)`,
          opacity: isTyping ? 'var(--radial-opacity)' : 'calc(var(--radial-opacity) * 1.1)',
          willChange: 'opacity',
        }}
      />

      {/* Layer 3: Texture - faint grid pattern that calms down during typing */}
      <div
        className="absolute inset-0 transition-opacity duration-500 ease-out"
        style={{
          backgroundImage: `linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
                            linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 80%)',
          opacity: isTyping ? 0.35 : 1,
          willChange: 'opacity',
        }}
      />

      {/* Layer 4: Grain - subtle SVG feTurbulence noise */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-overlay pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Layer 5: Vignette - gently darkened corners */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.45) 100%)',
        }}
      />
    </div>
  );
});
