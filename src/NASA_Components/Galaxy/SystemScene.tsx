// nasa
import type { Exoplanet } from '../../types/NASA/Exoplanets'
import { OrbitingPlanet } from './OrbitingPlanet'
import { tempToColor } from '../../utils/galaxy'
import { StarGlow } from './StarGlow'
import { StarMesh } from './StarMesh'
import { AU, MIN_ORBIT_GAP } from '../../utils/galaxy'

// react
import { useMemo } from 'react'

type SystemSceneProps = { planets: Exoplanet[] }

export const SystemScene = ({ planets }: SystemSceneProps) => {
    const star      = planets[0]
    const starColor = tempToColor(star.st_teff)
    const starSize  = Math.min(Math.max((star.st_rad ?? 1) * 2, 4), 25)
    const solarRadiusInUnits = starSize

    const orbitRadii = useMemo(() => {
        const radii: number[] = []
        const starClearance = starSize + 18
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
            <pointLight position={[0, 0, 0]} intensity={2} distance={8000} color={starColor} />
            {/* Higher ambient so textures are visible from all angles */}
            <ambientLight intensity={0.45} />
            <StarGlow starSize={starSize} starColor={starColor} />
            <StarMesh starSize={starSize} starColor={starColor} />
            {planets.map((planet, i) => (
                <OrbitingPlanet
                    key={planet.pl_name}
                    planet={planet}
                    index={i}
                    orbitRadius={orbitRadii[i]}
                    solarRadiusInUnits={solarRadiusInUnits}
                />
            ))}
        </>
    )
}