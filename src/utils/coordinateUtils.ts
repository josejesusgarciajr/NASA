import type { Exoplanet } from '../types/NASA/Exoplanets';

export function toCartesian(exoplanet: Exoplanet) {
    const raRad = (exoplanet.ra * Math.PI) / 180;
    const decRad = (exoplanet.dec * Math.PI) / 180;
    const distance = exoplanet.sy_dist;

    const x = distance * Math.cos(decRad) * Math.cos(raRad);
    const y = distance * Math.cos(decRad) * Math.sin(raRad);
    const z = distance * Math.sin(decRad);

    return { x, y, z };
}