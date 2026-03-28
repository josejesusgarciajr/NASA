// nasa
import { useExoplanets } from '../hooks/Exoplanets/useExoplanets'
import { GalaxyCanvas } from '../NASA_Components/Galaxy/GalaxyCanvas'
import { SystemCanvas } from '../NASA_Components/Galaxy/SystemCanvas'
import type { Exoplanet } from '../types/NASA/Exoplanets'

// react
import { useEffect, useState, useCallback } from 'react'

// material ui
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'

export const DOME = () => {
    const { exoplanets, loadingExoplanets, errorExoplanets, fetchExoplanets } = useExoplanets()
    const [view, setView] = useState<'galaxy' | 'system'>('galaxy')
    const [selectedSystem, setSelectedSystem] = useState<string | null>(null)
    const [overlayOpacity, setOverlayOpacity] = useState(0)
    const [overlayActive, setOverlayActive] = useState(false)

    useEffect(() => { fetchExoplanets() }, [])

    const systemPlanets = selectedSystem
        ? exoplanets.filter(e => e.hostname === selectedSystem)
        : []

    const handleEnterSystem = useCallback((star: Exoplanet) => {
        setOverlayActive(true)
        // Double rAF ensures the div is painted before we trigger the transition
        requestAnimationFrame(() => requestAnimationFrame(() => setOverlayOpacity(1)))
        setTimeout(() => {
            setSelectedSystem(star.hostname)
            setView('system')
            setTimeout(() => {
                setOverlayOpacity(0)
                setTimeout(() => setOverlayActive(false), 700)
            }, 150)
        }, 700)
    }, [])

    const handleBack = useCallback(() => {
        setOverlayActive(true)
        requestAnimationFrame(() => requestAnimationFrame(() => setOverlayOpacity(1)))
        setTimeout(() => {
            setView('galaxy')
            // Extra delay so CameraRestorer has time to run before we reveal the scene
            setTimeout(() => {
                setOverlayOpacity(0)
                setTimeout(() => setOverlayActive(false), 700)
            }, 250)
        }, 600)
    }, [])

    return (
        <>
            {loadingExoplanets && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 3000 }}>
                    <LinearProgress />
                </Box>
            )}

            {exoplanets.length > 0 && (
                view === 'system' && selectedSystem && systemPlanets.length > 0 ? (
                    <SystemCanvas hostname={selectedSystem} planets={systemPlanets} onBack={handleBack} />
                ) : (
                    <GalaxyCanvas exoplanets={exoplanets} onEnterSystem={handleEnterSystem} />
                )
            )}

            {overlayActive && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'black',
                    opacity: overlayOpacity,
                    transition: 'opacity 0.6s ease',
                    zIndex: 2000,
                    pointerEvents: 'none',
                }} />
            )}

            {errorExoplanets && (
                <Alert variant="outlined" severity="error" sx={{ maxWidth: '600px', mx: 'auto', mt: 2 }}>
                    {errorExoplanets}
                </Alert>
            )}
        </>
    )
}
