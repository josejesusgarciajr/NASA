// nasa
import type { APOD } from '../../types/NASA/APOD'
import { APODMediaContent } from './APODMediaContent'
import { useFavoriteAPODS } from '../../hooks/APOD/useFavoriteAPODS'

// help components
import { BackButton } from '../../components/BackButton'

// material ui
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { IconButton, Typography } from '@mui/material'

// react
import { useEffect } from 'react'

type APODDisplayProps = {
    apod: APOD;
    onBack?: () => void;
    backButtonText?: string;
}

export const APODDisplay = ({apod, onBack, backButtonText = '← Back'} : APODDisplayProps) => {
    // saved favorite apods
    const { savedAPOD, saveAPOD, removeAPOD } = useFavoriteAPODS(apod);

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [])

    return (
        <>
            {onBack && (
                <BackButton text={backButtonText} handleBack={onBack}/>
            )}

            <Typography
                variant="h5"
                sx={{
                    textAlign: 'center',
                    mb: 0.5,
                    fontSize: { xs: '1.05rem', sm: '1.35rem', md: '1.5rem' },
                    fontWeight: 600,
                    color: '#e2e8f0',
                }}
            >
                {apod.title}
                {!savedAPOD ? (
                    <IconButton onClick={saveAPOD} size="small" sx={{ ml: 0.5, color: '#94a3b8', '&:hover': { color: '#f472b6' } }}>
                        <FavoriteBorderIcon fontSize="small" />
                    </IconButton>
                ) : (
                    <IconButton onClick={removeAPOD} size="small" sx={{ ml: 0.5, color: '#f472b6' }}>
                        <FavoriteIcon fontSize="small" />
                    </IconButton>
                )}
            </Typography>
            <Typography
                variant="caption"
                sx={{
                    display: 'block',
                    textAlign: 'center',
                    mb: 2,
                    color: '#38bdf8',
                    letterSpacing: '0.12em',
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                }}
            >
                {apod.date}
            </Typography>
            <APODMediaContent apod={apod} />
            <Typography
                variant="body1"
                sx={{
                    textAlign: 'center',
                    maxWidth: '800px',
                    margin: '1.5rem auto 0',
                    lineHeight: 1.8,
                    color: '#94a3b8',
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                }}
            >
                {apod.explanation}
            </Typography>
        </>
    );
}