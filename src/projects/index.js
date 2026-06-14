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

const showcaseStyle = { showcase: true }

export const addDualDeviceProject = async (scene, group, modelPaths, z) => {
    scene.add(group)

    const [laptop, phone] = await Promise.all(modelPaths.map(m => loadModel(m)))
    applyDeviceStyle(laptop)
    applyDeviceStyle(phone)

    laptop.rotation.y -= Math.PI / 9
    laptop.rotation.x += Math.PI / 12
    laptop.rotation.z += Math.PI / 52
    animateToPosition(laptop, 0, 1, -5)
    animateToScale(laptop, 4.6, 4.6, 4.6)

    phone.rotation.y -= Math.PI / 5
    phone.rotation.x += Math.PI / 18
    animateToPosition(phone, 15, 5, 5)
    animateToScale(phone, 3.8, 3.8, 3.8)

    group.position.set(12, 0, z)
    group.add(laptop, phone)
}

export const addTvLaptopProject = async (scene, group, modelPaths, z) => {
    scene.add(group)

    const [tv, laptop] = await Promise.all(modelPaths.map(m => loadModel(m)))
    applyDeviceStyle(tv, showcaseStyle)
    applyDeviceStyle(laptop, showcaseStyle)

    // Use the original rotations that face screens toward the camera path.
    tv.rotation.y += Math.PI / 14
    tv.rotation.x += Math.PI / 20
    animateToPosition(tv, -5, 11, -13)
    animateToScale(tv, 6.3, 6.3, 6.3)

    laptop.rotation.y -= Math.PI / 10
    laptop.rotation.x += Math.PI / 14
    laptop.rotation.z += Math.PI / 46
    animateToPosition(laptop, 16, 3, 9)
    animateToScale(laptop, 4.0, 4.0, 4.0)

    group.position.set(12, 0, z)
    group.rotation.y -= (12 * Math.PI) / 180
    group.add(tv, laptop)
}

export const addTwoTvLaptopProject = async (scene, group, modelPaths, z) => {
    scene.add(group)

    const [tv1, tv2, laptop] = await Promise.all(modelPaths.map(m => loadModel(m)))
    applyDeviceStyle(tv1, showcaseStyle)
    applyDeviceStyle(tv2, showcaseStyle)
    applyDeviceStyle(laptop, showcaseStyle)

    // Left to right: TV, laptop, TV — echoing the tv/laptop/phone layout but
    // spread wider since both flanks are full-size TVs.
    tv1.rotation.y += Math.PI / 14
    tv1.rotation.x += Math.PI / 20
    animateToPosition(tv1, -6, 10, -6)
    animateToScale(tv1, 4.6, 4.6, 4.6)

    laptop.rotation.y -= Math.PI / 10
    laptop.rotation.x += Math.PI / 14
    laptop.rotation.z += Math.PI / 46
    animateToPosition(laptop, 9, 0, -2)
    animateToScale(laptop, 3.6, 3.6, 3.6)

    tv2.rotation.y -= Math.PI / 10
    tv2.rotation.x += Math.PI / 20
    animateToPosition(tv2, 24, 8, 7)
    animateToScale(tv2, 4.6, 4.6, 4.6)

    group.position.set(12, 0, z)
    group.rotation.y -= (12 * Math.PI) / 180
    group.add(tv1, laptop, tv2)
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

export const addMobileProject = async (scene, group, modelPaths, z, layout = {}) => {
    const { middlePhoneY = -4 } = layout
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
    animateToPosition(iphone2, 11, middlePhoneY, -2)
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
