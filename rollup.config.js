/* eslint-disable no-undef */
import typescript from "rollup-plugin-typescript2";
import workbox from "rollup-plugin-workbox-inject";
import purgecss from "@fullhuman/postcss-purgecss";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copyAssets from "postcss-copy-assets";
import replace from "@rollup/plugin-replace";
import postcss from "rollup-plugin-postcss";
import copy from "rollup-plugin-copy";
import glob from "glob";
import path from "path";
import
{
	build_tree,
	format,
	replace_values,
}
from "./config.js";
import
{
	terser
}
from "rollup-plugin-terser";
import htmlPlugin from "./rollup-plugins/html-plugin.js";

const env = JSON.stringify(process.env.NODE_ENV || "production");
replace_values["process.env.NODE_ENV"] = env;

console.log(`Building for ${env} environment`);

const PLUGINS = [
	resolve(
	{
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
function getSWConfig(globDirectory, globPatterns, input, file)
{
	const plugins = insert(PLUGINS, PLUGINS.indexOf(typescript()) + 1, workbox(
	{
		globDirectory,
		globPatterns
	}));
	return {
		input,
		output:
		{
			file,
			format,
			sourcemap: env !== JSON.stringify("production") ? "external" : null
		},
		plugins,
		watch
	};
}

/**
 * @param {string} src
 * @param {string} dir
 */
function getTSConfig(src, dir)
{
	return {
		input: glob.sync(`${src}/*.ts`),
		output:
		{
			dir,
			format,
			sourcemap: env !== JSON.stringify("production") ? "inline" : null
		},
		plugins: PLUGINS,
		watch
	};
}

/**
 * @param {string} src
 * @param {string} dir
 * @param {string} distRoot
 */
function getSCSSConfig(distRoot, src, dir)
{
	const content = [];
	glob.sync(`${distRoot}/*.html`)
		.forEach((file) => content.push(path.resolve(file)));

	return {
		input: glob.sync(`${src}/*.scss`),
		output:
		{
			dir,
			format,
			sourcemap: env !== JSON.stringify("production") ? "inline" : null
		},
		plugins: [
			postcss(
			{
				extract: true,
				minimize: true,
				extensions: ["scss", "css"],
				sourceMap: env !== JSON.stringify("production") ? "inline" : false,
				plugins: [
					purgecss(
					{
						content,
						keyframes: true,
						fontFace: true
					}),
					copyAssets({ base: distRoot })
				]
			})
		],
		watch
	};
}

function getHTMLConfig(src, dist, css, js, image)
{

	return {
		input: glob.sync(`${src}/*.html`),
		plugins: [
			copy(
			{
				targets: [
					{
						src: "src/common/*.*",
						dest: dist
				}]
			}),
			htmlPlugin(
			{
				dist,
				css,
				js,
				image
			})
		],
		watch
	};
}

const exportArray = [];

build_tree.forEach(entry => exportArray.push(
	getTSConfig(entry.src_ts, entry.dist_js),
	getSWConfig(entry.dist_root, entry.precache,
		path.join(entry.src_root, `${entry.sw}.ts`),
		path.join(entry.dist_root, `${entry.sw}.js`)),
	getSCSSConfig(entry.dist_root, entry.src_scss, entry.dist_css),
	getHTMLConfig(entry.src_root, entry.dist_root,
		entry.dist_css, entry.dist_js, entry.dist_image)));

export default exportArray;
