import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import type { Exoplanet } from '../../types/NASA/Exoplanets'

// ─── Star color by temperature ───────────────────────────────────────────────

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

// ─── Planet textures ──────────────────────────────────────────────────────────

function makeIceGiantTexture(): THREE.Texture {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    // Deep teal base
    const base = ctx.createLinearGradient(0, 0, 0, size)
    base.addColorStop(0,   '#0a2a3a')
    base.addColorStop(0.2, '#0d4a6a')
    base.addColorStop(0.5, '#0e6680')
    base.addColorStop(0.8, '#0d4a6a')
    base.addColorStop(1,   '#0a2a3a')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size, size)

    // Bright cyan atmospheric bands
    const bands = [
        { y: 0.06, h: 0.025, color: 'rgba(0,220,240,0.30)' },
        { y: 0.14, h: 0.040, color: 'rgba(0,200,230,0.22)' },
        { y: 0.22, h: 0.020, color: 'rgba(20,230,250,0.35)' },
        { y: 0.32, h: 0.055, color: 'rgba(0,185,215,0.20)' },
        { y: 0.42, h: 0.030, color: 'rgba(10,220,245,0.28)' },
        { y: 0.50, h: 0.045, color: 'rgba(0,200,230,0.25)' },
        { y: 0.60, h: 0.025, color: 'rgba(20,225,248,0.32)' },
        { y: 0.70, h: 0.050, color: 'rgba(0,190,220,0.22)' },
        { y: 0.80, h: 0.030, color: 'rgba(10,215,240,0.28)' },
        { y: 0.90, h: 0.040, color: 'rgba(0,200,228,0.20)' },
    ]

    for (const band of bands) {
        const y = band.y * size
        const h = band.h * size
        const grad = ctx.createLinearGradient(0, y - h, 0, y + h)
        grad.addColorStop(0,   'rgba(0,0,0,0)')
        grad.addColorStop(0.5, band.color)
        grad.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, y - h, size, h * 2)
    }

    // Dark separator lanes
    for (const by of [0.10, 0.19, 0.28, 0.38, 0.47, 0.56, 0.65, 0.76, 0.86]) {
        const y = by * size
        const grad = ctx.createLinearGradient(0, y - 6, 0, y + 6)
        grad.addColorStop(0,   'rgba(0,0,0,0)')
        grad.addColorStop(0.5, 'rgba(0,0,0,0.25)')
        grad.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, y - 6, size, 12)
    }

    // Polar darkening
    const polar = ctx.createLinearGradient(0, 0, 0, size)
    polar.addColorStop(0,   'rgba(0,10,20,0.60)')
    polar.addColorStop(0.18,'rgba(0,0,0,0)')
    polar.addColorStop(0.82,'rgba(0,0,0,0)')
    polar.addColorStop(1,   'rgba(0,10,20,0.60)')
    ctx.fillStyle = polar
    ctx.fillRect(0, 0, size, size)

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
}

function makeGasGiantTexture(): THREE.Texture {
    // TODO: add Jupiter/Saturn-style banding texture
    // Placeholder — returns null so the material falls back to color
    return null as unknown as THREE.Texture
}

function makeSuperEarthTexture(): THREE.Texture {
    // TODO: add rocky/oceanic texture
    return null as unknown as THREE.Texture
}

function makeRockyTexture(): THREE.Texture {
    // TODO: add cratered rocky texture
    return null as unknown as THREE.Texture
}

// ─── Planet ring textures ─────────────────────────────────────────────────────

