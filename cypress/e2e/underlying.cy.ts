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

	it("Should swap a certain target dynamically", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div data-htswap="#content">
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
			cy.get("nav").should("contain.text", "About");
		});
	});

	it("Should swap response body into target if target doesn't exist on response", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div>
							<nav data-htswap="#content">
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
					<main>
						<h1>Error occured</h1>
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

			cy.get("#content").should("contain.text", "Error occured");
			cy.get("nav").should("contain.text", "About");
		});
	});

	it("Should not swap if target doesn't exist on client", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div>
							<nav data-htswap="#content">
								<a id='about-link' href='/about'>About</a>
							</nav>
							<main>
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
					<main data-htswap="#content">
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
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});

			cy.get("main").should("contain", "Welcome to our site");
			cy.get("nav").should("contain.text", "About");
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

describe("Smart Defaults", () => {
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
