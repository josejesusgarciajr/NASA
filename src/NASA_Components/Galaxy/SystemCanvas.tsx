import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import type { Exoplanet } from '../../types/NASA/Exoplanets'

function tempToColor(teff: number | null): THREE.Color {
    if (!teff) return new THREE.Color(1, 1, 1)
    if (teff > 30000) return new THREE.Color(0.6, 0.7, 1.0)
    if (teff > 10000) return new THREE.Color(0.7, 0.8, 1.0)
    if (teff > 7500)  return new THREE.Color(1.0, 1.0, 1.0)
    if (teff > 6000)  return new THREE.Color(1.0, 1.0, 0.8)
    if (teff > 5200)  return new THREE.Color(1.0, 0.9, 0.6)
    if (teff > 3700)  return new THREE.Color(1.0, 0.6, 0.3)
    return new THREE.Color(1.0, 0.3, 0.1)
}

function planetConfig(rade: number | null): {
    color: THREE.Color
    emissive: THREE.Color
    roughness: number
    hasRings: boolean
    ringColor: THREE.Color
} {
    const r = rade ?? 1
    if (r > 10) return {
        color: new THREE.Color(0.75, 0.58, 0.35),
        emissive: new THREE.Color(0.05, 0.03, 0.01),
        roughness: 0.8,
        hasRings: true,
        ringColor: new THREE.Color(0.65, 0.52, 0.32),
    }
    if (r > 4) return {
        color: new THREE.Color(0.45, 0.62, 0.82),
        emissive: new THREE.Color(0.01, 0.02, 0.06),
        roughness: 0.7,
        hasRings: true,
        ringColor: new THREE.Color(0.35, 0.48, 0.65),
    }
    if (r > 2) return {
        color: new THREE.Color(0.35, 0.55, 0.38),
        emissive: new THREE.Color(0.01, 0.03, 0.01),
        roughness: 0.9,
        hasRings: false,
        ringColor: new THREE.Color(0, 0, 0),
    }
    return {
        color: new THREE.Color(0.65, 0.48, 0.38),
        emissive: new THREE.Color(0.02, 0.01, 0.0),
        roughness: 0.95,
        hasRings: false,
        ringColor: new THREE.Color(0, 0, 0),
    }
}

const AU = 60

