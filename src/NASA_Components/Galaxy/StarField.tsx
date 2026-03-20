import type { Exoplanet } from '../../types/NASA/Exoplanets'

import { useMemo } from 'react'
import { toCartesian } from '../../utils/coordinateUtils'
import * as THREE from 'three'

type StarFieldProps = {
    exoplanets: Exoplanet[];
}

// Creates a circular sprite texture so stars look round not square
function createCircleTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(canvas)
}

export const StarField = ({ exoplanets } : StarFieldProps) => {
    const positions = useMemo(() => {
        const coordinates = new Float32Array(exoplanets.length * 3);

        exoplanets.forEach((exoplanet, i) => {
            const { x, y, z } = toCartesian(exoplanet);
            coordinates[i * 3] = x;
            coordinates[i * 3 + 1] = y;
            coordinates[i * 3 + 2] = z;
        });

        return coordinates;
    }, [exoplanets]);

    const texture = useMemo(() => createCircleTexture(), []);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                color="white"
                size={3}
                sizeAttenuation={true}
                map={texture}
                transparent={true}
                alphaTest={0.01}
                depthWrite={false}
            />
        </points>
    )
}