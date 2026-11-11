"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/ui/button";
import { getTheme, setTheme, subscribeToTheme } from "@/ui/components/theme/theme";

export function ThemeToggle() {
	const t = useTranslations("common.theme");
	const theme = useSyncExternalStore(subscribeToTheme, getTheme, () => "light");
	const isDark = theme === "dark";

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			className="h-11 w-11 shrink-0"
			aria-label={t("darkMode")}
			aria-pressed={isDark}
			title={isDark ? t("switchToLight") : t("switchToDark")}
			onClick={() => setTheme(isDark ? "light" : "dark")}
		>
			<Sun className="theme-dark-icon hidden h-5 w-5" aria-hidden="true" />
			<Moon className="theme-light-icon h-5 w-5" aria-hidden="true" />
		</Button>
	);
}
