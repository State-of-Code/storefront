"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";

type SearchQueryInputProps = ComponentProps<"input"> & { searchPath: string };

export function SearchQueryInput({ searchPath, ...props }: SearchQueryInputProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const query = pathname === searchPath ? (searchParams.get("query") ?? "") : "";

	return <input {...props} key={`${pathname}:${query}`} defaultValue={query} />;
}
