import dayjs, { Dayjs } from 'dayjs'

// NASA COMPONENTS
import { APODDisplay } from '../NASA_Components/APODDisplay';
import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay';

// NASA TYPES
import type { APOD } from '../types/NASA/APOD';

// REACT
import { useState } from 'react';

// MATERIAL UI
import LinearProgress from '@mui/material/LinearProgress'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box'

export const APODExplorer = () => {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [apod, setApod] = useState<APOD | null>(null);
    const [loadingAPOD, setLoadingAPOD] = useState<boolean>(false);
    const [errorAPOD, setErrorAPOD] =useState<string>('');

    const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY

    function fetchAPODWithDate(date: Dayjs | null) {
        if (!date) return

        setApod(null);
        setLoadingAPOD(true);
        setErrorAPOD('');
        const selectedDateString = date.format('YYYY-MM-DD')

        const NASA_APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${selectedDateString}`

        fetch(NASA_APOD_URL)
        .then(res => res.json())
        .then(data => {
            if (data.code === 404) {
                setErrorAPOD(data.msg)
            } else {
                setApod(data)
            }
        })
        .catch(err => {
            console.log(`ERROR FETCHING NASA API APOD ENDPOINT: ${err}`)
            setErrorAPOD('ERROR FETCHING NASA API APOD ENDPOINT')
        })
        .finally(() => setLoadingAPOD(false))
    }

    return (
        <>
            {loadingAPOD && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
                    <LinearProgress />
                </Box>
            )}

            <NASAServiceDisplay serviceAcronym='APOD' serviceName='Astronomy Picture of the Day' />
            <Typography
                variant="body1"
                sx={{
                    maxWidth: '600px',
                    color: 'text.secondary',
                    mb: 3,
                    mt: 1,
                    lineHeight: 1.7,
                    textAlign: 'center',
                    mx: 'auto',
                }}
            >
                Every day, NASA captures something extraordinary. Choose a date to travel back and see what the universe looked like on that day.
            </Typography>
            <DatePicker
                minDate={dayjs('1995-06-16')}
                maxDate={dayjs()}
                yearsOrder='desc'
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
                onAccept={(newDate) => fetchAPODWithDate(newDate)}
                closeOnSelect
                openTo="year"
                views={['year', 'month', 'day']}
                slotProps={{
                    layout: {
                        sx: {
                            '.MuiPickersMonth-monthButton.Mui-selected': {
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                outline: 'none',
                            },
                            '.MuiPickersMonth-monthButton:focus': {
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none',
                            },
                            '.MuiPickersYear-yearButton.Mui-selected': {
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                outline: 'none',
                            },
                            '.MuiPickersYear-yearButton:focus': {
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none',
                            },
                        }
                    }
                }}
            />

            {errorAPOD && (
                <Alert variant="outlined" severity="error" sx={{ maxWidth: '600px', mx: 'auto', mt: 2 }}>
                    {errorAPOD}
                </Alert>
            )}
            
            {apod && (
                <APODDisplay apod={apod} />
            )}

            {loadingAPOD && <p>Fetching Cosmic Data...</p>}
        </>
    );
}