// three
import * as THREE from 'three'

// react
import { useMemo } from 'react'

// nasa
import { makeGlowTexture } from '../../utils/galaxy'

type StarGlowProps = { starSize: number; starColor: THREE.Color }

export const StarGlow = ({ starSize, starColor }: StarGlowProps) => {
    const texture = useMemo(() => makeGlowTexture(starColor), [starColor])
    return (
        <sprite scale={[starSize * 10, starSize * 10, 1]}>
            <spriteMaterial map={texture} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
        </sprite>
    )
}