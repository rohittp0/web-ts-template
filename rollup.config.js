import typescript from "rollup-plugin-typescript2";
import {terser} from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import cleaner from "rollup-plugin-cleaner";
import commonjs from "@rollup/plugin-commonjs";
import replace from '@rollup/plugin-replace';
import workbox from 'rollup-plugin-workbox-inject';
import glob from "glob";
import path from "path";

const SCRIPTS_FOLDER = "scripts";
const SERVICE_WORKER_NAME = "service-worker.ts"

console.log(`Building for ${process.env.NODE_ENV} environment`)

const plugins = 
[ 
    resolve({ extensions: [".ts",".js"], browser: true }), 
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

const insert = (arr, index, newItem) => [ ...arr.slice(0, index), newItem, ...arr.slice(index) ];

function getConfig(root,dir)
{
    const plugins_sw = insert(plugins,plugins.indexOf(typescript())+1,
         workbox({ globDirectory: dir ,globPatterns: [ '../*' ] }));
    const input = glob.sync(`${path.join(root,SCRIPTS_FOLDER)}/*.ts`)
    const input_sw = path.join(root,SERVICE_WORKER_NAME);

    const watch = { exclude: 'node_modules/**' };

    return [
        {
            input, output: { dir, format: "cjs", sourcemap: "inline" }, plugins , watch
        },
        {
            input: input_sw, output: { dir, format: "cjs", sourcemap: "external" }, plugins: plugins_sw, watch
        }
    ];
}

export default 
[
    ...getConfig("src","dist/js")
];
