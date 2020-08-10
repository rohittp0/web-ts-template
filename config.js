import {
	name,
	version
} from "./package.json";

export const build_tree = [{
	src_root: "src",
	src_ts: "src/scripts",
	dist_root: "dist",
	dist_js: "dist/js",
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