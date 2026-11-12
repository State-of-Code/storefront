"use client";

import { type ReactNode } from "react";
import { CatalogIdentityProvider } from "@/lib/catalog/catalog-identity-bridge";
import { CartProvider } from "@/ui/components/cart/cart-context";
import { ProductComparisonProvider } from "@/ui/components/comparison/product-comparison";

export function StorefrontProviders({ children }: { children: ReactNode }) {
	return (
		<CartProvider>
			<CatalogIdentityProvider>
				<ProductComparisonProvider>{children}</ProductComparisonProvider>
			</CatalogIdentityProvider>
		</CartProvider>
	);
}
