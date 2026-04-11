// material ui
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'

export const NeonLinearProgress = () => {
    return (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
            <LinearProgress
                sx={{
                    height: 2,
                    backgroundColor: 'rgba(56,189,248,0.07)',
                    '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #38bdf8, #a78bfa)',
                        boxShadow: `
                            0 0 6px #38bdf8,
                            0 0 16px rgba(56,189,248,0.7),
                            0 0 30px rgba(56,189,248,0.4),
                            0 0 60px rgba(167,139,250,0.3)
                        `,
                    },
                }}
            />
        </Box>
    )
}