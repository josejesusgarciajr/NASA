// nasa
import type { APOD } from '../../types/NASA/APOD'
import { APODMediaContent } from './APODMediaContent'

// material ui
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import IconButton from '@mui/material/IconButton'
import FavoriteIcon from '@mui/icons-material/Favorite'

type APODCardProps = {
    apod: APOD;
    cardClicked: (apod: APOD) => void;
    removeAPOD: (apod: APOD) => void;
}

export const APODCard = ({ apod, cardClicked, removeAPOD }: APODCardProps) => {
    const shortDescription = apod.explanation?.length > 100
        ? apod.explanation.substring(0, 100) + '...'
        : apod.explanation

    return (
        <Card sx={{
            backgroundColor: 'background.paper',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(56,189,248,0.12)',
            transition: 'border-color 0.25s, box-shadow 0.25s',
            '&:hover': {
                borderColor: 'rgba(56,189,248,0.4)',
                boxShadow: '0 0 18px rgba(56,189,248,0.15)',
            },
        }}>
            <CardActionArea onClick={() => cardClicked(apod)} sx={{ flexGrow: 1 }}>
                <APODMediaContent apod={apod} />
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
            <CardActions sx={{ justifyContent: 'flex-end' }}>
                <IconButton
                    size="small"
                    onClick={() => removeAPOD(apod)}
                >
                    <FavoriteIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
            </CardActions>
        </Card>
    )
}