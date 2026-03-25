// nasa
import { useExoplanets } from "../hooks/Exoplanets/useExoplanets";

// react
import { useEffect } from 'react'

// material ui
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import { GalaxyCanvas } from "../NASA_Components/Galaxy/GalaxyCanvas";

export const Exoplanets = () => {
    const { exoplanets, loadingExoplanets, errorExoplanets, fetchExoplanets } = useExoplanets();

    useEffect(() => {
        fetchExoplanets();
    }, []);

    useEffect(() => {
        console.log(exoplanets);
    }, [exoplanets]);

    return (
        <>
            {loadingExoplanets && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
                    <LinearProgress />
                </Box>
            )}

            {exoplanets.length > 0 &&  (
                <GalaxyCanvas exoplanets={exoplanets} />
            )}

            {errorExoplanets && (
                <Alert variant="outlined" severity="error" sx={{ maxWidth: '600px', mx: 'auto', mt: 2 }}>
                    {errorExoplanets}
                </Alert>
            )}

            {loadingExoplanets && <p>Fetching Cosmic Data...</p>}
        </>
    );
}