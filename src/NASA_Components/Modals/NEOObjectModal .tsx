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

import { useState } from 'react';

type NEOObjectModalprops = {
    neoObject: NEOObject | null;
    onClose: () => void;
}

export const NEOObjectModal = ({neoObject, onClose} : NEOObjectModalprops) => {
    const open = Boolean(neoObject);

    const orbitingOptions = [... new Set(neoObject?.close_approach_data.map(item => item.orbiting_body))];
    const [selectedOrbitingOption, setSelectedOrbitingOption] = useState<string>('');

    const closeApproachFilteredData = neoObject?.close_approach_data.filter(cad => {
        return (
            cad.orbiting_body === selectedOrbitingOption || selectedOrbitingOption === ''
        )
    }) ?? [];

    function filterOrbitingOption(orbitingOption: string) {
        setSelectedOrbitingOption(orbitingOption);
    }

    function onModalClose() {
        setSelectedOrbitingOption('');
        onClose();
    }

    return (
        <>
            <Dialog open={open} onClose={onModalClose} maxWidth="md" fullWidth>
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
                            <NEOCloseApproachTable closeApproaches={closeApproachFilteredData} />
                        </>
                    )}
                </DialogContent>
            </Dialog> 
        </>
    );
}