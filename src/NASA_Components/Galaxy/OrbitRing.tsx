// three
import * as THREE from 'three'

// react
import { useMemo } from 'react'

type OrbitRingProps = { orbitRadius: number }

export const OrbitRing = ({ orbitRadius }: OrbitRingProps) => {
    const line = useMemo(() => {
        const points: THREE.Vector3[] = []
        for (let i = 0; i <= 128; i++) {
            const angle = (i / 128) * Math.PI * 2
            points.push(new THREE.Vector3(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius))
        }
        const geo = new THREE.BufferGeometry().setFromPoints(points)
        const mat = new THREE.LineBasicMaterial({ color: 'white', opacity: 0.1, transparent: true })
        return new THREE.Line(geo, mat)
    }, [orbitRadius])
    return <primitive object={line} />
}