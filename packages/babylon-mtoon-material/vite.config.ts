import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src", "index.ts"),
            name: "MToonMaterial",
            fileName: "babylon-mtoon-material",
        },
        rollupOptions: {
            external: ["@babylonjs/core"],
            output: {
                globals: {
                    "@babylonjs/core": "BABYLON",
                },
            },
        },
    },
});
