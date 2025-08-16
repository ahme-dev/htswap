import { describe, expect, test } from "vitest";
import { click, delay, input, setupEnvironment, untabHTML } from "./tools.ts";

describe("Links", async () => {
	test("Should work normally.", async () => {
		setupEnvironment(
			`
			<div>
				<a id="go" href="/new" target="#target">
					Go
				</a>
				<div id="target">Original</div>
			</div>
			`,
			{
				"/new": () => '<div id="target">Updated by swapInit</div>',
			},
		);

		const { htswapInit } = await import("../src/htswap.ts");

		htswapInit();

		click("#go");

		await delay(10);

		expect(document.querySelector("#target")?.textContent).toEqual(
			"Updated by swapInit",
		);
	});

	test("Should work with back button.", async () => {
		setupEnvironment(
			`
			<div>
				<a id="go" href="/new" target="#target">
					Go
				</a>
				<div id="target">Original</div>
			</div>
			`,
			{
				"/new": () => '<div id="target">Updated by swapInit</div>',
				"/": () => '<div id="target">Original</div>',
			},
		);

		const { htswapInit } = await import("../src/htswap.ts");
		htswapInit();

		click("#go");
		await delay(10);

		expect(document.querySelector("#target")?.textContent).toEqual(
			"Updated by swapInit",
		);

		window.history.back();
		await delay(10);

		expect(document.querySelector("#target")?.textContent).toEqual("Original");
	});
});

describe("Forms", async () => {
	test("Should work normally.", async () => {
		setupEnvironment(
			`
			<div>
				<form action="/search" target="#list">
					<input type="text" id="title" name="title" />
					<button id="do-search" type="submit">submit</button>
				</form>
				<ul id="list">
					<li>P1</li>
					<li>P2</li>
					<li>P3</li>
				</ul>
			</div>
			`,
			{
				"/search": (params) => {
					const elements = ["P1", "P2", "P3"]
						.filter((v) => v.includes(params?.get("title") || ""))
						.map((v) => `<li>${v}</li>`);

					return untabHTML(`
					<ul id="list">
						${elements.toString()}
					</ul>
				`);
				},
			},
		);

		const { htswapInit } = await import("../src/htswap.ts");
		htswapInit();

		input("#title", "P1");
		await delay(10);
		click("#do-search");
		await delay(10);

		expect(
			untabHTML(document.querySelector("#list")?.innerHTML.toString() || ""),
		).toEqual(untabHTML(`<li>P1</li>`));

		input("#title", "P3");
		await delay(10);
		click("#do-search");
		await delay(10);

		expect(
			untabHTML(document.querySelector("#list")?.innerHTML.toString() || ""),
		).toEqual(untabHTML(`<li>P3</li>`));
	});
});
