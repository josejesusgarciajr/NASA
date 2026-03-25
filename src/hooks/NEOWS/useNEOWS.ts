import type { NEOFeedResponse } from '../../types/NASA/NEOFeedResponse'
import { useState } from 'react'

export function useNEOWS() {

    const [neoFeedResponse, setNeoFeedResponse] = useState<NEOFeedResponse | null>(null)
    const [loadingNEO, setLoadingNEO] = useState<boolean>(false)
    const [loadingNEOSELF, setLoadingNEOSELF] = useState<boolean>(false)
    const [errorNEO, setErrorNEO] = useState<string>('')
    const [neoLink, setNeoLink] = useState<string>('')

    const startDateRangeStr = neoLink ? new URLSearchParams(new URL(neoLink).search).get('start_date') ?? '' : ''
    const endDateRangeStr = neoLink ? new URLSearchParams(new URL(neoLink).search).get('end_date') ?? '' : ''

    function fetchNeoFeedResponse(link: string) {
        setLoadingNEO(true)
        const secureLink = link.replace('http://', 'https://')
        setNeoLink(secureLink)

        fetch(secureLink)
        .then(res => res.json())
        .then(data => setNeoFeedResponse(data))
        .catch(err => {
            console.log(`ERROR FETCHING NASA API ASTERIODS - NEOWS ENDPOINT: ${err}`)
            setErrorNEO('Error loading Near Earth Object from NASA')
        })
        .finally(() => setLoadingNEO(false))
    }

    function handleLoadingNEOSelf(value: boolean) {
        setLoadingNEOSELF(value)
    }

    return { 
        neoFeedResponse, loadingNEO, loadingNEOSELF, errorNEO,
        startDateRangeStr, endDateRangeStr,
        fetchNeoFeedResponse, handleLoadingNEOSelf
    };
}