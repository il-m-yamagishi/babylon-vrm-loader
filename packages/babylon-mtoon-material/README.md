# babylon-mtoon-material

[![npm version](https://badge.fury.io/js/babylon-mtoon-material.svg)](https://badge.fury.io/js/babylon-mtoon-material) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

![](mtoon.png)

[Unity Santarh/MToon Shader](https://github.com/Santarh/MToon/) WebGL porting to [babylon.js](https://www.babylonjs.com/).

Some settings will be ignored or generates inconsistent lighting.

[About MToon](https://vrm.dev/en/univrm/shaders/shader_mtoon)([ja](https://vrm.dev/univrm/shaders/shader_mtoon))

## Supported version table

|babylon.js version|babylon-mtoon-material version|
|---|---|
|~4.0.0|^1.0.0|
|~4.1.0|^2.0.0|
|~4.2.0|^3.0.0|
|~5.0.0-rc.0|^4.0.0|
|^5.19.0|^5.0.0|
|^6.0.0|^6.0.0|

## Features

- Several [StandardMaterial](https://doc.babylonjs.com/typedoc/classes/BABYLON.StandardMaterial) abilities
    - Lighting
    - Multiview
    - LogarithmicDepth
    - Fog
    - Bones in shader
    - MorphTargets in shader
    - Shadow
    - EffectFallback
    - Instances
    - ClipPlane
    - AmbientColor
    - Alpha CutOff
- Textures & Color values
    - Diffuse
    - Emissive
    - Bump
    - Shade(shaded diffuse rate with red channel)
    - Receive Shadow(received shadow rate with red channel)
    - Shading Grade(shading grade rate with red channel)
    - Rim
    - MatCap
    - Outline Width(outline width rate with red channel)
- UV Animation(Scroll, Rotation)
- Serialize Support

These are not covered.

- Specular
- Vertex Color
- PrePass

## Usage

This material will be automatically assined to VRM/VCI model within [babylon-vrm-loader](https://github.com/il-m-yamagishi/babylon-vrm-loader).

Also you can explicitly assign MToonMaterial to any meshes.

### Browser

TODO

### npm

TODO

### Build

```s
$ npm ci
$ npm run build
```

### Debugging MToonMaterial

TODO

### Test

TODO

## Related Links

- [BabylonJS/Babylon.js: Babylon.js: a complete JavaScript framework for building 3D games with HTML 5 and WebGL](https://github.com/BabylonJS/Babylon.js)
- [Santarh/MToon: Toon Shader with Unity Global Illumination](https://github.com/Santarh/MToon/)
- [vrm-c/UniVRM: Unity package that can import and export VRM format](https://github.com/vrm-c/UniVRM)
- [Create a Material For The Material Library | Babylon.js Documentation](https://doc.babylonjs.com/divingDeeper/developWithBjs/matForMatLibrary)
- [Introduction To Materials | Babylon.js Documentation](https://doc.babylonjs.com/divingDeeper/materials/using/materials_introduction)
