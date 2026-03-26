import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import type { Exoplanet } from '../../types/NASA/Exoplanets'

// Convert star temperature to color (reuse same logic as StarField)
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

// Scale AU to scene units
const AU = 60

type OrbitingPlanetProps = {
    planet: Exoplanet
    index: number
}

const OrbitingPlanet = ({ planet, index }: OrbitingPlanetProps) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const orbitRadius = (planet.pl_orbsmax ?? (index + 1) * 0.5) * AU
    const planetSize = Math.min(Math.max((planet.pl_rade ?? 1) * 0.4, 0.5), 6)
    const speed = 1 / ((planet.pl_orbsmax ?? (index + 1) * 0.5) * 10) // outer planets slower
    const offset = (index / 8) * Math.PI * 2 // spread planets so they don't start overlapping

    useFrame(({ clock }) => {
        if (meshRef.current) {
            const t = clock.getElapsedTime() * speed + offset
            meshRef.current.position.x = Math.cos(t) * orbitRadius
            meshRef.current.position.z = Math.sin(t) * orbitRadius
        }
    })

    return (
        <>
            {/* Orbit ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[orbitRadius - 0.2, orbitRadius + 0.2, 128]} />
                <meshBasicMaterial color="white" opacity={0.08} transparent side={THREE.DoubleSide} />
            </mesh>

            {/* Planet */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[planetSize, 16, 16]} />
                <meshStandardMaterial color="#4a9eff" roughness={0.8} />
            </mesh>
        </>
    )
}

type SystemSceneProps = {
    planets: Exoplanet[]
}

const SystemScene = ({ planets }: SystemSceneProps) => {
    const star = planets[0]
    const starColor = tempToColor(star.st_teff)
    const starSize = Math.min(Math.max((star.st_rad ?? 1) * 2, 3), 20)

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 0]} intensity={3} distance={2000} color={starColor} />

            {/* Central star */}
            <mesh>
                <sphereGeometry args={[starSize, 32, 32]} />
                <meshStandardMaterial
                    color={starColor}
                    emissive={starColor}
                    emissiveIntensity={1.5}
                />
            </mesh>

            {/* Planets */}
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

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, background: 'black' }}>
            <Canvas
                camera={{ position: [0, 200, 400], fov: 60, near: 0.1, far: 100000 }}
                style={{ width: '100%', height: '100%' }}
            >
                <SystemScene planets={planets} />
                <OrbitControls enableZoom={true} enableRotate={true} enablePan={true} />
            </Canvas>

            {/* Back button */}
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

            {/* System info */}
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
                minWidth: '200px',
            }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{hostname}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                    {planets.length} planet{planets.length > 1 ? 's' : ''}
                </div>
                {planets[0].st_teff && (
                    <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                        Temp: {planets[0].st_teff.toLocaleString()} K
                    </div>
                )}
                {planets[0].sy_dist && (
                    <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
                        Distance: {planets[0].sy_dist.toFixed(1)} pc
                    </div>
                )}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                    {planets.map(p => (
                        <div key={p.pl_name} style={{ marginBottom: '4px', color: 'rgba(255,255,255,0.8)' }}>
                            {p.pl_name}
                            <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '8px', fontSize: '11px' }}>
                                {p.pl_orbsmax ? `${p.pl_orbsmax} AU` : 'orbit unknown'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}