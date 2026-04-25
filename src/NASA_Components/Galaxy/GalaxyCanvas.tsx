// three
import * as THREE from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

// react
import { useRef, useCallback, useState, useEffect } from 'react'

// nasa
import { StarField } from './StarField'
import type { Exoplanet } from '../../types/NASA/Exoplanets'
import { saveGalaxyCamera, getSavedGalaxyCamera, registerZoomToSun, registerClickSun } from '../../utils/galaxyTransitionStore'
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

// Zooms toward a target but stops at stopDistance — used for the rocket "find Sun" shortcut.
// Calls onDone once the camera is close enough so orbit controls can be re-enabled.
const SoftZoomer = ({
    active, target, stopDistance, controlsRef, onDone,
}: {
    active: boolean
    target: THREE.Vector3
    stopDistance: number
    controlsRef: ControlsRef
    onDone: () => void
}) => {
    const { camera } = useThree()
    const doneRef = useRef(false)

    useFrame(() => {
        if (!active) { doneRef.current = false; return }

        // Keep orbit center locked to the Sun throughout
        if (controlsRef.current?.target) {
            controlsRef.current.target.lerp(target, 0.08)
            controlsRef.current.update()
        }

        const dist = camera.position.distanceTo(target)
        if (dist > stopDistance) {
            camera.position.lerp(target, 0.06)
        } else if (!doneRef.current) {
            doneRef.current = true
            onDone()
        }
    })
    return null
}

// Always-on pulsating rings for the Sun.
// Uses ringGeometry + meshBasicMaterial so animation is driven by direct Three.js
// property mutations (scale, opacity) — no shader uniforms that can stall.
const SunPulseRing = ({ sun }: { sun: Exoplanet | null }) => {
    const mesh1Ref = useRef<THREE.Mesh>(null)
    const mesh2Ref = useRef<THREE.Mesh>(null)
    const mat1Ref  = useRef<THREE.MeshBasicMaterial>(null)
    const mat2Ref  = useRef<THREE.MeshBasicMaterial>(null)
    const { camera, gl } = useThree()

    useFrame((state) => {
        if (!sun) return

        const cam        = camera as THREE.PerspectiveCamera
        const tanHalfFOV = Math.tan(cam.fov * Math.PI / 360)
        const starRadius = sun.st_rad ?? 1
        // World-space radius of the star's rendered disc at current depth
        const baseR      = starRadius * 150 * tanHalfFOV / gl.domElement.height

        const t = state.clock.elapsedTime * 0.5   // 0.5 cycles / sec

        const animateRing = (
            mesh: THREE.Mesh | null,
            mat:  THREE.MeshBasicMaterial | null,
            offset: number,
        ) => {
            if (!mesh || !mat) return
            const p = ((t + offset) % 1 + 1) % 1          // 0 → 1, always positive
            mesh.scale.setScalar(baseR * (1.8 + p * 4.0)) // expands 1.8× → 5.8× star radius
            mesh.quaternion.copy(camera.quaternion)        // billboard toward camera
            mat.opacity = Math.pow(1 - p, 3) * 0.9        // bright at birth, gone by p=0.8
        }

        animateRing(mesh1Ref.current, mat1Ref.current, 0)
        animateRing(mesh2Ref.current, mat2Ref.current, 0.5)
    })

    if (!sun) return null
    const { x, y, z } = toCartesian(sun)

    return (
        <group position={[x, y, z]}>
            <mesh ref={mesh1Ref}>
                <ringGeometry args={[0.82, 1.0, 64]} />
                <meshBasicMaterial ref={mat1Ref} color="#ffcc33" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={mesh2Ref}>
                <ringGeometry args={[0.82, 1.0, 64]} />
                <meshBasicMaterial ref={mat2Ref} color="#ff9922" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
        </group>
    )
}

