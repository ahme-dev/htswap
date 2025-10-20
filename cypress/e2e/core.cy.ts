import { prepareHead } from "../support/helpers";

describe("Dynamic Content", () => {
	it("Should swap dynamically without page reload", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div data-htbind>
							<a id='about-us' href='/about'>About Us</a>
							<div id='target'>Original</div>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: '<div id="target">Updated</div>',
			}).as("getAbout");
			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-us").click();
			cy.wait("@getAbout");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});

			cy.get("#target").should("contain.text", "Updated");
		});
	});

	it("Should not swap dynamically without script", () => {
		prepareHead().then(() => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					<head>
						<script>window.__marker = Math.random();</script>
					</head>
					<body>
						<div data-htbind>
							<a id='about-us' href='/about'>About Us</a>
							<div id='target'>Original</div>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: '<div id="target">Updated</div>',
			}).as("getAbout");
			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-us").click();
			cy.wait("@getAbout");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.be
					.undefined;
			});

			cy.get("#target").should("contain.text", "Updated");
		});
	});
});

describe("Progressive Enhancement", () => {
	it("Should be able to opt in specific anchors/forms only", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div>
							<nav>
								<a id='about-us' data-htswap href='/about'>About Us</a>
								<a id='contact' href='/contact'>Contact</a>
							</nav>
							<div id='target'>Welcome to the site!</div>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
				<div>
					<nav>
						<a id='about-us' href='/about'>About Us</a>
						<a id='contact' href='/contact'>Contact</a>
					</nav>
					<div id="target">About</div>
				</div>
			`,
			}).as("getAbout");
			cy.intercept("GET", "/contact", {
				statusCode: 200,
				body: `
				<div>
					<nav>
						<a id='about-us' href='/about'>About Us</a>
						<a id='contact' href='/contact'>Contact</a>
					</nav>
					<div id="target">Contact</div>
				</div>
			`,
			}).as("getContact");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-us").click();
			cy.wait("@getAbout");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#target").should("contain.text", "About");

			cy.get("#contact").click();
			cy.wait("@getContact");

			cy.window().should((win) => {
				expect(
					(win as typeof win & { __marker: number }).__marker,
				).to.not.equal(initialMarker);
			});
			cy.get("#target").should("contain.text", "Contact");
		});
	});

	it("Should be able to opt in sections", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div>
							<nav data-htbind>
								<a id='about-us' href='/about'>About Us</a>
								<a id='contact' href='/contact'>Contact</a>
							</nav>
							<div id='target'>Welcome to the site!</div>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
				<div>
					<nav data-htbind>
						<a id='about-us' href='/about'>About Us</a>
						<a id='contact' href='/contact'>Contact</a>
					</nav>
					<div id="target">About</div>
				</div>
			`,
			}).as("getAbout");
			cy.intercept("GET", "/contact", {
				statusCode: 200,
				body: `
				<div>
					<nav data-htbind>
						<a id='about-us' href='/about'>About Us</a>
						<a id='contact' href='/contact'>Contact</a>
					</nav>
					<div id="target">Contact</div>
				</div>
			`,
			}).as("getContact");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-us").click();
			cy.wait("@getAbout");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#target").should("contain.text", "About");

			cy.get("#contact").click();
			cy.wait("@getContact");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#target").should("contain.text", "Contact");
		});
	});

	it("Should be able to opt out specific anchors/forms", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div>
							<nav data-htbind>
								<a id='about-us' href='/about'>About Us</a>
								<a data-htbound id='contact' href='/contact'>Contact</a>
							</nav>
							<div id='target'>Welcome to the site!</div>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
				<div>
					<nav data-htbind>
						<a id='about-us' href='/about'>About Us</a>
						<a data-htbound id='contact' href='/contact'>Contact</a>
					</nav>
					<div id="target">About</div>
				</div>
			`,
			}).as("getAbout");
			cy.intercept("GET", "/contact", {
				statusCode: 200,
				body: `
				<div>
					<nav data-htbind>
						<a id='about-us' href='/about'>About Us</a>
						<a data-htbound id='contact' href='/contact'>Contact</a>
					</nav>
					<div id="target">Contact</div>
				</div>
			`,
			}).as("getContact");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-us").click();
			cy.wait("@getAbout");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#target").should("contain.text", "About");

			cy.get("#contact").click();
			cy.wait("@getContact");

			cy.window().should((win) => {
				expect(
					(win as typeof win & { __marker: number }).__marker,
				).not.to.equal(initialMarker);
			});
			cy.get("#target").should("contain.text", "Contact");
		});
	});
});

describe("Graceful Degradation", () => {
	it("Should not break anchors/forms if there's no JS", () => {
		prepareHead().then(() => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					<head></head>
					<body>
						<div>
							<nav>
								<a data-htswap="#target" data-htpreload id='about-us' href='/about'>About Us</a>
								<a data-htswap="#target" data-hthistory="replace" id='contact' href='/contact'>Contact</a>
							</nav>
							<div id='target'>Welcome to the site!</div>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
        <div>
					<nav>
    	      <a data-htswap="#target" data-htpreload id='about-us' href='/about'>About Us</a>
    	      <a data-htswap="#target" data-hthistory="replace" id='contact' href='/contact'>Contact</a>
					</nav>
          <div id='target'>About</div>
        </div>
      `,
			}).as("getAbout");
			cy.intercept("GET", "/contact", {
				statusCode: 200,
				body: `
        <div>
					<nav>
    	      <a data-htswap="#target" data-htpreload id='about-us' href='/about'>About Us</a>
    	      <a data-htswap="#target" data-hthistory="replace" id='contact' href='/contact'>Contact</a>
					</nav>
          <div id='target'>Contact</div>
        </div>
      `,
			}).as("getContact");

			cy.visit("/");

			cy.get("#about-us").click();
			cy.wait("@getAbout");

			cy.get("#target").should("contain.text", "About");

			cy.get("#contact").click();
			cy.wait("@getContact");

			cy.get("#target").should("contain.text", "Contact");
		});
	});
});

