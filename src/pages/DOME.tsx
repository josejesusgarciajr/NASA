// nasa
import { useExoplanets } from '../hooks/Exoplanets/useExoplanets'
import { GalaxyCanvas } from '../NASA_Components/Galaxy/GalaxyCanvas'
import { SystemCanvas } from '../NASA_Components/Galaxy/SystemCanvas'
import { NeonLinearProgress } from '../NASA_Components/shared/NeonLinearProgress'
import { CosmicLoader } from '../NASA_Components/shared/CosmicLoader'
import type { Exoplanet } from '../types/NASA/Exoplanets'

// react
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// material ui
import Alert from '@mui/material/Alert'

export const DOME = () => {
    const { exoplanets, loadingExoplanets, errorExoplanets, fetchExoplanets } = useExoplanets()
    const [searchParams, setSearchParams] = useSearchParams()
    const [view, setView] = useState<'galaxy' | 'system'>('galaxy')
    const [selectedSystem, setSelectedSystem] = useState<string | null>(
        () => searchParams.get('system')
    )
    const [overlayOpacity, setOverlayOpacity] = useState(0)
    const [overlayActive, setOverlayActive] = useState(false)

    useEffect(() => { fetchExoplanets() }, [])

    // Sync view state with the ?system= param so saved URLs open directly in system view
    useEffect(() => {
        const param = searchParams.get('system')
        if (param) {
            setSelectedSystem(param)
            setView('system')
        } else {
            setView('galaxy')
        }
    }, [searchParams])

    const systemPlanets   = selectedSystem
        ? exoplanets.filter(e => e.hostname === selectedSystem)
        : []
    const astrophageMode  = selectedSystem?.toLowerCase() === 'sun' && searchParams.get('astrophage') === 'true'

    useEffect(() => {
        const link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
        if (!link) return
        link.href = astrophageMode ? '/favicon-astrophage.svg' : '/favicon.svg'
        return () => { link.href = '/favicon.svg' }
    }, [astrophageMode])

    const handleEnterSystem = useCallback((star: Exoplanet) => {
        setOverlayActive(true)
        // Double rAF ensures the div is painted before we trigger the transition
        requestAnimationFrame(() => requestAnimationFrame(() => setOverlayOpacity(1)))
        setTimeout(() => {
            setSelectedSystem(star.hostname)
            setSearchParams({ system: star.hostname })
            setView('system')
            setTimeout(() => {
                setOverlayOpacity(0)
                setTimeout(() => setOverlayActive(false), 700)
            }, 150)
        }, 700)
    }, [setSearchParams])

    const handleBack = useCallback(() => {
        setOverlayActive(true)
        requestAnimationFrame(() => requestAnimationFrame(() => setOverlayOpacity(1)))
        setTimeout(() => {
            setSearchParams({})
            setView('galaxy')
            // Extra delay so CameraRestorer has time to run before we reveal the scene
            setTimeout(() => {
                setOverlayOpacity(0)
                setTimeout(() => setOverlayActive(false), 700)
            }, 250)
        }, 600)
    }, [setSearchParams])

    return (
        <>
            {loadingExoplanets && (
                <>
                    <NeonLinearProgress />
                    <CosmicLoader />
                </>
            )}

            {exoplanets.length > 0 && (
                view === 'system' && selectedSystem && systemPlanets.length > 0 ? (
                    <SystemCanvas hostname={selectedSystem} planets={systemPlanets} onBack={handleBack} astrophageMode={astrophageMode} />
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
