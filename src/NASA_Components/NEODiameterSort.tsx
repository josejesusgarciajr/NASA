import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { glowSx } from '../types/glowSx';

import type { SelectChangeEvent } from '@mui/material/Select';

type NEODiameterSortProps = {
    sortOptions: string[];
    selectedOption: string;
    sortByDiameter: (value: string) => void;
    loadingNEO: boolean;
}

export const NEODiameterSort = ({sortOptions, selectedOption, sortByDiameter, loadingNEO} : NEODiameterSortProps) => {
    
    function handleSortDiameter(e: SelectChangeEvent) {
        const sort = e.target.value;
        sortByDiameter(sort);
    }

    const menuItems = sortOptions.map(option =>
        <MenuItem
            value={
                option === 'Biggest to smallest' ? 'desc' : 'asc'
            }
        >
            {option}
        </MenuItem>
    );

    return (
        <>
            <FormControl sx={{ m: 1, minWidth: 120, ...glowSx }} size="small" disabled={loadingNEO}>
                <InputLabel id="demo-select-small-label">Diameter</InputLabel>
                <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={selectedOption}
                    label="Diameter"
                    onChange={handleSortDiameter}
                >
                    {menuItems}
                </Select>
            </FormControl>
        </>
    );
}