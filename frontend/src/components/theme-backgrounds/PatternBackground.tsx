import React from 'react'
import type { ThemeBackgroundEffect } from '@/styles/themes'

type PatternConfig = Extract<ThemeBackgroundEffect, { type: 'pattern' }>

interface PatternBackgroundProps {
  config: PatternConfig
}

const PatternBackground: React.FC<PatternBackgroundProps> = ({ config }) => {
  const { backgroundColor, patternColor, secondaryColor = 'rgba(255,255,255,0.1)', opacity = 0.85 } = config

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ backgroundColor, opacity }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(135deg, ${patternColor} 25%, transparent 25%),
            linear-gradient(225deg, ${patternColor} 25%, transparent 25%),
            linear-gradient(45deg, ${patternColor} 25%, transparent 25%),
            linear-gradient(315deg, ${patternColor} 25%, ${secondaryColor} 25%)`,
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          backgroundSize: '24px 24px',
          opacity: 0.6
        }}
      />
    </div>
  )
}

export default PatternBackground
