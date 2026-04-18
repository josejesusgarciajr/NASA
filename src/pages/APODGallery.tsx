// nasa
import { APODCard } from '../NASA_Components/APOD/APODCard'
import { APODDisplay } from '../NASA_Components/APOD/APODDisplay'
import { NASAServiceDisplay } from '../NASA_Components/shared/NASAServiceDisplay'
import { useAPODGallery } from '../hooks/APOD/useAPODGallery'
import { getSavedAPODS } from '../utils/apods'

// material ui
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'

// react
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const APODGallery = () => {
    const { 
        savedAPODS,
        removeAPOD, handleCardClicked, handleBack,
        clickedAPOD, setClickedAPOD,
        searchParam
    } = useAPODGallery()

    const navigate = useNavigate()

    // on mount, check if there's a date query param and open that APOD if found
    // if not found, redirect to apod explorer with that date to display apod
    useEffect(() => {
        if (searchParam.has('date')) {
            const date = searchParam.get('date')!
            const apod = getSavedAPODS().find(a => a.date === date)

            if (!apod) {
                // navigate to explorer with date param to show apod not in gallery
                navigate(`/apod-explorer?date=${date}`)
                return
            }
            
            setClickedAPOD(apod)
        }
    }, [])

    return (
        <>
            {clickedAPOD != null ? (
                <>
                    <NASAServiceDisplay 
                        serviceAcronym='APOD'
                        serviceName='Your saved APOD'
                    />
                    <APODDisplay apod={clickedAPOD} onBack={handleBack} backButtonText='← Back to Gallery' />
                </>
            ) : (
                <>
                    <NASAServiceDisplay 
                        serviceAcronym='APOD Gallery' 
                        serviceName='Your saved APODs'
                        icon={
                            <IconButton onClick={() => navigate('/apod-explorer')}>
                                <LibraryAddIcon />
                            </IconButton>
                        }
                    />

                    {savedAPODS.length === 0 ? (
                        <Typography
                            variant="body1"
                            sx={{
                                textAlign: 'center',
                                color: 'text.secondary',
                                mt: 4,
                            }}
                        >
                            No saved APODs yet. Go explore and save some!
                        </Typography>
                    ) : (
                        <Box sx={{ px: { xs: 2, sm: 4 }, pb: 4 }}>
                            <Grid container spacing={2} columns={{ xs: 1, sm: 2, md: 4 }}>
                                {savedAPODS.map(apod => (
                                    <Grid key={apod.date} size={1}>
                                        <APODCard apod={apod} cardClicked={handleCardClicked} removeAPOD={removeAPOD} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </>
            )}
        </>
    )
}