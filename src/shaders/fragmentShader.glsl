varying vec3 vPosition;
varying vec3 vRandom;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uTime;

void main() {
    // Soft round points instead of hard squares
    float dist = length(gl_PointCoord - vec2(0.5));
    float falloff = smoothstep(0.5, 0.05, dist);

    if (falloff < 0.01) discard;

    // Gradient by height, with a secondary accent woven in per-particle
    float depth = vPosition.z * 0.5 + 0.8;
    vec3 color = mix(uColor1, uColor2, depth);
    color = mix(color, uColor3, abs(vRandom.x) * 0.35);

    // A slow shimmer so individual particles twinkle into bloom range
    float twinkle = 0.65 + 0.55 * sin(uTime * 2.0 + vRandom.y * 40.0);

    // Push the brightest particles over 1.0 so selective bloom catches them
    color *= 1.1 + twinkle * 0.8;

    float alpha = falloff * (depth * 0.2 + 0.6);
    gl_FragColor = vec4(color, alpha);
}
