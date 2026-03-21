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

export const StarField = ({ exoplanets } : StarFieldProps) => {
    // Deduplicate by hostname — one point per star system
    const uniqueStars = useMemo(() => {
        const seen = new Set<string>()
        const stars = exoplanets.filter(e => {
            if (seen.has(e.hostname)) return false
            seen.add(e.hostname)
            return true
        })
        
        return stars
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
            sizes[i] = Math.min(Math.max(radius * 1.5, 0.5), 4) // tighter clamp
        })

        return { positions, colors, sizes }
    }, [uniqueStars])

    const texture = useMemo(() => createCircleTexture(), []);

    return (
        <points>
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