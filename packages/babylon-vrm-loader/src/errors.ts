/**
 * @license Apache-2.0
 * @author Masaru Yamagishi
 */

/**
 * Throws when mandatory bone could not find
 */
export class BoneNotFoundError extends Error {
    public override readonly name = "BoneNotFoundError";

    public constructor(public readonly boneName: string) {
        super(`Bone:${boneName} NotFound`);
    }
}
