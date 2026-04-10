import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AU } from '../../utils/galaxy'

const A      = 17.83 * AU
const ECC    = 0.967
const B      = A * Math.sqrt(1 - ECC * ECC)
const PERIOD = 90   // seconds per in-game orbit

// Each sampled position spawns N_PER scattered particles → looks like a cloud
const N_FRAMES = 70   // frames of position history
const N_PER    = 10   // scattered cloud particles per frame
const N_TOTAL  = N_FRAMES * N_PER
const SPREAD   = 32   // cloud radius in world units

function solveKepler(M: number, e: number): number {
    let E = M
    for (let i = 0; i < 10; i++) E = M + e * Math.sin(E)
    return E
}

/** Soft radial-gradient sprite — bright blue core fading to transparent edge */
function makeSmokeTexture(): THREE.Texture {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width  = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const half = size / 2
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half)
    grad.addColorStop(0,    'rgba(180, 220, 255, 1.0)')
    grad.addColorStop(0.15, 'rgba(100, 170, 255, 0.85)')
    grad.addColorStop(0.40, 'rgba( 50, 110, 230, 0.45)')
    grad.addColorStop(0.70, 'rgba( 20,  60, 180, 0.15)')
    grad.addColorStop(1.0,  'rgba(  0,  30, 120, 0.0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
}

export const HalleysComet = () => {
    const cometRef = useRef<THREE.Group>(null)
    const smokeRef = useRef<THREE.Points>(null)

    const smokeBuf      = useMemo(() => new Float32Array(N_TOTAL * 3), [])
    const smokeWriteIdx = useRef(0)    // frame-slot index (wraps at N_FRAMES)
    const smokeCount    = useRef(0)    // filled particle count (up to N_TOTAL)

    // Soft sprite texture created once
    const smokeTexture = useMemo(() => makeSmokeTexture(), [])

    // Pre-computed stable scatter offsets in the XZ plane.
    // Using gaussian-ish distribution (sum of two randoms) so the cloud is
    // denser at center and fades naturally toward the edges.
    const scatter = useMemo(() => {
        const s = new Float32Array(N_TOTAL * 2)
        for (let i = 0; i < N_TOTAL; i++) {
            const angle = Math.random() * Math.PI * 2
            // Sum of two uniforms → tent distribution, more center-weighted than flat disc
            const r = (Math.random() + Math.random()) * 0.5
            s[i * 2]     = Math.cos(angle) * r
            s[i * 2 + 1] = Math.sin(angle) * r
        }
        return s
    }, [])

    const orbitLine = useMemo(() => {
        const pts: THREE.Vector3[] = []
        for (let i = 0; i <= 512; i++) {
            const E = (i / 512) * Math.PI * 2
            pts.push(new THREE.Vector3(A * (Math.cos(E) - ECC), 0, -B * Math.sin(E)))
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts)
        const mat = new THREE.LineBasicMaterial({ color: '#1a3388', opacity: 0.08, transparent: true })
        return new THREE.Line(geo, mat)
    }, [])

    const smokeGeo = useMemo(() => {
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(smokeBuf, 3))
        geo.setDrawRange(0, 0)
        return geo
    }, [smokeBuf])

    useFrame((state) => {
        const M  = ((state.clock.elapsedTime / PERIOD) * Math.PI * 2) % (Math.PI * 2)
        const E  = solveKepler(M, ECC)
        const cx = A * (Math.cos(E) - ECC)
        const cz = -B * Math.sin(E)    // retrograde

        if (cometRef.current) cometRef.current.position.set(cx, 0, cz)

        // Sample every other frame to keep trail length consistent across frame rates
        if (Math.round(state.clock.elapsedTime * 60) % 2 === 0) {
            const frameSlot = smokeWriteIdx.current % N_FRAMES
            const base      = frameSlot * N_PER

            for (let p = 0; p < N_PER; p++) {
                const idx = base + p
                smokeBuf[idx * 3]     = cx + scatter[idx * 2]     * SPREAD
                smokeBuf[idx * 3 + 1] = (Math.random() - 0.5) * SPREAD * 0.12   // very slight Y puff
                smokeBuf[idx * 3 + 2] = cz + scatter[idx * 2 + 1] * SPREAD
            }

            smokeWriteIdx.current++
            smokeCount.current = Math.min(smokeCount.current + N_PER, N_TOTAL)

            if (smokeRef.current) {
                smokeRef.current.geometry.attributes.position.needsUpdate = true
                smokeRef.current.geometry.setDrawRange(0, smokeCount.current)
            }
        }
    })

    return (
        <>
            <primitive object={orbitLine} />

            {/* Nucleus — small bright point, minimal coma */}
            <group ref={cometRef}>
                <mesh>
                    <sphereGeometry args={[2.8, 12, 12]} />
                    <meshStandardMaterial color="white" emissive="#c8e8ff" emissiveIntensity={6} />
                </mesh>
                {/* Barely-there coma — just a whisper of light, not a planet glow */}
                <mesh>
                    <sphereGeometry args={[7, 12, 12]} />
                    <meshBasicMaterial color="#aaccff" transparent opacity={0.07} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
                <pointLight color="#88ccff" intensity={0.9} distance={300} />
            </group>

            {/* Blue cloud smoke trail */}
            <points ref={smokeRef} geometry={smokeGeo}>
                <pointsMaterial
                    map={smokeTexture}
                    color="#3399ff"
                    size={22}
                    sizeAttenuation={true}
                    transparent
                    opacity={0.55}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    alphaTest={0.01}
                />
            </points>
        </>
    )
}
