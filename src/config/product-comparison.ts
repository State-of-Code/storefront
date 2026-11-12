/** Build-time, opt-in gate. Changing this requires a restart/rebuild. */
export function productComparisonEnabled(): boolean {
	return process.env.NEXT_PUBLIC_ENABLE_PRODUCT_COMPARISON === "true";
}
