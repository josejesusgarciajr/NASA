import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';

type NEODateFilterProps = {
    dates: string[];
    selectedDate: string;
    setSelectedDate: (date: string) => void;
}

export const NEODateFilter = ({dates, selectedDate, setSelectedDate} : NEODateFilterProps) => {

    function handleSelectedDate(e: SelectChangeEvent) {
        const date = e.target.value;
        setSelectedDate(date)
    }

    const menuItems = dates.map(date => {
        return (
            <MenuItem value={date}>{date}</MenuItem>
        );
    });

    return (
        <>
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id="demo-select-small-label">Date</InputLabel>
                <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={selectedDate}
                    label="Date"
                    onChange={handleSelectedDate}
                >
                    <MenuItem value=''>All</MenuItem>
                    {menuItems}
                </Select>
            </FormControl>
        </>
    )
}