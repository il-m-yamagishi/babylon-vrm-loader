/**
 * @license Apache-2.0
 * @author Masaru Yamagishi
 */

import type { Material } from "@babylonjs/core/Materials/material";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Nullable } from "@babylonjs/core/types";
import type { IGLTFLoaderExtension, IMaterial, IMeshPrimitive } from "@babylonjs/loaders/glTF/2.0";
import { GLTFLoader } from "@babylonjs/loaders/glTF/2.0";
import { VRMManager } from "./vrm-manager";
import { VRMMaterialGenerator } from "./vrm-material-generator";

/**
 * `extensions` key
 */
const NAME = "VRM";

/**
 * VRM 0.x extension
 * [Specification](https://github.com/vrm-c/vrm-specification/tree/master/specification/0.0)
 */
export class VRM implements IGLTFLoaderExtension {
    /**
     * @inheritdoc
     */
    public readonly name = NAME;
    /**
     * @inheritdoc
     */
    public enabled = true;
    private meshesFrom = 0;
    private transformNodesFrom = 0;
    private materialsFrom = 0;

    /**
     * @inheritdoc
     */
    public constructor(private loader: GLTFLoader) {
        // GLTFLoader has already added rootMesh as __root__ before load extension
        // @see glTFLoader._loadData
        this.meshesFrom = this.loader.babylonScene.meshes.length - 1;
        this.transformNodesFrom = this.loader.babylonScene.transformNodes.length;
        this.materialsFrom = this.loader.babylonScene.materials.length;
    }

    /**
     * @inheritdoc
     */
    public dispose(): void {
        // biome-ignore lint/suspicious/noExplicitAny: dispose
        (this.loader as any) = null;
    }

    /**
     * @inheritdoc
     */
    public onReady() {
        if (!this.loader.gltf.extensions || !this.loader.gltf.extensions[NAME]) {
            return;
        }
        const scene = this.loader.babylonScene;
        const manager = new VRMManager(this.loader.gltf.extensions[NAME], this.loader.babylonScene, this.meshesFrom, this.transformNodesFrom, this.materialsFrom);
        scene.metadata = scene.metadata || {};
        scene.metadata.vrmManagers = scene.metadata.vrmManagers || [];
        scene.metadata.vrmManagers.push(manager);
        const onUpdate = () => {
            manager.update(scene.getEngine().getDeltaTime());
        };
        this.loader.babylonScene.onBeforeRenderObservable.add(onUpdate);
        this.loader.babylonScene.onDisposeObservable.addOnce(() => {
            scene.onBeforeRenderObservable.removeCallback(onUpdate);
            manager.dispose();
        });
    }

    /**
     * @inheritdoc
     */
    public _loadVertexDataAsync(context: string, primitive: IMeshPrimitive, babylonMesh: Mesh) {
        if (!primitive.extras || !primitive.extras.targetNames) {
            return null;
        }
        // Since MorphTargets have not been generated yet, put morph target information in the metadata
        babylonMesh.metadata = babylonMesh.metadata || {};
        babylonMesh.metadata.vrmTargetNames = primitive.extras.targetNames;
        return null;
    }

    /**
     * @inheritdoc
     */
    public _loadMaterialAsync(context: string, material: IMaterial, mesh: Mesh, babylonDrawMode: number, assign: (babylonMaterial: Material) => void): Nullable<Promise<Material>> {
        return new VRMMaterialGenerator(this.loader).generate(context, material, mesh, babylonDrawMode, assign);
    }
}

// Has side-effect
GLTFLoader.RegisterExtension(NAME, (loader) => new VRM(loader));
