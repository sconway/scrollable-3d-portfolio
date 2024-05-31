import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from "gsap"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SobelOperatorShader } from 'three/addons/shaders/SobelOperatorShader.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { PositionAlongPathState } from "./PositionAlongPathState"
import { handleScroll, updatePosition } from './PositionAlongPathMethods'
import { loadModel, loadParticlesModel } from "./model.js"
import { createBarGraph } from './barGraph'

const COLOR1 = '#240668'
const COLOR2 = '#3A0CA3'
const COLOR3 = '#7209B7'
const COLOR4 = '#F72585'
 
/**
 * Base
 */
const SECTION_SIZE = 10
const SCENE_SIZE = 200
const CURVE_PATH_HEIGHT = 4
const SCROLL_DISTANCE_TO_COMPLETION = 900;

const gui = new GUI({
    width: 300
})
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const clock = new THREE.Clock()
const textureLoader = new THREE.TextureLoader()
const introSectionGroup = new THREE.Group()
const aboutSectionGroup = new THREE.Group()
const projectsSectionGroup = new THREE.Group()
const contactSectionGroup = new THREE.Group()
// Path configuration
const positionAlongPathState = new PositionAlongPathState()
// Mouse position
const cursor = {
    x: 0,
    y: 0
}
// Words
const wordGroup = new THREE.Group()
// Viewport size
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
// Model loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
// Font loaders
const fontLoader = new TTFLoader();
// Textures
const matCapTexture = textureLoader.load('/textures/matcap8.png')
matCapTexture.colorSpace = THREE.SRGBColorSpace

// Axes helper
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

let camera = null
let renderer = null
let controls = null
let effectComposer = null
let curvePath = null
let scrollY = 0
let surfacePlaneMaterial = null;
let model = null
let modelRemoved = false
let afterimagePass = null


/**
 * =======================================================================
 * INTRO SECTION
 * =======================================================================
 */
const addIntroText = () => {
    fontLoader.load(
        '/fonts/kode-bold.ttf', 
        (fontData) => {
            const font = new Font(fontData);
            const textGeometry1 = new TextGeometry(
                "HI",
                {
                    font: font,
                    size: 5,
                    height: 2,
                    curveSegents: 6,
                    bevelEnabled: true,
                    bevelThickness: 0.03,
                    bevelSize: 0.02,
                    bevelOffset: 0,
                    bevelSegments: 4,
                }
            )
            const textGeometry2 = new TextGeometry(
                "I'M SCOTT",
                {
                    font: font,
                    size: 3.5,
                    height: 2,
                    curveSegents: 6,
                    bevelEnabled: true,
                    bevelThickness: 0.03,
                    bevelSize: 0.02,
                    bevelOffset: 0,
                    bevelSegments: 4,
                }
            )
            const textMaterial = new THREE.MeshLambertMaterial({
                color: new THREE.Color(COLOR3),
                side: THREE.DoubleSide
            })
            const text1 = new THREE.Mesh(textGeometry1, textMaterial)
            const text2 = new THREE.Mesh(textGeometry2, textMaterial)
            const textGroup = new THREE.Group()
            
            text2.position.y -= 2
            text2.position.x += 3.5
            text2.position.y += 7.6
            text2.rotation.z -= Math.PI / 12

            textGroup.position.x -= 6
            textGroup.position.z -= 20
            textGroup.rotation.y -= Math.PI / 4
            textGroup.rotation.z += Math.PI / 60
            
            textGroup.add(text1)
            textGroup.add(text2)
            introSectionGroup.add(textGroup)
        }
    )
}

const addIntroContent = async () => {
    addIntroText()

    model = await loadParticlesModel('/models/wave.glb', COLOR3, COLOR4)
    model.position.x -= 16
    model.position.y += 6
    model.rotation.y += Math.PI / 7
    introSectionGroup.add(model)
    // Animate the model to full size
    gsap.to(model.material.uniforms.uScale, {
        value: 1,
        duration: 1,
        ease: 'elastic.out',
        onComplete: () => {
            addScrollListener()
        }
    })
}

/**
 * =======================================================================
 * ABOUT SECTION
 * =======================================================================
 */
const addAboutGraph = (fontData) => {
    const font = new Font(fontData);
    const graph = createBarGraph(font);

    graph.position.set(-7, 18, 0)
    graph.rotation.set(Math.PI, 0, Math.PI / 2)
    
    aboutSectionGroup.add(graph)
}

