
import Box from '@mui/material/Box'

type BackButtonProps = {
    text: string;
    handleBack: () => void;
}

export const BackButton = ({text, handleBack} : BackButtonProps) => {
    return (
        <Box
            onClick={handleBack}
            sx={{
                position: 'fixed', top: '80px', left: '20px',
                background: 'rgba(5, 9, 26, 0.82)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#e2e8f0',
                borderRadius: '6px', cursor: 'pointer',
                border: '1px solid rgba(56,189,248,0.25)',
                zIndex: 1000,
                padding: { xs: '5px 10px', sm: '8px 16px' },
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                transition: 'border-color 0.2s, box-shadow 0.2s',
                '&:hover': {
                    borderColor: 'rgba(56,189,248,0.55)',
                    boxShadow: '0 0 12px rgba(56,189,248,0.2)',
                },
            }}
        >
            {text}
        </Box>
    )
}