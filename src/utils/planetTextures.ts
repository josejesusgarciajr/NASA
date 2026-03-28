// three
import * as THREE from 'three'

// ─── Planet textures ─────────────────────────────────────────────────────

export function makeIceGiantTexture(): THREE.Texture {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size * 2
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    const base = ctx.createLinearGradient(0, 0, 0, size)
    base.addColorStop(0,    '#041820')
    base.addColorStop(0.12, '#083848')
    base.addColorStop(0.30, '#0a6070')
    base.addColorStop(0.50, '#0d8090')
    base.addColorStop(0.70, '#0a6070')
    base.addColorStop(0.88, '#083848')
    base.addColorStop(1,    '#041820')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size * 2, size)

    for (let i = 0; i < 50; i++) {
        const x     = Math.random() * size * 2
        const y     = Math.random() * size
        const rx    = 50 + Math.random() * 120
        const ry    = 10 + Math.random() * 25
        const rot   = (Math.random() - 0.5) * 0.25
        const alpha = 0.12 + Math.random() * 0.18
        const swirl = ctx.createRadialGradient(x, y, 0, x, y, rx)
        swirl.addColorStop(0,   `rgba(20,210,230,${alpha * 1.5})`)
        swirl.addColorStop(0.4, `rgba(10,180,210,${alpha})`)
        swirl.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = swirl
        ctx.beginPath()
        ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2)
        ctx.fill()
    }

    const iceBands = [
        { y: 0.12, h: 0.022, a: 0.32 },
        { y: 0.24, h: 0.018, a: 0.25 },
        { y: 0.36, h: 0.028, a: 0.38 },
        { y: 0.48, h: 0.020, a: 0.28 },
        { y: 0.58, h: 0.030, a: 0.35 },
        { y: 0.70, h: 0.018, a: 0.25 },
        { y: 0.82, h: 0.024, a: 0.30 },
        { y: 0.92, h: 0.015, a: 0.20 },
    ]
    for (const band of iceBands) {
        const y = band.y * size
        const h = band.h * size
        const grad = ctx.createLinearGradient(0, y - h, 0, y + h)
        grad.addColorStop(0,   'rgba(0,0,0,0)')
        grad.addColorStop(0.5, `rgba(0,230,255,${band.a})`)
        grad.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, y - h, size * 2, h * 2)
    }

    for (const by of [0.18, 0.30, 0.42, 0.53, 0.64, 0.76, 0.87]) {
        const y    = by * size
        const grad = ctx.createLinearGradient(0, y - 7, 0, y + 7)
        grad.addColorStop(0,   'rgba(0,0,0,0)')
        grad.addColorStop(0.5, 'rgba(0,0,0,0.30)')
        grad.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, y - 7, size * 2, 14)
    }

    const icePolar = ctx.createLinearGradient(0, 0, 0, size)
    icePolar.addColorStop(0,    'rgba(0,5,12,0.75)')
    icePolar.addColorStop(0.18, 'rgba(0,0,0,0)')
    icePolar.addColorStop(0.82, 'rgba(0,0,0,0)')
    icePolar.addColorStop(1,    'rgba(0,5,12,0.75)')
    ctx.fillStyle = icePolar
    ctx.fillRect(0, 0, size * 2, size)

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
}

