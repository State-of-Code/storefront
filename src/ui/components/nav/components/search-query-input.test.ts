import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchQueryInput } from "./search-query-input";

const navigation = vi.hoisted(() => ({
	pathname: "/en/default-channel/search",
	params: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
	usePathname: () => navigation.pathname,
	useSearchParams: () => navigation.params,
}));

function renderInput() {
	return renderToStaticMarkup(
		createElement(SearchQueryInput, { searchPath: "/en/default-channel/search", name: "search" }),
	);
}

describe("SearchQueryInput", () => {
	beforeEach(() => {
		navigation.pathname = "/en/default-channel/search";
		navigation.params = new URLSearchParams();
	});

	it("retains the submitted decoded query", () => {
		navigation.params.set("query", "tee & shirt");
		expect(renderInput()).toContain('value="tee &amp; shirt"');
	});

	it("follows changes to the submitted URL query", () => {
		navigation.params.set("query", "tee");
		expect(renderInput()).toContain('value="tee"');
		navigation.params.set("query", "mug");
		expect(renderInput()).toContain('value="mug"');
		navigation.params.set("query", "tee");
		expect(renderInput()).toContain('value="tee"');
	});

	it("keeps the query when filters or sorting change", () => {
		navigation.params = new URLSearchParams("query=tee&sort=price-asc&sizes=m");
		expect(renderInput()).toContain('value="tee"');
	});

	it("does not carry unrelated query parameters into other pages", () => {
		navigation.pathname = "/en/default-channel/products";
		navigation.params.set("query", "tee");
		expect(renderInput()).toContain('value=""');
	});

	it("handles a missing or empty query", () => {
		expect(renderInput()).toContain('value=""');
		navigation.params.set("query", "");
		expect(renderInput()).toContain('value=""');
	});
});
