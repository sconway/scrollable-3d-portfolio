export const SECTION_SIZE = 10
export const SCENE_SIZE = 200
export const PLANE_SIZE = 10000
export const CURVE_PATH_HEIGHT = 2
export const CSS_SCENE_SCALE = 0.1
export const END_POINT = -SCENE_SIZE * 5 - 100
// The camera path stops here, far enough from the contact section that the whole
// section stays framed in view and the user cannot scroll past it.
export const CONTACT_PATH_END = -1225

// Scroll speed
export const INITIAL_SCROLL_DISTANCE_DEFAULT = 1800
export const INITIAL_SCROLL_DISTANCE_FAST = 3000
export const PROJECTS_SCROLL_DISTANCE_DEFAULT = 800
export const PROJECTS_SCROLL_DISTANCE_FAST = 1600

// Section scroll thresholds (scaled for the path extended to CONTACT_PATH_END)
export const ABOUT_THRESHOLD = 0.032
// Hero explosion runs over a longer path segment than the about cutoff so fast
// scrollers still see the burst (progress is path-based, not wheel delta magnitude).
export const INTRO_EXPLOSION_PATH_END = 0.048
export const INTRO_EXPLOSION_MAX = 130
export const SKILLS_GRAPH_TEXT_THRESHOLD = 0.053
export const SKILLS_CLOUD_TEXT_THRESHOLD = 0.091
export const PROJECTS_TEXT_THRESHOLD = 0.143
export const PROJECT_0_THRESHOLD = 0.200
export const PROJECT_1_THRESHOLD = 0.308
export const PROJECT_2_THRESHOLD = 0.399
export const PROJECT_3_THRESHOLD = 0.490
export const PROJECT_4_THRESHOLD = 0.580
export const PROJECT_5_THRESHOLD = 0.671
export const PROJECT_6_THRESHOLD = 0.762
export const PROJECT_7_THRESHOLD = 0.853
export const CONTACT_SECTION_THRESHOLD = 0.95

// CSS scene z (world z ≈ value * CSS_SCENE_SCALE).
export const PROJECT_7_CSS_Z = -11400
export const CONTACT_CSS_Z = -13400
// CSS scene y for the contact section, centered at camera eye height (CURVE_PATH_HEIGHT).
export const CONTACT_CSS_Y = 20