describe("Preserved Inlines", () => {
	it("Should preserve inline scripts during swap", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div data-htbind>
							<a id="load-content" href="/content">Load Content</a>
							<div id="target">
								Original
								<script>window.__scriptCounter = (window.__scriptCounter || 0) + 1;</script>
							</div>
						</div>
					</body>
				</html>
				`,
			});

			cy.intercept("GET", "/content", {
				statusCode: 200,
				body: `<div id="target">
				Updated
				<script>window.__scriptCounter = (window.__scriptCounter || 0) + 1;</script>
			</div>`,
			}).as("getContent");

			cy.visit("/");

			cy.window().then((win) => {
				expect(
					(win as typeof win & { __scriptCounter: number }).__scriptCounter,
				).to.equal(1);
			});

			cy.get("#load-content").click();
			cy.wait("@getContent");

			cy.get("#target").should("contain.text", "Updated");
			cy.window().then((win) => {
				expect(
					(win as typeof win & { __scriptCounter: number }).__scriptCounter,
				).to.equal(2);
			});
		});
	});

	it("Should preserve inline styles during swap", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div data-htbind>
							<a id="load-content" href="/content">Load Content</a>
							<div id="target">
								Original
								<style>#target { background-color: red; }</style>
							</div>
						</div>
					</body>
				</html>
				`,
			});

			cy.intercept("GET", "/content", {
				statusCode: 200,
				body: `<div id="target">
					Updated
					<style>#target { background-color: blue; }</style>
				</div>`,
			}).as("getContent");

			cy.visit("/");

			cy.get("#target").should(
				"have.css",
				"background-color",
				"rgb(255, 0, 0)",
			);

			cy.get("#load-content").click();
			cy.wait("@getContent");

			cy.get("#target").should("contain.text", "Updated");
			cy.get("#target").should(
				"have.css",
				"background-color",
				"rgb(0, 0, 255)",
			);
		});
	});
});

