// three
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

// nasa
import type { Exoplanet } from '../../types/NASA/Exoplanets'
import { SystemScene } from './SystemScene'
import { AU } from '../../utils/galaxy'

type SystemCanvasProps = {
    hostname: string
    planets: Exoplanet[]
    onBack: () => void
}

export const SystemCanvas = ({ hostname, planets, onBack }: SystemCanvasProps) => {
    const maxOrbit = Math.max(...planets.map(p => (p.pl_orbsmax ?? 0.5))) * AU
    const camDist  = Math.max(maxOrbit * 1.4, 70)

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, background: 'black' }}>
            <Canvas
                camera={{ position: [0, camDist * 0.4, camDist * 0.9], fov: 55, near: 0.1, far: 100000 }}
                style={{ width: '100%', height: '100%' }}
            >
                <SystemScene planets={planets} />
                <OrbitControls enableZoom enableRotate enablePan />
            </Canvas>

            <div
                onClick={onBack}
                style={{
                    position: 'fixed', top: '80px', left: '20px',
                    background: 'rgba(0,0,0,0.7)', color: 'white',
                    padding: '8px 16px', borderRadius: '4px', cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.2)', fontSize: '14px', zIndex: 1000,
                }}
            >
                ← Back to Galaxy
            </div>

            <div style={{
                position: 'fixed', top: '80px', right: '20px',
                background: 'rgba(0,0,0,0.7)', color: 'white',
                padding: '12px 16px', borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '13px', zIndex: 1000, minWidth: '220px',
            }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{hostname}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '1px', marginBottom: '8px' }}>STAR</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Temp</span>
                    <span>{planets[0].st_teff ? `${planets[0].st_teff.toLocaleString()} K` : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Radius</span>
                    <span>{planets[0].st_rad ? `${planets[0].st_rad} R☉` : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Distance</span>
                    <span>{planets[0].sy_dist ? `${planets[0].sy_dist.toFixed(1)} pc` : '—'}</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '1px', marginBottom: '8px' }}>PLANETS</div>
                {planets.map(p => (
                    <div key={p.pl_name} style={{ marginBottom: '6px' }}>
                        <div style={{ color: 'white' }}>{p.pl_name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                            {p.pl_orbsmax ? `${p.pl_orbsmax} AU orbit` : 'orbit unknown'}
                            {p.pl_rade ? ` · ${p.pl_rade} R⊕` : ''}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}