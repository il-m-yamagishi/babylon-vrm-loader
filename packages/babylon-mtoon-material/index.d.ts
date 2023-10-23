// Declare GLSL text files as string
declare module "*.vert" {
    const shaderString: string
    export default shaderString
}
declare module "*.frag" {
    const shaderString: string
    export default shaderString
}

/// <reference path="vite/client" />
