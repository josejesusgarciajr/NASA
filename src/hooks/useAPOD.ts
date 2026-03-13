import { useState } from 'react' 
import type { APOD } from '../types/NASA/APOD'

import { Dayjs } from 'dayjs'

export function useAPOD() {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [apod, setApod] = useState<APOD | null>(null)
    const [loadingAPOD, setLoadingAPOD] = useState<boolean>(false)
    const [errorAPOD, setErrorAPOD] = useState<string>('')

    const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY

    function fetchAPOD() {
        setLoadingAPOD(true);
        setErrorAPOD('');
        const NASA_APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`

        fetch(NASA_APOD_URL)
        .then(res => res.json())
        .then(data => {
            if (data.code) {
                // any error code from NASA (404, 500, etc.)
                setErrorAPOD(data.code === 500
                    ? 'NASA\'s APOD service is temporarily unavailable. Please try again later.'
                    : data.msg
                )
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
            if (data.code) {
                // any error code from NASA (404, 500, etc.)
                setErrorAPOD(data.code === 500
                    ? 'NASA\'s APOD service is temporarily unavailable. Please try again later.'
                    : data.msg
                )
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

    return { apod, loadingAPOD, errorAPOD, selectedDate, setSelectedDate, fetchAPOD, fetchAPODWithDate};
}