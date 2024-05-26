/**
 * @license Apache-2.0
 * @author Masaru Yamagishi
 */

import { Vector3 } from "@babylonjs/core/Maths/math";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { MorphTarget } from "@babylonjs/core/Morph/morphTarget";
import type { Scene } from "@babylonjs/core/scene";
import type { Nullable } from "@babylonjs/core/types";
import { HumanoidBone } from "./humanoid-bone";
import { MaterialValueBindingMerger } from "./material-value-binding-merger";
import { SpringBoneController } from "./secondary-animation/spring-bone-controller";
import type { IVRM } from "./vrm-interfaces";

interface IsBinaryMap {
    [morphName: string]: boolean;
}

interface MorphTargetSetting {
    target: MorphTarget;
    weight: number;
}

interface MorphTargetMap {
    [morphName: string]: MorphTargetSetting[];
}

interface MaterialValueBindingMergerMap {
    [morphName: string]: MaterialValueBindingMerger;
}

interface TransformNodeMap {
    [humanBoneName: string]: TransformNode;
}

interface TransformNodeCache {
    [nodeIndex: number]: TransformNode;
}

interface MeshCache {
    [meshIndex: number]: Mesh[];
}

/**
 * Unity Humanoid Bone name
 */
export type HumanBoneName =
    | "hips"
    | "leftUpperLeg"
    | "rightUpperLeg"
    | "leftLowerLeg"
    | "rightLowerLeg"
    | "leftFoot"
    | "rightFoot"
    | "spine"
    | "chest"
    | "neck"
    | "head"
    | "leftShoulder"
    | "rightShoulder"
    | "leftUpperArm"
    | "rightUpperArm"
    | "leftLowerArm"
    | "rightLowerArm"
    | "leftHand"
    | "rightHand"
    | "leftToes"
    | "rightToes"
    | "leftEye"
    | "rightEye"
    | "jaw"
    | "leftThumbProximal"
    | "leftThumbIntermediate"
    | "leftThumbDistal"
    | "leftIndexProximal"
    | "leftIndexIntermediate"
    | "leftIndexDistal"
    | "leftMiddleProximal"
    | "leftMiddleIntermediate"
    | "leftMiddleDistal"
    | "leftRingProximal"
    | "leftRingIntermediate"
    | "leftRingDistal"
    | "leftLittleProximal"
    | "leftLittleIntermediate"
    | "leftLittleDistal"
    | "rightThumbProximal"
    | "rightThumbIntermediate"
    | "rightThumbDistal"
    | "rightIndexProximal"
    | "rightIndexIntermediate"
    | "rightIndexDistal"
    | "rightMiddleProximal"
    | "rightMiddleIntermediate"
    | "rightMiddleDistal"
    | "rightRingProximal"
    | "rightRingIntermediate"
    | "rightRingDistal"
    | "rightLittleProximal"
    | "rightLittleIntermediate"
    | "rightLittleDistal"
    | "upperChest"
    | string;

/**
 * Manager for VRM
 */
export class VRMManager {
    private isBinaryMorphMap: IsBinaryMap = {};
    private morphTargetMap: MorphTargetMap = {};
    private materialValueBindingMergerMap: MaterialValueBindingMergerMap = {};
    private presetMorphTargetMap: MorphTargetMap = {};
    private transformNodeMap: TransformNodeMap = {};
    private transformNodeCache: TransformNodeCache = {};
    private meshCache: MeshCache = {};
    private _humanoidBone: HumanoidBone;
    private _rootMesh?: Nullable<Mesh>;

    /**
     * Secondary Animation controller
     */
    public readonly springBoneController: SpringBoneController;

    /**
     *
     * @param ext glTF.extensions.VRM json
     * @param scene
     * @param meshesFrom
     * @param transformNodesFrom
     * @param materialsNodesFrom
     */
    public constructor(
        public readonly ext: IVRM,
        public readonly scene: Scene,
        private readonly meshesFrom: number,
        private readonly transformNodesFrom: number,
        private readonly materialsNodesFrom: number
    ) {
        this.meshCache = this.constructMeshCache();
        this.transformNodeCache = this.constructTransformNodeCache();
        this.springBoneController = new SpringBoneController(this.ext.secondaryAnimation, this.findTransformNode.bind(this));

        if (this.ext.blendShapeMaster?.blendShapeGroups) {
            this.constructIsBinaryMap();
            this.constructMorphTargetMap();
            this.constructMaterialValueBindingMergerMap();
        }
        this.constructTransformNodeMap();

        this._humanoidBone = new HumanoidBone(this.transformNodeMap);
    }

