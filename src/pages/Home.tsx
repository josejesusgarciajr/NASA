
// react
import { useEffect } from 'react'

// NASA Components
import { APODDisplay } from '../NASA_Components/APOD/APODDisplay'
import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay'

// MATERIAL UI
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

// APOD
import { useAPOD } from '../hooks/APOD/useAPOD'

export function Home() {
  const { apod, loadingAPOD, fetchAPOD, errorAPOD } = useAPOD();

  useEffect(() => {
    fetchAPOD();
  }, []);

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