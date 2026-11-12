import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./brand.css", import.meta.url), "utf8");
function tokens(selector: string): Record<string, number> {
	const block = css.slice(css.indexOf(selector)).split("}")[0];
	return Object.fromEntries(
		[...block.matchAll(/--([\w-]+):\s*([\d.]+)\s+0\s+0;/g)].map((match) => [match[1], Number(match[2])]),
	);
}
const light = tokens(":root {");
const dark = { ...light, ...tokens('html[data-theme="dark"] {') };

// For neutral OKLCH colors (C=0), relative luminance is L³.
function contrast(a: number, b: number) {
	const [high, low] = [a ** 3, b ** 3].sort((x, y) => y - x);
	return (high + 0.05) / (low + 0.05);
}

describe.each([
	["light", light],
	["dark", dark],
] as const)("%s palette contrast", (_name, palette) => {
	it.each([
		["foreground", "background"],
		["muted-foreground", "background"],
		["inverse-subtle", "surface-inverse"],
		["photo-foreground", "surface-inverse"],
	])("keeps %s readable on %s", (foreground, background) => {
		expect(contrast(palette[foreground], palette[background])).toBeGreaterThanOrEqual(4.5);
	});
});
