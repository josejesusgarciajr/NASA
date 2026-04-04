// react
import { useState } from 'react'

// nasa
import type { EONETCategoriesResponse, EONETResponse } from '../../types/NASA/EONET'

export function useEONET() {
    const [loadingEONET, setLoadingEONET] = useState<boolean>(false)
    const [eonetResponse, setEonetResponse] = useState<EONETResponse | null>(null)

    const [eonetCategoryResponse, setEonetCategoryResponse] = useState<EONETCategoriesResponse | null>(null)
    const [activeEonetCategory, setActiveEonetCategory] = useState<string>('All')
    const [loadingEONETCategories, setLoadingEONETCategories] = useState<boolean>(false)

    const eonetCategories = (eonetCategoryResponse?.categories ?? [])
        .map(category => ({ id: category.id, title: category.title }))
        .filter(category => 
            (eonetResponse?.events ?? []).some(event => 
                event.categories.some(c => c.id === category.id)
            )
        )

    function fetchEONETCategories() {
        setLoadingEONETCategories(true)

        fetch('https://eonet.gsfc.nasa.gov/api/v3/categories')
        .then(response => response.json())
        .then(data => {
            setEonetCategoryResponse(data)
        })
        .catch(error => {
            console.error('Error fetching EONET categories:', error)
        })
        .finally(() => {
            setLoadingEONETCategories(false)
        })
    }

    function fetchActiveEONET() {
        setLoadingEONET(true)

        fetch('https://eonet.gsfc.nasa.gov/api/v3/events')
        .then(response => response.json())
        .then(data => {
            setEonetResponse(data)
        })
        .catch(error => {
            console.error('Error fetching EONET data:', error)
        })
        .finally(() => {
            setLoadingEONET(false)
        })
    }

    return {
        loadingEONET, eonetResponse, fetchActiveEONET,
        eonetCategories, activeEonetCategory, loadingEONETCategories, fetchEONETCategories, setActiveEonetCategory
    }
}