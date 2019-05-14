import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { MToonMaterial } from '../mtoon-material';
import { addInspectableCustomProperties } from './inspectable-custom-properties';

import '@babylonjs/core/Helpers/sceneHelpers';
import '@babylonjs/core/Meshes/Builders/sphereBuilder';
import '@babylonjs/core/Meshes/Builders/torusKnotBuilder';
import '@babylonjs/inspector';

async function main() {
    const debugProperties = getDebugProperties();
    const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
    const engine = new Engine(
        canvas,
        true,
        {
            alpha: false,
            disableWebGL2Support: debugProperties.webgl1,
        },
    );

    const scene = new Scene(engine);
    const camera = new ArcRotateCamera('MainCamera1', 0, 0, 3, new Vector3(0, 1.2, 0), scene, true);
    camera.lowerRadiusLimit = 0.1;
    camera.upperRadiusLimit = 20;
    camera.wheelDeltaPercentage = 0.01;
    camera.attachControl(canvas);

    scene.createDefaultEnvironment({
        createGround: true,
        createSkybox: false,
        enableGroundMirror: false,
        enableGroundShadow: false,
    });

    // Lights
    const directionalLight = new DirectionalLight('DirectionalLight1', new Vector3(1, -0.5, 0.0), scene);
    directionalLight.position = new Vector3(-50, 25, 0);
    directionalLight.setEnabled(true);
    const hemisphericLight = new HemisphericLight('HemisphericLight1', new Vector3(-0.2, -0.8, -1), scene);
    hemisphericLight.setEnabled(false);
    const pointLight = new PointLight('PointLight1', new Vector3(0, 0, 1), scene);
    pointLight.setEnabled(false);

    // Meshes
    const standardMaterialSphere = Mesh.CreateSphere('StandardMaterialSphere1', 16, 1, scene);
    standardMaterialSphere.position = new Vector3(1.2, 1.2, 0);
    standardMaterialSphere.receiveShadows = true;

    const shadowCaster = Mesh.CreateTorusKnot('ShadowCaster', 1, 0.2, 32, 32, 2, 3, scene);
    shadowCaster.position = new Vector3(-10.0, 5.0, 0.0);
    shadowCaster.setEnabled(debugProperties.shadow);
    if (debugProperties.shadow) {
        const shadowGenerator = new ShadowGenerator(1024, directionalLight);
        shadowGenerator.addShadowCaster(shadowCaster);
    }

    const mtoonMaterials: MToonMaterial[] = [];
    {
        const mat = new MToonMaterial('MtoonMaterialDefault', scene);
        mat.outlineWidthMode = 1;
        mtoonMaterials.push(mat);
    }
    {
        const mat = new MToonMaterial('MtoonMaterialNormal', scene);
        mat.outlineWidthMode = 1;
        // Textures from https://www.babylonjs-playground.com/#20OAV9#33
        const diffuse = new Texture('http://i.imgur.com/Wk1cGEq.png', scene);
        diffuse.uScale = 4;
        diffuse.vScale = 4;
        mat.diffuseTexture = diffuse;
        mat.shadeTexture = mat.diffuseTexture.clone();
        mat.shadeColor = new Color3(0.871, 0.196, 0.416);
        const bump = new Texture('http://i.imgur.com/wGyk6os.png', scene);
        bump.uScale = 4;
        bump.vScale = 4;
        mat.bumpTexture = bump;
        mtoonMaterials.push(mat);
    }
    {
        const mat = new MToonMaterial('MtoonMaterialTransparent', scene);
        mat.outlineWidthMode = 1;
        // Textures from https://www.babylonjs-playground.com/#YDO1F#18
        mat.diffuseTexture = new Texture('https://upload.wikimedia.org/wikipedia/commons/8/87/Alaskan_Malamute%2BBlank.png', scene);
        mat.shadeTexture = mat.diffuseTexture.clone();
        mat.alphaBlend = true;
        mtoonMaterials.push(mat);
    }

    mtoonMaterials.forEach((mat, index) => {
        // MToonMaterial は glTF(右手座標) を考慮しているため、 CullMode をデフォルトから反転させる
        mat.cullMode = 1;
        mat.outlineCullMode = 2;
        addInspectableCustomProperties(mat);
        const sphere = Mesh.CreateSphere(`${mat.name}_Sphere`, 16, 1, scene);
        sphere.position = new Vector3(-1.2 * index, 1.2, 0);
        sphere.receiveShadows = true;
        sphere.material = mat;
    });

    if (debugProperties.inspector) {
       await scene.debugLayer.show({
            globalRoot: document.getElementById('wrapper') as HTMLMainElement,
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
}

interface DebugProperties {
    webgl1: boolean;
    shadow: boolean;
    inspector: boolean;
}

function getDebugProperties(): DebugProperties {
    const href = window.location.href;

    return {
        webgl1: href.includes('webgl1'),
        shadow: href.includes('shadow'),
        inspector: href.includes('inspector'),
    };
}

main().catch((reason) => {
    console.error(reason);
});
