import { afterEach, describe, expect, it, vi } from "vitest";
import {
	addToHistory,
	HISTORY_EVENT,
	HISTORY_LIMIT,
	historyKey,
	parseHistory,
	productPrefix,
	readHistoryStorage,
	recordProduct,
	visibleHistory,
	type RecentlyViewedProduct,
} from "@/ui/components/recently-viewed/history";

const prefix = productPrefix("en", "default-channel");
const product = (id: string): RecentlyViewedProduct => ({
	id,
	name: `Product ${id}`,
	href: `${prefix}${id}`,
	image: "https://example.com/product.webp",
	price: { low: 12, high: 20, currency: "USD" },
});

afterEach(() => vi.unstubAllGlobals());

describe("recently viewed history", () => {
	it("keeps newest first, refreshes existing snapshots, and caps history", () => {
		let items: RecentlyViewedProduct[] = [];
		for (let i = 0; i < 12; i++) items = addToHistory(items, product(String(i)));
		expect(items).toHaveLength(HISTORY_LIMIT);
		expect(items.map((item) => item.id)).toEqual(["11", "10", "9", "8", "7", "6", "5", "4"]);
		items = addToHistory(items, { ...product("7"), name: "Updated name" });
		expect(items[0].name).toBe("Updated name");
		expect(items.filter((item) => item.id === "7")).toHaveLength(1);
	});

	it("separates both locale and channel, including ambiguous delimiters", () => {
		expect(historyKey("en", "us")).not.toBe(historyKey("fr", "us"));
		expect(historyKey("en", "us")).not.toBe(historyKey("en", "eu"));
		expect(historyKey("a:b", "c")).not.toBe(historyKey("a", "b:c"));
		expect(parseHistory(JSON.stringify([product("one")]), productPrefix("fr", "default-channel"))).toEqual(
			[],
		);
	});

	it("ignores malformed, oversized, and invalid persisted data", () => {
		for (const value of [null, "", "{bad", "null", "{}", "x".repeat(65537)]) {
			expect(parseHistory(value, prefix)).toEqual([]);
		}
		const invalid = [
			null,
			{},
			{ ...product("one"), price: { low: -1, high: 2, currency: "USD" } },
			{ ...product("one"), price: { low: 1, high: 2, currency: "INVALID" } },
			{ ...product("one"), href: "javascript:alert(1)" },
			{ ...product("one"), href: `${prefix}../../account` },
			{ ...product("one"), image: "javascript:alert(1)" },
		];
		expect(parseHistory(JSON.stringify(invalid), prefix)).toEqual([]);
	});

	it("accepts missing image and price, deduplicates and bounds stored records", () => {
		const items = [product("one"), product("one"), { ...product("two"), image: null, price: null }];
		expect(parseHistory(JSON.stringify(items), prefix)).toEqual([items[0], items[2]]);
		expect(
			parseHistory(JSON.stringify(Array.from({ length: 20 }, (_, i) => product(String(i)))), prefix),
		).toHaveLength(HISTORY_LIMIT);
	});

	it("excludes only the current PDP, including encoded slugs and trailing slashes", () => {
		const items = [product("one"), product("two")];
		expect(visibleHistory(items, `${prefix}one/`)).toEqual([items[1]]);
		expect(visibleHistory(items, "/en/default-channel/products")).toEqual(items);
		expect(visibleHistory([product("%E6%9C%AC")], `${prefix}本`)).toEqual([]);
	});

	it("persists visits and broadcasts updates to the section", () => {
		const values = new Map<string, string>();
		const dispatchEvent = vi.fn();
		vi.stubGlobal("window", {
			localStorage: {
				getItem: (key: string) => values.get(key) ?? null,
				setItem: (key: string, value: string) => values.set(key, value),
			},
			dispatchEvent,
		});
		recordProduct("en", "default-channel", product("one"));
		recordProduct("en", "default-channel", product("two"));
		recordProduct("en", "default-channel", product("one"));
		expect(
			parseHistory(readHistoryStorage(historyKey("en", "default-channel")), prefix).map((item) => item.id),
		).toEqual(["one", "two"]);
		expect(dispatchEvent.mock.calls[0][0].type).toBe(HISTORY_EVENT);
	});

	it("does not throw when storage access is blocked or its quota is exhausted", () => {
		vi.stubGlobal("window", {
			get localStorage() {
				throw new Error("blocked");
			},
		});
		expect(readHistoryStorage("key")).toBeNull();
		expect(() => recordProduct("en", "default-channel", product("one"))).not.toThrow();
		vi.stubGlobal("window", {
			localStorage: {
				getItem: () => null,
				setItem: () => {
					throw new Error("quota");
				},
			},
		});
		expect(() => recordProduct("en", "default-channel", product("one"))).not.toThrow();
	});
});
