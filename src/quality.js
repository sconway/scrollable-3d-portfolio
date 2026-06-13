/**
 * Adaptive quality profile.
 *
 * The redesign is fragment- and draw-call-heavy (bloom post-processing, a 25k
 * particle hero, per-mesh neon edge lines). Rather than degrade everyone, we
 * detect device capability once up front and pick a tier, then let the render
 * loop downgrade the cheap-to-change knobs (resolution + bloom) if a machine
 * that *looked* capable turns out to be struggling.
 *
 * Other modules read the mutable `QUALITY` object:
 *   - script.js  -> pixelRatio, bloom, bloomIntensity
 *   - model.js   -> particleCount, edgeGlow
 */

const TIERS = {
    high:   { pixelRatio: 2,   bloom: true,  bloomIntensity: 1.2, particleCount: 25000, edgeGlow: true },
    medium: { pixelRatio: 1.5, bloom: true,  bloomIntensity: 1.0, particleCount: 15000, edgeGlow: true },
    low:    { pixelRatio: 1,   bloom: false, bloomIntensity: 0,   particleCount: 9000,  edgeGlow: false },
}

const matches = (query) => window.matchMedia && window.matchMedia(query).matches

const detectTier = () => {
    // Allow forcing a tier for testing or user preference, e.g. ?quality=low
    const forced = new URLSearchParams(window.location.search).get('quality')
    if (forced && TIERS[forced]) return forced

    // Honour an explicit reduced-motion preference as a hard opt-out
    if (matches('(prefers-reduced-motion: reduce)')) return 'low'

    const cores = navigator.hardwareConcurrency || 8
    // deviceMemory is Chrome-only and reported in GB; assume capable elsewhere
    const memory = navigator.deviceMemory || 8
    const coarsePointer = matches('(pointer: coarse)')

    if (memory <= 2 || cores <= 2) return 'low'
    if (memory <= 4 || cores <= 4 || coarsePointer) return 'medium'
    return 'high'
}

const initialTier = detectTier()
const deviceRatio = window.devicePixelRatio || 1

// Mutable profile the rest of the app reads from. pixelRatio is clamped to the
// real device DPR so we never render more pixels than the screen actually has.
export const QUALITY = {
    tier: initialTier,
    pixelRatio: Math.min(deviceRatio, TIERS[initialTier].pixelRatio),
    bloom: TIERS[initialTier].bloom,
    bloomIntensity: TIERS[initialTier].bloomIntensity,
    particleCount: TIERS[initialTier].particleCount,
    edgeGlow: TIERS[initialTier].edgeGlow,
}

/**
 * One-directional live downgrade to the cheapest live-changeable settings
 * (render resolution + bloom). Geometry-bound knobs (particle count, existing
 * edge lines) are left as-is since they can't be rebuilt cheaply mid-scene.
 * Returns true if anything actually changed.
 */
export const downgradeQuality = () => {
    if (!QUALITY.bloom && QUALITY.pixelRatio <= TIERS.low.pixelRatio) return false

    QUALITY.tier = 'low'
    QUALITY.pixelRatio = Math.min(deviceRatio, TIERS.low.pixelRatio)
    QUALITY.bloom = false
    return true
}
