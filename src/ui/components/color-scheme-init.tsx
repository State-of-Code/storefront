"use client";

import { useLayoutEffect } from "react";
import { applyColorScheme, COLOR_SCHEME_STORAGE_KEY, preferredColorScheme } from "@/lib/color-scheme";

/** Shared by all root layouts; no cookies/headers, so the static/PPR shell stays cacheable. */
export function ColorSchemeInit() {
	useLayoutEffect(() => {
		const sync = () => applyColorScheme(preferredColorScheme());
		const onStorage = (event: StorageEvent) => {
			if (event.key === COLOR_SCHEME_STORAGE_KEY || event.key === null) sync();
		};
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		sync();
		media.addEventListener("change", sync);
		window.addEventListener("storage", onStorage);
		return () => {
			media.removeEventListener("change", sync);
			window.removeEventListener("storage", onStorage);
		};
	}, []);

	return null;
}
