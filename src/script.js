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
import { loadModel, loadParticlesModel } from "./model.js"
import { createBarGraph } from './barGraph'
import { skills } from './constants/skills.js'
import { addProject0, addProject0Text } from "./projects/index.js"

// const COLOR1 = '#240668'
const COLOR1 = '#121212'
// const COLOR2 = '#3A0CA3'
const COLOR2 = '#373f51'
// const COLOR3 = '#7209B7'
const COLOR3 = '#D8DBE2'
// const COLOR4 = '#F72585'
const COLOR4 = '#00f9aa'

/**
 * Stats
 */
const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)
 
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
const canvas = document.getElementById('canvas')
const cssCanvas = document.getElementById('cssCanvas')
const scene = new THREE.Scene()
const cssScene = new THREE.Scene()
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
// Skills
const skillsGroup = new THREE.Group()
const skillsObjects = []
// Project groups
const project0Group = new THREE.Group()
// Viewport size
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
// Model loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
// Font loaders
const fontLoader = new TTFLoader();
// Textures
const matCapTexture = textureLoader.load('./textures/matcap8.png')
matCapTexture.colorSpace = THREE.SRGBColorSpace

// Axes helper
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

let camera = null
let renderer = null
let cssRenderer = null
let controls = null
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
let project0Text = null


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
    sceneModel.position.y += 6.5
    sceneModel.rotation.y += Math.PI / 7
// console.log("OTHER: ", otherModel)
//     introSectionGroup.add(otherModel)
    introSectionGroup.add(sceneModel)
    // Animate the model to full size
    gsap.to(sceneModel.material.uniforms.uScale, {
        value: 1,
        duration: 1,
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
    introSectionGroup.add(plane)

    addIntroContent()
}

/**
 * Last section for contact infomation
 */
 const addContactSection = () => {
    const cubeMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
    })
    const cubeGeometry = new THREE.BoxGeometry(5, 5, 5)
    const cube = new THREE.Mesh(
        cubeGeometry,
        cubeMaterial
    )

    contactSectionGroup.position.set(0, CURVE_PATH_HEIGHT, -SCENE_SIZE * 2)
    contactSectionGroup.add(cube)
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
        new THREE.Vector3(0 / 4, CURVE_PATH_HEIGHT, 0),
        new THREE.Vector3(0 / 4, CURVE_PATH_HEIGHT, 0),
        new THREE.Vector3(-SCENE_SIZE / 12, CURVE_PATH_HEIGHT, -SCENE_SIZE / 6), // second bend on the left
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, -SCENE_SIZE / 3),
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, -SCENE_SIZE / 2),
        new THREE.Vector3(0, CURVE_PATH_HEIGHT * 4, -SCENE_SIZE / 1.5), // high point
        new THREE.Vector3(0, CURVE_PATH_HEIGHT * 2, -SCENE_SIZE), // ease back down
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, -SCENE_SIZE * 1.5),
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, -SCENE_SIZE * 1.75),
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, -SCENE_SIZE * 2),
    ] );
    curvePath.closed = false;
    
    // SHOW LINE
    const geometry = new THREE.TubeGeometry(curvePath, 256, 0.15, 2, false)
    // const points = curvePath.getPoints(32)
    // const shape = new THREE.Shape(points)
    // const geometry = new THREE.ShapeGeometry(shape)
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

    skillsGraph.position.set(10, 15, -50)
    skillsGraph.rotation.set(Math.PI, Math.PI * 1.7, Math.PI / 2)
    
    scene.add(skillsGraph)
}

/**
 * Animate about graph to be visible
 */
