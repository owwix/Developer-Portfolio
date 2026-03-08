'use client'

import { useEffect } from 'react'

export default function NetworkBackground() {
  useEffect(() => {
    const canvas = document.getElementById('network-bg')
    if (!(canvas instanceof HTMLCanvasElement)) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let rafId = 0
    let tick = 0
    let pointerX = 0
    let pointerY = 0
    let parallaxX = 0
    let parallaxY = 0
    let layers: Array<{
      depth: number
      speed: number
      radius: [number, number]
      distance: number
      alpha: number
      density: number
      nodes: Array<{
        x: number
        y: number
        vx: number
        vy: number
        r: number
      }>
    }> = []

    const layerSpecs = [
      { depth: 0.35, speed: 0.18, radius: [0.6, 1.2] as [number, number], distance: 130, alpha: 0.12, density: 14000 },
      { depth: 0.7, speed: 0.28, radius: [0.9, 1.8] as [number, number], distance: 160, alpha: 0.14, density: 10500 },
      { depth: 1.15, speed: 0.42, radius: [1.2, 2.4] as [number, number], distance: 190, alpha: 0.16, density: 8200 },
    ]

    const buildLayers = () => {
      const area = width * height
      layers = layerSpecs.map((spec) => {
        const count = Math.max(35, Math.min(220, Math.floor(area / spec.density)))
        return {
          ...spec,
          nodes: Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * spec.speed,
            vy: (Math.random() - 0.5) * spec.speed,
            r: spec.radius[0] + Math.random() * (spec.radius[1] - spec.radius[0]),
          })),
        }
      })
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      pointerX = width / 2
      pointerY = height / 2
      buildLayers()
    }

    const step = () => {
      tick += 1
      const targetX = ((pointerX / Math.max(1, width)) - 0.5) * 2
      const targetY = ((pointerY / Math.max(1, height)) - 0.5) * 2
      parallaxX += (targetX - parallaxX) * 0.04
      parallaxY += (targetY - parallaxY) * 0.04

      ctx.clearRect(0, 0, width, height)

      for (const layer of layers) {
        const offsetX = parallaxX * 22 * layer.depth
        const offsetY = parallaxY * 18 * layer.depth
        const nodes = layer.nodes

        for (const node of nodes) {
          node.x += node.vx
          node.y += node.vy
          if (node.x < -20 || node.x > width + 20) node.vx *= -1
          if (node.y < -20 || node.y > height + 20) node.vy *= -1
        }

        for (let i = 0; i < nodes.length; i += 1) {
          const a = nodes[i]
          for (let j = i + 1; j < nodes.length; j += 1) {
            const b = nodes[j]
            const dx = a.x - b.x
            const dy = a.y - b.y
            const dist = Math.hypot(dx, dy)
            if (dist > layer.distance) continue
            const alpha = (1 - dist / layer.distance) * layer.alpha
            ctx.strokeStyle = `rgba(225, 232, 244, ${alpha.toFixed(3)})`
            ctx.lineWidth = 0.8 + layer.depth * 0.25
            ctx.beginPath()
            ctx.moveTo(a.x + offsetX, a.y + offsetY)
            ctx.lineTo(b.x + offsetX, b.y + offsetY)
            ctx.stroke()
          }
        }

        for (const node of nodes) {
          const pulse = 0.32 + 0.22 * Math.sin((tick + node.x + node.y) * 0.018 * layer.depth)
          ctx.fillStyle = `rgba(245, 248, 255, ${pulse.toFixed(3)})`
          ctx.beginPath()
          ctx.arc(node.x + offsetX, node.y + offsetY, node.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      rafId = window.requestAnimationFrame(step)
    }

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
    }

    resize()
    step()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [])

  return <canvas id="network-bg" aria-hidden="true" />
}
