/* eslint-disable no-undef */
import typescript from "rollup-plugin-typescript2";
import workbox from "rollup-plugin-workbox-inject";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import cleaner from "rollup-plugin-cleaner";
import glob from "glob";
import path from "path";
import {
	build_tree,
	format,
	replace_values
} from "./config";
import {
	terser
} from "rollup-plugin-terser";

const env = JSON.stringify(process.env.NODE_ENV || "production");
replace_values["process.env.NODE_ENV"] = env;

console.log(`Building for ${env} environment`);

const PLUGINS = [
	resolve({
		extensions: [".ts", ".js"],
		browser: true
	}),
	replace(replace_values),
	commonjs(),
	typescript()
];

if (env === JSON.stringify("production"))
	PLUGINS.push(terser());

/**
 * @param {string | any[]} arr
 * @param {number} index
 * @param {any} newItem
 */
const insert = (arr, index, newItem) => [...arr.slice(0, index), newItem, ...arr.slice(index)];
const watch = {
	exclude: "node_modules/**"
};

/**
 * @param {string} globDirectory
 * @param {string[]} globPatterns
 * @param {string} input
 * @param {string} file
 */
function getSWConfig(globDirectory, globPatterns, input, file) {
	const plugins = insert([cleaner({
		targets: [file, `${file}.map`]
	}), ...PLUGINS], PLUGINS.indexOf(typescript()) + 1, workbox({
		globDirectory,
		globPatterns
	}));
	return {
		input,
		output: {
			file,
			format,
			sourcemap: env !== JSON.stringify("production") ? "external" : null
		},
		plugins,
		watch
	};
}

/**
 * @param {string} root
 * @param {string} dir
 */
function getTSConfig(root, dir) {
	const plugins = [cleaner({
		targets: [dir]
	}), ...PLUGINS];
	const input = glob.sync(`${root}/*.ts`);

	return {
		input,
		output: {
			dir,
			format,
			sourcemap: env !== JSON.stringify("production") ? "inline" : null
		},
		plugins,
		watch
	};
}

const exportArray = [];

build_tree.forEach(entry => exportArray.push(
	getTSConfig(entry.src_ts, entry.dist_js),
	getSWConfig(entry.dist_root, entry.precache,
		path.join(entry.src_root, `${entry.sw}.ts`),
		path.join(entry.dist_root, `${entry.sw}.js`))));

export default exportArray;