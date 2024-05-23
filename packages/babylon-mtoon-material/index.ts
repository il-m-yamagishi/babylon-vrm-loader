/**
 * MToonMaterial plugin
 * @license MIT
 * @author Masaru Yamagishi
 */

import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer';
import { WebGPUEngine } from '@babylonjs/core/Engines/webgpuEngine';
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Scene } from '@babylonjs/core/scene';
import { MToonPluginMaterial } from './src/mtoon-plugin-material';

import '@babylonjs/core/Helpers/sceneHelpers';
import '@babylonjs/inspector';

async function createEngine(canvas: HTMLCanvasElement) {
    const debugProperties = getDebugProperties();
    if (debugProperties.webgpu && await WebGPUEngine.IsSupportedAsync) {
        const engine = new WebGPUEngine(canvas);
        await engine.initAsync();
        return engine;
    }
    return new Engine(canvas, true, {
        alpha: false,
        disableWebGL2Support: debugProperties.webgl1,
    });
}

async function main() {
    const debugProperties = getDebugProperties();
    const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
    const engine = await createEngine(canvas);

    const scene = new Scene(engine);
    scene.ambientColor = Color3.Black();
    const camera = new ArcRotateCamera('MainCamera1', Math.PI * 1.5, 1, 3, new Vector3(0, 1.5, 0), scene, true);
    camera.lowerRadiusLimit = 0.1;
    camera.upperRadiusLimit = 20;
    camera.wheelDeltaPercentage = 0.01;
    camera.attachControl(canvas);

    // scene.createDefaultEnvironment({
    //     createGround: true,
    //     createSkybox: false,
    //     enableGroundMirror: false,
    //     enableGroundShadow: false,
    // });

    // Lights
    const directionalLight = new DirectionalLight('DirectionalLight1', new Vector3(1, -0.5, 0.0), scene);
    directionalLight.position = new Vector3(-50, 25, 0);
    directionalLight.intensity = 1.0;
    // directionalLight.diffuse = Color3.Red();
    directionalLight.setEnabled(true);
    const hemisphericLight = new HemisphericLight('HemisphericLight1', new Vector3(-0.2, -0.8, -1), scene);
    hemisphericLight.setEnabled(false);
    const pointLight = new PointLight('PointLight1', new Vector3(0, 0, -1), scene);
    pointLight.setEnabled(false);
    pointLight.intensity = 1.0;
    pointLight.diffuse = Color3.Green();

    // Shadows
    const shadowCaster = MeshBuilder.CreateTorusKnot('ShadowCaster', {}, scene);
    shadowCaster.position = new Vector3(-10.0, 5.0, 0.0);
    shadowCaster.setEnabled(debugProperties.shadow);
    if (debugProperties.shadow) {
        const shadowGenerator = new ShadowGenerator(1024, directionalLight);
        shadowGenerator.addShadowCaster(shadowCaster);
    }

    const diffuseTexture = new Texture("http://i.imgur.com/Wk1cGEq.png", scene);
    diffuseTexture.uScale = 4;
    diffuseTexture.vScale = 4;

    const bumpTexture = new Texture("http://i.imgur.com/wGyk6os.png", scene);
    bumpTexture.uScale = 4;
    bumpTexture.vScale = 4;

    const matcapTexture = new Texture("/matcap.png", scene);

    const shadeShiftTexture = new Texture("/shadeShift.png", scene);

    const standardMaterials: StandardMaterial[] = [];
    {
        const mat = new StandardMaterial("MToonMaterial1", scene);
        const plugin = new MToonPluginMaterial(mat);
        plugin.shadeColorFactor = Color3.Black();
        // plugin.shadingShiftFactor = -0.5;
        // plugin.shadingShiftTexture = shadeShiftTexture;
        // plugin.shadingShiftTextureScale = 0.5;
        // plugin.matcapTexture = matcapTexture;
        standardMaterials.push(mat);
    }
    {
        const mat = new StandardMaterial("MtoonMaterialNormal", scene);
        const plugin = new MToonPluginMaterial(mat);
        mat.diffuseTexture = diffuseTexture;
        mat.bumpTexture = bumpTexture;
        plugin.shadeMultiplyTexture = mat.diffuseTexture;
        plugin.shadeColorFactor = Color3.Black();
        standardMaterials.push(mat);
    }

    standardMaterials.forEach((mat, index) => {
        // Right-coordinates for glTF
        // mat.cullMode = 1;
        const sphere = MeshBuilder.CreateSphere(`${mat.name}_Sphere`, {}, scene);
        sphere.position = new Vector3(-1.2 * index, 1, 0);
        sphere.receiveShadows = true;
        sphere.material = mat;
    });

    {
        // No Normal attribute
        const mat = new StandardMaterial('MToonMaterialNoNormal', scene);
        const plugin = new MToonPluginMaterial(mat);
        plugin.shadeColorFactor = new Color3(0.97, 0.81, 0.86);
        const sphere = MeshBuilder.CreateSphere('MToonMaterialNoNormal_Sphere', {}, scene);
        sphere.position = new Vector3(1.2, 1, 0);
        sphere.receiveShadows = true;
        sphere.material = mat;
        if (sphere.geometry) {
            sphere.geometry.removeVerticesData(VertexBuffer.NormalKind);
        }
    }

    if (debugProperties.inspector) {
        await scene.debugLayer.show({
            globalRoot: document.getElementById('wrapper') as HTMLElement,
            handleResize: true,
        });
    }

    engine.runRenderLoop(() => {
        scene.render();
        shadowCaster.rotate(Vector3.Up(), 0.01);
    });
    window.addEventListener('resize', () => {
        engine.resize();
    });
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (window as any).currentScene = scene;
}

interface DebugProperties {
    webgl1: boolean;
    webgpu: boolean;
    shadow: boolean;
    inspector: boolean;
}

function getDebugProperties(): DebugProperties {
    const href = window.location.href;

    return {
        webgl1: href.includes('webgl1'),
        webgpu: href.includes('webgpu'),
        shadow: href.includes('shadow'),
        inspector: href.includes('inspector'),
    };
}

main();
