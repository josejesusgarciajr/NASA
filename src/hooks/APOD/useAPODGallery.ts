// nasa
import { STORAGE_KEY, getSavedAPODS } from '../../utils/apods'
import type { APOD } from '../../types/NASA/APOD'

// react
import { useState } from 'react'

export function useAPODGallery() {
    const [savedAPODS, setSavedAPODS] = useState<APOD[]>(getSavedAPODS())

    function removeAPOD(apod: APOD) {
        const updated = getSavedAPODS().filter(a => a.date != apod.date)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

        setSavedAPODS(updated)
    }

    return { savedAPODS, removeAPOD }
}