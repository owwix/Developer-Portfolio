'use client'

import { useEffect, useRef } from 'react'

type LatticeNode = {
  baseX: number
  baseY: number
  x: number
  y: number
  emphasis: boolean
}

type LatticeEdge = {
  from: number
  to: number
}

type SignalPulse = {
  edge: number
  startedAt: number
  duration: number
}

const GRID_SIZE = 64
const POINTER_RADIUS = 120
const MAX_POINTER_SHIFT = 4
const PULSE_INTERVAL = 4800

function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointer = window.matchMedia('(pointer: coarse)')
    let width = 0
    let height = 0
    let dpr = 1
    let rafId = 0
    let visible = true
    let lastPulseAt = performance.now()
    let scrollTarget = window.scrollY
    let scrollOffset = window.scrollY
    let nodes: LatticeNode[] = []
    let edges: LatticeEdge[] = []
    let pulses: SignalPulse[] = []
    const pointer = { x: -1000, y: -1000, active: false }

    const buildLattice = () => {
      const random = seededRandom(Math.round(width * 13 + height * 7))
      const mobile = coarsePointer.matches || width < 680
      const targetCount = mobile
        ? Math.max(16, Math.min(22, Math.round((width * height) / 17000)))
        : Math.max(36, Math.min(58, Math.round((width * height) / 27000)))
      const columns = Math.max(3, Math.floor(width / GRID_SIZE))
      const rows = Math.max(3, Math.floor(height / GRID_SIZE))
      const occupied = new Set<string>()

      nodes = []
      while (nodes.length < targetCount && occupied.size < columns * rows) {
        const column = Math.floor(random() * columns)
        const row = Math.floor(random() * rows)
        const key = `${column}:${row}`
        if (occupied.has(key)) continue
        occupied.add(key)

        const baseX = column * GRID_SIZE + GRID_SIZE * 0.5
        const baseY = row * GRID_SIZE + GRID_SIZE * 0.5
        nodes.push({
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          emphasis: random() > 0.86,
        })
      }

      edges = []
      const maxDistance = mobile ? 132 : 148
      const connections = new Array(nodes.length).fill(0)
      for (let i = 0; i < nodes.length; i += 1) {
        const candidates: Array<{ index: number; distance: number }> = []
        for (let j = i + 1; j < nodes.length; j += 1) {
          const distance = Math.hypot(nodes[j].baseX - nodes[i].baseX, nodes[j].baseY - nodes[i].baseY)
          if (distance <= maxDistance) candidates.push({ index: j, distance })
        }
        candidates.sort((a, b) => a.distance - b.distance)
        for (const candidate of candidates.slice(0, 2)) {
          if (connections[i] >= 3 || connections[candidate.index] >= 3) continue
          edges.push({ from: i, to: candidate.index })
          connections[i] += 1
          connections[candidate.index] += 1
        }
      }
      pulses = []
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildLattice()
    }

    const updateNodePositions = () => {
      scrollOffset += (scrollTarget - scrollOffset) * 0.08
      const parallaxY = -(scrollOffset % GRID_SIZE) * 0.15

      for (const node of nodes) {
        let targetX = node.baseX
        let targetY = node.baseY + parallaxY
        if (pointer.active && !coarsePointer.matches && !reducedMotion.matches) {
          const dx = targetX - pointer.x
          const dy = targetY - pointer.y
          const distance = Math.hypot(dx, dy)
          if (distance > 0 && distance < POINTER_RADIUS) {
            const force = (1 - distance / POINTER_RADIUS) * MAX_POINTER_SHIFT
            targetX += (dx / distance) * force
            targetY += (dy / distance) * force
          }
        }
        node.x += (targetX - node.x) * 0.12
        node.y += (targetY - node.y) * 0.12
      }
    }

    const draw = (now: number) => {
      ctx.fillStyle = '#070908'
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = 'rgba(241, 242, 237, 0.025)'
      ctx.lineWidth = 1
      const gridOffset = -(scrollOffset % GRID_SIZE) * 0.15
      for (let x = GRID_SIZE / 2; x < width; x += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = gridOffset + GRID_SIZE / 2; y < height; y += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      updateNodePositions()

      for (const edge of edges) {
        const from = nodes[edge.from]
        const to = nodes[edge.to]
        const pointerDistance = Math.min(
          Math.hypot(from.x - pointer.x, from.y - pointer.y),
          Math.hypot(to.x - pointer.x, to.y - pointer.y),
        )
        const nearby = pointer.active && pointerDistance < POINTER_RADIUS
        ctx.strokeStyle = nearby ? 'rgba(155, 211, 111, 0.16)' : 'rgba(241, 242, 237, 0.055)'
        ctx.lineWidth = nearby ? 1 : 0.75
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      }

      for (const node of nodes) {
        const size = node.emphasis ? 3 : 2
        ctx.fillStyle = node.emphasis ? 'rgba(155, 211, 111, 0.25)' : 'rgba(241, 242, 237, 0.15)'
        ctx.fillRect(Math.round(node.x - size / 2), Math.round(node.y - size / 2), size, size)
      }

      if (!reducedMotion.matches && now - lastPulseAt >= (coarsePointer.matches ? PULSE_INTERVAL * 2 : PULSE_INTERVAL)) {
        if (edges.length) {
          const edge = Math.floor(seededRandom(Math.round(now))() * edges.length)
          pulses.push({ edge, startedAt: now, duration: 1200 })
        }
        lastPulseAt = now
      }

      pulses = pulses.filter((pulse) => {
        const progress = (now - pulse.startedAt) / pulse.duration
        if (progress >= 1) return false
        const edge = edges[pulse.edge]
        if (!edge) return false
        const from = nodes[edge.from]
        const to = nodes[edge.to]
        const eased = progress * progress * (3 - 2 * progress)
        const x = from.x + (to.x - from.x) * eased
        const y = from.y + (to.y - from.y) * eased
        const opacity = Math.sin(progress * Math.PI) * 0.38
        ctx.fillStyle = `rgba(155, 211, 111, ${opacity.toFixed(3)})`
        ctx.fillRect(Math.round(x - 1.5), Math.round(y - 1.5), 3, 3)
        return true
      })
    }

    const frame = (now: number) => {
      if (!visible) return
      draw(now)
      if (!reducedMotion.matches) rafId = window.requestAnimationFrame(frame)
    }

    const restart = () => {
      window.cancelAnimationFrame(rafId)
      if (visible) {
        if (reducedMotion.matches) draw(performance.now())
        else rafId = window.requestAnimationFrame(frame)
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
    }
    const onPointerLeave = () => {
      pointer.active = false
    }
    const onScroll = () => {
      if (reducedMotion.matches) return
      scrollTarget = window.scrollY
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      restart()
    })

    resize()
    observer.observe(canvas)
    restart()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
    if (!coarsePointer.matches) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', onPointerLeave)
    }
    reducedMotion.addEventListener('change', restart)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      reducedMotion.removeEventListener('change', restart)
    }
  }, [])

  return <canvas ref={canvasRef} id="network-bg" aria-hidden="true" />
}
