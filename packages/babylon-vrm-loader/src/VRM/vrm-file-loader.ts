/**
 * @license Apache-2.0
 * @author Masaru Yamagishi
 */

import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { GLTFFileLoader } from "@babylonjs/loaders/glTF/glTFFileLoader";

/**
 * File loader for VRM supports .vrm and .vci
 */
export class VRMFileLoader extends GLTFFileLoader {
    public override name = "vrm";
    public override extensions = {
        ".vrm": { isBinary: true },
        ".vci": { isBinary: true },
    };

    public override createPlugin() {
        return new VRMFileLoader();
    }
}

// Has side-effect
SceneLoader.RegisterPlugin(new VRMFileLoader());
