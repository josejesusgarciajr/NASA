// nasa
import { getSavedAPODS } from '../../utils/apods'
import type { APOD } from '../../types/NASA/APOD'

// react
import { useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAPODDelete } from './useAPODDelete'

export function useAPODGallery() {
    const [savedAPODS, setSavedAPODS] = useState<APOD[]>(getSavedAPODS())
    const [clickedAPOD, setClickedAPOD] = useState<APOD | null>(null)
    const { 
        confirmingDelete, handleRemoveAPOD, removeAPOD, cancelDelete 
    } = useAPODDelete(setSavedAPODS)
    const [searchParam, setSearchParam] = useSearchParams()

    const scrollPositionRef  = useRef(0);

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
        handleRemoveAPOD, removeAPOD, cancelDelete, confirmingDelete,
        handleCardClicked, handleBack,
        clickedAPOD, setClickedAPOD,
        searchParam
    }
}