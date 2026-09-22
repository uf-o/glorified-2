# GLORIFIED // BEYOND 2126

Vite + React procedural 3D design laboratory based on the supplied Beyond 2126 / Certified design grammar.

## Implemented

- 4 primary asset families: MONOCOQUE, HUMANITÉ 2126, BIOMIMICRY, ARCHITECTURAL.
- 71 taxonomy subcategories matching the supplied taxonomy.
- Procedural WebGL generation instead of a static model gallery.
- Beyond 2126 material language: pearl white, titanium, smoked glass, royal blue / ultraviolet / green energy accents.
- Organic hard-surface generation using Three.js plus a Marching Cubes soft-body core.
- PBR materials, studio lighting, grid, bloom post-processing and orbit controls.
- GLB, GLTF and PLY browser exports.
- B3D bridge export: downloads a Blender Python handoff because a native browser B3D encoder is not provided by Three.js. A Blender B3D exporter/add-on is required for the final B3D file.
- Session media library.
- Embeddable iframe snippet.
- Import of the complete supplied Markdown taxonomy: use IMPORT TAXONOMY and select the provided .md. The importer parses all four headings, all subcategories and every - item line, so the complete source taxonomy can be loaded without an external AI/API credit.
- Free-form asset generation while retaining the same procedural grammar.

## Design grammar

1. Monocoque continuity: no visible screws or unnecessary joints.
2. Organic aerodynamics: S-curves, capsules, toroidal rings and flowing silhouettes.
3. Magnetic / levitating cues: floating rings and luminous fields.
4. Biomimicry: marine, feline and skeletal references abstracted into clean surfaces.
5. Energy core: visible central nucleus.
6. Clinical interface: sparse technical labels and restrained blue/violet/green accents.

## Run

    npm install
    npm run dev

## Build

    npm run build

The app is Vercel-compatible as a standard Vite SPA.
