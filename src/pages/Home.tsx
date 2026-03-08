import { useState, useEffect } from 'react'

// NASA types
import type { APOD } from '../types/NASA/APOD'

// NASA Components
import { APODDisplay } from '../NASA_Components/APODDisplay'

// MATERIAL UI
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay'

export function Home() {
  const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY

  // APOD
  const [apod, setApod] = useState<APOD | null>(null)
  const [loadingAPOD, setLoadingAPOD] = useState<boolean>(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [errorAPOD, setErrorAPOD] = useState<string>('')

  useEffect(() => {
    setLoadingAPOD(true);
    setImageLoaded(false);
    const NASA_APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`

    fetch(NASA_APOD_URL)
      .then(res => res.json())
      .then(data => setApod(data))
      .catch(err => {
        console.log(`ERROR FETCHING NASA API APOD ENDPOINT: ${err}`)
        setErrorAPOD('ERROR FETCHING NASA API APOD ENDPOINT')
      })
      .finally(() => setLoadingAPOD(false))
  }, [])

  return (
    <>
      {(loadingAPOD && !imageLoaded) && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
          <LinearProgress />
        </Box>
      )}

      {(loadingAPOD && !imageLoaded) && <p>Loading APOD...</p>}
      {errorAPOD && errorAPOD}
      {apod && (
        <>
          <NASAServiceDisplay serviceAcronym='APOD' serviceName='Astronomy Picture of the Day' />
          <APODDisplay apod={apod} setImageLoaded={setImageLoaded} />
        </>
      )}
    </>
  )
}