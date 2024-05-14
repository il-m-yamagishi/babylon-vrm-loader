/**
 * Babylon.js MToon Material Defines
 * @license MIT
 * @author Masaru Yamagishi
 */

import { MaterialDefines } from '@babylonjs/core/Materials/materialDefines';

/**
 * MToon specific material defines
 */
export class MToonMaterialDefines extends MaterialDefines {
    /** @see ./shaders/light-fragment.frag */
    public readonly CUSTOMUSERLIGHTING = true;
    public readonly NDOTL = true;

    // MToon Specific
    public MTOON_OUTLINE_WIDTH_WORLD = false;
    public MTOON_OUTLINE_WIDTH_SCREEN = false;
    public MTOON_DEBUG_NORMAL = false;
    public MTOON_DEBUG_LITSHADERRATE = false;

    // MToon textures
    public SHADE_MULTIPLY = false;
    public SHADE_MULTIPLYDIRECTUV = 0;
    public SHADING_SHIFT = false;
    public SHADING_SHIFTDIRECTUV = 0;
    public MATCAP = false;
    public MATCAPDIRECTUV = 0;
    public RIM_MULTIPLY = false;
    public RIM_MULTIPLYDIRECTUV = 0;
    public OUTLINE_WIDTH_MULTIPLY = false;
    public OUTLINE_WIDTH_MULTIPLYDIRECTUV = 0;
    public UV_ANIMATION_MASK = false;
    public UV_ANIMATION_MASKDIRECTUV = 0;

    /**
     * @inheritdoc
     */
    constructor(externalProperties?: { [name: string]: { type: string; default: any } }) {
        super(externalProperties);
        this.rebuild();
    }
}
