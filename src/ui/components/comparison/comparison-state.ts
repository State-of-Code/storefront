import type { ProductCardView } from "@/lib/storefront/contract/listing";
import { parseStorefrontPathname } from "@/lib/storefront-path";

/** Optional fork-owned listing fields; the Paper core listing contract stays unchanged. */
export type ComparisonProduct = ProductCardView & { isAvailable?: boolean | null };
export type ComparisonState = { scope: string; products: ComparisonProduct[] };
export type ComparisonAction =
	| { type: "toggle"; product: ComparisonProduct }
	| { type: "remove"; id: string }
	| { type: "reset" };

export const EMPTY_COMPARISON: ComparisonState = { scope: "", products: [] };

export function comparisonScope(locale: string, channel: string): string {
	return JSON.stringify([locale, channel]);
}

export function productScope(product: ComparisonProduct): string {
	const path = parseStorefrontPathname(product.href);
	return path ? comparisonScope(path.locale, path.channel) : "";
}

export function selectionBlockReason(
	products: ComparisonProduct[],
	product: ComparisonProduct,
): "limit" | "currency" | null {
	if (products.some((item) => item.id === product.id)) return null;
	if (products.length === 2) return "limit";
	if (products.length > 0 && products[0].currency !== product.currency) return "currency";
	return null;
}

/** Enforce the same invariants at the state boundary as on the buttons. */
export function comparisonReducer(state: ComparisonState, action: ComparisonAction): ComparisonState {
	if (action.type === "reset") return EMPTY_COMPARISON;
	if (action.type === "remove") {
		return { ...state, products: state.products.filter((product) => product.id !== action.id) };
	}
	const scope = productScope(action.product);
	if (!scope) return state;
	const products = state.scope === scope ? state.products : [];
	if (products.some((product) => product.id === action.product.id)) {
		return { scope, products: products.filter((product) => product.id !== action.product.id) };
	}
	if (selectionBlockReason(products, action.product)) return state;
	return { scope, products: [...products, action.product] };
}
