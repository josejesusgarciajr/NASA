import Typography from '@mui/material/Typography';

type NASAServiceDisplayProps = {
    serviceAcronym: string
    serviceName: string;
}

export const NASAServiceDisplay = ({serviceAcronym, serviceName} : NASAServiceDisplayProps) => {
    return (
        <>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
                {serviceAcronym}
            </Typography>
            <Typography variant="subtitle1" color="common.white">
                {serviceName}
            </Typography>
        </>
    );
}