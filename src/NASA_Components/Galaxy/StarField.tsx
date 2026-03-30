import type { Exoplanet } from '../../types/NASA/Exoplanets'

import { useMemo, useEffect, useRef } from 'react'
import { toCartesian } from '../../utils/coordinateUtils'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'

type StarFieldProps = {
    exoplanets: Exoplanet[];
    onHover: (exoplanet: Exoplanet | null) => void;
    onClick: (exoplanet: Exoplanet, worldPos: THREE.Vector3) => void;
}

// Creates a circular sprite texture so stars look round not square
function createCircleTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0,    'rgba(255,255,255,1)')
    gradient.addColorStop(0.45, 'rgba(255,255,255,1)')   // solid fill to near edge
    gradient.addColorStop(0.65, 'rgba(255,255,255,0.5)') // quick falloff
    gradient.addColorStop(0.85, 'rgba(255,255,255,0.1)') // tiny glow
    gradient.addColorStop(1,    'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(canvas)
}

// Convert stellar temperature in Kelvin to RGB color
// Based on real blackbody radiation physics
function tempToColor(teff: number | null): THREE.Color {
    if (!teff) return new THREE.Color(1, 1, 1) // default white

    if (teff > 30000) return new THREE.Color(0.6, 0.7, 1.0)   // O — blue
    if (teff > 10000) return new THREE.Color(0.7, 0.8, 1.0)   // B — blue-white
    if (teff > 7500)  return new THREE.Color(1.0, 1.0, 1.0)   // A — white
    if (teff > 6000)  return new THREE.Color(1.0, 1.0, 0.8)   // F — yellow-white
    if (teff > 5200)  return new THREE.Color(1.0, 0.9, 0.6)   // G — yellow (like our Sun)
    if (teff > 3700)  return new THREE.Color(1.0, 0.6, 0.3)   // K — orange
    return new THREE.Color(1.0, 0.3, 0.1)                     // M — red
}

export const StarField = ({ exoplanets, onHover, onClick } : StarFieldProps) => {
    const pointsRef = useRef<THREE.Points>(null)
    const { camera, gl } = useThree()
    const mouse = useRef(new THREE.Vector2())

    // Pre-allocated objects to avoid per-frame GC pressure
    const tempPoint = useRef(new THREE.Vector3())
    const mvMatrix  = useRef(new THREE.Matrix4())

    // Deduplicate by hostname — one point per star system
    const uniqueStars = useMemo(() => {
        const seen = new Set<string>()
        return exoplanets.filter(e => {
            if (seen.has(e.hostname)) return false
            seen.add(e.hostname)
            return true
        })
    }, [exoplanets])

    const { positions, colors, sizes } = useMemo(() => {
        const positions = new Float32Array(uniqueStars.length * 3)
        const colors = new Float32Array(uniqueStars.length * 3)
        const sizes = new Float32Array(uniqueStars.length)

        uniqueStars.forEach((star, i) => {
            const { x, y, z } = toCartesian(star)
            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z

            const color = tempToColor(star.st_teff)
            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b

            const radius = star.st_rad ?? 1
            sizes[i] = radius
        })

        return { positions, colors, sizes }
    }, [uniqueStars])

    const texture = useMemo(() => createCircleTexture(), []);

    const hoveredIndexRef = useRef<number | null>(null)

    useFrame(() => {
        if (!pointsRef.current) return

        // Build the model-view matrix (world → view space) once per frame
        camera.updateMatrixWorld()
        mvMatrix.current.multiplyMatrices(camera.matrixWorldInverse, pointsRef.current.matrixWorld)

        const width  = gl.domElement.width
        const height = gl.domElement.height

        // Mouse in physical pixels (NDC → physical px)
        const mouseXPx = (mouse.current.x + 1) * 0.5 * width
        const mouseYPx = (1 - mouse.current.y) * 0.5 * height

        let closestDistSq = Infinity
        let closestIndex  = -1

        for (let i = 0; i < uniqueStars.length; i++) {
            tempPoint.current.set(
                positions[i * 3],
                positions[i * 3 + 1],
                positions[i * 3 + 2],
            )

            // World → view space
            tempPoint.current.applyMatrix4(mvMatrix.current)

            // Discard stars behind the camera (z > 0 in view space)
            if (tempPoint.current.z >= 0) continue

            const depth = -tempPoint.current.z

            // View → NDC (includes perspective divide)
            tempPoint.current.applyMatrix4(camera.projectionMatrix)

            // NDC → physical pixels
            const xPx = (tempPoint.current.x + 1) * 0.5 * width
            const yPx = (1 - tempPoint.current.y) * 0.5 * height

            const dx = xPx - mouseXPx
            const dy = yPx - mouseYPx
            const distSq = dx * dx + dy * dy

            // Mirror the vertex shader exactly: gl_PointSize = size * (150.0 / -mvPosition.z)
            // Hit radius = half of that, with a 4px floor so tiny stars are still hoverable
            const hitRadius = Math.max(sizes[i] * 150 / depth / 2, 4)

            if (distSq <= hitRadius * hitRadius && distSq < closestDistSq) {
                closestDistSq = distSq
                closestIndex  = i
            }
        }

        if (closestIndex !== -1) {
            if (hoveredIndexRef.current !== closestIndex) {
                hoveredIndexRef.current = closestIndex
                onHover(uniqueStars[closestIndex])
            }
        } else {
            if (hoveredIndexRef.current !== null) {
                hoveredIndexRef.current = null
                onHover(null)
            }
        }
    })

    useEffect(() => {
        const canvas = gl.domElement

        function onMouseMove(e: MouseEvent) {
            const rect = canvas.getBoundingClientRect()
            mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
            mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        }

        function onMouseClick() {
            const idx = hoveredIndexRef.current
            if (idx !== null) {
                const worldPos = new THREE.Vector3(
                    positions[idx * 3],
                    positions[idx * 3 + 1],
                    positions[idx * 3 + 2],
                )
                onClick(uniqueStars[idx], worldPos)
            }
        }

        canvas.addEventListener('mousemove', onMouseMove)
        canvas.addEventListener('click', onMouseClick)
        return () => {
            canvas.removeEventListener('mousemove', onMouseMove)
            canvas.removeEventListener('click', onMouseClick)
        }
    }, [gl, uniqueStars, onClick, positions])

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
                <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={`
                    attribute float size;
                    attribute vec3 color;
                    varying vec3 vColor;
                    void main() {
                        vColor = color;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = size * (150.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `}
                fragmentShader={`
                    uniform sampler2D pointTexture;
                    varying vec3 vColor;
                    void main() {
                        gl_FragColor = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
                        if (gl_FragColor.a < 0.05) discard;
                    }
                `}
                uniforms={{ pointTexture: { value: texture } }}
                transparent={true}
                depthWrite={false}
            />
        </points>
    )
}
