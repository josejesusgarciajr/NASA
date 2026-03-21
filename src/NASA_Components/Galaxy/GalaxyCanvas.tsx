import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { StarField } from './StarField'
import type { Exoplanet } from '../../types/NASA/Exoplanets'

type GalaxyCanvasProps = {
    exoplanets: Exoplanet[];
}

export const GalaxyCanvas = ({ exoplanets } : GalaxyCanvasProps) => {
    return (
        <Canvas
            camera={{ position: [0, 0, 2000], fov: 75, near: 0.1, far: 100000 }}
            style={{ 
                width: '100vw', 
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                background: 'black',
                zIndex: 0
            }}
        >
            <ambientLight intensity={0.5} />
            <StarField exoplanets={exoplanets} />
            <OrbitControls
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                zoomSpeed={2}
                minDistance={5}
                maxDistance={4000}
            />

        </Canvas>
    );
}