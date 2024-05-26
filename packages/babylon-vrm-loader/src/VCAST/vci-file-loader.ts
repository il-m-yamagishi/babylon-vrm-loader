/**
 * @license Apache-2.0
 * @author Masaru Yamagishi
 */

import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { GLTFFileLoader } from "@babylonjs/loaders/glTF/glTFFileLoader";

/**
 * File loader for VCI supports  .vci
 */
export class VCIFileLoader extends GLTFFileLoader {
    public override name = "vci";
    public override extensions = {
        ".vci": { isBinary: true },
    };

    public override createPlugin() {
        return new VCIFileLoader();
    }
}

// Has side-effect
SceneLoader.RegisterPlugin(new VCIFileLoader());