export function makeGasGiantTexture(): THREE.Texture {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size * 2
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    const base = ctx.createLinearGradient(0, 0, 0, size)
    base.addColorStop(0,    '#2a1a08')
    base.addColorStop(0.10, '#4a2e10')
    base.addColorStop(0.22, '#8a5a28')
    base.addColorStop(0.35, '#c8843a')
    base.addColorStop(0.50, '#d4924a')
    base.addColorStop(0.65, '#c8843a')
    base.addColorStop(0.78, '#8a5a28')
    base.addColorStop(0.90, '#4a2e10')
    base.addColorStop(1,    '#2a1a08')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size * 2, size)

    const gasBands = [
        { y: 0.06, h: 0.030, r: 210, g: 160, b: 90,  a: 0.40 },
        { y: 0.13, h: 0.020, r: 255, g: 200, b: 130, a: 0.35 },
        { y: 0.20, h: 0.040, r: 180, g: 110, b: 55,  a: 0.45 },
        { y: 0.29, h: 0.025, r: 240, g: 190, b: 120, a: 0.38 },
        { y: 0.37, h: 0.050, r: 200, g: 130, b: 60,  a: 0.50 },
        { y: 0.46, h: 0.030, r: 255, g: 210, b: 140, a: 0.42 },
        { y: 0.54, h: 0.050, r: 195, g: 125, b: 55,  a: 0.50 },
        { y: 0.63, h: 0.025, r: 245, g: 195, b: 125, a: 0.38 },
        { y: 0.71, h: 0.040, r: 175, g: 108, b: 50,  a: 0.45 },
        { y: 0.80, h: 0.020, r: 250, g: 198, b: 128, a: 0.35 },
        { y: 0.87, h: 0.030, r: 205, g: 155, b: 85,  a: 0.40 },
        { y: 0.94, h: 0.020, r: 230, g: 175, b: 100, a: 0.30 },
    ]
    for (const band of gasBands) {
        const y    = band.y * size
        const h    = band.h * size
        const grad = ctx.createLinearGradient(0, y - h, 0, y + h)
        grad.addColorStop(0,   'rgba(0,0,0,0)')
        grad.addColorStop(0.5, `rgba(${band.r},${band.g},${band.b},${band.a})`)
        grad.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, y - h, size * 2, h * 2)
    }

    for (const by of [0.09, 0.17, 0.25, 0.33, 0.42, 0.50, 0.58, 0.67, 0.75, 0.84, 0.91]) {
        const y    = by * size
        const grad = ctx.createLinearGradient(0, y - 8, 0, y + 8)
        grad.addColorStop(0,   'rgba(0,0,0,0)')
        grad.addColorStop(0.5, 'rgba(30,15,5,0.35)')
        grad.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, y - 8, size * 2, 16)
    }

    for (let i = 0; i < 60; i++) {
        const x     = Math.random() * size * 2
        const y     = Math.random() * size
        const rx    = 40 + Math.random() * 100
        const ry    = 8  + Math.random() * 20
        const rot   = (Math.random() - 0.5) * 0.2
        const alpha = 0.06 + Math.random() * 0.12
        const warm  = Math.random() > 0.5
        const swirl = ctx.createRadialGradient(x, y, 0, x, y, rx)
        swirl.addColorStop(0,   warm ? `rgba(255,200,120,${alpha * 1.4})` : `rgba(140,80,30,${alpha * 1.4})`)
        swirl.addColorStop(0.5, warm ? `rgba(230,170,90,${alpha})`        : `rgba(110,60,20,${alpha})`)
        swirl.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = swirl
        ctx.beginPath()
        ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2)
        ctx.fill()
    }

    const gx = size * 0.6, gy = size * 0.58
    const storm = ctx.createRadialGradient(gx, gy, 0, gx, gy, 55)
    storm.addColorStop(0,   'rgba(180,60,30,0.70)')
    storm.addColorStop(0.4, 'rgba(200,80,40,0.50)')
    storm.addColorStop(0.7, 'rgba(160,50,25,0.30)')
    storm.addColorStop(1,   'rgba(0,0,0,0)')
    ctx.fillStyle = storm
    ctx.beginPath()
    ctx.ellipse(gx, gy, 55, 32, 0.1, 0, Math.PI * 2)
    ctx.fill()

    const gasPolar = ctx.createLinearGradient(0, 0, 0, size)
    gasPolar.addColorStop(0,    'rgba(10,5,0,0.70)')
    gasPolar.addColorStop(0.15, 'rgba(0,0,0,0)')
    gasPolar.addColorStop(0.85, 'rgba(0,0,0,0)')
    gasPolar.addColorStop(1,    'rgba(10,5,0,0.70)')
    ctx.fillStyle = gasPolar
    ctx.fillRect(0, 0, size * 2, size)

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
}

