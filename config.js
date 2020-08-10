import {
	name,
	version
} from "./package.json";

export const build_tree = [{
	src_root: "src/site-1",
	src_ts: "src/site-1/scripts",
	src_scss: "src/site-1/scss",
	dist_root: "dist/site-1",
	dist_js: "dist/site-1/js",
	dist_css: "dist/site-1/css",
	sw: "service-worker",
	precache: ["index.html"]
}];

const replace_values_global = {
	"__FALLBACK_HTML_URL__": "",
	"__FALLBACK_IMAGE_URL__": "",
	"__FALLBACK_FONT_URL__": "",
};

export const format = "cjs";

for (let index = 0; index < build_tree.length; index++)
	replace_values_global[`__SERVICE_WORKER_URL_${index}__`] = `${build_tree[index].sw}.js`;

export const replace_values = replace_values_global;

export const props = {
	name,
	version
};