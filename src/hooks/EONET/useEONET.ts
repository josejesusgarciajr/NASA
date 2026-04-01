// react
import { useState } from 'react'

// nasa
import type { EONETResponse } from '../../types/NASA/EONET'

export function useEONET() {
    const [loadingEONET, setLoadingEONET] = useState<boolean>(false)
    const [eonetResponse, setEonetResponse] = useState<EONETResponse | null>(null)

    function fetchActiveEONET() {
        setLoadingEONET(true)

        fetch('https://eonet.gsfc.nasa.gov/api/v3/events')
        .then(response => response.json())
        .then(data => {
            setEonetResponse(data)
        })
        .catch(error => {
            console.error('Error fetching EONET data:', error)
        })
        .finally(() => {
            setLoadingEONET(false)
        })
    }

    return {
        loadingEONET, eonetResponse, fetchActiveEONET
    }
}