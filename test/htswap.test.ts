// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { click, delay, input, setupEnvironment, untab } from "./tools.ts";

describe("Links", async () => {
	test("Should swap with parent activated", async () => {
		setupEnvironment(
			`
			<div data-htswap>
				<a id="go" href="/new">
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

	test("Should swap with target not specified", async () => {
		setupEnvironment(
			`
			<div>
				<a id="go" href="/new" data-htswap>
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

	test("Should not swap with locked specifiecd", async () => {
		setupEnvironment(
			`
			<div data-htswap>
				<a id="go" href="/new" data-htlocked>
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

		expect(document.querySelector("#target")?.textContent).toEqual("Original");
	});

	test("Should swap with target specified", async () => {
		setupEnvironment(
			`
			<div>
				<a id="go" href="/new" data-htswap="#target">
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
			<div id="page">
				<a id="go" href="/page1" data-htswap="#page">
					Go
				</a>
				<div id="content">Original</div>
			</div>
			`,
			{
				"/page1": () => `
					<div id="page">
						<a id="go" href="/page2" data-htswap="#page">
							Go
						</a>
						<div id="content">Page1</div>
					</div>
				`,
				"/page2": () => `
					<div id="page">
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
			<div>
				<a id="go" href="/new" data-htswap="#target, #target2">
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

	test("Should swap with aliases if specified", async () => {
		setupEnvironment(
			`
			<div>
				<a id="go" href="/new" data-htswap="#targ1, #targ2" data-htfrom="#el1, #el2">
					Go
				</a>

				<div id="targ1">The first target</div>
				<div id="targ2">The second target</div>
			</div>
			`,
			{
				"/new": () =>
					`
					<div>
						<div id="el1">The first element</div>
						<div id="el2">The second element</div>
					</dvi>
					`,
			},
		);

		const { htswapInit } = await import("../src/htswap.ts");

		htswapInit();

		click("#go");

		await delay(10);

		expect(document.querySelector("#el1")?.textContent).toEqual(
			"The first element",
		);
		expect(document.querySelector("#el2")?.textContent).toEqual(
			"The second element",
		);
	});

	test("Should swap according to merge modes", async () => {
		setupEnvironment(
			`
			<div>
				<a id="go" href="/new" data-htswap="#target@afterend, #target4@beforebegin">
					Go
				</a>
				<div id="target-list">
					<div id="target">First</div>
					<div id="target4">Fourth</div>
				</div>
			</div>
			`,
			{
				"/new": () =>
					'<div id="target">Second</div><div id="target4">Third</div>',
			},
		);

		const { htswapInit } = await import("../src/htswap.ts");

		htswapInit();

		click("#go");

		await delay(10);

		expect(untab(document.querySelector("#target-list")?.textContent)).toEqual(
			untab(`
				FirstSecond
				ThirdFourth
			`),
		);
	});
});

describe("Forms", async () => {
	test("Should swap on submit with GET", async () => {
		setupEnvironment(
			`
			<div>
				<form action="/search" data-htswap="#list">
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

					return untab(`
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
			untab(document.querySelector("#list")?.innerHTML.toString() || ""),
		).toEqual(
			untab(`
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
			untab(document.querySelector("#list")?.innerHTML.toString() || ""),
		).toEqual(untab(`<li>P1</li>`));

		input("#title", "P3");
		await delay(10);
		click("#do-search");
		await delay(10);

		expect(
			untab(document.querySelector("#list")?.innerHTML.toString() || ""),
		).toEqual(untab(`<li>P3</li>`));
	});

	test("Should swap on submit with POST", async () => {
		setupEnvironment(
			`
			<div>
				<form action="/signup" method="post" data-htswap="#response">
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

					return untab(`
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
			untab(document.querySelector("#response")?.innerHTML.toString() || ""),
		).toEqual(
			untab(`
			<p>Welcome, testuser!</p>
			<p>Email: test@example.com</p>
		`),
		);
	});
});
