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
    result.ndl = -1.;
    return result;
}

lightingInfo computeMToonHemisphericLighting(vec3 viewDirectionW, vec3 vNormal, vec4 lightData, vec3 diffuseColor, vec3 specularColor, vec3 groundColor, float glossiness) {
    lightingInfo result;

    result.diffuse = diffuseColor;
    result.ndl = dot(vNormal, lightData.xyz);

    return result;
}



#define inline
float linearstep(float a, float b, float t) {
    return clamp((t - a) / (b - a), 0., 1.);
}
vec4 computeCustomDiffuseLighting(lightingInfo info, vec3 diffuseBase, float shadow) {
    float shading = info.ndl; // [-1.0, 1.0]
    shading += shadingShiftFactor;
#ifdef SHADING_SHIFT
    shading += texture2D(shadingShiftSampler, vShadingShiftUV).r * vShadingShiftInfos.y * vShadingShiftInfos.z;
#endif
    shading = linearstep(-1. + shadingToonyFactor, 1. - shadingToonyFactor, shading);

    vec3 color = mix(vec3(0.), info.diffuse.rgb * shadow, shading);

    return vec4(color, shading);
}

vec3 computeCustomSpecularLighting(lightingInfo info, vec3 specularBase, float shadow) {
    // disables specular lighting
    return vec3(0.);
}



/**
 * Compute MToon final color
 * @param viewDirectionW vEyePosition.xyz - vPositionW
 * @param normalW vNormalW
 * @param lightColor Light color attenuation(w is shading)
 * @param diffuseColor vDiffuseColor.rgb
 * @param baseColor baseColor.rgb
 * @param emissiveColor vEmissiveColor.rgb + emissiveSampler
 */
vec3 computeMToonFinalDiffuse(
    vec3 viewDirectionW,
    vec3 normalW,
    vec4 lightColor,
    vec3 diffuseColor,
    vec3 baseColor,
    vec3 emissiveColor
) {
    // Calculate shading factor
    float shading = lightColor.w; // [-1.0, 1.0]

    vec3 litColor = diffuseColor;
#ifdef DIFFUSE
    litColor *= texture2D(diffuseSampler, vDiffuseUV).rgb * vDiffuseInfos.y;
#endif

    // calculate shade color
    vec3 shadeColor = shadeColorFactor;
#ifdef SHADE_MULTIPLY
    shadeColor *= texture2D(shadeMultiplySampler, vShadeMultiplyUV).rgb * vShadeMultiplyInfos.y;
#endif

    shadeColor = mix(shadeColor, vec3(0.), shading);

    // rim and matcap
    vec3 rim = vec3(0.);
#ifdef MATCAP
    vec3 worldViewX = normalize(vec3(viewDirectionW.z, 0.0, -viewDirectionW.x));
    vec3 worldViewY = cross(viewDirectionW, worldViewX);
    vec2 matcapUv = vec2(dot(worldViewX, normalW), dot(worldViewY, normalW)) * 0.495 + 0.5;
    rim = matcapFactor * texture2D(matcapSampler, matcapUv).rgb * vMatcapInfos.y;
#endif
    float parametricRim = clamp(1.0 - dot(normalW, viewDirectionW) + parametricRimLiftFactor, 0.0, 1.0);
    parametricRim = pow(parametricRim, max(parametricRimFresnelPowerFactor, 0.00001));
    rim = rim + parametricRim * parametricRimColorFactor;
#ifdef RIM
    rim = rim + texture2D(rimMultiplySampler, vRimMultiplyUV).rgb * vRimMultiplyInfos.y;
#endif
    rim = rim * mix(vec3(1.0), litColor + shadeColor, rimLightingMixFactor);

    vec3 diffuse = litColor * lightColor.rgb + shadeColor + rim;

    // Composition
#ifdef EMISSIVEASILLUMINATION
    vec3 color = clamp(diffuse + vAmbientColor, 0.0, 1.0) * baseColor.rgb;
#else
#ifdef LINKEMISSIVEWITHDIFFUSE
    vec3 color = clamp((diffuse + emissiveColor) + vAmbientColor, 0.0, 1.0) * baseColor.rgb;
#else
    vec3 color = clamp(diffuse + emissiveColor + vAmbientColor, 0.0, 1.0) * baseColor.rgb;
#endif



    return color;
}
