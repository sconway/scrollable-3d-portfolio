import * as THREE from 'three'
import GUI from 'lil-gui'
import { bezier } from "./bezier"
 
/**
 * Base
 */
const gui = new GUI({
    width: 500
})
const canvas = document.querySelector('canvas.webgl')
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
const scene = new THREE.Scene()
const clock = new THREE.Clock()
const scrollEasing = bezier(.03, .07, 1, -0.18)
// const startParameters = {
//     count: 275000,
//     size: 0.032,
//     radius: 18.25,
//     branches: 12,
//     spin: 2,
//     randomness: 0.595,
//     randomnessPower: 1,
//     insideColor: '#f0a400',
//     outsideColor: '#0033ff',
// }
// const startParameters = {
//     count: 425000,
//     size: 0.014,
//     radius: 5,
//     branches: 8,
//     spin: 0.4,
//     randomness: 0.3,
//     randomnessPower: 3,
//     insideColor: '#f0a400',
//     outsideColor: '#0033ff',
// }
const startParameters = {
    count: 425000,
    size: 0.014,
    radius: 5,
    branches: 10,
    spin: -0.6,
    randomness: 1.25,
    randomnessPower: 2.3,
    insideColor: '#f0a400',
    outsideColor: '#0033ff',
}
const cursor = {
    x: 0,
    y: 0
}
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const contentHeight = document.getElementById('content').scrollHeight - sizes.height

let camera = null
let geometry = null
let material = null
let points = null
let scrollY = 2
let previousTime = 0

const generateGalaxy = () => {
    // destroy old galaxy
    if (points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(startParameters.count * 3)
    const colors = new Float32Array(startParameters.count * 3)
    const colorInside = new THREE.Color(startParameters.insideColor)
    const colorOutside = new THREE.Color(startParameters.outsideColor)
    
    for (let i = 0; i < startParameters.count; i++) {
        const i3 = i * 3

        // positioning
        const radius = Math.random() * startParameters.radius
        const spinAngle = radius * startParameters.spin
        const branchAngle = (i % startParameters.branches) / startParameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), startParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random(), startParameters.randomnessPower) * (Math.random() < 0.5 ? 0.5 : -0.5)
        const randomZ = Math.pow(Math.random(), startParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // colors
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / startParameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    } 

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    material = new THREE.PointsMaterial({
        size: startParameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: 0xff5588,
        vertexColors: true
    })

    points = new THREE.Points(geometry, material)

    points.rotation.x = Math.PI / 4

    scene.add(points)
}

gui.add(startParameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(startParameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(startParameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(startParameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(startParameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(startParameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(startParameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(startParameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(startParameters, 'outsideColor').onFinishChange(generateGalaxy)

/**
 * Handle updating the camera, renderer, and other variables when the screen size changes
 */
const addResizeListener = () => {
    window.addEventListener('resize', () => {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight
    
        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()
    
        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
}

/**
 * Handle scroll events. Updates the shared variable used to detect the user's scroll distance
 */
const addScrollListener = () => {
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY > 2 ? window.scrollY : 2;
    })
}

/**
 * Handle mouse events. Updates the shared cursor values to keep track of the user's mouse position
 */
const addMouseListener = () => {
    window.addEventListener('mousemove', (event) => {
        cursor.x = event.clientX / sizes.width - 0.5
        cursor.y = event.clientY / sizes.height - 0.5
    })
}

/**
 * Camera
 */
const initCamera = () => {
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.z = 9
    scene.add(camera)
}

/**
 * Configure our renderer
 */
const initRenderer = () => {
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

const quintic = (x) => x*x*x*x*x

/**
 * Animate
 */
const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if (points) {
        const scrollPercentage = scrollY / contentHeight
        const adjustedScrollPosition = scrollPercentage + (0.4 - (0.4 * scrollPercentage))
        const newScale = (1 / quintic(adjustedScrollPosition)) 
        const newPosX = 4 * scrollPercentage
        const newPosY = -3 * scrollPercentage
        const parallaxX = cursor.x * 0.25
        const parallaxY = - cursor.y * 0.25

        points.rotation.y = elapsedTime / 40 // + (scrollY / 200)
        points.scale.set(newScale, newScale, newScale)
        points.position.set(newPosX, newPosY, newPosY)


        // points.position.x += (parallaxX - points.position.x) * deltaTime * 3
        // points.position.y += (parallaxY - points.position.y) * deltaTime * 3
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

const init = () => {
    initRenderer()
    initCamera()
    generateGalaxy()
    addResizeListener()
    addMouseListener()
    addScrollListener()
    tick()
}

init()