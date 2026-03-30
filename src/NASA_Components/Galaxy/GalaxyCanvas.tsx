// three
import * as THREE from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

// react
import { useRef, useCallback, useState, useEffect } from 'react'

// nasa
import { StarField } from './StarField'
import type { Exoplanet } from '../../types/NASA/Exoplanets'
import { saveGalaxyCamera, getSavedGalaxyCamera } from '../../utils/galaxyTransitionStore'
import { toCartesian } from '../../utils/coordinateUtils'

type GalaxyCanvasProps = {
    exoplanets: Exoplanet[]
    onEnterSystem: (star: Exoplanet) => void
}

type ControlsRef = React.RefObject<any>

// Tracks camera position + controls target into a ref every frame
const CameraTracker = ({ stateRef, controlsRef }: {
    stateRef: React.MutableRefObject<{ position: THREE.Vector3; target: THREE.Vector3 }>
    controlsRef: ControlsRef
}) => {
    const { camera } = useThree()

    useFrame(() => {
        stateRef.current.position.copy(camera.position)
        if (controlsRef.current?.target) {
            stateRef.current.target.copy(controlsRef.current.target)
        }
    })
    return null
}

// On the first frame after mount where controls are available, restores the saved camera state
const CameraRestorer = ({ controlsRef }: { controlsRef: ControlsRef }) => {
    const { camera } = useThree()
    const restoredRef = useRef(false)

    useFrame(() => {
        if (restoredRef.current) return
        const saved = getSavedGalaxyCamera()
        if (!saved) { restoredRef.current = true; return }
        // Wait until controls ref is populated (commit happens before first frame, so this is usually immediate)
        if (!controlsRef.current) return
        camera.position.copy(saved.position)
        controlsRef.current.target.copy(saved.target)
        controlsRef.current.update()
        restoredRef.current = true
    })
    return null
}

// Lerps camera + controls target toward a star position during the zoom-in animation
const GalaxyZoomer = ({ target, controlsRef }: { target: THREE.Vector3 | null; controlsRef: ControlsRef }) => {
    const { camera } = useThree()

    useFrame(() => {
        if (!target) return
        camera.position.lerp(target, 0.06)
        if (controlsRef.current?.target) {
            controlsRef.current.target.lerp(target, 0.06)
            controlsRef.current.update()
        }
    })
    return null
}

// Renders a pulsing ring that expands and fades around the hovered star
const HoverRing = ({ star }: { star: Exoplanet | null }) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const matRef  = useRef<THREE.MeshBasicMaterial>(null)
    const timeRef = useRef(0)
    const { camera, gl } = useThree()

    useEffect(() => {
        timeRef.current = 0
    }, [star])

    useFrame((_, delta) => {
        if (!meshRef.current || !matRef.current || !star) return

        timeRef.current += delta * 1.2

        // Match the vertex shader: gl_PointSize = size * (150 / depth)
        // The world-space radius that equals one visual pixel is:
        //   worldRadius = size * 150 / depth  *  depth / focal_px
        //               = size * 150 * tan(halfFOV) * 2 / physicalHeight
        // Depth cancels — the world radius is distance-independent, so the ring
        // stays proportional to the star's visual disc at any zoom level.
        const cam = camera as THREE.PerspectiveCamera
        const tanHalfFOV = Math.tan(cam.fov * Math.PI / 360)
        const starRadius = star.st_rad ?? 1
        const baseSize   = starRadius * 150 * 2 * tanHalfFOV / gl.domElement.height

        const t       = timeRef.current % 1
        const scale   = baseSize * (1.5 + t * 2.0)
        const opacity = 0.9 * (1 - t)

        meshRef.current.scale.setScalar(scale)
        matRef.current.opacity = opacity
        meshRef.current.quaternion.copy(camera.quaternion)
    })

    if (!star) return null

    const { x, y, z } = toCartesian(star)

    return (
        <mesh ref={meshRef} position={[x, y, z]}>
            <ringGeometry args={[0.78, 1.0, 48]} />
            <meshBasicMaterial ref={matRef} color="white" transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
    )
}

export const GalaxyCanvas = ({ exoplanets, onEnterSystem }: GalaxyCanvasProps) => {
    const tooltipRef        = useRef<HTMLDivElement>(null)
    const tooltipNameRef    = useRef<HTMLSpanElement>(null)
    const tooltipPlanetsRef = useRef<HTMLSpanElement>(null)
    const controlsRef       = useRef<any>(null)
    const [zoomTarget, setZoomTarget]     = useState<THREE.Vector3 | null>(null)
    const [hoveredStar, setHoveredStar]   = useState<Exoplanet | null>(null)

    const cameraStateRef = useRef({
        position: new THREE.Vector3(0, 0, 2000),
        target:   new THREE.Vector3(0, 0, 0),
    })

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (tooltipRef.current) {
            tooltipRef.current.style.left = `${e.clientX + 12}px`
            tooltipRef.current.style.top  = `${e.clientY - 12}px`
        }
    }, [])

    const handleHover = useCallback((star: Exoplanet | null) => {
        setHoveredStar(star)
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
        // Snapshot camera state before zoom starts
        saveGalaxyCamera(
            cameraStateRef.current.position.clone(),
            cameraStateRef.current.target.clone(),
        )
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
                    ref={controlsRef}
                    makeDefault
                    enableZoom
                    enablePan
                    enableRotate
                    enabled={!zoomTarget}
                    zoomSpeed={2}
                    minDistance={1}
                    maxDistance={4000}
                />
                <HoverRing star={hoveredStar} />
                <CameraTracker stateRef={cameraStateRef} controlsRef={controlsRef} />
                <CameraRestorer controlsRef={controlsRef} />
                <GalaxyZoomer target={zoomTarget} controlsRef={controlsRef} />
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
                    whiteSpace: 'nowrap',
                }}
            >
                <span ref={tooltipNameRef} />
                <span ref={tooltipPlanetsRef} style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '6px' }} />
            </div>
        </div>
    )
}
