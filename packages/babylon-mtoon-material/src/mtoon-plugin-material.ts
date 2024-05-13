/**
 * MToonMaterial plugin
 * @license MIT
 * @author Masaru Yamagishi
 */

import { Constants } from "@babylonjs/core/Engines/constants";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import { Material } from "@babylonjs/core/Materials/material";
import { MaterialPluginBase } from "@babylonjs/core/Materials/materialPluginBase";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { expandToProperty, serialize, serializeAsColor3, serializeAsTexture } from "@babylonjs/core/Misc/decorators";
import type { Nullable } from "@babylonjs/core/types";
import { MToonMaterialDefines } from "./mtoon-material-defines";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { AbstractMesh, IAnimatable, MaterialDefines, UniformBuffer } from "@babylonjs/core";
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { SubMesh } from "@babylonjs/core/Meshes/subMesh";
import { Scene } from "@babylonjs/core/scene";

/**
 * The rendering mode of outlines
 */
export enum MToonOutlineWidthMode {
    /**
     * the outline is not rendered.
     */
    None = "none",
    /**
     * the width of the outline is determined by the distance in the world coordinate system.
     */
    WorldCoordinates = "worldCoordinates",
    /**
     * the width of the outline depends on the screen coordinate system,
     * which results in the thickness of the outline being constant regardless of the world space distance to the mesh.
     */
    ScreenCoordinates = "screenCoordinates",
}

/**
 * MToon は日本のアニメ的表現をすることを目標としています。
 * 主色 (Lit Color) と陰色 (Shade Color) の 2 色を、Lighting パラメータや光源環境に応じて混合することでそれを実現します。
 *
 * MToon aims for making Japanese anime expressions.
 * It is achieved by mixing Lit Color and Shade Color based on Lighting parameters and light source environment.
 *
 * @see https://github.com/Santarh/MToon/
 * @see https://vrm.dev/univrm/shaders/shader_mtoon/
 * @see https://github.com/BabylonJS/Babylon.js/blob/master/packages/dev/core/src/Materials/materialPluginBase.ts
 * @see https://doc.babylonjs.com/features/featuresDeepDive/materials/using/materialPlugins
 * @see https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_materials_mtoon-1.0/README.md
 */
export class MToonPluginMaterial extends MaterialPluginBase {
    private readonly _defines: MToonMaterialDefines;

    /**
     * Parent Material
     */
    protected override readonly _material: PBRMaterial | StandardMaterial;

    @serialize()
    public override readonly name = "MToonPluginMaterial";

    /**
     * Always resolves includes
     */
    @serialize()
    public override readonly resolveIncludes = true;

    @serialize()
    private _isEnabled = true;
    public get isEnabled(): boolean {
        return this._isEnabled;
    }
    public set isEnabled(value: boolean) {
        if (this._isEnabled === value) {
            return;
        }
        this._isEnabled = value;
        this.markAllDefinesAsDirty();
        this._enable(value);
    }

    /**
     * Version of the extension
     */
    @serialize()
    public readonly specVersion = "1.0";

    // alphaMode is in parent material
    // alphaCutoff is in parent material
    // transparentWithZWrite is forceDepthWrite in parent material

    /**
     * Offset value to the rendering order
     */
    @serialize()
    public renderQueueOffsetNumber = 0;

    // doubleSided is in parent material in glTF Spec
    // Lit color is this._material.diffuseColor or this._material.albedoColor in glTF Spec
    // Lit texture is this._material.diffuseTexture or this._material.albedoTexture in glTF Spec
    // Surface normal is this._material.bumpTexture in glTF Spec

    /**
     * The shade color
     * A color that specifies the shade color. The value is evaluated in linear colorspace.
     */
    @serializeAsColor3()
    public shadeColorFactor = Color3.Black();

    /**
     * The texture multiplied for the shade color
     * A texture that is multiplied for the shade color.
     * The components of the texture are encoded with the sRGB transfer function.
     * The RGB components are evaluated after being converted into linear colorspace.
     * The value of the texture is multiplied into the shade color set by shadeColorFactor.
     * If the texture is not specified, the value specified in the shadeColorFactor is used directly.
     */
    @serializeAsTexture()
    @expandToProperty("_markAllSubMeshesAsTexturesDirty")
    public shadeMultiplyTexture: Nullable<BaseTexture> = null;

    /**
     * The factor which shifts the position of shading boundary
     * See the section [Shading Shift](https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_materials_mtoon-1.0/README.md#Shading%20Shift) for specific details on how the calculation is performed.
     */
    @serialize()
    public shadingShiftFactor = 0.0;

