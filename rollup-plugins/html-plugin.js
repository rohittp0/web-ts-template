/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import path from "path";
import fs from "fs";
import cherio from "cheerio";
import hash from "md5-file";

export default (
{
	dist,
	css,
	js,
	image,
}) =>
{
	/**
	 * @param {{ [x: string]: any; }} obj
	 * @param {{ (file: any): any; (arg0: any): unknown; }} predicate
	 */
	const filter = (obj, predicate) => Object.keys(obj)
		.filter((key) => predicate(obj[key]))
		.reduce((res, key) => (res.push(obj[key]), res), []);

	const imgReg = /\.(a?png|bmp|gif|ico|cur|p?jpe?g|jfif|pjp|svg|tiff?|webp)$/i;
	const webReg = /^https?:\/\//i;

	/**
	 * @param {string} url
	 * @param {string} folder
	 */
	function copy(url, folder)
	{
		if (!fs.existsSync(url))
		{
			console.warn("\x1b[33m", `(!) Copy ${url} ➡️ ${folder} failed.\n`,
				`\x1b[1m\x1b[4m${url}\x1b[0m\x1b[33m was not found.`, "\x1b[0m\n");
			return url;
		}

		const dest = path.join(folder, `${hash.sync(url)}${path.extname(url)}`);

		if (fs.existsSync(dest)) return dest;
		else
			fs.copyFileSync(url, dest);

		return dest;
	}

	/**
	 * @param {{ [x: string]: any; }} object
	 * @param {any} val
	 */
	function deleteByValue(object, val)
	{
		for (const obj in object)
			if (Object.prototype.hasOwnProperty.call(object, obj) && object[obj] === val)
				delete object[obj];
	}

	/**
	 * @param {string} url
	 */
	function resolveURL(url)
	{
		if (webReg.test(url))
			return url;
		if (url.endsWith(".ts"))
			return path.join(js, path.basename(url).replace(".ts", ".js"));
		if (url.endsWith(".scss"))
			return path.join(css, path.basename(url).replace(".scss", ".css"));
		if (url.endsWith(".html"))
			return path.join(dist, path.basename(url));
		if (url.endsWith(".js"))
			return copy(url, js);
		if (url.endsWith(".css"))
			return copy(url, css);
		if (imgReg.test(url))
			return copy(url, image);
		return copy(url, dist);
	}

	return {
		name: "html-plugin",

		/**
		 * @param {string} id
		 */
		resolveID(id)
		{
			return id.endsWith(".html") ? path.resolve(id) : undefined;
		},

		/**
		 * @param {string} id
		 */
		load(id)
		{
			return id.endsWith(".html") ? "export default ''" : undefined;
		},

		/**
		 * @param {any} _options
		 * @param {any} bundle
		 */
		async generateBundle(_options, bundle)
		{
			fs.mkdirSync(path.resolve(dist), { recursive: true });
			fs.mkdirSync(path.resolve(css), { recursive: true });
			fs.mkdirSync(path.resolve(js), { recursive: true });
			fs.mkdirSync(path.resolve(image), { recursive: true });

			return await Promise.all(
				/**
				 * @param {{ facadeModuleId: string; }} file
				 */
				/**
				 * @param {{ facadeModuleId: string; }} file
				 */
				/**
				 * @param {{ facadeModuleId: string; }} file
				 */
				filter(bundle, (file) => file.facadeModuleId.endsWith(".html"))
				.map((html) => new Promise((resolve) =>
				{
					deleteByValue(bundle, html);
					let code = fs.readFileSync(html.facadeModuleId).toString();
					const $ = cherio.load(code);

					new Set([...$("link").map((_, e) => e.attribs.href).get(),
                  ...$("script").map((_, e) => e.attribs.src).get(),
                  ...$("img").map((_, e) => e.attribs.src).get(),
                  ...$("a").map((_, e) => e.attribs.href).get()])
						.forEach((url) =>
						{
							code = code.split(url)
								.join(resolveURL(path.resolve(path.dirname(html.facadeModuleId),
									url)));
						});
					fs.writeFileSync(path.resolve(path.join(dist,
						path.basename(html.facadeModuleId))), code);
					resolve();
				})),
			);
		},
	};
};
