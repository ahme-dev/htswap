import { prepareHead } from "../support/helpers";

describe("Multiple Targets", () => {
	it("Should swap multiple targets simultaneously", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div>
							<a id="update-link" href="/update" data-htswap="#header,#footer">Update All</a>
							<div id="header">Original Header</div>
							<div>Original Content</div>
							<div id="footer">Original Footer</div>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/update", {
				statusCode: 200,
				body: `
				<div id="header">Updated Header</div>
				<div id="footer">Updated Footer</div>
				`,
			}).as("getUpdate");

			cy.visit("/");

			// test

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#update-link").click();
			cy.wait("@getUpdate");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});

			cy.get("#header").should("contain.text", "Updated Header");
			cy.get("#footer").should("contain.text", "Updated Footer");
		});
	});
});

describe("Loading States", () => {
	it("Should add aria-busy on body when loading", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
        <!DOCTYPE html>
        <html>
          ${head}
          <body>
            <div data-htbind>
              <a id="update-link" href="/update">Update</a>
              <div id="content" style="height: 2000px;">Original Content</div>
            </div>
          </body>
        </html>
      `,
			});

			cy.intercept("GET", "/update", (req) => {
				req.reply({
					statusCode: 200,
					delay: 1000,
					body: `
          <div data-htbind>
            <div id="content" style="height: 2000px;">Updated Content</div>
          </div>
        `,
				});
			}).as("getUpdate");

			cy.visit("/");

			// test

			cy.get("body").should("not.have.attr", "aria-busy");

			cy.get("#update-link").click();
			cy.wait(50);
			cy.get("body").should("have.attr", "aria-busy", "true");

			cy.wait("@getUpdate");
			cy.get("body").should("have.attr", "aria-busy", "false");
			cy.get("#content").should("contain.text", "Updated Content");
		});
	});

	it("Should set aria-busy on all targets during swap", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div>
							<a id="update-link" href="/update" data-htswap="#first,#second,#third">Update</a>
							<div id="first">First</div>
							<div id="second">Second</div>
							<div id="third">Third</div>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/update", {
				statusCode: 200,
				delay: 1000,
				body: `
				<div id="first">Updated First</div>
				<div id="second">Updated Second</div>
				<div id="third">Updated Third</div>
				`,
			}).as("getUpdate");

			cy.visit("/");

			cy.get("#first").should("not.have.attr", "aria-busy");
			cy.get("#second").should("not.have.attr", "aria-busy");
			cy.get("#third").should("not.have.attr", "aria-busy");

			cy.get("#update-link").click();

			cy.get("#first").should("have.attr", "aria-busy", "true");
			cy.get("#second").should("have.attr", "aria-busy", "true");
			cy.get("#third").should("have.attr", "aria-busy", "true");

			cy.wait("@getUpdate");

			cy.get("#first").should("have.attr", "aria-busy", "false");
			cy.get("#second").should("have.attr", "aria-busy", "false");
			cy.get("#third").should("have.attr", "aria-busy", "false");

			cy.get("#first").should("contain.text", "Updated First");
			cy.get("#second").should("contain.text", "Updated Second");
			cy.get("#third").should("contain.text", "Updated Third");
		});
	});
});

describe("Auto Targeting", () => {
	it("Should auto target when specified", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
			<!DOCTYPE html>
			<html>
				${head}
				<body data-htbind="auto">
					<div>
						<a id="update-link" href="/update">Update</a>
						<div id="content">Welcome!</div>
						<div id="footer">Original Footer</div>
					</div>
				</body>
			</html>
			`,
			});
			cy.intercept("GET", "/update", {
				statusCode: 200,
				body: `
					<div id="footer">Updated Footer</div>
				`,
			}).as("getUpdate");

			cy.visit("/");

			// test

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#update-link").click();
			cy.wait("@getUpdate");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#footer").should("contain.text", "Updated Footer");
			cy.get("#content").should("contain.text", "Welcome");
		});
	});

	it("Should auto target multiple elements when specified", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
			<!DOCTYPE html>
			<html>
				${head}
				<body>
					<div data-htbind="auto">
						<a id="update-link" href="/update">Update</a>
						<div id="header">Original Header</div>
						<div id="content">Welcome!</div>
						<div id="footer">Original Footer</div>
					</div>
				</body>
			</html>
			`,
			});
			cy.intercept("GET", "/update", {
				statusCode: 200,
				body: `
					<div id="header">Updated Header</div>
					<div id="footer">Updated Footer</div>
				`,
			}).as("getUpdate");

			cy.visit("/");

			// test

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#update-link").click();
			cy.wait("@getUpdate");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#header").should("contain.text", "Updated Header");
			cy.get("#footer").should("contain.text", "Updated Footer");
			cy.get("#content").should("contain.text", "Welcome");
		});
	});

	it("Should not auto target if body exists within response", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
			<!DOCTYPE html>
			<html>
				${head}
				<body data-htbind="auto">
					<div>
						<a id="update-link" href="/update">Update</a>
						<div id="content">Welcome!</div>
						<div id="footer">Original Footer</div>
					</div>
				</body>
			</html>
			`,
			});
			cy.intercept("GET", "/update", {
				statusCode: 200,
				body: `
				<body>
					<div id="footer">Updated Footer</div>
				</body>
				`,
			}).as("getUpdate");

			cy.visit("/");

			// test

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#update-link").click();
			cy.wait("@getUpdate");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#footer").should("contain.text", "Updated Footer");
			cy.get("#content").should("not.exist");
		});
	});
});