export function makeSuperEarthTexture(): THREE.Texture {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size * 2
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    // Vivid ocean base — bright enough to show through lighting
    const base = ctx.createLinearGradient(0, 0, 0, size)
    base.addColorStop(0,   '#1a3a5c')
    base.addColorStop(0.2, '#1e5080')
    base.addColorStop(0.5, '#2268a0')
    base.addColorStop(0.8, '#1e5080')
    base.addColorStop(1,   '#1a3a5c')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size * 2, size)

    // Deep ocean variation — darker patches
    for (let i = 0; i < 30; i++) {
        const x     = Math.random() * size * 2
        const y     = Math.random() * size
        const rx    = 40 + Math.random() * 100
        const ry    = 20 + Math.random() * 50
        const rot   = Math.random() * Math.PI
        const alpha = 0.10 + Math.random() * 0.15
        const deep  = ctx.createRadialGradient(x, y, 0, x, y, rx)
        deep.addColorStop(0,   `rgba(10,60,120,${alpha * 1.5})`)
        deep.addColorStop(0.5, `rgba(8,45,95,${alpha})`)
        deep.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = deep
        ctx.beginPath()
        ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2)
        ctx.fill()
    }

    // Continents — vivid greens and browns, high contrast
    const continents = [
        // Large continent — Europe/Asia style
        { x: 0.18, y: 0.30, rx: 0.14, ry: 0.18, r: 85,  g: 140, b: 55  },
        { x: 0.28, y: 0.22, rx: 0.10, ry: 0.12, r: 95,  g: 150, b: 60  },
        { x: 0.22, y: 0.42, rx: 0.08, ry: 0.10, r: 105, g: 155, b: 65  },
        // Desert region
        { x: 0.38, y: 0.55, rx: 0.09, ry: 0.07, r: 185, g: 155, b: 85  },
        // Americas-style landmass
        { x: 0.55, y: 0.35, rx: 0.07, ry: 0.16, r: 80,  g: 135, b: 52  },
        { x: 0.58, y: 0.60, rx: 0.06, ry: 0.12, r: 90,  g: 142, b: 58  },
        // Africa-style
        { x: 0.72, y: 0.45, rx: 0.08, ry: 0.15, r: 100, g: 148, b: 58  },
        { x: 0.74, y: 0.68, rx: 0.06, ry: 0.08, r: 120, g: 160, b: 65  },
        // Australia-style small continent
        { x: 0.88, y: 0.62, rx: 0.07, ry: 0.05, r: 175, g: 148, b: 78  },
        // Second hemisphere
        { x: 1.15, y: 0.28, rx: 0.13, ry: 0.16, r: 88,  g: 142, b: 56  },
        { x: 1.25, y: 0.48, rx: 0.09, ry: 0.11, r: 98,  g: 150, b: 60  },
        { x: 1.42, y: 0.35, rx: 0.07, ry: 0.14, r: 82,  g: 138, b: 54  },
        { x: 1.60, y: 0.55, rx: 0.10, ry: 0.08, r: 115, g: 158, b: 62  },
        { x: 1.75, y: 0.30, rx: 0.08, ry: 0.12, r: 92,  g: 145, b: 57  },
        { x: 1.85, y: 0.60, rx: 0.06, ry: 0.09, r: 180, g: 152, b: 82  },
    ]

    for (const c of continents) {
        const x  = c.x * size
        const y  = c.y * size
        const rx = c.rx * size
        const ry = c.ry * size

        // Main land fill
        const land = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry))
        land.addColorStop(0,   `rgba(${c.r},${c.g},${c.b},0.95)`)
        land.addColorStop(0.5, `rgba(${c.r - 8},${c.g - 12},${c.b - 5},0.80)`)
        land.addColorStop(0.85,`rgba(${c.r - 15},${c.g - 20},${c.b - 10},0.45)`)
        land.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = land
        ctx.beginPath()
        ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2)
        ctx.fill()

        // Mountain ridges — slightly darker
        const mtn = ctx.createRadialGradient(x, y, rx * 0.2, x, y, rx * 0.55)
        mtn.addColorStop(0,   `rgba(${c.r - 20},${c.g - 25},${c.b - 12},0.35)`)
        mtn.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = mtn
        ctx.beginPath()
        ctx.ellipse(x, y, rx * 0.55, ry * 0.55, Math.random() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
    }

    // Cloud layer — bright wisps
    for (let i = 0; i < 45; i++) {
        const x     = Math.random() * size * 2
        const y     = Math.random() * size
        const rx    = 30 + Math.random() * 90
        const ry    = 6  + Math.random() * 16
        const rot   = (Math.random() - 0.5) * 0.25
        const alpha = 0.15 + Math.random() * 0.22
        const cloud = ctx.createRadialGradient(x, y, 0, x, y, rx)
        cloud.addColorStop(0,   `rgba(240,248,255,${alpha * 1.4})`)
        cloud.addColorStop(0.4, `rgba(225,238,255,${alpha})`)
        cloud.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = cloud
        ctx.beginPath()
        ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2)
        ctx.fill()
    }

    // Bright polar ice caps
    const northCap = ctx.createLinearGradient(0, 0, 0, size * 0.20)
    northCap.addColorStop(0,   'rgba(235,245,255,0.95)')
    northCap.addColorStop(0.5, 'rgba(215,232,252,0.60)')
    northCap.addColorStop(1,   'rgba(0,0,0,0)')
    ctx.fillStyle = northCap
    ctx.fillRect(0, 0, size * 2, size * 0.20)

    const southCap = ctx.createLinearGradient(0, size * 0.80, 0, size)
    southCap.addColorStop(0,   'rgba(0,0,0,0)')
    southCap.addColorStop(0.5, 'rgba(215,232,252,0.60)')
    southCap.addColorStop(1,   'rgba(235,245,255,0.95)')
    ctx.fillStyle = southCap
    ctx.fillRect(0, size * 0.80, size * 2, size * 0.20)

    // Atmosphere haze at poles
    const atmHaze = ctx.createLinearGradient(0, 0, 0, size)
    atmHaze.addColorStop(0,    'rgba(100,160,255,0.12)')
    atmHaze.addColorStop(0.12, 'rgba(0,0,0,0)')
    atmHaze.addColorStop(0.88, 'rgba(0,0,0,0)')
    atmHaze.addColorStop(1,    'rgba(100,160,255,0.12)')
    ctx.fillStyle = atmHaze
    ctx.fillRect(0, 0, size * 2, size)

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
}

