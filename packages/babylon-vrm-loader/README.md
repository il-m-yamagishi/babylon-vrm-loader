# babylon-vrm-loader

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

![alicia.png](alicia.png)

Port of [VRM](https://github.com/vrm-c/vrm-specification/) to [Babylon.js](https://www.babylonjs.com/) WebGL/WebGPU.

## Features

- Supports `.vrm` v0.x file loading
- [ ] Supports `.vrm` v1.0 file loading
- Supports `.vci` file loading
- Supports [MToonMaterial](../babylon-mtoon-material)
- Get bone([TransformNode](https://doc.babylonjs.com/typedoc/classes/BABYLON.TransformNode)) from Unity Humanoid bone mapping name
- [BlendShape](https://vrm.dev/univrm/blendshape/univrm_blendshape/) morphing
- [SpringBone](https://vrm.dev/univrm/springbone/univrm_secondary/)
- Partial supports [VCI](https://github.com/virtual-cast/VCI) features
    - [x] `VCAST_vci_material_unity`
    - [ ] `VCAST_vci_meta`
    - [ ] `VCAST_vci_embedded_script`
    - [ ] `VCAST_vci_audios`
    - [ ] `VCAST_vci_colliders`
    - [ ] `VCAST_vci_rigidbody`
    - [ ] `VCAST_vci_joints`
    - [ ] `VCAST_vci_item`

## Usage

### on browser

example is [here](https://codepen.io/anon/pen/zQXyxL?editors=1010).

### on Babylon.js Playgound

example is [here](https://playground.babylonjs.com/#K5W35Y).

### with npm/yarn

```s
$ npm install --save @babylonjs/core @babylonjs/loaders babylon-vrm-loader
# or
$ yarn add @babylonjs/core @babylonjs/loaders babylon-vrm-loader
```

```ts
import * as BABYLON from '@babylonjs/core'

// has side-effect
// ref. https://webpack.js.org/guides/tree-shaking#mark-the-file-as-side-effect-free
import 'babylon-vrm-loader'

// vrmFile is File object retrieved by <input type="file">.
const scene = await BABYLON.SceneLoader.LoadAsync('file:', vrmFile, engine);
const vrmManager = scene.metadata.vrmManagers[0];

// Update secondary animation
scene.onBeforeRenderObservable.add(() => {
    vrmManager.update(scene.getEngine().getDeltaTime());
});

// Model Transformation
vrmManager.rootMesh.translate(new BABYLON.Vector3(1, 0, 0), 1);

// Work with HumanoidBone
vrmManager.humanoidBone.leftUpperArm.addRotation(0, 1, 0);

// Work with BlendShape(MorphTarget)
vrmManager.morphing('Joy', 1.0);
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Build

```s
$ yarn build
```

### Debugging MToonMaterial

```s
$ yarn debug
```

You can see inspector on http://localhost:8080/

## Related Links

- [BabylonJS/Babylon.js: Babylon.js: a complete JavaScript framework for building 3D games with HTML 5 and WebGL](https://github.com/BabylonJS/Babylon.js)
- [vrm-c/UniVRM: Unity package that can import and export VRM format](https://github.com/vrm-c/UniVRM)

## Licenses

see [LICENSE](./LICENSE).

This project uses [babylon.js with Apache License, Version 2.0](https://github.com/BabylonJS/Babylon.js/blob/master/license.md).
