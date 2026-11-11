import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchBar } from "@/ui/components/nav/components/search-bar";

const { redirect } = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("next/navigation", () => ({ redirect }));

function submit(search: string, locale = "en", channel = "eu") {
	const form = SearchBar({
		locale,
		channel,
		placeholder: "Search for products",
		srOnlyLabel: "Search",
	});
	const data = new FormData();
	data.set("search", search);
	return form.props.action(data);
}

describe("SearchBar submission", () => {
	beforeEach(() => {
		redirect.mockClear();
	});

	it("encodes a Unicode query containing URL-reserved characters as one parameter", async () => {
		await submit("café & tee + 50%");

		expect(redirect).toHaveBeenCalledExactlyOnceWith(
			"/en/eu/search?query=caf%C3%A9%20%26%20tee%20%2B%2050%25",
		);
	});

	it.each(["", " \t "])("does not redirect for an empty search %j", async (query) => {
		await submit(query);
		expect(redirect).not.toHaveBeenCalled();
	});

	it("preserves the current locale and channel in the search destination", async () => {
		await submit("tee", "fr", "uk");
		expect(redirect).toHaveBeenCalledExactlyOnceWith("/fr/uk/search?query=tee");
	});
});
