import "./scss/index.scss"
import * as THREE from 'three'
import gsap from "gsap"
import { EffectComposer, RenderPass, EffectPass, BloomEffect, SMAAEffect } from 'postprocessing'
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { PositionAlongPathState } from "./PositionAlongPathState"
import { handleScroll, updatePosition } from './PositionAlongPathMethods'
import { loadParticlesModel, disposeGroup, setDeviceTextureQuality } from "./model.js"
import { QUALITY, downgradeQuality } from "./quality.js"
import { createBarGraph } from './barGraph.js'
import { skills } from './constants/skills.js'
import gridVertexShader from './shaders/gridVertexShader.glsl'
import gridFragmentShader from './shaders/gridFragmentShader.glsl'
import { COLOR3, COLOR4, COLOR5, BACKGROUND_COLOR, SECTION_SIZE,
    SCENE_SIZE,
    PLANE_SIZE,
    CURVE_PATH_HEIGHT,
    END_POINT,
    CONTACT_PATH_END,
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
    PROJECT_7_THRESHOLD,
    CONTACT_SECTION_THRESHOLD,
    PROJECT_7_CSS_Z,
    CONTACT_CSS_Z,
    CONTACT_CSS_Y,
    INITIAL_SCROLL_DISTANCE_FAST,
    INITIAL_SCROLL_DISTANCE_DEFAULT,
    PROJECTS_SCROLL_DISTANCE_FAST,
    PROJECTS_SCROLL_DISTANCE_DEFAULT,
} from "./constants"
import { addDualDeviceProject, addMobileProject, addProject, addProjectText, addTvLaptopProject, addTwoTvLaptopProject } from "./projects/index.js"


const canvas = document.getElementById('canvas')
const cssCanvas = document.getElementById('cssCanvas')
const scrollIndicator = document.getElementById('scrollIndicator')
const scene = new THREE.Scene()
const cssScene = new THREE.Scene()
const clock = new THREE.Clock()
const introSectionGroup = new THREE.Group()
// Path configuration
let positionAlongPathState = new PositionAlongPathState()
// Mouse position
const mouse = new THREE.Vector2()
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
let project7Group = null
// Viewport size
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
// Font loaders
const fontLoader = new TTFLoader()

let camera = null
let renderer = null
let composer = null
let cssRenderer = null
let usePostProcessing = QUALITY.bloom
let lastTime = performance.now()
let initialScrollValuesSet = false
// Live quality probe: average FPS over a window after warmup, downgrade once
let qualityChecked = false
let fpsSampleCount = 0
let fpsSampleAccum = 0
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
let project7Active = null
let contactSectionActive = null
let project0Text = null
let project1Text = null
let project2Text = null
let project3Text = null
let project4Text = null
let project5Text = null
let project6Text = null
let project7Text = null
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
            const textOptions = {
                font: font,
                height: 1.6,
                curveSegments: 8,
                bevelEnabled: true,
                bevelThickness: 0.14,
                bevelSize: 0.09,
                bevelOffset: 0,
                bevelSegments: 5,
            }
            const textGeometry1 = new TextGeometry("HI", { ...textOptions, size: 5 })
            const textGeometry2 = new TextGeometry("I'M SCOTT", { ...textOptions, size: 3.5 })

            // Two-material treatment: a softly glowing face (just past 1.0 so
            // it blooms like a backlit sign) over dark metallic extruded sides
            const faceMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(1.05, 1.16, 1.1),
            })
            const sideMaterial = new THREE.MeshStandardMaterial({
                color: 0x12161d,
                metalness: 0.9,
                roughness: 0.32,
            })
            const textMaterials = [faceMaterial, sideMaterial]
            const text1 = new THREE.Mesh(textGeometry1, textMaterials)
            const text2 = new THREE.Mesh(textGeometry2, textMaterials)
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
        renderer.setPixelRatio(QUALITY.pixelRatio)
        if (composer) composer.setSize(sizes.width, sizes.height)

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
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 3000)

    camera.position.copy(curvePath.getPointAt(0))
    camera.lookAt(curvePath.getPointAt(0.01))

    scene.add(camera)
}

