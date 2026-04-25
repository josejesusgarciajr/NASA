// react
import { useState } from 'react'

// nasa
import type { APOD } from '../../types/NASA/APOD'
import { STORAGE_KEY, getSavedAPODS } from '../../utils/apods'


export function useAPODDelete(onDeleted?: (updatedAPODS: APOD[]) => void) {
    const [confirmingDelete, setConfirmingDelete] = useState(false)
    const [apodToDelete, setApodToDelete] = useState<APOD | null>(null)

    function handleRemoveAPOD(apod: APOD) {
        setApodToDelete(apod)
        setConfirmingDelete(true)
    }

    function removeAPOD() {
        if (!apodToDelete) return

        const updated = getSavedAPODS().filter(a => a.date !== apodToDelete.date)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        
        setConfirmingDelete(false)
        setApodToDelete(null)

        if (!onDeleted) return;
        
        onDeleted(updated)
    }

    function cancelDelete() {
        setConfirmingDelete(false)
        setApodToDelete(null)
    }

    return { confirmingDelete, handleRemoveAPOD, removeAPOD, cancelDelete }
}