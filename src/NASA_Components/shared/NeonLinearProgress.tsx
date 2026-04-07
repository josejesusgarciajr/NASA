// material ui
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'

export const NeonLinearProgress = () => {
    return (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
            <LinearProgress />
        </Box>
    )
}