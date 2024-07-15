import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const BOX_WIDTH = 0.75;
const BOX_DEPTH = 0.75;
const BOX_HEIGHT = 8;
const COLOR1 = '#240668'
const COLOR2 = '#3A0CA3'
const COLOR3 = '#7209B7'
const COLOR4 = '#F72585'
const COLORS = [COLOR1, COLOR2, COLOR3, COLOR4]

const segments = [
    {
        name: "HTML",
        value: 1,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 4,
        y: 0,
        z: 0
    },
    {
        name: "CSS",
        value: 0.9,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 5.5,
        y: 0,
        z: 0
    },
    {
        name: "Javascript",
        value: 0.8,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 7,
        y: 0,
        z: 0
    },
    {
        name: "React",
        value: 0.7,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 8.5,
        y: 0,
        z: 0
    },
    {
        name: "React Native",
        value: 0.65,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 10,
        y: 0,
        z: 0
    },
    {
        name: "Typescript",
        value: 0.6,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 11.5,
        y: 0,
        z: 0
    },
    {
        name: "GraphQL",
        value: 0.6,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 13,
        y: 0,
        z: 0
    },
    {
        name: "NodeJS",
        value: 0.6,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 14.5,
        y: 0,
        z: 0
    }
]

const createTextMesh = (font, value) => {
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
    const textMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color(0xffffff),
        opacity: 0,
        side: THREE.DoubleSide,
        transparent: true
    })
    const textMesh = new THREE.Mesh(textGeometry, textMaterial)

    return textMesh
}

export const createBarGraph = (font) => {
    const bars = new THREE.Group()

    for (let i = 0; i < segments.length; i++) {
        // Create the dimensions, geometry, and mesh for our bars
        const { x, z } = segments[i]
        const height = BOX_HEIGHT * segments[i].value
        const geometry = new THREE.BoxGeometry(BOX_WIDTH, height, BOX_DEPTH)
        const material = new THREE.MeshPhongMaterial({
            color: COLORS[i % COLORS.length],
            opacity: 0,
            transparent: true
        })
        const bar = new THREE.Mesh(geometry, material)
        
        bar.position.set(x, BOX_HEIGHT - height / 2, z)
        bar.rotation.y = Math.PI / 6

        // Create the text for each bar
        const barText = createTextMesh(font, segments[i])
        barText.position.set(x + 0.2, BOX_HEIGHT - height - 0.5, z)
        barText.rotation.set(Math.PI, 0, Math.PI / 2)
        bars.add(bar, barText)
    }

    return bars
}