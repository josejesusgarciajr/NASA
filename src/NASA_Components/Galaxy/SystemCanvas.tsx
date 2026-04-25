// three
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React, { useRef, useState, useMemo, useEffect } from 'react'
import * as THREE from 'three'

// nasa
import type { Exoplanet } from '../../types/NASA/Exoplanets'
import { SystemScene } from './SystemScene'
import { AU, MIN_ORBIT_GAP } from '../../utils/galaxy'
import { BackButton } from '../../components/BackButton'

type SystemCanvasProps = {
    hostname: string
    planets: Exoplanet[]
    onBack: () => void
    astrophageMode?: boolean
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

// Smoothly pans the camera back to the system overview after unfocusing a planet
const CameraReturnToOverview = ({
    active,
    targetPos,
    onDone,
}: {
    active: boolean
    targetPos: THREE.Vector3
    onDone: () => void
}) => {
    const { camera } = useThree()
    const startRef = useRef<THREE.Vector3 | null>(null)

    useFrame(() => {
        if (!active) {
            startRef.current = null
            return
        }

        if (!startRef.current) startRef.current = camera.position.clone()

        // Constant lerp factor — gives smooth exponential ease-out (~1.5s to settle)
        camera.position.lerp(targetPos, 0.055)
        camera.lookAt(0, 0, 0)

        if (camera.position.distanceTo(targetPos) < 1.5) {
            camera.position.copy(targetPos)
            camera.lookAt(0, 0, 0)
            onDone()
        }
    })
    return null
}

// Updates system coordinate DOM spans directly every frame — no React re-renders per tick
const SystemCameraCoords = ({ auScale, refs }: {
    auScale: number
    refs: {
        x: React.RefObject<HTMLSpanElement | null>
        y: React.RefObject<HTMLSpanElement | null>
        z: React.RefObject<HTMLSpanElement | null>
        dist: React.RefObject<HTMLSpanElement | null>
    }
}) => {
    const { camera } = useThree()
    useFrame(() => {
        const x = camera.position.x / auScale
        const y = camera.position.y / auScale
        const z = camera.position.z / auScale
        const d = camera.position.length() / auScale
        const fmt = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(2)
        if (refs.x.current)    refs.x.current.textContent    = fmt(x)
        if (refs.y.current)    refs.y.current.textContent    = fmt(y)
        if (refs.z.current)    refs.z.current.textContent    = fmt(z)
        if (refs.dist.current) refs.dist.current.textContent = d.toFixed(2)
    })
    return null
}

export const SystemCanvas = ({ hostname, planets, onBack, astrophageMode }: SystemCanvasProps) => {
    // Mirror SystemScene's orbit clamping so camDist reflects the actual rendered layout.
    // A large star pushes all orbits out to starClearance regardless of pl_orbsmax, so
    // using raw pl_orbsmax * AU here would leave the camera far too close for big stars.
    const starSize      = Math.min(Math.max((planets[0].st_rad ?? 1) * 5, 15), 60)
    const starClearance = starSize * 2.7 + 10
    const actualOrbits: number[] = []
    planets.forEach((p, i) => {
        const raw = (p.pl_orbsmax ?? (i + 1) * 0.5) * AU
        let r = Math.max(raw, starClearance)
        if (i > 0) r = Math.max(r, actualOrbits[i - 1] + MIN_ORBIT_GAP)
        actualOrbits.push(r)
    })
    const maxActualOrbit = Math.max(...actualOrbits, starSize * 3)
    // 1.8× gives the outermost orbit ~75% of the vertical viewport (FOV 55°), with margin
    const camDist = Math.max(maxActualOrbit * 1.8, starSize * 4, 80)

    // The default overview position — used as the lerp target when returning from a planet
    const overviewPos = useMemo(
        () => new THREE.Vector3(0, camDist * 0.4, camDist * 0.9),
        [camDist]
    )

    const [zoomingOut, setZoomingOut]               = useState(false)
    const [focusedPlanet, setFocusedPlanet]         = useState<{ index: number; orbitRadius: number; planetSize: number } | null>(null)
    const [returningToOverview, setReturningToOverview] = useState(false)
    const [hudOpen, setHudOpen]                     = useState(false)
    const coordXRef    = useRef<HTMLSpanElement>(null)
    const coordYRef    = useRef<HTMLSpanElement>(null)
    const coordZRef    = useRef<HTMLSpanElement>(null)
    const coordDistRef = useRef<HTMLSpanElement>(null)

    // Check once at mount — used to swap between always-visible (desktop) and toggle (mobile)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600
    const showHud  = !isMobile || hudOpen

    // One persistent Vector3 per planet — updated every frame by OrbitingPlanet
    const positionRefsArray = useMemo(
        () => planets.map(() => new THREE.Vector3()),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [planets.length]
    )
    const positionRefs = useRef(positionRefsArray)
    const containerRef = useRef<HTMLDivElement>(null)

    // Block trackpad/mouse-wheel zoom at the native level whenever the camera is not
    // under user control (planet focused, returning to overview, or zooming out to galaxy).
    // Must be non-passive so preventDefault() is honoured before the canvas sees the event.
    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const block = (e: WheelEvent) => { e.preventDefault() }
        if (focusedPlanet !== null || zoomingOut || returningToOverview) {
            el.addEventListener('wheel', block, { passive: false })
        }
        return () => { el.removeEventListener('wheel', block) }
    }, [focusedPlanet, zoomingOut, returningToOverview])

    const handleBack = () => {
        setZoomingOut(true)
        onBack()  // triggers the overlay fade in DOME.tsx simultaneously
    }

    const handlePlanetClick = (index: number, orbitRadius: number, planetSize: number) => {
        if (zoomingOut) return
        setFocusedPlanet({ index, orbitRadius, planetSize })
    }

    const handleUnfocus = () => {
        setFocusedPlanet(null)
        setReturningToOverview(true)
    }

    // OrbitControls is disabled while a planet is focused OR while returning to overview
    const orbitControlsEnabled = !zoomingOut && focusedPlanet === null && !returningToOverview

    return (
        <div
            ref={containerRef}
            style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, background: 'black' }}
        >
            <Canvas
                camera={{ position: [0, camDist * 0.4, camDist * 0.9], fov: 55, near: 0.1, far: 100000 }}
                style={{ width: '100%', height: '100%' }}
            >
                <SystemScene
                    planets={planets}
                    planetPositionRefs={positionRefs.current}
                    isSolarSystem={hostname.toLowerCase() === 'sun'}
                    astrophageMode={astrophageMode}
                    onPlanetClick={handlePlanetClick}
                />
                <OrbitControls enableZoom enableRotate enablePan enabled={orbitControlsEnabled} />
                <SystemCameraCoords auScale={AU} refs={{ x: coordXRef, y: coordYRef, z: coordZRef, dist: coordDistRef }} />
                <SystemZoomOuter active={zoomingOut} />
                <PlanetFollowCamera
                    focusedIndex={focusedPlanet?.index ?? null}
                    positionRefs={positionRefs}
                    orbitRadius={focusedPlanet?.orbitRadius ?? 1}
                    planetSize={focusedPlanet?.planetSize ?? 1}
                />
                <CameraReturnToOverview
                    active={returningToOverview}
                    targetPos={overviewPos}
                    onDone={() => setReturningToOverview(false)}
                />
            </Canvas>

            {/* Astrophage mode — subtle purple scene tint */}
            {astrophageMode && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'radial-gradient(ellipse at 50% 40%, rgba(160, 0, 255, 0.07) 0%, rgba(80, 0, 180, 0.16) 100%)',
                    mixBlendMode: 'screen',
                    pointerEvents: 'none',
                    zIndex: 1,
                }} />
            )}

            <BackButton text={'← Back to Galaxy'} handleBack={handleBack} />

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
                fontSize: isMobile ? '10px' : '11px',
                zIndex: 1000,
                pointerEvents: 'none',
                userSelect: 'none',
                textShadow: '0 1px 5px rgba(0,0,0,1)',
            }}>
                <span>
                    <span style={{ color: '#38bdf8', marginRight: '4px' }}>X</span>
                    <span ref={coordXRef} style={{ color: '#e2e8f0' }}>+0.00</span>
                    <span style={{ color: 'rgba(148,163,184,0.5)', marginLeft: '2px', fontSize: '9px' }}>au</span>
                </span>
                <span>
                    <span style={{ color: '#a78bfa', marginRight: '4px' }}>Y</span>
                    <span ref={coordYRef} style={{ color: '#e2e8f0' }}>+0.00</span>
                    <span style={{ color: 'rgba(148,163,184,0.5)', marginLeft: '2px', fontSize: '9px' }}>au</span>
                </span>
                <span>
                    <span style={{ color: '#7dd3fc', marginRight: '4px' }}>Z</span>
                    <span ref={coordZRef} style={{ color: '#e2e8f0' }}>+0.00</span>
                    <span style={{ color: 'rgba(148,163,184,0.5)', marginLeft: '2px', fontSize: '9px' }}>au</span>
                </span>
                <span style={{ color: 'rgba(56,189,248,0.2)' }}>·</span>
                <span>
                    <span style={{ color: 'rgba(148,163,184,0.45)', marginRight: '4px', fontSize: '9px', letterSpacing: '0.5px' }}>DST</span>
                    <span ref={coordDistRef} style={{ color: '#94a3b8' }}>0.00</span>
                    <span style={{ color: 'rgba(148,163,184,0.4)', marginLeft: '2px', fontSize: '9px' }}>au</span>
                </span>
            </div>

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

            {/* Mobile toggle — only rendered on small screens */}
            {isMobile && (
                <button
                    onClick={() => setHudOpen(o => !o)}
                    style={{
                        position: 'fixed', top: '80px', right: '20px',
                        width: '34px', height: '34px',
                        background: 'rgba(0,0,0,0.75)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: '50%',
                        color: 'white', fontSize: '15px',
                        cursor: 'pointer', zIndex: 1002,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1,
                    }}
                >
                    {hudOpen ? '✕' : 'ⓘ'}
                </button>
            )}

            {/* HUD panel — always visible on desktop, toggled on mobile */}
            {showHud && (
                <div style={{
                    position: 'fixed',
                    top: isMobile ? '124px' : '80px',
                    right: '20px',
                    background: 'rgba(0,0,0,0.7)', color: 'white',
                    padding: isMobile ? '10px 12px' : '12px 16px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: isMobile ? '11px' : '13px',
                    zIndex: 1000,
                    minWidth: isMobile ? '160px' : '220px',
                    maxHeight: isMobile ? '55vh' : 'none',
                    overflowY: isMobile ? 'auto' : 'visible',
                }}>
                    {focusedPlanet !== null ? (
                        // ── Planet detail view ──────────────────────────────
                        (() => {
                            const p = planets[focusedPlanet.index]
                            const row = (label: string, value: string) => (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                                    <span>{value}</span>
                                </div>
                            )
                            return (
                                <>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '1px', marginBottom: '8px' }}>PLANET</div>
                                    <div style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 'bold', marginBottom: '12px' }}>{p.pl_name}</div>
                                    {row('Radius',  p.pl_rade   ? `${p.pl_rade} R⊕`              : '—')}
                                    {row('Mass',    p.pl_masse  ? `${p.pl_masse} M⊕`             : '—')}
                                    {row('Period',  p.pl_orbper ? `${p.pl_orbper.toFixed(1)} d`   : '—')}
                                    {row('Orbit',   p.pl_orbsmax ? `${p.pl_orbsmax} AU`           : '—')}
                                    {row('Eccen.',  p.pl_orbeccen != null ? `${p.pl_orbeccen}`    : '—')}
                                    {row('Eq. Temp', p.pl_eqt   ? `${p.pl_eqt.toLocaleString()} K` : '—')}
                                    {(p.discoverymethod || p.disc_year) && (
                                        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '1px', marginBottom: '6px' }}>DISCOVERY</div>
                                            {row('Method', p.discoverymethod ?? '—')}
                                            {row('Year',   p.disc_year ? `${p.disc_year}` : '—')}
                                        </div>
                                    )}
                                </>
                            )
                        })()
                    ) : (
                        // ── System / star overview ───────────────────────────
                        <>
                            {astrophageMode && (
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    marginBottom: '10px', padding: '3px 8px',
                                    background: 'rgba(160, 0, 255, 0.18)',
                                    border: '1px solid rgba(180, 40, 255, 0.55)',
                                    borderRadius: '3px',
                                    color: '#cc88ff',
                                    fontSize: '10px', letterSpacing: '1.2px', fontWeight: 'bold',
                                }}>
                                    <span style={{ fontSize: '11px' }}>⬡</span> ASTROPHAGE MODE
                                </div>
                            )}
                            <div style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 'bold', marginBottom: '12px' }}>{hostname}</div>
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
                            {astrophageMode && (
                                <div style={{ marginBottom: '14px', padding: '8px', background: 'rgba(100,0,200,0.12)', borderRadius: '3px', border: '1px solid rgba(150,0,255,0.2)' }}>
                                    <div style={{ color: '#bb66ff', fontSize: '10px', letterSpacing: '1px', marginBottom: '4px' }}>MIGRATION ROUTE</div>
                                    <div style={{ color: 'rgba(200,150,255,0.85)', fontSize: '11px' }}>Sun ↔ Venus</div>
                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginTop: '3px' }}>CO₂ spectrum signature</div>
                                </div>
                            )}
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
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
