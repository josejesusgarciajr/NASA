// three
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// react
import { useRef, useMemo, useEffect, useState } from 'react'

// nasa
import { makeStarTexture } from '../../utils/galaxy'
import { SUN_TEXTURE_URL } from '../../utils/solarPlanetTextures'

type StarMeshProps = { starSize: number; starColor: THREE.Color; isSolarSystem?: boolean }

export const StarMesh = ({ starSize, starColor, isSolarSystem }: StarMeshProps) => {
    const meshRef           = useRef<THREE.Mesh>(null)
    const matRef            = useRef<THREE.MeshStandardMaterial>(null)
    const proceduralTexture = useMemo(() => makeStarTexture(starColor), [starColor])
    const [sunTexture, setSunTexture] = useState<THREE.Texture | null>(null)

    // activeTexture drives the JSX props — R3F reconciler stays in sync
    const activeTexture = sunTexture ?? proceduralTexture

    useEffect(() => {
        if (!isSolarSystem) return
        let cancelled = false
        const loader = new THREE.TextureLoader()
        loader.load(SUN_TEXTURE_URL, (tex) => {
            if (cancelled) { tex.dispose(); return }
            tex.wrapS = THREE.RepeatWrapping
            tex.wrapT = THREE.ClampToEdgeWrapping
            setSunTexture(tex)
        })
        return () => { cancelled = true }
    }, [isSolarSystem])

    useFrame((_, delta) => {
        if (meshRef.current) meshRef.current.rotation.y += delta * 0.05
        const map = matRef.current?.map
        if (map) map.offset.x = (map.offset.x + delta * 0.004) % 1
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[starSize, 64, 64]} />
            <meshStandardMaterial
                ref={matRef}
                map={activeTexture}
                emissive={starColor}
                emissiveIntensity={1.8}
                emissiveMap={activeTexture}
                roughness={0.5}
                metalness={0}
            />
        </mesh>
    )
}