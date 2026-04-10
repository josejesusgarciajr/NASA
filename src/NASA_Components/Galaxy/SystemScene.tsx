// nasa
import type { Exoplanet } from '../../types/NASA/Exoplanets'
import { OrbitingPlanet } from './OrbitingPlanet'
import { tempToColor } from '../../utils/galaxy'
import { StarGlow } from './StarGlow'
import { StarMesh } from './StarMesh'
import { AU, MIN_ORBIT_GAP } from '../../utils/galaxy'
import { HalleysComet } from './HalleysComet'

// react
import { useMemo } from 'react'
import * as THREE from 'three'

type CosmicBeltProps = {
    innerRadius: number
    outerRadius: number
    count: number
    color: string
    thickness: number
    opacity: number
}

const CosmicBelt = ({ innerRadius, outerRadius, count, color, thickness, opacity }: CosmicBeltProps) => {
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2
            const r     = innerRadius + Math.random() * (outerRadius - innerRadius)
            arr[i * 3]     = Math.cos(angle) * r
            arr[i * 3 + 1] = (Math.random() - 0.5) * 2 * thickness
            arr[i * 3 + 2] = Math.sin(angle) * r
        }
        return arr
    }, [innerRadius, outerRadius, count, thickness])

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                color={color}
                size={1.5}
                sizeAttenuation={false}
                transparent
                opacity={opacity}
                depthWrite={false}
            />
        </points>
    )
}

const milkyWayTexture = new THREE.TextureLoader().load('/textures/planets/stars_milky_way.jpg')

type SystemSceneProps = {
    planets: Exoplanet[]
    planetPositionRefs?: THREE.Vector3[]
    isSolarSystem?: boolean
    onPlanetClick?: (index: number, orbitRadius: number, planetSize: number) => void
}

export const SystemScene = ({ planets, planetPositionRefs, isSolarSystem, onPlanetClick }: SystemSceneProps) => {
    const star      = planets[0]
    const starColor = tempToColor(star.st_teff)
    const starSize  = Math.min(Math.max((star.st_rad ?? 1) * 5, 15), 60)
    const solarRadiusInUnits = starSize

    const orbitRadii = useMemo(() => {
        const radii: number[] = []
        // Ring outer = planetSize * 2.6, max planetSize = starSize * 0.6
        // → max ring outer ≈ starSize * 1.56; orbit center must clear star + ring outer
        const starClearance = starSize * 2.7 + 10
        planets.forEach((planet, i) => {
            const raw = (planet.pl_orbsmax ?? (i + 1) * 0.5) * AU
            let r = Math.max(raw, starClearance)
            if (i > 0) r = Math.max(r, radii[i - 1] + MIN_ORBIT_GAP)
            radii.push(r)
        })
        return radii
    }, [planets, starSize])

    return (
        <>
            {/* Milky Way background — large inverted sphere so it surrounds the scene */}
            <mesh>
                <sphereGeometry args={[50000, 64, 32]} />
                <meshBasicMaterial map={milkyWayTexture} side={THREE.BackSide} />
            </mesh>

            <pointLight position={[0, 0, 0]} intensity={2} distance={8000} color={starColor} />
            {/* Higher ambient so textures are visible from all angles */}
            <ambientLight intensity={0.45} />
            <StarGlow starSize={starSize} starColor={starColor} />
            <StarMesh starSize={starSize} starColor={starColor} isSolarSystem={isSolarSystem} />
            {planets.map((planet, i) => (
                <OrbitingPlanet
                    key={planet.pl_name}
                    planet={planet}
                    index={i}
                    orbitRadius={orbitRadii[i]}
                    solarRadiusInUnits={solarRadiusInUnits}
                    positionRef={planetPositionRefs?.[i]}
                    isSolarSystem={isSolarSystem}
                    onPlanetClick={(size) => onPlanetClick?.(i, orbitRadii[i], size)}
                />
            ))}

            {isSolarSystem && <HalleysComet />}

            {isSolarSystem && (
                <>
                    {/* Asteroid Belt — 2.2 to 3.2 AU, between Mars and Jupiter */}
                    <CosmicBelt
                        innerRadius={2.2 * AU}
                        outerRadius={3.2 * AU}
                        count={4000}
                        color="#9a8870"
                        thickness={6}
                        opacity={0.75}
                    />
                    {/* Kuiper Belt — 30 to 50 AU, beyond Neptune */}
                    <CosmicBelt
                        innerRadius={30 * AU}
                        outerRadius={50 * AU}
                        count={3000}
                        color="#6ea8c8"
                        thickness={120}
                        opacity={0.55}
                    />
                </>
            )}
        </>
    )
}