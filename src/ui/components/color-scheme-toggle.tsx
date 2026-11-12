"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import {
	isDarkColorScheme,
	serverIsDarkColorScheme,
	setColorScheme,
	subscribeColorScheme,
} from "@/lib/color-scheme";
import { Button } from "@/ui/components/ui/button";

export function ColorSchemeToggle() {
	const t = useTranslations("nav.header");
	const dark = useSyncExternalStore(subscribeColorScheme, isDarkColorScheme, serverIsDarkColorScheme);

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			className="h-11 w-11 shrink-0 motion-reduce:transition-none"
			aria-label={t("toggleDarkMode")}
			title={t("toggleDarkMode")}
			aria-pressed={dark}
			onClick={() => setColorScheme(isDarkColorScheme() ? "light" : "dark")}
		>
			<Moon className="theme-icon-moon h-5 w-5" aria-hidden="true" />
			<Sun className="theme-icon-sun h-5 w-5" aria-hidden="true" />
		</Button>
	);
}
