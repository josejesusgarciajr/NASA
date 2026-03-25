import type { NEOObject } from "../../../types/NASA/NEOFeedResponse"
import { Typography } from "@mui/material";

type EstimatedDiameterNEOProps = {
    neoObject: NEOObject | null;
    units: string;
}

export const EstimatedDiameterNEO = ({neoObject, units} : EstimatedDiameterNEOProps) => {

    function getEstimatedDiameter(minOrMax: 'min' | 'max') {
        const unit = units === 'kilometers' ? 'kilometers' : 'miles';
        const key = minOrMax === 'min' ? 'estimated_diameter_min' : 'estimated_diameter_max';
        return neoObject?.estimated_diameter[unit][key].toFixed(2);
    }

    return (
        <Typography
            sx={{
                wordBreak: 'break-word',
                fontSize: { xs: '0.6rem', md: '1rem' }
            }}
        >
            { `Estimated Diameter: ${getEstimatedDiameter('min')} - ${getEstimatedDiameter('max')} ${units}`}
        </Typography>
    );
}