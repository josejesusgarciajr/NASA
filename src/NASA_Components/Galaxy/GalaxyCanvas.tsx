// three
import * as THREE from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

// react
import { useRef, useCallback, useState } from 'react'

// nasa
import { StarField } from './StarField'
import type { Exoplanet } from '../../types/NASA/Exoplanets'
import { saveGalaxyCamera, getSavedGalaxyCamera } from '../../utils/galaxyTransitionStore'

type GalaxyCanvasProps = {
    exoplanets: Exoplanet[]
    onEnterSystem: (star: Exoplanet) => void
}

// Tracks camera + controls target into a ref every frame so we can snapshot it on click
const CameraTracker = ({ stateRef }: {
    stateRef: React.MutableRefObject<{ position: THREE.Vector3; target: THREE.Vector3 }>
}) => {
    const { camera } = useThree()
    const controls = useThree(s => s.controls) as any

    useFrame(() => {
        stateRef.current.position.copy(camera.position)
        if (controls?.target) stateRef.current.target.copy(controls.target)
    })
    return null
}

// On first frame after mount, restores camera to the last saved galaxy position
const CameraRestorer = () => {
    const { camera } = useThree()
    const controls = useThree(s => s.controls) as any
    const restoredRef = useRef(false)

    useFrame(() => {
        if (restoredRef.current) return
        const saved = getSavedGalaxyCamera()
        if (saved && controls) {
            camera.position.copy(saved.position)
            controls.target.copy(saved.target)
            controls.update()
        }
        restoredRef.current = true
    })
    return null
}

// Lerps camera toward a target position while zooming in to a star
const GalaxyZoomer = ({ target }: { target: THREE.Vector3 | null }) => {
    const { camera } = useThree()
    const controls = useThree(s => s.controls) as any

    useFrame(() => {
        if (!target) return
        camera.position.lerp(target, 0.06)
        if (controls?.target) {
            controls.target.lerp(target, 0.06)
            controls.update()
        }
    })
    return null
}

export const GalaxyCanvas = ({ exoplanets, onEnterSystem }: GalaxyCanvasProps) => {
    const tooltipRef     = useRef<HTMLDivElement>(null)
    const tooltipNameRef = useRef<HTMLSpanElement>(null)
    const tooltipPlanetsRef = useRef<HTMLSpanElement>(null)
    const [zoomTarget, setZoomTarget] = useState<THREE.Vector3 | null>(null)

    const cameraStateRef = useRef({
        position: new THREE.Vector3(0, 0, 2000),
        target: new THREE.Vector3(0, 0, 0),
    })

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (tooltipRef.current) {
            tooltipRef.current.style.left = `${e.clientX + 12}px`
            tooltipRef.current.style.top  = `${e.clientY - 12}px`
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

    const handleClick = useCallback((star: Exoplanet, worldPos: THREE.Vector3) => {
        saveGalaxyCamera(cameraStateRef.current.position, cameraStateRef.current.target)
        setZoomTarget(worldPos)
        onEnterSystem(star)
    }, [onEnterSystem])

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
                <StarField exoplanets={exoplanets} onHover={handleHover} onClick={handleClick} />
                <OrbitControls
                    makeDefault
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    enabled={!zoomTarget}
                    zoomSpeed={2}
                    minDistance={1}
                    maxDistance={4000}
                />
                <CameraTracker stateRef={cameraStateRef} />
                <CameraRestorer />
                <GalaxyZoomer target={zoomTarget} />
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
