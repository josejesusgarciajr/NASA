// nasa
import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay'
import { useEONET } from '../hooks/EONET/useEONET'

// react
import { useEffect } from 'react'

// material ui
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'

export const EONET = () => {
    const { loadingEONET, fetchActiveEONET } = useEONET()

    useEffect(() => {
        fetchActiveEONET()
    }, [])

    return (
        <>
            <NASAServiceDisplay serviceAcronym='EONET' serviceName="Earth Observatory Natural Event Tracker" />

            {loadingEONET && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
                    <LinearProgress />
                </Box>
            )}
        </>
    )
}