describe("Working Head", () => {
	it("Should update document title on swap", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Home Page</title>
							${head.replace(/<head>|<\/head>/g, "")}
						</head>
						<body>
							<div data-htbind>
								<a id="about-link" href="/about">About</a>
								<div id="content">Home</div>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head><title>About Page</title></head>
						<body>
							<div data-htbind>
								<a id="about-link" href="/about">About</a>
								<div id="content">About</div>
							</div>
						</body>
					</html>
				`,
			}).as("getAbout");

			cy.visit("/");

			cy.title().should("equal", "Home Page");

			cy.get("#about-link").click();
			cy.wait("@getAbout");

			cy.title().should("equal", "About Page");
		});
	});

	it("Should utilize new stylesheets on swap", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/styles/home.css", {
				statusCode: 200,
				body: "body { background-color: white; }",
			});

			cy.intercept("GET", "/styles/about.css", {
				statusCode: 200,
				body: "body { background-color: lightblue; }",
			}).as("getAboutStyles");

			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Home</title>
							<link rel="stylesheet" href="/styles/home.css">
							${head.replace(/<head>|<\/head>/g, "")}
						</head>
						<body>
							<div data-htbind>
								<a id="about-link" href="/about">About</a>
								<div id="content">Home</div>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>About</title>
							<link rel="stylesheet" href="/styles/about.css">
						</head>
						<body>
							<div data-htbind>
								<a id="about-link" href="/about">About</a>
								<div id="content">About</div>
							</div>
						</body>
					</html>
				`,
			}).as("getAbout");

			cy.visit("/");

			cy.get('link[href="/styles/home.css"]').should("exist");
			cy.get('link[href="/styles/about.css"]').should("not.exist");

			cy.get("#about-link").click();
			cy.wait("@getAbout");
			cy.wait("@getAboutStyles");

			cy.get('link[href="/styles/about.css"]').should("exist");
			cy.get("#content").should("contain.text", "About");
		});
	});

	it("Should utilize new scripts on swap", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/scripts/home.js", {
				statusCode: 200,
				body: "window.__homeScriptLoaded = true;",
			});

			cy.intercept("GET", "/scripts/about.js", {
				statusCode: 200,
				body: "window.__aboutScriptLoaded = true;",
			}).as("getAboutScript");

			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Home</title>
							<script src="/scripts/home.js"></script>
							${head.replace(/<head>|<\/head>/g, "")}
						</head>
						<body>
							<div data-htbind>
								<a id="about-link" href="/about">About</a>
								<div id="content">Home</div>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>About</title>
							<script src="/scripts/about.js"></script>
						</head>
						<body>
							<div data-htbind>
								<a id="about-link" href="/about">About</a>
								<div id="content">About</div>
							</div>
						</body>
					</html>
				`,
			}).as("getAbout");

			cy.visit("/");

			cy.window().then((win) => {
				expect(
					(win as typeof win & { __homeScriptLoaded: boolean })
						.__homeScriptLoaded,
				).to.be.true;
			});

			cy.get('script[src="/scripts/home.js"]').should("exist");
			cy.get('script[src="/scripts/about.js"]').should("not.exist");

			cy.get("#about-link").click();
			cy.wait("@getAbout");
			cy.wait("@getAboutScript");

			cy.get('script[src="/scripts/about.js"]').should("exist");
			cy.window().then((win) => {
				expect(
					(win as typeof win & { __aboutScriptLoaded: boolean })
						.__aboutScriptLoaded,
				).to.be.true;
			});
		});
	});

	it("Should handle various stylesheets and scripts", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/styles/common.css", {
				statusCode: 200,
				body: "* { margin: 0; }",
			});

			cy.intercept("GET", "/styles/home.css", {
				statusCode: 200,
				body: "body { background: white; }",
			});

			cy.intercept("GET", "/styles/about.css", {
				statusCode: 200,
				body: "body { background: lightblue; }",
			}).as("getAboutStyles");

			cy.intercept("GET", "/scripts/analytics.js", {
				statusCode: 200,
				body: "window.__analyticsLoaded = true;",
			});

			cy.intercept("GET", "/scripts/about.js", {
				statusCode: 200,
				body: "window.__aboutLoaded = true;",
			}).as("getAboutScript");

			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Home</title>
							<link rel="stylesheet" href="/styles/common.css">
							<link rel="stylesheet" href="/styles/home.css">
							<script src="/scripts/analytics.js"></script>
							${head.replace(/<head>|<\/head>/g, "")}
						</head>
						<body>
							<div data-htbind>
								<a id="about-link" href="/about">About</a>
								<div id="content">Home</div>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>About</title>
							<link rel="stylesheet" href="/styles/common.css">
							<link rel="stylesheet" href="/styles/about.css">
							<script src="/scripts/analytics.js"></script>
							<script src="/scripts/about.js"></script>
						</head>
						<body>
							<div data-htbind>
								<a id="about-link" href="/about">About</a>
								<div id="content">About</div>
							</div>
						</body>
					</html>
				`,
			}).as("getAbout");

			cy.visit("/");

			cy.get('link[href="/styles/common.css"]').should("exist");
			cy.get('link[href="/styles/home.css"]').should("exist");
			cy.get('script[src="/scripts/analytics.js"]').should("exist");

			cy.get("#about-link").click();
			cy.wait("@getAbout");
			cy.wait("@getAboutStyles");
			cy.wait("@getAboutScript");

			cy.get('link[href="/styles/common.css"]').should("exist");
			cy.get('link[href="/styles/about.css"]').should("exist");
			cy.get('script[src="/scripts/analytics.js"]').should("exist");
			cy.get('script[src="/scripts/about.js"]').should("exist");

			cy.window().then((win) => {
				expect(
					(win as typeof win & { __analyticsLoaded: boolean })
						.__analyticsLoaded,
				).to.be.true;
				expect((win as typeof win & { __aboutLoaded: boolean }).__aboutLoaded)
					.to.be.true;
			});
		});
	});
});