    /**
     * The texture which shift the position of shading boundary
     * MToon linearly interpolates base and shade colors according to the dot product of the surface normal and the light vector.
     * MToon can adjust the threshold position and width (feather) of the boundary between the lit and unlit parts.
     * The position of the shading boundary is specified by the shadingShiftFactor and shadingShiftTexture defined by the MToon extension.
     * The width of the shading boundary is specified by the shadingToonyFactor defined by the MToon extension.
     * shadingShiftTexture adjusts the position of the shading boundary set by shadingShiftFactor.
     * This texture allows it to adjust the lighting on certain model parts.
     * The value of shadingShiftTexture adds the shadingShiftFactor value.
     * shadingShiftTexture.scale controls how much this texture contributes to the shading boundary.
     */
    @serializeAsTexture()
    @expandToProperty("_markAllSubMeshesAsTexturesDirty")
    public shadingShiftTexture: Nullable<BaseTexture> = null;

    /**
     * The factor which adjusts the width of shading boundary
     * See the section [Shading Shift](https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_materials_mtoon-1.0/README.md#Shading%20Shift) for specific details on how the calculation is performed.
     */
    @serialize()
    public shadingToonyFactor = 0.9;

    /**
     * Defines the equalization factor of the global illumination.
     * When the value is 0, global illumination is calculated as usual.
     * The closer the value is to 1, the more the global illumination is smoothed and eventually be in uniform depending on the direction of the surface.
     * See the section [Global Illumination](https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_materials_mtoon-1.0/README.md#Global%20Illumination) for specific details of the global illumination procedure.
     */
    @serialize()
    public giEqualizationFactor = 0.9;

    // Emissive factor is this._material.emissiveColor in glTF Spec
    // Emissive texture is this._material.emissiveTexture in glTF Spec

    /**
     * The color multiplied to matcap texture
     * A color multiplies to the matcap texture. The value is evaluated in linear colorspace.
     */
    @serializeAsColor3()
    public matcapFactor = Color3.White();

    /**
     * The matcap texture
     * The components of the texture are encoded with the sRGB transfer function.
     * The RGB components are evaluated after being converted into linear colorspace.
     * When the texture is not defined, it must be sampled as having 0.0 in RGB components.
     */
    @serializeAsTexture()
    @expandToProperty("_markAllSubMeshesAsTexturesDirty")
    public matcapTexture: Nullable<BaseTexture> = null;

    /**
     * The color of parametric rim lighting
     * The value is evaluated in linear colorspace.
     */
    @serializeAsColor3()
    public parametricRimColorFactor = Color3.Black();

    /**
     * The fresnel factor of parametric rim lighting
     * See the section [Parametric Rim Lighting](https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_materials_mtoon-1.0/README.md#Parametric%20Rim%20Lighting) for specific details of the parametric rim lighting procedure.
     */
    @serialize()
    public parametricRimFresnelPowerFactor = 5.0;

    /**
     * The lift factor of parametric rim lighting
     * See the section [Parametric Rim Lighting](https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_materials_mtoon-1.0/README.md#Parametric%20Rim%20Lighting) for specific details of the parametric rim lighting procedure.
     */
    @serialize()
    public parametricRimLiftFactor = 0.0;

    /**
     * The mask texture multiplied to the rim lighting
     * The components of the texture are encoded with the sRGB transfer function.
     * The RGB components are evaluated after being converted into linear colorspace.
     */
    @serializeAsTexture()
    @expandToProperty("_markAllSubMeshesAsTexturesDirty")
    public rimMultiplyTexture: Nullable<BaseTexture> = null;

    /**
     * The lighting mix factor of rim lighting
     * The factor specifies how much the rim lighting is affected by the surrounding lighting.
     */
    @serialize()
    public rimLightingMixFactor = 1.0;

    /**
     * The rendering mode of outlines
     * See the section [Outline](https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_materials_mtoon-1.0/README.md#Outline) for specific details of the outline rendering procedure.
     */
    @serialize()
    public outlineWidthMode: MToonOutlineWidthMode = MToonOutlineWidthMode.None;

    /**
     * The width factor of outlines
     * See the section [Outline](https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_materials_mtoon-1.0/README.md#Outline) for specific details of the outline rendering procedure.
     */
    @serialize()
    public outlineWidthFactor = 0.0;

    /**
     * The texture to set multiplication factor of outline width.
     * If it is not assigned, the value of outlineWidthFactor is used directly.
     * The components of the texture are stored in linear colorspace.
     * The G component of the texture is referred to.
     * You can use either a monochrome mask texture or an RGB texture with other masks per channel since the property references the G component of the assigned texture.
     * You can combine shadingShiftTexture (which uses the R channel) and uvAnimationMaskTexture (which uses the B channel) into a single texture.
     */
    @serializeAsTexture()
    @expandToProperty("_markAllSubMeshesAsTexturesDirty")
    public outlineWidthMultiplyTexture: Nullable<BaseTexture> = null;

    /**
     * The color of the outline. The value is evaluated in linear colorspace.
     */
    @serializeAsColor3()
    public outlineColorFactor = Color3.Black();

    /**
     * The factor specifies the ratio of how much the outline color is multiplied by the surface shading result.
     * If the value is set to 0.0, the outline is rendered in the color specified by outlineColorFactor directly.
     * If you want the outline color to be affected by the lighting, set the value to 1.0.
     */
    @serialize()
    public outlineLightingMixFactor = 1.0;

