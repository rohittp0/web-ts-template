import typescript from "rollup-plugin-typescript2";
import {terser} from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import cleaner from "rollup-plugin-cleaner";
import commonjs from "@rollup/plugin-commonjs";
import replace from '@rollup/plugin-replace';
import workboxInjectManifest from 'rollup-plugin-workbox-inject';
import glob from "glob";
import path from "path";

const SCRIPTS_FOLDER = "scripts";
const SERVICE_WORKER_NAME = "service-worker.ts"

console.log(`Building for ${process.env.NODE_ENV} environment`)

const plugins = 
[ 
    resolve({ extensions: [".ts",".js",".node",".json"], browser: true }), 
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

function getConfig(root,dir)
{
    const plugins_sw = plugins.splice(
        workboxInjectManifest({ globDirectory: dir ,globPatterns: [ '**/index.{html,css,js}' ] }));
    const input = glob.sync(`${path.join(root,SCRIPTS_FOLDER)}/*.ts`)
    const input_sw = path.join(root,SERVICE_WORKER_NAME);

    const watch = { exclude: 'node_modules/**' };

    return [
        {
            input, output: { dir, format: "esm", sourcemap: "inline" }, plugins , watch
        },
        {
            input: input_sw, output: { dir, format: "esm", sourcemap: "inline" }, plugins: plugins_sw, watch
        }
    ];
}

export default 
[
    ...getConfig("src","dist/js")
];
