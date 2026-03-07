import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { glowSx } from '../../types/glowSx';

import type { SelectChangeEvent } from '@mui/material/Select';

type OrbitingBodySelectProps = {
    options: string[];
    selectedOption: string;
    onSelectedOption: (selectedOption: string) => void;
}

export const OrbitingBodySelect = ({options, selectedOption, onSelectedOption} : OrbitingBodySelectProps) => {

    const menuItems = options.map(option =>
        <MenuItem key={option} value={
            option === 'All' ?
            '' : option
        }>
            {option}
        </MenuItem>
    );

    function handleSelectedOption(e: SelectChangeEvent) {
        const selectedOption = e.target.value;
        onSelectedOption(selectedOption);
    }

    return (
        <>
            <FormControl sx={{ m: 1, minWidth: 120, ...glowSx }} size="small">
                <InputLabel id="demo-select-small-label">Orbiting</InputLabel>
                <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={selectedOption}
                    label="Orbiting"
                    onChange={handleSelectedOption}
                >
                    <MenuItem value=''>All</MenuItem>
                    {menuItems}
                </Select>
            </FormControl>
        </>
    );
}