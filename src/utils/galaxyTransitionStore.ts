import * as THREE from 'three'

interface GalaxyCameraState {
    position: THREE.Vector3
    target: THREE.Vector3
}

let saved: GalaxyCameraState | null = null

export const saveGalaxyCamera = (position: THREE.Vector3, target: THREE.Vector3) => {
    saved = { position: position.clone(), target: target.clone() }
}

export const getSavedGalaxyCamera = (): GalaxyCameraState | null => saved

// ── Zoom-to-Sun shortcut ─────────────────────────────────────────────────────
// GalaxyCanvas registers a callback here once the Sun exoplanet is resolved.
// NavBar calls triggerZoomToSun() without needing access to the canvas internals.
let _zoomToSunFn: (() => void) | null = null

export const registerZoomToSun = (fn: () => void): void => { _zoomToSunFn = fn }
export const triggerZoomToSun  = (): void => { _zoomToSunFn?.() }