    /**
     * Update Secondary Animation
     *
     * @param deltaTime The elapsed time in seconds since the previous frame(sec)
     */
    public async update(deltaTime: number): Promise<void> {
        await this.springBoneController.update(deltaTime);
    }

    /**
     * 破棄処理
     */
    public dispose(): void {
        this.springBoneController.dispose();
        this._humanoidBone.dispose();

        this.morphTargetMap = {};
        this.materialValueBindingMergerMap = {};
        this.presetMorphTargetMap = {};
        this.transformNodeMap = {};
        this.transformNodeCache = {};
        this.meshCache = {};
        this._rootMesh = null;
    }

    /**
     * Morph
     * @param label morph label
     * @param value value(0〜1)
     */
    public morphing(label: string, value: number): void {
        const v = this.calcMorphValue(label, value);
        if (this.morphTargetMap[label]) {
            this.morphTargetMap[label].forEach((setting) => {
                setting.target.influence = v * (setting.weight / 100);
            });
        }
        if (this.materialValueBindingMergerMap[label]) {
            this.materialValueBindingMergerMap[label].morphing(v);
        }
    }

    /**
     * Preset morph
     * @param label morph label
     * @param value value(0〜1)
     */
    public morphingPreset(label: string, value: number): void {
        if (!this.presetMorphTargetMap[label]) {
            return;
        }
        const v = this.calcMorphValue(label, value);
        this.presetMorphTargetMap[label].forEach((setting) => {
            setting.target.influence = v * (setting.weight / 100);
        });
    }

    /**
     * Calculate value for morph
     * @param label morph label
     * @param value value
     */
    private calcMorphValue(label: string, value: number): number {
        const v = Math.max(0.0, Math.min(1.0, value));
        if (this.isBinaryMorphMap[label]) {
            return v > 0.5 ? 1.0 : 0.0;
        }
        return v;
    }

    /**
     * list morphing name
     */
    public getMorphingList(): string[] {
        return Object.keys(this.morphTargetMap);
    }

    /**
     * Get absolute camera position for first person view
     *
     * Returns null when there is no firstPersonBone
     */
    public getFirstPersonCameraPosition(): Nullable<Vector3> {
        const firstPersonBone = this.getFirstPersonBone();
        if (!firstPersonBone) {
            return null;
        }

        const basePos = firstPersonBone.getAbsolutePosition();
        const offsetPos = this.ext.firstPerson.firstPersonBoneOffset;
        return new Vector3(basePos.x + offsetPos.x, basePos.y + offsetPos.y, basePos.z + offsetPos.z);
    }

    /**
     * Get TransformNode as head in first person view
     */
    public getFirstPersonBone(): Nullable<TransformNode> {
        return this.findTransformNode(this.ext.firstPerson.firstPersonBone);
    }

    /**
     * Get HumanoidBone Methods
     */
    public get humanoidBone(): HumanoidBone {
        return this._humanoidBone;
    }

    /**
     * VRM Root mesh
     *
     * Useful for Model Transformation
     */
    public get rootMesh(): Mesh {
        if (!this._rootMesh) {
            throw new Error("Root mesh is not found");
        }
        return this._rootMesh;
    }

    /**
     * Find the corresponding TransformNode from the node index
     * Since there can be a large number of nodes, it is structured to hold references in a cache
     * The node index in gltf is recorded in `metadata.gltf.pointers`
     * @param nodeIndex
     */
    public findTransformNode(nodeIndex: number): Nullable<TransformNode> {
        return this.transformNodeCache[nodeIndex] || null;
    }

