export type PlanetType = 'gas_giant' | 'ice_giant' | 'super_earth' | 'rocky'

export type Exoplanet = {
    // Identity
    pl_name: string;
    hostname: string;

    // Position
    ra: number;
    dec: number;
    sy_dist: number;

    // Planet parameters
    pl_rade: number | null;         // planet radius (Earth radii)
    pl_masse: number | null;        // planet mass (Earth masses)
    pl_orbper: number | null;       // orbital period (days)
    pl_orbsmax: number | null;      // semi-major axis (AU)
    pl_orbeccen: number | null;     // orbital eccentricity
    pl_eqt: number | null;          // equilibrium temperature (K)

    // Stellar parameters
    st_teff: number | null;         // stellar temperature (K) → drives star color
    st_rad: number | null;          // stellar radius (solar radii) → drives star size
    st_mass: number | null;         // stellar mass (solar masses)
    st_lum: number | null;          // stellar luminosity (log solar)
    st_spectype: string | null;     // spectral type (G2V, K5, M3, etc.)

    // System info
    sy_snum: number | null;         // number of stars in system
    sy_pnum: number | null;         // number of planets in system

    // Discovery
    discoverymethod: string | null;
    disc_year: number | null;
}