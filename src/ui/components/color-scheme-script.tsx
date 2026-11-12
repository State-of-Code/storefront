import { COLOR_SCHEME_SCRIPT } from "@/lib/color-scheme";

/** Server-rendered in <head>; runs before the body is painted without a hydration dependency. */
export function ColorSchemeScript() {
	return <script dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_SCRIPT }} />;
}
