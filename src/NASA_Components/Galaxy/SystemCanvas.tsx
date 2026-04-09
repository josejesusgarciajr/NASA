// three
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React, { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

// nasa
import type { Exoplanet } from '../../types/NASA/Exoplanets'
import { SystemScene } from './SystemScene'
import { AU } from '../../utils/galaxy'
import { BackButton } from '../../components/BackButton'

type SystemCanvasProps = {
    hostname: string
    planets: Exoplanet[]
    onBack: () => void
}

// Smoothly follows a focused planet — camera stays behind it (from star's POV) so the star glows in the background
const PlanetFollowCamera = ({
    focusedIndex,
    positionRefs,
    orbitRadius,
    planetSize,
}: {
    focusedIndex: number | null
    positionRefs: React.MutableRefObject<THREE.Vector3[]>
    orbitRadius: number
    planetSize: number
}) => {
    const { camera } = useThree()
    const _tmpLookAt = useRef(new THREE.Vector3())

    useFrame(() => {
        if (focusedIndex === null) return
        const planetPos = positionRefs.current[focusedIndex]
        if (!planetPos || planetPos.lengthSq() < 0.001) return

        // Direction from star (origin) → planet
        const starToPlanet = planetPos.clone().normalize()
        // Keep camera far enough that the planet never fills the view — planet-size-aware
        const followDist = Math.max(orbitRadius * 0.5, planetSize * 8)

        // Place camera behind the planet (further from star) and elevated
        const targetCamPos = planetPos.clone()
            .add(starToPlanet.clone().multiplyScalar(followDist))
            .add(new THREE.Vector3(0, followDist * 0.35, 0))

        camera.position.lerp(targetCamPos, 0.04)

        // Look 30% toward the star so the planet is framed with the star visible behind it
        _tmpLookAt.current.copy(planetPos).lerp(new THREE.Vector3(0, 0, 0), 0.30)
        camera.lookAt(_tmpLookAt.current)
    })
    return null
}

// Zooms the system-view camera out from its starting position when active
const SystemZoomOuter = ({ active }: { active: boolean }) => {
    const { camera } = useThree()
    const startPosRef = useRef<THREE.Vector3 | null>(null)
    const startTimeRef = useRef<number | null>(null)
    const DURATION = 600 // ms — matches the overlay fade-to-black duration in DOME.tsx

    useFrame(() => {
        if (!active) return

        const now = performance.now()

        if (startTimeRef.current === null) {
            startTimeRef.current = now
            startPosRef.current = camera.position.clone()
        }

        const t = Math.min((now - startTimeRef.current) / DURATION, 1)
        const eased = t * t  // ease-in: starts slow, accelerates — mirrors the zoom-in feel

        // Scale the camera position away from the origin (the star system center)
        camera.position.copy(startPosRef.current!).multiplyScalar(1 + eased * 3)
    })
    return null
}

export const SystemCanvas = ({ hostname, planets, onBack }: SystemCanvasProps) => {
    const maxOrbit = Math.max(...planets.map(p => (p.pl_orbsmax ?? 0.5))) * AU
    const camDist  = Math.max(maxOrbit * 1.4, 70)
    const [zoomingOut, setZoomingOut] = useState(false)
    const [focusedPlanet, setFocusedPlanet] = useState<{ index: number; orbitRadius: number; planetSize: number } | null>(null)

    // One persistent Vector3 per planet — updated every frame by OrbitingPlanet
    const positionRefsArray = useMemo(
        () => planets.map(() => new THREE.Vector3()),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [planets.length]
    )
    const positionRefs = useRef(positionRefsArray)

    const handleBack = () => {
        setZoomingOut(true)
        onBack()  // triggers the overlay fade in DOME.tsx simultaneously
    }

    const handlePlanetClick = (index: number, orbitRadius: number, planetSize: number) => {
        if (zoomingOut) return
        setFocusedPlanet({ index, orbitRadius, planetSize })
    }

    const handleUnfocus = () => setFocusedPlanet(null)

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, background: 'black' }}>
            <Canvas
                camera={{ position: [0, camDist * 0.4, camDist * 0.9], fov: 55, near: 0.1, far: 100000 }}
                style={{ width: '100%', height: '100%' }}
            >
                <SystemScene
                    planets={planets}
                    planetPositionRefs={positionRefs.current}
                    isSolarSystem={hostname.toLowerCase() === 'sun'}
                    onPlanetClick={handlePlanetClick}
                />
                <OrbitControls enableZoom enableRotate enablePan enabled={!zoomingOut && focusedPlanet === null} />
                <SystemZoomOuter active={zoomingOut} />
                <PlanetFollowCamera
                    focusedIndex={focusedPlanet?.index ?? null}
                    positionRefs={positionRefs}
                    orbitRadius={focusedPlanet?.orbitRadius ?? 1}
                    planetSize={focusedPlanet?.planetSize ?? 1}
                />
            </Canvas>

            <BackButton text={'← Back to Galaxy'} handleBack={handleBack} />

            {focusedPlanet !== null && (
                <button
                    onClick={handleUnfocus}
                    style={{
                        position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.7)', color: 'white',
                        border: '1px solid rgba(255,255,255,0.35)', borderRadius: '4px',
                        padding: '8px 20px', fontSize: '13px', cursor: 'pointer',
                        letterSpacing: '0.5px', zIndex: 1000,
                    }}
                >
                    ← Back to System View
                </button>
            )}

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
