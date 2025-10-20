import { prepareHead } from "../support/helpers";

describe("History Modes", () => {
	it("Should change history correctly for history modes", () => {
		prepareHead().then((head) => {
			// setup

			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div>
								<a id="push" href="/page1" data-htswap="#content" data-hthistory="push">Push</a>
								<a id="def" href="/page2" data-htswap="#content">Default</a>
								<a id="replace" href="/page3" data-htswap="#content" data-hthistory="replace">Replace</a>
								<div id="content">Original Page</div>
							</div>
						</body>
					</html>
				`,
			});
			cy.intercept("GET", "/page1", {
				statusCode: 200,
				body: `
					<div>
						<div id="content">Page 1</div>
					</div>
				`,
			}).as("getPage1");
			cy.intercept("GET", "/page2", {
				statusCode: 200,
				body: `<div><div id="content">Page 2</div></div>`,
			}).as("getPage2");
			cy.intercept("GET", "/page3", {
				statusCode: 200,
				body: `<div><div id="content">Page 3</div></div>`,
			}).as("getPage3");

			cy.visit("/");

			// test

			cy.window().then((win: Window) => {
				const initialHistory = win.history.length;

				cy.get("#push").click();
				cy.wait("@getPage1");
				cy.get("#content").should("contain", "Page 1");
				cy.window().then((win) => {
					expect(win.history.length).to.equal(initialHistory + 1);
				});

				cy.get("#def").click();
				cy.wait("@getPage2");
				cy.get("#content").should("contain", "Page 2");
				cy.window().then((win) => {
					expect(win.history.length).to.equal(initialHistory + 2);
				});

				cy.get("#replace").click();
				cy.wait("@getPage3");
				cy.get("#content").should("contain", "Page 3");
				cy.window().then((win) => {
					expect(win.history.length).to.equal(initialHistory + 2);
				});

				cy.go("back");
				cy.get("#content").should("contain", "Page 1");

				cy.go("back");
				cy.get("#content").should("contain", "Original Page");
			});
		});
	});

	it("Should update URL correctly for history modes", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div data-htbind>
								<a id="push-link" href="/page1" data-hthistory="push">Push</a>
								<a id="replace-link" href="/page2" data-hthistory="replace">Replace</a>
								<div id="content">Original Page</div>
							</div>
						</body>
					</html>
				`,
			});
			cy.intercept("GET", "/page1", {
				statusCode: 200,
				body: `<div data-htbind><a id="replace-link" href="/page2" data-hthistory="replace">Replace</a><div id="content">Page 1</div></div>`,
			});
			cy.intercept("GET", "/page2", {
				statusCode: 200,
				body: `<div data-htbind><div id="content">Page 2</div></div>`,
			});

			cy.visit("/");
			cy.location("pathname").should("equal", "/");

			cy.get("#push-link").click();
			cy.location("pathname").should("equal", "/page1");
			cy.get("#content").should("contain.text", "Page 1");

			cy.get("#replace-link").click();
			cy.location("pathname").should("equal", "/page2");
			cy.get("#content").should("contain.text", "Page 2");
		});
	});

	it("Should work well with browser back/forward", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div data-htbind>
							<a id="push-link-1" href="/page1" data-hthistory="push">Push 1</a>
							<div id="content">Original Page</div>
						</div>
					</body>
				</html>
			`,
			});
			cy.intercept("GET", "/page1", {
				statusCode: 200,
				body: `<div data-htbind><a id="push-link-2" href="/page2" data-hthistory="push">Push 2</a><div id="content">Page 1</div></div>`,
			});
			cy.intercept("GET", "/page2", {
				statusCode: 200,
				body: `<div data-htbind><a id="replace-link" href="/page3" data-hthistory="replace">Replace</a><div id="content">Page 2</div></div>`,
			});
			cy.intercept("GET", "/page3", {
				statusCode: 200,
				body: `<div data-htbind><div id="content">Page 3</div></div>`,
			});

			cy.visit("/");

			let initialHistoryLength: number;
			cy.window().then((win) => {
				initialHistoryLength = win.history.length;
				cy.spy(win.history, "pushState").as("pushState");
				cy.spy(win.history, "replaceState").as("replaceState");
			});

			cy.get("#push-link-1").click();
			cy.get("#content").should("contain.text", "Page 1");
			cy.location("pathname").should("eq", "/page1");
			cy.get("@pushState").should("have.been.calledOnce");
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 1);
			});

			cy.get("#push-link-2").click();
			cy.get("#content").should("contain.text", "Page 2");
			cy.location("pathname").should("eq", "/page2");
			cy.get("@pushState").should("have.callCount", 2);
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 2);
			});

			cy.go("back");
			cy.get("#content").should("contain.text", "Page 1");
			cy.location("pathname").should("eq", "/page1");
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 2);
			});

			cy.go("back");
			cy.get("#content").should("contain.text", "Original Page");
			cy.location("pathname").should("eq", "/");
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 2);
			});

			cy.go("forward");
			cy.get("#content").should("contain.text", "Page 1");
			cy.location("pathname").should("eq", "/page1");

			cy.go("forward");
			cy.get("#content").should("contain.text", "Page 2");
			cy.location("pathname").should("eq", "/page2");

			cy.get("#replace-link").click();
			cy.get("#content").should("contain.text", "Page 3");
			cy.location("pathname").should("eq", "/page3");
			cy.get("@pushState").should("have.callCount", 2);
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 2);
			});

			cy.go("back");
			cy.get("#content").should("contain.text", "Page 1");
			cy.location("pathname").should("eq", "/page1");

			cy.go("back");
			cy.get("#content").should("contain.text", "Original Page");
			cy.location("pathname").should("eq", "/");

			cy.get("@pushState").should("have.callCount", 2);
		});
	});
});
