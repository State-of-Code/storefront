import { afterEach, describe, expect, it, vi } from "vitest";
import { productComparisonEnabled } from "@/config/product-comparison";

afterEach(() => vi.unstubAllEnvs());

describe("comparison rollout", () => {
	it.each([undefined, "", "false", "invalid", "TRUE"])("stays off for %s", (value) => {
		vi.stubEnv("NEXT_PUBLIC_ENABLE_PRODUCT_COMPARISON", value);
		expect(productComparisonEnabled()).toBe(false);
	});
	it("enables only with explicit true", () => {
		vi.stubEnv("NEXT_PUBLIC_ENABLE_PRODUCT_COMPARISON", "true");
		expect(productComparisonEnabled()).toBe(true);
	});
});
