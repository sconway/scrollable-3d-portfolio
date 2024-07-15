attribute vec3 aRandom;

varying vec3 vPosition;

uniform float uTime;
uniform float uScale;
uniform float uCameraZ;

void main() {
    vPosition = position;

    float time = uTime * 4.0;

    vec3 pos = position;
    pos.x += sin(time * aRandom.x) * 0.025;
    pos.y += cos(time * aRandom.y) * 0.025;
    pos.z += uCameraZ * (abs(aRandom.z) / 8.0);

    pos.x *= uScale + (sin(pos.y * 4.0 + time) * (1.0 - uScale)) + (abs(aRandom.x) * uCameraZ / 4.0);
    pos.y *= uScale + (cos(pos.z * 4.0 + time) * (1.0 - uScale)) + (abs(aRandom.y) * uCameraZ / 4.0);
    pos.z *= uScale + (sin(pos.x * 4.0 + time) * (1.0 - uScale)) + (uCameraZ / 3.0);

    pos *= uScale;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // 8.0 particle size. Update to change particle size
    gl_PointSize = 25.0 / -mvPosition.z;
}