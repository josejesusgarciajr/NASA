/**
 * Solar system planet textures — served locally from /public/textures/planets/.
 *
 * Download the free 2K textures from https://www.solarsystemscope.com/textures/
 * and save them into public/textures/planets/ with these exact filenames:
 *
 *   mercury.jpg          ← "2k_mercury"
 *   venus.jpg            ← "2k_venus_surface"
 *   earth_day.jpg        ← "2k_earth_daymap"
 *   earth_night.jpg      ← "2k_earth_nightmap"
 *   earth_clouds.jpg     ← "2k_earth_clouds"
 *   mars.jpg             ← "2k_mars"
 *   jupiter.jpg          ← "2k_jupiter"
 *   saturn.jpg           ← "2k_saturn"
 *   saturn_ring.png      ← "2k_saturn_ring_alpha"
 *   uranus.jpg           ← "2k_uranus"
 *   neptune.jpg          ← "2k_neptune"
 */

const BASE = '/textures/planets'

const SOLAR_PLANET_TEXTURE_URLS: Record<string, string> = {
    mercury: `${BASE}/mercury.jpg`,
    venus:   `${BASE}/venus_atmosphere.jpg`,
    mars:    `${BASE}/mars.jpg`,
    jupiter: `${BASE}/jupiter.jpg`,
    saturn:  `${BASE}/saturn.jpg`,
    uranus:  `${BASE}/uranus.jpg`,
    neptune: `${BASE}/neptune.jpg`,
}

export const SUN_TEXTURE_URL         = `${BASE}/sun.jpg`
export const EARTH_DAY_TEXTURE_URL   = `${BASE}/earth_daymap.jpg`
export const EARTH_NIGHT_TEXTURE_URL = `${BASE}/earth_nightmap.jpg`
export const EARTH_CLOUD_TEXTURE_URL = `${BASE}/earth_clouds.jpg`
export const SATURN_RING_TEXTURE_URL = `${BASE}/saturn_ring.png`

/** Returns the surface texture path for a known solar system planet, or null. */
export function getSolarPlanetTexturePath(planetName: string): string | null {
    const name = planetName.toLowerCase()
    if (name === 'earth') {
        const hour = new Date().getHours()
        return hour >= 6 && hour < 20 ? EARTH_DAY_TEXTURE_URL : EARTH_NIGHT_TEXTURE_URL
    }
    return SOLAR_PLANET_TEXTURE_URLS[name] ?? null
}
