/* eslint-disable react/no-children-prop -- .test.ts files use createElement; required children props satisfy the typed component overload. */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	ProductComparisonButton,
	ProductComparisonProvider,
} from "@/ui/components/comparison/product-comparison";
import type { ComparisonProduct } from "@/ui/components/comparison/comparison-state";
import en from "../../../../messages/en.json";

vi.mock("next/navigation", () => ({
	useParams: () => ({ locale: "en", channel: "default-channel" }),
}));

afterEach(() => vi.unstubAllEnvs());

const product: ComparisonProduct = {
	id: "1",
	slug: "item",
	name: "Test product",
	image: "/placeholder.svg",
	price: 10,
	currency: "USD",
	href: "/en/default-channel/products/item",
};

function render() {
	return renderToStaticMarkup(
		createElement(NextIntlClientProvider, {
			locale: "en",
			messages: en,
			timeZone: "UTC",
			children: createElement(ProductComparisonProvider, {
				children: [
					createElement("main", { key: "main" }, "Browse content"),
					createElement(ProductComparisonButton, { key: "button", product }),
				],
			}),
		}),
	);
}

describe("comparison UI rollout boundary", () => {
	it("preserves browse content and renders no controls when disabled", () => {
		vi.stubEnv("NEXT_PUBLIC_ENABLE_PRODUCT_COMPARISON", "false");
		const html = render();
		expect(html).toContain("Browse content");
		expect(html).not.toContain("<button");
	});
	it("renders an accessible product control only when enabled", () => {
		vi.stubEnv("NEXT_PUBLIC_ENABLE_PRODUCT_COMPARISON", "true");
		const html = render();
		expect(html).toContain("Browse content");
		expect(html).toContain('aria-label="Compare Test product"');
		expect(html).toContain('aria-pressed="false"');
		expect(html).not.toContain('role="dialog"');
	});
});
