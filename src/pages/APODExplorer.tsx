import dayjs from 'dayjs'

// NASA COMPONENTS
import { APODDisplay } from '../NASA_Components/APOD/APODDisplay';
import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay';

// MATERIAL UI
import LinearProgress from '@mui/material/LinearProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

// react
import { useEffect } from 'react';
import { useNavigate, useSearchParams} from 'react-router-dom';

// APOD
import { useAPOD } from '../hooks/useAPOD';
import { getRandomAPODDate } from '../utils/dateUtils'

export const APODExplorer = () => {
    const { apod, loadingAPOD, errorAPOD, selectedDate, setSelectedDate, fetchAPODWithDate } = useAPOD();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (searchParams.get('random') === 'true') {
            const randomDate = getRandomAPODDate();
            fetchAPODWithDate(randomDate);
            setSearchParams({});
        }
    }, [searchParams]);

    return (
        <>
            {loadingAPOD && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
                    <LinearProgress />
                </Box>
            )}

            <NASAServiceDisplay 
                serviceAcronym='APOD EXPLORER' 
                serviceName='Astronomy Picture of the Day'
                icon={
                    <IconButton onClick={() => navigate('/apod-gallery')}>
                        <PhotoLibraryIcon />
                    </IconButton>
                }
            />
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
                disabled={loadingAPOD}
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