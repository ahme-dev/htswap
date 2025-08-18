// @vitest-environment jsdom
import { expect } from "vitest";

export function untabHTML(htmlString: string) {
	const lines = htmlString.split("\n").filter((line) => line.trim());
	if (lines.length === 0) return "";

	const firstLineTabs = lines[0].match(/^\t*/)?.[0].length;

	const result = lines.map((line) => {
		if (line.startsWith("\t".repeat(firstLineTabs || 0))) {
			return line.slice(firstLineTabs);
		}
		return line;
	});

	return result.join("\n");
}

function htmlWrap(content: string): string {
	return `<html><head></head><body>${untabHTML(content)}</body></html>`;
}

export function setupEnvironment(
	page: string,
	routes: Record<string, (params?: URLSearchParams | FormData) => string>,
): void {
	document.body.innerHTML = htmlWrap(page);
	window.history.replaceState({}, "", "/");

	const allRoutes: Record<string, (params?: URLSearchParams) => string> = {
		"/": () => page,
		...routes,
	};

	const f = async (url: string): Promise<Response> => {
		const urlObj = new URL(url, window.location.origin);
		const pathname = urlObj.pathname;
		const searchParams = urlObj.searchParams;

		const content =
			allRoutes[pathname] ||
			allRoutes[`${pathname}/`] ||
			allRoutes[pathname.replace(/\/$/, "")];

		const isFound = !!content;

		return {
			text: async (): Promise<string> =>
				htmlWrap(content ? content(searchParams) : ""),
			ok: isFound,
			status: isFound ? 200 : 404,
			statusText: isFound ? "OK" : "Not Found",
			headers: new Headers(),
			url,
			redirected: false,
			type: "basic" as ResponseType,
			clone: function () {
				return this;
			},
			body: null,
			bodyUsed: false,
			arrayBuffer: async () => new ArrayBuffer(0),
			blob: async () => new Blob(),
			formData: async () => new FormData(),
			json: async () => ({}),
		} as Response;
	};

	globalThis.fetch = f as typeof fetch;
}

export function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function click(selector: string) {
	const element = document.querySelector(selector);
	expect(element).not.toBeNull();
	element?.dispatchEvent(
		new MouseEvent("click", { bubbles: true }) as unknown as Event,
	);
}

export function input(selector: string, text: string) {
	const element = document.querySelector(`${selector}`) as HTMLInputElement;
	if (!element) {
		return expect(element != null);
	}
	element.value = "";
	element.dispatchEvent(
		new Event("focus", { bubbles: true }) as unknown as Event,
	);
	text.split("").forEach((_, index) => {
		element.value = text.substring(0, index + 1);
		element.dispatchEvent(
			new Event("input", { bubbles: true }) as unknown as Event,
		);
	});
}
