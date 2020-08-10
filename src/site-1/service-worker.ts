import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from "workbox-precaching";
import { registerRoute, setDefaultHandler, setCatchHandler } from "workbox-routing";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { setCacheNameDetails } from "workbox-core";

setCacheNameDetails({ prefix: "__APP_NAME__", suffix: "__APP_VERSION__" });

precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

registerRoute(
	({ request }) => request.destination === "script" ||
		request.destination === "style",
	new StaleWhileRevalidate({
		plugins: [
			new BackgroundSyncPlugin("script-queue", {})
		]
	}));

registerRoute(
	({ request }) => request.destination === "image" ||
		request.destination === "audio" ||
		request.destination === "video" ||
		request.destination === "font",
	new CacheFirst({
		cacheName: "images",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 60,
				maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
				// Automatically cleanup if quota is exceeded.
				purgeOnQuotaError: true,
			}),
		],
	})
);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
	({ url }) => url.origin === "https://fonts.googleapis.com",
	new StaleWhileRevalidate({
		cacheName: "google-fonts-stylesheets",
	})
);

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
	({ url }) => url.origin === "https://fonts.gstatic.com",
	new CacheFirst({
		cacheName: "google-fonts-webfonts",
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200],
			}),
			new ExpirationPlugin({
				maxAgeSeconds: 60 * 60 * 24 * 365,
				maxEntries: 30,
			}),
		],
	})
);

// Use a stale-while-revalidate strategy for all other requests.
setDefaultHandler(new StaleWhileRevalidate());

// This "catch" handler is triggered when any of the other routes fail to
// generate a response.
setCatchHandler(async (options) =>
{
	const fallbacks: { [key: string]: string; } = {
		document: "__FALLBACK_HTML_URL__",
		image: "__FALLBACK_IMAGE_URL__",
		font: "__FALLBACK_FONT_URL__"
	};

	return (options.event?.request.destination &&
		fallbacks[options.event.request.destination] &&
		await matchPrecache(fallbacks[options.event.request.destination])) ||
		Response.error();
});
