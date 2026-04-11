// material ui
import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material'

// nasa
import { glowSx } from '../../types/glowSx'

type NASASelectProps = {
    label: string;
    options: string[];
    selectedValue: string;
    onChange: (value: string) => void;
    loading: boolean;
    ignoreAll?: boolean;
}

export const NASASelect = ({label, options, selectedValue, onChange, loading, ignoreAll}: NASASelectProps) => {

    const menuItems = options.map(option => {
        return <MenuItem value={option}>{option}</MenuItem>
    })

    function handleOnChange(e: SelectChangeEvent) {
        const newValue = e.target.value;

        if (newValue === selectedValue) {
            return
        }

        onChange(newValue);
    }

    return (
        <FormControl sx={{ m: 1, minWidth: 120, ...glowSx }} size="small" disabled={loading}>
            <InputLabel id="demo-select-small-label">{label}</InputLabel>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={selectedValue}
                label={label}
                onChange={handleOnChange}
            >
                {!ignoreAll && (
                    <MenuItem value='All'>All</MenuItem>
                )}
                {menuItems}
            </Select>
        </FormControl>
    )
}