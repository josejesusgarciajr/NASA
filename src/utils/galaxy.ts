// three
import * as THREE from 'three'

// nasa
import type { PlanetType } from '../types/NASA/Exoplanets'

export const AU = 60
export const MIN_ORBIT_GAP = 18

// ─── Star color by temperature ───────────────────────────────────────────────

export function tempToColor(teff: number | null): THREE.Color {
    if (!teff) return new THREE.Color(1, 1, 1)
    if (teff > 30000) return new THREE.Color(0.6, 0.7, 1.0)
    if (teff > 10000) return new THREE.Color(0.7, 0.8, 1.0)
    if (teff > 7500)  return new THREE.Color(1.0, 1.0, 1.0)
    if (teff > 6000)  return new THREE.Color(1.0, 1.0, 0.8)
    if (teff > 5200)  return new THREE.Color(1.0, 0.9, 0.6)
    if (teff > 3700)  return new THREE.Color(1.0, 0.6, 0.3)
    return new THREE.Color(1.0, 0.3, 0.1)
}

// ─── Star textures ────────────────────────────────────────────────────────────

export function makeGlowTexture(color: THREE.Color): THREE.Texture {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const cx = size / 2
    const gradient = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx)
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)
    gradient.addColorStop(0,    `rgba(${r},${g},${b},0.9)`)
    gradient.addColorStop(0.15, `rgba(${r},${g},${b},0.5)`)
    gradient.addColorStop(0.4,  `rgba(${r},${g},${b},0.15)`)
    gradient.addColorStop(0.7,  `rgba(${r},${g},${b},0.04)`)
    gradient.addColorStop(1,    `rgba(${r},${g},${b},0)`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
}

export function makeStarTexture(color: THREE.Color): THREE.Texture {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size * 2
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(0, 0, size * 2, size)

    const paintGranules = (count: number, maxR: number, minR: number, alpha: number) => {
        for (let i = 0; i < count; i++) {
            const x   = Math.random() * size * 2
            const y   = Math.random() * size
            const rad = minR + Math.random() * (maxR - minR)
            const bright = ctx.createRadialGradient(x, y, 0, x, y, rad)
            bright.addColorStop(0,   `rgba(255,240,190,${alpha * 1.8})`)
            bright.addColorStop(0.5, `rgba(255,215,130,${alpha})`)
            bright.addColorStop(1,   `rgba(0,0,0,0)`)
            ctx.fillStyle = bright
            ctx.beginPath()
            ctx.arc(x, y, rad, 0, Math.PI * 2)
            ctx.fill()
            const dark = ctx.createRadialGradient(x, y, rad * 0.6, x, y, rad * 1.6)
            dark.addColorStop(0,   `rgba(0,0,0,0)`)
            dark.addColorStop(0.5, `rgba(0,0,0,${alpha * 1.0})`)
            dark.addColorStop(1,   `rgba(0,0,0,0)`)
            ctx.fillStyle = dark
            ctx.beginPath()
            ctx.arc(x, y, rad * 1.6, 0, Math.PI * 2)
            ctx.fill()
        }
    }
    paintGranules(200, 32, 16, 0.10)
    paintGranules(150, 18, 9,  0.13)
    paintGranules(100, 10, 4,  0.15)

    for (let i = 0; i < 5; i++) {
        const x   = Math.random() * size * 2
        const y   = size * 0.2 + Math.random() * size * 0.6
        const rad = 10 + Math.random() * 16
        const umbra = ctx.createRadialGradient(x, y, 0, x, y, rad)
        umbra.addColorStop(0,   `rgba(0,0,0,0.45)`)
        umbra.addColorStop(0.6, `rgba(0,0,0,0.25)`)
        umbra.addColorStop(1,   `rgba(0,0,0,0)`)
        ctx.fillStyle = umbra
        ctx.beginPath()
        ctx.arc(x, y, rad, 0, Math.PI * 2)
        ctx.fill()
        const penumbra = ctx.createRadialGradient(x, y, rad * 0.4, x, y, rad * 2.5)
        penumbra.addColorStop(0,   `rgba(0,0,0,0.15)`)
        penumbra.addColorStop(1,   `rgba(0,0,0,0)`)
        ctx.fillStyle = penumbra
        ctx.beginPath()
        ctx.arc(x, y, rad * 2.5, 0, Math.PI * 2)
        ctx.fill()
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(1, 1)
    return tex
}

export function getPlanetType(rade: number | null): PlanetType {
    const r = rade ?? 1
    if (r > 10) return 'gas_giant'
    if (r > 4)  return 'ice_giant'
    if (r > 2)  return 'super_earth'
    return 'rocky'
}

export function planetConfig(type: PlanetType): {
    color: THREE.Color
    emissive: THREE.Color
    roughness: number
    hasRings: boolean
} {
    switch (type) {
        case 'gas_giant': return {
            color:     new THREE.Color(0.75, 0.58, 0.35),
            emissive:  new THREE.Color(0.02, 0.01, 0.00),
            roughness: 0.8,
            hasRings:  true,
        }
        case 'ice_giant': return {
            color:     new THREE.Color(0.0, 0.75, 0.88),
            emissive:  new THREE.Color(0.0, 0.03, 0.06),
            roughness: 0.55,
            hasRings:  true,
        }
        case 'super_earth': return {
            color:     new THREE.Color(0.25, 0.50, 0.80),
            // Low emissive — let the texture show, not glow over it
            emissive:  new THREE.Color(0.02, 0.04, 0.08),
            roughness: 0.80,
            hasRings:  false,
        }
        case 'rocky': return {
            color:     new THREE.Color(0.65, 0.45, 0.28),
            // Low emissive — same reason
            emissive:  new THREE.Color(0.04, 0.02, 0.01),
            roughness: 0.92,
            hasRings:  false,
        }
    }
}