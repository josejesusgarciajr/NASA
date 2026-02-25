import type { NEOObject } from '../types/NASA/NEOFeedResponse'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

type NEOObjectDisplayProps = {
    neoObject: NEOObject;
}

export const NEOObjectDisplay = ({neoObject} : NEOObjectDisplayProps) => {
    return (
        <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
                <Typography variant="h6">{neoObject.name}</Typography>
                <Typography variant="body2">
                    Magnitude: {neoObject.absolute_magnitude_h}
                </Typography>
                {neoObject.is_potentially_hazardous_asteroid && (
                    <Typography color="error">HAZARDOUS</Typography>
                )}
            </CardContent>
        </Card>
    );
}