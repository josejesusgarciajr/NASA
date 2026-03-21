import type { APOD } from '../../types/NASA/APOD'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'

type APODCardProps = {
    apod: APOD;
}

export const APODCard = ({ apod }: APODCardProps) => {
    const shortDescription = apod.explanation?.length > 100
        ? apod.explanation.substring(0, 100) + '...'
        : apod.explanation

    return (
        <Card sx={{ backgroundColor: 'background.paper', height: '100%' }}>
            <CardActionArea sx={{ height: '100%' }}>
                <CardMedia
                    component='img'
                    height='160'
                    image={apod.hdurl ?? apod.url}
                    alt={apod.title}
                    sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {apod.date}
                    </Typography>
                    <Typography gutterBottom variant="h6" sx={{ fontSize: '0.95rem', mt: 0.5 }}>
                        {apod.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                        {shortDescription}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}