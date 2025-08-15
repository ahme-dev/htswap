import { GlobalRegistrator as HappyGlobal } from "@happy-dom/global-registrator";

HappyGlobal.register();

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
	routes: Record<string, (params?: URLSearchParams) => string>,
) {
	document.body.innerHTML = htmlWrap(page);

	const f = async (url: string) => {
		const urlFirst = url.split("?").at(0);
		const urlSecond = url.split("?").at(1);

		const content = routes[urlFirst || "/"];
		const params = new URLSearchParams(urlSecond);
		return {
			text: async () => htmlWrap(content(params)),
			ok: !!routes[url],
			status: routes[url] ? 200 : 404,
			headers: new Headers(),
		} as Response;
	};
	globalThis.fetch = f as typeof fetch;
}

export function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function click(selector: string) {
	const element = document.querySelector(selector);
	if (!element) {
		return expect(element != null);
	}
	element.dispatchEvent(
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
