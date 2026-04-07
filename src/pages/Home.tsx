
// react
import { useEffect } from 'react'

// NASA Components
import { APODDisplay } from '../NASA_Components/APOD/APODDisplay'
import { NASAServiceDisplay } from '../NASA_Components/shared/NASAServiceDisplay'
import { NeonLinearProgress } from '../NASA_Components/shared/NeonLinearProgress'

// MATERIAL UI
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
        <NeonLinearProgress />
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