import type { NEOObject } from '../../types/NASA/NEOFeedResponse'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

type NEOObjectDisplayProps = {
    neoObject: NEOObject;
}

export const NEOObjectDisplay = ({neoObject} : NEOObjectDisplayProps) => {
    return (
        <Card variant="outlined" sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: neoObject.is_potentially_hazardous_asteroid
                ? '1px solid rgba(239,68,68,0.35)'
                : '1px solid rgba(56,189,248,0.12)',
            transition: 'border-color 0.25s, box-shadow 0.25s',
            '&:hover': {
                borderColor: neoObject.is_potentially_hazardous_asteroid
                    ? 'rgba(239,68,68,0.65)'
                    : 'rgba(56,189,248,0.4)',
                boxShadow: neoObject.is_potentially_hazardous_asteroid
                    ? '0 0 16px rgba(239,68,68,0.2)'
                    : '0 0 16px rgba(56,189,248,0.15)',
                cursor: 'pointer',
            },
        }}>
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