/**
 * Add some lighting to the scene. Most of the base illumination comes from
 * the environment map; these lights add directional shape and highlights.
 */
const initLights = () => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)
}

/**
 * Configure our renderer and the post-processing pipeline. Bloom only picks
 * up colors pushed past 1.0 (HDR), so neon lines/particles glow while
 * regular content stays crisp.
 */
const initRenderer = () => {
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        powerPreference: 'high-performance',
        antialias: false,
        stencil: false,
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(QUALITY.pixelRatio)
    setDeviceTextureQuality(renderer.capabilities.getMaxAnisotropy())

    // Atmosphere
    scene.background = new THREE.Color(BACKGROUND_COLOR)
    scene.fog = new THREE.FogExp2(new THREE.Color(BACKGROUND_COLOR), 0.0085)

    // Environment lighting so metallic surfaces have something to reflect
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.65
    pmremGenerator.dispose()

    // Post-processing: HDR buffer -> bloom + SMAA. Skipped on the low tier,
    // where we render the scene directly (neon still shows, just no halo/AA).
    if (QUALITY.bloom) {
        composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType })
        composer.addPass(new RenderPass(scene, camera))
        const bloomEffect = new BloomEffect({
            mipmapBlur: true,
            intensity: QUALITY.bloomIntensity,
            luminanceThreshold: 1.0,
            luminanceSmoothing: 0.3,
        })
        composer.addPass(new EffectPass(camera, bloomEffect, new SMAAEffect()))
    }

    // CSS renderer
    cssRenderer = new CSS3DRenderer();
	cssRenderer.setSize(sizes.width, sizes.height)
    cssRenderer.domElement.style.position = 'absolute'
    cssRenderer.domElement.style.left = 0
    cssRenderer.domElement.style.top = 0
	cssCanvas.appendChild(cssRenderer.domElement)
    cssScene.scale.set(0.1, 0.1, 0.1)
}

/**
 * The floor: a shader-drawn neon grid that fades into the fog with distance
 */
const addSurfacePlane = () => {
    surfacePlaneMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uBaseColor: { value: new THREE.Color(BACKGROUND_COLOR).multiplyScalar(1.4) },
            uLineColor: { value: new THREE.Color(COLOR4) },
            uAccentColor: { value: new THREE.Color(COLOR5) },
        },
        vertexShader: gridVertexShader,
        fragmentShader: gridFragmentShader,
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
 * Faint drifting motes of light along the whole path for depth and parallax
 */
const addDustParticles = () => {
    const count = 1300
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 240
        positions[i * 3 + 1] = Math.random() * 45 - 2
        positions[i * 3 + 2] = 150 - Math.random() * 1400
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Soft round sprite so the motes don't render as hard squares
    const size = 64
    const spriteCanvas = document.createElement('canvas')
    spriteCanvas.width = spriteCanvas.height = size
    const ctx = spriteCanvas.getContext('2d')
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    const material = new THREE.PointsMaterial({
        color: new THREE.Color(COLOR4).multiplyScalar(1.5),
        map: new THREE.CanvasTexture(spriteCanvas),
        size: 0.5,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    })

    scene.add(new THREE.Points(geometry, material))
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
        // Continue past the last project and stop at the contact area
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, -1160),
        new THREE.Vector3(0, CURVE_PATH_HEIGHT, CONTACT_PATH_END),
    ] );
    curvePath.closed = false;
    
    // The path renders as a glowing energy conduit running along the floor.
    // HDR color so the bloom pass gives it a neon halo.
    const geometry = new THREE.TubeGeometry(curvePath, 1028, 0.05, 3, false)
    const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(COLOR4).multiplyScalar(2.5),
        side: THREE.DoubleSide,
    });
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
const addAboutGraph = async (font) => {
    skillsGraph = createBarGraph(font);

    skillsGraph.position.set(-10, 14, -10)
    skillsGraph.rotation.set(Math.PI, Math.PI * 1.7, Math.PI / 2)
    scene.add(skillsGraph)
}

