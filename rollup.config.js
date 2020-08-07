import typescript from "rollup-plugin-typescript2";
import {terser} from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import cleaner from "rollup-plugin-cleaner";
import commonjs from "@rollup/plugin-commonjs";
import replace from '@rollup/plugin-replace';
import workboxInjectManifest from 'rollup-plugin-workbox-inject';

console.log(`Building for ${process.env.NODE_ENV} environment`)

const extensions = [".ts",".js"];
const plugins = 
[ 
    resolve({ extensions, browser: true }), 
    replace(
    {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production")
    }), 
    commonjs(), 
    typescript() 
];

if( process.env.NODE_ENV === "production" )
{
    plugins.unshift(cleaner({targets: ['dist/js']}));
    plugins.push(terser());
}

const plugins_sw = plugins.splice(
    workboxInjectManifest({
      globDirectory: BUILD_DIR,
      globPatterns: [
        '**\/*.{js,css,html,png}'
      ],
    }))

function getConfig(input,dir,plugins)
{
    return {
        input,
        output: 
        {
            dir,
            format: "esm",
            sourcemap: "inline",
        },
        plugins
    };
}

export default 
[
    getConfig(["src/index.ts"],"dist/js",plugins)
];
