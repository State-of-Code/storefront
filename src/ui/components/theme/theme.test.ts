import { runInNewContext } from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getTheme, setTheme, subscribeToTheme, THEME_STORAGE_KEY, themeInitializationScript } from "./theme";

afterEach(() => vi.unstubAllGlobals());

describe("theme initialization before paint", () => {
	it.each([
		["dark", "dark"],
		["light", "light"],
		[null, "light"],
		["invalid", "light"],
	])("restores %s as %s", (saved, expected) => {
		const document = { documentElement: { dataset: {} as Record<string, string> } };
		runInNewContext(themeInitializationScript, {
			document,
			localStorage: { getItem: () => saved },
		});
		expect(document.documentElement.dataset.theme).toBe(expected);
	});

	it("defaults to light when storage is blocked", () => {
		const document = { documentElement: { dataset: {} as Record<string, string> } };
		runInNewContext(themeInitializationScript, {
			document,
			get localStorage() {
				throw new Error("Storage blocked");
			},
		});
		expect(document.documentElement.dataset.theme).toBe("light");
	});
});

describe("theme switching", () => {
	function setup() {
		const window = new EventTarget();
		const document = { documentElement: { dataset: { theme: "light" } } };
		const storage = { setItem: vi.fn() };
		vi.stubGlobal("window", window);
		vi.stubGlobal("document", document);
		vi.stubGlobal("localStorage", storage);
		return { window, document, storage };
	}

	it("updates the page, saves the choice and notifies subscribers", () => {
		const { storage } = setup();
		const changed = vi.fn();
		const unsubscribe = subscribeToTheme(changed);
		setTheme("dark");
		expect(getTheme()).toBe("dark");
		expect(storage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, "dark");
		expect(changed).toHaveBeenCalledTimes(1);
		setTheme("light");
		expect(getTheme()).toBe("light");
		unsubscribe();
		setTheme("dark");
		expect(changed).toHaveBeenCalledTimes(2);
	});

	it("still switches if saving fails", () => {
		const { storage } = setup();
		storage.setItem.mockImplementation(() => {
			throw new Error("Storage blocked");
		});
		expect(() => setTheme("dark")).not.toThrow();
		expect(getTheme()).toBe("dark");
	});

	it("syncs other tabs, resets on removal, and ignores unrelated keys", () => {
		const { window } = setup();
		const changed = vi.fn();
		const unsubscribe = subscribeToTheme(changed);
		const send = (key: string | null, newValue: string | null) => {
			window.dispatchEvent(Object.assign(new Event("storage"), { key, newValue }));
		};
		send(THEME_STORAGE_KEY, "dark");
		expect(getTheme()).toBe("dark");
		send("unrelated", "light");
		expect(getTheme()).toBe("dark");
		send(THEME_STORAGE_KEY, null);
		expect(getTheme()).toBe("light");
		setTheme("dark");
		send(null, null);
		expect(getTheme()).toBe("light");
		unsubscribe();
	});
});