/**
 * Animate about graph to be visible. Each bar group holds a translucent
 * body and a neon edge wireframe (see createBarGraph); labels are meshes.
 */
const animateAboutGraph = (show) => {
    for (let i = 0; i < skillsGraph.children.length; i++) {
        const barGroup = skillsGraph.children[i];

        // Random delay for staggered animation
        const delay = Math.random() * 0.5;

        if (barGroup instanceof THREE.Group) {
            const [body, edges] = barGroup.children

            gsap.to(edges.material, {
                opacity: show ? 1 : 0,
                duration: 0.8,
                delay: delay,
                ease: 'power2.inOut'
            });

            gsap.to(body.material, {
                opacity: show ? 0.16 : 0,
                duration: 1,
                delay: delay,
                ease: 'power2.inOut'
            });

            if (show) {
                gsap.fromTo(barGroup.scale,
                    { x: 0.6, y: 0.6, z: 0.6 },
                    { x: 1, y: 1, z: 1, duration: 1.2, delay: delay, ease: 'elastic.out(1, 0.6)' }
                );
            }
        } else if (barGroup instanceof THREE.Mesh) {
            // Animate the text
            gsap.to(barGroup.material, {
                opacity: show ? 1 : 0,
                duration: 0.8,
                delay: delay + 0.2,
                ease: 'power2.inOut'
            });
        }
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
    
    skillsGroup.position.set(0, 30, -650) // Moved back by 50px
    skillsGroup.scale.set(0.195, 0.195, 0.195) // Increased by 30% (0.15 * 1.3)
    cssScene.add(skillsGroup)

    const vector = new THREE.Vector3()
    const yAxis = new THREE.Vector3(0, 1, 0) // Y-axis for rotation

    // Spread items across the screen in an evenly spaced grid pattern with concave curve
    const totalSkills = skillsGroup.children.length
    const cols = Math.ceil(Math.sqrt(totalSkills))
    const rows = Math.ceil(totalSkills / cols)
    const spacingX = 224 // Horizontal spacing (reduced by 30% from 320)
    const spacingY = 175 // Vertical spacing (reduced by 30% from 250)
    const startX = -(cols - 1) * spacingX / 2
    const startY = (rows - 1) * spacingY / 2
    const startZ = -200
    const centerX = startX + (cols - 1) * spacingX / 2
    const maxDistanceX = (cols - 1) * spacingX / 2
    const curveDepth = 240 // How deep the concave curve goes (reduced by 20% from 300)

    for (let i = 0, l = totalSkills; i < l; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        
        // Get the actual displayed CSS3DObject
        const skillObject = skillsGroup.children[i]
        
        // Create target object for animation
        const targetObject = new THREE.Object3D()

        const x = startX + col * spacingX
        const y = startY - row * spacingY
        
        // Calculate distance from center for concave effect
        const distanceFromCenter = (x - centerX) / maxDistanceX // Normalized -1 to 1
        const distanceSquared = distanceFromCenter * distanceFromCenter
        
        // Apply concave curve: outer items move forward (toward camera)
        const z = startZ + (distanceSquared * curveDepth)

        targetObject.position.set(x, y, z)

        // Calculate Y-axis rotation for concave effect
        // Outer items rotate more to face inward (center items = 0, edges = max rotation)
        // Negate to flip direction: left items rotate right, right items rotate left
        const rotationY = -distanceFromCenter * Math.PI / 7.5 // Max rotation of ~24 degrees (reduced by 20%)
        
        // Calculate direction to camera
        vector.x = targetObject.position.x * 0.5
        vector.y = targetObject.position.y
        vector.z = targetObject.position.z + 1000
        
        // Calculate the angle to face the camera
        const direction = new THREE.Vector3()
        direction.subVectors(vector, targetObject.position).normalize()
        
        // Calculate rotation to face camera
        const angleToCamera = Math.atan2(direction.x, direction.z)
        
        // Set rotation on target: face camera + Y-axis rotation for concave effect
        targetObject.rotation.y = angleToCamera + rotationY
        
        // Also apply rotation directly to the actual displayed object
        skillObject.rotation.y = angleToCamera + rotationY

        skillsObjects.push( targetObject )
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
        
        // Also animate rotation
        gsap.to(object.rotation, {
            y: show ? target.rotation.y : 0,
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
/**
 * Build a floating HUD-style card with a small section label above the copy
 */
const createContentCard = (label, copy, wide = false) => {
    const content = document.createElement('div')
    content.className = wide ? 'content-card wide' : 'content-card'

    const cardLabel = document.createElement('span')
    cardLabel.className = 'content-card__label'
    cardLabel.innerText = label
    content.appendChild(cardLabel)

    const text = document.createElement('p')
    text.className = 'content-card__text'
    text.innerText = copy
    content.appendChild(text)

    return content
}

const addAboutText = () => {
    const content = createContentCard(
        '01 · About',
        "I am a web developer from Boston with passion for building fun and interactive front-end experiences."
    )

    aboutContent = new CSS3DObject(content);
    aboutContent.position.set(370, 60, 250)

    cssScene.add(aboutContent)
}

const addSkillsText = () => {
    const content = createContentCard(
        '02 · Core Stack',
        "Some of my primary technical knowledge includes the following."
    )

    skillsText = new CSS3DObject(content);
    skillsText.position.set(125, 60, -120)
    skillsText.rotation.y = Math.PI / 6

    cssScene.add(skillsText)
}

const addSkillsCloudText = () => {
    const content = createContentCard(
        '03 · Toolbox',
        "Other familiar libraries, languages, and technologies that I've worked with include the following."
    )

    skillsCloudText = new CSS3DObject(content)
    skillsCloudText.position.set(-300, 65, -520)
    skillsCloudText.rotation.y = Math.PI / 6

    cssScene.add(skillsCloudText)
}

const addProjectsIntroText = () => {
    const content = createContentCard(
        '04 · Selected Work',
        "Here are some fun projects (that I'm allowed to mention) that I've worked on over the years.",
        true
    )

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
    project7Text = addProjectText(cssScene, 'project7', PROJECT_7_CSS_Z)
}

// DecorAI
const addProject0 = () => {
    project0Group = new THREE.Group()
    const project0models = [
        './models/decorai-screen-hq.glb',
        './models/decorai-macbook-hq.glb',
        './models/decorai-iphone-hq.glb',
    ]
    addProject(scene, project0Group, project0models, -270)
}

// Made With AI
const addProject1 = () => {
    project1Group = new THREE.Group()
    const project1models = [
        './models/made-with-ai-tv-1-hq.glb',
        './models/made-with-ai-tv-2-hq.glb',
        './models/made-with-ai-laptop-hq.glb',
    ]
    addTwoTvLaptopProject(scene, project1Group, project1models, -390)
}

// Dev samples
const addProject2 = () => {
    project2Group = new THREE.Group()
    const project2models = ['./models/devsamples-macbook-hq.glb', './models/devsamples-iphone-hq.glb']
    addDualDeviceProject(scene, project2Group, project2models, -510)
}

// Transit Tracker
const addProject3 = () => {
    project3Group = new THREE.Group()
    const project3models = ['./models/tt-iphone.glb', './models/tt-iphone2.glb', './models/tt-iphone3.glb']
    addMobileProject(scene, project3Group, project3models, -630, { middlePhoneY: -1 })
}

// Global Tweets
const addProject4 = () => {
    project4Group = new THREE.Group()
    const project4models = ['./models/tweets-screen-hq.glb', './models/tweets-macbook-hq.glb']
    addTvLaptopProject(scene, project4Group, project4models, -750)
}

// Tour Director/Traveler
const addProject5 = () => {
    project5Group = new THREE.Group()
    const project5models = ['./models/td-iphone.glb', './models/td-iphone2.glb', './models/td-iphone3.glb']
    addMobileProject(scene, project5Group, project5models, -870, { middlePhoneY: -1 })
}

// Father Peyton
const addProject6 = () => {
    project6Group = new THREE.Group()
    const project6models = ['./models/fp-screen.glb', './models/fp-macbook.glb', './models/fp-iphone.glb']
    addProject(scene, project6Group, project6models, -990)
}

// Arc Advisory Group
const addProject7 = () => {
    project7Group = new THREE.Group()
    const project7models = ['./models/arc-screen.glb', './models/arc-macbook.glb', './models/arc-iphone.glb']
    addProject(scene, project7Group, project7models, -1110)
}

/**
 * ============================================================================
 * Contacts
 * ============================================================================
 */
const addContactSection = () => {
    const content = document.getElementById('contactSection')

    contactSection = new CSS3DObject(content)
    // Centered at eye level so the full section stays framed when the camera stops.
    contactSection.position.set(0, CONTACT_CSS_Y, CONTACT_CSS_Z)
    cssScene.add(contactSection)
}

/**
 * Animate
 */
const tick = () => {
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

    // Live quality probe: after a warmup (intro animation settles), average FPS
    // over a window. If a machine we judged capable is actually struggling,
    // downgrade the cheap live knobs once (resolution + bloom).
    if (!qualityChecked && elapsedTime > 2) {
        fpsSampleAccum += fps
        fpsSampleCount++

        if (fpsSampleCount >= 90) {
            const averageFps = fpsSampleAccum / fpsSampleCount

            if (averageFps < 45 && downgradeQuality()) {
                usePostProcessing = false
                renderer.setPixelRatio(QUALITY.pixelRatio)
                if (composer) composer.setSize(sizes.width, sizes.height)
            }

            qualityChecked = true
        }
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
        disposeGroup(project0Group)
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
        disposeGroup(project1Group)
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
        disposeGroup(project2Group)
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
        disposeGroup(project3Group)
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
        disposeGroup(project4Group)
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
        disposeGroup(project5Group)
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
        disposeGroup(project6Group)
        scene.remove(project6Group)
        project6Group = null
        project6Active = false
        project6Text.element.classList.remove('active')
    }

    if (project6Text && project6Active) {
        project6Text.quaternion.copy(camera.quaternion)
    }

    // Project 7
    if (percentageComplete >= PROJECT_7_THRESHOLD && !project7Active) {
        addProject7()
        project7Active = true
        project7Text.element.classList.add('active')
    }

    if (percentageComplete < PROJECT_7_THRESHOLD && project7Active) {
        disposeGroup(project7Group)
        scene.remove(project7Group)
        project7Group = null
        project7Active = false
        project7Text.element.classList.remove('active')
    }

    if (project7Text && project7Active) {
        project7Text.quaternion.copy(camera.quaternion)
    }

    // Contact section — immediately after the final project
    if (percentageComplete >= CONTACT_SECTION_THRESHOLD && !contactSectionActive) {
        contactSectionActive = true
        contactSection.element.classList.add('active')

        if (project7Active) {
            disposeGroup(project7Group)
            scene.remove(project7Group)
            project7Group = null
            project7Active = false
            project7Text.element.classList.remove('active')
        }
    }

    if (percentageComplete < CONTACT_SECTION_THRESHOLD && contactSectionActive) {
        contactSectionActive = false
        contactSection.element.classList.remove('active')
    }

    if (contactSection && contactSectionActive) {
        contactSection.quaternion.copy(camera.quaternion)
    }

    // Render: through the bloom composer when enabled, otherwise straight to screen
    if (usePostProcessing && composer) {
        composer.render()
    } else {
        renderer.render(scene, camera)
    }
    cssRenderer.render(cssScene, camera);

    lastTime = now

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
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
    addDustParticles()
    addIntroContent()
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
