"use client";

import {
	createContext,
	Suspense,
	useContext,
	useId,
	useReducer,
	useState,
	type Dispatch,
	type ReactNode,
} from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, Columns2 } from "lucide-react";
import { productComparisonEnabled } from "@/config/product-comparison";
import { SaleorImage } from "@/ui/atoms/saleor-image";
import { Button, buttonClassName } from "@/ui/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/ui/components/ui/dialog";
import { formatProductPrice } from "@/ui/components/plp/format-product-price";
import {
	comparisonReducer,
	comparisonScope,
	EMPTY_COMPARISON,
	productScope,
	selectionBlockReason,
	type ComparisonAction,
	type ComparisonProduct,
	type ComparisonState,
} from "@/ui/components/comparison/comparison-state";

const ComparisonContext = createContext<{
	state: ComparisonState;
	dispatch: Dispatch<ComparisonAction>;
} | null>(null);

/**
 * Mount once inside StorefrontProviders. No storage, network calls, or async route
 * reads surround children. Only the tray reads params, inside its own Suspense.
 */
export function ProductComparisonProvider({ children }: { children: ReactNode }) {
	if (!productComparisonEnabled()) return children;
	return <EnabledComparisonProvider>{children}</EnabledComparisonProvider>;
}

function EnabledComparisonProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(comparisonReducer, EMPTY_COMPARISON);
	return (
		<ComparisonContext.Provider value={{ state, dispatch }}>
			{children}
			<Suspense fallback={null}>
				<ScopedComparisonTray />
			</Suspense>
		</ComparisonContext.Provider>
	);
}

export function ProductComparisonButton({ product }: { product: ComparisonProduct }) {
	const context = useContext(ComparisonContext);
	const t = useTranslations("comparison");
	const hintId = useId();
	if (!context) return null;
	const products = context.state.scope === productScope(product) ? context.state.products : [];
	const selected = products.some((item) => item.id === product.id);
	const reason = selectionBlockReason(products, product);
	return (
		<div className="mt-3">
			<Button
				type="button"
				variant={selected ? "secondary" : "outline-solid"}
				className="min-h-11 w-full whitespace-normal"
				aria-pressed={selected}
				aria-label={t(selected ? "removeProduct" : "addProduct", { name: product.name })}
				aria-describedby={reason ? hintId : undefined}
				disabled={reason !== null}
				onClick={() => context.dispatch({ type: "toggle", product })}
			>
				{selected ? (
					<Check className="h-4 w-4 shrink-0" aria-hidden />
				) : (
					<Columns2 className="h-4 w-4 shrink-0" aria-hidden />
				)}
				{t(selected ? "selected" : "add")}
			</Button>
			{reason && (
				<p id={hintId} className="mt-1 text-xs text-muted-foreground">
					{t(reason)}
				</p>
			)}
		</div>
	);
}

function ScopedComparisonTray() {
	const params = useParams<{ locale: string; channel: string }>();
	const context = useContext(ComparisonContext);
	if (!context || context.state.scope !== comparisonScope(params.locale, params.channel)) return null;
	return <ComparisonTray key={context.state.scope} state={context.state} dispatch={context.dispatch} />;
}

