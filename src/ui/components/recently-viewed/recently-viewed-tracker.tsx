"use client";

import { useEffect } from "react";
import { recordProduct, type RecentlyViewedProduct } from "@/ui/components/recently-viewed/history";

/** Only mounted by a resolved PDP; prefetching never records a visit. */
export function RecentlyViewedTracker({
	locale,
	channel,
	product,
}: {
	locale: string;
	channel: string;
	product: RecentlyViewedProduct;
}) {
	useEffect(() => {
		recordProduct(locale, channel, product);
	}, [locale, channel, product]);
	return null;
}
