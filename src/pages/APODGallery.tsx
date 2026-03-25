// nasa
import { APODCard } from '../NASA_Components/APOD/APODCard'
import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay'
import { useAPODGallery } from '../hooks/APOD/useAPODGallery'

// material ui
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'

// react
import { useNavigate } from 'react-router-dom'

export const APODGallery = () => {
    const { savedAPODS } = useAPODGallery()
    const navigate = useNavigate();

    return (
        <>
            <NASAServiceDisplay 
                serviceAcronym='APOD Gallery' 
                serviceName='Your saved APODs!'
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
                                <APODCard apod={apod} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </>
    )
}