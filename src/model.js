import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import vertex from './shaders/vertexShader.glsl'
import fragment from './shaders/fragmentShader.glsl'
import { COLOR4, COLOR5 } from './constants'
import { QUALITY } from './quality.js'

const loader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
loader.setDRACOLoader(dracoLoader)

// Shared neon material for the glowing edge lines on device models.
// Color is pushed past 1.0 so the bloom pass picks the lines up.
const edgeLineMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(COLOR4).multiplyScalar(2.4),
    transparent: true,
    opacity: 0.85,
})

let maxAnisotropy = 16

export const setDeviceTextureQuality = (anisotropy) => {
    maxAnisotropy = anisotropy
}

const enhanceScreenMap = (map, showcase = false) => {
    map.anisotropy = maxAnisotropy
    map.minFilter = showcase ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter
    map.magFilter = THREE.LinearFilter
    map.generateMipmaps = !showcase
    map.colorSpace = THREE.SRGBColorSpace
    map.needsUpdate = true
    return map
}

// Dark glossy body shared by all device frames
const deviceBodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x0c1117,
    metalness: 0.85,
    roughness: 0.3,
})

export const loadModel = (filePath) => {
    const url = import.meta.env.DEV ? `${filePath}?v=${Date.now()}` : filePath

    return new Promise((resolve, reject) => {
        loader.load(
            url,
            (obj) => {
                const group = new THREE.Group()
                group.add(...obj.scene.children)
                resolve(group)
            },
            undefined,
            reject,
        )
    })
}

/**
 * Restyle a loaded device model (phone/laptop/monitor) for the neon look:
 * - textured screens become emissive/backlit so bright pixels bloom softly
 * - body panels become dark glossy metal
 * - feature edges get traced with glowing neon lines
 */
export const applyDeviceStyle = (group, options = {}) => {
    const {
        showcase = false,
        screenBrightness = showcase ? 1.0 : 1.05,
        skipScreenEdges = showcase,
    } = options

    group.traverse((child) => {
        if (!child.isMesh) return

        const materials = Array.isArray(child.material) ? child.material : [child.material]
        const hasScreen = materials.some((material) => material.map)
        const styled = materials.map((material) => {
            if (material.map) {
                const screenMaterial = new THREE.MeshBasicMaterial({
                    map: enhanceScreenMap(material.map, showcase),
                    toneMapped: false,
                    side: THREE.DoubleSide,
                })
                screenMaterial.color.setScalar(screenBrightness)
                return screenMaterial
            }
            return deviceBodyMaterial
        })
        child.material = Array.isArray(child.material) ? styled : styled[0]

        if (hasScreen && showcase) {
            child.renderOrder = 2
        }

        if (QUALITY.edgeGlow && !(skipScreenEdges && hasScreen)) {
            const edges = new THREE.EdgesGeometry(child.geometry, 25)
            const line = new THREE.LineSegments(edges, edgeLineMaterial)
            child.add(line)
        }
    })

    return group
}

/**
 * Dispose of a project group's geometries when it leaves the scene
 * so the per-section loading doesn't leak GPU memory.
 */
export const disposeGroup = (group) => {
    group.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material && child.material.map && child.material !== edgeLineMaterial) {
            child.material.map.dispose()
            child.material.dispose()
        }
    })
}

export const loadParticlesModel = (filePath, color1, color2) => {
    return new Promise((resolve, reject) => {
        loader.load(filePath, (obj) => {
            // Get the mesh from the loaded object
            const mesh = obj.scene.children[0]

            // Particles material
            const particlesMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uColor1: { value: new THREE.Color(color1) },
                    uColor2: { value: new THREE.Color(color2) },
                    uColor3: { value: new THREE.Color(COLOR5) },
                    uTime: { value: 0 },
                    uScale: { value: 0 },
                    uCameraZ: { value: 0 }
                },
                vertexShader: vertex,
                fragmentShader: fragment,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })

            // Particles geometry
            const sampler = new MeshSurfaceSampler(mesh).build()
            const numParticles = QUALITY.particleCount
            const particlesGeometry = new THREE.BufferGeometry()
            const particlesPosition = new Float32Array(numParticles * 3)
            const particlesRandomness = new Float32Array(numParticles * 3)

            for (let i = 0; i < numParticles; i++) {
                const newPosition = new THREE.Vector3()
                sampler.sample(newPosition)

                particlesPosition.set([
                    newPosition.x,
                    newPosition.y,
                    newPosition.z
                ], i * 3)

                particlesRandomness.set([
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1
                ], i * 3)
            }

            particlesGeometry.setAttribute(
                'position',
                new THREE.BufferAttribute(particlesPosition, 3)
            )
            particlesGeometry.setAttribute(
                'aRandom',
                new THREE.BufferAttribute(particlesRandomness, 3)
            )

            const particles = new THREE.Points(particlesGeometry, particlesMaterial)

            resolve(particles)
        })
    })
}
