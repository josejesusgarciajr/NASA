// three
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// react
import { useRef, useMemo } from 'react'

// nasa
import type { Exoplanet } from '../../types/NASA/Exoplanets'
import { OrbitRing } from './OrbitRing'
import { PlanetRings } from './PlanetRings'
import { getPlanetType, planetConfig } from '../../utils/galaxy'
import { makeIceGiantTexture, makeGasGiantTexture, makeSuperEarthTexture, makeRockyTexture } from '../../utils/planetTextures'

type OrbitingPlanetProps = {
    planet: Exoplanet
    index: number
    orbitRadius: number
    solarRadiusInUnits: number
    positionRef?: THREE.Vector3
    onPlanetClick?: () => void
}

export const OrbitingPlanet = ({ planet, index, orbitRadius, solarRadiusInUnits, positionRef, onPlanetClick }: OrbitingPlanetProps) => {
    const groupRef  = useRef<THREE.Group>(null)
    const meshRef   = useRef<THREE.Mesh>(null)
    const matRef    = useRef<THREE.MeshStandardMaterial>(null)
    const type     = getPlanetType(planet.pl_rade)
    const cfg      = planetConfig(type)

    const pl_rade    = planet.pl_rade ?? 1
    const rawSize    = (pl_rade / 109) * solarRadiusInUnits * 2.5
    const minSize    = type === 'rocky' || type === 'super_earth'
        ? solarRadiusInUnits * 0.18
        : solarRadiusInUnits * 0.25
    const planetSize = Math.min(Math.max(rawSize, minSize), solarRadiusInUnits * 0.82)

    const speed  = 0.05 / ((planet.pl_orbsmax ?? (index + 1) * 0.5) * 5)
    const offset = (index / 8) * Math.PI * 2

    const surfaceTexture = useMemo(() => {
        switch (type) {
            case 'ice_giant':   return makeIceGiantTexture()
            case 'gas_giant':   return makeGasGiantTexture()
            case 'super_earth': return makeSuperEarthTexture()
            case 'rocky':       return makeRockyTexture()
        }
    }, [type])

    const spinSpeed = 0.5 + (index % 3) * 0.15

    useFrame(({ clock }, delta) => {
        if (groupRef.current) {
            const t = clock.getElapsedTime() * speed + offset
            groupRef.current.position.x = Math.cos(t) * orbitRadius
            groupRef.current.position.z = Math.sin(t) * orbitRadius
            if (positionRef) positionRef.copy(groupRef.current.position)
        }
        if (meshRef.current) meshRef.current.rotation.y += delta * spinSpeed
        // Slow atmosphere drift for all textured planets
        if (surfaceTexture) {
            surfaceTexture.offset.x = (surfaceTexture.offset.x + delta * 0.001) % 1
        }
    })

    return (
        <>
            <OrbitRing orbitRadius={orbitRadius} />
            <group ref={groupRef}>
                <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onPlanetClick?.() }}>
                    <sphereGeometry args={[planetSize, 48, 48]} />
                    <meshStandardMaterial
                        ref={matRef}
                        // Never apply color tint when texture present — it kills the map
                        color={surfaceTexture ? undefined : cfg.color}
                        map={surfaceTexture ?? undefined}
                        emissive={cfg.emissive}
                        // Keep emissive LOW for rocky/super-earth so texture isn't washed out
                        emissiveIntensity={type === 'rocky' || type === 'super_earth' ? 0.5 : 0.4}
                        roughness={cfg.roughness}
                        metalness={0.05}
                    />
                </mesh>
                {cfg.hasRings && <PlanetRings planetSize={planetSize} type={type} />}
            </group>
        </>
    )
}