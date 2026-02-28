import Typography from '@mui/material/Typography';

type NASAServiceDisplayProps = {
    serviceAcronym: string
    serviceName: string;
}

export const NASAServiceDisplay = ({serviceAcronym, serviceName} : NASAServiceDisplayProps) => {
    return (
        <>
            <Typography variant="h3" fontWeight="bold" gutterBottom
                sx={{ 
                    textAlign: 'center',
                    fontSize: {
                        xs: '1.8rem', // mobile
                        sm: '2.5rem', // tablet
                        md: '3rem',   // laptop
                    }
                 }}
            >
                {serviceAcronym}
            </Typography>
            <Typography variant="subtitle1" color="common.white"
                sx={{ textAlign: 'center' }}
            >
                {serviceName}
            </Typography>
        </>
    );
}