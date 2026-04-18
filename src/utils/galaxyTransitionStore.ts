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

// ── Click-Sun shortcut ───────────────────────────────────────────────────────
// Replicates a real star-click on the Sun: saves camera, starts the Three.js
// zoom animation, and fires onEnterSystem — so the full pan-zoom-fade plays.
let _clickSunFn: (() => void) | null = null

export const registerClickSun = (fn: () => void): void => { _clickSunFn = fn }
export const triggerClickSun  = (): void => { _clickSunFn?.() }
