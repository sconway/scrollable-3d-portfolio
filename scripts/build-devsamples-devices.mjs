/**
 * Builds device GLBs and embeds project screen PNGs.
 *
 * 1. Place screenshots in static/textures/project/
 * 2. Run: npm run build:devices
 * 3. HQ GLBs are written to static/models/ with your PNGs baked in
 *
 * To extract starter PNGs from the source GLBs (optional):
 *   npm run build:devices -- --export-screens
 */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { NodeIO } from '@gltf-transform/core'
import { dedup, weld } from '@gltf-transform/functions'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const modelsDir = path.join(root, 'static/models')
const texturesDir = path.join(root, 'static/textures/project')

const io = new NodeIO()
const exportScreens = process.argv.includes('--export-screens')

const BUILDS = [
    { input: 'devsamples-macbook.glb', output: 'devsamples-macbook-hq.glb' },
    { input: 'devsamples-iphone.glb', output: 'devsamples-iphone-hq.glb', upscale: 2 },
    {
        input: 'tweets-screen.glb',
        output: 'tweets-screen-hq.glb',
        screenTexture: 'global-tweets-tv.png',
    },
    {
        input: 'tweets-macbook.glb',
        output: 'tweets-macbook-hq.glb',
        screenTexture: 'global-tweets-laptop.png',
    },
    {
        input: 'decorai-screen.glb',
        output: 'decorai-screen-hq.glb',
        screenTexture: 'decorait-tv.png',
    },
    {
        input: 'decorai-macbook.glb',
        output: 'decorai-macbook-hq.glb',
        screenTexture: 'decorait-laptop.png',
    },
    {
        input: 'decorai-iphone.glb',
        output: 'decorai-iphone-hq.glb',
        screenTexture: 'decorait-iphone.png',
    },
    {
        input: 'tweets-screen.glb',
        output: 'made-with-ai-tv-1-hq.glb',
        screenTexture: 'made-with-ai-tv-1.png',
    },
    {
        input: 'tweets-screen.glb',
        output: 'made-with-ai-tv-2-hq.glb',
        screenTexture: 'made-with-ai-tv-2.png',
    },
    {
        input: 'tweets-macbook.glb',
        output: 'made-with-ai-laptop-hq.glb',
        screenTexture: 'made-with-ai-laptop.png',
    },
]

const SCREEN_EXPORTS = [
    { input: 'tweets-screen.glb', output: 'global-tweets-tv.png' },
    { input: 'tweets-macbook.glb', output: 'global-tweets-laptop.png' },
]

async function upsizeTextures(document, scale = 2) {
    for (const texture of document.getRoot().listTextures()) {
        const image = texture.getImage()
        if (!image) continue

        const meta = await sharp(Buffer.from(image)).metadata()
        const upscaled = await sharp(Buffer.from(image))
            .resize(Math.round(meta.width * scale), Math.round(meta.height * scale), {
                kernel: sharp.kernel.lanczos3,
            })
            .png({ compressionLevel: 6 })
            .toBuffer()

        texture.setImage(upscaled).setMimeType('image/png')
    }
}

async function embedScreenTexture(document, pngPath) {
    const image = await fs.readFile(pngPath)
    const root = document.getRoot()

    let texture = root.listTextures()[0]
    if (!texture) {
        throw new Error('No textures found in model')
    }
    texture.setImage(image).setMimeType('image/png')

    // Only replace materials that already carry the screen texture (or "Blank" on TVs).
    for (const material of root.listMaterials()) {
        const name = material.getName()?.toLowerCase() || ''
        if (material.getBaseColorTexture() || name.includes('blank')) {
            material.setBaseColorTexture(texture)
        }
    }
}

async function buildDevice({ input, output, upscale, screenTexture }) {
    const inputPath = path.join(modelsDir, input)
    const outputPath = path.join(modelsDir, output)
    const document = await io.read(inputPath)

    if (upscale) {
        await upsizeTextures(document, upscale)
    }

    await document.transform(dedup(), weld())

    if (screenTexture) {
        const pngPath = path.join(texturesDir, screenTexture)
        try {
            await embedScreenTexture(document, pngPath)
            console.log(`Embedded ${path.relative(root, pngPath)} → ${output}`)
        } catch (err) {
            console.warn(`Skipped ${screenTexture}: ${err.message}`)
        }
    }

    await io.write(outputPath, document)
    console.log(`Wrote ${path.relative(root, outputPath)}`)
}

async function exportScreenTexture({ input, output }) {
    const document = await io.read(path.join(modelsDir, input))
    const texture = document.getRoot().listTextures()[0]
    if (!texture) return

    await fs.mkdir(texturesDir, { recursive: true })
    const outputPath = path.join(texturesDir, output)
    await fs.writeFile(outputPath, Buffer.from(texture.getImage()))
    console.log(`Exported ${path.relative(root, outputPath)}`)
}

for (const build of BUILDS) {
    await buildDevice(build)
}

if (exportScreens) {
    for (const screen of SCREEN_EXPORTS) {
        await exportScreenTexture(screen)
    }
}