function ComparisonTray({
	state,
	dispatch,
}: {
	state: ComparisonState;
	dispatch: Dispatch<ComparisonAction>;
}) {
	const t = useTranslations("comparison");
	const [open, setOpen] = useState(false);
	const products = state.products;
	const ready = products.length === 2;
	// Keep the trigger mounted while the dialog closes so Radix can restore focus.
	return (
		<Dialog open={open && ready} onOpenChange={setOpen}>
			{products.length > 0 && (
				<aside
					aria-label={t("title")}
					className="sticky bottom-0 z-30 border-t border-border bg-background p-4 text-foreground shadow-elevated"
				>
					<div className="container-content flex flex-wrap items-center justify-between gap-3">
						<div className="min-w-0 flex-1">
							<p role="status" className="text-sm font-semibold">
								{t("count", { count: products.length })}
							</p>
							<p className="text-xs text-muted-foreground">{t(ready ? "ready" : "chooseSecond")}</p>
							<ul className="mt-2 flex flex-wrap gap-2">
								{products.map((product) => (
									<li key={product.id}>
										<Button
											type="button"
											variant="secondary"
											className="min-h-11 max-w-full whitespace-normal text-left"
											aria-label={t("removeProduct", { name: product.name })}
											onClick={() => {
												setOpen(false);
												dispatch({ type: "remove", id: product.id });
											}}
										>
											{product.name} <span aria-hidden>×</span>
										</Button>
									</li>
								))}
							</ul>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								variant="ghost"
								className="min-h-11"
								onClick={() => {
									setOpen(false);
									dispatch({ type: "reset" });
								}}
							>
								{t("reset")}
							</Button>
							<DialogTrigger asChild>
								<Button type="button" className="min-h-11" disabled={!ready}>
									{t("open")}
								</Button>
							</DialogTrigger>
						</div>
					</div>
				</aside>
			)}
			<DialogContent className="m-auto h-fit max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-card border border-border bg-background p-4 text-foreground shadow-overlay sm:p-6">
				<div className="mb-4 flex items-start justify-between gap-4">
					<div>
						<DialogTitle>{t("title")}</DialogTitle>
						<DialogDescription>{t("description")}</DialogDescription>
					</div>
					<DialogClose asChild>
						<Button type="button" variant="ghost" className="min-h-11">
							{t("close")}
						</Button>
					</DialogClose>
				</div>
				<div className="grid grid-cols-2 gap-3 sm:gap-6">
					{products.map((product) => (
						<section key={product.id} aria-label={product.name} className="min-w-0 space-y-3">
							<div className="relative aspect-square overflow-hidden rounded-card bg-secondary">
								<SaleorImage
									src={product.image}
									srcSet={product.imageSrcSet}
									alt={product.imageAlt || product.name}
									sizes="(max-width: 640px) 40vw, 320px"
									className="object-contain"
								/>
							</div>
							<h3 className="break-words font-semibold">{product.name}</h3>
							<dl className="space-y-3 text-sm">
								<ComparisonFact label={t("price")}>
									{formatProductPrice(product)}{" "}
									<span className="text-muted-foreground">{product.currency}</span>
								</ComparisonFact>
								<ComparisonFact label={t("availability")}>
									{t(
										product.isAvailable === true
											? "available"
											: product.isAvailable === false
												? "unavailable"
												: "unknownAvailability",
									)}
								</ComparisonFact>
								<ComparisonFact label={t("category")}>
									{product.category?.name || t("notProvided")}
								</ComparisonFact>
								<ComparisonFact label={t("colors")}>
									{product.colors?.map((color) => color.name).join(", ") || t("notProvided")}
								</ComparisonFact>
								<ComparisonFact label={t("sizes")}>
									{product.sizes?.map((size) => size.name).join(", ") || t("notProvided")}
								</ComparisonFact>
							</dl>
							{(product.variantTotalCount ?? 0) > (product.variantSampleSize ?? 0) && (
								<p className="text-xs text-muted-foreground">{t("sampledOptions")}</p>
							)}
							<Link
								href={product.href}
								onClick={() => setOpen(false)}
								className={buttonClassName({
									variant: "outline-solid",
									asLink: true,
									className: "min-h-11 w-full whitespace-normal text-center",
								})}
							>
								{t("viewProduct")}
							</Link>
							<Button
								type="button"
								variant="ghost"
								className="min-h-11 w-full whitespace-normal"
								aria-label={t("removeProduct", { name: product.name })}
								onClick={() => {
									setOpen(false);
									dispatch({ type: "remove", id: product.id });
								}}
							>
								{t("remove")}
							</Button>
						</section>
					))}
				</div>
				<Button
					type="button"
					variant="ghost"
					className="mt-4 min-h-11 self-start"
					onClick={() => {
						setOpen(false);
						dispatch({ type: "reset" });
					}}
				>
					{t("reset")}
				</Button>
			</DialogContent>
		</Dialog>
	);
}

function ComparisonFact({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="break-words border-t border-border pt-2">
			<dt className="text-xs text-muted-foreground">{label}</dt>
			<dd className="mt-1">{children}</dd>
		</div>
	);
}
