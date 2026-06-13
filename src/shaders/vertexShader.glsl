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
    float scrollEffect = uCameraZ * 0.25;

    vec3 pos = position;
    pos.x += sin(time * aRandom.x) * 0.025;
    pos.y += cos(time * aRandom.y) * 0.025;
    pos.z += scrollEffect * (abs(aRandom.z) / 8.0);

    pos.x *= uScale + (sin(pos.y * 4.0 + time) * (1.0 - uScale)) + (abs(aRandom.x) * scrollEffect);
    pos.y *= uScale + (cos(pos.z * 4.0 + time) * (1.0 - uScale)) + (abs(aRandom.y) * scrollEffect / 4.0);
    pos.z *= uScale + (sin(pos.x * 4.0 + time) * (1.0 - uScale)) + (scrollEffect / 3.0);

    pos *= uScale;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // Vary particle sizes so the figure reads as layered points of light
    gl_PointSize = (22.0 + abs(aRandom.y) * 26.0) / -mvPosition.z;
}
