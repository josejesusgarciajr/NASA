// material ui
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'

export const NeonLinearProgress = () => {
    return (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
            <LinearProgress
                sx={{
                    height: 3,
                    backgroundColor: 'rgba(0, 120, 255, 0.08)',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#0088ff',
                        boxShadow: `
                            0 0 4px #0088ff,
                            0 0 12px #0088ff,
                            0 0 25px #0088ff,
                            0 0 50px #0066cc80,
                            0 0 80px #004499
                        `,
                    },
                }}
            />
        </Box>
    )
}