float linearstep(float a, float b, float t) {
    // saturate((t - a) / (b - a))
    return clamp((t - a) / (b - a), 0.0, 1.0);
}

vec3 computeCustomDiffuseLighting(lightingInfo info, vec3 diffuseBase, float shadow) {
    // info.ndl is dot(Normal, LightDir) * 0.5 + 0.5
    float shading = info.ndl * 2.0 - 1.0; // [-1.0, 1.0]

    shading = shading + shadingShiftFactor;
#ifdef SHADING_SHIFT
    shading = shading + texture2D(shadingShiftSampler, vShadingShiftUV).r * vShadingShiftInfos.y * vShadingShiftInfos.z;
#endif
    shading = linearstep(-1. + shadingToonyFactor, 1. - shadingToonyFactor, shading);
    shading = shading * shadow;

    vec3 baseColor = vec3(1., 0., 0.);
    vec3 shadeColor = vec3(0., 0., 1.);

    return mix(shadeColor, baseColor, shading);
}

vec3 computeCustomSpecularLighting(lightingInfo info, vec3 specularBase, float shadow) {
    // Disables specular lighting
    return vec3(0.);
}
