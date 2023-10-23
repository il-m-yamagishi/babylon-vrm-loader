# babylon-vrm-loader

[![npm version](https://badge.fury.io/js/babylon-vrm-loader.svg)](https://badge.fury.io/js/babylon-vrm-loader) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](code_of_conduct.md)

![alicia.png](packages/babylon-vrm-loader/alicia.png)

VRM porting to babylon.js.

## Supported version table

|babylon.js version|babylon-vrm-loader version|
|---|---|
|~4.1.0|<1.5.0|
|~4.2.0|^1.5.0|
|^5.19.0|^2.0.0|
|^6.0.0|will be ^3.0.0|

## Features

- Supports `.vrm` v0.x file loading
    - with `extensions.VRM` glTF Extension
- TODO `.vrm` v1.0 file loading
- Supports `.vci` file loading
- Supports [MToonMaterial](https://github.com/virtual-cast/babylon-mtoon-material)
- Get bone([TransformNode](https://doc.babylonjs.com/typedoc/classes/BABYLON.TransformNode)) from Unity Humanoid bone mapping name
- [BlendShape](https://vrm.dev/en/univrm/blendshape/index.html) morphing
- [SpringBone](https://vrm.dev/en/univrm/springbone/index.html)
- Supports [VCI](https://github.com/virtual-cast/VCI) features(partial support)
    - `VCAST_vci_material_unity`
    - TODO: `VCAST_vci_meta`
    - TODO: `VCAST_vci_embedded_script`
    - TODO: `VCAST_vci_audios`
    - TODO: `VCAST_vci_colliders`
    - TODO: `VCAST_vci_rigidbody`
    - TODO: `VCAST_vci_joints`
    - TODO: `VCAST_vci_item`

## Usage

### on browser

TODO

### on Babylon.js Playgound

TODO

### with npm/yarn

TODO

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Build

```s
$ npm run build
```

### Debugging MToonMaterial

TODO

## Related Links

- [BabylonJS/Babylon.js: Babylon.js: a complete JavaScript framework for building 3D games with HTML 5 and WebGL](https://github.com/BabylonJS/Babylon.js)
- [vrm-c/UniVRM: Unity package that can import and export VRM format](https://github.com/vrm-c/UniVRM)

## Licenses

see [LICENSE](./LICENSE).

This project uses [babylon.js with Apache License, Version 2.0](https://github.com/BabylonJS/Babylon.js/blob/master/license.md).
