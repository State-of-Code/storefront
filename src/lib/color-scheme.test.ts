import { runInNewContext } from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	applyColorScheme,
	COLOR_SCHEME_EVENT,
	COLOR_SCHEME_SCRIPT,
	COLOR_SCHEME_STORAGE_KEY,
	isDarkColorScheme,
	preferredColorScheme,
	resolveColorScheme,
	serverIsDarkColorScheme,
	setColorScheme,
	subscribeColorScheme,
} from "./color-scheme";

afterEach(() => vi.unstubAllGlobals());

describe("color scheme", () => {
	it.each([
		["dark", false, "dark"],
		["light", true, "light"],
		[null, true, "dark"],
		[null, false, "light"],
		["invalid", true, "dark"],
		["invalid", false, "light"],
	])("resolves stored %s with system dark %s to %s", (stored, system, expected) => {
		expect(resolveColorScheme(stored, system as boolean)).toBe(expected);
	});

	it.each(["light", "dark", null, "invalid"])("initializes before paint with saved %s", (stored) => {
		for (const prefersDark of [false, true]) {
			const document = { documentElement: { dataset: {} as Record<string, string> } };
			runInNewContext(COLOR_SCHEME_SCRIPT, {
				document,
				localStorage: { getItem: () => stored },
				window: { matchMedia: () => ({ matches: prefersDark }) },
			});
			expect(document.documentElement.dataset.theme).toBe(resolveColorScheme(stored, prefersDark));
		}
	});

	it("initializes from the system when storage is blocked", () => {
		const document = { documentElement: { dataset: {} as Record<string, string> } };
		runInNewContext(COLOR_SCHEME_SCRIPT, {
			document,
			localStorage: {
				getItem: () => {
					throw new Error("blocked");
				},
			},
			window: { matchMedia: () => ({ matches: true }) },
		});
		expect(document.documentElement.dataset.theme).toBe("dark");
	});

	it("persists a choice, notifies subscribers, and unsubscribes", () => {
		const window = new EventTarget();
		const setItem = vi.fn();
		Object.assign(window, { localStorage: { setItem } });
		vi.stubGlobal("window", window);
		vi.stubGlobal("document", { documentElement: { dataset: {} } });
		const listener = vi.fn();
		const unsubscribe = subscribeColorScheme(listener);
		setColorScheme("dark");
		expect(isDarkColorScheme()).toBe(true);
		expect(setItem).toHaveBeenCalledWith(COLOR_SCHEME_STORAGE_KEY, "dark");
		expect(listener).toHaveBeenCalledOnce();
		unsubscribe();
		applyColorScheme("light");
		expect(listener).toHaveBeenCalledOnce();
		expect(isDarkColorScheme()).toBe(false);
	});

	it("still switches when saving is blocked", () => {
		const dispatchEvent = vi.fn();
		vi.stubGlobal("window", {
			dispatchEvent,
			localStorage: {
				setItem: () => {
					throw new Error("blocked");
				},
			},
		});
		vi.stubGlobal("document", { documentElement: { dataset: {} } });
		expect(() => setColorScheme("dark")).not.toThrow();
		expect(isDarkColorScheme()).toBe(true);
		expect(dispatchEvent.mock.calls[0][0].type).toBe(COLOR_SCHEME_EVENT);
	});

	it("reads the system preference when storage cannot be read", () => {
		vi.stubGlobal("window", {
			localStorage: {
				getItem: () => {
					throw new Error("blocked");
				},
			},
			matchMedia: () => ({ matches: true }),
		});
		expect(preferredColorScheme()).toBe("dark");
	});

	it("keeps the server snapshot stable for hydration", () => {
		expect(serverIsDarkColorScheme()).toBe(false);
	});
});
