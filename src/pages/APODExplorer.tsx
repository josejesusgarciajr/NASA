import dayjs, { Dayjs } from 'dayjs'

// NASA COMPONENTS
import { APODDisplay } from '../NASA_Components/APODDisplay';
import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay';

// NASA TYPES
import type { APOD } from '../types/NASA/APOD';

// REACT
import { useState, useEffect } from 'react';

// MATERIAL UI
import LinearProgress from '@mui/material/LinearProgress'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Typography } from '@mui/material';
import Box from '@mui/material/Box'

export const APODExplorer = () => {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [apod, setApod] = useState<APOD | null>(null);
    const [loadingAPOD, setLoadingAPOD] = useState<boolean>(false);
    const [errorAPOD, setErrorAPOD] =useState<string>('');

    const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY

    function fetchAPODWithDate() {

        if (!selectedDate) {
            return;
        }

        const selectedDateString = selectedDate!.format('YYYY-MM-DD')
        setLoadingAPOD(true)
        const NASA_APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${selectedDateString}`

        fetch(NASA_APOD_URL)
        .then(res => res.json())
        .then(data => setApod(data))
        .catch(err => {
            console.log(`ERROR FETCHING NASA API APOD ENDPOINT: ${err}`)
            setErrorAPOD('ERROR FETCHING NASA API APOD ENDPOINT')
        })
        .finally(() => setLoadingAPOD(false))
    }

    useEffect(() => {
        fetchAPODWithDate();
    }, [selectedDate]);

    return (
        <>
            {loadingAPOD && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
                    <LinearProgress />
                </Box>
            )}

            {loadingAPOD && <p>Loading APOD...</p>}
            {errorAPOD && errorAPOD}

            <NASAServiceDisplay serviceAcronym='APOD' serviceName='Astronomy Picture of the Day' />
            <Typography>
                Select a date from June 16, 1995 to see the Astromoney Picture of the Day that day!
            </Typography>
            <DatePicker
                minDate={dayjs('1995-06-16')}
                maxDate={dayjs()}
                yearsOrder='desc'
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
            />

            {apod && (
                <APODDisplay apod={apod}/>
            )}
        </>
    );
}