// Renders 3 pulsing rings that emanate from the hovered star one after another
const HoverRing = ({ star }: { star: Exoplanet | null }) => {
    const meshRef  = useRef<THREE.Mesh>(null)
    const matRef   = useRef<THREE.ShaderMaterial>(null)
    const phaseRef = useRef(0)
    const { camera, gl } = useThree()

    useEffect(() => {
        phaseRef.current = 0
    }, [star])

    useFrame((_, delta) => {
        if (!meshRef.current || !matRef.current || !star) return

        phaseRef.current += delta * 0.4

        const cam = camera as THREE.PerspectiveCamera
        const tanHalfFOV = Math.tan(cam.fov * Math.PI / 360)
        const starRadius = star.st_rad ?? 1

        // Exact world-space radius of the star's visual disc:
        //   gl_PointSize = starRadius * 150 / depth  (physical px)
        //   worldRadius  = (gl_PointSize/2) * depth / focal_px  → depth cancels →
        //   worldRadius  = starRadius * 150 * tan(halfFOV) / physicalHeight
        const starWorldRadius = starRadius * 150 * tanHalfFOV / gl.domElement.height

        // Scale the quad to 8× the star's visual radius.
        // This makes the star's edge land at exactly dist=0.25 in the shader
        // (starWorldRadius / (planScale/2) = 1/(8/2) = 0.25), which is a constant
        // regardless of star size or camera distance.
        const planScale = starWorldRadius * 8

        meshRef.current.scale.setScalar(planScale)
        matRef.current.uniforms.uPhase.value = phaseRef.current
        meshRef.current.quaternion.copy(camera.quaternion)
    })

    if (!star) return null
    const { x, y, z } = toCartesian(star)

    return (
        <mesh ref={meshRef} position={[x, y, z]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                ref={matRef}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
                uniforms={{ uPhase: { value: 0 } }}
                vertexShader={`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `}
                fragmentShader={`
                    uniform float uPhase;
                    varying vec2 vUv;

                    void main() {
                        // dist: 0 at center → 1 at the mid-edge of the quad.
                        // Because planScale = 8 × starWorldRadius,
                        // the star's visual edge always sits at dist = 0.25.
                        float dist = length(vUv - 0.5) * 2.0;

                        // Clip the dead circle in the middle so no pixels overlap the star.
                        if (dist < 0.24) discard;

                        float halfWidth = 0.04;  // ring band half-width in plane-space
                        float softness  = 0.03;  // smooth fade on each edge

                        float totalAlpha = 0.0;

                        for (int i = 0; i < 3; i++) {
                            // Stagger each ring by 1/3 of a cycle
                            float t = fract(uPhase + float(i) / 3.0);

                            // Center travels from just outside the star (0.30) to ~0.82
                            float center = 0.30 + t * 0.52;
                            float inner  = center - halfWidth;
                            float outer  = center + halfWidth;

                            float a = smoothstep(inner - softness, inner, dist)
                                    * smoothstep(outer + softness, outer, dist);

                            // Ring fades out as it expands; slight ease with pow
                            a *= pow(1.0 - t, 1.5) * 0.85;
                            totalAlpha = max(totalAlpha, a);
                        }

                        if (totalAlpha < 0.01) discard;
                        gl_FragColor = vec4(1.0, 1.0, 1.0, totalAlpha);
                    }
                `}
            />
        </mesh>
    )
}

// Updates galaxy coordinate DOM spans directly every frame — no React re-renders per tick
const GalaxyCameraCoords = ({ refs }: {
    refs: {
        x: React.RefObject<HTMLSpanElement | null>
        y: React.RefObject<HTMLSpanElement | null>
        z: React.RefObject<HTMLSpanElement | null>
        dist: React.RefObject<HTMLSpanElement | null>
    }
}) => {
    const { camera } = useThree()
    useFrame(() => {
        const { x, y, z } = camera.position
        const d = camera.position.length()
        const fmt = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(1)
        if (refs.x.current)    refs.x.current.textContent    = fmt(x)
        if (refs.y.current)    refs.y.current.textContent    = fmt(y)
        if (refs.z.current)    refs.z.current.textContent    = fmt(z)
        if (refs.dist.current) refs.dist.current.textContent = d.toFixed(1)
    })
    return null
}

export const GalaxyCanvas = ({ exoplanets, onEnterSystem }: GalaxyCanvasProps) => {
    const tooltipRef        = useRef<HTMLDivElement>(null)
    const tooltipNameRef    = useRef<HTMLSpanElement>(null)
    const tooltipPlanetsRef = useRef<HTMLSpanElement>(null)
    const controlsRef       = useRef<any>(null)
    const coordXRef         = useRef<HTMLSpanElement>(null)
    const coordYRef         = useRef<HTMLSpanElement>(null)
    const coordZRef         = useRef<HTMLSpanElement>(null)
    const coordDistRef      = useRef<HTMLSpanElement>(null)
    const [zoomTarget, setZoomTarget]     = useState<THREE.Vector3 | null>(null)
    const [hoveredStar, setHoveredStar]   = useState<Exoplanet | null>(null)
    const [softZoomActive, setSoftZoomActive] = useState(false)

    // Earth's star — identified once, drives the always-on pulse ring
    const sun = exoplanets.find(e => e.hostname.toLowerCase() === 'sun') ?? null

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

    // Register the rocket shortcut: zoom toward the Sun without entering the system.
    // The Sun is always at world-space origin (ra=0, dec=0, dist=0).
    useEffect(() => {
        if (!sun) return
        registerZoomToSun(() => setSoftZoomActive(true))
        registerClickSun(() => {
            saveGalaxyCamera(
                cameraStateRef.current.position.clone(),
                cameraStateRef.current.target.clone(),
            )
            setZoomTarget(new THREE.Vector3(0, 0, 0))
            onEnterSystem(sun)
        })
    }, [sun, onEnterSystem])

    const containerRef = useRef<HTMLDivElement>(null)

    // Block trackpad/mouse-wheel zoom at the native level during any camera transition.
    // Must be non-passive so preventDefault() is honoured before the canvas sees the event.
    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const block = (e: WheelEvent) => { e.preventDefault() }
        if (zoomTarget !== null || softZoomActive) {
            el.addEventListener('wheel', block, { passive: false })
        }
        return () => { el.removeEventListener('wheel', block) }
    }, [zoomTarget, softZoomActive])

    return (
        <div
            ref={containerRef}
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
                    enabled={!zoomTarget && !softZoomActive}
                    zoomSpeed={2}
                    minDistance={1}
                    maxDistance={4000}
                />
                <SunPulseRing sun={sun} />
                <HoverRing star={hoveredStar} />
                <CameraTracker stateRef={cameraStateRef} controlsRef={controlsRef} />
                <GalaxyCameraCoords refs={{ x: coordXRef, y: coordYRef, z: coordZRef, dist: coordDistRef }} />
                <CameraRestorer controlsRef={controlsRef} />
                <GalaxyZoomer target={zoomTarget} controlsRef={controlsRef} />
                <SoftZoomer
                    active={softZoomActive}
                    target={new THREE.Vector3(0, 0, 0)}
                    stopDistance={8}
                    controlsRef={controlsRef}
                    onDone={() => setSoftZoomActive(false)}
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
                    whiteSpace: 'nowrap',
                }}
            >
                <span ref={tooltipNameRef} />
                <span ref={tooltipPlanetsRef} style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '6px' }} />
            </div>

            {/* Coordinate readout */}
            <div style={{
                position: 'fixed',
                bottom: '16px',
                left: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'baseline',
                columnGap: '16px',
                rowGap: '4px',
                fontFamily: "'Courier New', monospace",
                fontSize: '11px',
                zIndex: 1000,
                pointerEvents: 'none',
                userSelect: 'none',
                textShadow: '0 1px 5px rgba(0,0,0,1)',
            }}>
                <span>
                    <span style={{ color: '#38bdf8', marginRight: '4px' }}>X</span>
                    <span ref={coordXRef} style={{ color: '#e2e8f0' }}>+0.0</span>
                    <span style={{ color: 'rgba(148,163,184,0.5)', marginLeft: '2px', fontSize: '10px' }}>pc</span>
                </span>
                <span>
                    <span style={{ color: '#a78bfa', marginRight: '4px' }}>Y</span>
                    <span ref={coordYRef} style={{ color: '#e2e8f0' }}>+0.0</span>
                    <span style={{ color: 'rgba(148,163,184,0.5)', marginLeft: '2px', fontSize: '10px' }}>pc</span>
                </span>
                <span>
                    <span style={{ color: '#7dd3fc', marginRight: '4px' }}>Z</span>
                    <span ref={coordZRef} style={{ color: '#e2e8f0' }}>+0.0</span>
                    <span style={{ color: 'rgba(148,163,184,0.5)', marginLeft: '2px', fontSize: '10px' }}>pc</span>
                </span>
                <span style={{ color: 'rgba(56,189,248,0.2)' }}>·</span>
                <span>
                    <span style={{ color: 'rgba(148,163,184,0.45)', marginRight: '4px', fontSize: '9px', letterSpacing: '0.5px' }}>DST</span>
                    <span ref={coordDistRef} style={{ color: '#94a3b8' }}>0.0</span>
                    <span style={{ color: 'rgba(148,163,184,0.4)', marginLeft: '2px', fontSize: '10px' }}>pc</span>
                </span>
            </div>
        </div>
    )
}
