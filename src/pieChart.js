import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

let piePieces = []
let piece = 0

export const pieGraph = (values, thickness, font) => {
    const pieGroup = new THREE.Group()
    let sum = 0;
    let cur = 0;

    for (let i = 0; i < values.length; i++) {
      sum += values[i].value;
    }

    for (let i = 0; i < values.length; i++) {
      let end = (2 * Math.PI * values[i].value) / sum;
      piePieces[piece] = [];
    
      const segment = createPieSlice(cur, cur + end, thickness, values[i], font)
      const segmentText = createPieSliceText(font, values[i], cur, cur + end)
      
      pieGroup.add(segment)
      pieGroup.add(segmentText)

      cur += end;
      piece++;
    }

    return pieGroup
}

const createPieSlice = (start, end, thickness, value) => {
    const material = new THREE.MeshLambertMaterial({
        ambient: 0x808080,
        color: end * 0xffaa55 * Math.random(),
    });
    const geometry = new THREE.Shape();
    geometry.moveTo(0, 0);
    geometry.arc(0, 0, 4, start, end);
    geometry.lineTo(0, 0);

    piePieces[piece].geo = new THREE.ExtrudeGeometry( geometry, {
        amount: thickness,
        bevelEnabled: false,
        curveSegments: 50,
        depth: 6 * value.value,
        steps: 2,
    });
    piePieces[piece].geo.dynamic = true;
    piePieces[piece].baseColor = material.color.getHex();
    piePieces[piece].value = value.value;

    const segment = new THREE.Mesh(piePieces[piece].geo, material);
    segment.name = piePieces[piece].name = piece;
    segment.rotation.x = Math.PI / 2;

    piePieces[piece].geo.verticesNeedUpdate = true;
    piePieces[piece].geo.normalsNeedUpdate = true;
    piePieces[piece].geo.computeBoundingSphere();

    return segment;
}

const createPieSliceText = (font, value, start, end) => {
    const textGeometry = new TextGeometry(
        value.name,
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
    const textMaterial = new THREE.MeshLambertMaterial({
        color: new THREE.Color(0xffffff),
        side: THREE.DoubleSide
    })
    const textMesh = new THREE.Mesh(textGeometry, textMaterial)

    textMesh.position.set(start, value.value * -6, start)
    textMesh.rotation.x = Math.PI

    return textMesh
}
