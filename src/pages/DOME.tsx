// nasa
import { useExoplanets } from '../hooks/Exoplanets/useExoplanets'
import { GalaxyCanvas } from '../NASA_Components/Galaxy/GalaxyCanvas'
import { SystemCanvas } from '../NASA_Components/Galaxy/SystemCanvas'

// react
import { useEffect } from 'react'
import { useSearchParams } from "react-router-dom"

// material ui
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'

export const DOME = () => {
    const { exoplanets, loadingExoplanets, errorExoplanets, fetchExoplanets } = useExoplanets();
    const [searchParams] = useSearchParams();
    const selectedSystem = searchParams.get('system')

    useEffect(() => {
        fetchExoplanets();
    }, []);

        // Get all planets for the selected system
    const systemPlanets = selectedSystem
        ? exoplanets.filter(e => e.hostname === selectedSystem)
        : []

    return (
        <>
            {loadingExoplanets && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
                    <LinearProgress />
                </Box>
            )}

            {exoplanets.length > 0 &&  (
                selectedSystem && systemPlanets.length > 0 ? (
                    <SystemCanvas hostname={selectedSystem} planets={systemPlanets} />
                ) : (
                    <GalaxyCanvas exoplanets={exoplanets} />
                )
            )}

            {errorExoplanets && (
                <Alert variant="outlined" severity="error" sx={{ maxWidth: '600px', mx: 'auto', mt: 2 }}>
                    {errorExoplanets}
                </Alert>
            )}

            {loadingExoplanets && <p>Fetching Cosmic Data...</p>}
        </>
    );
}