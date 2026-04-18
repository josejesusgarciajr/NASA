// nasa
import { STORAGE_KEY, getSavedAPODS } from '../../utils/apods'
import type { APOD } from '../../types/NASA/APOD'

// react
import { useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useAPODGallery() {
    const [savedAPODS, setSavedAPODS] = useState<APOD[]>(getSavedAPODS())
    const [clickedAPOD, setClickedAPOD] = useState<APOD | null>(null)
    const [searchParam, setSearchParam] = useSearchParams()

    const scrollPositionRef  = useRef(0);

    function removeAPOD(apod: APOD) {
        const updated = getSavedAPODS().filter(a => a.date !== apod.date)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

        setSavedAPODS(updated)
    }

    function handleCardClicked(apod: APOD) {
        scrollPositionRef.current = window.scrollY;
        setClickedAPOD(apod)
        setSearchParam({ date: apod.date })
    }

    function handleBack() {
        setSearchParam({})
        setClickedAPOD(null)
        // Wait for gallery to re-render before restoring scroll
        requestAnimationFrame(() => {
            window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
        });
    }

    return { 
        savedAPODS,
        removeAPOD, handleCardClicked, handleBack,
        clickedAPOD, setClickedAPOD,
        searchParam
    }
}