const addWordCloud = (fontData) => {
    const font = new Font(fontData);
    const words = [
        {
            value: "Redux",
            x: 0,
            y: 0,
            z: 0
        },
        {
            value: "JQuery",
            x: 0,
            y: 0,
            z: -5
        },
        {
            value: "ThreeJS",
            x:  0,
            y: 0,
            z: 5
        },
        {
            value: "AWS",
            x: -5,
            y: 0,
            z: 0
        },
        {
            value: "Swift",
            x: 5,
            y: 0,
            z: 0
        },
        {
            value: "Jest",
            x: 0,
            y: -5,
            z: 0
        },
        {
            value: "Styled Components",
            x: 0,
            y: 5,
            z: 0
        },
        {
            value: "Cypress",
            x: -2.5,
            y: -2.5,
            z: -2.5
        },
        {
            value: "Detox",
            x: -2.5,
            y: 2.5,
            z: 0
        },
        {
            value: "ExpressJS",
            x: 2.5,
            y: -2.5,
            z: -2.5
        },
        {
            value: "SocketIO",
            x: -2.5,
            y: 2.5,
            z: -2.5
        },
        {
            value: "SanityIO",
            x: 2.5,
            y: 2.5,
            z: -2.5
        },
        {
            value: "Moment",
            x: 4,
            y: 2.5,
            z: 2.5
        },
        {
            value: "Immer",
            x: -2.5,
            y: -2.5,
            z: 2.5
        },
        {
            value: "Service Workers",
            x: -2.5,
            y: 2.5,
            z: 2.5
        },
        {
            value: "ScrollMagic",
            x: 2.5,
            y: -2.5,
            z: 2.5
        },
        {
            value: "BEM",
            x: 2.5,
            y: -4,
            z: 0
        },
        {
            value: "Jenkins",
            x: -2.5,
            y: -4,
            z: 0
        },
    ]
    const textMaterial = new THREE.MeshLambertMaterial({
        color: new THREE.Color(0xffffff),
        side: THREE.DoubleSide
    })
    
    for (let i = 0; i < words.length; i++) {
        const { x, y, z } = words[i]
        const textGeometry = new TextGeometry(
            words[i].value,
            {
                font: font,
                size: 0.5,
                height: 0.1,
                curveSegents: 6,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.005,
                bevelOffset: 0,
                bevelSegments: 4,
            }
        )
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)

        textMesh.position.set(x, y, z)

        wordGroup.add(textMesh)
    }

    wordGroup.position.set(4, 9, 0)
    aboutSectionGroup.add(wordGroup)
}

const addAboutContent = () => {
    fontLoader.load(
        '/fonts/NotoSans.ttf', 
        (fontData) => {
            addAboutGraph(fontData)
            addWordCloud(fontData)
        }
    )
}

/**
 * Second section for technical names and knowledge
 */
 const addAboutSection = () => {
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
    })
    const planeGeometry = new THREE.PlaneGeometry(SECTION_SIZE, SECTION_SIZE)
    const plane = new THREE.Mesh(
        planeGeometry,
        planeMaterial
    )

    plane.rotation.x = -Math.PI / 2
    
    aboutSectionGroup.position.set(0, -2, -((SCENE_SIZE / 4) - (SECTION_SIZE / 2)))
    aboutSectionGroup.rotation.y = -Math.PI / 2.2
    aboutSectionGroup.add(plane)
}

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

        // Update composer
        effectComposer.setSize(sizes.width, sizes.height)
        effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
}

/**
 * Handle scroll events. Updates the shared variable used to detect the user's scroll distance
 */
const addScrollListener = () => {
    window.addEventListener('wheel', (e) => {
        scrollY += e.deltaY

        handleScroll(e, positionAlongPathState)
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
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)

    camera.position.copy(curvePath.getPointAt(0))
    camera.lookAt(curvePath.getPointAt(0.01))

    // Controls
    // controls = new OrbitControls(camera, canvas)
    // controls.enableZoom = false

    scene.add(camera)

    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(1024, 1024)
    directionalLight.shadow.camera.far = 15
    directionalLight.shadow.camera.left = - 7
    directionalLight.shadow.camera.top = 7
    directionalLight.shadow.camera.right = 7
    directionalLight.shadow.camera.bottom = - 7
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)
}

/**
 * Configure our renderer
 */
const initRenderer = () => {
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // scene.fog = new THREE.FogExp2( COLOR1, 0.6128 )
    // renderer.setClearColor( scene.fog.color, 1 )

    // // Post processing
    effectComposer = new EffectComposer(renderer)
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setSize(sizes.width, sizes.height)
    
    const renderPass = new RenderPass(scene, camera)
    effectComposer.addPass(renderPass)

    // const glitchPass = new GlitchPass()
    // effectComposer.addPass(glitchPass)

    const bloomPass = new UnrealBloomPass()
    bloomPass.strength = 0.3
    effectComposer.addPass(bloomPass)

    // const renderPixelatedPass = new RenderPixelatedPass( 6, scene, camera );
    // effectComposer.addPass( renderPixelatedPass );

    // const effectSobel = new ShaderPass( SobelOperatorShader );
    // effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
    // effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;
    // effectComposer.addPass( effectSobel );

    // const bokehPass = new BokehPass( scene, camera, {
    //     focus: 10.0,
    //     aperture: 5,
    //     maxblur: 0.01
    // } );
    // const outputPass = new OutputPass();
    // effectComposer.addPass( bokehPass );
    // effectComposer.addPass( outputPass );

    afterimagePass = new AfterimagePass()
    afterimagePass.uniforms[ 'damp' ].value = 0.6
    effectComposer.addPass(afterimagePass)
}

