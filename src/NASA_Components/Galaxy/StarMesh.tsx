// three
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// react
import { useRef, useMemo } from 'react'

// nasa
import { makeStarTexture } from '../../utils/galaxy'

type StarMeshProps = { starSize: number; starColor: THREE.Color }

export const StarMesh = ({ starSize, starColor }: StarMeshProps) => {
    const meshRef     = useRef<THREE.Mesh>(null)
    const matRef      = useRef<THREE.MeshStandardMaterial>(null)
    const starTexture = useMemo(() => makeStarTexture(starColor), [starColor])
    useFrame((_, delta) => {
        if (meshRef.current) meshRef.current.rotation.y += delta * 0.05
        if (matRef.current) starTexture.offset.x = (starTexture.offset.x + delta * 0.004) % 1
    })
    return (
        <mesh ref={meshRef}>
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