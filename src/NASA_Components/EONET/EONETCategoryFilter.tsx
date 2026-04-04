
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { glowSx } from '../../types/glowSx';

// material ui
import type { SelectChangeEvent } from '@mui/material/Select';

type EONETCategoryFilterProps = {
    categories: { id: string, title: string }[]
    activeCategory: string
    onCategoryChange: (categoryId: string) => void;
}

export const EONETCategoryFilter = ({categories, activeCategory, onCategoryChange}: EONETCategoryFilterProps) => {

    function handleSelectedCategory(e: SelectChangeEvent) {
        const categoryId = e.target.value;

        if (activeCategory === categoryId) {
            return
        }

        onCategoryChange(categoryId === 'All' ? 'All' : categoryId);
    }

    const categoryMenuItems = categories.map(category => {
        return (
            <MenuItem key={category.id} value={category.id}>{category.title}</MenuItem>
        );
    })

    return (
        <FormControl sx={{ m: 1, minWidth: 120, ...glowSx }} size="small">
            <InputLabel id="demo-select-small-label">Category</InputLabel>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={activeCategory}
                label="Category"
                onChange={handleSelectedCategory}
            >
                <MenuItem value='All'>All</MenuItem>
                {categoryMenuItems}
            </Select>
        </FormControl>
    )
}