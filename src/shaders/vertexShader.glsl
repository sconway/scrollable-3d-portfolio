attribute vec3 aRandom;

varying vec3 vPosition;
varying vec3 vRandom;

uniform float uTime;
uniform float uScale;
uniform float uCameraZ;

void main() {
    vPosition = position;
    vRandom = aRandom;

    float time = uTime * 4.0;
    float scrollEffect = uCameraZ * 0.22;

    vec3 pos = position;
    pos.x += sin(time * aRandom.x) * 0.025;
    pos.y += cos(time * aRandom.y) * 0.025;
    pos.z += scrollEffect * (abs(aRandom.z) / 8.0);

    // Drift upward as the figure explodes so particles stay above the floor plane
    pos.y += scrollEffect * (0.16 + max(aRandom.y, 0.0) * 0.12);

    pos.x *= uScale + (sin(pos.y * 4.0 + time) * (1.0 - uScale)) + (abs(aRandom.x) * scrollEffect * 0.9);
    pos.y *= uScale + (cos(pos.z * 4.0 + time) * (1.0 - uScale)) + (max(aRandom.y, 0.0) * scrollEffect * 0.22);
    pos.z *= uScale + (sin(pos.x * 4.0 + time) * (1.0 - uScale)) + (scrollEffect * 0.26);

    pos *= uScale;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // Vary particle sizes so the figure reads as layered points of light
    gl_PointSize = (22.0 + abs(aRandom.y) * 26.0) / -mvPosition.z;
}
