import { prepareHead } from "../support/helpers";

describe("Dynamic Content", () => {
	it("Should swap dynamically without page reload for links", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div data-htswap>
							<nav>
								<a id='about-link' href='/about'>About</a>
							</nav>
							<main id='content'>
								<h1>Home</h1>
								<p>Welcome to our site</p>
							</main>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
					<main id='content'>
						<h1>About Us</h1>
						<p>Learn more about our company</p>
					</main>
				`,
			}).as("getAbout");
			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-link").click();
			cy.wait("@getAbout");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});

			cy.get("#content").should("contain.text", "About Us");
		});
	});

	it("Should swap dynamically without page reload for forms", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div data-htswap>
							<form id='search-form' method='GET' action='/search'>
								<input type='text' name='q' placeholder='Search...' />
								<button type='submit'>Search</button>
							</form>
							<div id='results'>No results yet</div>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/search?q=test", {
				statusCode: 200,
				body: `
					<div id='results'>
						<h2>Search Results</h2>
						<ul>
							<li>Result 1</li>
							<li>Result 2</li>
						</ul>
					</div>
				`,
			}).as("getSearch");
			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("input[name='q']").type("test");
			cy.get("#search-form").submit();
			cy.wait("@getSearch");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});

			cy.get("#results").should("contain.text", "Search Results");
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
						<div data-htswap>
							<nav>
								<a id='about-link' href='/about'>About</a>
							</nav>
							<main id='content'>
								<h1>Home</h1>
							</main>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
					<main id='content'>
						<h1>About Us</h1>
					</main>
				`,
			}).as("getAbout");
			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-link").click();
			cy.wait("@getAbout");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.be
					.undefined;
			});

			cy.get("#content").should("contain.text", "About Us");
		});
	});

	it("Should swap dynamically with keyboard", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div data-htswap>
							<nav>
								<a id='about-link' href='/about'>About</a>
							</nav>
							<main id='content'>
								<h1>Home</h1>
								<p>Welcome to our site</p>
							</main>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
					<main id='content'>
						<h1>About Us</h1>
						<p>Learn more about our company</p>
					</main>
				`,
			}).as("getAbout");
			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-link").focus();
			cy.press(Cypress.Keyboard.Keys.ENTER);
			cy.wait("@getAbout");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});

			cy.get("#content").should("contain.text", "About Us");
		});
	});

	it("Should not swap when ctrl is held", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div data-htswap>
							<nav>
								<a id='about-link' href='/about'>About</a>
							</nav>
							<main id='content'>
								<h1>Home</h1>
								<p>Welcome to our site</p>
							</main>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
					<main id='content'>
						<h1>About Us</h1>
						<p>Learn more about our company</p>
					</main>
				`,
			}).as("getAbout");
			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-link").click({
				ctrlKey: true,
			});

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});

			cy.get("#content").should("contain.text", "Welcome to our site");
		});
	});

	it("Should prevent resubmit of forms during request", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body data-htswap>
						<form id='search-form' method='GET' action='/search'>
							<input type='text' name='q' placeholder='Search...' />
							<button type='submit'>Search</button>
						</form>
						<div id='results'>No results yet</div>
					</body>
				</html>
				`,
			});
			let searches = 0;
			cy.intercept("GET", "/search?q=test", (req) => {
				searches += 1;
				return req.reply({
					statusCode: 200,
					delay: 3000,
					body: `
					<body data-htswap>
						<form id='search-form' method='GET' action='/search'>
							<input type='text' name='q' placeholder='Search...' />
							<button type='submit'>Search</button>
						</form>
						<div id='results'>
							<h2>Search Results (${searches})</h2>
							<ul>
								<li>Result 1</li>
								<li>Result 2</li>
							</ul>
						</div>
					</body>
				`,
				});
			}).as("getSearch");
			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("input[name='q']").type("test");
			cy.get("#search-form").submit();
			cy.get("#search-form [type='submit']").should("be.disabled");
			cy.get("#search-form").submit();
			cy.wait("@getSearch");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});

			cy.get("#results>h2").should("contain.text", "Search Results (1)");
		});
	});
});

describe("Progressive Enhancement", () => {
	it("Should be able to opt in specific anchors", () => {
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
								<a id='about-link' data-htswap href='/about'>About</a>
								<a id='contact-link' href='/contact'>Contact</a>
							</nav>
							<main id='content'>
								<h1>Home</h1>
							</main>
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
						<a id='about-link' href='/about'>About</a>
						<a id='contact-link' href='/contact'>Contact</a>
					</nav>
					<main id='content'>
						<h1>About</h1>
					</main>
				</div>
			`,
			}).as("getAbout");
			cy.intercept("GET", "/contact", {
				statusCode: 200,
				body: `
				<div>
					<nav>
						<a id='about-link' href='/about'>About</a>
						<a id='contact-link' href='/contact'>Contact</a>
					</nav>
					<main id='content'>
						<h1>Contact</h1>
					</main>
				</div>
			`,
			}).as("getContact");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-link").click();
			cy.wait("@getAbout");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#content").should("contain.text", "About");

			cy.get("#contact-link").click();
			cy.wait("@getContact");

			cy.window().should((win) => {
				expect(
					(win as typeof win & { __marker: number }).__marker,
				).to.not.equal(initialMarker);
			});
			cy.get("#content").should("contain.text", "Contact");
		});
	});

	it("Should be able to opt in specific forms", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
			<!DOCTYPE html>
			<html>
				${head}
				<body>
					<div>
						<form id="search-form" method='GET' action='/search'>
							<input type='text' name='q' value='query1' />
							<button type='submit'>Search</button>
						</form>
						<form id='newsletter-form' data-htswap="#content" method='POST' action='/newsletter'>
							<input type='email' name='email' value='test@example.com' />
							<button type='submit'>Subscribe</button>
						</form>
						<div id='content'>Initial content</div>
					</div>
				</body>
			</html>
			`,
			});
			cy.intercept("GET", "/search?q=query1", {
				statusCode: 200,
				body: `<div id='content'>Search results</div>`,
			}).as("getSearch");
			cy.intercept("POST", "/newsletter", (req) => {
				const body = new URLSearchParams(req.body as string);
				const email = body.get("email");
				req.reply({
					statusCode: 200,
					body: `<div id='content'>Newsletter submitted for ${email}</div>`,
				});
			}).as("postNewsletter");

			cy.visit("/");

			// test

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#newsletter-form").submit();
			cy.wait("@postNewsletter");
			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#content").should("contain.text", "Newsletter submitted");

			cy.get("#search-form").submit();
			cy.wait("@getSearch");

			cy.window().should((win) => {
				expect(
					(win as typeof win & { __marker: number }).__marker,
				).to.not.equal(initialMarker);
			});
			cy.get("#content").should("contain.text", "Search results");
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
							<nav data-htswap>
								<a id='about-link' href='/about'>About</a>
								<a id='contact-link' href='/contact'>Contact</a>
							</nav>
							<main id='content'>
								<h1>Home</h1>
							</main>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
				<div>
					<nav data-htswap>
						<a id='about-link' href='/about'>About</a>
						<a id='contact-link' href='/contact'>Contact</a>
					</nav>
					<main id='content'>
						<h1>About</h1>
					</main>
				</div>
			`,
			}).as("getAbout");
			cy.intercept("GET", "/contact", {
				statusCode: 200,
				body: `
				<div>
					<nav data-htswap>
						<a id='about-link' href='/about'>About</a>
						<a id='contact-link' href='/contact'>Contact</a>
					</nav>
					<main id='content'>
						<h1>Contact</h1>
					</main>
				</div>
			`,
			}).as("getContact");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-link").click();
			cy.wait("@getAbout");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#content").should("contain.text", "About");

			cy.get("#contact-link").click();
			cy.wait("@getContact");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#content").should("contain.text", "Contact");
		});
	});

	it("Should be able to opt out specific anchors", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div>
							<nav data-htswap>
								<a id='about-link' href='/about'>About</a>
								<a data-htlocked id='contact-link' href='/contact'>Contact</a>
							</nav>
							<main id='content'>
								<h1>Home</h1>
							</main>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
				<div>
					<nav data-htswap>
						<a id='about-link' href='/about'>About</a>
						<a data-htlocked id='contact-link' href='/contact'>Contact</a>
					</nav>
					<main id='content'>
						<h1>About</h1>
					</main>
				</div>
			`,
			}).as("getAbout");
			cy.intercept("GET", "/contact", {
				statusCode: 200,
				body: `
				<div>
					<nav data-htswap>
						<a id='about-link' href='/about'>About</a>
						<a data-htlocked id='contact-link' href='/contact'>Contact</a>
					</nav>
					<main id='content'>
						<h1>Contact</h1>
					</main>
				</div>
			`,
			}).as("getContact");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-link").click();
			cy.wait("@getAbout");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#content").should("contain.text", "About");

			cy.get("#contact-link").click();
			cy.wait("@getContact");

			cy.window().should((win) => {
				expect(
					(win as typeof win & { __marker: number }).__marker,
				).not.to.equal(initialMarker);
			});
			cy.get("#content").should("contain.text", "Contact");
		});
	});

	it("Should be able to opt out specific forms", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div data-htswap>
							<form id='search-form' method='GET' action='/search'>
								<input type='text' name='q' value='query1' />
								<button type='submit'>Search</button>
							</form>
							<form data-htlocked id='login-form' method='POST' action='/login'>
								<input type='text' name='username' value='user' />
								<button type='submit'>Login</button>
							</form>
							<div id='content'>Initial content</div>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/search?q=query1", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<form id='search-form' method='GET' action='/search'>
							<input type='text' name='q' value='query1' />
							<button type='submit'>Search</button>
						</form>
						<form data-htlocked id='login-form' method='POST' action='/login'>
							<input type='text' name='username' value='user' />
							<button type='submit'>Login</button>
						</form>
						<div id='content'>Search results</div>
					</div>
				`,
			}).as("getSearch");
			cy.intercept("POST", "/login", {
				statusCode: 200,
				body: `<div id='content'>Logged in</div>`,
			}).as("postLogin");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#search-form").submit();
			cy.wait("@getSearch");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#content").should("contain.text", "Search results");

			cy.get("#login-form").submit();
			cy.wait("@postLogin");

			cy.window().should((win) => {
				expect(
					(win as typeof win & { __marker: number }).__marker,
				).not.to.equal(initialMarker);
			});
			cy.get("#content").should("contain.text", "Logged in");
		});
	});
});

