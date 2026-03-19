export type Exoplanet = {
    pl_name: string;            // planet name: ex: Kepler-1167 b
    hostname: string;           // host star name: ex: Kepler-2267
    ra: number;                 // right ascension (degrees 0-360)
    dec: number;                // declination (degrees -90 to +90)
    sy_dist: number;            // distance from Earth in parsecs
    pl_rade: number | null;     // planet radisu in Earth radii
}