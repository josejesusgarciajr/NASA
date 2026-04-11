// react
import { useEffect } from 'react'

// nasa
import { NEOFeedDisplay } from '../NASA_Components/NEOWS/NEOFeedDisplay'
import { NASAServiceDisplay } from '../NASA_Components/shared/NASAServiceDisplay'
import { NeonLinearProgress } from '../NASA_Components/shared/NeonLinearProgress'
import { CosmicLoader } from '../NASA_Components/shared/CosmicLoader'

// MATERIAL UI
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
                <NeonLinearProgress />
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

            {loadingNEO && <CosmicLoader />}
        </>
    );
}