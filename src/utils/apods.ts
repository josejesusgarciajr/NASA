import type { APOD } from '../types/NASA/APOD'

export const STORAGE_KEY = 'saved-apods'

export function getSavedAPODS() : APOD[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
        return []
    }
}