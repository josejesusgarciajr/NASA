import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { StarField } from './StarField'
import type { Exoplanet } from '../../types/NASA/Exoplanets'
import { useState, useRef } from 'react'

type GalaxyCanvasProps = {
    exoplanets: Exoplanet[]
}

export const GalaxyCanvas = ({ exoplanets }: GalaxyCanvasProps) => {
    const [hoveredStar, setHoveredStar] = useState<Exoplanet | null>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const lastMouseUpdate = useRef(0)

    function handleMouseMove(e: React.MouseEvent) {
        const now = Date.now()
        if (now - lastMouseUpdate.current > 16) {
            setMousePos({ x: e.clientX, y: e.clientY })
            lastMouseUpdate.current = now
        }
    }

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
                <StarField
                    exoplanets={exoplanets}
                    onHover={setHoveredStar}
                />
                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    zoomSpeed={2}
                    minDistance={5}
                    maxDistance={4000}
                />
            </Canvas>

            {hoveredStar && (
                <div style={{
                    position: 'fixed',
                    left: mousePos.x + 12,
                    top: mousePos.y - 12,
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    border: '1px solid rgba(255,255,255,0.2)',
                    whiteSpace: 'nowrap'
                }}>
                    {hoveredStar.hostname}
                    {hoveredStar.sy_pnum && (
                        <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '6px' }}>
                            {hoveredStar.sy_pnum} planet{hoveredStar.sy_pnum > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}