import Image from "next/image";
import { PLP_HERO_IMAGE_SIZES, PRODUCT_IMAGE_QUALITY } from "@/lib/images";
import { cn } from "@/lib/utils";
import { NavHrefLink } from "@/ui/atoms/nav-href-link";
import { buttonClassName } from "@/ui/components/ui/button";

export type HeroBannerHeight = "compact" | "default" | "large";

export interface HeroBannerCta {
	label: string;
	href: string;
	variant?: "primary" | "secondary";
}

export interface HeroBannerProps {
	heading: string;
	subheading?: string;
	primaryCta?: HeroBannerCta;
	secondaryCta?: HeroBannerCta;
	backgroundImage?: string | null;
	backgroundImageAlt?: string;
	height?: HeroBannerHeight;
	className?: string;
}

const heightClassName: Record<HeroBannerHeight, string> = {
	compact: "min-h-[280px] md:min-h-[320px]",
	default: "min-h-[360px] md:min-h-[420px]",
	large: "min-h-[420px] md:min-h-[520px]",
};

function HeroBannerCtaLink({ cta, className }: { cta: HeroBannerCta; className: string }) {
	return (
		<NavHrefLink href={cta.href} className={className}>
			{cta.label}
		</NavHrefLink>
	);
}

export function HeroBanner({
	heading,
	subheading,
	primaryCta,
	secondaryCta,
	backgroundImage,
	backgroundImageAlt = "",
	height = "default",
	className,
}: HeroBannerProps) {
	const hasImage = Boolean(backgroundImage);

	return (
		<section
			className={cn("relative overflow-hidden border-b border-border", heightClassName[height], className)}
			aria-labelledby="homepage-hero-heading"
		>
			{hasImage && backgroundImage ? (
				<div className="absolute inset-0">
					<Image
						src={backgroundImage}
						alt={backgroundImageAlt}
						fill
						className="object-cover"
						sizes={PLP_HERO_IMAGE_SIZES}
						quality={PRODUCT_IMAGE_QUALITY}
						priority
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-inverse-surface/70 via-inverse-surface/40 to-transparent" />
				</div>
			) : null}

			<div className="container-content relative flex h-full min-h-[inherit] flex-col justify-end pb-10 pt-16 sm:pb-12">
				<div className="max-w-2xl">
					<h1
						id="homepage-hero-heading"
						className={cn(
							"text-balance text-display",
							hasImage ? "text-photo-foreground" : "text-foreground",
						)}
					>
						{heading}
					</h1>
					{subheading ? (
						<p
							className={cn(
								"mt-5 text-pretty text-lead md:mt-6",
								hasImage ? "text-photo-foreground" : "text-muted-foreground",
							)}
						>
							{subheading}
						</p>
					) : null}
					{(primaryCta || secondaryCta) && (
						<div className="mt-8 flex flex-wrap gap-3">
							{primaryCta ? (
								<HeroBannerCtaLink
									cta={primaryCta}
									className={buttonClassName({
										asLink: true,
										size: "lg",
										variant: primaryCta.variant === "secondary" ? "secondary" : "default",
										className: hasImage && primaryCta.variant !== "secondary" ? "shadow-md" : undefined,
									})}
								/>
							) : null}
							{secondaryCta ? (
								<HeroBannerCtaLink
									cta={secondaryCta}
									className={buttonClassName({
										asLink: true,
										size: "lg",
										variant: secondaryCta.variant === "primary" ? "default" : "outline-solid",
										className: hasImage
											? "border-photo-foreground/30 bg-photo-foreground/10 text-photo-foreground hover:bg-photo-foreground/20"
											: undefined,
									})}
								/>
							) : null}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
