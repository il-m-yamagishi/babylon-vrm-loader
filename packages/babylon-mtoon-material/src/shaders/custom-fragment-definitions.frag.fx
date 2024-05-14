#define inline
float linearstep(float a, float b, float t) {
    return clamp((t - a) / (b - a), 0.0, 1.0);
}

vec3 computeCustomDiffuseLighting(lightingInfo info, vec3 diffuseBase, float shadow) {
    // ndl is dot(Normal, LightDir) * 0.5 + 0.5
    float shading = info.ndl * 2.0 - 1.0; // [-1.0, 1.0]
    shading += shadingShiftFactor;
#ifdef SHADING_SHIFT
    shading += texture2D(shadingShiftSampler, vShadingShiftUV).r * vShadingShiftInfos.y * vShadingShiftInfos.z;
#endif
    shading = linearstep( -1.0 + shadingToonyFactor, 1.0 - shadingToonyFactor, shading);

    vec3 baseColor = vec3(1., 0., 0.);
    vec3 shadeColor = vec3(0., 1., 0.);

    return mix(baseColor, shadeColor, shading).rgb * shadow;
}

vec3 computeCustomSpecularLighting(lightingInfo info, vec3 specularBase, float shadow) {
    // Disables specular lighting
    return vec3(0.);
}
