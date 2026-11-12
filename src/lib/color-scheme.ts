export type ColorScheme = "light" | "dark";

export const COLOR_SCHEME_STORAGE_KEY = "paper-color-scheme";
export const COLOR_SCHEME_EVENT = "paper-color-scheme-change";

export function resolveColorScheme(stored: string | null, prefersDark: boolean): ColorScheme {
	return stored === "light" || stored === "dark" ? stored : prefersDark ? "dark" : "light";
}

export function preferredColorScheme(): ColorScheme {
	let stored: string | null = null;
	try {
		stored = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
	} catch {
		// Private browsing and storage policies must not prevent theme switching.
	}
	return resolveColorScheme(stored, window.matchMedia("(prefers-color-scheme: dark)").matches);
}

export function applyColorScheme(theme: ColorScheme) {
	document.documentElement.dataset.theme = theme;
	window.dispatchEvent(new Event(COLOR_SCHEME_EVENT));
}

export function setColorScheme(theme: ColorScheme) {
	applyColorScheme(theme);
	try {
		window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, theme);
	} catch {
		// The choice still works for this document when persistence is unavailable.
	}
}

export function subscribeColorScheme(onChange: () => void) {
	window.addEventListener(COLOR_SCHEME_EVENT, onChange);
	return () => window.removeEventListener(COLOR_SCHEME_EVENT, onChange);
}

export function isDarkColorScheme() {
	return document.documentElement.dataset.theme === "dark";
}

export function serverIsDarkColorScheme() {
	return false;
}

/** Static, trusted script: no request data is interpolated. Runs before body paint. */
export const COLOR_SCHEME_SCRIPT = `(function(){var stored=null;try{stored=localStorage.getItem("${COLOR_SCHEME_STORAGE_KEY}")}catch{}document.documentElement.dataset.theme=stored==="light"||stored==="dark"?stored:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"})()`;
