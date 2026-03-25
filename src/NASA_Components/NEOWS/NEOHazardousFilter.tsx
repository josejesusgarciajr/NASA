import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { glowSx } from '../../types/glowSx';

import type { SelectChangeEvent } from '@mui/material/Select';

type NEOHazardousFilterProps = {
    hazardousOptions: string[];
    hazardous: boolean | null;
    selectedHazardous: (selectedHazardous: string) => void;
    loadingNEO: boolean;
}

export const NEOHazardousFilter = ({hazardousOptions, hazardous, selectedHazardous, loadingNEO} : NEOHazardousFilterProps) => {

    const menuItems = hazardousOptions.map(option => {
        return (
            <MenuItem value={option}>
                {option}
            </MenuItem>
        );
    })

    function handleSelectedHazardous(e: SelectChangeEvent) {
        const option = e.target.value;
        selectedHazardous(option);
    }

    return (
        <FormControl sx={{ m: 1, minWidth: 120, ...glowSx }} size="small" disabled={loadingNEO}>
            <InputLabel id="demo-select-small-label">Hazardous</InputLabel>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={        
                    hazardous === null
                    ? 'All'
                    : hazardous
                        ? 'HAZARDOUS'
                        : 'Not Hazardous'
                }
                label="Hazardous"
                onChange={handleSelectedHazardous}
            >
                <MenuItem value='All'>All</MenuItem>
                {menuItems}
            </Select>
        </FormControl>
    );
}