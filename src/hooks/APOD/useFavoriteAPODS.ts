// nasa
import type { APOD } from '../../types/NASA/APOD'
import { STORAGE_KEY, getSavedAPODS } from '../../utils/apods'

// react
import { useState } from 'react'

export function useFavoriteAPODS(apod: APOD) {
    const isSavedAPOD = getSavedAPODS().some(a => a.date === apod.date)
    const [savedAPOD, setSavedAPOD] = useState<boolean>(isSavedAPOD)

    function saveAPOD() {
        const current = getSavedAPODS()
        const updated = [...current, apod]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

        setSavedAPOD(true)
    }

    return { 
        savedAPOD, setSavedAPOD, saveAPOD
    }
}
