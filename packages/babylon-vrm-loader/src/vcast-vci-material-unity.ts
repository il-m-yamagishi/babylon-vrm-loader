/**
 * @license Apache-2.0
 * @author Masaru Yamagishi
 */

import type { Material } from "@babylonjs/core/Materials/material";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Nullable } from "@babylonjs/core/types";
import type { IGLTFLoaderExtension, IMaterial } from "@babylonjs/loaders/glTF/2.0";
import { GLTFLoader } from "@babylonjs/loaders/glTF/2.0";
import { VRMMaterialGenerator } from "./vrm-material-generator";

/**
 * `extensions` key
 */
const NAME = "VCAST_vci_material_unity";

/**
 * VCAST_vci_material_unity extension
 */
export class VCAST_vci_material_unity implements IGLTFLoaderExtension {
    /**
     * @inheritdoc
     */
    public readonly name = NAME;
    /**
     * @inheritdoc
     */
    public enabled = true;

    /**
     * @inheritdoc
     */
    public constructor(private loader: GLTFLoader) {}

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
    public _loadMaterialAsync(context: string, material: IMaterial, mesh: Mesh, babylonDrawMode: number, assign: (babylonMaterial: Material) => void): Nullable<Promise<Material>> {
        return new VRMMaterialGenerator(this.loader).generate(context, material, mesh, babylonDrawMode, assign);
    }
}

// Has side-effect
GLTFLoader.RegisterExtension(NAME, (loader) => new VCAST_vci_material_unity(loader));
