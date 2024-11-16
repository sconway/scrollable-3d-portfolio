import "./scss/index.scss"
import * as THREE from 'three'
import gsap from "gsap"
import Stats from "stats.js"
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { PositionAlongPathState } from "./PositionAlongPathState"
import { handleScroll, updatePosition } from './PositionAlongPathMethods'
import { loadModel, loadParticlesModel } from "./model.js"
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
// const stats = new Stats()
// stats.showPanel(0)
// document.body.appendChild(stats.dom)
 
const canvas = document.getElementById('canvas')
const cssCanvas = document.getElementById('cssCanvas')
const scrollIndicator = document.getElementById('scrollIndicator')
const scene = new THREE.Scene()
const cssScene = new THREE.Scene()
const clock = new THREE.Clock()
const textureLoader = new THREE.TextureLoader()
const introSectionGroup = new THREE.Group()
// Path configuration
let positionAlongPathState = new PositionAlongPathState()
// Mouse position
const mouse = new THREE.Vector2()
// Skills
const skillsGraphGroup = new THREE.Group()
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
// Viewport size
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
// Font loaders
const fontLoader = new TTFLoader()
// Textures
const matCapTexture = textureLoader.load('./textures/matcap8.png')
matCapTexture.colorSpace = THREE.SRGBColorSpace

let camera = null
let renderer = null
let cssRenderer = null
let lastTime = performance.now()
let initialScrollValuesSet = false
let curvePath = null
let scrollY = 0
let surfacePlaneMaterial = null
let model = null
let sceneModel = null
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

const handlePageLoad = () => {
    const loadingScreen = document.getElementById("loadingScreen");
    loadingScreen.classList.add("active");
}

/**
 * =======================================================================
 * EVENT LISTENERS
 * =======================================================================
 */

const addPageLoadListener = () => {
    window.addEventListener("load", handlePageLoad, false);
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
    })
}

const add2DButtonListener = () => {
    const switchButton = document.getElementById("switch")
    
    switchButton.addEventListener("click", () => {
        switchButton.classList.add("active")

        setTimeout(() => {
            window.location.href = "https://www.sconway.me"
        }, 350)
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

    scene.add(camera)
}

/**
 * Add some lighting to the scene.
 */
const initLights = () => {
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
        antialias: true,
        stencil: false,
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

    scene.add(plane)
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

const addResetListener = () => {
    document.getElementById("resetButton").addEventListener("click", resetCurvePath)
}

/**
 * Reset the scroll animation back to the starting point
 */
const resetCurvePath = () => {
    scrollY = 0
    sceneModel = model
    introSectionGroup.add(sceneModel)
    positionAlongPathState = new PositionAlongPathState()
    camera.position.copy(curvePath.getPointAt(0))
    camera.lookAt(curvePath.getPointAt(0.01))
    handleScroll({deltaY: 1}, positionAlongPathState)
}

/**
 * =======================================================================
 * SKILLS SECTION
 * =======================================================================
 */
const addAboutGraph = async () => {
    skillsGraph = await loadModel("./models/bars.glb");
    skillsGraph.rotation.z -= Math.PI / 14
    skillsGraph.rotation.y -= Math.PI / 3.4

    skillsGraphGroup.add(skillsGraph)
    skillsGraphGroup.position.set(-33, -3, -13)
    skillsGraphGroup.scale.set(0, 0, 0)

    scene.add(skillsGraphGroup)
}

/**
 * Animate about graph to be visible
 */
const animateAboutGraph = (show) => {
    gsap.to(skillsGraphGroup.scale, {
        x: show ? 1 : 0,
        y: show ? 1 : 0,
        z: show ? 1 : 0,
        duration: show ? 0.7 : 0.1,
        ease: 'expo.inOut',
    })

    gsap.to(skillsGraphGroup.position, {
        x: show ? -33 : -100,
        duration: show ? 0.7 : 0.1,
        ease: 'expo.inOut',
    })
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
    
    skillsGroup.position.set(50, 30, -600)
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

    cssScene.add(skillsCloudText)
}

const addProjectsIntroText = () => {
    const content = document.createElement('div')
    content.className = 'content-card wide'

    const text = document.createElement('p')
    text.className = 'content-card__text'
    text.innerText = "Here are some fun projects (that I'm allowed to mention) that I've worked on over the years."
    content.appendChild(text)

    projectsIntroText = new CSS3DObject(content);
    projectsIntroText.position.set(10, 150, -1250)
    
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
    const project0models = ['./models/devsamples-screen.glb', './models/devsamples-macbook.glb', './models/devsamples-iphone.glb']
    addProject(scene, project0Group, project0models, -270)
}

// ARC
const addProject1 = () => {
    project1Group = new THREE.Group()
    const project1models = ['./models/arc-screen.glb', './models/arc-macbook.glb', './models/arc-iphone.glb']
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
    const project3models = ['./models/fp-screen.glb', './models/fp-macbook.glb', './models/fp-iphone.glb']
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
    const project5models = ['./models/covid-screen.glb', './models/covid-macbook.glb', './models/covid-screen2.glb']
    addProject(scene, project5Group, project5models, -870)
}

// World Tweets
const addProject6 = () => {
    project6Group = new THREE.Group()
    const project6models = ['./models/tweets-screen.glb', './models/tweets-macbook.glb', './models/tweets-screen2.glb']
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
    // stats.begin()

    const elapsedTime = clock.getElapsedTime()
    
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

    scrollIndicator.style.height = percentageComplete * 100 + "%";

    // Once we pass the intro section, remove the model to improve performance
    if (percentageComplete >= ABOUT_THRESHOLD && sceneModel) {
        introSectionGroup.remove(model)
        sceneModel.geometry.dispose()
        sceneModel.material.dispose()
        sceneModel = null
    }

    // Reset the model animation once we're almost back to the starting point
    if (percentageComplete < ABOUT_THRESHOLD && !sceneModel && model) {
        sceneModel = model
        introSectionGroup.add(sceneModel)
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
    cssRenderer.render(cssScene, camera);

    lastTime = now

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    // stats.end()
}

const init = () => {
    // Path for camera to follow
    addCurvePath()
    initCamera()
    initLights()
    initRenderer()
    addPageLoadListener()
    addResizeListener()
    addMouseListener()
    add2DButtonListener()
    addResetListener()
    // Sections
    addSurfacePlane()
    addIntroContent()
    addAboutGraph()
    addAboutText()
    addSkillsText()
    addSkillsCloud()
    addSkillsCloudText()
    addProjectsIntroText()
    addProjectsText()
    addContactSection()
    // Start the animation loop
    tick()
}

init()
