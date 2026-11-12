import { afterEach, describe, expect, it, vi } from "vitest";
import { darkModeEnabled } from "./color-scheme";

afterEach(() => vi.unstubAllEnvs());

describe("dark mode rollout", () => {
	it.each([undefined, "", "false", "invalid", "TRUE"])("stays off for %s", (value) => {
		vi.stubEnv("NEXT_PUBLIC_ENABLE_DARK_MODE", value);
		expect(darkModeEnabled()).toBe(false);
	});

	it("enables only with an explicit true value", () => {
		vi.stubEnv("NEXT_PUBLIC_ENABLE_DARK_MODE", "true");
		expect(darkModeEnabled()).toBe(true);
	});
});
