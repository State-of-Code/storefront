/** Browser-only snapshots, not authoritative pricing or availability. */
export interface RecentlyViewedProduct {
	id: string;
	name: string;
	href: string;
	image: string | null;
	price: { low: number; high: number; currency: string } | null;
}

export const RECENTLY_VIEWED_ENABLED = process.env.NEXT_PUBLIC_ENABLE_RECENTLY_VIEWED === "true";
export const HISTORY_LIMIT = 8;
export const HISTORY_EVENT = "paper:recently-viewed";

export function historyKey(locale: string, channel: string): string {
	return `paper:recently-viewed:v1:${encodeURIComponent(locale)}:${encodeURIComponent(channel)}`;
}

export function productPrefix(locale: string, channel: string): string {
	return `/${encodeURIComponent(locale)}/${encodeURIComponent(channel)}/products/`;
}

function validImage(value: unknown): value is string | null {
	if (value === null) return true;
	if (typeof value !== "string" || value.length > 4096) return false;
	try {
		const url = new URL(value);
		return url.protocol === "https:" || url.protocol === "http:";
	} catch {
		return /^\/[^/\\]/.test(value) && !value.includes("\\");
	}
}

function validProduct(value: unknown, prefix: string): value is RecentlyViewedProduct {
	if (!value || typeof value !== "object") return false;
	const item = value as Partial<RecentlyViewedProduct>;
	if (
		typeof item.id !== "string" ||
		!item.id ||
		item.id.length > 256 ||
		typeof item.name !== "string" ||
		!item.name ||
		item.name.length > 1000 ||
		typeof item.href !== "string" ||
		!item.href.startsWith(prefix) ||
		!/^[-\w%]+$/.test(item.href.slice(prefix.length)) ||
		!validImage(item.image)
	)
		return false;
	if (item.price === null) return true;
	const price = item.price;
	return (
		!!price &&
		typeof price.low === "number" &&
		Number.isFinite(price.low) &&
		price.low >= 0 &&
		typeof price.high === "number" &&
		Number.isFinite(price.high) &&
		price.high >= price.low &&
		typeof price.currency === "string" &&
		/^[A-Z]{3}$/.test(price.currency)
	);
}

export function parseHistory(raw: string | null, prefix: string): RecentlyViewedProduct[] {
	if (!raw || raw.length > 65536) return [];
	try {
		const value: unknown = JSON.parse(raw);
		if (!Array.isArray(value)) return [];
		const seen = new Set<string>();
		return value
			.filter((item): item is RecentlyViewedProduct => {
				if (!validProduct(item, prefix) || seen.has(item.id)) return false;
				seen.add(item.id);
				return true;
			})
			.slice(0, HISTORY_LIMIT);
	} catch {
		return [];
	}
}

export function addToHistory(
	history: RecentlyViewedProduct[],
	product: RecentlyViewedProduct,
): RecentlyViewedProduct[] {
	return [product, ...history.filter((item) => item.id !== product.id)].slice(0, HISTORY_LIMIT);
}

export function visibleHistory(history: RecentlyViewedProduct[], pathname: string): RecentlyViewedProduct[] {
	// Encoded Unicode slugs can be represented differently by the browser and Next.
	const normalize = (path: string) => {
		try {
			return decodeURIComponent(path).replace(/\/$/, "");
		} catch {
			return path;
		}
	};
	return history.filter((item) => normalize(item.href) !== normalize(pathname));
}

export function readHistoryStorage(key: string): string | null {
	try {
		return window.localStorage.getItem(key);
	} catch {
		return null;
	}
}

export function recordProduct(locale: string, channel: string, product: RecentlyViewedProduct): void {
	const key = historyKey(locale, channel);
	const prefix = productPrefix(locale, channel);
	if (!validProduct(product, prefix)) return;
	try {
		const history = parseHistory(readHistoryStorage(key), prefix);
		window.localStorage.setItem(key, JSON.stringify(addToHistory(history, product)));
		window.dispatchEvent(new Event(HISTORY_EVENT));
	} catch {
		// Private browsing, quota errors, or disabled storage must never break a PDP.
	}
}