describe("History Support", () => {
	it("Should handle back button navigation", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div data-htbind>
								<a id="about-link" href="/about">About</a>
								<div id="target">Home</div>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `<div id="target">About</div>`,
			}).as("getAbout");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-link").click();
			cy.wait("@getAbout");
			cy.get("#target").should("contain.text", "About");
			cy.location("pathname").should("equal", "/about");

			cy.go("back");

			cy.get("#target").should("contain.text", "Home");
			cy.location("pathname").should("equal", "/");
			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
		});
	});

	it("Should handle forward button navigation", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div data-htbind>
								<a id="about-link" href="/about">About</a>
								<div id="target">Home</div>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `<div id="target">About</div>`,
			}).as("getAbout");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-link").click();
			cy.wait("@getAbout");
			cy.get("#target").should("contain.text", "About");

			cy.go("back");
			cy.get("#target").should("contain.text", "Home");

			cy.go("forward");

			cy.get("#target").should("contain.text", "About");
			cy.location("pathname").should("equal", "/about");
			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
		});
	});

	it("Should handle mixed back and forward navigation", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div data-htbind>
								<a id="page1-link" href="/page1">Page 1</a>
								<div id="target">Home</div>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/page1", {
				statusCode: 200,
				body: `
					<div data-htbind>
						<a id="page2-link" href="/page2">Page 2</a>
						<div id="target">Page 1</div>
					</div>
				`,
			}).as("getPage1");

			cy.intercept("GET", "/page2", {
				statusCode: 200,
				body: `<div id="target">Page 2</div>`,
			}).as("getPage2");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#page1-link").click();
			cy.wait("@getPage1");
			cy.get("#page2-link").click();
			cy.wait("@getPage2");

			cy.go("back");
			cy.get("#target").should("contain.text", "Page 1");
			cy.location("pathname").should("equal", "/page1");

			cy.go("back");
			cy.get("#target").should("contain.text", "Home");
			cy.location("pathname").should("equal", "/");

			cy.go("forward");
			cy.get("#target").should("contain.text", "Page 1");
			cy.location("pathname").should("equal", "/page1");

			cy.go("forward");
			cy.get("#target").should("contain.text", "Page 2");
			cy.location("pathname").should("equal", "/page2");

			cy.go("back");
			cy.get("#target").should("contain.text", "Page 1");
			cy.location("pathname").should("equal", "/page1");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
		});
	});
});

