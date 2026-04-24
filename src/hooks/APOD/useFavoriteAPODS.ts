import { useState } from 'react'
import type { APOD } from '../../types/NASA/APOD'
import { STORAGE_KEY, getSavedAPODS } from '../../utils/apods'
import { useAPODDelete } from './useAPODDelete'

export function useFavoriteAPODS(apod: APOD) {
    const isSavedAPOD = getSavedAPODS().some(a => a.date === apod.date)
    const [savedAPOD, setSavedAPOD] = useState<boolean>(isSavedAPOD)
    const { confirmingDelete, handleRemoveAPOD, removeAPOD, cancelDelete } = useAPODDelete(
        (updated) => setSavedAPOD(updated.some((a) => a.date === apod.date))
    )

    function saveAPOD() {
        const current = getSavedAPODS()
        const updated = [...current, apod]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

        setSavedAPOD(true)
    }

    return { 
        savedAPOD, saveAPOD, removeAPOD, confirmingDelete, 
        handleRemoveAPOD: () => handleRemoveAPOD(apod), 
        cancelDelete
    }
}