export function makeRockyTexture(): THREE.Texture {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size * 2
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    // Vivid Mars-like base — warm rust, not too dark
    const base = ctx.createLinearGradient(0, 0, 0, size)
    base.addColorStop(0,   '#3a1e10')
    base.addColorStop(0.2, '#5a2e16')
    base.addColorStop(0.5, '#8a4820')
    base.addColorStop(0.8, '#5a2e16')
    base.addColorStop(1,   '#3a1e10')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size * 2, size)

    // High-contrast terrain regions
    for (let i = 0; i < 60; i++) {
        const x     = Math.random() * size * 2
        const y     = Math.random() * size
        const rad   = 20 + Math.random() * 70
        const tone  = Math.random()
        // Vary between light highlands and dark basalt
        const isHighland = tone > 0.5
        const r     = isHighland ? Math.round(160 + tone * 70) : Math.round(55 + tone * 45)
        const g     = isHighland ? Math.round(88  + tone * 40) : Math.round(30 + tone * 25)
        const b     = isHighland ? Math.round(38  + tone * 20) : Math.round(12 + tone * 15)
        const alpha = 0.15 + Math.random() * 0.25
        const patch = ctx.createRadialGradient(x, y, 0, x, y, rad)
        patch.addColorStop(0,   `rgba(${r},${g},${b},${alpha * 1.5})`)
        patch.addColorStop(0.5, `rgba(${r},${g},${b},${alpha})`)
        patch.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = patch
        ctx.beginPath()
        ctx.arc(x, y, rad, 0, Math.PI * 2)
        ctx.fill()
    }

    // Volcanic plains — dark flat regions
    for (let i = 0; i < 12; i++) {
        const x     = Math.random() * size * 2
        const y     = Math.random() * size
        const rx    = 40 + Math.random() * 80
        const ry    = 20 + Math.random() * 40
        const rot   = Math.random() * Math.PI
        const alpha = 0.20 + Math.random() * 0.20
        const lava  = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry))
        lava.addColorStop(0,   `rgba(30,12,5,${alpha * 1.3})`)
        lava.addColorStop(0.6, `rgba(25,10,4,${alpha})`)
        lava.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = lava
        ctx.beginPath()
        ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2)
        ctx.fill()
    }

    // Sharp impact craters with bright rims
    for (let i = 0; i < 22; i++) {
        const x   = Math.random() * size * 2
        const y   = Math.random() * size
        const rad = 5 + Math.random() * 28

        // Bright ejecta blanket
        const ejecta = ctx.createRadialGradient(x, y, rad * 0.8, x, y, rad * 2.2)
        ejecta.addColorStop(0,   'rgba(0,0,0,0)')
        ejecta.addColorStop(0.3, `rgba(200,140,80,0.30)`)
        ejecta.addColorStop(0.6, `rgba(180,120,65,0.15)`)
        ejecta.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = ejecta
        ctx.beginPath()
        ctx.arc(x, y, rad * 2.2, 0, Math.PI * 2)
        ctx.fill()

        // Bright crater rim
        const rim = ctx.createRadialGradient(x, y, rad * 0.65, x, y, rad * 1.1)
        rim.addColorStop(0,   'rgba(0,0,0,0)')
        rim.addColorStop(0.5, `rgba(210,155,90,0.55)`)
        rim.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = rim
        ctx.beginPath()
        ctx.arc(x, y, rad * 1.1, 0, Math.PI * 2)
        ctx.fill()

        // Dark crater floor
        const floor = ctx.createRadialGradient(x, y, 0, x, y, rad * 0.7)
        floor.addColorStop(0,   'rgba(12,5,2,0.80)')
        floor.addColorStop(0.6, 'rgba(18,7,3,0.50)')
        floor.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = floor
        ctx.beginPath()
        ctx.arc(x, y, rad * 0.7, 0, Math.PI * 2)
        ctx.fill()
    }

    // Wind-blown dust streaks
    for (let i = 0; i < 25; i++) {
        const x     = Math.random() * size * 2
        const y     = Math.random() * size
        const rx    = 25 + Math.random() * 75
        const ry    = 3  + Math.random() * 8
        const rot   = (Math.random() - 0.5) * 0.2
        const alpha = 0.12 + Math.random() * 0.18
        const dust  = ctx.createRadialGradient(x, y, 0, x, y, rx)
        dust.addColorStop(0,   `rgba(215,158,95,${alpha * 1.4})`)
        dust.addColorStop(0.5, `rgba(185,128,70,${alpha})`)
        dust.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = dust
        ctx.beginPath()
        ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2)
        ctx.fill()
    }

    // Polar frost caps — subtle on Mars-like worlds
    const northFrost = ctx.createLinearGradient(0, 0, 0, size * 0.14)
    northFrost.addColorStop(0,   'rgba(230,222,215,0.70)')
    northFrost.addColorStop(0.6, 'rgba(210,202,195,0.30)')
    northFrost.addColorStop(1,   'rgba(0,0,0,0)')
    ctx.fillStyle = northFrost
    ctx.fillRect(0, 0, size * 2, size * 0.14)

    const southFrost = ctx.createLinearGradient(0, size * 0.86, 0, size)
    southFrost.addColorStop(0,   'rgba(0,0,0,0)')
    southFrost.addColorStop(0.4, 'rgba(210,202,195,0.30)')
    southFrost.addColorStop(1,   'rgba(230,222,215,0.70)')
    ctx.fillStyle = southFrost
    ctx.fillRect(0, size * 0.86, size * 2, size * 0.14)

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
}

