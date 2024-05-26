/**
 * @license Apache-2.0
 * @author Masaru Yamagishi
 */

import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Nullable } from "@babylonjs/core/types";
import { BoneNotFoundError } from "./errors";

interface TransformNodeMap {
    [name: string]: TransformNode;
}

/**
 * Methods to get transformNode of HumanoidBone(Unity)
 * @see https://docs.unity3d.com/ja/2020.3/ScriptReference/HumanBodyBones.html
 */
export class HumanoidBone {
    private nodeMap: Nullable<TransformNodeMap> = null;
    public constructor(nodeMap: TransformNodeMap) {
        this.nodeMap = nodeMap;
    }

    public dispose() {
        this.nodeMap = null;
    }

    public get hips() {
        return this.getMandatoryBone("hips");
    }
    public get leftUpperLeg() {
        return this.getMandatoryBone("leftUpperLeg");
    }
    public get rightUpperLeg() {
        return this.getMandatoryBone("rightUpperLeg");
    }
    public get leftLowerLeg() {
        return this.getMandatoryBone("leftLowerLeg");
    }
    public get rightLowerLeg() {
        return this.getMandatoryBone("rightLowerLeg");
    }
    public get leftFoot() {
        return this.getMandatoryBone("leftFoot");
    }
    public get rightFoot() {
        return this.getMandatoryBone("rightFoot");
    }
    public get spine() {
        return this.getMandatoryBone("spine");
    }
    public get chest() {
        return this.getMandatoryBone("chest");
    }
    public get neck() {
        return this.getMandatoryBone("neck");
    }
    public get head() {
        return this.getMandatoryBone("head");
    }
    public get leftShoulder() {
        return this.getMandatoryBone("leftShoulder");
    }
    public get rightShoulder() {
        return this.getMandatoryBone("rightShoulder");
    }
    public get leftUpperArm() {
        return this.getMandatoryBone("leftUpperArm");
    }
    public get rightUpperArm() {
        return this.getMandatoryBone("rightUpperArm");
    }
    public get leftLowerArm() {
        return this.getMandatoryBone("leftLowerArm");
    }
    public get rightLowerArm() {
        return this.getMandatoryBone("rightLowerArm");
    }
    public get leftHand() {
        return this.getMandatoryBone("leftHand");
    }
    public get rightHand() {
        return this.getMandatoryBone("rightHand");
    }
    public get leftToes() {
        return this.getOptionalBone("leftToes");
    }
    public get rightToes() {
        return this.getOptionalBone("rightToes");
    }
    public get leftEye() {
        return this.getOptionalBone("leftEye");
    }
    public get rightEye() {
        return this.getOptionalBone("rightEye");
    }
    public get jaw() {
        return this.getOptionalBone("jaw");
    }
    public get leftThumbProximal() {
        return this.getOptionalBone("leftThumbProximal");
    }
    public get leftThumbIntermediate() {
        return this.getOptionalBone("leftThumbIntermediate");
    }
    public get leftThumbDistal() {
        return this.getOptionalBone("leftThumbDistal");
    }
    public get leftIndexProximal() {
        return this.getOptionalBone("leftIndexProximal");
    }
    public get leftIndexIntermediate() {
        return this.getOptionalBone("leftIndexIntermediate");
    }
    public get leftIndexDistal() {
        return this.getOptionalBone("leftIndexDistal");
    }
    public get leftMiddleProximal() {
        return this.getOptionalBone("leftMiddleProximal");
    }
    public get leftMiddleIntermediate() {
        return this.getOptionalBone("leftMiddleIntermediate");
    }
    public get leftMiddleDistal() {
        return this.getOptionalBone("leftMiddleDistal");
    }
    public get leftRingProximal() {
        return this.getOptionalBone("leftRingProximal");
    }
    public get leftRingIntermediate() {
        return this.getOptionalBone("leftRingIntermediate");
    }
    public get leftRingDistal() {
        return this.getOptionalBone("leftRingDistal");
    }
    public get leftLittleProximal() {
        return this.getOptionalBone("leftLittleProximal");
    }
    public get leftLittleIntermediate() {
        return this.getOptionalBone("leftLittleIntermediate");
    }
    public get leftLittleDistal() {
        return this.getOptionalBone("leftLittleDistal");
    }
    public get rightThumbProximal() {
        return this.getOptionalBone("rightThumbProximal");
    }
    public get rightThumbIntermediate() {
        return this.getOptionalBone("rightThumbIntermediate");
    }
    public get rightThumbDistal() {
        return this.getOptionalBone("rightThumbDistal");
    }
    public get rightIndexProximal() {
        return this.getOptionalBone("rightIndexProximal");
    }
    public get rightIndexIntermediate() {
        return this.getOptionalBone("rightIndexIntermediate");
    }
    public get rightIndexDistal() {
        return this.getOptionalBone("rightIndexDistal");
    }
    public get rightMiddleProximal() {
        return this.getOptionalBone("rightMiddleProximal");
    }
    public get rightMiddleIntermediate() {
        return this.getOptionalBone("rightMiddleIntermediate");
    }
    public get rightMiddleDistal() {
        return this.getOptionalBone("rightMiddleDistal");
    }
    public get rightRingProximal() {
        return this.getOptionalBone("rightRingProximal");
    }
    public get rightRingIntermediate() {
        return this.getOptionalBone("rightRingIntermediate");
    }
    public get rightRingDistal() {
        return this.getOptionalBone("rightRingDistal");
    }
    public get rightLittleProximal() {
        return this.getOptionalBone("rightLittleProximal");
    }
    public get rightLittleIntermediate() {
        return this.getOptionalBone("rightLittleIntermediate");
    }
    public get rightLittleDistal() {
        return this.getOptionalBone("rightLittleDistal");
    }
    public get upperChest() {
        return this.getOptionalBone("upperChest");
    }

    /**
     * Get mandatory bone. Throws error when there is no TransformNode.
     *
     * @throws BoneNotFoundError
     * @param name HumanoidBoneName
     */
    private getMandatoryBone(name: string): TransformNode {
        const node = this.getOptionalBone(name);
        if (!node) {
            throw new BoneNotFoundError(name);
        }
        return node;
    }

    /**
     * Get optional bone. Returns null when there is no TransformNode.
     *
     * @param name HumanoidBoneName
     */
    private getOptionalBone(name: string): Nullable<TransformNode> {
        if (!this.nodeMap) {
            return null;
        }
        if (this.nodeMap[name]) {
            return this.nodeMap[name];
        }
        return null;
    }
}
