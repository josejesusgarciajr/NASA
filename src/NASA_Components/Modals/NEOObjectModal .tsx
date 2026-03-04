import type { NEOObject } from "../../types/NASA/NEOFeedResponse"

import { NEOCloseApproachTable } from '../NEOCloseApproachTable'
import { OrbitingBodySelect } from '../Modals/OrbitingBodySelect'

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';

import { useMediaQuery, useTheme } from '@mui/material';

import { useState, useMemo } from 'react';

type NEOObjectModalprops = {
    neoObject: NEOObject | null;
    onClose: () => void;
}

export const NEOObjectModal = ({neoObject, onClose} : NEOObjectModalprops) => {
    const open = Boolean(neoObject);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const orbitingOptions = [... new Set(neoObject?.close_approach_data.map(item => item.orbiting_body))];
    const [selectedOrbitingOption, setSelectedOrbitingOption] = useState<string>('');
    const [sortByColumn, setSortByColumn] = useState<string>('date');
    const [sortingDesc, setSortingDesc] = useState<boolean>(true);

    // pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(5);

    const closeApproachFilteredData = useMemo(() => {
        const filtered =
            neoObject?.close_approach_data.filter(cad => {
                return (
                    cad.orbiting_body === selectedOrbitingOption || selectedOrbitingOption === ''
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
            console.log(`handleSortBy - ${sortColumn} - ${true}`);

            return;
        }

        setSortByColumn(sortColumn);
        setSortingDesc(desc);
        console.log(`handleSortBy - ${sortColumn} - ${desc}`);
    }

    function onModalClose() {
        setSelectedOrbitingOption('');
        onClose();
    }

    return (
        <>
            <Dialog open={open} onClose={onModalClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
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
                        <Typography>
                            Estimated Diameter in miles: {neoObject?.estimated_diameter.miles.estimated_diameter_min} - {neoObject?.estimated_diameter.miles.estimated_diameter_max}
                        </Typography>
                        {orbitingOptions.length > 1 && (
                            <OrbitingBodySelect options={orbitingOptions} selectedOption={selectedOrbitingOption} onSelectedOption={filterOrbitingOption} />
                        )}
                    </Box>
                    { neoObject && (
                        <>
                            <Typography>Close Approaches</Typography>
                            <NEOCloseApproachTable closeApproaches={closeApproachFilteredData} 
                                page={page} setPage={setPage}
                                rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
                                sortBy={sortBy} sortByColumn={sortByColumn} desc={sortingDesc}/>
                        </>
                    )}
                </DialogContent>
            </Dialog> 
        </>
    );
}