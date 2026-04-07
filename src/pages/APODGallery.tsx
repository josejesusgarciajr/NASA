// nasa
import type { APOD } from '../types/NASA/APOD'
import { APODCard } from '../NASA_Components/APOD/APODCard'
import { NASAServiceDisplay } from '../NASA_Components/shared/NASAServiceDisplay'
import { useAPODGallery } from '../hooks/APOD/useAPODGallery'

// material ui
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'

// react
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { APODDisplay } from '../NASA_Components/APOD/APODDisplay'

export const APODGallery = () => {
    const { savedAPODS, removeAPOD } = useAPODGallery()
    const [clickedAPOD, setClickedAPOD] = useState<APOD | null>(null)
    const scrollPositionRef  = useRef(0);
    const navigate = useNavigate();

    function handleCardClicked(apod: APOD) {
        scrollPositionRef.current = window.scrollY;
        setClickedAPOD(apod)
    }

    function handleBack() {
        setClickedAPOD(null)
        // Wait for gallery to re-render before restoring scroll
        requestAnimationFrame(() => {
            window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
        });
    }

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