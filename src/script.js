import "./scss/index.scss"
import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from "gsap"
import Stats from "stats.js"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
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
import { loadModel, loadParticlesModel, loadParticlesModel2 } from "./model.js"
import { createBarGraph } from './barGraph'
import { skills } from './constants/skills.js'
import { COLOR1, COLOR2, COLOR3, COLOR4, SECTION_SIZE,
    SCENE_SIZE,
    PLANE_SIZE,
    CURVE_PATH_HEIGHT,
    END_POINT,
    ABOUT_THRESHOLD,
    SKILLS_GRAPH_TEXT_THRESHOLD,
    SKILLS_CLOUD_TEXT_THRESHOLD,
    PROJECTS_TEXT_THRESHOLD,
    PROJECT_0_THRESHOLD,
    PROJECT_1_THRESHOLD,
    PROJECT_2_THRESHOLD,
    PROJECT_3_THRESHOLD,
    PROJECT_4_THRESHOLD,
    PROJECT_5_THRESHOLD,
    PROJECT_6_THRESHOLD,
    CONTACT_SECTION_THRESHOLD,
    INITIAL_SCROLL_DISTANCE_FAST,
    INITIAL_SCROLL_DISTANCE_DEFAULT,
    PROJECTS_SCROLL_DISTANCE_FAST,
    PROJECTS_SCROLL_DISTANCE_DEFAULT,
} from "./constants"
import { addMobileProject, addProject, addProjectText } from "./projects/index.js"

/**
 * Stats
 */
const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)
 
const gui = new GUI({
    width: 300
})
const canvas = document.getElementById('canvas')
const cssCanvas = document.getElementById('cssCanvas')
const scene = new THREE.Scene()
const cssScene = new THREE.Scene()
const clock = new THREE.Clock()
const textureLoader = new THREE.TextureLoader()
const introSectionGroup = new THREE.Group()
const aboutSectionGroup = new THREE.Group()
// Path configuration
const positionAlongPathState = new PositionAlongPathState()
// Mouse position
const mouse = new THREE.Vector2()
// Words
const wordGroup = new THREE.Group()
// Skills
const skillsGroup = new THREE.Group()
const skillsObjects = []
// Project groups
let project0Group = null
let project1Group = null
let project2Group = null
let project3Group = null
let project4Group = null
let project5Group = null
let project6Group = null
// Contact
const contactGroup = new THREE.Group()
const contactIconGroup = new THREE.Group()
// Viewport size
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
// Model loaders
// const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath('./draco/')
// const gltfLoader = new GLTFLoader()
// gltfLoader.setDRACOLoader(dracoLoader)

// Font loaders
const fontLoader = new TTFLoader()
// Textures
const matCapTexture = textureLoader.load('./textures/matcap8.png')
matCapTexture.colorSpace = THREE.SRGBColorSpace

// Axes helper
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

let camera = null
let renderer = null
let cssRenderer = null
let controls = null
let lastTime = performance.now()
let initialScrollValuesSet = false
let effectComposer = null
let curvePath = null
let scrollY = 0
let surfacePlaneMaterial = null
let model = null
let sceneModel = null
let afterimagePass = null
let aboutContent = null
let aboutContentActive = false
let skillsText = null
let skillsCloudText = null
let skillsGraph = null
let skillsContentActive = false
let skillsCloudActive = false
let projectsIntroText = null
let projectsIntroTextActive = null
let project0Active = null
let project1Active = null
let project2Active = null
let project3Active = null
let project4Active = null
let project5Active = null
let project6Active = null
let contactSectionActive = null
let project0Text = null
let project1Text = null
let project2Text = null
let project3Text = null
let project4Text = null
let project5Text = null
let project6Text = null
let contactSection = null


/**
 * =======================================================================
 * INTRO SECTION
 * =======================================================================
 */
const addIntroText = () => {
    fontLoader.load(
        './fonts/kode-bold.ttf', 
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

            text1.rotation.y = Math.PI / 8
            
            text2.position.x += 3.5
            text2.position.y += 5.6
            text2.position.z -= 2
            text2.rotation.z -= Math.PI / 12

            textGroup.position.x += 2
            textGroup.position.z -= 20
            textGroup.rotation.y -= Math.PI / 4
            textGroup.rotation.z += Math.PI / 60
            
            textGroup.add(text1)
            textGroup.add(text2)
            introSectionGroup.add(textGroup)

            addAboutGraph(font)
        }
    )
}