describe("Target Aliases", () => {
	it("Should alias targets correctly", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
			<!DOCTYPE html>
			<html>
				${head}
				<body>
					<div>
						<a id="update-link" data-htswap="#diff-content->#content" href="/update">Update</a>
						<div id="content">Welcome!</div>
					</div>
				</body>
			</html>
			`,
			});
			cy.intercept("GET", "/update", {
				statusCode: 200,
				body: `
					<div id="diff-content">Bye!</div>
				`,
			}).as("getUpdate");

			cy.visit("/");

			// test

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#update-link").click();
			cy.wait("@getUpdate");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#content").should("contain.text", "Bye");
		});
	});

	it("Should alias multiple targets correctly", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
			<!DOCTYPE html>
			<html>
				${head}
				<body>
					<div>
						<a data-htswap="#diff-content->#content, #header->#footer" id="update-link" href="/update">Update</a>
						<div id="content">Welcome!</div>
						<div id="footer">Info</div>
					</div>
				</body>
			</html>
			`,
			});
			cy.intercept("GET", "/update", {
				statusCode: 200,
				body: `
					<div id="header">Logo</div>
					<div id="diff-content">Bye</div>
				`,
			}).as("getUpdate");

			cy.visit("/");

			// test

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#update-link").click();
			cy.wait("@getUpdate");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#footer").should("contain.text", "Logo");
			cy.get("#content").should("contain.text", "Bye");
		});
	});
});

describe("Swap Modes", () => {
	it("Should use swap modes", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<nav>
								<a id="update" href="/update" data-htswap="#content@afterend">Update</a>
							</nav>
							<main>
								<p id="content">
									Welcome!
								</p>
							</main>
						</body>
					</html>
				`,
			});
			cy.intercept("GET", "/update", {
				statusCode: 200,
				body: `
					<p id="added">to the site!</p>
				`,
			}).as("getUpdate");

			cy.visit("/");

			// test

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#update").click();
			cy.wait("@getUpdate");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#content").should("contain.text", "Welcome!");
			cy.get("#added").should("contain.text", "to the site!");
		});
	});

	it("Should use swap modes with multi targeting", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<nav>
								<a id="update" href="/update" data-htswap="#content@afterend,main@afterbegin">Update</a>
							</nav>
							<main>
								<p id="content">
									Welcome!
								</p>
							</main>
						</body>
					</html>
				`,
			});
			cy.intercept("GET", "/update", {
				statusCode: 200,
				body: `
					<p id="added">to the site!</p>
				`,
			}).as("getUpdate");

			cy.visit("/");

			// test

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#update").click();
			cy.wait("@getUpdate");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#content").should("contain.text", "Welcome!");
			cy.get("#added").should("contain.text", "to the site!");
			cy.get("main")
				.then(($el) => $el.text().replace(/\s+/g, " ").trim())
				.should("equal", "to the site! Welcome! to the site!");
		});
	});
});

describe("Preload", () => {});
