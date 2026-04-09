
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
                background: 'rgba(0,0,0,0.7)', color: 'white',
                borderRadius: '4px', cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.2)', zIndex: 1000,
                padding: { xs: '5px 10px', sm: '8px 16px' },
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
            }}
        >
            {text}
        </Box>
    )
}