import type { NEOObject } from "../../../types/NASA/NEOFeedResponse"

import { NEOCloseApproachTable } from '../NEOCloseApproachTable'
import { OrbitingBodySelect } from './OrbitingBodySelect'
import { EstimatedDiameterNEO } from './EstimatedDiameterNEO'
import { buttonGlowSx } from "../../../types/buttonGlowSx"

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Button, Typography } from "@mui/material";
import Stack from '@mui/material/Stack';
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';

import { useMediaQuery, useTheme } from '@mui/material';

import { useState, useMemo } from 'react';

type NEOObjectModalprops = {
    neoObject: NEOObject | null;
    onClose: () => void;
    startDateRangeStr: string;
    endDateRangeStr: string;
}

export const NEOObjectModal = ({neoObject, onClose, startDateRangeStr, endDateRangeStr} : NEOObjectModalprops) => {
    const open = Boolean(neoObject);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // hazardous
    const hazardous = neoObject?.is_potentially_hazardous_asteroid;

    // units
    const [units, setUnits] = useState<string>('kilometers');

    // sorting and filters
    const orbitingOptions = [... new Set(neoObject?.close_approach_data.map(item => item.orbiting_body))];
    const [selectedOrbitingOption, setSelectedOrbitingOption] = useState<string>('All');
    const [sortByColumn, setSortByColumn] = useState<string>('date');
    const [sortingDesc, setSortingDesc] = useState<boolean>(true);

    // pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(5);

    const closeApproachFilteredData = useMemo(() => {
        const filtered =
            neoObject?.close_approach_data.filter(cad => {
                return (
                    cad.orbiting_body === selectedOrbitingOption || selectedOrbitingOption === 'All'
                );
            }) ?? [];
        
        switch (sortByColumn) {
            case 'date':
                if (sortingDesc) {
                    return filtered.sort((a, b) => new Date(b.close_approach_date).getTime() - new Date(a.close_approach_date).getTime());
                } else {
                    return filtered.sort((a, b) => new Date(a.close_approach_date).getTime() - new Date(b.close_approach_date).getTime());
                }
            case 'orbitingBody':
                if (sortingDesc) {
                    return filtered.sort((a, b) => b.orbiting_body.localeCompare(a.orbiting_body));
                } else {
                    return filtered.sort((a, b) => a.orbiting_body.localeCompare(b.orbiting_body));
                }
            case 'velocity':
                if(sortingDesc) {
                    return filtered.sort((a, b) => Number(b.relative_velocity.kilometers_per_hour) - Number(a.relative_velocity.kilometers_per_hour));
                } else {
                    return filtered.sort((a, b) => Number(a.relative_velocity.kilometers_per_hour) - Number(b.relative_velocity.kilometers_per_hour));
                }
            case 'missDistance':
                if (sortingDesc) {
                    return filtered.sort((a, b) => Number(b.miss_distance.kilometers) - Number(a.miss_distance.kilometers));
                } else {
                    return filtered.sort((a, b) => Number(a.miss_distance.kilometers) - Number(b.miss_distance.kilometers));
                }
        }
        
        return filtered;
    }, [neoObject, selectedOrbitingOption, sortByColumn, sortingDesc])

    function filterOrbitingOption(orbitingOption: string) {
        setSelectedOrbitingOption(orbitingOption);
        setPage(0)
    }

    function sortBy(sortColumn: string, desc: boolean) {
        setPage(0);
        
        // new sort column selected always start sorting desc
        if (sortByColumn !== sortColumn) {
            setSortByColumn(sortColumn);
            setSortingDesc(true);

            return;
        }

        setSortByColumn(sortColumn);
        setSortingDesc(desc);
    }

    function onModalClose() {
        setSelectedOrbitingOption('All');
        onClose();
    }

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onModalClose} 
                maxWidth="md" 
                fullWidth 
                fullScreen={fullScreen}
                scroll="paper"
                disableScrollLock
                sx={{
                    '& .MuiDialog-paper': {
                        margin: { xs: 0, md: '32px' },
                        maxHeight: { xs: '100%', md: 'calc(100% - 64px)' },
                    },
                    '& .MuiDialog-container': {
                        alignItems: { xs: 'flex-start', md: 'center' },
                    }
                }}
            >
                <DialogTitle>
                    <Box
                        sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        }}
                    >
                        <Typography variant="h6">
                            Near Earth Object: {neoObject?.name}
                        </Typography>

                        <IconButton size="small" onClick={onModalClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <EstimatedDiameterNEO neoObject={neoObject} units={units} />
                        {orbitingOptions.length > 1 && (
                            <OrbitingBodySelect options={orbitingOptions} selectedOption={selectedOrbitingOption} onSelectedOption={filterOrbitingOption} />
                        )}
                    </Box>
                    { neoObject && (
                        <>
                            <Stack direction='row' justifyContent='space-between' alignItems='center' width='100%' mb={1} sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 1 }} useFlexGap>
                                <Typography
                                    sx={{
                                        wordBreak: 'break-word',
                                        fontSize: { xs: '0.6rem', md: '1rem' }
                                    }}
                                >
                                    Close Approaches
                                </Typography>
                                <Stack direction='row' sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 1 }} useFlexGap>
                                    <Button 
                                        size="small"
                                        variant='outlined'
                                        onClick={() => setUnits('miles')}
                                        sx={{ fontSize: { xs: '0.55rem', md: '0.875rem' }, padding: { xs: '2px 6px', md: '6px 16px' }, ...buttonGlowSx }}
                                    >
                                        Miles
                                    </Button>
                                    <Button 
                                        size="small"
                                        variant='outlined'
                                        onClick={() => setUnits('kilometers')}
                                        sx={{ fontSize: { xs: '0.55rem', md: '0.875rem' }, padding: { xs: '2px 6px', md: '6px 16px' }, ...buttonGlowSx }}
                                    >
                                        Kilometers
                                    </Button>
                                </Stack>
                                {hazardous && (
                                    <Typography 
                                        color="error"
                                        sx={{
                                            wordBreak: 'break-word',
                                            fontSize: { xs: '0.6rem', md: '1rem' }
                                        }}
                                    >
                                        HAZARDOUS
                                    </Typography>
                                )}
                            </Stack>
                            <NEOCloseApproachTable closeApproaches={closeApproachFilteredData} 
                                page={page} setPage={setPage}
                                rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
                                sortBy={sortBy} sortByColumn={sortByColumn} desc={sortingDesc}
                                units={units} startDateRangeStr={startDateRangeStr} endDateRangeStr={endDateRangeStr} />
                        </>
                    )}
                </DialogContent>
            </Dialog> 
        </>
    );
}