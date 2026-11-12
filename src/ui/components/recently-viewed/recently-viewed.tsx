"use client";

import { useCallback, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ProductCardLink } from "@/ui/components/plp/product-card-link";
import { formatProductPrice } from "@/ui/components/plp/format-product-price";
import { resolveLocaleFromSlug } from "@/config/locale";
import {
	HISTORY_EVENT,
	historyKey,
	parseHistory,
	productPrefix,
	readHistoryStorage,
	visibleHistory,
} from "@/ui/components/recently-viewed/history";

function subscribe(onChange: () => void) {
	window.addEventListener(HISTORY_EVENT, onChange);
	window.addEventListener("storage", onChange);
	return () => {
		window.removeEventListener(HISTORY_EVENT, onChange);
		window.removeEventListener("storage", onChange);
	};
}

const serverSnapshot = () => null;

export function RecentlyViewed({ locale, channel }: { locale: string; channel: string }) {
	const t = useTranslations("recentlyViewed");
	const pathname = usePathname();
	const key = historyKey(locale, channel);
	const getSnapshot = useCallback(() => readHistoryStorage(key), [key]);
	const raw = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
	const products = visibleHistory(parseHistory(raw, productPrefix(locale, channel)), pathname);
	if (products.length === 0) return null;

	return (
		<section
			aria-labelledby="recently-viewed-heading"
			className="border-t border-border bg-background py-section-sm text-foreground"
		>
			<div className="container-content">
				<h2 id="recently-viewed-heading" className="mb-3 text-h2 font-medium">
					{t("title")}
				</h2>
				<p className="mb-8 text-sm text-muted-foreground">{t("description")}</p>
				<ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
					{products.map((product) => (
						<li key={product.id}>
							<ProductCardLink
								href={product.href}
								className="group block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
							>
								<div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-card bg-secondary">
									{product.image ? (
										// Persisted thumbnail URLs may outlive the current optimizer allowlist.
										// eslint-disable-next-line @next/next/no-img-element -- serve saved catalog thumbnails directly without an extra optimizer request.
										<img
											src={product.image}
											alt={product.name}
											sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
											loading="lazy"
											decoding="async"
											className="absolute inset-0 h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
											{t("noImage")}
										</div>
									)}
								</div>
								<h3
									className="truncate font-medium text-foreground/80 group-hover:text-foreground"
									title={product.name}
								>
									{product.name}
								</h3>
								<p className="mt-2 font-semibold tabular-nums">
									{product.price
										? formatProductPrice({
												price: product.price.low,
												priceStop: product.price.high,
												currency: product.price.currency,
												localeBcp47: resolveLocaleFromSlug(locale).bcp47,
											})
										: t("priceUnavailable")}
								</p>
							</ProductCardLink>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
