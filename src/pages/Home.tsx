
// react
import { useEffect } from 'react'

// NASA Components
import { APODDisplay } from '../NASA_Components/APOD/APODDisplay'
import { NASAServiceDisplay } from '../NASA_Components/shared/NASAServiceDisplay'
import { NeonLinearProgress } from '../NASA_Components/shared/NeonLinearProgress'
import { CosmicLoader } from '../NASA_Components/shared/CosmicLoader'

// MATERIAL UI
import Alert from '@mui/material/Alert'

// APOD
import { useAPOD } from '../hooks/APOD/useAPOD'
import { useAPODDelete } from '../hooks/APOD/useAPODDelete'

export function Home() {
  const { apod, loadingAPOD, fetchAPOD, errorAPOD } = useAPOD();
  const { confirmingDelete, handleRemoveAPOD, removeAPOD, cancelDelete } = useAPODDelete()

  useEffect(() => {
    fetchAPOD();
  }, []);

  return (
    <>
      {loadingAPOD && (
        <NeonLinearProgress />
      )}

      {loadingAPOD && <CosmicLoader />}

      {apod && (
        <>
          <NASAServiceDisplay serviceAcronym='APOD' serviceName='Astronomy Picture of the Day' />
          <APODDisplay
            apod={apod}
            handleRemoveAPOD={handleRemoveAPOD}
            removeAPOD={removeAPOD}
            cancelDelete={cancelDelete}
            confirmingDelete={confirmingDelete}
          />
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