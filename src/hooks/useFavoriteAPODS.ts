import { useState } from 'react'
import type { APOD } from '../types/NASA/APOD'
import { STORAGE_KEY, getSavedAPODS } from '.././utils/apods'

export function useFavoriteAPODS(apod: APOD) {
    const isSavedAPOD = getSavedAPODS().some(a => a.date === apod.date)
    const [savedAPOD, setSavedAPOD] = useState<boolean>(isSavedAPOD)

    function saveAPOD() {
        const current = getSavedAPODS()
        const updated = [...current, apod]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

        setSavedAPOD(true)
    }

    function removeAPOD() {
        const updated = getSavedAPODS().filter(a => a.date != apod.date)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        
        setSavedAPOD(false)
    }

    return { savedAPOD, saveAPOD, removeAPOD }
}