import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import vertex from './shaders/vertexShader.glsl'
import fragment from './shaders/fragmentShader.glsl'

const loader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
loader.setDRACOLoader(dracoLoader)

export const loadModel = (filePath) => {
    return new Promise((resolve, reject) => {
        loader.load(
            filePath,
            (obj) => {
                const group = new THREE.Group()
                group.add(...obj.scene.children)
                resolve(group)
            }
        )
    })
}

export const loadMeshModel = (filePath) => {
    return new Promise((resolve, reject) => {
        loader.load(
            filePath,
            (obj) => {
                resolve(group)
            }
        )
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
                    uTime: { value: 0 },
                    uScale: { value: 0 },
                    uCameraZ: { value: 0 }
                },
                vertexShader: vertex,
                fragmentShader: fragment,
                // transparent: true,
                // depthTest: false,
                // depthWrite: false,
                blending: THREE.AdditiveBlending
            })

            // Particles geometry
            const sampler = new MeshSurfaceSampler(mesh).build()
            const numParticles = 20000
            const particlesGeometry = new THREE.BufferGeometry()
            const particlesPosition = new Float32Array(numParticles * 3)
            const particlesRandomness = new Float32Array(numParticles * 3)

            for (let i = 0; i < numParticles; i++) {
                const newPosition = new THREE.Vector3()
                sampler.sample(newPosition)

                particlesPosition.set([
                    newPosition.x, // 0, 3, 6, 9 ...
                    newPosition.y, // 1, 4, 7, 10 ...
                    newPosition.z  // 2, 5, 8, 11 ...
                ], i * 3)

                particlesRandomness.set([
                    Math.random() * 2 - 1, // -1 <> 1
                    Math.random() * 2 - 1, // -1 <> 1
                    Math.random() * 2 - 1 // -1 <> 1
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

            // Particles
            const particles = new THREE.Points(particlesGeometry, particlesMaterial)

            resolve(particles)
        })
    })
}

export const loadParticlesModel2 = (filePath, color1, color2) => {
    return new Promise((resolve, reject) => {
        loader.load(filePath, (obj) => {
            // Get the mesh from the loaded object
            const mesh = obj.scene.children[0]

            // Particles material
            const particlesMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uColor1: { value: new THREE.Color(color1) },
                    uColor2: { value: new THREE.Color(color2) },
                    // uTime: { value: 0 },
                    // uScale: { value: 0 },
                    // uCameraZ: { value: 0 }
                },
                vertexShader: vertex,
                fragmentShader: fragment,
                // transparent: true,
                // depthTest: false,
                // depthWrite: false,
                blending: THREE.AdditiveBlending
            })

            // Particles geometry
            const sampler = new MeshSurfaceSampler(mesh).build()
            const numParticles = 30000
            const particlesGeometry = new THREE.BufferGeometry()
            const particlesPosition = new Float32Array(numParticles * 3)
            const particlesRandomness = new Float32Array(numParticles * 3)

            for (let i = 0; i < numParticles; i++) {
                const newPosition = new THREE.Vector3()
                sampler.sample(newPosition)

                particlesPosition.set([
                    newPosition.x, // 0, 3, 6, 9 ...
                    newPosition.y, // 1, 4, 7, 10 ...
                    newPosition.z  // 2, 5, 8, 11 ...
                ], i * 3)

                particlesRandomness.set([
                    Math.random() * 2 - 1, // -1 <> 1
                    Math.random() * 2 - 1, // -1 <> 1
                    Math.random() * 2 - 1 // -1 <> 1
                ], i * 3)
            }

            particlesGeometry.setAttribute(
                'position', 
                new THREE.BufferAttribute(particlesPosition, 3)
            )
            // particlesGeometry.setAttribute(
            //     'aRandom', 
            //     new THREE.BufferAttribute(particlesRandomness, 3)
            // )

            // Particles
            const particles = new THREE.Points(particlesGeometry, particlesMaterial)

            resolve(particles)
        })
    })
}