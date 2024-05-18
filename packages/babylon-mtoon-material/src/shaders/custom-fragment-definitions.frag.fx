#include<samplerFragmentDeclaration>(_DEFINENAME_,SHADE_MULTIPLY,_VARYINGNAME_,ShadeMultiply,_SAMPLERNAME_,shadeMultiply)
#include<samplerFragmentDeclaration>(_DEFINENAME_,SHADING_SHIFT,_VARYINGNAME_,ShadingShift,_SAMPLERNAME_,shadingShift)
#include<samplerFragmentDeclaration>(_DEFINENAME_,MATCAP,_VARYINGNAME_,MatCap,_SAMPLERNAME_,matcap)
#include<samplerFragmentDeclaration>(_DEFINENAME_,RIM_MULTIPLY,_VARYINGNAME_,RimMultiply,_SAMPLERNAME_,rimMultiply)
#include<samplerFragmentDeclaration>(_DEFINENAME_,OUTLINE_WIDTH_MULTIPLY,_VARYINGNAME_,OutlineWidthMultiply,_SAMPLERNAME_,outlineWidthMultiply)
#include<samplerFragmentDeclaration>(_DEFINENAME_,UV_ANIMATION_MASK,_VARYINGNAME_,UvAnimationMask,_SAMPLERNAME_,uvAnimationMask)




#define inline
float linearstep(float a, float b, float t) {
    return clamp((t - a) / (b - a), 0., 1.);
}

/**
 * @see https://github.com/BabylonJS/Babylon.js/blob/master/packages/dev/core/src/Shaders/ShadersInclude/lightsFragmentFunctions.fx
 */
lightingInfo computeMToonLighting(vec3 viewDirectionW, vec3 vNormal, vec4 lightData, vec3 diffuseColor, vec3 specularColor, float range, float glossiness) {
    lightingInfo result;

    vec3 lightVectorW;
    float attenuation = 1.;
    if (lightData.w == 0.) {
        vec3 direction = lightData.xyz - vPositionW;

        attenuation = max(0., 1. - length(direction) / range);
        lightVectorW = normalize(direction);
    } else {
        lightVectorW = normalize(-lightData.xyz);
    }
    result.diffuse = diffuseColor * attenuation;

    // NdotL must be active for calculating the shading factor and [-1.0, 1.0]
    result.ndl = dot(vNormal, lightVectorW);

    return result;
}

lightingInfo computeMToonSpotLighting(vec3 viewDirectionW, vec3 vNormal, vec4 lightData, vec4 lightDirection, vec3 diffuseColor, vec3 specularColor, float range, float glossiness) {
    lightingInfo result;
    vec3 direction = lightData.xyz - vPositionW;
    vec3 lightVectorW = normalize(direction);
    float attenuation = max(0., 1. - length(direction) / range);

    float cosAngle = max(0., dot(lightDirection.xyz, -lightVectorW));

    if (cosAngle >= lightDirection.w) {
        cosAngle = max(0., pow(cosAngle, lightData.w));
        attenuation *= cosAngle;

        result.diffuse = diffuseColor.rgb * attenuation;

        return result;
    }

    result.diffuse = vec3(0.);

    // out of range
    return result;
}

lightingInfo computeMToonHemisphericLighting(vec3 viewDirectionW, vec3 vNormal, vec4 lightData, vec3 diffuseColor, vec3 specularColor, vec3 groundColor, float glossiness) {
    lightingInfo result;

    float ndotl = dot(vNormal, lightData.xyz);
    result.diffuse = vec3(ndotl);
    return result;
}



vec3 computeCustomDiffuseLighting(lightingInfo info, vec3 diffuseBase, float shadow) {
    // return info.diffuse;
    // info.ndl is dot(Normal, LightDir) * 0.5 + 0.5
    float shading = info.ndl; // [-1.0, 1.0]

    // calculate shadingShiftFactor
    shading += shadingShiftFactor;
#ifdef SHADING_SHIFT
    shading += texture2D(shadingShiftSampler, vShadingShiftUV).r * vShadingShiftInfos.y * vShadingShiftInfos.z;
#endif
    shading = linearstep(-1. + shadingToonyFactor, 1. - shadingToonyFactor, shading);
    shading *= shadow; // apply shadow

    // calculate diffuse color
    vec3 diffuse = vDiffuseColor.rgb * info.diffuse.rgb;
#ifdef DIFFUSE
    diffuse *= texture2D(diffuseSampler, vDiffuseUV).rgb * vDiffuseInfos.y;
#endif

    // calculate shade color
    vec3 shadeMultiply = shadeColorFactor;
#ifdef SHADE_MULTIPLY
    shadeMultiply *= texture2D(shadeMultiplySampler, vShadeMultiplyUV).rgb * vShadeMultiplyInfos.y;
#endif

    return mix(shadeMultiply, diffuse, shading);
}

vec3 computeCustomSpecularLighting(lightingInfo info, vec3 diffuseBase, float shadow) {
    // disables specular lighting
    return vec3(0.);
}
