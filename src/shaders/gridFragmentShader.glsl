varying vec3 vWorldPosition;

uniform vec3 uBaseColor;
uniform vec3 uLineColor;
uniform vec3 uAccentColor;

// Anti-aliased grid line intensity for a given cell size
float gridLine(vec2 p, float scale) {
    vec2 coord = p / scale;
    vec2 derivative = fwidth(coord);
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / derivative;
    float line = min(grid.x, grid.y);
    return 1.0 - min(line, 1.0);
}

void main() {
    vec2 p = vWorldPosition.xz;

    float minorLine = gridLine(p, 6.0);
    float majorLine = gridLine(p, 30.0);

    // Fade the grid out with distance from the camera so it melts into the fog
    float dist = distance(vWorldPosition.xz, cameraPosition.xz);
    float fade = exp(-dist * 0.012);

    vec3 color = uBaseColor;
    color += uLineColor * minorLine * 0.10 * fade;
    color += mix(uLineColor, uAccentColor, 0.35) * majorLine * 0.38 * fade;

    gl_FragColor = vec4(color, 1.0);
}
