/**
 * AstrophageMigration — Project Hail Mary (Andy Weir)
 *
 * Three visual zones:
 *
 *  1. Arch stream   — organic wobbling migration path, NOT a clean pipe.
 *                     Each particle has its own lateral + vertical oscillation
 *                     so the swarm breathes like a living organism.
 *                     Near the Sun the arch blooms open (burst zone).
 *                     Near Venus the arch curls into a spiral vortex.
 *
 *  2. Sun corona    — astrophage swarming and feeding on the solar surface.
 *                     Particles pulse outward from the star and snap back,
 *                     covering the Sun in a living, breathing halo.
 *
 *  3. Venus vortex  — astrophage spiral around Venus in tilted orbits,
 *                     drawn by its CO₂ spectrum signature.
 *                     Orbital planes are distributed spherically so the
 *                     swarm surrounds Venus on all sides.
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── particle counts ───────────────────────────────────────────────────────────
const N_SV    = 70    // arch: Sun → Venus
const N_VS    = 70    // arch: Venus → Sun
const N_PEAK  = 25    // arch: volumetric glow at apex
const N_SUN   = 30    // Sun attachment halo
const N_VENUS = 35    // Venus consumption halo
const ARCH_N  = N_SV + N_VS + N_PEAK

// ── visual tuning ─────────────────────────────────────────────────────────────
const ARCH_H          = 0.5    // apex height as fraction of Venus orbital radius
const FLOW_SPEED      = 0.07   // arch flow speed (t-units / s, ~14 s transit)

// Global sway — the whole ribbon moves as one unit, like a river in a breeze.
// This is what makes it feel organic without destroying the line shape.
const SWAY_LAT_AMP    = 6      // global lateral sway amplitude
const SWAY_LAT_FREQ   = 0.30   // how fast the ribbon sways side to side
const SWAY_VERT_AMP   = 2.5    // global vertical sway amplitude
const SWAY_VERT_FREQ  = 0.18   // how fast the ribbon breathes vertically

// Per-particle micro-variation layered on top of the global sway.
// Kept small so individual particles read as part of the stream, not chaos.
const MICRO_LAT       = 4      // max additional lateral offset per particle
const MICRO_VERT      = 2      // max additional vertical offset per particle
// Slow oscillation frequencies — particles drift lazily, not jitter
const MICRO_FREQ_MIN  = 0.15
const MICRO_FREQ_MAX  = 0.45

const SUN_ZONE        = 0.14   // arch fraction where burst applies (t < this)
const SUN_BURST_R     = 10     // max radial spread near the Sun attachment point

const VENUS_ZONE      = 0.86   // arch fraction where vortex starts (t > this)
const VENUS_VORTEX_R  = 7      // max orbit radius of the Venus vortex

const VENUS_ORBIT_R0  = 3      // Venus halo inner orbit radius
const VENUS_ORBIT_R1  = 12     // Venus halo outer orbit radius

const SUN_R0          = 13     // Sun halo inner radius
const SUN_R1          = 20     // Sun halo outer radius

// ── soft sprite texture ───────────────────────────────────────────────────────
function makeSprite(stops: [number, string][]): THREE.Texture {
    const size = 128, half = size / 2
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')!
    const g = ctx.createRadialGradient(half, half, 0, half, half, half)
    stops.forEach(([pos, col]) => g.addColorStop(pos, col))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
}

// ── quadratic Bézier with P0 at origin ───────────────────────────────────────
// B(t) = 2(1-t)t · P1  +  t² · P2
function evalBez(
    p1x: number, p1y: number, p1z: number,
    p2x: number, p2y: number, p2z: number,
    t: number,
    out: Float32Array, off: number,
) {
    const mt = 1 - t, a = 2 * mt * t, b = t * t
    out[off]     = a * p1x + b * p2x
    out[off + 1] = a * p1y + b * p2y
    out[off + 2] = a * p1z + b * p2z
}

// ── component ─────────────────────────────────────────────────────────────────
type Props = {
    /** Live Venus position — mutated every frame by OrbitingPlanet */
    venusPositionRef: THREE.Vector3
}

