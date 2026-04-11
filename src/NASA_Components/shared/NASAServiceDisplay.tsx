import Typography from '@mui/material/Typography';

type NASAServiceDisplayProps = {
    serviceAcronym: string
    serviceName: string;
    icon?: React.ReactNode;
}

export const NASAServiceDisplay = ({serviceAcronym, serviceName, icon} : NASAServiceDisplayProps) => {
    return (
        <>
            <Typography variant="h3" fontWeight="bold" gutterBottom
                sx={{
                    textAlign: 'center',
                    fontSize: {
                        xs: '1.8rem',
                        sm: '2.5rem',
                        md: '3rem',
                    },
                    background: 'linear-gradient(135deg, #38bdf8 0%, #a78bfa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 18px rgba(56,189,248,0.25))',
                    letterSpacing: '0.04em',
                }}
            >
                {serviceAcronym}
            </Typography>
            <Typography variant="subtitle1"
                sx={{ textAlign: 'center', color: '#94a3b8', letterSpacing: '0.06em' }}
            >
                {serviceName} {icon}
            </Typography>
        </>
    );
}