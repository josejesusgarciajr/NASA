import type { NEOObject } from "../../types/NASA/NEOFeedResponse"

import { NEOCloseApproachTable } from '../NEOCloseApproachTable'

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';

type NEOObjectModalprops = {
    neoObject: NEOObject | null;
    onClose: () => void;
}

export const NEOObjectModal = ({neoObject, onClose} : NEOObjectModalprops) => {
    const open = Boolean(neoObject);

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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

                        <IconButton size="small" onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
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