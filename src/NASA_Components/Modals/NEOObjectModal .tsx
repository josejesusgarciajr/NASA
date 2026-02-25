import type { NEOObject } from "../../types/NASA/NEOFeedResponse"

import { NEOCloseApproachTable } from '../NEOCloseApproachTable'

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Typography } from "@mui/material";

type NEOObjectModalprops = {
    neoObject: NEOObject | null;
    onClose: () => void;
}

export const NEOObjectModal = ({neoObject, onClose} : NEOObjectModalprops) => {
    const open = Boolean(neoObject);

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Near Earth Object: {neoObject?.name}</DialogTitle>
                <DialogContent dividers>
                    Estimated Diameter in miles: {neoObject?.estimated_diameter.miles.estimated_diameter_min} - {neoObject?.estimated_diameter.miles.estimated_diameter_max}
                    { neoObject && (
                        <>
                            <Typography>Close Approaches</Typography>
                            <NEOCloseApproachTable closeApproaches={neoObject?.close_approach_data} />
                        </>
                    )}
                </DialogContent>
            </Dialog> 
        </>
    );
}