function makeGlowTexture(color: THREE.Color): THREE.Texture {
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

function makeStarTexture(color: THREE.Color): THREE.Texture {
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

            // Bright center — softer falloff
            const bright = ctx.createRadialGradient(x, y, 0, x, y, rad)
            bright.addColorStop(0,   `rgba(255,240,190,${alpha * 1.8})`)
            bright.addColorStop(0.5, `rgba(255,215,130,${alpha})`)
            bright.addColorStop(1,   `rgba(0,0,0,0)`)
            ctx.fillStyle = bright
            ctx.beginPath()
            ctx.arc(x, y, rad, 0, Math.PI * 2)
            ctx.fill()

            // Dark lane — wider and more gradual
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

    // Sunspots — softer, more faded
    for (let i = 0; i < 5; i++) {
        const x   = Math.random() * size * 2
        const y   = size * 0.2 + Math.random() * size * 0.6
        const rad = 10 + Math.random() * 16

        // Umbra — less opaque
        const umbra = ctx.createRadialGradient(x, y, 0, x, y, rad)
        umbra.addColorStop(0,   `rgba(0,0,0,0.45)`)
        umbra.addColorStop(0.6, `rgba(0,0,0,0.25)`)
        umbra.addColorStop(1,   `rgba(0,0,0,0)`)
        ctx.fillStyle = umbra
        ctx.beginPath()
        ctx.arc(x, y, rad, 0, Math.PI * 2)
        ctx.fill()

        // Penumbra — wider, very gentle fade
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

type StarGlowProps = { starSize: number; starColor: THREE.Color }

const StarGlow = ({ starSize, starColor }: StarGlowProps) => {
    const texture = useMemo(() => makeGlowTexture(starColor), [starColor])
    const spriteSize = starSize * 10

    return (
        <sprite scale={[spriteSize, spriteSize, 1]}>
            <spriteMaterial
                map={texture}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                transparent
            />
        </sprite>
    )
}

type StarMeshProps = { starSize: number; starColor: THREE.Color }

const StarMesh = ({ starSize, starColor }: StarMeshProps) => {
    const matRef = useRef<THREE.MeshStandardMaterial>(null)
    const starTexture = useMemo(() => makeStarTexture(starColor), [starColor])

    useFrame(({ clock }) => {
        if (matRef.current) {
            const offset = (clock.getElapsedTime() * 0.004) % 1
            starTexture.offset.x = offset
        }
    })

    return (
        <mesh>
            <sphereGeometry args={[starSize, 64, 64]} />
            <meshStandardMaterial
                ref={matRef}
                map={starTexture}
                emissive={starColor}
                emissiveIntensity={1.8}
                emissiveMap={starTexture}
                roughness={0.5}
                metalness={0}
            />
        </mesh>
    )
}

type OrbitRingProps = { orbitRadius: number }

const OrbitRing = ({ orbitRadius }: OrbitRingProps) => {
    const line = useMemo(() => {
        const points: THREE.Vector3[] = []
        const segments = 128
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2
            points.push(new THREE.Vector3(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius))
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const material = new THREE.LineBasicMaterial({ color: 'white', opacity: 0.1, transparent: true })
        return new THREE.Line(geometry, material)
    }, [orbitRadius])

    return <primitive object={line} />
}

type PlanetRingsProps = { planetSize: number; ringColor: THREE.Color }

const PlanetRings = ({ planetSize, ringColor }: PlanetRingsProps) => {
    const geometry = useMemo(() => {
        const geo = new THREE.RingGeometry(planetSize * 1.4, planetSize * 2.4, 64)
        const pos = geo.attributes.position
        const uv = geo.attributes.uv
        const v3 = new THREE.Vector3()
        const inner = planetSize * 1.4
        const outer = planetSize * 2.4
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i)
            uv.setXY(i, (v3.length() - inner) / (outer - inner), 0)
        }
        return geo
    }, [planetSize])

    return (
        <mesh rotation={[-Math.PI / 2.5, 0.1, 0]} geometry={geometry}>
            <meshBasicMaterial
                color={ringColor}
                side={THREE.DoubleSide}
                transparent
                opacity={0.55}
            />
        </mesh>
    )
}

type OrbitingPlanetProps = {
    planet: Exoplanet
    index: number
    minOrbitRadius: number
}

const OrbitingPlanet = ({ planet, index, minOrbitRadius }: OrbitingPlanetProps) => {
    const groupRef = useRef<THREE.Group>(null)

    const rawOrbit = (planet.pl_orbsmax ?? (index + 1) * 0.5) * AU
    const orbitRadius = Math.max(rawOrbit, minOrbitRadius)
    const planetSize = Math.min(Math.max((planet.pl_rade ?? 1) * 0.4, 0.8), 8)
    const speed = 0.3 / ((planet.pl_orbsmax ?? (index + 1) * 0.5) * 5)
    const offset = (index / 8) * Math.PI * 2
    const cfg = planetConfig(planet.pl_rade)

    useFrame(({ clock }) => {
        if (groupRef.current) {
            const t = clock.getElapsedTime() * speed + offset
            groupRef.current.position.x = Math.cos(t) * orbitRadius
            groupRef.current.position.z = Math.sin(t) * orbitRadius
        }
    })

    return (
        <>
            <OrbitRing orbitRadius={orbitRadius} />
            <group ref={groupRef}>
                <mesh>
                    <sphereGeometry args={[planetSize, 48, 48]} />
                    <meshStandardMaterial
                        color={cfg.color}
                        emissive={cfg.emissive}
                        emissiveIntensity={1}
                        roughness={cfg.roughness}
                        metalness={0.05}
                    />
                </mesh>
                {cfg.hasRings && <PlanetRings planetSize={planetSize} ringColor={cfg.ringColor} />}
            </group>
        </>
    )
}

type SystemSceneProps = { planets: Exoplanet[] }

const SystemScene = ({ planets }: SystemSceneProps) => {
    const star = planets[0]
    const starColor = tempToColor(star.st_teff)
    const starSize = Math.min(Math.max((star.st_rad ?? 1) * 2, 4), 25)
    const minOrbitRadius = starSize + 8 + 10

    return (
        <>
            <pointLight position={[0, 0, 0]} intensity={2} distance={8000} color={starColor} />
            <ambientLight intensity={0.04} />
            <StarGlow starSize={starSize} starColor={starColor} />
            <StarMesh starSize={starSize} starColor={starColor} />
            {planets.map((planet, i) => (
                <OrbitingPlanet
                    key={planet.pl_name}
                    planet={planet}
                    index={i}
                    minOrbitRadius={minOrbitRadius}
                />
            ))}
        </>
    )
}

type SystemCanvasProps = {
    hostname: string
    planets: Exoplanet[]
}

export const SystemCanvas = ({ hostname, planets }: SystemCanvasProps) => {
    const navigate = useNavigate()

    const maxOrbit = Math.max(...planets.map(p => (p.pl_orbsmax ?? 0.5))) * AU
    const camDist = Math.max(maxOrbit * 2.5, 80)

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, background: 'black' }}>
            <Canvas
                camera={{ position: [0, camDist * 0.6, camDist], fov: 60, near: 0.1, far: 100000 }}
                style={{ width: '100%', height: '100%' }}
            >
                <SystemScene planets={planets} />
                <OrbitControls enableZoom={true} enableRotate={true} enablePan={true} />
            </Canvas>

            <div
                onClick={() => navigate('/dome')}
                style={{
                    position: 'fixed',
                    top: '80px',
                    left: '20px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '14px',
                    zIndex: 1000,
                }}
            >
                ← Back to Galaxy
            </div>

            <div style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '13px',
                zIndex: 1000,
                minWidth: '220px',
            }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{hostname}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '1px', marginBottom: '8px' }}>STAR</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Temp</span>
                    <span>{planets[0].st_teff ? `${planets[0].st_teff.toLocaleString()} K` : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Radius</span>
                    <span>{planets[0].st_rad ? `${planets[0].st_rad} R☉` : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Distance</span>
                    <span>{planets[0].sy_dist ? `${planets[0].sy_dist.toFixed(1)} pc` : '—'}</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '1px', marginBottom: '8px' }}>
                    PLANETS
                </div>
                {planets.map(p => (
                    <div key={p.pl_name} style={{ marginBottom: '6px' }}>
                        <div style={{ color: 'white' }}>{p.pl_name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                            {p.pl_orbsmax ? `${p.pl_orbsmax} AU orbit` : 'orbit unknown'}
                            {p.pl_rade ? ` · ${p.pl_rade} R⊕` : ''}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}