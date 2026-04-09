// three
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// react
import { useRef, useMemo, useEffect } from 'react'

// nasa
import { makeStarTexture } from '../../utils/galaxy'
import { SUN_TEXTURE_URL } from '../../utils/solarPlanetTextures'

type StarMeshProps = { starSize: number; starColor: THREE.Color; isSolarSystem?: boolean }

export const StarMesh = ({ starSize, starColor, isSolarSystem }: StarMeshProps) => {
    const meshRef          = useRef<THREE.Mesh>(null)
    const matRef           = useRef<THREE.MeshStandardMaterial>(null)
    const proceduralTexture = useMemo(() => makeStarTexture(starColor), [starColor])

    // Load real sun texture for the solar system; swap it onto the material when ready
    useEffect(() => {
        if (!isSolarSystem) return
        let cancelled = false
        const loader = new THREE.TextureLoader()
        loader.load(SUN_TEXTURE_URL, (tex) => {
            if (cancelled) { tex.dispose(); return }
            tex.wrapS = THREE.RepeatWrapping
            tex.wrapT = THREE.ClampToEdgeWrapping
            if (matRef.current) {
                matRef.current.map = tex
                matRef.current.emissiveMap = tex
                matRef.current.needsUpdate = true
            }
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
                map={proceduralTexture}
                emissive={starColor}
                emissiveIntensity={1.8}
                emissiveMap={proceduralTexture}
                roughness={0.5}
                metalness={0}
            />
        </mesh>
    )
}