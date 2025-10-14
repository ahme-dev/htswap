import {
	initScript,
	parseMultipartFormData,
	type TMultipartFormDataReq,
} from "../support/helpers";

describe("HTSwap Links", () => {
	it("Should swap with parent activated", () => {
		initScript().then((script) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `${script}<div data-htbind><a id='go' href='/new'>Go</a><div id='target'>Original</div></div>`,
			});
			cy.visit("/");

			cy.intercept("GET", "/new", {
				statusCode: 200,
				body: '<div id="target">Updated by swapInit</div>',
			}).as("getNew");

			cy.get("#go").click();
			cy.wait("@getNew");
			cy.get("#target").should("contain.text", "Updated by swapInit");
		});
	});

	it("Should swap with target not specified", () => {
		initScript().then((script) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					${script}
					<div>
						<a id="go" href="/new" data-htswap>Go</a>
						<div id="target">Original</div>
					</div>
				`,
			});
			cy.visit("/");

			cy.intercept("GET", "/new", {
				statusCode: 200,
				body: '<div id="target">Updated by swapInit</div>',
			}).as("getNew");

			cy.get("#go").click();
			cy.wait("@getNew");
			cy.get("#target").should("contain.text", "Updated by swapInit");
		});
	});

	it("Should not swap with bound specified", () => {
		initScript().then((script) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					${script}
					<div data-htbind>
						<a id="go" href="/new" onclick="event.preventDefault();" data-htbound="true" data-htswap="#target">Go</a>
						<div id="target">Original</div>
					</div>
				`,
			});
			cy.visit("/");

			cy.intercept("GET", "/new", {
				statusCode: 200,
				body: '<div id="target">Updated by swapInit</div>',
			}).as("getNew");

			cy.get("#go").click().wait(100);
			cy.get("#target").should("contain.text", "Original");
		});
	});

	it("Should swap with target specified", () => {
		initScript().then((script) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					${script}
					<div>
						<a id="go" href="/new" data-htswap="#target">Go</a>
						<p id="not-target">Unchanged</p>
						<div id="target">Original</div>
					</div>
				`,
			});

			cy.visit("/");
			cy.get("#go").should("have.attr", "data-htbound");

			cy.intercept("GET", "/new", {
				statusCode: 200,
				body: '<div id="target">Updated by swapInit</div>',
			}).as("getNew");

			cy.get("#go").click();
			cy.wait("@getNew");
			cy.get("#target").should("contain.text", "Updated by swapInit");
			cy.get("#not-target").should("contain.text", "Unchanged");
		});
	});

	it("Should swap with back button", () => {
		initScript().then((script) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				${script}
				<div id="page">
					<a id="go" href="/page1" data-htswap="#page">Go</a>
					<div id="content">Original</div>
				</div>
			`,
			});
			cy.visit("/");

			cy.intercept("GET", "/page1", {
				statusCode: 200,
				body: `
				<div id="page">
					<a id="go" href="/page2" data-htswap="#page" data-hthistory>Go</a>
					<div id="content">Page1</div>
				</div>
			`,
			}).as("getPage1");

			cy.intercept("GET", "/page2", {
				statusCode: 200,
				body: `
				<div id="page">
					<div id="content">Page2</div>
				</div>
			`, // ✅ Added #page wrapper
			}).as("getPage2");

			cy.get("#go").click();
			cy.wait("@getPage1");
			cy.get("#content").should("contain.text", "Page1");
			cy.get("#go").should("have.attr", "href", "/page2");

			cy.get("#go").click();
			cy.wait("@getPage2");
			cy.get("#content").should("contain.text", "Page2");

			cy.go("back");
			cy.get("#content").should("contain.text", "Page1");

			cy.go("back");
			cy.get("#content").should("contain.text", "Original");
		});
	});
	it("Should swap multiple targets if specified", () => {
		initScript().then((script) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					${script}
					<div>
						<a id="go" href="/new" data-htswap="#target, #target2">Go</a>
						<div id="target">Original</div>
						<div id="target2">Original</div>
					</div>
				`,
			});
			cy.visit("/");

			cy.intercept("GET", "/new", {
				statusCode: 200,
				body: '<div id="target">1 Updated by swapInit</div> <div id="target2">2 Updated by swapInit</div>',
			}).as("getNew");

			cy.get("#go").click();
			cy.wait("@getNew");
			cy.get("#target").should("contain.text", "1 Updated by swapInit");
			cy.get("#target2").should("contain.text", "2 Updated by swapInit");
		});
	});

	it("Should swap with aliases if specified", () => {
		initScript().then((script) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					${script}
					<div>
						<a id="go" href="/new" data-htswap="#el1->#targ1, #el2->#targ2">Go</a>
						<div id="target-list">
							<div id="targ1">The first target</div>
							<div id="targ2">The second target</div>
						</div>
					</div>
				`,
			});
			cy.visit("/");

			cy.intercept("GET", "/new", {
				statusCode: 200,
				body: `
					<div>
						<div id="el1">The first element</div>
						<div id="el2">The second element</div>
					</div>
				`,
			}).as("getNew");

			cy.get("#go").click();
			cy.wait("@getNew");
			cy.get("#el1").should("contain.text", "The first element");
			cy.get("#el2").should("contain.text", "The second element");

			cy.get("body")
				.invoke("html")
				.then((html: string) => {
					cy.log(html);
				});

			cy.get("#target-list");
		});
	});

	it("Should swap according to merge modes", () => {
		initScript().then((script) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					${script}
					<div>
						<a id="go" href="/new" data-htswap="#el2->#target, #el3->#target4">Go</a>
						<div id="target-list">
							<div id="target">First</div>
							<div id="target4">Fourth</div>
						</div>
					</div>
				`,
			});
			cy.visit("/");

			cy.intercept("GET", "/new", {
				statusCode: 200,
				body: `
					<div>
						<div id="el2">Second</div>
						<div id="el3">Third</div>
					</div>
				`,
			}).as("getNew");

			cy.get("#go").click();
			cy.wait("@getNew");

			cy.get("#target-list")
				.invoke("text")
				.then((text: string) => {
					const normalizedText: string = text.replace(/\s+/g, "");
					expect(normalizedText).to.equal("SecondThird");
				});

			cy.get("body").then(($body) => {
				cy.log($body.html());
			});
		});
	});

	it("Should only fetch once if preloaded", () => {
		initScript().then((script) => {
			let fetchCount: number = 0;

			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					${script}
					<div>
						<a id="go" href="/new" data-htswap="#target" data-htpreload>Go</a>
						<div id="target">Original</div>
					</div>
				`,
			});
			cy.visit("/");

			cy.intercept("GET", "/new", (req) => {
				fetchCount++;
				req.reply({
					statusCode: 200,
					body: '<div id="target">Updated by swapInit</div>',
				});
			}).as("getNew");

			cy.wait(100);
			cy.wait("@getNew");

			cy.then(() => {
				expect(fetchCount).to.equal(1);
			});

			cy.get("#go").click();
			cy.get("#target").should("contain.text", "Updated by swapInit");

			cy.then(() => {
				expect(fetchCount).to.equal(1);
			});
		});
	});

	it("Should allow scripts to work", () => {
		initScript().then((script) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					${script}
					<div>
						<a id="load" href="/one" data-htswap="#target">Load</a>
						<div id="target">
							<p>Original</p>
						</div>
					</div>
				`,
			});
			cy.visit("/");

			cy.intercept("GET", "/one", {
				statusCode: 200,
				body: `
					<div>
						<div id="target">
							<p>Hi</p>
							<script>
								document.getElementById('target').setAttribute('data-script-ran', 'true');
							</script>
						</div>
					</div>
				`,
			}).as("getOne");

			cy.get("#target").should("not.have.attr", "data-script-ran");
			cy.get("#load").click();
			cy.wait("@getOne");
			cy.get("#target").should("have.attr", "data-script-ran", "true");
		});
	});
});

describe("HTSwap Forms", () => {
	it("Should swap on submit with GET", () => {
		initScript().then((script) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					${script}
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
			});
			cy.visit("/");

			cy.intercept("GET", "/search*", (req) => {
				const searchParams: URLSearchParams = new URLSearchParams(
					req.url.split("?")[1] || "",
				);
				const titleFilter: string = searchParams.get("title") || "";

				const elements: string[] = ["P1", "P2", "P3"]
					.filter((v: string): boolean => v.includes(titleFilter))
					.map((v: string): string => `<li>${v}</li>`);

				req.reply({
					statusCode: 200,
					body: `<ul id="list">${elements.join("")}</ul>`,
				});
			}).as("searchRequest");

			cy.get("#list").within(() => {
				cy.get("li").should("have.length", 3);
				cy.contains("P1").should("exist");
				cy.contains("P2").should("exist");
				cy.contains("P3").should("exist");
			});

			cy.get("#title").type("P1");
			cy.get("#do-search").click();
			cy.wait("@searchRequest");

			cy.get("#list").within(() => {
				cy.get("li").should("have.length", 1);
				cy.contains("P1").should("exist");
			});

			cy.get("#title").clear().type("P3");
			cy.get("#do-search").click();
			cy.wait("@searchRequest");

			cy.get("#list").within(() => {
				cy.get("li").should("have.length", 1);
				cy.contains("P3").should("exist");
			});
		});
	});

	it("Should swap on submit with POST", (): void => {
		initScript().then((script) => {
			cy.intercept("POST", "/signup", (req): void => {
				const formData = parseMultipartFormData(req as TMultipartFormDataReq);

				const username = formData.username || "";
				const email = formData.email || "";

				req.reply({
					statusCode: 200,
					body: `
					<div id="response">
						<p>Welcome, ${username}!</p>
						<p>Email: ${email}</p>
					</div>
				`,
				});
			}).as("signupRequest");

			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				${script}
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
			});

			cy.visit("/");

			cy.get("#username").type("testuser");
			cy.get("#email").type("test@example.com");
			cy.get("#password").type("secretpassword");

			cy.get("#signup-btn").click();
			cy.wait("@signupRequest");

			cy.get("#response").within((): void => {
				cy.contains("Welcome, testuser!").should("exist");
				cy.contains("Email: test@example.com").should("exist");
			});
		});
	});
});
