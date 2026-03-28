// three
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// react
import { useRef, useMemo } from 'react'

// nasa
import { makeStarTexture } from '../../utils/galaxy'

type StarMeshProps = { starSize: number; starColor: THREE.Color }

export const StarMesh = ({ starSize, starColor }: StarMeshProps) => {
    const matRef      = useRef<THREE.MeshStandardMaterial>(null)
    const starTexture = useMemo(() => makeStarTexture(starColor), [starColor])
    useFrame(({ clock }) => {
        if (matRef.current) starTexture.offset.x = (clock.getElapsedTime() * 0.004) % 1
    })
    return (
        <mesh>
            <sphereGeometry args={[starSize, 64, 64]} />
            <meshStandardMaterial
                ref={matRef}
                map={starTexture}
                emissive={starColor}
                emissiveIntensity={1.8}
                emissiveMap={starTexture}
                roughness={0.5}
                metalness={0}
            />
        </mesh>
    )
}