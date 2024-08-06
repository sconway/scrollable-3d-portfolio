import * as THREE from 'three'

export const addTextureToMesh = (mesh, imagePath) => {
    const textLoader = new THREE.TextureLoader();
    const imageTexture = textLoader.load(imagePath, texture => {
        texture.flipY = false;
        texture.wrapS = THREE.RepeatWrapping;
        // texture.repeat.y = texture.image.width / texture.image.height / screenSize[0] * screenSize[1];
    })
    const newMaterial = new THREE.MeshBasicMaterial({
        color: 0xfffffff,
        alphaMap: imageTexture,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    mesh.material = newMaterial
}