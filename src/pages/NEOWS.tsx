import { useState, useEffect } from 'react'
import { NEOFeedDisplay } from '../NASA_Components/NEOFeedDisplay'

// MATERIAL UI
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert';

import type { NEOFeedResponse } from '../types/NASA/NEOFeedResponse'

// Function to add days to a date
function addDays(date: Date, days: number) {
    const newDate = new Date(date)
    newDate.setDate(date.getDate() + days)
    return newDate
}

export const NEOWS = () => {
    const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY

    // NEO
    const today = new Date()
    const localDate = today.toLocaleDateString('en-CA')
    const date7DaysOut = addDays(today, 7).toLocaleDateString('en-CA')
    const NASA_NEO_URL = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${localDate}&end_date=${date7DaysOut}&api_key=${NASA_API_KEY}`

    const [neoFeedResponse, setNeoFeedResponse] = useState<NEOFeedResponse | null>(null)
    const [loadingNEO, setLoadingNEO] = useState<boolean>(false)
    const [loadingNEOSELF, setLoadingNEOSELF] = useState<boolean>(false)
    const [errorNEO, setErrorNEO] = useState<string>('')
    const [neoLink, setNeoLink] = useState<string>(NASA_NEO_URL)

    const startDateRangeStr = new URLSearchParams(new URL(neoLink).search).get('start_date') ?? ''
    const endDateRangeStr = new URLSearchParams(new URL(neoLink).search).get('end_date') ?? ''

    useEffect(() => {
        fetchNeoFeedResponse(NASA_NEO_URL)
    }, []);

    function fetchNeoFeedResponse(link: string) {
        setLoadingNEO(true)
        const secureLink = link.replace('http://', 'https://')
        setNeoLink(secureLink)

        fetch(secureLink)
        .then(res => res.json())
        .then(data => setNeoFeedResponse(data))
        .catch(err => {
            console.log(`ERROR FETCHING NASA API ASTERIODS - NEOWS ENDPOINT: ${err}`)
            setErrorNEO('Error loading Near Earth Object from NASA')
        })
        .finally(() => setLoadingNEO(false))
    }

    function handleLoadingNEOSelf(value: boolean) {
        setLoadingNEOSELF(value)
    }

    return (
        <>
            {(loadingNEO || loadingNEOSELF) && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
                <LinearProgress />
                </Box>
            )}

            {loadingNEO && <p>Fetching Cosmic Data...</p>}
            {errorNEO && (
                <Alert variant="outlined" severity="error" sx={{ maxWidth: '600px', mx: 'auto', mt: 2 }}>
                    {errorNEO}
                </Alert>
            )}
            {neoFeedResponse && (
                <NEOFeedDisplay
                    neoFeedResponse={neoFeedResponse}
                    neoNavLink={fetchNeoFeedResponse}
                    setLoadingNEOSELF={handleLoadingNEOSelf}
                    startDateRangeStr={startDateRangeStr}
                    endDateRangeStr={endDateRangeStr}
                />
            )}
        </>
    );
}