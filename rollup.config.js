import typescript from "rollup-plugin-typescript2";
import {terser} from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import clean from "rollup-plugin-clean";

const extensions = [".ts",".js"];
let plugins = [ clean(), typescript(), resolve({ extensions}),
                    babel({ extensions, exclude: "node_modules/**"}, ) ];

if( process.env.PRODUCTION )                    
        plugins = plugins.concat([ terser() ]);

export default [{
    input: [
        "src/scripts/index.ts"
    ],
    output: {
        dir: "dist/js",
        format: "cjs",
        sourcemap: "inline",
    },
    plugins
}];
