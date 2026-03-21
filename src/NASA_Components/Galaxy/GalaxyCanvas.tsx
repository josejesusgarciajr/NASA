import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { StarField } from './StarField'
import type { Exoplanet } from '../../types/NASA/Exoplanets'
import { useRef, useCallback } from 'react'

type GalaxyCanvasProps = {
    exoplanets: Exoplanet[]
}

export const GalaxyCanvas = ({ exoplanets }: GalaxyCanvasProps) => {
    const tooltipRef = useRef<HTMLDivElement>(null)
    const tooltipNameRef = useRef<HTMLSpanElement>(null)
    const tooltipPlanetsRef = useRef<HTMLSpanElement>(null)

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (tooltipRef.current) {
            tooltipRef.current.style.left = `${e.clientX + 12}px`
            tooltipRef.current.style.top = `${e.clientY - 12}px`
        }
    }, [])

    const handleHover = useCallback((star: Exoplanet | null) => {
        if (!tooltipRef.current) return
        if (star) {
            tooltipRef.current.style.display = 'block'
            if (tooltipNameRef.current) tooltipNameRef.current.textContent = star.hostname
            if (tooltipPlanetsRef.current) {
                tooltipPlanetsRef.current.textContent = star.sy_pnum
                    ? `${star.sy_pnum} planet${star.sy_pnum > 1 ? 's' : ''}`
                    : ''
            }
        } else {
            tooltipRef.current.style.display = 'none'
        }
    }, [])

    return (
        <div
            style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}
            onMouseMove={handleMouseMove}
        >
            <Canvas
                camera={{ position: [0, 0, 2000], fov: 75, near: 0.1, far: 100000 }}
                style={{ width: '100%', height: '100%', background: 'black' }}
            >
                <ambientLight intensity={0.5} />
                <StarField exoplanets={exoplanets} onHover={handleHover} />
                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    zoomSpeed={2}
                    minDistance={1}
                    maxDistance={4000}
                />
            </Canvas>

            <div
                ref={tooltipRef}
                style={{
                    display: 'none',
                    position: 'fixed',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    border: '1px solid rgba(255,255,255,0.2)',
                    whiteSpace: 'nowrap'
                }}
            >
                <span ref={tooltipNameRef} />
                <span ref={tooltipPlanetsRef} style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '6px' }} />
            </div>
        </div>
    )
}