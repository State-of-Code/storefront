import { describe, expect, it } from "vitest";
import {
	comparisonReducer,
	comparisonScope,
	EMPTY_COMPARISON,
	productScope,
	selectionBlockReason,
	type ComparisonProduct,
} from "@/ui/components/comparison/comparison-state";
import { formatProductPrice } from "@/ui/components/plp/format-product-price";

const product = (id: string, overrides: Partial<ComparisonProduct> = {}): ComparisonProduct => ({
	id,
	name: `Product ${id}`,
	slug: id,
	price: 10,
	currency: "USD",
	image: "/placeholder.svg",
	href: `/en/default-channel/products/${id}`,
	localeBcp47: "en-US",
	...overrides,
});

describe("two-product comparison", () => {
	it("selects two distinct products and rejects a third", () => {
		const one = comparisonReducer(EMPTY_COMPARISON, { type: "toggle", product: product("1") });
		const two = comparisonReducer(one, { type: "toggle", product: product("2") });
		expect(two.products.map((item) => item.id)).toEqual(["1", "2"]);
		expect(selectionBlockReason(two.products, product("3"))).toBe("limit");
		expect(comparisonReducer(two, { type: "toggle", product: product("3") })).toBe(two);
	});
	it("allows deselection at the limit, removal, and reset", () => {
		const two = { scope: productScope(product("1")), products: [product("1"), product("2")] };
		expect(selectionBlockReason(two.products, product("1"))).toBeNull();
		expect(comparisonReducer(two, { type: "toggle", product: product("1") }).products).toEqual([
			product("2"),
		]);
		expect(comparisonReducer(two, { type: "remove", id: "2" }).products).toEqual([product("1")]);
		expect(comparisonReducer(two, { type: "reset" })).toEqual(EMPTY_COMPARISON);
	});
	it("rejects incompatible currency before updating selection", () => {
		const one = comparisonReducer(EMPTY_COMPARISON, { type: "toggle", product: product("1") });
		const euros = product("2", { currency: "EUR" });
		expect(selectionBlockReason(one.products, euros)).toBe("currency");
		expect(comparisonReducer(one, { type: "toggle", product: euros })).toBe(one);
	});
	it.each(["/fr/default-channel/products/2", "/en/europe/products/2"])(
		"isolates selection for %s",
		(href) => {
			const one = comparisonReducer(EMPTY_COMPARISON, { type: "toggle", product: product("1") });
			const other = product("2", { href, currency: "EUR" });
			const switched = comparisonReducer(one, { type: "toggle", product: other });
			expect(switched.products).toEqual([other]);
			expect(switched.scope).not.toBe(one.scope);
		},
	);
	it("uses unambiguous decoded locale and channel scope", () => {
		expect(productScope(product("1", { href: "/en/my%20channel/products/1" }))).toBe(
			comparisonScope("en", "my channel"),
		);
		expect(comparisonScope("a-b", "c")).not.toBe(comparisonScope("a", "b-c"));
	});
	it("preserves server data, including unknown and unavailable stock, and display-price ranges", () => {
		const item = product("1", { isAvailable: false, priceStop: 20, sizes: [{ name: "S", slug: "s" }] });
		const state = comparisonReducer(EMPTY_COMPARISON, { type: "toggle", product: item });
		expect(state.products[0]).toEqual(item);
		expect(formatProductPrice(item)).toBe("$10.00 - $20.00");
		expect(product("2").isAvailable).toBeUndefined();
	});
});
