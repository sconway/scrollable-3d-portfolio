import gsap from "gsap"
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { loadModel, applyDeviceStyle } from "../model"

const animateToPosition = (group, x, y, z) => {
    gsap.to(group.position, {
        x,
        y,
        z,
        duration: 1,
        ease: 'power3.out',
    })
}

const animateToScale = (group, x, y, z) => {
    gsap.to(group.scale, {
        x,
        y,
        z,
        duration: 1,
        ease: 'power3.out',
    })
}

export const addProject = async (scene, group, modelPaths, z) => {
    scene.add(group)

    // Load the project models to be placed
    const [tv, laptop, iphone] = await Promise.all(modelPaths.map(m => loadModel(m)))
    // Restyle each device with dark glossy bodies, backlit screens, and neon edges
    applyDeviceStyle(tv)
    applyDeviceStyle(laptop)
    applyDeviceStyle(iphone)
    // Position/rotate the project models
    tv.rotation.y += Math.PI / 14
    tv.rotation.x += Math.PI / 20
    animateToPosition(tv, -4, 10, -6)
    animateToScale(tv, 3.4, 3.4, 3.4)
    laptop.rotation.y -= Math.PI / 10
    laptop.rotation.x += Math.PI / 14
    laptop.rotation.z += Math.PI / 46
    animateToPosition(laptop, 7, 0, -2)
    animateToScale(laptop, 2.8, 2.8, 2.8)
    iphone.rotation.y -= Math.PI / 6
    animateToPosition(iphone, 14, 6, 7)
    animateToScale(iphone, 2.2, 2.2, 2.2)

    group.position.set(12, 0, z)
    group.add(tv, laptop, iphone)
}

export const addMobileProject = async (scene, group, modelPaths, z) => {
    scene.add(group)

    // Load the project models to be placed
    const [iphone1, iphone2, iphone3] = await Promise.all(modelPaths.map(m => loadModel(m)))
    // Restyle each device with dark glossy bodies, backlit screens, and neon edges
    applyDeviceStyle(iphone1)
    applyDeviceStyle(iphone2)
    applyDeviceStyle(iphone3)
    // Position/rotate the project models
    iphone1.rotation.y += Math.PI / 14
    animateToPosition(iphone1, -3, 4, -6)
    animateToScale(iphone1, 4, 4, 4)
    iphone2.rotation.y -= Math.PI / 10
    iphone2.rotation.x += Math.PI / 14
    iphone2.rotation.z += Math.PI / 46
    animateToPosition(iphone2, 11, -4, -2)
    animateToScale(iphone2, 4, 4, 4)
    iphone3.rotation.y -= Math.PI / 6
    animateToPosition(iphone3, 22, 6, 7)
    animateToScale(iphone3, 4, 4, 4)

    group.position.set(12, 1, z)
    group.add(iphone1, iphone2, iphone3)
}

export const addProjectText = (cssScene, projectId, z) => {
    const content = document.getElementById(projectId)
    const projectText = new CSS3DObject(content);

    projectText.position.set(-350, 80, z)
    cssScene.add(projectText)

    return projectText
}