describe("Graceful Degradation", () => {
	it("Should not break anchors if there's no JS", () => {
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
								<a data-htswap="#content" data-htpreload id='about-link' href='/about'>About</a>
								<a data-htswap="#content" data-hthistory="replace" id='contact-link' href='/contact'>Contact</a>
							</nav>
							<main id='content'>
								<h1>Home</h1>
							</main>
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
    	      <a data-htswap="#content" data-htpreload id='about-link' href='/about'>About</a>
    	      <a data-htswap="#content" data-hthistory="replace" id='contact-link' href='/contact'>Contact</a>
					</nav>
          <main id='content'>
						<h1>About</h1>
					</main>
        </div>
      `,
			}).as("getAbout");
			cy.intercept("GET", "/contact", {
				statusCode: 200,
				body: `
        <div>
					<nav>
    	      <a data-htswap="#content" data-htpreload id='about-link' href='/about'>About</a>
    	      <a data-htswap="#content" data-hthistory="replace" id='contact-link' href='/contact'>Contact</a>
					</nav>
          <main id='content'>
						<h1>Contact</h1>
					</main>
        </div>
      `,
			}).as("getContact");

			cy.visit("/");

			cy.get("#about-link").click();
			cy.wait("@getAbout");

			cy.get("#content").should("contain.text", "About");

			cy.get("#contact-link").click();
			cy.wait("@getContact");

			cy.get("#content").should("contain.text", "Contact");
		});
	});

	it("Should not break forms if there's no JS", () => {
		prepareHead().then(() => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					<head></head>
					<body>
						<div>
							<form data-htswap="#results" id='search-form' method='GET' action='/search'>
								<input type='text' name='q' value='test' />
								<button type='submit'>Search</button>
							</form>
							<div id='results'>No results</div>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/search?q=test", {
				statusCode: 200,
				body: `
        <div>
          <form data-htswap="#results" id='search-form' method='GET' action='/search'>
						<input type='text' name='q' value='test' />
						<button type='submit'>Search</button>
					</form>
          <div id='results'>
						<h2>Results for "test"</h2>
					</div>
        </div>
      `,
			}).as("getSearch");

			cy.visit("/");

			cy.get("#search-form").submit();
			cy.wait("@getSearch");

			cy.get("#results").should("contain.text", "Results for");
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
						<div data-htswap>
							<a id="load-content" href="/dashboard">Dashboard</a>
							<main id="content">
								<h1>Home</h1>
								<script>window.__scriptCounter = (window.__scriptCounter || 0) + 1;</script>
							</main>
						</div>
					</body>
				</html>
				`,
			});

			cy.intercept("GET", "/dashboard", {
				statusCode: 200,
				body: `
					<main id="content">
						<h1>Dashboard</h1>
						<p>User statistics</p>
						<script>window.__scriptCounter = (window.__scriptCounter || 0) + 1;</script>
					</main>
				`,
			}).as("getDashboard");

			cy.visit("/");

			cy.window().then((win) => {
				expect(
					(win as typeof win & { __scriptCounter: number }).__scriptCounter,
				).to.equal(1);
			});

			cy.get("#load-content").click();
			cy.wait("@getDashboard");

			cy.get("#content").should("contain.text", "Dashboard");
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
						<div data-htswap>
							<a id="theme-toggle" href="/dark-mode">Dark Mode</a>
							<main id="content">
								<h1>Light Mode</h1>
								<style>#content { background-color: white; color: black; }</style>
							</main>
						</div>
					</body>
				</html>
				`,
			});

			cy.intercept("GET", "/dark-mode", {
				statusCode: 200,
				body: `
					<main id="content">
						<h1>Dark Mode</h1>
						<style>#content { background-color: black; color: white; }</style>
					</main>
				`,
			}).as("getDarkMode");

			cy.visit("/");

			cy.get("#content").should(
				"have.css",
				"background-color",
				"rgb(255, 255, 255)",
			);

			cy.get("#theme-toggle").click();
			cy.wait("@getDarkMode");

			cy.get("#content").should("contain.text", "Dark Mode");
			cy.get("#content").should("have.css", "background-color", "rgb(0, 0, 0)");
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
							<title>Home - My Site</title>
							${head.replace(/<head>|<\/head>/g, "")}
						</head>
						<body>
							<div data-htswap>
								<nav>
									<a id="about-link" href="/about">About</a>
								</nav>
								<main id="content">
									<h1>Welcome</h1>
									<p>Homepage content</p>
								</main>
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
						<head><title>About Us - My Site</title></head>
						<body>
							<div data-htswap>
								<nav>
									<a id="about-link" href="/about">About</a>
								</nav>
								<main id="content">
									<h1>About Us</h1>
									<p>Company information</p>
								</main>
							</div>
						</body>
					</html>
				`,
			}).as("getAbout");

			cy.visit("/");

			cy.title().should("equal", "Home - My Site");

			cy.get("#about-link").click();
			cy.wait("@getAbout");

			cy.title().should("equal", "About Us - My Site");
		});
	});

	it("Should update document title on form submission", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Search - My Site</title>
							${head.replace(/<head>|<\/head>/g, "")}
						</head>
						<body>
							<div data-htswap>
								<form id="search-form" method="GET" action="/results">
									<input type="text" name="q" value="product" />
									<button type="submit">Search</button>
								</form>
								<main id="content">
									<h1>Search</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/results?q=product", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head><title>Results for "product" - My Site</title></head>
						<body>
							<div data-htswap>
								<main id="content">
									<h1>Search Results</h1>
									<p>Found 10 results</p>
								</main>
							</div>
						</body>
					</html>
				`,
			}).as("getResults");

			cy.visit("/");

			cy.title().should("equal", "Search - My Site");

			cy.get("#search-form").submit();
			cy.wait("@getResults");

			cy.title().should("equal", 'Results for "product" - My Site');
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
							<div data-htswap>
								<nav>
									<a id="about-link" href="/about">About</a>
								</nav>
								<main id="content">
									<h1>Home</h1>
								</main>
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
							<div data-htswap>
								<nav>
									<a id="about-link" href="/about">About</a>
								</nav>
								<main id="content">
									<h1>About</h1>
								</main>
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
							<div data-htswap>
								<nav>
									<a id="about-link" href="/about">About</a>
								</nav>
								<main id="content">
									<h1>Home</h1>
								</main>
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
							<div data-htswap>
								<nav>
									<a id="about-link" href="/about">About</a>
								</nav>
								<main id="content">
									<h1>About</h1>
								</main>
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
			cy.intercept("GET", "/styles/global.css", {
				statusCode: 200,
				body: "* { box-sizing: border-box; }",
			});

			cy.intercept("GET", "/styles/home.css", {
				statusCode: 200,
				body: "body { background: white; }",
			});

			cy.intercept("GET", "/styles/dashboard.css", {
				statusCode: 200,
				body: "body { background: lightgray; }",
			}).as("getDashboardStyles");

			cy.intercept("GET", "/scripts/analytics.js", {
				statusCode: 200,
				body: "window.__analyticsLoaded = true;",
			});

			cy.intercept("GET", "/scripts/dashboard.js", {
				statusCode: 200,
				body: "window.__dashboardLoaded = true;",
			}).as("getDashboardScript");

			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Home</title>
							<link rel="stylesheet" href="/styles/global.css">
							<link rel="stylesheet" href="/styles/home.css">
							<script src="/scripts/analytics.js"></script>
							${head.replace(/<head>|<\/head>/g, "")}
						</head>
						<body>
							<div data-htswap>
								<nav>
									<a id="dashboard-link" href="/dashboard">Dashboard</a>
								</nav>
								<main id="content">
									<h1>Home</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/dashboard", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Dashboard</title>
							<link rel="stylesheet" href="/styles/global.css">
							<link rel="stylesheet" href="/styles/dashboard.css">
							<script src="/scripts/analytics.js"></script>
							<script src="/scripts/dashboard.js"></script>
						</head>
						<body>
							<div data-htswap>
								<nav>
									<a id="dashboard-link" href="/dashboard">Dashboard</a>
								</nav>
								<main id="content">
									<h1>Dashboard</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			}).as("getDashboard");

			cy.visit("/");

			cy.get('link[href="/styles/global.css"]').should("exist");
			cy.get('link[href="/styles/home.css"]').should("exist");
			cy.get('script[src="/scripts/analytics.js"]').should("exist");

			cy.get("#dashboard-link").click();
			cy.wait("@getDashboard");
			cy.wait("@getDashboardStyles");
			cy.wait("@getDashboardScript");

			cy.get('link[href="/styles/global.css"]').should("exist");
			cy.get('link[href="/styles/dashboard.css"]').should("exist");
			cy.get('script[src="/scripts/analytics.js"]').should("exist");
			cy.get('script[src="/scripts/dashboard.js"]').should("exist");

			cy.window().then((win) => {
				expect(
					(win as typeof win & { __analyticsLoaded: boolean })
						.__analyticsLoaded,
				).to.be.true;
				expect(
					(win as typeof win & { __dashboardLoaded: boolean })
						.__dashboardLoaded,
				).to.be.true;
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
							<div data-htswap>
								<nav>
									<a id="about-link" href="/about">About</a>
								</nav>
								<main id="content">
									<h1>Home</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
					<main id="content">
						<h1>About</h1>
					</main>
				`,
			}).as("getAbout");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-link").click();
			cy.wait("@getAbout");
			cy.get("#content").should("contain.text", "About");
			cy.location("pathname").should("equal", "/about");

			cy.go("back");

			cy.get("#content").should("contain.text", "Home");
			cy.location("pathname").should("equal", "/");
			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
		});
	});

	it("Should handle back button navigation after form submission", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div data-htswap>
								<form id="search-form" method="GET" action="/search">
									<input type="text" name="q" value="test" />
									<button type="submit">Search</button>
								</form>
								<main id="content">
									<h1>Search</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/search?q=test", {
				statusCode: 200,
				body: `
					<main id="content">
						<h1>Results for "test"</h1>
						<p>10 results found</p>
					</main>
				`,
			}).as("getSearch");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#search-form").submit();
			cy.wait("@getSearch");
			cy.get("#content").should("contain.text", "Results for");
			cy.location("pathname").should("equal", "/search");

			cy.go("back");

			cy.get("#content").should("contain.text", "Search");
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
							<div data-htswap>
								<nav>
									<a id="about-link" href="/about">About</a>
								</nav>
								<main id="content">
									<h1>Home</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
					<main id="content">
						<h1>About</h1>
					</main>
				`,
			}).as("getAbout");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#about-link").click();
			cy.wait("@getAbout");
			cy.get("#content").should("contain.text", "About");

			cy.go("back");
			cy.get("#content").should("contain.text", "Home");

			cy.go("forward");

			cy.get("#content").should("contain.text", "About");
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
							<div data-htswap>
								<nav>
									<a id="products-link" href="/products">Products</a>
								</nav>
								<main id="content">
									<h1>Home</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/products", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<nav>
							<a id="cart-link" href="/cart">Cart</a>
						</nav>
						<main id="content">
							<h1>Products</h1>
						</main>
					</div>
				`,
			}).as("getProducts");

			cy.intercept("GET", "/cart", {
				statusCode: 200,
				body: `
					<main id="content">
						<h1>Shopping Cart</h1>
					</main>
				`,
			}).as("getCart");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#products-link").click();
			cy.wait("@getProducts");
			cy.get("#cart-link").click();
			cy.wait("@getCart");

			cy.go("back");
			cy.get("#content").should("contain.text", "Products");
			cy.location("pathname").should("equal", "/products");

			cy.go("back");
			cy.get("#content").should("contain.text", "Home");
			cy.location("pathname").should("equal", "/");

			cy.go("forward");
			cy.get("#content").should("contain.text", "Products");
			cy.location("pathname").should("equal", "/products");

			cy.go("forward");
			cy.get("#content").should("contain.text", "Shopping Cart");
			cy.location("pathname").should("equal", "/cart");

			cy.go("back");
			cy.get("#content").should("contain.text", "Products");
			cy.location("pathname").should("equal", "/products");

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
							<div data-htswap>
								<nav>
									<a id="features-link" href="#features">Features</a>
								</nav>
								<section id="hero" style="height: 2000px; background: lightblue;">
									<h1>Welcome</h1>
								</section>
								<section id="features" style="height: 2000px; background: lightgreen;">
									<h2>Features</h2>
								</section>
							</div>
						</body>
					</html>
				`,
			});
			cy.visit("/");

			cy.window().its("scrollY").should("equal", 0);

			cy.get("#features-link").click();

			cy.location("hash").should("equal", "#features");

			cy.wait(100);

			cy.get("#features").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("features");
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
							<div data-htswap>
								<nav>
									<a id="docs-link" href="/docs">Documentation</a>
								</nav>
								<main id="content">
									<h1>Home</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/docs", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<nav>
							<a id="api-link" href="#api-reference">API Reference</a>
						</nav>
						<main id="content">
							<section style="height: 2000px; background: lightblue;">
								<h1>Getting Started</h1>
							</section>
							<section id="api-reference" style="height: 2000px; background: lightcoral;">
								<h2>API Reference</h2>
							</section>
						</main>
					</div>
				`,
			}).as("getDocs");

			cy.visit("/");

			cy.get("#docs-link").click();
			cy.wait("@getDocs");

			cy.get("#api-link").should("exist");
			cy.window().its("scrollY").should("equal", 0);

			cy.get("#api-link").click();

			cy.location("hash").should("equal", "#api-reference");
			cy.wait(100);

			cy.get("#api-reference").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("api-reference");
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
							<div data-htswap>
								<nav>
									<a id="pricing-link" href="/pricing#enterprise">Enterprise Pricing</a>
								</nav>
								<main id="content">
									<h1>Home</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/pricing", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<main id="content">
							<section id="basic" style="height: 2000px; background: lightyellow;">
								<h2>Basic Plan</h2>
							</section>
							<section id="enterprise" style="height: 2000px; background: lightpink;">
								<h2>Enterprise Plan</h2>
							</section>
						</main>
					</div>
				`,
			}).as("getPricing");

			cy.visit("/");

			cy.get("#pricing-link").click();
			cy.wait("@getPricing");

			cy.location("pathname").should("equal", "/pricing");
			cy.location("hash").should("equal", "#enterprise");

			cy.get("#enterprise").should("exist");
			cy.wait(100);

			cy.get("#enterprise").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("enterprise");
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
							<div data-htswap>
								<nav>
									<a id="blog-link" href="/blog#latest">Latest Posts</a>
								</nav>
								<main id="content">
									<h1>Home</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/blog", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<nav>
							<a id="archive-link" href="/archive#2024">2024 Archive</a>
						</nav>
						<section style="height: 2000px; background: lightgray;">
							<h1>Blog</h1>
						</section>
						<section id="latest" style="height: 2000px; background: lavender;">
							<h2>Latest Posts</h2>
						</section>
					</div>
				`,
			}).as("getBlog");

			cy.intercept("GET", "/archive", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<section style="height: 2000px; background: lightcyan;">
							<h1>Archive</h1>
						</section>
						<section id="2024" style="height: 2000px; background: peachpuff;">
							<h2>2024 Posts</h2>
						</section>
					</div>
				`,
			}).as("getArchive");

			cy.visit("/");

			cy.get("#blog-link").click();
			cy.wait("@getBlog");
			cy.location("hash").should("equal", "#latest");

			cy.get("#latest").should("exist");
			cy.wait(100);

			cy.get("#latest").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("latest");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});

			cy.get("#archive-link").click();
			cy.wait("@getArchive");
			cy.location("hash").should("equal", "#2024");

			cy.get("#2024").should("exist");
			cy.wait(100);

			cy.get("#2024").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("2024");
				expect(el).to.not.be.null;
				// TODO fix this
				// const rect = el?.getBoundingClientRect();
				// expect(rect?.top).to.be.lessThan(150);
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
							<div data-htswap>
								<nav>
									<a id="guide-link" href="/guide#introduction">Guide</a>
								</nav>
								<main id="content">
									<h1>Home</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/guide", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<nav>
							<a id="tutorial-link" href="/tutorial#setup">Tutorial</a>
						</nav>
						<main id="content">
							<section id="introduction" style="height: 2000px; background: mintcream;">
								<h1>Introduction</h1>
							</section>
							<section style="height: 2000px; background: mistyrose;">
								<h2>Overview</h2>
							</section>
						</main>
					</div>
				`,
			}).as("getGuide");

			cy.intercept("GET", "/tutorial", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<main id="content">
							<section style="height: 2000px; background: azure;">
								<h1>Tutorial</h1>
							</section>
							<section id="setup" style="height: 2000px; background: beige;">
								<h2>Setup Instructions</h2>
							</section>
							<section style="height: 2000px; background: cornsilk;">
								<h2>Next Steps</h2>
							</section>
						</main>
					</div>
				`,
			}).as("getTutorial");

			cy.visit("/");

			cy.get("#guide-link").click();
			cy.wait("@getGuide");
			cy.location("pathname").should("equal", "/guide");
			cy.location("hash").should("equal", "#introduction");

			cy.get("#introduction").should("exist");
			cy.wait(100);

			cy.get("#introduction").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("introduction");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});

			cy.get("#tutorial-link").click();
			cy.wait("@getTutorial");
			cy.location("pathname").should("equal", "/tutorial");
			cy.location("hash").should("equal", "#setup");

			cy.get("#setup").should("exist");
			cy.wait(100);

			cy.get("#setup").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("setup");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});

			cy.go("back");
			cy.location("pathname").should("equal", "/guide");
			cy.location("hash").should("equal", "#introduction");

			cy.get("#introduction").should("exist");
			cy.wait(100);

			cy.get("#introduction").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("introduction");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});

			cy.go("back");
			cy.location("pathname").should("equal", "/");
			cy.location("hash").should("equal", "");

			cy.go("forward");
			cy.location("pathname").should("equal", "/guide");
			cy.location("hash").should("equal", "#introduction");

			cy.get("#introduction").should("exist");
			cy.wait(100);

			cy.get("#introduction").should("be.visible");
			cy.window().then((win) => {
				const el = win.document.getElementById("introduction");
				expect(el).to.not.be.null;
				const rect = el?.getBoundingClientRect();
				expect(rect?.top).to.be.lessThan(150);
			});

			cy.go("forward");
			cy.location("pathname").should("equal", "/tutorial");
			cy.location("hash").should("equal", "#setup");

			cy.get("#setup").should("exist");
			cy.wait(100);

			cy.get("#setup").should("be.visible");
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
						<div data-htswap>
							<nav>
								<a id="products-link" href="/products">Products</a>
							</nav>
							<main id="content" style="height: 3000px;">
								<h1>Home</h1>
								<p>Scroll down to see more content</p>
							</main>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/products", {
				statusCode: 200,
				body: `
				<div data-htswap>
					<main id="content" style="height: 3000px;">
						<h1>Products</h1>
						<p>Browse our catalog</p>
					</main>
				</div>
			`,
			}).as("getProducts");

			cy.visit("/");
			cy.scrollTo(0, 500);
			cy.wait(100);
			cy.window().its("scrollY").should("be.closeTo", 500, 10);

			cy.get("#products-link").then(($el) => {
				$el[0].click(); // dom click to prevent cypress auto scroll
			});

			cy.wait("@getProducts");
			cy.get("#content").should("contain.text", "Products");
			cy.window().its("scrollY").should("be.closeTo", 0, 10);

			cy.go("back");
			cy.wait(100);
			cy.get("#content").should("contain.text", "Home");
			cy.window().its("scrollY").should("be.closeTo", 500, 10);
		});
	});

	it("Should maintain scroll position after form submission", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div data-htswap>
							<form id="filter-form" method="GET" action="/products">
								<select name="category">
									<option value="electronics">Electronics</option>
								</select>
								<button type="submit">Filter</button>
							</form>
							<main id="content" style="height: 3000px;">
								<h1>All Products</h1>
								<p>Product listing</p>
							</main>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/products?category=electronics", {
				statusCode: 200,
				body: `
				<div data-htswap>
					<main id="content" style="height: 3000px;">
						<h1>Electronics</h1>
						<p>Filtered products</p>
					</main>
				</div>
			`,
			}).as("getProducts");

			cy.visit("/");
			cy.scrollTo(0, 600);
			cy.wait(100);
			cy.window().its("scrollY").should("be.closeTo", 600, 10);

			cy.get("#filter-form").then(($el) => {
				($el[0] as HTMLFormElement).requestSubmit(); // dom submit to prevent cypress auto scroll
			});

			cy.wait("@getProducts");
			cy.get("#content").should("contain.text", "Electronics");
			cy.window().its("scrollY").should("be.closeTo", 0, 10);

			cy.go("back");
			cy.wait(100);
			cy.get("#content").should("contain.text", "All Products");
			cy.window().its("scrollY").should("be.closeTo", 600, 10);
		});
	});
});
