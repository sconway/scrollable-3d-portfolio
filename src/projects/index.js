import GUI from 'lil-gui'
import gsap from "gsap"
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { loadModel } from "../model"

// const gui = new GUI({
//     width: 300
// })

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
    // Position/rotate the project models
    // tv.position.set(-3, 7, -6)
    // tv.scale.set(3.4, 3.4, 3.4)
    tv.rotation.y += Math.PI / 14
    tv.rotation.x += Math.PI / 20
    animateToPosition(tv, -4, 10, -6)
    animateToScale(tv, 3.4, 3.4, 3.4)
    // laptop.position.set(6, -5, -2)
    // laptop.scale.set(2.2, 2.2, 2.2)
    laptop.rotation.y -= Math.PI / 10
    laptop.rotation.x += Math.PI / 14
    laptop.rotation.z += Math.PI / 46
    animateToPosition(laptop, 7, 0, -2)
    animateToScale(laptop, 2.8, 2.8, 2.8)
    // iphone.position.set(11, 6, 7)
    // iphone.scale.set(2.2, 2.2, 2.2)
    iphone.rotation.y -= Math.PI / 6
    animateToPosition(iphone, 14, 6, 7)
    animateToScale(iphone, 2.2, 2.2, 2.2)

    group.position.set(12, 0, z)
    group.add(tv, laptop, iphone)

    // gui.add(group.position, 'x').min(-300).max(300).step(1)
    // gui.add(group.position, 'y').min(-300).max(300).step(1)
    // gui.add(group.position, 'z').min(-300).max(300).step(1)

    // gui.add(tv.rotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI/12)
    // gui.add(laptop.rotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI/12)
    // gui.add(iphone.rotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI/12)

    // gui.add(tv.position, 'x').min(-100).max(300).step(1)
    // gui.add(tv.position, 'y').min(-100).max(300).step(1)
    // gui.add(tv.position, 'z').min(-100).max(300).step(1)
    // gui.add(laptop.position, 'x').min(-100).max(300).step(1)
    // gui.add(laptop.position, 'y').min(-100).max(300).step(1)
    // gui.add(laptop.position, 'z').min(-100).max(300).step(1)
    // gui.add(iphone.position, 'x').min(-100).max(300).step(1)
    // gui.add(iphone.position, 'y').min(-100).max(300).step(1)
    // gui.add(iphone.position, 'z').min(-100).max(300).step(1)
}

export const addMobileProject = async (scene, group, modelPaths, z) => {
    scene.add(group)

    // Load the project models to be placed
    const [iphone1, iphone2, iphone3] = await Promise.all(modelPaths.map(m => loadModel(m)))
    // Position/rotate the project models
    // iphone1.position.set(-3, 4, -6)
    // iphone1.scale.set(4, 4, 4)
    iphone1.rotation.y += Math.PI / 14
    animateToPosition(iphone1, -3, 4, -6)
    animateToScale(iphone1, 4, 4, 4)
    iphone2.rotation.y -= Math.PI / 10
    iphone2.rotation.x += Math.PI / 14
    iphone2.rotation.z += Math.PI / 46
    // iphone2.position.set(11, -4, -2)
    // iphone2.scale.set(4, 4, 4)
    animateToPosition(iphone2, 11, -4, -2)
    animateToScale(iphone2, 4, 4, 4)
    iphone3.rotation.y -= Math.PI / 6
    // iphone3.position.set(22, 6, 7)
    // iphone3.scale.set(4, 4, 4)
    animateToPosition(iphone3, 22, 6, 7)
    animateToScale(iphone3, 4, 4, 4)

    group.position.set(12, 1, z)
    group.add(iphone1, iphone2, iphone3)

    // gui.add(group.position, 'x').min(-300).max(300).step(1)
    // gui.add(group.position, 'y').min(-300).max(300).step(1)
    // gui.add(group.position, 'z').min(-300).max(300).step(1)

    // gui.add(iphone1.rotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI/12)
    // gui.add(iphone2.rotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI/12)
    // gui.add(iphone3.rotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI/12)

    // gui.add(iphone1.position, 'x').min(-100).max(300).step(1)
    // gui.add(iphone1.position, 'y').min(-100).max(300).step(1)
    // gui.add(iphone1.position, 'z').min(-100).max(300).step(1)
    // gui.add(iphone2.position, 'x').min(-100).max(300).step(1)
    // gui.add(iphone2.position, 'y').min(-100).max(300).step(1)
    // gui.add(iphone2.position, 'z').min(-100).max(300).step(1)
    // gui.add(iphone3.position, 'x').min(-100).max(300).step(1)
    // gui.add(iphone3.position, 'y').min(-100).max(300).step(1)
    // gui.add(iphone3.position, 'z').min(-100).max(300).step(1)
}

export const addProjectText = (cssScene, projectId, z) => {
    const content = document.getElementById(projectId)
    const projectText = new CSS3DObject(content);

    // gui.add(project0Text.position, 'x').min(-2500).max(1000).step(1)
    // gui.add(project0Text.position, 'y').min(-2500).max(1000).step(1)
    // gui.add(project0Text.position, 'z').min(-2500).max(1000).step(1)
    // gui.add(skillsText.rotation, 'y').min(0).max(Math.PI*2).step(Math.PI/24)
    projectText.position.set(-350, 80, z)
    // skillsCloudText.rotation.y = Math.PI / 6
    // contentCard.position.set(SCENE_SIZE / 12 + 10, CURVE_PATH_HEIGHT + 2, SCENE_SIZE / 6)
    cssScene.add(projectText)

    return projectText
}