const addIntroContent = async () => {
    introSectionGroup.position.set(0, -2, (SCENE_SIZE / 3) + SECTION_SIZE)
    scene.add(introSectionGroup)

    addIntroText()

    model = await loadParticlesModel('./models/wave.glb', COLOR4, COLOR3)
    sceneModel = model
    sceneModel.position.x -= 10
    sceneModel.position.y += 7
    sceneModel.rotation.y += Math.PI / 7
    introSectionGroup.add(sceneModel)

    // gui.add(sceneModel.position, 'x').min(-10).max(10).step(1)
    // gui.add(sceneModel.position, 'y').min(-10).max(10).step(1)
    // gui.add(sceneModel.position, 'z').min(-10).max(10).step(1)
    
    // Animate the model to full size
    gsap.to(sceneModel.material.uniforms.uScale, {
        value: 1,
        duration: 1.5,
        ease: 'elastic.out',
        onComplete: () => {
            addScrollListener()
        }
    })
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

        // Update CSS renderer
        cssRenderer.setSize(sizes.width, sizes.height)

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
        const nextY = scrollY + e.deltaY

        // Make sure we don't keep updating if the user scrolls backwards at the start
        if (nextY > 0) {
            scrollY = nextY
        } else {
            scrollY = 0
        }

        handleScroll(e, positionAlongPathState)
    })
}

/**
 * Handle mouse events. Updates the shared mouse values to keep track of the user's mouse position
 */
const addMouseListener = () => {
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / sizes.width) * 2 - 1
        mouse.y = (event.clientY / sizes.height) * 2 + 1
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
    renderer = new THREE.WebGL1Renderer({
        canvas: canvas,
        antialias: true
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // CSS renderer
    cssRenderer = new CSS3DRenderer();
	cssRenderer.setSize(sizes.width, sizes.height)
    cssRenderer.domElement.style.position = 'absolute'
    cssRenderer.domElement.style.left = 0
    cssRenderer.domElement.style.top = 0
	cssCanvas.appendChild(cssRenderer.domElement)
    cssScene.scale.set(0.1, 0.1, 0.1)
    
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
    surfacePlaneMaterial = new THREE.MeshLambertMaterial({
        opacity: 0.4,
        color: new THREE.Color(COLOR2),
        side: THREE.DoubleSide,
        transparent: true
    })
    const planeGeometry = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE)
    const plane = new THREE.Mesh(
        planeGeometry,
        surfacePlaneMaterial
    )
    plane.rotation.x = -Math.PI / 2
    plane.position.set(0, -2.1, 0)

    scene.add(plane, introSectionGroup)
}

/**
 * First section 
 */
const addIntroSection = () => {
    const planeMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        wireframe: true
    })
    const planeGeometry = new THREE.PlaneGeometry(SECTION_SIZE, SECTION_SIZE)
    const plane = new THREE.Mesh(
        planeGeometry,
        planeMaterial
    )

    plane.rotation.x = -Math.PI / 2

    introSectionGroup.position.set(0, -2, (SCENE_SIZE / 3) + SECTION_SIZE)
    // introSectionGroup.add(plane)

    addIntroContent()
}

/**
 * =======================================================================
 * CAMERA PATH
 * =======================================================================
 */
