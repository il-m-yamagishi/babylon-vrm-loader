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
    public readonly CUSTOMUSERLIGHTING = false;

    // MToon Specific
    public MTOON_OUTLINE_WIDTH_WORLD = false;
    public MTOON_OUTLINE_WIDTH_SCREEN = false;
    public MTOON_OUTLINE_COLOR_FIXED = false;
    public MTOON_OUTLINE_COLOR_MIXED = false;
    public MTOON_DEBUG_NORMAL = false;
    public MTOON_DEBUG_LITSHADERRATE = false;

    // MToon textures
    public SHADE = false;
    public SHADEDIRECTUV = 0;
    public RECEIVE_SHADOW = false;
    public RECEIVE_SHADOWDIRECTUV = 0;
    public SHADING_GRADE = false;
    public SHADING_GRADEDIRECTUV = 0;
    public RIM = false;
    public RIMDIRECTUV = 0;
    public MATCAP = false;
    public MATCAPDIRECTUV = 0;
    public OUTLINE_WIDTH = false;
    public OUTLINE_WIDTHDIRECTUV = 0;
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