    /**
     * Find the corresponding Meshes from the mesh index
     * The mesh index in gltf is recorded in `metadata.gltf.pointers`
     */
    public findMeshes(meshIndex: number): Nullable<Mesh[]> {
        return this.meshCache[meshIndex] || null;
    }

    /**
     * Prepare binary map
     */
    private constructIsBinaryMap(): void {
        this.ext.blendShapeMaster.blendShapeGroups.forEach((g) => {
            this.isBinaryMorphMap[g.name] = g.isBinary;
        });
    }

    /**
     * Prepare morph target map
     */
    private constructMorphTargetMap(): void {
        this.ext.blendShapeMaster.blendShapeGroups.forEach((g) => {
            if (!g.binds) {
                return;
            }
            g.binds.forEach((b) => {
                const meshes = this.findMeshes(b.mesh);
                if (!meshes) {
                    console.log("Undefined BlendShapeBind Mesh", b);
                    return;
                }
                meshes.forEach((mesh) => {
                    const morphTargetManager = mesh.morphTargetManager;
                    if (!morphTargetManager) {
                        console.log("Undefined morphTargetManager", b);
                        return;
                    }
                    const target = morphTargetManager.getTarget(b.index);
                    this.morphTargetMap[g.name] = this.morphTargetMap[g.name] || [];
                    this.morphTargetMap[g.name].push({
                        target,
                        weight: b.weight,
                    });
                    if (g.presetName) {
                        this.presetMorphTargetMap[g.presetName] = this.presetMorphTargetMap[g.presetName] || [];
                        this.presetMorphTargetMap[g.presetName].push({
                            target,
                            weight: b.weight,
                        });
                    }
                });
            });
        });
    }

    /**
     * Prepare MaterialValueBindingMerger map
     */
    private constructMaterialValueBindingMergerMap() {
        const materials = this.scene.materials.slice(this.materialsNodesFrom);
        this.ext.blendShapeMaster.blendShapeGroups.forEach((g) => {
            if (!g.materialValues) {
                return;
            }
            this.materialValueBindingMergerMap[g.name] = new MaterialValueBindingMerger(materials, g.materialValues);
        });
    }

    /**
     * Prepare TransformNode map
     */
    private constructTransformNodeMap() {
        this.ext.humanoid.humanBones.forEach((b) => {
            const node = this.findTransformNode(b.node);
            if (!node) {
                return;
            }
            this.transformNodeMap[b.bone] = node;
        });
    }

    /**
     * Prepare TransformNode
     */
    private constructTransformNodeCache() {
        const cache: TransformNodeCache = {};
        for (let index = this.transformNodesFrom; index < this.scene.transformNodes.length; index++) {
            const node = this.scene.transformNodes[index];
            // Skip when no pointers are registered
            if (!node || !node.metadata || !node.metadata.gltf || !node.metadata.gltf.pointers || node.metadata.gltf.pointers.length === 0) {
                continue;
            }
            for (const pointer of node.metadata.gltf.pointers) {
                if (pointer.startsWith("/nodes/")) {
                    const nodeIndex = Number.parseInt((pointer as string).slice(7), 10);
                    cache[nodeIndex] = node;
                    break;
                }
            }
        }
        return cache;
    }

    /**
     * Prepare mesh
     */
    private constructMeshCache() {
        const cache: MeshCache = {};
        for (let index = this.meshesFrom; index < this.scene.meshes.length; index++) {
            const mesh = this.scene.meshes[index];
            if (mesh.id === "__root__") {
                this._rootMesh = mesh as Mesh;
                continue;
            }
            // Skip when no pointers are registered
            if (!mesh || !mesh.metadata || !mesh.metadata.gltf || !mesh.metadata.gltf.pointers || mesh.metadata.gltf.pointers.length === 0) {
                continue;
            }
            for (const pointer of mesh.metadata.gltf.pointers) {
                const match = (pointer as string).match(/^\/meshes\/(\d+).+$/);
                if (match) {
                    const nodeIndex = Number.parseInt(match[1], 10);
                    cache[nodeIndex] = cache[nodeIndex] || [];
                    cache[nodeIndex].push(mesh as Mesh);
                    break;
                }
            }
        }
        return cache;
    }
}
