# 3D Portfolio

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run this followed commands:

``` bash
# Install dependencies
npm install

# Run the local server
npm run dev

# Build for production in the dist/ directory
npm run build

# Publish dist/ to the gh-pages branch (serves at /scrollable-3d-portfolio/)
npm run deploy
```

GitHub Pages must use the **gh-pages** branch with the **`/ (root)`** folder as the source. The deploy script copies the built `dist/` output to that branch root so the site is available at [https://sconway.github.io/scrollable-3d-portfolio/](https://sconway.github.io/scrollable-3d-portfolio/) instead of `/dist/`.
