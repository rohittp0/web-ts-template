import typescript from "rollup-plugin-typescript2";
import {terser} from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

let extensions = [".ts",".js"];

export default [{
    input: [
        "src/scripts/index.ts"
    ],
    output: {
        dir: "dist/js",
        format: "cjs",
        sourcemap: "inline",
    },
    plugins: [
        typescript(),
        commonjs({ extensions }),
        resolve({ extensions}),
        babel({
            extensions,
            include: ["src/scripts/*"],
            exclude: "node_modules/**",
            babelHelpers: "bundled"
        }),
        terser()
    ]
}];
