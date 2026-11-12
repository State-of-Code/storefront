/** Build-time rollout gate. Set NEXT_PUBLIC_ENABLE_DARK_MODE=true and restart/rebuild to enable. */
export function darkModeEnabled(): boolean {
	return process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === "true";
}
