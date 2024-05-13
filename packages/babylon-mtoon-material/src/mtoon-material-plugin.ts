/**
 * MToonMaterial plugin
 * @license MIT
 * @author Masaru Yamagishi
 */

import { MaterialPluginBase } from "@babylonjs/core/Materials/materialPluginBase";

/**
 * MToon は日本のアニメ的表現をすることを目標としています。
 * 主色 (Lit Color) と陰色 (Shade Color) の 2 色を、Lighting パラメータや光源環境に応じて混合することでそれを実現します。
 * VRM での出力パラメータとプロパティのマッピングは下記となります。
 *
 * MToon aims for making Japanese anime expressions.
 * It is achieved by mixing Lit Color and Shade Color based on Lighting parameters and light source environment.
 *
 * @see https://github.com/Santarh/MToon/
 * @see https://vrm.dev/univrm/shaders/shader_mtoon/
 */
export class MToonMaterialPlugin extends MaterialPluginBase {

}
