import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { COLOR1, COLOR2, COLOR3, COLOR4 } from "./constants/"

const BOX_WIDTH = 0.75;
const BOX_DEPTH = 0.75;
const BOX_HEIGHT = 8;
const COLORS = [COLOR3, COLOR2, COLOR4]

const segments = [
    {
        name: "Javascript",
        value: 0.95,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 4,
        y: 0,
        z: 0
    },
    {
        name: "CSS",
        value: 0.95,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 5.5,
        y: 0,
        z: 0
    },
    {
        name: "HTML",
        value: 0.9,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 7,
        y: 0,
        z: 0
    },
    {
        name: "React",
        value: 0.8,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 8.5,
        y: 0,
        z: 0
    },
    {
        name: "React Native",
        value: 0.75,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 10,
        y: 0,
        z: 0
    },
    {
        name: "Typescript",
        value: 0.7,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 11.5,
        y: 0,
        z: 0
    },
    {
        name: "GraphQL",
        value: 0.65,
        textX: 8,
        textY: 0.5,
        textZ: 0,
        x: 13,
        y: 0,
        z: 0
    },
    {
        name: "NodeJS",
        value: 0.65,
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
    const textMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xffffff),
        wireframe: true,
        side: THREE.DoubleSide,
    })
    
    const textMesh = new THREE.Mesh(textGeometry, textMaterial)
    textMesh.visible = false
    return textMesh
}

export const createBarGraph = (font) => {
    const bars = new THREE.Group()

    for (let i = 0; i < segments.length; i++) {
        const { x, z } = segments[i]
        const height = BOX_HEIGHT * segments[i].value
        const boxGeometry = new THREE.BoxGeometry(BOX_WIDTH, height, BOX_DEPTH)
        
        // Create the main wireframe
        const mainMaterial = new THREE.LineBasicMaterial({
            color: COLORS[i % COLORS.length],
            linewidth: 2,
            transparent: true,
            opacity: 0
        });
        const mainWireframe = new THREE.LineSegments(
            new THREE.EdgesGeometry(boxGeometry),
            mainMaterial
        );

        // Create a group for this bar and its glow effects
        const barGroup = new THREE.Group();
        
        // Add multiple layers of glow boxes with increasing size and decreasing opacity
        const numLayers = 6;
        const maxScale = 1.15; // Maximum scale for the outermost layer
        const baseOpacity = 0.15; // Starting opacity for the innermost layer
        
        for (let layer = 0; layer < numLayers; layer++) {
            const scale = 1 + (layer * (maxScale - 1) / (numLayers - 1));
            const opacity = baseOpacity * (1 - layer / numLayers);
            
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: COLORS[i % COLORS.length],
                transparent: true,
                opacity: 0, // Start with 0 opacity
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            
            const glowMesh = new THREE.Mesh(boxGeometry, glowMaterial);
            glowMesh.scale.set(scale, scale, scale);
            barGroup.add(glowMesh);
        }
        
        // Add the main wireframe last so it's on top
        barGroup.add(mainWireframe);
        
        barGroup.visible = true; // Keep visible but start with 0 opacity
        barGroup.position.set(x, BOX_HEIGHT - height / 2, z);
        barGroup.rotation.y = Math.PI / (Math.random() * 6 + 1);

        // Create the text for each bar
        const barText = createTextMesh(font, segments[i]);
        barText.position.set(x + 0.2, BOX_HEIGHT - height - 0.5, z);
        barText.rotation.set(Math.PI, 0, Math.PI / 2);
        barText.material.transparent = true;
        barText.material.opacity = 0;
        barText.visible = true; // Keep visible but start with 0 opacity
        
        bars.add(barGroup, barText);

        // Clean up geometries
        boxGeometry.dispose();
    }

    return bars;
}