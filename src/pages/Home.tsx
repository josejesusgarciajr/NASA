import { useState, useEffect } from 'react'

// NASA types
import type { APOD } from '../types/NASA/APOD'

// NASA Components
import { APODDisplay } from '../NASA_Components/APODDisplay'
import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay'

// MATERIAL UI
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert';

export function Home() {
  const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY

  // APOD
  const [apod, setApod] = useState<APOD | null>(null)
  const [loadingAPOD, setLoadingAPOD] = useState<boolean>(false)
  const [errorAPOD, setErrorAPOD] = useState<string>('')

  useEffect(() => {
    setLoadingAPOD(true);
    setErrorAPOD('');
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
      {loadingAPOD && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
          <LinearProgress />
        </Box>
      )}

      {loadingAPOD && <p>Fetching Cosmic Data...</p>}

      {apod && (
        <>
          <NASAServiceDisplay serviceAcronym='APOD' serviceName='Astronomy Picture of the Day' />
          <APODDisplay apod={apod} />
        </>
      )}

      {errorAPOD && (
          <Alert variant="outlined" severity="error" sx={{ maxWidth: '600px', mx: 'auto', mt: 2 }}>
              {errorAPOD}
          </Alert>
      )}
    </>
  )
}