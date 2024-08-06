import GUI from 'lil-gui'
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { loadModel } from "../model"

const gui = new GUI({
    width: 300
})

export const addProject0 = async (scene, group) => {
    scene.add(group)

    // Load the project models to be placed
    const [tv, laptop, iphone] = await Promise.all([
        loadModel('./models/devsamples-screen.glb'),
        loadModel('./models/devsamples-laptop.glb'),
        loadModel('./models/devsamples-iphone.glb')
    ])
    // Position/rotate the project models
    tv.position.set(-3, 7, -6)
    tv.rotation.y += Math.PI / 14
    tv.scale.set(3.4, 3.4, 3.4)
    laptop.position.set(6, -5, -2)
    laptop.rotation.y -= Math.PI / 10
    laptop.rotation.x += Math.PI / 14
    laptop.rotation.z += Math.PI / 46
    laptop.scale.set(2.2, 2.2, 2.2)
    iphone.position.set(11, 6, 7)
    iphone.rotation.y -= Math.PI / 6
    iphone.scale.set(2.2, 2.2, 2.2)

    group.position.set(12, 0, -250)
    group.add(tv, laptop, iphone)

    // gui.add(project0Group.position, 'x').min(-300).max(300).step(1)
    // gui.add(project0Group.position, 'y').min(-300).max(300).step(1)
    // gui.add(project0Group.position, 'z').min(-300).max(300).step(1)

    gui.add(tv.rotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI/12)
    gui.add(laptop.rotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI/12)
    gui.add(iphone.rotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI/12)

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

export const addProject0Text = (cssScene) => {
    const content = document.getElementById('project0')
    const projectText = new CSS3DObject(content);

    // gui.add(project0Text.position, 'x').min(-2500).max(1000).step(1)
    // gui.add(project0Text.position, 'y').min(-2500).max(1000).step(1)
    // gui.add(project0Text.position, 'z').min(-2500).max(1000).step(1)
    // gui.add(skillsText.rotation, 'y').min(0).max(Math.PI*2).step(Math.PI/24)
    projectText.position.set(-350, 30, -2800)
    // skillsCloudText.rotation.y = Math.PI / 6
    // contentCard.position.set(SCENE_SIZE / 12 + 10, CURVE_PATH_HEIGHT + 2, SCENE_SIZE / 6)
    cssScene.add(projectText)
    return projectText
}