describe("Normal Fragments", () => {
	it("Should handle anchor links within the same page", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div data-htbind>
								<a id="section-link" href="#section2">Jump to Section 2</a>
								<div id="section1" style="height: 2000px; background: lightblue;">Section 1</div>
								<div id="section2" style="height: 2000px; background: lightgreen;">Section 2</div>
							</div>
						</body>
					</html>
				`,
			});
			cy.visit("/");

			cy.window().its("scrollY").should("equal", 0);

			cy.get("#section-link").click();

			cy.location("hash").should("equal", "#section2");

			cy.wait(100);

			cy.get("#section2").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("section2");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});
		});
	});

	it("Should handle anchor links after content swap", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div data-htbind>
								<a id="page-link" href="/page">Go to Page</a>
								<div id="content">Home</div>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/page", {
				statusCode: 200,
				body: `
					<div data-htbind>
						<a id="section-link" href="#target-section">Jump to Section</a>
						<div id="content" style="height: 2000px; background: lightblue;">Content</div>
						<div id="target-section" style="height: 2000px; background: lightcoral;">Target Section</div>
					</div>
				`,
			}).as("getPage");

			cy.visit("/");

			cy.get("#page-link").click();
			cy.wait("@getPage");

			cy.get("#section-link").should("exist");
			cy.window().its("scrollY").should("equal", 0);

			cy.get("#section-link").click();

			cy.location("hash").should("equal", "#target-section");
			cy.wait(100);

			cy.get("#target-section").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("target-section");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});
		});
	});

	it("Should navigate to page with hash fragment", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div data-htbind>
								<a id="page-link" href="/page#bottom">Go to Page Bottom</a>
								<div id="content">Home</div>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/page", {
				statusCode: 200,
				body: `
					<div data-htbind>
						<div id="top" style="height: 2000px; background: lightyellow;">Top Content</div>
						<div id="bottom" style="height: 2000px; background: lightpink;">Bottom Content</div>
					</div>
				`,
			}).as("getPage");

			cy.visit("/");

			cy.get("#page-link").click();
			cy.wait("@getPage");

			cy.location("pathname").should("equal", "/page");
			cy.location("hash").should("equal", "#bottom");

			cy.get("#bottom").should("exist");
			cy.wait(100);

			cy.get("#bottom").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("bottom");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});
		});
	});

	it("Should handle hash fragments across multiple page navigations", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div data-htbind>
								<a id="page1-link" href="/page1#section-a">Page 1 Section A</a>
								<div id="content">Home</div>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/page1", {
				statusCode: 200,
				body: `
					<div data-htbind>
						<a id="page2-link" href="/page2#section-b">Page 2 Section B</a>
						<div style="height: 2000px; background: lightgray;">Header</div>
						<div id="section-a" style="height: 2000px; background: lavender;">Section A</div>
					</div>
				`,
			}).as("getPage1");

			cy.intercept("GET", "/page2", {
				statusCode: 200,
				body: `
					<div data-htbind>
						<div style="height: 2000px; background: lightcyan;">Header</div>
						<div id="section-b" style="height: 2000px; background: peachpuff;">Section B</div>
					</div>
				`,
			}).as("getPage2");

			cy.visit("/");

			cy.get("#page1-link").click();
			cy.wait("@getPage1");
			cy.location("hash").should("equal", "#section-a");

			cy.get("#section-a").should("exist");
			cy.wait(100);

			cy.get("#section-a").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("section-a");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});

			cy.get("#page2-link").click();
			cy.wait("@getPage2");
			cy.location("hash").should("equal", "#section-b");

			cy.get("#section-b").should("exist");
			cy.wait(100);

			cy.get("#section-b").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("section-b");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});
		});
	});

	it("Should preserve hash fragments with back and forward navigation", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div data-htbind>
								<a id="page1-link" href="/page1#top">Page 1 Top</a>
								<div id="content">Home</div>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/page1", {
				statusCode: 200,
				body: `
					<div data-htbind>
						<a id="page2-link" href="/page2#middle">Page 2 Middle</a>
						<div id="top" style="height: 2000px; background: mintcream;">Top Section</div>
						<div id="bottom" style="height: 2000px; background: mistyrose;">Bottom Section</div>
					</div>
				`,
			}).as("getPage1");

			cy.intercept("GET", "/page2", {
				statusCode: 200,
				body: `
					<div data-htbind>
						<div id="header" style="height: 2000px; background: azure;">Header</div>
						<div id="middle" style="height: 2000px; background: beige;">Middle Section</div>
						<div id="footer" style="height: 2000px; background: cornsilk;">Footer</div>
					</div>
				`,
			}).as("getPage2");

			cy.visit("/");

			cy.get("#page1-link").click();
			cy.wait("@getPage1");
			cy.location("pathname").should("equal", "/page1");
			cy.location("hash").should("equal", "#top");

			cy.get("#top").should("exist");
			cy.wait(100);

			cy.get("#top").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("top");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});

			cy.get("#page2-link").click();
			cy.wait("@getPage2");
			cy.location("pathname").should("equal", "/page2");
			cy.location("hash").should("equal", "#middle");

			cy.get("#middle").should("exist");
			cy.wait(100);

			cy.get("#middle").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("middle");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});

			cy.go("back");
			cy.location("pathname").should("equal", "/page1");
			cy.location("hash").should("equal", "#top");

			cy.get("#top").should("exist");
			cy.wait(100);

			cy.get("#top").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("top");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});

			cy.go("back");
			cy.location("pathname").should("equal", "/");
			cy.location("hash").should("equal", "");

			cy.go("forward");
			cy.location("pathname").should("equal", "/page1");
			cy.location("hash").should("equal", "#top");

			cy.get("#top").should("exist");
			cy.wait(100);

			cy.get("#top").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("top");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});

			cy.go("forward");
			cy.location("pathname").should("equal", "/page2");
			cy.location("hash").should("equal", "#middle");

			cy.get("#middle").should("exist");
			cy.wait(100);

			cy.get("#middle").should("be.visible");
		});
	});
});

describe("Maintained Scroll", () => {
	it("Should maintain scroll position of previous swaps", () => {
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
			cy.intercept("GET", "/update", {
				statusCode: 200,
				body: `
				<div data-htbind>
					<div id="content" style="height: 2000px;">Updated Content</div>
				</div>
			`,
			}).as("getUpdate");

			cy.visit("/");
			cy.scrollTo(0, 500);
			cy.wait(100);
			cy.window().its("scrollY").should("be.closeTo", 500, 10);

			cy.get("#update-link").then(($el) => {
				$el[0].click(); // dom click to prevent cypress auto scroll
			});

			cy.wait("@getUpdate");
			cy.get("#content").should("contain.text", "Updated Content");
			cy.window().its("scrollY").should("be.closeTo", 0, 10);

			cy.go("back");
			cy.wait(100);
			cy.get("#content").should("contain.text", "Original Content");
			cy.window().its("scrollY").should("be.closeTo", 500, 10);
		});
	});
});