// ─── Planet ring textures ─────────────────────────────────────────────────────

export function makeIceGiantRingTexture(): THREE.Texture {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = 1
    const ctx = canvas.getContext('2d')!
    const grad = ctx.createLinearGradient(0, 0, size, 0)
    const ringBands = [
        [0.06, 0.025, 0.15, '30,180,200'],
        [0.14, 0.040, 0.30, '40,200,220'],
        [0.24, 0.055, 0.50, '50,215,235'],
        [0.35, 0.030, 0.25, '35,195,215'],
        [0.44, 0.065, 0.65, '60,225,245'],
        [0.54, 0.045, 0.55, '55,220,240'],
        [0.63, 0.030, 0.30, '40,205,225'],
        [0.72, 0.050, 0.45, '50,215,235'],
        [0.82, 0.035, 0.28, '35,195,215'],
        [0.90, 0.025, 0.18, '25,175,200'],
        [0.96, 0.018, 0.10, '20,160,185'],
    ] as const
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    for (const [center, half, peak, rgb] of ringBands) {
        const s = center - half, e = center + half
        grad.addColorStop(Math.max(0, s - half * 0.8), 'rgba(0,0,0,0)')
        grad.addColorStop(s,      `rgba(${rgb},${peak * 0.3})`)
        grad.addColorStop(center, `rgba(${rgb},${peak})`)
        grad.addColorStop(e,      `rgba(${rgb},${peak * 0.3})`)
        grad.addColorStop(Math.min(1, e + half * 0.8), 'rgba(0,0,0,0)')
    }
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, 1)
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
}

