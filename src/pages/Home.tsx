import { useState, useEffect } from 'react'

// NASA types
import type { APOD } from '../types/NASA/APOD'
import type { NEOFeedResponse } from '../types/NASA/NEOFeedResponse'

// NASA Components
import { APODDisplay } from '../NASA_Components/APODDisplay'
import { NEOFeedDisplay } from '../NASA_Components/NEOFeedDisplay'

// MATERIAL UI
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'

// Function to add days to a date
function addDays(date: Date, days: number) {
  const newDate = new Date(date)
  newDate.setDate(date.getDate() + days)
  return newDate
}

export function Home() {
  const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY

  // APOD
  const [apod, setApod] = useState<APOD | null>(null)
  const [loadingAPOD, setLoadingAPOD] = useState<boolean>(false)
  const [errorAPOD, setErrorAPOD] = useState<string>('')

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
    setLoadingAPOD(true)
    const NASA_APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`

    fetch(NASA_APOD_URL)
      .then(res => res.json())
      .then(data => setApod(data))
      .catch(err => {
        console.log(`ERROR FETCHING NASA API APOD ENDPOINT: ${err}`)
        setErrorAPOD('ERROR FETCHING NASA API APOD ENDPOINT')
      })
      .finally(() => setLoadingAPOD(false))

    fetchNeoFeedResponse(NASA_NEO_URL)
  }, [])

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
      {(loadingAPOD || loadingNEO || loadingNEOSELF) && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
          <LinearProgress />
        </Box>
      )}

      {loadingAPOD && <p>Loading APOD...</p>}
      {errorAPOD && errorAPOD}
      {apod && <APODDisplay apod={apod} />}

      {loadingNEO && <p>Loading NEO...</p>}
      {errorNEO && errorNEO}
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
  )
}