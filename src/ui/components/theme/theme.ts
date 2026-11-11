export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "paper-theme";
const THEME_CHANGE_EVENT = "paper-theme-change";

/** Runs before paint so a saved preference never flashes the light palette. */
export const themeInitializationScript = `(function(){try{document.documentElement.dataset.theme=localStorage.getItem("${THEME_STORAGE_KEY}")==="dark"?"dark":"light"}catch{document.documentElement.dataset.theme="light"}})()`;

export function getTheme(): Theme {
	return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function setTheme(theme: Theme) {
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		// The toggle still works when storage is unavailable (e.g. private browsing).
	}
	window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function subscribeToTheme(onChange: () => void) {
	const onStorage = (event: StorageEvent) => {
		if (event.key === THEME_STORAGE_KEY || event.key === null) {
			document.documentElement.dataset.theme = event.newValue === "dark" ? "dark" : "light";
			onChange();
		}
	};
	window.addEventListener(THEME_CHANGE_EVENT, onChange);
	window.addEventListener("storage", onStorage);
	return () => {
		window.removeEventListener(THEME_CHANGE_EVENT, onChange);
		window.removeEventListener("storage", onStorage);
	};
}
