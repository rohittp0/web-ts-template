import typescript from "rollup-plugin-typescript2";
import workbox from "rollup-plugin-workbox-inject";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import {
	build_tree,
	format
} from "./config";
import {
	terser
} from "rollup-plugin-terser";
import replace from "@rollup/plugin-replace";
import cleaner from "rollup-plugin-cleaner";
import glob from "glob";
import path from "path";

console.log(`Building for ${process.env.NODE_ENV} environment`)

const PLUGINS = [
	resolve({
		extensions: [".ts", ".js"],
		browser: true
	}),
	replace({
		"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production")
	}),
	commonjs(),
	typescript()
];

if (process.env.NODE_ENV === "production")
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
		targets: [file]
	}), ...PLUGINS], PLUGINS.indexOf(typescript()) + 1, workbox({
		globDirectory,
		globPatterns
	}));
	return {
		input,
		output: {
			file,
			format,
			sourcemap: "external"
		},
		plugins,
		watch
	}
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
			sourcemap: "inline"
		},
		plugins,
		watch
	}
}

const exportArray = [];

build_tree.forEach(entry => exportArray.push(
	getTSConfig(entry.src_ts, entry.dist_js),
	getSWConfig(entry.dist_root, entry.precache,
		path.join(entry.src_root, `${entry.sw}.ts`),
		path.join(entry.dist_root, `${entry.sw}.js`))));

export default exportArray;