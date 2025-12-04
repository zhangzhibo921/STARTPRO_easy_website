import React from 'react'
import type { ThemeBackgroundEffect } from '@/styles/themes'
import StarfieldBackground from './StarfieldBackground'
import GradientBackground from './GradientBackground'
import PatternBackground from './PatternBackground'

interface BackgroundRendererProps {
  effect?: ThemeBackgroundEffect
}

const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({ effect }) => {
  if (!effect) return null

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {effect.type === 'starfield' && <StarfieldBackground config={effect} />}
      {effect.type === 'gradient' && <GradientBackground config={effect} />}
      {effect.type === 'pattern' && <PatternBackground config={effect} />}
    </div>
  )
}

export default BackgroundRenderer
