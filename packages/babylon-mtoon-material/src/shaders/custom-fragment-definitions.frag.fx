#include<samplerFragmentDeclaration>(_DEFINENAME_,SHADE_MULTIPLY,_VARYINGNAME_,ShadeMultiply,_SAMPLERNAME_,shadeMultiply)
#include<samplerFragmentDeclaration>(_DEFINENAME_,SHADING_SHIFT,_VARYINGNAME_,ShadingShift,_SAMPLERNAME_,shadingShift)
#include<samplerFragmentDeclaration>(_DEFINENAME_,MATCAP,_VARYINGNAME_,MatCap,_SAMPLERNAME_,matcap)
#include<samplerFragmentDeclaration>(_DEFINENAME_,RIM_MULTIPLY,_VARYINGNAME_,RimMultiply,_SAMPLERNAME_,rimMultiply)
#include<samplerFragmentDeclaration>(_DEFINENAME_,OUTLINE_WIDTH_MULTIPLY,_VARYINGNAME_,OutlineWidthMultiply,_SAMPLERNAME_,outlineWidthMultiply)
#include<samplerFragmentDeclaration>(_DEFINENAME_,UV_ANIMATION_MASK,_VARYINGNAME_,UvAnimationMask,_SAMPLERNAME_,uvAnimationMask)



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
        result.ndl = dot(vNormal, lightVectorW);

        return result;
    }

    // out of range
    result.diffuse = vec3(0.);
    result.ndl = 0.;
    return result;
}

lightingInfo computeMToonHemisphericLighting(vec3 viewDirectionW, vec3 vNormal, vec4 lightData, vec3 diffuseColor, vec3 specularColor, vec3 groundColor, float glossiness) {
    lightingInfo result;

    result.diffuse = diffuseColor;
    result.ndl = dot(vNormal, lightData.xyz);

    return result;
}



vec3 computeCustomDiffuseLighting(lightingInfo info, vec3 diffuseBase, float shadow) {
    float shading = info.ndl; // [-1.0, 1.0]

    shading = shading * 0.5 + 0.5; // [0.0, 1.0]

    return info.diffuse.rgb * shading * shadow;
//     float shading = info.ndl; // [-1.0, 1.0]

//     // calculate shadingShiftFactor
//     shading += shadingShiftFactor;
// #ifdef SHADING_SHIFT
//     shading += texture2D(shadingShiftSampler, vShadingShiftUV).r * vShadingShiftInfos.y * vShadingShiftInfos.z;
// #endif
//     shading = linearstep(-1. + shadingToonyFactor, 1. - shadingToonyFactor, shading);
//     shading *= shadow; // apply shadow

//     // calculate diffuse color
//     vec3 diffuse = vDiffuseColor.rgb * info.diffuse.rgb;
// #ifdef DIFFUSE
//     diffuse *= texture2D(diffuseSampler, vDiffuseUV).rgb * vDiffuseInfos.y;
// #endif

//     // calculate shade color
//     vec3 shadeMultiply = shadeColorFactor;
// #ifdef SHADE_MULTIPLY
//     shadeMultiply *= texture2D(shadeMultiplySampler, vShadeMultiplyUV).rgb * vShadeMultiplyInfos.y;
// #endif

//     return mix(shadeMultiply, diffuse, shading);
}

vec3 computeCustomSpecularLighting(lightingInfo info, vec3 diffuseBase, float shadow) {
    // disables specular lighting
    return vec3(0.);
}

#define inline
float linearstep(float a, float b, float t) {
    return clamp((t - a) / (b - a), 0., 1.);
}

/**
 * Compute MToon final color
 * @param diffuseBase Light color attenuation
 * @param diffuseColor vDiffuseColor.rgb
 * @param baseColor baseColor.rgb
 * @param emissiveColor vEmissiveColor.rgb + emissiveSampler
 * @param vAmbientColor vAmbientColor.rgb
 * @param baseAmbientColor ambientSampler
 * @param finalSpecular vSpecularColor.rgb
 * @param reflectionColor reflectionSampler
 * @param refractionColor refractionSampler
 */
vec3 computeMToonColor(
    vec3 diffuseBase,
    vec3 diffuseColor,
    vec3 baseColor,
    vec3 emissiveColor,
    vec3 vAmbientColor,
    vec3 baseAmbientColor,
    vec3 finalSpecular,
    vec3 reflectionColor,
    vec3 refractionColor
) {
    // Calculate shading factor
    float shading = max(diffuseBase.r, max(diffuseBase.g, diffuseBase.b)) * 2.0 - 1.0; // [-1.0, 1.0]
    shading += shadingShiftFactor;
#ifdef SHADING_SHIFT
    shading += texture2D(shadingShiftSampler, vShadingShiftUV).r * vShadingShiftInfos.y * vShadingShiftInfos.z;
#endif
    shading = linearstep(-1. + shadingToonyFactor, 1. - shadingToonyFactor, shading);

    vec3 litColor = diffuseColor;
#ifdef DIFFUSE
    litColor *= texture2D(diffuseSampler, vDiffuseUV).rgb * vDiffuseInfos.y;
#endif

    // calculate shade color
    vec3 shadeMultiply = shadeColorFactor;
#ifdef SHADE_MULTIPLY
    shadeMultiply *= texture2D(shadeMultiplySampler, vShadeMultiplyUV).rgb * vShadeMultiplyInfos.y;
#endif

    vec3 diffuse = mix(shadeMultiply, litColor, shading);

    // Composition
#ifdef EMISSIVEASILLUMINATION
    vec3 finalDiffuse = clamp(diffuse + vAmbientColor, 0.0, 1.0) * baseColor.rgb;
#else
    vec3 finalDiffuse = clamp((diffuse + emissiveColor) + vAmbientColor, 0.0, 1.0) * baseColor.rgb;
#endif

    // Composition
#ifdef EMISSIVEASILLUMINATION
    vec3 color = vec3(clamp(finalDiffuse * baseAmbientColor + finalSpecular + reflectionColor.rgb + emissiveColor + refractionColor.rgb, 0.0, 1.0));
#else
    vec3 color = vec3(finalDiffuse * baseAmbientColor + finalSpecular + reflectionColor.rgb + refractionColor.rgb);
#endif

//Old lightmap calculation method
#ifdef LIGHTMAP
    #ifndef LIGHTMAPEXCLUDED
        #ifdef USELIGHTMAPASSHADOWMAP
            color *= lightmapColor.rgb;
        #else
            color += lightmapColor.rgb;
        #endif
    #endif
#endif

    return color;
}