export function makeGasGiantRingTexture(): THREE.Texture {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = 1
    const ctx = canvas.getContext('2d')!
    const grad = ctx.createLinearGradient(0, 0, size, 0)
    const ringBands = [
        [0.05, 0.020, 0.20, '200,170,110'],
        [0.12, 0.035, 0.40, '220,185,120'],
        [0.21, 0.050, 0.60, '235,200,135'],
        [0.30, 0.025, 0.30, '210,175,115'],
        [0.38, 0.060, 0.70, '240,205,140'],
        [0.48, 0.040, 0.55, '230,195,130'],
        [0.57, 0.025, 0.35, '215,180,118'],
        [0.65, 0.055, 0.65, '238,202,138'],
        [0.74, 0.030, 0.40, '222,187,122'],
        [0.82, 0.045, 0.50, '228,193,128'],
        [0.90, 0.025, 0.25, '205,170,110'],
        [0.96, 0.018, 0.15, '195,160,105'],
    ] as const
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    for (const [center, half, peak, rgb] of ringBands) {
        const s = center - half, e = center + half
        grad.addColorStop(Math.max(0, s - half * 0.8), 'rgba(0,0,0,0)')
        grad.addColorStop(s,      `rgba(${rgb},${peak * 0.3})`)
        grad.addColorStop(center, `rgba(${rgb},${peak})`)
        grad.addColorStop(e,      `rgba(${rgb},${peak * 0.3})`)
        grad.addColorStop(Math.min(1, e + half * 0.8), 'rgba(0,0,0,0)')
    }
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, 1)
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
}