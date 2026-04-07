// nasa
import { NASAServiceDisplay } from '../NASA_Components/shared/NASAServiceDisplay'
import { PaginatedEONETEvents } from '../NASA_Components/EONET/PaginatedEONETEvents'
import { EONETCategoryFilter } from '../NASA_Components/EONET/EONETCategoryFilter'
import { useEONET } from '../hooks/EONET/useEONET'
import { NeonLinearProgress } from '../NASA_Components/shared/NeonLinearProgress'

// react
import { useState, useEffect, useMemo } from 'react'

export const EONET = () => {
    const { 
        loadingEONET, eonetResponse, fetchActiveEONET,
        eonetCategories, activeEonetCategory, loadingEONETCategories, fetchEONETCategories, setActiveEonetCategory
     } = useEONET()
    const [page, setPage] = useState<number>(0)
    const [rowsPerPage, setRowsPerPage] = useState<number>(10)

    // sorting
    const [sortedColumn, setSortedColumn] = useState<string>('title')
    const [sortDesc, setSortDesc] = useState<boolean>(true)

    // derived eonet events for filtering and sorting
    const filteredEONETEvents = useMemo(() => {
        const events = eonetResponse?.events.filter(eonetEvent => {
            return activeEonetCategory === 'All' || eonetEvent.categories.some(category => category.id === activeEonetCategory)
        }) ?? []

        return [...events].sort((a, b) => {
            if (sortedColumn === 'title') {
                return sortDesc
                    ? b.title.localeCompare(a.title)
                    : a.title.localeCompare(b.title)
            } else if (sortedColumn === 'categories') {
                return sortDesc
                    ? b.categories[0]?.title.localeCompare(a.categories[0]?.title || '') || 0
                    : a.categories[0]?.title.localeCompare(b.categories[0]?.title || '') || 0
            }

            return 0
        })
    }, [eonetResponse, activeEonetCategory, sortedColumn, sortDesc])

    function sortByColumn(column: string) {
        const newSortDesc = sortedColumn === column ? !sortDesc : true; // toggle if same column, otherwise default to ascending
        
        setSortedColumn(column)
        setSortDesc(newSortDesc)
        setPage(0) // reset to first page on sort
    }

    function handleCategoryChange(categoryId: string) {
        setActiveEonetCategory(categoryId)
        setPage(0) // reset to first page on category change
    }

    // fetch EONET data on component mount
    useEffect(() => {
        fetchActiveEONET()
        fetchEONETCategories()
    }, [])

    // render page
    const renderPage = (eonetCategories.length > 0 && 
                        !loadingEONETCategories &&
                        filteredEONETEvents.length > 0 &&
                        !loadingEONET)

    return (
        <>
            <NASAServiceDisplay serviceAcronym='EONET' serviceName="Earth Observatory Natural Event Tracker" />

            {loadingEONET && (
                <>  
                    <NeonLinearProgress />
                    <p>Fetching Cosmic Data...</p>
                </>
            )}

            {renderPage && (
                <>
                    <EONETCategoryFilter 
                        categories={eonetCategories} 
                        activeCategory={activeEonetCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                    <PaginatedEONETEvents 
                        eonetEvents={filteredEONETEvents} 
                        page={page}
                        setPage={setPage}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        sortedColumn={sortedColumn}
                        sortByColumn={sortByColumn}
                        sortDesc={sortDesc}
                    />
                </>
            )}
        </>
    )
}