export const AstrophageMigration = ({ venusPositionRef }: Props) => {
    const archRef  = useRef<THREE.Points>(null)
    const sunRef   = useRef<THREE.Points>(null)
    const venusRef = useRef<THREE.Points>(null)

    // ── pre-computed stable per-particle randomness ───────────────────────────
    // arch stream (SV + VS + PEAK)
    const arch = useMemo(() => {
        const rnd = (a: number, b: number) => a + Math.random() * (b - a)

        const phases = new Float32Array(ARCH_N)
        for (let i = 0; i < N_SV; i++)   phases[i]            = i / N_SV
        for (let i = 0; i < N_VS; i++)   phases[N_SV + i]     = i / N_VS
        for (let i = 0; i < N_PEAK; i++) phases[N_SV+N_VS+i]  = 0.28 + Math.random() * 0.44

        return {
            phases,
            // micro-variation frequencies — slow so oscillations feel like lazy drift
            wLatFreq:  Float32Array.from({ length: ARCH_N }, () => rnd(MICRO_FREQ_MIN, MICRO_FREQ_MAX)),
            wLatPhase: Float32Array.from({ length: ARCH_N }, () => rnd(0, Math.PI * 2)),
            wVertFreq: Float32Array.from({ length: ARCH_N }, () => rnd(MICRO_FREQ_MIN, MICRO_FREQ_MAX * 0.8)),
            wVertPhase:Float32Array.from({ length: ARCH_N }, () => rnd(0, Math.PI * 2)),
            // Sun burst: fixed radial scatter direction per particle
            burstAngle:Float32Array.from({ length: ARCH_N }, () => rnd(0, Math.PI * 2)),
            // Venus vortex: fixed phase offset for the orbit
            vortexPhase:Float32Array.from({ length: ARCH_N }, () => rnd(0, Math.PI * 2)),
            // peak cluster: small scatter so the glow knot reads as a point, not a cloud
            peakOff:   Float32Array.from({ length: N_PEAK * 3 }, () => (Math.random() - 0.5) * 2),
        }
    }, [])

    // Sun corona: emission direction + lifecycle timing
    const sun = useMemo(() => {
        const dirs = new Float32Array(N_SUN * 3)
        for (let i = 0; i < N_SUN; i++) {
            // Uniform random direction on sphere — astrophage live all over the Sun
            const u     = Math.random() * 2 - 1   // cos(polar angle)
            const theta = Math.random() * Math.PI * 2
            const sinP  = Math.sqrt(1 - u * u)
            // Compress Y a little so the swarm is denser near the equatorial plane
            dirs[i*3]     = sinP * Math.cos(theta)
            dirs[i*3 + 1] = u * 0.55
            dirs[i*3 + 2] = sinP * Math.sin(theta)
            // Renormalize after Y compression
            const len = Math.sqrt(dirs[i*3]**2 + dirs[i*3+1]**2 + dirs[i*3+2]**2)
            dirs[i*3] /= len; dirs[i*3+1] /= len; dirs[i*3+2] /= len
        }
        return {
            dirs,
            // Evenly staggered phases so there are always particles at every lifecycle stage
            phases: Float32Array.from({ length: N_SUN }, (_, i) => i / N_SUN),
            speeds: Float32Array.from({ length: N_SUN }, () => 0.18 + Math.random() * 0.32),
        }
    }, [])

    // Venus vortex: inclined orbits distributed spherically around Venus
    const venus = useMemo(() => {
        const rnd = (a: number, b: number) => a + Math.random() * (b - a)
        return {
            radii:  Float32Array.from({ length: N_VENUS }, () => rnd(VENUS_ORBIT_R0, VENUS_ORBIT_R1)),
            // Mix of prograde + retrograde orbits
            speeds: Float32Array.from({ length: N_VENUS }, () =>
                rnd(0.8, 2.6) * (Math.random() < 0.5 ? 1 : -1)
            ),
            phases: Float32Array.from({ length: N_VENUS }, () => rnd(0, Math.PI * 2)),
            incl:   Float32Array.from({ length: N_VENUS }, () => rnd(0, Math.PI)),
            raan:   Float32Array.from({ length: N_VENUS }, () => rnd(0, Math.PI * 2)),
        }
    }, [])

    // ── GPU buffers ───────────────────────────────────────────────────────────
    const archBuf  = useMemo(() => new Float32Array(ARCH_N  * 3), [])
    const sunBuf   = useMemo(() => new Float32Array(N_SUN   * 3), [])
    const venusBuf = useMemo(() => new Float32Array(N_VENUS * 3), [])

    // ── geometries ────────────────────────────────────────────────────────────
    const archGeo = useMemo(() => {
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(archBuf, 3))
        g.setDrawRange(0, 0); return g
    }, [archBuf])
    const sunGeo = useMemo(() => {
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(sunBuf, 3))
        g.setDrawRange(0, 0); return g
    }, [sunBuf])
    const venusGeo = useMemo(() => {
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(venusBuf, 3))
        g.setDrawRange(0, 0); return g
    }, [venusBuf])

    // ── textures ──────────────────────────────────────────────────────────────
    // Migration stream: deep neon purple
    const purpleSprite = useMemo(() => makeSprite([
        [0,    'rgba(255, 210, 255, 1.00)'],
        [0.10, 'rgba(215,  55, 255, 0.92)'],
        [0.36, 'rgba(145,   0, 215, 0.52)'],
        [0.65, 'rgba( 80,   0, 160, 0.18)'],
        [1.0,  'rgba( 25,   0,  65, 0.00)'],
    ]), [])

    // Sun corona + Venus vortex: warmer pink — energised, CO₂ glow
    const warmSprite = useMemo(() => makeSprite([
        [0,    'rgba(255, 245, 255, 1.00)'],
        [0.10, 'rgba(255, 145, 235, 0.90)'],
        [0.35, 'rgba(215,  70, 195, 0.55)'],
        [0.65, 'rgba(145,  25, 125, 0.20)'],
        [1.0,  'rgba( 60,   0,  55, 0.00)'],
    ]), [])

    // Scratch buffer — avoids per-frame alloc
    const tmp = useMemo(() => new Float32Array(3), [])

    useFrame((state) => {
        const vx = venusPositionRef.x
        const vy = venusPositionRef.y
        const vz = venusPositionRef.z
        if (vx === 0 && vz === 0) return

        const t0     = state.clock.elapsedTime
        const venusR = Math.sqrt(vx * vx + vz * vz)
        const archH  = venusR * ARCH_H

        // Bézier control point: midpoint between Sun and Venus, elevated
        const p1x = vx * 0.5
        const p1y = archH
        const p1z = vz * 0.5

        // Lateral wobble axis: perpendicular to Sun→Venus in the XZ plane
        const perpX =  -vz / venusR
        const perpZ =   vx / venusR

        // ── Global ribbon sway ────────────────────────────────────────────────
        // The entire arch sways as one piece — like a river in a slow breeze.
        // This is the key to the Petrova Line feel: the LINE moves, not chaos.
        const globalLat  = Math.sin(t0 * SWAY_LAT_FREQ)  * SWAY_LAT_AMP
        const globalVert = Math.cos(t0 * SWAY_VERT_FREQ) * SWAY_VERT_AMP

        // ── 1. Arch stream: SV + VS ───────────────────────────────────────────
        for (let i = 0; i < N_SV + N_VS; i++) {
            const isSV = i < N_SV
            const raw  = ((arch.phases[i] + t0 * FLOW_SPEED) % 1 + 1) % 1
            const t    = isSV ? raw : 1 - raw   // VS travels in reverse

            // Base Bézier position
            evalBez(p1x, p1y, p1z, vx, vy, vz, t, tmp, 0)

            // ── Wobble = global ribbon sway + small per-particle micro-variation ──
            // Envelope = 4t(1-t): zero at endpoints so endpoint effects read cleanly.
            const env      = 4 * t * (1 - t)
            const microLat = Math.sin(t0 * arch.wLatFreq[i]  + arch.wLatPhase[i])  * MICRO_LAT
            const microVert= Math.cos(t0 * arch.wVertFreq[i] + arch.wVertPhase[i]) * MICRO_VERT
            const lat  = (globalLat  + microLat)  * env
            const vert = (globalVert + microVert) * env

            let px = tmp[0] + perpX * lat
            let py = tmp[1] + vert
            let pz = tmp[2] + perpZ * lat

            // ── Sun attachment bloom (t ∈ 0 … SUN_ZONE) ─────────────────────
            // Particles fan slightly as they leave the solar surface, then
            // quickly tighten back into the ribbon — the line clearly originates
            // from the Sun without exploding into a cloud.
            if (t < SUN_ZONE) {
                const frac   = 1 - t / SUN_ZONE   // 1 at Sun, 0 at zone edge
                const burstR = SUN_BURST_R * frac * frac
                const ba     = arch.burstAngle[i]
                px += Math.cos(ba) * burstR
                pz += Math.sin(ba) * burstR
                py += frac * 5
            }

            // ── Venus convergence (t ∈ VENUS_ZONE … 1) ───────────────────────
            // Particles spiral inward as they arrive at Venus — the line clearly
            // terminates into the planet without blowing past it.
            if (t > VENUS_ZONE) {
                const frac    = (t - VENUS_ZONE) / (1 - VENUS_ZONE)   // 0 → 1
                const vortexR = VENUS_VORTEX_R * frac * frac
                const angle   = t0 * 2.6 + arch.vortexPhase[i]
                const tgtX    = vx + Math.cos(angle) * vortexR
                const tgtZ    = vz + Math.sin(angle) * vortexR
                const blend   = frac * 0.80
                px = px + (tgtX - px) * blend
                py = py + (vy   - py) * (frac * 0.45)
                pz = pz + (tgtZ - pz) * blend
            }

            archBuf[i * 3]     = px
            archBuf[i * 3 + 1] = py
            archBuf[i * 3 + 2] = pz
        }

        // ── Apex glow knot ────────────────────────────────────────────────────
        // Tight cluster at the arch peak — a visible bright node on the ribbon.
        for (let i = 0; i < N_PEAK; i++) {
            const bi    = N_SV + N_VS + i
            const pulse = ((arch.phases[bi] + t0 * FLOW_SPEED * 0.38) % 1 + 1) % 1
            evalBez(p1x, p1y, p1z, vx, vy, vz, pulse, tmp, 0)
            archBuf[bi * 3]     = tmp[0] + arch.peakOff[i*3]   * 10
            archBuf[bi * 3 + 1] = tmp[1] + arch.peakOff[i*3+1] * 8
            archBuf[bi * 3 + 2] = tmp[2] + arch.peakOff[i*3+2] * 10
        }

        const aPos = archRef.current?.geometry.attributes.position
        if (aPos) {
            aPos.needsUpdate = true
            archRef.current!.geometry.setDrawRange(0, ARCH_N)
        }

        // ── 2. Sun corona cloud ───────────────────────────────────────────────
        // Each particle has a pre-computed emission direction on the unit sphere.
        // Its lifecycle t_life (0 → 1) maps to a radius via sin so it pulses
        // smoothly outward from SUN_R0 and contracts back — continuous heartbeat.
        for (let i = 0; i < N_SUN; i++) {
            const tLife = ((sun.phases[i] + t0 * sun.speeds[i]) % 1 + 1) % 1
            // sin gives a smooth pulse: 0 at t=0 and t=1, max at t=0.5
            const r     = SUN_R0 + (SUN_R1 - SUN_R0) * Math.sin(tLife * Math.PI)

            const dx = sun.dirs[i*3]
            const dy = sun.dirs[i*3 + 1]
            const dz = sun.dirs[i*3 + 2]

            // Add a slow additional orbital drift so particles don't sit still
            const drift = Math.sin(t0 * 0.30 + i * 0.72) * 0.12
            const ex = dx + perpX * drift
            const ez = dz + perpZ * drift
            // Renorm is not strictly needed here (drift is small) but keeps it tidy
            const len = Math.sqrt(ex*ex + dy*dy + ez*ez)

            sunBuf[i * 3]     = (ex / len) * r
            sunBuf[i * 3 + 1] = (dy / len) * r
            sunBuf[i * 3 + 2] = (ez / len) * r
        }

        const sPos = sunRef.current?.geometry.attributes.position
        if (sPos) {
            sPos.needsUpdate = true
            sunRef.current!.geometry.setDrawRange(0, N_SUN)
        }

        // ── 3. Venus attachment halo ──────────────────────────────────────────
        // Tight swarm orbiting Venus — shows the CO₂ signature attracting astrophage.
        // Inclined orbits give it a 3-D spherical appearance rather than a flat disc.
        for (let i = 0; i < N_VENUS; i++) {
            const angle = t0 * venus.speeds[i] + venus.phases[i]
            const r = venus.radii[i] * (0.78 + 0.22 * Math.sin(t0 * 0.85 + venus.phases[i]))

            // Orbital position in the orbit plane (before inclination / RAAN rotation)
            const cosI = Math.cos(venus.incl[i])
            const sinI = Math.sin(venus.incl[i])
            const cosR = Math.cos(venus.raan[i])
            const sinR = Math.sin(venus.raan[i])

            // Standard inclined-orbit formula:
            //   x″ = r cos θ                (in-plane along ascending node)
            //   y″ = r sin θ sin i          (out-of-plane, scaled by inclination)
            //   z″ = −r sin θ cos i         (in-plane, perpendicular)
            const xO = Math.cos(angle) * r
            const yO = Math.sin(angle) * r * sinI
            const zO = -Math.sin(angle) * r * cosI

            // Rotate by RAAN around the Y axis to distribute orbital planes
            const rx = xO * cosR - zO * sinR
            const rz = xO * sinR + zO * cosR

            venusBuf[i * 3]     = vx + rx
            venusBuf[i * 3 + 1] = vy + yO
            venusBuf[i * 3 + 2] = vz + rz
        }

        const vPos = venusRef.current?.geometry.attributes.position
        if (vPos) {
            vPos.needsUpdate = true
            venusRef.current!.geometry.setDrawRange(0, N_VENUS)
        }
    })

    const sharedMat = {
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        alphaTest: 0.01,
    } as const

    return (
        <>
            {/* Organic arch migration stream */}
            <points ref={archRef} geometry={archGeo}>
                <pointsMaterial
                    {...sharedMat}
                    map={purpleSprite}
                    color="#cc44ff"
                    size={14}
                    opacity={0.80}
                />
            </points>

            {/* Sun corona — astrophage feeding on solar energy */}
            <points ref={sunRef} geometry={sunGeo}>
                <pointsMaterial
                    {...sharedMat}
                    map={warmSprite}
                    color="#ff99ff"
                    size={10}
                    opacity={0.60}
                />
            </points>

            {/* Venus consumption vortex — drawn by CO₂ spectrum signature */}
            <points ref={venusRef} geometry={venusGeo}>
                <pointsMaterial
                    {...sharedMat}
                    map={warmSprite}
                    color="#dd55ff"
                    size={11}
                    opacity={0.68}
                />
            </points>
        </>
    )
}
