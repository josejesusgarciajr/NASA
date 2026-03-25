// nasa
import type { APOD } from '../../types/NASA/APOD'
import { APODMediaContent } from './APODMediaContent'
import { useFavoriteAPODS } from '../../hooks/useFavoriteAPODS'

// material ui
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { IconButton } from '@mui/material'

type APODDisplayProps = {
    apod: APOD;
}

export const APODDisplay = ({apod} : APODDisplayProps) => {
    // saved favorite apods
    const { savedAPOD, saveAPOD, removeAPOD } = useFavoriteAPODS(apod);

    return (
        <>
            <p style={{ textAlign: 'center' }}>
                {apod.title}
                {!savedAPOD ? (
                    <IconButton onClick={saveAPOD}>
                        <FavoriteBorderIcon />
                    </IconButton>
                ) : (
                    <IconButton onClick={removeAPOD}>
                        <FavoriteIcon />
                    </IconButton>
                )}
            </p>
            <p style={{ textAlign: 'center' }}>{apod.date}</p>
            <APODMediaContent apod={apod} />
            <br />
            <p style={{
                textAlign: 'center',
                maxWidth: '100%',
                margin: '0 auto',
                padding: '0'
            }}>
                {apod.explanation}
            </p>
        </>
    );
}