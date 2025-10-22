import { prepareHead } from "../support/helpers";

describe("History Modes", () => {
	it("Should change history correctly for history modes", () => {
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
									<a id="push" href="/products" data-htswap="#content" data-hthistory="push">Products</a>
									<a id="def" href="/about" data-htswap="#content">About</a>
									<a id="replace" href="/contact" data-htswap="#content" data-hthistory="replace">Contact</a>
								</nav>
								<main id="content">
									<h1>Home</h1>
									<p>Welcome to our site</p>
								</main>
							</div>
						</body>
					</html>
				`,
			});
			cy.intercept("GET", "/products", {
				statusCode: 200,
				body: `
					<main id="content">
						<h1>Products</h1>
						<p>Browse our catalog</p>
					</main>
				`,
			}).as("getProducts");
			cy.intercept("GET", "/about", {
				statusCode: 200,
				body: `
					<main id="content">
						<h1>About Us</h1>
						<p>Company information</p>
					</main>
				`,
			}).as("getAbout");
			cy.intercept("GET", "/contact", {
				statusCode: 200,
				body: `
					<main id="content">
						<h1>Contact</h1>
						<p>Get in touch</p>
					</main>
				`,
			}).as("getContact");

			cy.visit("/");

			cy.window().then((win: Window) => {
				const initialHistory = win.history.length;

				cy.get("#push").click();
				cy.wait("@getProducts");
				cy.get("#content").should("contain", "Products");
				cy.window().then((win) => {
					expect(win.history.length).to.equal(initialHistory + 1);
				});

				cy.get("#def").click();
				cy.wait("@getAbout");
				cy.get("#content").should("contain", "About Us");
				cy.window().then((win) => {
					expect(win.history.length).to.equal(initialHistory + 2);
				});

				cy.get("#replace").click();
				cy.wait("@getContact");
				cy.get("#content").should("contain", "Contact");
				cy.window().then((win) => {
					expect(win.history.length).to.equal(initialHistory + 2);
				});

				cy.go("back");
				cy.get("#content").should("contain", "Products");

				cy.go("back");
				cy.get("#content").should("contain", "Home");
			});
		});
	});

	it("Should change history correctly for forms with history modes", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div>
								<form id="push-form" method="GET" action="/search" data-htswap="#content" data-hthistory="push">
									<input type="text" name="q" value="laptop" />
									<button type="submit">Search</button>
								</form>
								<form id="replace-form" method="GET" action="/filter" data-htswap="#content" data-hthistory="replace">
									<select name="category">
										<option value="electronics">Electronics</option>
									</select>
									<button type="submit">Filter</button>
								</form>
								<main id="content">
									<h1>Products</h1>
									<p>All items</p>
								</main>
							</div>
						</body>
					</html>
				`,
			});
			cy.intercept("GET", "/search?q=laptop", {
				statusCode: 200,
				body: `
					<main id="content">
						<h1>Search Results</h1>
						<p>Results for "laptop"</p>
					</main>
				`,
			}).as("getSearch");
			cy.intercept("GET", "/filter?category=electronics", {
				statusCode: 200,
				body: `
					<main id="content">
						<h1>Filtered Results</h1>
						<p>Electronics category</p>
					</main>
				`,
			}).as("getFilter");

			cy.visit("/");

			cy.window().then((win: Window) => {
				const initialHistory = win.history.length;

				cy.get("#push-form").submit();
				cy.wait("@getSearch");
				cy.get("#content").should("contain", "Search Results");
				cy.window().then((win) => {
					expect(win.history.length).to.equal(initialHistory + 1);
				});

				cy.get("#replace-form").submit();
				cy.wait("@getFilter");
				cy.get("#content").should("contain", "Filtered Results");
				cy.window().then((win) => {
					expect(win.history.length).to.equal(initialHistory + 1);
				});

				cy.go("back");
				cy.get("#content").should("contain", "Products");
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
							<div data-htswap>
								<nav>
									<a id="push-link" href="/blog" data-hthistory="push">Blog</a>
									<a id="replace-link" href="/archive" data-hthistory="replace">Archive</a>
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
							<a id="replace-link" href="/archive" data-hthistory="replace">Archive</a>
						</nav>
						<main id="content">
							<h1>Blog</h1>
							<p>Latest posts</p>
						</main>
					</div>
				`,
			});
			cy.intercept("GET", "/archive", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<main id="content">
							<h1>Archive</h1>
							<p>Past posts</p>
						</main>
					</div>
				`,
			});

			cy.visit("/");
			cy.location("pathname").should("equal", "/");

			cy.get("#push-link").click();
			cy.location("pathname").should("equal", "/blog");
			cy.get("#content").should("contain.text", "Blog");

			cy.get("#replace-link").click();
			cy.location("pathname").should("equal", "/archive");
			cy.get("#content").should("contain.text", "Archive");
		});
	});

	it("Should update URL correctly for forms with history modes", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div data-htswap>
								<form id="push-form" method="GET" action="/search" data-hthistory="push">
									<input type="text" name="q" value="javascript" />
									<button type="submit">Search</button>
								</form>
								<form id="replace-form" method="GET" action="/sort" data-hthistory="replace">
									<select name="order">
										<option value="recent">Recent</option>
									</select>
									<button type="submit">Sort</button>
								</form>
								<main id="content">
									<h1>Articles</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});
			cy.intercept("GET", "/search?q=javascript", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<form id="replace-form" method="GET" action="/sort" data-hthistory="replace">
							<select name="order">
								<option value="recent">Recent</option>
							</select>
							<button type="submit">Sort</button>
						</form>
						<main id="content">
							<h1>Search: javascript</h1>
						</main>
					</div>
				`,
			});
			cy.intercept("GET", "/sort?order=recent", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<main id="content">
							<h1>Sorted by Recent</h1>
						</main>
					</div>
				`,
			});

			cy.visit("/");
			cy.location("pathname").should("equal", "/");

			cy.get("#push-form").submit();
			cy.location("pathname").should("equal", "/search");
			cy.get("#content").should("contain.text", "Search: javascript");

			cy.get("#replace-form").submit();
			cy.location("pathname").should("equal", "/sort");
			cy.get("#content").should("contain.text", "Sorted by Recent");
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
						<div data-htswap>
							<nav>
								<a id="push-link-1" href="/products" data-hthistory="push">Products</a>
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
							<a id="push-link-2" href="/cart" data-hthistory="push">Cart</a>
						</nav>
						<main id="content">
							<h1>Products</h1>
							<p>Our catalog</p>
						</main>
					</div>
				`,
			});
			cy.intercept("GET", "/cart", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<nav>
							<a id="replace-link" href="/checkout" data-hthistory="replace">Checkout</a>
						</nav>
						<main id="content">
							<h1>Shopping Cart</h1>
							<p>2 items</p>
						</main>
					</div>
				`,
			});
			cy.intercept("GET", "/checkout", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<main id="content">
							<h1>Checkout</h1>
							<p>Complete your order</p>
						</main>
					</div>
				`,
			});

			cy.visit("/");

			let initialHistoryLength: number;
			cy.window().then((win) => {
				initialHistoryLength = win.history.length;
				cy.spy(win.history, "pushState").as("pushState");
				cy.spy(win.history, "replaceState").as("replaceState");
			});

			cy.get("#push-link-1").click();
			cy.get("#content").should("contain.text", "Products");
			cy.location("pathname").should("eq", "/products");
			cy.get("@pushState").should("have.been.calledOnce");
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 1);
			});

			cy.get("#push-link-2").click();
			cy.get("#content").should("contain.text", "Shopping Cart");
			cy.location("pathname").should("eq", "/cart");
			cy.get("@pushState").should("have.callCount", 2);
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 2);
			});

			cy.go("back");
			cy.get("#content").should("contain.text", "Products");
			cy.location("pathname").should("eq", "/products");
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 2);
			});

			cy.go("back");
			cy.get("#content").should("contain.text", "Home");
			cy.location("pathname").should("eq", "/");
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 2);
			});

			cy.go("forward");
			cy.get("#content").should("contain.text", "Products");
			cy.location("pathname").should("eq", "/products");

			cy.go("forward");
			cy.get("#content").should("contain.text", "Shopping Cart");
			cy.location("pathname").should("eq", "/cart");

			cy.get("#replace-link").click();
			cy.get("#content").should("contain.text", "Checkout");
			cy.location("pathname").should("eq", "/checkout");
			cy.get("@pushState").should("have.callCount", 2);
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 2);
			});

			cy.go("back");
			cy.get("#content").should("contain.text", "Products");
			cy.location("pathname").should("eq", "/products");

			cy.go("back");
			cy.get("#content").should("contain.text", "Home");
			cy.location("pathname").should("eq", "/");

			cy.get("@pushState").should("have.callCount", 2);
		});
	});

	it("Should work well with browser back/forward for forms", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div data-htswap>
							<form id="search-form" method="GET" action="/search" data-hthistory="push">
								<input type="text" name="q" value="laptop" />
								<button type="submit">Search</button>
							</form>
							<main id="content">
								<h1>Products</h1>
							</main>
						</div>
					</body>
				</html>
			`,
			});
			cy.intercept("GET", "/search?q=laptop", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<form id="filter-form" method="GET" action="/filter" data-hthistory="push">
							<select name="price">
								<option value="low">Low to High</option>
							</select>
							<button type="submit">Filter</button>
						</form>
						<main id="content">
							<h1>Results: laptop</h1>
							<p>50 items found</p>
						</main>
					</div>
				`,
			});
			cy.intercept("GET", "/filter?price=low", {
				statusCode: 200,
				body: `
					<div data-htswap data-hthistory="replace">
						<form id="update-form" method="GET" action="/update">
							<input type="hidden" name="view" value="grid" />
							<button type="submit">Grid View</button>
						</form>
						<main id="content">
							<h1>Filtered Results</h1>
							<p>Sorted by price</p>
						</main>
					</div>
				`,
			});
			cy.intercept("GET", "/update?view=grid", {
				statusCode: 200,
				body: `
					<div data-htswap>
						<main id="content">
							<h1>Grid View</h1>
							<p>Updated display</p>
						</main>
					</div>
				`,
			});

			cy.visit("/");

			let initialHistoryLength: number;
			cy.window().then((win) => {
				initialHistoryLength = win.history.length;
				cy.spy(win.history, "pushState").as("pushState");
				cy.spy(win.history, "replaceState").as("replaceState");
			});

			cy.get("#search-form").submit();
			cy.get("#content").should("contain.text", "Results: laptop");
			cy.location("pathname").should("eq", "/search");
			cy.get("@pushState").should("have.been.calledOnce");
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 1);
			});

			cy.get("#filter-form").submit();
			cy.get("#content").should("contain.text", "Filtered Results");
			cy.location("pathname").should("eq", "/filter");
			cy.get("@pushState").should("have.callCount", 2);
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 2);
			});

			cy.go("back");
			cy.get("#content").should("contain.text", "Results: laptop");
			cy.location("pathname").should("eq", "/search");
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 2);
			});

			cy.go("back");
			cy.get("#content").should("contain.text", "Products");
			cy.location("pathname").should("eq", "/");
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 2);
			});

			cy.go("forward");
			cy.get("#content").should("contain.text", "Results: laptop");
			cy.location("pathname").should("eq", "/search");

			cy.go("forward");
			cy.get("#content").should("contain.text", "Filtered Results");
			cy.location("pathname").should("eq", "/filter");

			cy.get("#update-form").submit();
			cy.get("#content").should("contain.text", "Grid View");
			cy.location("pathname").should("eq", "/update");
			cy.get("@pushState").should("have.callCount", 2);
			cy.window().then((win) => {
				expect(win.history.length).to.eq(initialHistoryLength + 2);
			});

			cy.go("back");
			cy.get("#content").should("contain.text", "Results: laptop");
			cy.location("pathname").should("eq", "/search");

			cy.go("back");
			cy.get("#content").should("contain.text", "Products");
			cy.location("pathname").should("eq", "/");

			cy.get("@pushState").should("have.callCount", 2);
		});
	});
});
