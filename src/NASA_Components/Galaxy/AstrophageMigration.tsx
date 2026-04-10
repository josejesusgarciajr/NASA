/**
 * AstrophageMigration — Project Hail Mary (Andy Weir)
 *
 * Astrophage is a micro-organism that migrates between the Sun and Venus,
 * drawn by Venus's CO₂ spectrum signature.  This component renders a neon
 * purple arch along the live Sun→Venus path with two streams of particles
 * flowing in opposite directions to represent the round-trip migration.
 *
 * Only rendered in the Solar System view (/dome?system=Sun).
 */
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── constants ───────────────────────────────────────────────────────────────

// How many particles flow each direction
const N_SV      = 55   // Sun → Venus
const N_VS      = 55   // Venus → Sun
const N_GLOW    = 25   // extra volumetric glow near arch peak
const N_TOTAL   = N_SV + N_VS + N_GLOW

// Arch height as a fraction of Venus's current orbital radius
const ARCH_H = 0.5

// Flow speed — t-units per second (full transit ≈ 1/SPEED seconds)
const FLOW_SPEED = 0.07

// Neon purple from the Project Hail Mary movie (2026) aesthetic
const PURPLE_PRIMARY = '#cc44ff'

// ── soft sprite texture ──────────────────────────────────────────────────────

function makePurpleSpriteTexture(): THREE.Texture {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size; canvas.height = size
    const ctx  = canvas.getContext('2d')!
    const half = size / 2
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half)
    grad.addColorStop(0,    'rgba(255, 200, 255, 1.0)')
    grad.addColorStop(0.12, 'rgba(220,  80, 255, 0.9)')
    grad.addColorStop(0.35, 'rgba(160,   0, 220, 0.55)')
    grad.addColorStop(0.65, 'rgba(100,   0, 180, 0.20)')
    grad.addColorStop(1.0,  'rgba( 50,   0, 100, 0.0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
}

// ── bezier helper ────────────────────────────────────────────────────────────

// Quadratic bezier where P0 = origin (the Sun)
// B(t) = 2(1-t)t·P1 + t²·P2
function evalBezier(
    p1x: number, p1y: number, p1z: number,
    p2x: number, p2y: number, p2z: number,
    t: number,
    out: Float32Array, offset: number,
) {
    const mt = 1 - t
    const a  = 2 * mt * t
    const b  = t * t
    out[offset]     = a * p1x + b * p2x
    out[offset + 1] = a * p1y + b * p2y
    out[offset + 2] = a * p1z + b * p2z
}

// ── component ────────────────────────────────────────────────────────────────

type Props = {
    /** Live position of Venus — mutated every frame by OrbitingPlanet */
    venusPositionRef: THREE.Vector3
}

export const AstrophageMigration = ({ venusPositionRef }: Props) => {
    const pointsRef = useRef<THREE.Points>(null)
    const buf       = useMemo(() => new Float32Array(N_TOTAL * 3), [])

    // Stable per-particle phase offsets so individual particles are spread
    // evenly along the arch rather than all starting at t=0
    const phases = useMemo(() => {
        const p = new Float32Array(N_TOTAL)
        // SV stream: evenly spread 0→1
        for (let i = 0; i < N_SV; i++)   p[i]         = i / N_SV
        // VS stream: evenly spread 0→1 (we'll invert t when rendering)
        for (let i = 0; i < N_VS; i++)   p[N_SV + i]  = i / N_VS
        // Glow cluster: random 0.3→0.7 (near arch peak)
        for (let i = 0; i < N_GLOW; i++) p[N_SV + N_VS + i] = 0.30 + Math.random() * 0.40
        return p
    }, [])

    // Stable spread offsets for glow particles (small volumetric scatter)
    const glowSpread = useMemo(() => {
        const s = new Float32Array(N_GLOW * 3)
        for (let i = 0; i < N_GLOW; i++) {
            const angle = Math.random() * Math.PI * 2
            const r     = (Math.random() + Math.random()) * 0.5 * 18
            s[i * 3]     = Math.cos(angle) * r
            s[i * 3 + 1] = (Math.random() - 0.5) * 12
            s[i * 3 + 2] = Math.sin(angle) * r
        }
        return s
    }, [])

    const sprite = useMemo(() => makePurpleSpriteTexture(), [])

    const geo = useMemo(() => {
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(buf, 3))
        g.setDrawRange(0, 0)
        return g
    }, [buf])

    // Reusable scratch array for glow cluster position sampling (avoids per-frame alloc)
    const tmp = useMemo(() => new Float32Array(3), [])

    useFrame((state) => {
        const vx = venusPositionRef.x
        const vy = venusPositionRef.y
        const vz = venusPositionRef.z

        // Skip until Venus position is populated
        if (vx === 0 && vz === 0) return

        const venusR = Math.sqrt(vx * vx + vz * vz)
        const archH  = venusR * ARCH_H

        // Bezier control point — elevated midpoint between Sun and Venus
        const p1x = vx * 0.5
        const p1y = archH
        const p1z = vz * 0.5

        const t0 = state.clock.elapsedTime

        // ── Sun→Venus stream ─────────────────────────────────────────────
        for (let i = 0; i < N_SV; i++) {
            const t = ((phases[i] + t0 * FLOW_SPEED) % 1 + 1) % 1
            evalBezier(p1x, p1y, p1z, vx, vy, vz, t, buf, i * 3)
        }

        // ── Venus→Sun stream ─────────────────────────────────────────────
        for (let i = 0; i < N_VS; i++) {
            const tRaw = ((phases[N_SV + i] + t0 * FLOW_SPEED) % 1 + 1) % 1
            const t    = 1 - tRaw   // reverse direction
            evalBezier(p1x, p1y, p1z, vx, vy, vz, t, buf, (N_SV + i) * 3)
        }

        // ── Glow cluster near arch peak ──────────────────────────────────
        for (let i = 0; i < N_GLOW; i++) {
            const base       = N_SV + N_VS + i
            const phasePulse = ((phases[base] + t0 * FLOW_SPEED * 0.4) % 1 + 1) % 1
            evalBezier(p1x, p1y, p1z, vx, vy, vz, phasePulse, tmp, 0)
            buf[base * 3]     = tmp[0] + glowSpread[i * 3]
            buf[base * 3 + 1] = tmp[1] + glowSpread[i * 3 + 1]
            buf[base * 3 + 2] = tmp[2] + glowSpread[i * 3 + 2]
        }

        if (pointsRef.current) {
            pointsRef.current.geometry.attributes.position.needsUpdate = true
            pointsRef.current.geometry.setDrawRange(0, N_TOTAL)
        }
    })

    return (
        <points ref={pointsRef} geometry={geo}>
            <pointsMaterial
                map={sprite}
                color={PURPLE_PRIMARY}
                size={14}
                sizeAttenuation={true}
                transparent
                opacity={0.75}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                alphaTest={0.01}
            />
        </points>
    )
}
