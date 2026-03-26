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

function planetConfig(rade: number | null): { color: THREE.Color; emissive: THREE.Color; roughness: number; hasRings: boolean; ringColor: THREE.Color } {
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

type OrbitRingProps = { orbitRadius: number }

const OrbitRing = ({ orbitRadius }: OrbitRingProps) => {
    const line = useMemo(() => {
        const points = []
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
    const ringRef = useRef<THREE.Mesh>(null)

    const geometry = useMemo(() => {
        return new THREE.RingGeometry(planetSize * 1.4, planetSize * 2.4, 64)
    }, [planetSize])

    // Fix UV mapping for RingGeometry so texture looks correct
    useMemo(() => {
        const pos = geometry.attributes.position
        const uv = geometry.attributes.uv
        const v3 = new THREE.Vector3()
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i)
            uv.setXY(i, v3.length() / (planetSize * 2.4), 0)
        }
    }, [geometry, planetSize])

    return (
        <mesh ref={ringRef} rotation={[-Math.PI / 2.5, 0.1, 0]} geometry={geometry}>
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
}

const OrbitingPlanet = ({ planet, index }: OrbitingPlanetProps) => {
    const groupRef = useRef<THREE.Group>(null)
    const orbitRadius = (planet.pl_orbsmax ?? (index + 1) * 0.5) * AU
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

    return (
        <>
            <pointLight position={[0, 0, 0]} intensity={2} distance={8000} color={starColor} />
            <ambientLight intensity={0.04} />

            {/* Outer diffuse corona */}
            <mesh>
                <sphereGeometry args={[starSize * 1.6, 32, 32]} />
                <meshBasicMaterial
                    color={starColor}
                    opacity={0.06}
                    transparent
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Mid glow */}
            <mesh>
                <sphereGeometry args={[starSize * 1.3, 32, 32]} />
                <meshBasicMaterial
                    color={starColor}
                    opacity={0.18}
                    transparent
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Star surface */}
            <mesh>
                <sphereGeometry args={[starSize, 48, 48]} />
                <meshStandardMaterial
                    color={starColor}
                    emissive={starColor}
                    emissiveIntensity={2.5}
                    roughness={0.35}
                    metalness={0}
                />
            </mesh>

            {planets.map((planet, i) => (
                <OrbitingPlanet key={planet.pl_name} planet={planet} index={i} />
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