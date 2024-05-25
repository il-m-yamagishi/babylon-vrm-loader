import { resolve } from "node:path";
import { defineConfig } from "vite";
import { externalizeDeps } from "vite-plugin-externalize-deps";

export default defineConfig({
    plugins: [
        externalizeDeps(),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src", "index.ts"),
            name: "MToonPluginMaterial",
            fileName: "babylon-mtoon-plugin-material",
        },
    },
});
