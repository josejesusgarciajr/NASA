// nasa
import { getSavedAPODS } from "../../utils/apods";
import type { APOD } from "../../types/NASA/APOD";

// react
import { useState } from 'react'

export function useAPODGallery() {
    const [savedAPODS, ] = useState<APOD[]>(getSavedAPODS())

    return { savedAPODS }
}