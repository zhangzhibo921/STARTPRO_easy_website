import React from 'react'
import type { ThemeBackgroundEffect } from '@/styles/themes'

type GradientConfig = Extract<ThemeBackgroundEffect, { type: 'gradient' }>

interface GradientBackgroundProps {
  config: GradientConfig
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ config }) => {
  const { colors, angle = 120, blur = 100, overlayOpacity = 0.8 } = config
  const gradient = `linear-gradient(${angle}deg, ${colors.join(', ')})`

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: gradient,
          filter: `blur(${blur}px)`,
          opacity: overlayOpacity
        }}
      />
    </div>
  )
}

export default GradientBackground