    /**
     * The texture masks the UV animation for certain parts of meshes.
     * The components of the texture are stored in linear colorspace.
     * The B component of the texture is referred to.
     * You can use either a monochrome mask texture or an RGB texture with other masks per channel since the property references the B component of the assigned texture.
     * You can combine shadingShiftTexture (which uses the R channel) and outlineWidthMultiplyTexture (which uses the G channel) into a single texture.
     */
    @serializeAsTexture()
    @expandToProperty("_markAllSubMeshesAsTexturesDirty")
    public uvAnimationMaskTexture: Nullable<BaseTexture> = null;

    /**
     * The UV animation speed in the X direction.
     */
    @serialize()
    public uvAnimationScrollXSpeedFactor = 0.0;

    /**
     * The UV animation speed in the Y direction.
     */
    @serialize()
    public uvAnimationScrollYSpeedFactor = 0.0;

    /**
     * The UV animation rotation speed.
     */
    @serialize()
    public uvAnimationScrollRotationSpeedFactor = 0.0;

    /** @internal */
    private _internalMarkAllSubMeshesAsTexturesDirty: () => void;

    /** @internal */
    public _markAllSubMeshesAsTexturesDirty(): void {
        this._enable(this._isEnabled);
        if (this._internalMarkAllSubMeshesAsTexturesDirty) {
            this._internalMarkAllSubMeshesAsTexturesDirty();
        }
    }

    /**
     * @inheritdoc
     */
    public constructor(material: Material, priority?: number) {
        const defines = new MToonMaterialDefines();
        super(material, "MToon", priority ?? 100, defines, true, true, true);
        this._internalMarkAllSubMeshesAsTexturesDirty = material._dirtyCallbacks[Constants.MATERIAL_TextureDirtyFlag];
        this._defines = defines;
    }

    /**
     * @inheritdoc
     */
    public override isReadyForSubMesh(defines: MToonMaterialDefines, scene: Scene, engine: AbstractEngine, subMesh: SubMesh): boolean {
        if (!this._isEnabled) {
            return true;
        }

        if (defines._areTexturesDirty && scene.texturesEnabled) {
            if (this.textures.find((texture) => !texture.isReady())) {
                return false;
            }
        }

        return true;
    }

    /**
     * @inheritdoc
     */
    public override prepareDefines(defines: MToonMaterialDefines, scene: Scene, mesh: AbstractMesh): void {
        if (this._isEnabled) {
            // TODO
        } else {
            defines.SHADE_MULTIPLY = false;
            defines.SHADING_SHIFT = false;
            defines.MATCAP = false;
            defines.RIM_MULTIPLY = false;
            defines.OUTLINE_WIDTH_MULTIPLY = false;
            defines.UV_ANIMATION_MASK = false;
        }
    }

    /**
     * @inheritdoc
     */
    public override bindForSubMesh(uniformBuffer: UniformBuffer, scene: Scene, engine: AbstractEngine, subMesh: SubMesh): void {
        if (!this._isEnabled) {
            return;
        }

        // TODO
    }

    /**
     * @inheritdoc
     */
    public override hasTexture(texture: BaseTexture): boolean {
        return this.textures.includes(texture);
    }

    /**
     * @inheritdoc
     */
    public override getActiveTextures(activeTextures: BaseTexture[]): void {
        activeTextures.push(...this.textures);
    }

    /**
     * @inheritdoc
     */
    public override getAnimatables(animatables: IAnimatable[]): void {
        this.textures.forEach((texture) => {
            if (texture.animations?.length) {
                animatables.push(texture);
            }
        });
    }

    /**
     * @inheritdoc
     */
    public override dispose(forceDisposeTextures?: boolean | undefined): void {
        if (forceDisposeTextures) {
            this.textures.forEach((texture) => {
                texture.dispose();
            });
        }
    }

    /**
     * @inheritdoc
     */
    public override getSamplers(samplers: string[]): void {
        samplers.push("shadeMultiply");
        samplers.push("shadingShift");
        samplers.push("matcap");
        samplers.push("rimMultiply");
        samplers.push("outlineWidthMultiply");
        samplers.push("uvAnimationMask");
    }

    /**
     * @inheritdoc
     */
    public override getUniforms(): { ubo?: { name: string; size?: number | undefined; type?: string | undefined; arraySize?: number | undefined; }[] | undefined; vertex?: string | undefined; fragment?: string | undefined; } {
        // TODO
        return {};
    }

    /**
     * @inheritdoc
     */
    public override getCustomCode(shaderType: string): Nullable<{ [pointName: string]: string; }> {
        // TODO
        return null;
    }

    /**
     * Get active textures
     */
    private get textures(): BaseTexture[] {
        return [
            this.shadeMultiplyTexture,
            this.shadingShiftTexture,
            this.matcapTexture,
            this.rimMultiplyTexture,
            this.outlineWidthMultiplyTexture,
            this.uvAnimationMaskTexture,
        ].filter((texture) => texture !== null) as BaseTexture[];
    }
}
