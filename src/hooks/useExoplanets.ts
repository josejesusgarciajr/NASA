import { useState } from 'react';
import type { Exoplanet } from '../types/NASA/Exoplanets';

export function useExoplanets() {
    const [exoplanets, setExoplanets] = useState<Exoplanet[]>([]);
    const [loadingExoplanets, setLoadingExoplanets] = useState<boolean>(false);
    const [errorExoplanets, setErrorExoplanets] = useState<string>('');

    const exoplanetUrl = 'https://nasa-api.runasp.net/api/nasa/exoplanets';

    function fetchExoplanets() {
        setLoadingExoplanets(true);
        setErrorExoplanets('');

        fetch(exoplanetUrl)
        .then(res => res.json())
        .then(data => setExoplanets(data))
        .catch(err => {
            console.log(err);
            setErrorExoplanets('Failed to load exoplanets');
        })
        .finally(() => {
            console.log('Finally...');
            setLoadingExoplanets(false);
        });
    }

    return { exoplanets, loadingExoplanets, errorExoplanets, fetchExoplanets };
}