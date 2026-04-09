// three
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// react
import { useRef, useMemo, useState, useEffect } from 'react'

// nasa
import type { Exoplanet } from '../../types/NASA/Exoplanets'
import { OrbitRing } from './OrbitRing'
import { PlanetRings } from './PlanetRings'
import { getPlanetType, planetConfig } from '../../utils/galaxy'
import { makeIceGiantTexture, makeGasGiantTexture, makeSuperEarthTexture, makeRockyTexture } from '../../utils/planetTextures'
import { getSolarPlanetTexturePath, EARTH_CLOUD_TEXTURE_URL, SATURN_RING_TEXTURE_URL } from '../../utils/solarPlanetTextures'

type OrbitingPlanetProps = {
    planet: Exoplanet
    index: number
    orbitRadius: number
    solarRadiusInUnits: number
    isSolarSystem?: boolean
    positionRef?: THREE.Vector3
    onPlanetClick?: (planetSize: number) => void
}

function loadTexture(url: string, onLoad: (tex: THREE.Texture) => void): () => void {
    let cancelled = false
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(url, (tex) => {
        if (cancelled) { tex.dispose(); return }
        onLoad(tex)
    })
    return () => { cancelled = true }
}

export const OrbitingPlanet = ({ planet, index, orbitRadius, solarRadiusInUnits, isSolarSystem, positionRef, onPlanetClick }: OrbitingPlanetProps) => {
    const groupRef   = useRef<THREE.Group>(null)
    const meshRef    = useRef<THREE.Mesh>(null)
    const cloudRef   = useRef<THREE.Mesh>(null)
    const matRef     = useRef<THREE.MeshStandardMaterial>(null)
    const type       = getPlanetType(planet.pl_rade)
    const cfg        = planetConfig(type)
    const planetName = planet.pl_name.toLowerCase()

    const pl_rade    = planet.pl_rade ?? 1
    const rawSize    = (pl_rade / 109) * solarRadiusInUnits * 5
    const minSize    = type === 'rocky' || type === 'super_earth'
        ? solarRadiusInUnits * 0.05
        : solarRadiusInUnits * 0.08
    // Hard cap: no planet can exceed 60% of the star radius
    const maxSize    = solarRadiusInUnits * 0.6
    const basePlanetSize = Math.min(Math.max(rawSize, minSize), maxSize)
    const planetSize = isSolarSystem ? basePlanetSize * 1.25 : basePlanetSize

    const speed  = 0.05 / ((planet.pl_orbsmax ?? (index + 1) * 0.5) * 5)
    const offset = (index / 8) * Math.PI * 2

    // Procedural texture — always available immediately as a fallback
    const proceduralTexture = useMemo(() => {
        switch (type) {
            case 'ice_giant':   return makeIceGiantTexture()
            case 'gas_giant':   return makeGasGiantTexture()
            case 'super_earth': return makeSuperEarthTexture()
            case 'rocky':       return makeRockyTexture()
        }
    }, [type])

    // Real surface texture for solar system planets
    const [realTexture, setRealTexture] = useState<THREE.Texture | null>(null)
    useEffect(() => {
        if (!isSolarSystem) return
        const path = getSolarPlanetTexturePath(planet.pl_name)
        if (!path) return
        return loadTexture(path, (tex) => {
            tex.wrapS = THREE.RepeatWrapping
            tex.wrapT = THREE.ClampToEdgeWrapping
            setRealTexture(tex)
        })
    }, [isSolarSystem, planet.pl_name])

    // Earth cloud layer
    const [cloudTexture, setCloudTexture] = useState<THREE.Texture | null>(null)
    useEffect(() => {
        if (!isSolarSystem || planetName !== 'earth') return
        return loadTexture(EARTH_CLOUD_TEXTURE_URL, (tex) => {
            tex.wrapS = THREE.RepeatWrapping
            tex.wrapT = THREE.ClampToEdgeWrapping
            setCloudTexture(tex)
        })
    }, [isSolarSystem, planetName])

    // Saturn real ring texture
    const [realRingTexture, setRealRingTexture] = useState<THREE.Texture | null>(null)
    useEffect(() => {
        if (!isSolarSystem || planetName !== 'saturn') return
        return loadTexture(SATURN_RING_TEXTURE_URL, (tex) => {
            tex.wrapS = THREE.ClampToEdgeWrapping
            tex.wrapT = THREE.ClampToEdgeWrapping
            setRealRingTexture(tex)
        })
    }, [isSolarSystem, planetName])

    const surfaceTexture = realTexture ?? proceduralTexture
    const spinSpeed      = 0.5 + (index % 3) * 0.15

    useFrame(({ clock }, delta) => {
        if (groupRef.current) {
            const t = clock.getElapsedTime() * speed + offset
            groupRef.current.position.x = Math.cos(t) * orbitRadius
            groupRef.current.position.z = Math.sin(t) * orbitRadius
            if (positionRef) positionRef.copy(groupRef.current.position)
        }
        if (meshRef.current) meshRef.current.rotation.y -= delta * spinSpeed
        // Clouds drift slightly slower than the surface
        if (cloudRef.current) cloudRef.current.rotation.y -= delta * spinSpeed * 0.85
        // Slow atmosphere drift for procedural textures
        if (surfaceTexture && !realTexture) {
            surfaceTexture.offset.x = (surfaceTexture.offset.x - delta * 0.001) % 1
        }
    })

    return (
        <>
            <OrbitRing orbitRadius={orbitRadius} />
            <group ref={groupRef}>
                <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onPlanetClick?.(planetSize) }}>
                    <sphereGeometry args={[planetSize, 64, 64]} />
                    <meshStandardMaterial
                        ref={matRef}
                        color={surfaceTexture ? undefined : cfg.color}
                        map={surfaceTexture ?? undefined}
                        emissive={cfg.emissive}
                        emissiveIntensity={type === 'rocky' || type === 'super_earth' ? 0.5 : 0.4}
                        roughness={cfg.roughness}
                        metalness={0.05}
                    />
                </mesh>

                {/* Earth cloud layer — slightly larger sphere, driven by cloud alpha map */}
                {cloudTexture && (
                    <mesh ref={cloudRef}>
                        <sphereGeometry args={[planetSize * 1.012, 64, 64]} />
                        <meshStandardMaterial
                            alphaMap={cloudTexture}
                            transparent
                            color="white"
                            depthWrite={false}
                            opacity={0.9}
                        />
                    </mesh>
                )}

                {cfg.hasRings && (
                    <PlanetRings
                        planetSize={planetSize}
                        type={type}
                        ringTexture={realRingTexture ?? undefined}
                    />
                )}
            </group>
        </>
    )
}
