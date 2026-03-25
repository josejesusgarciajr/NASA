// react
import { useEffect } from 'react'

import { NEOFeedDisplay } from '../NASA_Components/NEOWS/NEOFeedDisplay'
import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay'

// MATERIAL UI
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert';

// Near Earth Object Web Service
import { useNEOWS } from '../hooks/NEOWS/useNEOWS';

// utils
import { addDays } from '../utils/dateUtils'

export const NEOWS = () => {
    
    const 
    { 
        neoFeedResponse, loadingNEO, loadingNEOSELF, errorNEO,
        startDateRangeStr, endDateRangeStr, 
        fetchNeoFeedResponse, handleLoadingNEOSelf
    } = useNEOWS();
    
    const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY

    // NEO
    const today = new Date()
    const localDate = today.toLocaleDateString('en-CA')
    const date7DaysOut = addDays(today, 7).toLocaleDateString('en-CA')
    const NASA_NEO_URL = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${localDate}&end_date=${date7DaysOut}&api_key=${NASA_API_KEY}`

    useEffect(() => {
        fetchNeoFeedResponse(NASA_NEO_URL);
    }, []);

    return (
        <>
            {(loadingNEO || loadingNEOSELF) && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
                <LinearProgress />
                </Box>
            )}

            {errorNEO && (
                <Alert variant="outlined" severity="error" sx={{ maxWidth: '600px', mx: 'auto', mt: 2 }}>
                    {errorNEO}
                </Alert>
            )}

            {neoFeedResponse && (
                <>
                    <NASAServiceDisplay serviceAcronym="ASTEROIDS - NEOWS" serviceName="Near Earth Object Web Service" />
                    <NEOFeedDisplay
                        neoFeedResponse={neoFeedResponse}
                        neoNavLink={fetchNeoFeedResponse}
                        loadingNEO={loadingNEO}
                        setLoadingNEOSELF={handleLoadingNEOSelf}
                        startDateRangeStr={startDateRangeStr}
                        endDateRangeStr={endDateRangeStr}
                    />
                </>
            )}

            {loadingNEO && <p>Fetching Cosmic Data...</p>}
        </>
    );
}