const addCurvePath = () => {
    curvePath = new THREE.CatmullRomCurve3( [
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, SCENE_SIZE / 2),
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, SCENE_SIZE / 3),
        new THREE.Vector3(SCENE_SIZE / 12, CURVE_PATH_HEIGHT, SCENE_SIZE / 6), // first bend on the right
        new THREE.Vector3(-SCENE_SIZE / 12, CURVE_PATH_HEIGHT, -SCENE_SIZE / 6), // second bend on the left
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, -SCENE_SIZE / 3),
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, -SCENE_SIZE / 2),
        new THREE.Vector3(0, CURVE_PATH_HEIGHT * 4, -SCENE_SIZE / 1.5), // high point
        new THREE.Vector3(0, CURVE_PATH_HEIGHT * 2, -SCENE_SIZE), // ease back down
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, -SCENE_SIZE * 1.5),
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, -SCENE_SIZE * 1.75),
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, -SCENE_SIZE * 2),
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, END_POINT),
    ] );
    curvePath.closed = false;
    
    // SHOW LINE
    const geometry = new THREE.TubeGeometry(curvePath, 1028, 0.05, 3, false)
    const material = new THREE.MeshPhongMaterial({ color: COLOR4, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -4
    
    scene.add(mesh)
}

/**
 * =======================================================================
 * SKILLS SECTION
 * =======================================================================
 */
const addAboutGraph = (font) => {
    skillsGraph = createBarGraph(font);

    skillsGraph.position.set(-10, 14, -10)
    skillsGraph.rotation.set(Math.PI, Math.PI * 1.7, Math.PI / 2)

    // gui.add(skillsGraph.position, 'x').min(-200).max(200).step(1)
    // gui.add(skillsGraph.position, 'y').min(-200).max(200).step(1)
    // gui.add(skillsGraph.position, 'z').min(-200).max(200).step(1)

    scene.add(skillsGraph)
}

/**
 * Animate about graph to be visible
 */
const animateAboutGraph = (show) => {
    for (let i = 0; i < skillsGraph.children.length; i++) {
        const object = skillsGraph.children[i]

        object.visible = show

        gsap.to(object.material, {
            opacity: show ? 1 : 0,
            duration: Math.random() * 1 + 1,
            ease: 'expo.inOut',
        })
    }
}

const addSkillsCloud = () => {
    // Add a css skill card for each skill in the list
    for (let i = 0; i < skills.length; i++) {
        const card = document.createElement('div')
        card.className = 'skill-card'

        const text = document.createElement('h1')
        text.className = 'skill-card__heading'
        text.innerText = skills[i].value
        card.appendChild(text)

        const skill = new CSS3DObject(card);

        skillsGroup.add(skill)
    }
    
    skillsGroup.position.set(40, 30, -570)
    skillsGroup.scale.set(0.15, 0.15, 0.15)
    cssScene.add(skillsGroup)

    const vector = new THREE.Vector3()

    // Helix structure of the skill cards
    for (let i = 0, l = skillsGroup.children.length; i < l; i++) {
        const theta = i * 0.425 + Math.PI;
        const y = - ( i * 34 ) + 450;

        // const object = skillsGroup.children[i]0
        const object = new THREE.Object3D()

        object.position.setFromCylindricalCoords( 400, theta, y );

        vector.x = object.position.x * 1.2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;

        object.lookAt( vector );

        skillsObjects.push( object );
    }

    // for ( let i = 0, l = skillsGroup.children.length; i < l; i ++ ) {

    //     const phi = Math.acos( - 1 + ( 3 * i ) / l );
    //     const theta = Math.sqrt( l * Math.PI ) * phi;

    //     const object = new THREE.Object3D();

    //     object.position.setFromSphericalCoords( 300, phi, theta );

    //     vector.copy( object.position ).multiplyScalar( 2 );

    //     object.lookAt( vector );

    //     skillsObjects.push( object );

    // }

    // gui.add(skillsGroup.position, 'x').min(-1000).max(2000).step(1)
    // gui.add(skillsGroup.position, 'y').min(-1000).max(2000).step(1)
    // gui.add(skillsGroup.position, 'z').min(-1000).max(2000).step(1)
    
}

/**
 * Animate skills into circular structure
 */
const animateSkillsText = (show = true) => {    
    for (let i = 0; i < skillsGroup.children.length; i++) {
        const object = skillsGroup.children[i]
        const target = skillsObjects[i]
        const duration = show ? Math.random() + 1 : 1

        if (show) {
            object.element.classList.add("active")
        } else {
            object.element.classList.remove("active")
        }

        gsap.to(object.position, {
            x: show ? target.position.x : 0, 
            y: show ? target.position.y : 0, 
            z: show ? target.position.z : 0,
            duration: duration,
            ease: 'expo.inOut',
        })
    }
}

/**
 * ============================================================================
 * Content cards
 * ============================================================================
 */
const addAboutText = () => {
    const content = document.createElement('div')
    content.className = 'content-card'

    const text = document.createElement('p')
    text.className = 'content-card__text'
    text.innerText = "I am a web developer from Boston with passion for building fun and interactive front-end experiences."
    content.appendChild(text)

    aboutContent = new CSS3DObject(content);
    aboutContent.position.set(370, 60, 250)

    cssScene.add(aboutContent)
}

const addSkillsText = () => {
    const content = document.createElement('div')
    content.className = 'content-card'

    const text = document.createElement('p')
    text.className = 'content-card__text'
    text.innerText = "Some of my primary technical knowledge includes the following."
    content.appendChild(text)

    skillsText = new CSS3DObject(content);

    // gui.add(skillsText.position, 'x').min(-1000).max(2000).step(1)
    // gui.add(skillsText.position, 'y').min(-1000).max(2000).step(1)
    // gui.add(skillsText.position, 'z').min(-1000).max(2000).step(1)
    // gui.add(skillsText.rotation, 'y').min(0).max(Math.PI*2).step(Math.PI/24)
    skillsText.position.set(125, 60, -120)
    skillsText.rotation.y = Math.PI / 6

    cssScene.add(skillsText)
}

const addSkillsCloudText = () => {
    const content = document.createElement('div')
    content.className = 'content-card'

    const text = document.createElement('p')
    text.className = 'content-card__text'
    text.innerText = "Other familiar libraries, languages, and technologies that I've worked with include the following."
    content.appendChild(text)

    skillsCloudText = new CSS3DObject(content)
    skillsCloudText.position.set(-300, 65, -520)
    skillsCloudText.rotation.y = Math.PI / 6

    // gui.add(skillsCloudText.position, 'x').min(-1000).max(2000).step(1)
    // gui.add(skillsCloudText.position, 'y').min(-1000).max(2000).step(1)
    // gui.add(skillsCloudText.position, 'z').min(-1000).max(2000).step(1)

    cssScene.add(skillsCloudText)
}

const addProjectsIntroText = () => {
    const content = document.createElement('div')
    content.className = 'content-card'

    const text = document.createElement('p')
    text.className = 'content-card__text'
    text.innerText = "Here are some recent projects that I've worked on."
    content.appendChild(text)

    projectsIntroText = new CSS3DObject(content);
    projectsIntroText.position.set(10, 180, -1250)
    
    cssScene.add(projectsIntroText)
}

/**
 * ============================================================================
 * Projects
 * ============================================================================
 */
const addProjectsText = () => {
    project0Text = addProjectText(cssScene, 'project0', -3000)
    project1Text = addProjectText(cssScene, 'project1', -4200)
    project2Text = addProjectText(cssScene, 'project2', -5400)
    project3Text = addProjectText(cssScene, 'project3', -6600)
    project4Text = addProjectText(cssScene, 'project4', -7800)
    project5Text = addProjectText(cssScene, 'project5', -9000)
    project6Text = addProjectText(cssScene, 'project6', -10200)
}

// Dev samples
const addProject0 = () => {
    project0Group = new THREE.Group()
    const project0models = ['./models/devsamples-screen.glb', './models/devsamples-laptop.glb', './models/devsamples-iphone.glb']
    addProject(scene, project0Group, project0models, -270)
}

// ARC
const addProject1 = () => {
    project1Group = new THREE.Group()
    const project1models = ['./models/arc-screen.glb', './models/arc-laptop.glb', './models/arc-iphone.glb']
    addProject(scene, project1Group, project1models, -390)
}

 // TD/Traveler
const addProject2 = () => {
    project2Group = new THREE.Group()
    const project2models = ['./models/td-iphone.glb', './models/td-iphone2.glb', './models/td-iphone3.glb']
    addMobileProject(scene, project2Group, project2models, -510)
}

// Father Peyton
const addProject3 = () => {
    project3Group = new THREE.Group()
    const project3models = ['./models/fp-screen.glb', './models/fp-laptop.glb', './models/fp-iphone.glb']
    addProject(scene, project3Group, project3models, -630)
}

 // Transit Tracker
const addProject4 = () => {
    project4Group = new THREE.Group()
    const project4models = ['./models/tt-iphone.glb', './models/tt-iphone2.glb', './models/tt-iphone3.glb']
    addMobileProject(scene, project4Group, project4models, -750)
}
 
// Covid Tracker
const addProject5 = () => {
    project5Group = new THREE.Group()
    const project5models = ['./models/covid-screen.glb', './models/covid-laptop.glb', './models/covid-screen2.glb']
    addProject(scene, project5Group, project5models, -870)
}

// World Tweets
const addProject6 = () => {
    project6Group = new THREE.Group()
    const project6models = ['./models/tweets-screen.glb', './models/tweets-laptop.glb', './models/tweets-screen2.glb']
    addProject(scene, project6Group, project6models, -990)
}

/**
 * ============================================================================
 * Contacts
 * ============================================================================
 */
const addContactSection = () => {
    const content = document.getElementById('contactSection')
    contactSection = new CSS3DObject(content);
    contactSection.position.set(0, 100, -12600)
    cssScene.add(contactSection)
}

/**
 * Animate
 */
const tick = () => {
    stats.begin()

    const elapsedTime = clock.getElapsedTime()
    // controls.update()
    
    // Calculate frames per second of the screen
    const now = performance.now();
    const deltaTime = now - lastTime;
    const fps = 1000 / deltaTime;

    // Set initial values that determine the scroll speed based on the user's screen FPS
    if (!initialScrollValuesSet) {
        initialScrollValuesSet = true
        positionAlongPathState.lengthToScroll = fps > 60 ? INITIAL_SCROLL_DISTANCE_FAST : INITIAL_SCROLL_DISTANCE_DEFAULT
    }

    if (sceneModel) {
        sceneModel.material.uniforms.uTime.value = elapsedTime
        sceneModel.material.uniforms.uCameraZ.value = scrollY
    }

    // Update the camera position on our curve path as the user scrolls
    const percentageComplete = updatePosition(curvePath, camera, positionAlongPathState)

    // Once we pass the intro section, remove the model to improve performance
    if (percentageComplete >= ABOUT_THRESHOLD && sceneModel) {
        introSectionGroup.remove(model)
        sceneModel.geometry.dispose()
        sceneModel.material.dispose()
        sceneModel = null
        // Update the pass effect so it's not as noticeable 
        afterimagePass.uniforms[ 'damp' ].value = 0.1
    }

    // Reset the model animation once we're almost back to the starting point
    if (percentageComplete < ABOUT_THRESHOLD && !sceneModel && model) {
        sceneModel = model
        introSectionGroup.add(sceneModel)
        // Turn the pass effect back up
        afterimagePass.uniforms[ 'damp' ].value = 0.5
    }

    // About content
    if (percentageComplete >= ABOUT_THRESHOLD && !aboutContentActive) {
        aboutContentActive = true
        aboutContent.element.classList.add('active')
    }

    if (percentageComplete < ABOUT_THRESHOLD && aboutContentActive) {
        aboutContentActive = false
        aboutContent.element.classList.remove('active')
    }

    if (aboutContent && aboutContentActive) {
        aboutContent.quaternion.copy(camera.quaternion)
    }

    // Skills content
    if (percentageComplete >= SKILLS_GRAPH_TEXT_THRESHOLD && !skillsContentActive) {
        skillsContentActive = true
        skillsText.element.classList.add('active')
        animateAboutGraph(true)
    }

    if (percentageComplete < SKILLS_GRAPH_TEXT_THRESHOLD && skillsContentActive) {
        skillsContentActive = false
        skillsText.element.classList.remove('active')
        animateAboutGraph(false)
    }

    if (skillsText && skillsContentActive) {
        skillsText.quaternion.copy(camera.quaternion)
    }

    // Skills cloud content
    if (percentageComplete >= SKILLS_CLOUD_TEXT_THRESHOLD && !skillsCloudActive) {
        skillsCloudActive = true
        skillsCloudText.element.classList.add('active')
        animateSkillsText(true)
    }

    if (percentageComplete < SKILLS_CLOUD_TEXT_THRESHOLD && skillsCloudActive) {
        skillsCloudActive = false
        skillsCloudText.element.classList.remove('active')
        animateSkillsText(false)
    }

    if (skillsCloudText && skillsCloudActive) {
        skillsCloudText.quaternion.copy(camera.quaternion)
        // Rotate the skills cloud based on the mouse position
        skillsGroup.rotation.x += (mouse.x * 0.25 - skillsGroup.rotation.x)
        skillsGroup.rotation.y += (-mouse.y * 0.25 - skillsGroup.rotation.y)
    }

    // Projects
    if (percentageComplete >= PROJECTS_TEXT_THRESHOLD && !projectsIntroTextActive) {
        positionAlongPathState.lengthToScroll = fps > 60 ? PROJECTS_SCROLL_DISTANCE_FAST : PROJECTS_SCROLL_DISTANCE_DEFAULT
        projectsIntroTextActive = true
        projectsIntroText.element.classList.add('active')
    }

    if (percentageComplete < PROJECTS_TEXT_THRESHOLD && projectsIntroTextActive) {
        positionAlongPathState.lengthToScroll = fps > 60 ? INITIAL_SCROLL_DISTANCE_FAST : INITIAL_SCROLL_DISTANCE_DEFAULT
        projectsIntroTextActive = false
        projectsIntroText.element.classList.remove('active')
    }

    if (projectsIntroText && projectsIntroTextActive) {
        projectsIntroText.quaternion.copy(camera.quaternion)
    }

    // Project 0
    if (percentageComplete >= PROJECT_0_THRESHOLD && !project0Active) {
        addProject0()
        project0Active = true
        project0Text.element.classList.add('active')
    }

    if (percentageComplete < PROJECT_0_THRESHOLD && project0Active) {
        scene.remove(project0Group)
        project0Group = null
        project0Active = false
        project0Text.element.classList.remove('active')
    }

    if (project0Text && project0Active) {
        project0Text.quaternion.copy(camera.quaternion)
    }

    // Project 1
    if (percentageComplete >= PROJECT_1_THRESHOLD && !project1Active) {
        addProject1()
        project1Active = true
        project1Text.element.classList.add('active')
    }

    if (percentageComplete < PROJECT_1_THRESHOLD && project1Active) {
        scene.remove(project1Group)
        project1Group = null
        project1Active = false
        project1Text.element.classList.remove('active')
    }

    if (project1Text && project1Active) {
        project1Text.quaternion.copy(camera.quaternion)
    }

    // Project 2
    if (percentageComplete >= PROJECT_2_THRESHOLD && !project2Active) {
        addProject2()
        project2Active = true
        project2Text.element.classList.add('active')
    }

    if (percentageComplete < PROJECT_2_THRESHOLD && project2Active) {
        scene.remove(project2Group)
        project2Group = null
        project2Active = false
        project2Text.element.classList.remove('active')
    }

    if (project2Text && project2Active) {
        project2Text.quaternion.copy(camera.quaternion)
    }

    // Project 3
    if (percentageComplete >= PROJECT_3_THRESHOLD && !project3Active) {
        addProject3()
        project3Active = true
        project3Text.element.classList.add('active')
    }

    if (percentageComplete < PROJECT_3_THRESHOLD && project3Active) {
        scene.remove(project3Group)
        project3Group = null
        project3Active = false
        project3Text.element.classList.remove('active')
    }

    if (project3Text && project3Active) {
        project3Text.quaternion.copy(camera.quaternion)
    }

    // Project 4
    if (percentageComplete >= PROJECT_4_THRESHOLD && !project4Active) {
        addProject4()
        project4Active = true
        project4Text.element.classList.add('active')
    }

    if (percentageComplete < PROJECT_4_THRESHOLD && project4Active) {
        scene.remove(project4Group)
        project4Group = null
        project4Active = false
        project4Text.element.classList.remove('active')
    }

    if (project4Text && project4Active) {
        project4Text.quaternion.copy(camera.quaternion)
    }

    // Project 5
    if (percentageComplete >= PROJECT_5_THRESHOLD && !project5Active) {
        addProject5()
        project5Active = true
        project5Text.element.classList.add('active')
    }

    if (percentageComplete < PROJECT_5_THRESHOLD && project5Active) {
        scene.remove(project5Group)
        project5Group = null
        project5Active = false
        project5Text.element.classList.remove('active')
    }

    if (project5Text && project5Active) {
        project5Text.quaternion.copy(camera.quaternion)
    }

    // Project 6
    if (percentageComplete >= PROJECT_6_THRESHOLD && !project6Active) {
        addProject6()
        project6Active = true
        project6Text.element.classList.add('active')
    }

    if (percentageComplete < PROJECT_6_THRESHOLD && project6Active) {
        scene.remove(project6Group)
        project6Group = null
        project6Active = false
        project6Text.element.classList.remove('active')
    }

    if (project6Text && project6Active) {
        project6Text.quaternion.copy(camera.quaternion)
    }

    // Contact section
    if (percentageComplete >= CONTACT_SECTION_THRESHOLD && !contactSectionActive) {
        contactSectionActive = true
        contactSection.element.classList.add('active')
    }

    if (percentageComplete < CONTACT_SECTION_THRESHOLD && contactSectionActive) {
        contactSectionActive = false
        contactSection.element.classList.remove('active')
    }

    if (contactSection && contactSectionActive) {
        contactSection.quaternion.copy(camera.quaternion)
    }

    // Render
    renderer.render(scene, camera)
    // effectComposer.render()
    cssRenderer.render(cssScene, camera);

    lastTime = now

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

const init = () => {
    // Path for camera to follow
    addCurvePath()
    initCamera()
    initRenderer()
    addResizeListener()
    addMouseListener()
    // Add the intro section content
    // addAboutContent()
    // Sections
    addSurfacePlane()
    addIntroSection()
    // addIntroContent()
    addAboutText()
    addSkillsText()
    addSkillsCloud()
    addSkillsCloudText()
    addProjectsIntroText()
    addProjectsText()
    // addAboutSection()
    addContactSection()
    // Start the animation loop
    tick()
}

init()