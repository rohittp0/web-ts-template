import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { setCacheNameDetails } from "workbox-core";

setCacheNameDetails({ prefix: "__APP_NAME__", suffix: "__APP_VERSION__" });

precacheAndRoute(self.__WB_MANIFEST || []);

registerRoute(({ request }) => request.destination === "script", new NetworkFirst());

registerRoute(({ request }) => request.destination === "image",
	new CacheFirst({
		cacheName: "images",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 60,
				maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
			}),
		],
	}),
);
