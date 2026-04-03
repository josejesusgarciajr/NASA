// nasa
import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay'
import { useEONET } from '../hooks/EONET/useEONET'
import { PaginatedEONETEvents } from '../NASA_Components/EONET/PaginatedEONETEvents'

// react
import { useState, useEffect, useMemo } from 'react'

// material ui
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'

export const EONET = () => {
    const { loadingEONET, eonetResponse, fetchActiveEONET } = useEONET()
    const [page, setPage] = useState<number>(0)
    const [rowsPerPage, setRowsPerPage] = useState<number>(10)

    // sorting
    const [sortedColumn, setSortedColumn] = useState<string>('title')
    const [sortDesc, setSortDesc] = useState<boolean>(true)

    // derived eonet events for filtering and sorting
    const filteredEONETEvents = useMemo(() => {
        const events = eonetResponse?.events ?? []

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
    }, [eonetResponse, sortedColumn, sortDesc])

    function sortByColumn(column: string) {
        const newSortDesc = sortedColumn === column ? !sortDesc : true; // toggle if same column, otherwise default to ascending
        
        setSortedColumn(column)
        setSortDesc(newSortDesc)
        setPage(0) // reset to first page on sort
    }

    // fetch EONET data on component mount
    useEffect(() => {
        fetchActiveEONET()
    }, [])

    return (
        <>
            <NASAServiceDisplay serviceAcronym='EONET' serviceName="Earth Observatory Natural Event Tracker" />

            {loadingEONET && (
                <>
                    <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
                        <LinearProgress />
                    </Box>
                    <p>Fetching Cosmic Data...</p>
                </>
            )}

            {filteredEONETEvents.length > 0 && (
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
            )}
        </>
    )
}