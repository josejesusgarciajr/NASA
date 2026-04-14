import dayjs from 'dayjs'

// NASA COMPONENTS
import { APODDisplay } from '../NASA_Components/APOD/APODDisplay';
import { NASAServiceDisplay } from '../NASA_Components/shared/NASAServiceDisplay';
import { NeonLinearProgress } from '../NASA_Components/shared/NeonLinearProgress';
import { CosmicLoader } from '../NASA_Components/shared/CosmicLoader';

// MATERIAL UI
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

// react
import { useEffect } from 'react';
import { useNavigate, useSearchParams} from 'react-router-dom';

// APOD
import { useAPOD } from '../hooks/APOD/useAPOD';
import { getRandomAPODDate } from '../utils/dateUtils'

export const APODExplorer = () => {
    const { apod, loadingAPOD, errorAPOD, selectedDate, setSelectedDate, fetchAPODWithDate } = useAPOD();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // on intial load, check if URL has date send (url shared)
    useEffect(() => {
        const dateParam = searchParams.get('date');
        if (!dateParam) {
            return;
        }

        const date = dayjs(dateParam);
        if (!date.isValid()) {
            return;
        }

        setSelectedDate(date);
        fetchAPODWithDate(date);
    }, [])

    // on rocket launch, show random apod
    useEffect(() => {
        if (searchParams.get('random') === 'true') {
            const randomDate = getRandomAPODDate();
            fetchAPODWithDate(randomDate);
            setSearchParams({ date: randomDate?.format('YYYY-MM-DD') ?? '' });
        }
    }, [searchParams]);

    function handleDateChange(newDate: dayjs.Dayjs | null) {
        if (newDate) {
            setSelectedDate(newDate)
            fetchAPODWithDate(newDate)
            setSearchParams({ date: newDate.format('YYYY-MM-DD') });
        }
    }

    return (
        <>
            {loadingAPOD && (
                <NeonLinearProgress />
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
                onAccept={(newDate) => handleDateChange(newDate)}
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

            {loadingAPOD && <CosmicLoader />}
        </>
    );
}