function makeIceGiantRingTexture(): THREE.Texture {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = 1
    const ctx = canvas.getContext('2d')!

    // Multiple distinct ring bands like Uranus
    const grad = ctx.createLinearGradient(0, 0, size, 0)
    grad.addColorStop(0,    'rgba(0,0,0,0)')
    grad.addColorStop(0.05, 'rgba(80,200,220,0.15)')
    grad.addColorStop(0.10, 'rgba(0,0,0,0)')
    grad.addColorStop(0.18, 'rgba(60,180,210,0.35)')
    grad.addColorStop(0.22, 'rgba(100,220,240,0.55)')
    grad.addColorStop(0.26, 'rgba(60,180,210,0.35)')
    grad.addColorStop(0.30, 'rgba(0,0,0,0)')
    grad.addColorStop(0.40, 'rgba(40,160,200,0.20)')
    grad.addColorStop(0.46, 'rgba(80,200,230,0.45)')
    grad.addColorStop(0.50, 'rgba(120,230,250,0.65)')
    grad.addColorStop(0.54, 'rgba(80,200,230,0.45)')
    grad.addColorStop(0.58, 'rgba(40,160,200,0.20)')
    grad.addColorStop(0.65, 'rgba(0,0,0,0)')
    grad.addColorStop(0.72, 'rgba(50,170,205,0.30)')
    grad.addColorStop(0.76, 'rgba(90,210,235,0.50)')
    grad.addColorStop(0.80, 'rgba(50,170,205,0.30)')
    grad.addColorStop(0.86, 'rgba(0,0,0,0)')
    grad.addColorStop(0.92, 'rgba(40,150,190,0.18)')
    grad.addColorStop(0.96, 'rgba(0,0,0,0)')
    grad.addColorStop(1,    'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, 1)

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
}

function makeGasGiantRingTexture(): THREE.Texture {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = 1
    const ctx = canvas.getContext('2d')!

    const grad = ctx.createLinearGradient(0, 0, size, 0)
    grad.addColorStop(0,    'rgba(0,0,0,0)')
    grad.addColorStop(0.05, 'rgba(180,150,100,0.20)')
    grad.addColorStop(0.15, 'rgba(200,170,110,0.50)')
    grad.addColorStop(0.25, 'rgba(220,190,130,0.70)')
    grad.addColorStop(0.35, 'rgba(200,170,110,0.55)')
    grad.addColorStop(0.45, 'rgba(180,150,90,0.35)')
    grad.addColorStop(0.50, 'rgba(160,130,80,0.20)')
    grad.addColorStop(0.55, 'rgba(180,150,90,0.35)')
    grad.addColorStop(0.65, 'rgba(200,170,110,0.55)')
    grad.addColorStop(0.75, 'rgba(220,190,130,0.70)')
    grad.addColorStop(0.85, 'rgba(200,170,110,0.50)')
    grad.addColorStop(0.95, 'rgba(180,150,100,0.20)')
    grad.addColorStop(1,    'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, 1)

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
}

// ─── Planet config ────────────────────────────────────────────────────────────

type PlanetType = 'gas_giant' | 'ice_giant' | 'super_earth' | 'rocky'

function getPlanetType(rade: number | null): PlanetType {
    const r = rade ?? 1
    if (r > 10) return 'gas_giant'
    if (r > 4)  return 'ice_giant'
    if (r > 2)  return 'super_earth'
    return 'rocky'
}

function planetConfig(type: PlanetType): {
    color: THREE.Color
    emissive: THREE.Color
    roughness: number
    hasRings: boolean
} {
    switch (type) {
        case 'gas_giant': return {
            color:    new THREE.Color(0.75, 0.58, 0.35),
            emissive: new THREE.Color(0.05, 0.03, 0.01),
            roughness: 0.8,
            hasRings: true,
        }
        case 'ice_giant': return {
            color:    new THREE.Color(0.0, 0.72, 0.85),
            emissive: new THREE.Color(0.0, 0.05, 0.10),
            roughness: 0.6,
            hasRings: true,
        }
        case 'super_earth': return {
            color:    new THREE.Color(0.35, 0.55, 0.38),
            emissive: new THREE.Color(0.01, 0.03, 0.01),
            roughness: 0.9,
            hasRings: false,
        }
        case 'rocky': return {
            color:    new THREE.Color(0.65, 0.48, 0.38),
            emissive: new THREE.Color(0.02, 0.01, 0.0),
            roughness: 0.95,
            hasRings: false,
        }
    }
}

// ─── Star textures ────────────────────────────────────────────────────────────

const AU = 60
const MIN_ORBIT_GAP = 18

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

// ─── Star components ──────────────────────────────────────────────────────────

type StarGlowProps = { starSize: number; starColor: THREE.Color }

const StarGlow = ({ starSize, starColor }: StarGlowProps) => {
    const texture = useMemo(() => makeGlowTexture(starColor), [starColor])
    return (
        <sprite scale={[starSize * 10, starSize * 10, 1]}>
            <spriteMaterial map={texture} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
        </sprite>
    )
}

type StarMeshProps = { starSize: number; starColor: THREE.Color }

const StarMesh = ({ starSize, starColor }: StarMeshProps) => {
    const matRef = useRef<THREE.MeshStandardMaterial>(null)
    const starTexture = useMemo(() => makeStarTexture(starColor), [starColor])

    useFrame(({ clock }) => {
        if (matRef.current) {
            starTexture.offset.x = (clock.getElapsedTime() * 0.004) % 1
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

// ─── Orbit ring ───────────────────────────────────────────────────────────────

type OrbitRingProps = { orbitRadius: number }

const OrbitRing = ({ orbitRadius }: OrbitRingProps) => {
    const line = useMemo(() => {
        const points: THREE.Vector3[] = []
        for (let i = 0; i <= 128; i++) {
            const angle = (i / 128) * Math.PI * 2
            points.push(new THREE.Vector3(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius))
        }
        const geo = new THREE.BufferGeometry().setFromPoints(points)
        const mat = new THREE.LineBasicMaterial({ color: 'white', opacity: 0.1, transparent: true })
        return new THREE.Line(geo, mat)
    }, [orbitRadius])
    return <primitive object={line} />
}

// ─── Planet rings ─────────────────────────────────────────────────────────────

type PlanetRingsProps = { planetSize: number; type: PlanetType }

const PlanetRings = ({ planetSize, type }: PlanetRingsProps) => {
    const { innerMult, outerMult, tilt, ringTexture } = useMemo(() => {
        if (type === 'ice_giant') return {
            innerMult: 1.3,
            outerMult: 2.8,
            tilt: -Math.PI / 2.2,   // more edge-on like Uranus
            ringTexture: makeIceGiantRingTexture(),
        }
        // gas giant
        return {
            innerMult: 1.4,
            outerMult: 2.4,
            tilt: -Math.PI / 2.5,
            ringTexture: makeGasGiantRingTexture(),
        }
    }, [type])

    const geometry = useMemo(() => {
        const geo = new THREE.RingGeometry(planetSize * innerMult, planetSize * outerMult, 128)
        const pos = geo.attributes.position
        const uv  = geo.attributes.uv
        const v3  = new THREE.Vector3()
        const inner = planetSize * innerMult
        const outer = planetSize * outerMult
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i)
            uv.setXY(i, (v3.length() - inner) / (outer - inner), 0.5)
        }
        return geo
    }, [planetSize, innerMult, outerMult])

    return (
        <mesh rotation={[tilt, 0, 0.15]} geometry={geometry}>
            <meshBasicMaterial
                map={ringTexture}
                side={THREE.DoubleSide}
                transparent
                depthWrite={false}
            />
        </mesh>
    )
}

// ─── Orbiting planet ──────────────────────────────────────────────────────────

type OrbitingPlanetProps = {
    planet: Exoplanet
    index: number
    orbitRadius: number
}

const OrbitingPlanet = ({ planet, index, orbitRadius }: OrbitingPlanetProps) => {
    const groupRef  = useRef<THREE.Group>(null)
    const type      = getPlanetType(planet.pl_rade)
    const cfg       = planetConfig(type)
    const planetSize = Math.min(Math.max((planet.pl_rade ?? 1) * 0.4, 0.8), 8)
    const speed     = 0.3 / ((planet.pl_orbsmax ?? (index + 1) * 0.5) * 5)
    const offset    = (index / 8) * Math.PI * 2

    const surfaceTexture = useMemo(() => {
        switch (type) {
            case 'ice_giant':   return makeIceGiantTexture()
            case 'gas_giant':   return makeGasGiantTexture()
            case 'super_earth': return makeSuperEarthTexture()
            case 'rocky':       return makeRockyTexture()
        }
    }, [type])

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
                        map={surfaceTexture ?? undefined}
                        emissive={cfg.emissive}
                        emissiveIntensity={1}
                        roughness={cfg.roughness}
                        metalness={0.05}
                    />
                </mesh>
                {cfg.hasRings && <PlanetRings planetSize={planetSize} type={type} />}
            </group>
        </>
    )
}

// ─── System scene ─────────────────────────────────────────────────────────────

type SystemSceneProps = { planets: Exoplanet[] }

const SystemScene = ({ planets }: SystemSceneProps) => {
    const star      = planets[0]
    const starColor = tempToColor(star.st_teff)
    const starSize  = Math.min(Math.max((star.st_rad ?? 1) * 2, 4), 25)

    const orbitRadii = useMemo(() => {
        const radii: number[] = []
        const starClearance = starSize + 18
        planets.forEach((planet, i) => {
            const raw = (planet.pl_orbsmax ?? (i + 1) * 0.5) * AU
            let r = Math.max(raw, starClearance)
            if (i > 0) r = Math.max(r, radii[i - 1] + MIN_ORBIT_GAP)
            radii.push(r)
        })
        return radii
    }, [planets, starSize])

    return (
        <>
            <pointLight position={[0, 0, 0]} intensity={2} distance={8000} color={starColor} />
            <ambientLight intensity={0.04} />
            <StarGlow starSize={starSize} starColor={starColor} />
            <StarMesh starSize={starSize} starColor={starColor} />
            {planets.map((planet, i) => (
                <OrbitingPlanet key={planet.pl_name} planet={planet} index={i} orbitRadius={orbitRadii[i]} />
            ))}
        </>
    )
}

// ─── Main canvas export ───────────────────────────────────────────────────────

type SystemCanvasProps = {
    hostname: string
    planets: Exoplanet[]
}

export const SystemCanvas = ({ hostname, planets }: SystemCanvasProps) => {
    const navigate = useNavigate()
    const maxOrbit = Math.max(...planets.map(p => (p.pl_orbsmax ?? 0.5))) * AU
    const camDist  = Math.max(maxOrbit * 2.5, 80)

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, background: 'black' }}>
            <Canvas
                camera={{ position: [0, camDist * 0.6, camDist], fov: 60, near: 0.1, far: 100000 }}
                style={{ width: '100%', height: '100%' }}
            >
                <SystemScene planets={planets} />
                <OrbitControls enableZoom enableRotate enablePan />
            </Canvas>

            <div
                onClick={() => navigate('/dome')}
                style={{
                    position: 'fixed', top: '80px', left: '20px',
                    background: 'rgba(0,0,0,0.7)', color: 'white',
                    padding: '8px 16px', borderRadius: '4px', cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.2)', fontSize: '14px', zIndex: 1000,
                }}
            >
                ← Back to Galaxy
            </div>

            <div style={{
                position: 'fixed', top: '80px', right: '20px',
                background: 'rgba(0,0,0,0.7)', color: 'white',
                padding: '12px 16px', borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '13px', zIndex: 1000, minWidth: '220px',
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
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '1px', marginBottom: '8px' }}>PLANETS</div>
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