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
            <CardContent sx={{ padding: { xs: '8px', md: '16px' }, '&:last-child': { paddingBottom: { xs: '8px', md: '16px' } } }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '0.7rem', md: '1.25rem' } }}>
                    {neoObject.name}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.6rem', md: '0.875rem' } }}>
                    Magnitude: {neoObject.absolute_magnitude_h}
                </Typography>
                {neoObject.is_potentially_hazardous_asteroid && (
                    <Typography 
                        color="error"
                        sx={{
                            textAlign: { xs: 'center' },
                            wordBreak: 'break-word',
                            fontSize: { xs: '0.6rem', md: '1rem' }
                        }}
                    >HAZARDOUS</Typography>
                )}
            </CardContent>
        </Card>
    );
}