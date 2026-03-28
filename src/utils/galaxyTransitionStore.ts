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
