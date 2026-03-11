import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { glowSx } from '../types/glowSx';

import type { SelectChangeEvent } from '@mui/material/Select';

type NEODateFilterProps = {
    dates: string[];
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    loadingNEO: boolean;
}

export const NEODateFilter = ({dates, selectedDate, setSelectedDate, loadingNEO} : NEODateFilterProps) => {

    function handleSelectedDate(e: SelectChangeEvent) {
        const date = e.target.value;
        setSelectedDate(date === 'All' ? 'All' : date);
    }

    const menuItems = dates.map(date => {
        return (
            <MenuItem value={date}>{date}</MenuItem>
        );
    });

    return (
        <>
            <FormControl sx={{ m: 1, minWidth: 120, ...glowSx }} size="small" disabled={loadingNEO}>
                <InputLabel id="demo-select-small-label">Date</InputLabel>
                <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={selectedDate}
                    label="Date"
                    onChange={handleSelectedDate}
                >
                    <MenuItem value='All'>All</MenuItem>
                    {menuItems}
                </Select>
            </FormControl>
        </>
    )
}