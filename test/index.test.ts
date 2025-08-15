import { expect, test } from "vitest";
import { click, delay, setupPage, setupRoutes } from "./tools.ts";

test("swapping should work.", async () => {
	setupRoutes({
		"/new": '<div id="target">Updated by swapInit</div>',
	});

	setupPage(`
		<div>
			<a id="go" href="/new" target="#target">
				Go
			</a>
			<div id="target">Original</div>
		</div>
	`);

	const { htswapInit } = await import("../src/index.ts");

	htswapInit();

	click("#go");

	await delay(100);

	expect(document.querySelector("#target")?.textContent).toEqual(
		"Updated by swapInit",
	);
});

test("Back button should work.", async () => {
	setupRoutes({
		"/new": '<div id="target">Updated by swapInit</div>',
		"/": '<div id="target">Original</div>',
	});

	setupPage(`
		<div>
			<a id="go" href="/new" target="#target">
				Go
			</a>
			<div id="target">Original</div>
		</div>
	`);

	const { htswapInit } = await import("../src/index.ts");
	htswapInit();

	click("#go");
	await delay(100);

	expect(document.querySelector("#target")?.textContent).toEqual(
		"Updated by swapInit",
	);

	globalThis.dispatchEvent(new Event("popstate"));
	await delay(100);

	expect(document.querySelector("#target")?.textContent).toEqual("Original");
});
