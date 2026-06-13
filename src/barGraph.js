import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { COLOR4, COLOR5 } from "./constants/"

const BOX_WIDTH = 0.75;
const BOX_DEPTH = 0.75;
const BOX_HEIGHT = 8;
const COLORS = [COLOR4, COLOR5, '#ffffff']

const segments = [
    { name: "Javascript", value: 0.95, x: 4 },
    { name: "CSS", value: 0.95, x: 5.5 },
    { name: "HTML", value: 0.9, x: 7 },
    { name: "React", value: 0.8, x: 8.5 },
    { name: "React Native", value: 0.75, x: 10 },
    { name: "Typescript", value: 0.7, x: 11.5 },
    { name: "GraphQL", value: 0.65, x: 13 },
    { name: "NodeJS", value: 0.65, x: 14.5 }
]

const createTextMesh = (font, value) => {
    const textGeometry = new TextGeometry(
        value.name,
        {
            font: font,
            size: 0.5,
            height: 0.05,
            curveSegments: 6,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.005,
            bevelOffset: 0,
            bevelSegments: 2,
        }
    )
    const textMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xffffff),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
    })

    return new THREE.Mesh(textGeometry, textMaterial)
}

/**
 * Each bar is a group of two children, in order:
 *   [0] translucent glass body
 *   [1] neon edge wireframe (HDR color so it blooms)
 * The animation code in script.js relies on this ordering.
 */
export const createBarGraph = (font) => {
    const bars = new THREE.Group()

    for (let i = 0; i < segments.length; i++) {
        const { x } = segments[i]
        const height = BOX_HEIGHT * segments[i].value
        const boxGeometry = new THREE.BoxGeometry(BOX_WIDTH, height, BOX_DEPTH)
        const color = new THREE.Color(COLORS[i % COLORS.length])

        // Translucent tinted glass body
        const bodyMaterial = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })
        const body = new THREE.Mesh(boxGeometry, bodyMaterial)

        // Neon edges pushed past 1.0 so the bloom pass lights them up
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: color.clone().multiplyScalar(2.2),
            transparent: true,
            opacity: 0,
        })
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(boxGeometry),
            edgeMaterial
        )

        const barGroup = new THREE.Group()
        barGroup.add(body, edges)
        barGroup.position.set(x, BOX_HEIGHT - height / 2, 0)
        barGroup.rotation.y = Math.PI / (Math.random() * 6 + 1)

        // Create the text for each bar
        const barText = createTextMesh(font, segments[i])
        barText.position.set(x + 0.2, BOX_HEIGHT - height - 0.5, 0)
        barText.rotation.set(Math.PI, 0, Math.PI / 2)

        bars.add(barGroup, barText)
    }

    return bars;
}
