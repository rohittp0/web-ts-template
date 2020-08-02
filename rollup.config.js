import typescript from 'rollup-plugin-typescript2';
import {terser} from 'rollup-plugin-terser';
import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";

export default [{
    input: [
        "src/scripts/index.ts"
    ],
    output: {
        dir: "dist/js",
        format: "es",
        sourcemap: "inline",
    },
    plugins: [
        typescript(),
        resolve({ extensions: [".ts"] }),
        babel({
            extensions: [".ts"],
            include: ['src/scripts/*'],
            exclude: "node_modules/**",
            babelHelpers: 'bundled'
        }),
        terser()
    ]
}];
