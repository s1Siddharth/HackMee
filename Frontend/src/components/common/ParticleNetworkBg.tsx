import React, { useEffect, useRef } from 'react'
import { useThemeStore } from '../../store/useThemeStore'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  baseAlpha: number
}

export const ParticleNetworkBg: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { isDark } = useThemeStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // Mouse coordinates for interactive lines
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 160 // connection threshold to mouse
    }

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      initParticles()
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    // Palette: Cyan, Indigo, Violet, Electric Blue
    const darkPalette = [
      '#22d3ee', // Cyan
      '#818cf8', // Indigo
      '#a855f7', // Violet
      '#38bdf8', // Sky
      '#6366f1'  // Blue/Violet
    ]

    const lightPalette = [
      '#6366f1',
      '#0ea5e9',
      '#8b5cf6',
      '#4f46e5'
    ]

    let particles: Particle[] = []

    const initParticles = () => {
      // Density based on screen area (approx 60-95 particles)
      const count = Math.min(Math.floor((width * height) / 16000), 90)
      particles = []
      const palette = isDark ? darkPalette : lightPalette

      for (let i = 0; i < count; i++) {
        const baseAlpha = isDark ? 0.35 + Math.random() * 0.45 : 0.2 + Math.random() * 0.3
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: 1.2 + Math.random() * 1.8,
          color: palette[Math.floor(Math.random() * palette.length)],
          alpha: baseAlpha,
          baseAlpha: baseAlpha
        })
      }
    }

    initParticles()

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // 1. Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Move
        p.x += p.vx
        p.y += p.vy

        // Screen boundary wrapping / bounce
        if (p.x < 0) p.x = width
        else if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        else if (p.y > height) p.y = 0

        // Distance from cursor
        const dxMouse = mouse.x - p.x
        const dyMouse = mouse.y - p.y
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)

        // Subtle glow when near mouse
        let currentAlpha = p.baseAlpha
        if (distMouse < mouse.radius) {
          currentAlpha = Math.min(p.baseAlpha + 0.4, 0.9)
        }

        // Draw particle dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = currentAlpha
        ctx.fill()

        // 2. Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 135 // line connection distance

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * (isDark ? 0.22 : 0.12)
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = isDark ? '#818cf8' : '#6366f1'
            ctx.globalAlpha = lineAlpha
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
        }

        // 3. Connect to mouse if within radius
        if (distMouse < mouse.radius) {
          const mouseLineAlpha = (1 - distMouse / mouse.radius) * (isDark ? 0.35 : 0.18)
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.strokeStyle = '#22d3ee'
          ctx.globalAlpha = mouseLineAlpha
          ctx.lineWidth = 0.9
          ctx.stroke()
        }
      }

      ctx.globalAlpha = 1
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
      style={{
        opacity: isDark ? 0.85 : 0.45
      }}
    />
  )
}
