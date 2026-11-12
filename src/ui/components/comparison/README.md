# Product comparison

Mount `ProductComparisonProvider` from `product-comparison.tsx` once inside
`StorefrontProviders`, wrapping its children. The provider includes the tray and
dialog. Its route-reading tray is an isolated Suspense leaf; it does not block
the main page or change the existing chrome boundaries.

Set `NEXT_PUBLIC_ENABLE_PRODUCT_COMPARISON=true` and restart development or
rebuild/redeploy production to enable. Missing, false, and invalid values disable
both the provider behavior and product-card controls. Disable with `false` and
restart/rebuild. The flag controls browse UI only; there are no mutations or new
endpoints. The storefront owner can remove it after approving a stable full rollout.

Selection is in memory, limited to two unique products in one locale/channel and
one currency. It survives navigation within browse chrome, not page reloads.
The tray is hidden outside its locale/channel; choosing a product in a different
scope replaces the previous selection. No browser storage or browser Saleor
requests are used.

Cards supply display-price ranges, images, category, and sampled color/size
options. `ProductListItemExtension` adds Saleor's nullable `isAvailable`; the Saleor
card mapper forwards it through a declared core override. Unknown availability is
not treated as in stock. Prices and availability are catalog snapshots, not live
checkout guarantees. Sampled variant options are explicitly labeled.

## Verification

- Run `pnpm run verify`; codegen is required for the GraphQL extension.
- With the flag off, cards and browse chrome remain unchanged.
- With the provider mounted and flag on, select one then two cards. A third
  cannot be selected until one is removed. Mixed currencies cannot be selected.
- Open the comparison with exactly two products. Check both images, names,
  price ranges/currencies, availability, options, and product links.
- Test close, Escape, keyboard focus containment/return, remove, reset, and
  navigation between lists and product pages.
- Check narrow mobile and desktop layouts in light and dark mode, including
  long names, missing optional fields, and unavailable products.
- Switch locale/channel: the previous scope's tray must not appear. Reload:
  selection must be empty.

Integrated preview/browser testing belongs to the parent integration task.
