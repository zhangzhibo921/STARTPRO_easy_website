import React, { useMemo } from 'react'
import type { ThemeBackgroundEffect } from '@/styles/themes'

type StarfieldConfig = Extract<ThemeBackgroundEffect, { type: 'starfield' }>

interface StarfieldBackgroundProps {
  config: StarfieldConfig
}

// 可复现的伪随机，避免 CSR/SSR 差异
const createRng = (seed: number) => {
  let value = seed % 2147483647
  return () => {
    value = (value * 48271) % 2147483647
    return value / 2147483647
  }
}

// 生成小尺寸 SVG 纹理并返回 data URI
const TILE_SIZE = 420

const buildStarTile = (config: StarfieldConfig) => {
  const rng = createRng(1337)
  const density = config.density ?? 0.3

  // 基础星点数量（进一步稀疏，约为之前的 1/3）
  const starCount = Math.max(10, Math.round(20 * density))

  const circles: string[] = []
  for (let i = 0; i < starCount; i++) {
    const x = Math.round(rng() * TILE_SIZE * 10) / 10
    const y = Math.round(rng() * TILE_SIZE * 10) / 10
    const r = 0.35 + rng() * 1.15
    const fill = config.starColor
    circles.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" />`)
  }

  // 少量柔和光点
  // 不再绘制大圆光点，避免大颗粒

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_SIZE}" height="${TILE_SIZE}" viewBox="0 0 ${TILE_SIZE} ${TILE_SIZE}" fill="none">${circles.join(
    ''
  )}</svg>`

  const encoded = encodeURIComponent(svg)
  return `url("data:image/svg+xml;utf8,${encoded}")`
}

const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({ config }) => {
  const baseColor = config.baseColor || '#000000'

  const starTile = useMemo(() => buildStarTile(config), [config])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: baseColor
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: starTile,
          backgroundRepeat: 'repeat',
          backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`,
          opacity: 1
        }}
      />
    </div>
  )
}

export default StarfieldBackground