const addSurfacePlane = () => {
    surfacePlaneMaterial = new THREE.MeshBasicMaterial({
        opacity: 0.4,
        color: new THREE.Color(COLOR1),
        side: THREE.DoubleSide,
        transparent: true
    })
    const planeGeometry = new THREE.PlaneGeometry(SCENE_SIZE*4, SCENE_SIZE*4)
    const plane = new THREE.Mesh(
        planeGeometry,
        surfacePlaneMaterial
    )
    plane.rotation.x = -Math.PI / 2
    plane.position.set(0, -2.1, 0)

    scene.add(plane)

    // Add various section groups
    scene.add(introSectionGroup, aboutSectionGroup, projectsSectionGroup, contactSectionGroup)
}

/**
 * First section 
 */
const addIntroSection = () => {
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
    })
    const planeGeometry = new THREE.PlaneGeometry(SECTION_SIZE, SECTION_SIZE)
    const plane = new THREE.Mesh(
        planeGeometry,
        planeMaterial
    )

    plane.rotation.x = -Math.PI / 2

    introSectionGroup.position.set(-((SCENE_SIZE / 4) - (SECTION_SIZE / 2)) , -2, 0)
    introSectionGroup.add(plane)
}

/**
 * Third section for projects 
 */
 const addProjectsSection = () => {
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
    })
    const planeGeometry = new THREE.PlaneGeometry(SECTION_SIZE, SECTION_SIZE)
    const plane = new THREE.Mesh(
        planeGeometry,
        planeMaterial
    )

    plane.rotation.x = -Math.PI / 2

    projectsSectionGroup.position.set((SCENE_SIZE / 4) - (SECTION_SIZE / 2), -2, 0)
    projectsSectionGroup.rotation.y = Math.PI
    projectsSectionGroup.add(plane)
}

/**
 * Second section for technical names and knowledge
 */
 const addContactSection = () => {
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
    })
    const planeGeometry = new THREE.PlaneGeometry(SECTION_SIZE, SECTION_SIZE)
    const plane = new THREE.Mesh(
        planeGeometry,
        planeMaterial
    )

    plane.rotation.x = -Math.PI / 2

    contactSectionGroup.position.set(0, -2, (SCENE_SIZE / 4) - (SECTION_SIZE / 2))
    contactSectionGroup.rotation.y = Math.PI * 1.5
    contactSectionGroup.add(plane)
}


const addCurvePath = () => {
    curvePath = new THREE.CatmullRomCurve3( [
        new THREE.Vector3(-(SCENE_SIZE / 3.8), CURVE_PATH_HEIGHT, 25), // slightly ehind Intro section
        new THREE.Vector3(-(SCENE_SIZE / 3.8), CURVE_PATH_HEIGHT, 0), // Intro section
        new THREE.Vector3(-(SCENE_SIZE / 3.8), CURVE_PATH_HEIGHT, -(SCENE_SIZE / 5)), // Between intro and about sections
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, -((SCENE_SIZE / 4) - (SECTION_SIZE / 2))), // About section
        new THREE.Vector3((SCENE_SIZE / 4) - (SECTION_SIZE / 2), CURVE_PATH_HEIGHT, 0), // Projects section
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, (SCENE_SIZE / 4) - (SECTION_SIZE / 2)), // Contact Section
        new THREE.Vector3(-(SCENE_SIZE / 3.8), CURVE_PATH_HEIGHT, 50), // Ease back into the intro section
    ] );
    curvePath.closed = true;
    
    // const geometry = new THREE.TubeGeometry(curvePath, 100, .05, 8, true)
    // const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, side: THREE.DoubleSide });
    // const mesh = new THREE.Mesh(geometry, material);
    
    // scene.add(mesh)
}

/**
 * Animate
 */
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // controls.update()

    if (model) {
        model.material.uniforms.uTime.value = elapsedTime
        model.material.uniforms.uCameraZ.value = scrollY
    }

    // Update the camera position on our curve path as the user scrolls
    const percentageComplete = updatePosition(curvePath, camera, positionAlongPathState)

    // Once we pass the intro section, remove the model to improve performance
    if (percentageComplete > 0.1 && !modelRemoved) {
        introSectionGroup.remove(model)
        modelRemoved = true
        // Update the pass effect so it's not as noticeable 
        afterimagePass.uniforms[ 'damp' ].value = 0.1
    }

    // Reset the model animation once we're almost back to the starting point
    if (percentageComplete > 0.95 && modelRemoved) {
        introSectionGroup.add(model)
        scrollY = 0
        modelRemoved = false
        // Turn the pass effect back up
        afterimagePass.uniforms[ 'damp' ].value = 0.5
    }

    // Render
    // renderer.render(scene, camera)
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

const init = () => {
    // Path for camera to follow
    addCurvePath()
    initCamera()
    initRenderer()
    addResizeListener()
    addMouseListener()
    // Add the intro section content
    addIntroContent()
    // Add the intro section content
    addAboutContent()
    // Sections
    addSurfacePlane()
    addIntroSection()
    addAboutSection()
    addProjectsSection()
    addContactSection()
    // Start the animation loop
    tick()
}

init()