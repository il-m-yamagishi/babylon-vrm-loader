mtoonDiffuse += computeCustomDiffuseLighting(info, diffuseBase, shadow);

#ifdef CLEARCOAT
    clearCoatBase += info.clearCoat.rgb * shadow;
#endif
#ifdef SHEEN
    sheenBase += info.sheen.rgb * shadow;
#endif
