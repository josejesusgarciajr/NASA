import { APODCard } from '../NASA_Components/APOD_Components/APODCard'
import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay'
import { useAPODGallery } from '../hooks/useAPODGallery'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export const APODGallery = () => {
    const { savedAPODS } = useAPODGallery()

    return (
        <>
            <NASAServiceDisplay serviceAcronym='APOD Gallery' serviceName='View your saved APODs!' />

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