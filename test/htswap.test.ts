// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { click, delay, input, setupEnvironment, untabHTML } from "./tools.ts";

describe("Links", async () => {
	test("Should swap on click", async () => {
		setupEnvironment(
			`
			<div data-htswap>
				<a id="go" href="/new" data-htswap-target="#target">
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

	test("Should swap with back button", async () => {
		setupEnvironment(
			`
			<div id="page" data-htswap>
				<a id="go" href="/page1" data-htswap-target="#page">
					Go
				</a>
				<div id="content">Original</div>
			</div>
			`,
			{
				"/page1": () => `
					<div id="page" data-htswap>
						<a id="go" href="/page2" data-htswap-target="#page">
							Go
						</a>
						<div id="content">Page1</div>
					</div>
				`,
				"/page2": () => `
					<div id="page" data-htswap>
						<div id="content">Page2</div>
					</div>
				`,
			},
		);

		const { htswapInit } = await import("../src/htswap.ts");
		htswapInit();

		click("#go");
		await delay(10);
		expect(document.querySelector("#content")?.textContent).toEqual("Page1");

		click("#go");
		await delay(10);
		expect(document.querySelector("#content")?.textContent).toEqual("Page2");

		window.history.back();
		await delay(10);
		expect(document.querySelector("#content")?.textContent).toEqual("Page1");

		window.history.back();
		await delay(10);
		expect(document.querySelector("#content")?.textContent).toEqual("Original");
	});

	test("Should swap multiple targets if specified", async () => {
		setupEnvironment(
			`
			<div data-htswap>
				<a id="go" href="/new" data-htswap-target="#target, #target2">
					Go
				</a>
				<div id="target">Original</div>
				<div id="target2">Original</div>
			</div>
			`,
			{
				"/new": () =>
					'<div id="target">1 Updated by swapInit</div> <div id="target2">2 Updated by swapInit</div>',
			},
		);

		const { htswapInit } = await import("../src/htswap.ts");

		htswapInit();

		click("#go");

		await delay(10);

		expect(document.querySelector("#target")?.textContent).toEqual(
			"1 Updated by swapInit",
		);
		expect(document.querySelector("#target2")?.textContent).toEqual(
			"2 Updated by swapInit",
		);
	});
});

describe("Forms", async () => {
	test("Should swap on submit with GET", async () => {
		setupEnvironment(
			`
			<div data-htswap>
				<form action="/search" data-htswap-target="#list">
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
						.filter((v) =>
							v.includes((params as URLSearchParams)?.get("title") || ""),
						)
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

		expect(
			untabHTML(document.querySelector("#list")?.innerHTML.toString() || ""),
		).toEqual(
			untabHTML(`
			<li>P1</li>
			<li>P2</li>
			<li>P3</li>
		`),
		);

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

	test("Should swap on submit with POST", async () => {
		setupEnvironment(
			`
			<div data-htswap>
				<form action="/signup" method="post" data-htswap-target="#response">
					<input type="text" id="username" name="username" />
					<input type="email" id="email" name="email" />
					<input type="password" id="password" name="password" />
					<button id="signup-btn" type="submit">Sign Up</button>
				</form>
				<div id="response"></div>
			</div>
			`,
			{
				"/signup": (formData) => {
					const fd = formData as FormData;
					const username: string = fd.get("username") as string;
					const email: string = fd.get("email") as string;

					return untabHTML(`
					<div id="response">
						<p>Welcome, ${username}!</p>
						<p>Email: ${email}</p>
					</div>
				`);
				},
			},
		);

		const { htswapInit } = await import("../src/htswap.ts");
		htswapInit();

		input("#username", "testuser");
		input("#email", "test@example.com");
		input("#password", "secretpassword");
		await delay(10);

		click("#signup-btn");
		await delay(10);

		expect(
			untabHTML(
				document.querySelector("#response")?.innerHTML.toString() || "",
			),
		).toEqual(
			untabHTML(`
			<p>Welcome, testuser!</p>
			<p>Email: test@example.com</p>
		`),
		);
	});
});
