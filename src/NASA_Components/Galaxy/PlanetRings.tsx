// three
import * as THREE from 'three'

// react
import { useMemo } from 'react'

// nasa
import type { PlanetType } from '../../types/NASA/Exoplanets'
import { makeIceGiantRingTexture, makeGasGiantRingTexture } from '../../utils/planetTextures' 

type PlanetRingsProps = { planetSize: number; type: PlanetType }

export const PlanetRings = ({ planetSize, type }: PlanetRingsProps) => {
    const { innerMult, outerMult, tilt, ringTexture } = useMemo(() => {
        if (type === 'ice_giant') return {
            innerMult:   1.3,
            outerMult:   2.8,
            tilt:        -Math.PI / 5,
            ringTexture: makeIceGiantRingTexture(),
        }
        return {
            innerMult:   1.4,
            outerMult:   2.6,
            tilt:        -Math.PI / 5,
            ringTexture: makeGasGiantRingTexture(),
        }
    }, [type])

    const geometry = useMemo(() => {
        const geo = new THREE.RingGeometry(planetSize * innerMult, planetSize * outerMult, 128)
        const pos = geo.attributes.position
        const uv  = geo.attributes.uv
        const v3  = new THREE.Vector3()
        const inner = planetSize * innerMult
        const outer = planetSize * outerMult
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i)
            uv.setXY(i, (v3.length() - inner) / (outer - inner), 0.5)
        }
        return geo
    }, [planetSize, innerMult, outerMult])

    return (
        <mesh rotation={[tilt, 0, 0.2]} geometry={geometry}>
            <meshBasicMaterial map={ringTexture} side={THREE.DoubleSide} transparent depthWrite={false} />
        </mesh>
    )
}