const animateAboutGraph = (value) => {
    for (let i = 0; i < skillsGraph.children.length; i++) {
        const object = skillsGraph.children[i]
        gsap.to(object.material, {
            opacity: value,
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
    
    skillsGroup.position.set(0, 30, -580)
    skillsGroup.scale.set(0.15, 0.15, 0.15)
    cssScene.add(skillsGroup)

    const vector = new THREE.Vector3()

    // Helix structure of the skill cards
    for (let i = 0, l = skillsGroup.children.length; i < l; i++) {
        const theta = i * 0.475 + Math.PI;
        const y = - ( i * 22 ) + 350;

        // const object = skillsGroup.children[i]0
        const object = new THREE.Object3D()

        object.position.setFromCylindricalCoords( 450, theta, y );

        vector.x = object.position.x * 1.2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;

        object.lookAt( vector );

        skillsObjects.push( object );
    }

    // gui.add(skillsGroup.position, 'x').min(-1000).max(2000).step(1)
    // gui.add(skillsGroup.position, 'y').min(-1000).max(2000).step(1)
    // gui.add(skillsGroup.position, 'z').min(-1000).max(2000).step(1)
    
    animateSkillsText()
}

/**
 * Animate skills into circular structure
 */
const animateSkillsText = () => {
    for (let i = 0; i < skillsGroup.children.length; i++) {
        const object = skillsGroup.children[i]
        const target = skillsObjects[i]

        gsap.to(object.position, {
            x: target.position.x, 
            y: target.position.y, 
            z: target.position.z,
            duration: Math.random() * 2 + 2,
            delay: 3,
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
    content.className = 'content-card active'

    const text = document.createElement('p')
    text.className = 'content-card__text'
    text.innerText = "I am a web developer from Boston with passion for building fun and interactive front-end experiences."
    content.appendChild(text)

    aboutContent = new CSS3DObject(content);

    aboutContent.position.set(370, 80, 250)
    // contentCard.position.set(SCENE_SIZE / 12 + 10, CURVE_PATH_HEIGHT + 2, SCENE_SIZE / 6)
    cssScene.add(aboutContent)
}

const addSkillsText = () => {
    const content = document.createElement('div')
    content.className = 'content-card active'

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
    // contentCard.position.set(SCENE_SIZE / 12 + 10, CURVE_PATH_HEIGHT + 2, SCENE_SIZE / 6)
    cssScene.add(skillsText)
}

const addSkillsCloudText = () => {
    const content = document.createElement('div')
    content.className = 'content-card active'

    const text = document.createElement('p')
    text.className = 'content-card__text'
    text.innerText = "Other familiar libraries, languages, and technologies that I've worked with include the following."
    content.appendChild(text)

    skillsCloudText = new CSS3DObject(content);

    // gui.add(skillsCloudText.position, 'x').min(-1000).max(2000).step(1)
    // gui.add(skillsCloudText.position, 'y').min(-1000).max(2000).step(1)
    // gui.add(skillsCloudText.position, 'z').min(-1000).max(2000).step(1)
    // gui.add(skillsText.rotation, 'y').min(0).max(Math.PI*2).step(Math.PI/24)
    skillsCloudText.position.set(-350, 65, -450)
    skillsCloudText.rotation.y = Math.PI / 6
    // contentCard.position.set(SCENE_SIZE / 12 + 10, CURVE_PATH_HEIGHT + 2, SCENE_SIZE / 6)
    cssScene.add(skillsCloudText)
}

const addProjectsIntroText = () => {
    const content = document.createElement('div')
    content.className = 'content-card active'

    const text = document.createElement('p')
    text.className = 'content-card__text'
    text.innerText = "Here are some recent projects that I've worked on."
    content.appendChild(text)

    projectsIntroText = new CSS3DObject(content);

    // gui.add(projectsIntroText.position, 'x').min(-2000).max(1000).step(1)
    // gui.add(projectsIntroText.position, 'y').min(-2000).max(1000).step(1)
    // gui.add(projectsIntroText.position, 'z').min(-2000).max(1000).step(1)
    // gui.add(skillsText.rotation, 'y').min(0).max(Math.PI*2).step(Math.PI/24)
    projectsIntroText.position.set(10, 200, -1250)
    // skillsCloudText.rotation.y = Math.PI / 6
    // contentCard.position.set(SCENE_SIZE / 12 + 10, CURVE_PATH_HEIGHT + 2, SCENE_SIZE / 6)
    cssScene.add(projectsIntroText)
}

/**
 * ============================================================================
 * Projects
 * ============================================================================
 */

const addProjects = () => {
    addProject0(scene, project0Group)
    project0Text = addProject0Text(cssScene)

}

// const addProject0 = async () => {
//     scene.add(project0Group)

//     // Load the project models to be placed
//     const [tv, laptop, iphone] = await Promise.all([
//         loadModel('./models/devsamples-screen.glb'),
//         loadModel('./models/devsamples-laptop.glb'),
//         loadModel('./models/devsamples-iphone.glb')
//     ])
//     // Position/rotate the project models
//     tv.position.set(-3, 7, -6)
//     tv.rotation.y += Math.PI / 14
//     tv.scale.set(3.4, 3.4, 3.4)
//     laptop.position.set(6, -5, -2)
//     laptop.rotation.y -= Math.PI / 10
//     laptop.rotation.x += Math.PI / 14
//     laptop.rotation.z += Math.PI / 46
//     laptop.scale.set(2.2, 2.2, 2.2)
//     iphone.position.set(11, 6, 7)
//     iphone.rotation.y -= Math.PI / 6
//     iphone.scale.set(2.2, 2.2, 2.2)

//     project0Group.position.set(12, 0, -250)
//     project0Group.add(tv, laptop, iphone)

//     // gui.add(project0Group.position, 'x').min(-300).max(300).step(1)
//     // gui.add(project0Group.position, 'y').min(-300).max(300).step(1)
//     // gui.add(project0Group.position, 'z').min(-300).max(300).step(1)

//     gui.add(tv.rotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI/12)
//     gui.add(laptop.rotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI/12)
//     gui.add(iphone.rotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI/12)

//     // gui.add(tv.position, 'x').min(-100).max(300).step(1)
//     // gui.add(tv.position, 'y').min(-100).max(300).step(1)
//     // gui.add(tv.position, 'z').min(-100).max(300).step(1)
//     // gui.add(laptop.position, 'x').min(-100).max(300).step(1)
//     // gui.add(laptop.position, 'y').min(-100).max(300).step(1)
//     // gui.add(laptop.position, 'z').min(-100).max(300).step(1)
//     // gui.add(iphone.position, 'x').min(-100).max(300).step(1)
//     // gui.add(iphone.position, 'y').min(-100).max(300).step(1)
//     // gui.add(iphone.position, 'z').min(-100).max(300).step(1)

//     addProject0Text()
// }

// const addProject0Text = () => {
//     const content = document.getElementById('project0')

//     project0Text = new CSS3DObject(content);

//     // gui.add(project0Text.position, 'x').min(-2500).max(1000).step(1)
//     // gui.add(project0Text.position, 'y').min(-2500).max(1000).step(1)
//     // gui.add(project0Text.position, 'z').min(-2500).max(1000).step(1)
//     // gui.add(skillsText.rotation, 'y').min(0).max(Math.PI*2).step(Math.PI/24)
//     project0Text.position.set(-350, 30, -2800)
//     // skillsCloudText.rotation.y = Math.PI / 6
//     // contentCard.position.set(SCENE_SIZE / 12 + 10, CURVE_PATH_HEIGHT + 2, SCENE_SIZE / 6)
//     cssScene.add(project0Text)
// }

/**
 * Animate
 */
const tick = () => {
    stats.begin()

    const elapsedTime = clock.getElapsedTime()

    // controls.update()

    if (sceneModel) {
        sceneModel.material.uniforms.uTime.value = elapsedTime
        sceneModel.material.uniforms.uCameraZ.value = scrollY
    }

    // Update the camera position on our curve path as the user scrolls
    const percentageComplete = updatePosition(curvePath, camera, positionAlongPathState)
    // console.log("PERCENT COMPLETE: ", percentageComplete)

    // Once we pass the intro section, remove the model to improve performance
    if (percentageComplete >= 0.1 && sceneModel) {
        introSectionGroup.remove(model)
        sceneModel.geometry.dispose()
        sceneModel.material.dispose()
        sceneModel = null
        // Update the pass effect so it's not as noticeable 
        afterimagePass.uniforms[ 'damp' ].value = 0.1
    }

    // Reset the model animation once we're almost back to the starting point
    if (percentageComplete < 0.1 && !sceneModel && model) {
        sceneModel = model
        introSectionGroup.add(sceneModel)
        // Turn the pass effect back up
        afterimagePass.uniforms[ 'damp' ].value = 0.5
    }

    // // About content
    // if (percentageComplete >= 0.1 && !aboutContentActive) {
    //     aboutContentActive = true
    //     aboutContent.element.classList.add('active')
    // }

    // if (percentageComplete < 0.1 && aboutContentActive) {
    //     aboutContentActive = false
    //     aboutContent.element.classList.remove('active')
    // }

    // if (aboutContent && aboutContentActive) {
    //     aboutContent.quaternion.copy(camera.quaternion)
    // }

    // // Skills content
    // if (percentageComplete >= 0.175 && !skillsContentActive) {
    //     skillsContentActive = true
    //     skillsText.element.classList.add('active')
    //     animateAboutGraph(1)
    // }

    // if (percentageComplete < 0.175 && skillsContentActive) {
    //     skillsContentActive = false
    //     skillsText.element.classList.remove('active')
    //     animateAboutGraph(0)
    // }

    // if (skillsText && skillsContentActive) {
    //     skillsText.quaternion.copy(camera.quaternion)
    //     // skillsGraph.quaternion.copy(camera.quaternion)
    // }

    // // Skills cloud content
    // if (percentageComplete >= 0.27 && !skillsCloudActive) {
    //     skillsCloudActive = true
    //     skillsCloudText.element.classList.add('active')
    //     // animateAboutGraph(1)
    // }

    // if (percentageComplete < 0.27 && skillsCloudActive) {
    //     skillsCloudActive = false
    //     skillsCloudText.element.classList.remove('active')
    //     // animateAboutGraph(0)
    // }

    // if (skillsCloudText && skillsCloudActive) {
    //     skillsCloudText.quaternion.copy(camera.quaternion)
    //     // skillsGraph.quaternion.copy(camera.quaternion)
    // }

    // Render
    renderer.render(scene, camera)
    // effectComposer.render()
    cssRenderer.render(cssScene, camera);

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
    // addMouseListener()
    // Add the intro section content
    // addAboutContent()
    // Sections
    addSurfacePlane()
    // addIntroSection()
    addIntroContent()
    addAboutText()
    addSkillsText()
    addSkillsCloud()
    addSkillsCloudText()
    addProjectsIntroText()
    addProjects()
    // addAboutSection()
    // addProjectsSection()
    addContactSection()
    // Start the animation loop
    tick()
}

init()