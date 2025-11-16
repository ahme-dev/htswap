import { prepareHead } from "../support/helpers";

// history modes needs to be first in the test file due to how history object is not isolated in cypress
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

describe("Multiple Targets", () => {
	it("Should swap multiple targets simultaneously with links", () => {
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
								<a id="dashboard-link" href="/dashboard" data-htswap="#header,#sidebar">Dashboard</a>
							</nav>
							<header id="header">
								<h1>Welcome</h1>
							</header>
							<aside id="sidebar">
								<ul><li>Home</li></ul>
							</aside>
							<main>
								<p>Main content</p>
							</main>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/dashboard", {
				statusCode: 200,
				body: `
				<header id="header">
					<h1>Dashboard</h1>
					<p>User stats</p>
				</header>
				<aside id="sidebar">
					<ul>
						<li>Overview</li>
						<li>Analytics</li>
					</ul>
				</aside>
				`,
			}).as("getDashboard");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#dashboard-link").click();
			cy.wait("@getDashboard");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});

			cy.get("#header").should("contain.text", "Dashboard");
			cy.get("#sidebar").should("contain.text", "Analytics");
		});
	});

	it("Should swap multiple targets simultaneously with forms", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
				<!DOCTYPE html>
				<html>
					${head}
					<body>
						<div>
							<form id="filter-form" method="GET" action="/filter" data-htswap="#results,#stats">
								<select name="category">
									<option value="electronics">Electronics</option>
								</select>
								<button type="submit">Filter</button>
							</form>
							<div id="stats">
								<p>Total: 100 items</p>
							</div>
							<div id="results">
								<p>All products</p>
							</div>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/filter?category=electronics", {
				statusCode: 200,
				body: `
				<div id="stats">
					<p>Total: 25 items</p>
				</div>
				<div id="results">
					<p>Electronics products</p>
					<ul>
						<li>Laptop</li>
						<li>Phone</li>
					</ul>
				</div>
				`,
			}).as("getFilter");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#filter-form").submit();
			cy.wait("@getFilter");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});

			cy.get("#stats").should("contain.text", "25 items");
			cy.get("#results").should("contain.text", "Electronics");
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
            <div data-htswap>
              <nav>
								<a id="profile-link" href="/profile">My Profile</a>
							</nav>
              <main id="content">
								<h1>Home</h1>
								<p>Welcome back</p>
							</main>
            </div>
          </body>
        </html>
      `,
			});

			cy.intercept("GET", "/profile", (req) => {
				req.reply({
					statusCode: 200,
					delay: 1000,
					body: `
          <div data-htswap>
            <main id="content">
							<h1>Profile</h1>
							<p>User information</p>
						</main>
          </div>
        `,
				});
			}).as("getProfile");

			cy.visit("/");

			cy.get("body").should("not.have.attr", "aria-busy");

			cy.get("#profile-link").click();
			cy.wait(50);
			cy.get("body").should("have.attr", "aria-busy", "true");

			cy.wait("@getProfile");
			cy.get("body").should("have.attr", "aria-busy", "false");
			cy.get("#content").should("contain.text", "Profile");
		});
	});

	it("Should add aria-busy on body when loading from form", () => {
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
								<input type="text" name="q" value="laptop" />
								<button type="submit">Search</button>
							</form>
              <main id="results">
								<p>Enter a search term</p>
							</main>
            </div>
          </body>
        </html>
      `,
			});

			cy.intercept("GET", "/search?q=laptop", (req) => {
				req.reply({
					statusCode: 200,
					delay: 1000,
					body: `
          <div data-htswap>
            <main id="results">
							<h2>Search Results</h2>
							<p>Found 15 laptops</p>
						</main>
          </div>
        `,
				});
			}).as("getSearch");

			cy.visit("/");

			cy.get("body").should("not.have.attr", "aria-busy");

			cy.get("#search-form").submit();
			cy.wait(50);
			cy.get("body").should("have.attr", "aria-busy", "true");

			cy.wait("@getSearch");
			cy.get("body").should("have.attr", "aria-busy", "false");
			cy.get("#results").should("contain.text", "Found 15 laptops");
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
							<nav>
								<a id="refresh-link" href="/refresh" data-htswap="#notifications,#messages,#activity">Refresh</a>
							</nav>
							<div id="notifications">
								<h3>Notifications</h3>
								<p>No new notifications</p>
							</div>
							<div id="messages">
								<h3>Messages</h3>
								<p>No new messages</p>
							</div>
							<div id="activity">
								<h3>Activity</h3>
								<p>No recent activity</p>
							</div>
						</div>
					</body>
				</html>
				`,
			});
			cy.intercept("GET", "/refresh", {
				statusCode: 200,
				delay: 1000,
				body: `
				<div id="notifications">
					<h3>Notifications</h3>
					<p>3 new notifications</p>
				</div>
				<div id="messages">
					<h3>Messages</h3>
					<p>2 new messages</p>
				</div>
				<div id="activity">
					<h3>Activity</h3>
					<p>Recent: Login from new device</p>
				</div>
				`,
			}).as("getRefresh");

			cy.visit("/");

			cy.get("#notifications").should("not.have.attr", "aria-busy");
			cy.get("#messages").should("not.have.attr", "aria-busy");
			cy.get("#activity").should("not.have.attr", "aria-busy");

			cy.get("#refresh-link").click();

			cy.get("#notifications").should("have.attr", "aria-busy", "true");
			cy.get("#messages").should("have.attr", "aria-busy", "true");
			cy.get("#activity").should("have.attr", "aria-busy", "true");

			cy.wait("@getRefresh");

			cy.get("#notifications").should("have.attr", "aria-busy", "false");
			cy.get("#messages").should("have.attr", "aria-busy", "false");
			cy.get("#activity").should("have.attr", "aria-busy", "false");

			cy.get("#notifications").should("contain.text", "3 new");
			cy.get("#messages").should("contain.text", "2 new");
			cy.get("#activity").should("contain.text", "Login from");
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
				<body data-htswap="auto">
					<div>
						<nav>
							<a id="update-link" href="/update-stats">Refresh Stats</a>
						</nav>
						<main id="content">
							<h1>Dashboard</h1>
						</main>
						<aside id="stats">
							<p>Users online: 100</p>
						</aside>
					</div>
				</body>
			</html>
			`,
			});
			cy.intercept("GET", "/update-stats", {
				statusCode: 200,
				body: `
					<aside id="stats">
						<p>Users online: 150</p>
						<p>Active sessions: 75</p>
					</aside>
				`,
			}).as("getUpdateStats");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#update-link").click();
			cy.wait("@getUpdateStats");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#stats").should("contain.text", "150");
			cy.get("#stats").should("contain.text", "Active sessions");
			cy.get("#content").should("contain.text", "Dashboard");
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
					<div data-htswap="auto">
						<nav>
							<a id="sync-link" href="/sync">Sync Dashboard</a>
						</nav>
						<header id="header">
							<h1>Dashboard</h1>
							<p>Last updated: 10:00 AM</p>
						</header>
						<main id="content">
							<p>Main content area</p>
						</main>
						<footer id="footer">
							<p>Version 1.0</p>
						</footer>
					</div>
				</body>
			</html>
			`,
			});
			cy.intercept("GET", "/sync", {
				statusCode: 200,
				body: `
					<header id="header">
						<h1>Dashboard</h1>
						<p>Last updated: 10:30 AM</p>
					</header>
					<footer id="footer">
						<p>Version 1.1</p>
						<p>Connected</p>
					</footer>
				`,
			}).as("getSync");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#sync-link").click();
			cy.wait("@getSync");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#header").should("contain.text", "10:30 AM");
			cy.get("#footer").should("contain.text", "Version 1.1");
			cy.get("#footer").should("contain.text", "Connected");
			cy.get("#content").should("contain.text", "Main content");
		});
	});

	it("Should auto target with form submission", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
			<!DOCTYPE html>
			<html>
				${head}
				<body data-htswap="auto">
					<div>
						<form id="settings-form" method="POST" action="/update-settings">
							<input type="checkbox" name="notifications" checked />
							<button type="submit">Save</button>
						</form>
						<main id="content">
							<h1>Settings</h1>
						</main>
						<div id="status">
							<p>Status: Not saved</p>
						</div>
					</div>
				</body>
			</html>
			`,
			});
			cy.intercept("POST", "/update-settings", {
				statusCode: 200,
				body: `
					<div id="status">
						<p>Status: Saved successfully</p>
						<p>Last saved: Just now</p>
					</div>
				`,
			}).as("postSettings");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#settings-form").submit();
			cy.wait("@postSettings");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#status").should("contain.text", "Saved successfully");
			cy.get("#content").should("contain.text", "Settings");
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
				<body data-htswap="auto">
					<div>
						<nav>
							<a id="fullpage-link" href="/full-refresh">Full Page</a>
						</nav>
						<main id="content">
							<h1>Current Page</h1>
						</main>
						<aside id="sidebar">
							<p>Sidebar info</p>
						</aside>
					</div>
				</body>
			</html>
			`,
			});
			cy.intercept("GET", "/full-refresh", {
				statusCode: 200,
				body: `
				<body>
					<div>
						<main id="content">
							<h1>New Page</h1>
						</main>
					</div>
				</body>
				`,
			}).as("getFullRefresh");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#fullpage-link").click();
			cy.wait("@getFullRefresh");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#content").should("contain.text", "New Page");
			cy.get("#sidebar").should("not.exist");
		});
	});

	it("Should integrate head with auto target", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/styles/home.css", {
				statusCode: 200,
				body: "body { background-color: white; }",
			});

			cy.intercept("GET", "/styles/gps.css", {
				statusCode: 200,
				body: "body { background-color: lightblue; }",
			}).as("getGPSStyles");

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
							<div data-htswap="auto">
								<nav>
									<a id="connect-link" href="/connect">Connect Dashboard</a>
								</nav>
								<header id="header">
									<h1>Dashboard</h1>
									<p>Last updated: None</p>
								</header>
								<main id="content">
									<p>Main content area</p>
								</main>
								<footer id="footer">
									<p>Version 1.0</p>
								</footer>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/connect", {
				statusCode: 200,
				body: `
					<head>
						<title>Home - Connected</title>
						<link rel="stylesheet" href="/styles/gps.css">
					</head>

					<header id="header">
						<h1>Dashboard</h1>
						<p>Last updated: 10:30 AM</p>
					</header>
					<footer id="footer">
						<p>Version 1.1</p>
						<p>GPS Systems Connected</p>
					</footer>
				`,
			}).as("getConnect");

			cy.visit("/");

			cy.get('link[href="/styles/home.css"]').should("exist");
			cy.get('link[href="/styles/gps.css"]').should("not.exist");

			cy.get("#header>p").should("contain.text", "Last updated: None");
			cy.get("#footer").should("contain.text", "Version 1.0");
			cy.get("#footer").should("not.contain.text", "GPS Systems Connected");

			cy.get("#connect-link").click();
			cy.wait("@getConnect");
			cy.wait("@getGPSStyles");

			cy.get('link[href="/styles/gps.css"]').should("exist");
			cy.get("#content>p").should("include.text", "Main content area");

			cy.get("#header").should("contain.text", "10:30 AM");
			cy.get("#footer").should("contain.text", "Version 1.1");
			cy.get("#footer").should("contain.text", "GPS Systems Connected");

			cy.title().should("equal", "Home - Connected");
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
						<nav>
							<a id="load-link" data-htswap="#user-profile->#profile-section" href="/user-data">Load Profile</a>
						</nav>
						<section id="profile-section">
							<p>No profile loaded</p>
						</section>
					</div>
				</body>
			</html>
			`,
			});
			cy.intercept("GET", "/user-data", {
				statusCode: 200,
				body: `
					<div id="user-profile">
						<h2>John Doe</h2>
						<p>Software Engineer</p>
					</div>
				`,
			}).as("getUserData");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#load-link").click();
			cy.wait("@getUserData");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#profile-section").should("contain.text", "John Doe");
			cy.get("#profile-section").should("contain.text", "Software Engineer");
			cy.get("nav").should("contain.text", "Load Profile");
		});
	});

	it("Should alias targets correctly with forms", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
			<!DOCTYPE html>
			<html>
				${head}
				<body>
					<div>
						<form id="login-form" data-htswap="#auth-response->#user-info" method="POST" action="/login">
							<input type="text" name="username" value="john" />
							<button type="submit">Login</button>
						</form>
						<div id="user-info">
							<p>Not logged in</p>
						</div>
					</div>
				</body>
			</html>
			`,
			});
			cy.intercept("POST", "/login", {
				statusCode: 200,
				body: `
					<div id="auth-response">
						<p>Logged in as: john</p>
						<p>Session started</p>
					</div>
				`,
			}).as("postLogin");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#login-form").submit();
			cy.wait("@postLogin");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#user-info").should("contain.text", "Logged in as: john");
			cy.get("#user-info").should("contain.text", "Session started");
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
						<nav>
							<a data-htswap="#api-content->#main-content, #api-sidebar->#side-panel" id="dashboard-link" href="/dashboard">Dashboard</a>
						</nav>
						<main id="main-content">
							<p>Loading...</p>
						</main>
						<aside id="side-panel">
							<p>No data</p>
						</aside>
					</div>
				</body>
			</html>
			`,
			});
			cy.intercept("GET", "/dashboard", {
				statusCode: 200,
				body: `
					<div id="api-sidebar">
						<h3>Quick Stats</h3>
						<p>Active users: 42</p>
					</div>
					<div id="api-content">
						<h1>Dashboard Overview</h1>
						<p>Welcome back!</p>
					</div>
				`,
			}).as("getDashboard");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#dashboard-link").click();
			cy.wait("@getDashboard");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#side-panel").should("contain.text", "Quick Stats");
			cy.get("#side-panel").should("contain.text", "Active users: 42");
			cy.get("#main-content").should("contain.text", "Dashboard Overview");
		});
	});

	it("Should fail gracefully if server alias doesn't exist", () => {
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
									<a id="load-link" data-htswap="#target->#profile" href="/user-data">Load Profile</a>
								</nav>
								<section id="profile">
									<p>No profile loaded</p>
								</section>
							</div>
						</body>
					</html>
				`,
			});
			cy.intercept("GET", "/user-data", {
				statusCode: 200,
				body: `
					<div id="updated-profile">
						<h2>John Doe</h2>
						<p>Software Engineer</p>
					</div>
				`,
			}).as("getUserData");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#load-link").click();
			cy.wait("@getUserData");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#profile").should("contain.text", "John Doe");
			cy.get("#profile").should("contain.text", "Software Engineer");
			cy.get("nav").should("contain.text", "Load Profile");
		});
	});

	it("Should fail completely if client target doesn't exist", () => {
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
									<a id="load-link" data-htswap="#target->#no-profile" href="/user-data">Load Profile</a>
								</nav>
								<section id="profile">
									<p>No profile loaded</p>
								</section>
							</div>
						</body>
					</html>
				`,
			});
			cy.intercept("GET", "/user-data", {
				statusCode: 200,
				body: `
					<div id="target">
						<h2>John Doe</h2>
						<p>Software Engineer</p>
					</div>
				`,
			}).as("getUserData");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#load-link").click();
			cy.wait("@getUserData");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#profile").should("contain.text", "No profile loaded");
			cy.get("nav").should("contain.text", "Load Profile");
		});
	});
});

describe("Swap Modes", () => {
	it("Should use swap modes with links", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<nav>
								<a id="load-more" href="/more-posts" data-htswap="#post-list@beforeend">Load More</a>
							</nav>
							<main>
								<ul id="post-list">
									<li>Post 1</li>
									<li>Post 2</li>
								</ul>
							</main>
						</body>
					</html>
				`,
			});
			cy.intercept("GET", "/more-posts", {
				statusCode: 200,
				body: `
					<li>Post 3</li>
					<li>Post 4</li>
				`,
			}).as("getMorePosts");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#load-more").click();
			cy.wait("@getMorePosts");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#post-list").should("contain.text", "Post 1");
			cy.get("#post-list").should("contain.text", "Post 4");
		});
	});

	it("Should use swap modes with forms", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						${head}
						<body>
							<div>
								<form id="comment-form" method="POST" action="/add-comment" data-htswap="#comments@afterbegin">
									<textarea name="text">Great article!</textarea>
									<button type="submit">Post Comment</button>
								</form>
								<div id="comments">
									<article>
										<p>First comment</p>
									</article>
								</div>
							</div>
						</body>
					</html>
				`,
			});
			cy.intercept("POST", "/add-comment", {
				statusCode: 200,
				body: `
					<article>
						<p>Great article!</p>
						<small>Just now</small>
					</article>
				`,
			}).as("postComment");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#comment-form").submit();
			cy.wait("@postComment");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#comments").should("contain.text", "Great article!");
			cy.get("#comments").should("contain.text", "First comment");
			cy.get("#comments")
				.find("article")
				.first()
				.should("contain.text", "Great article!");
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
								<a id="notify" href="/notification" data-htswap="#alert-list@afterbegin,#badge@innerHTML">New Alert</a>
							</nav>
							<header>
								<span id="badge">0</span>
							</header>
							<main>
								<ul id="alert-list">
									<li>System update completed</li>
								</ul>
							</main>
						</body>
					</html>
				`,
			});
			cy.intercept("GET", "/notification", {
				statusCode: 200,
				body: `
					<li>New message received</li>
					<span>1</span>
				`,
			}).as("getNotification");

			cy.visit("/");

			let initialMarker: number;
			cy.window().then((win) => {
				initialMarker = (win as typeof win & { __marker: number }).__marker;
				expect(initialMarker).to.be.not.undefined;
			});

			cy.get("#notify").click();
			cy.wait("@getNotification");

			cy.window().should((win) => {
				expect((win as typeof win & { __marker: number }).__marker).to.equal(
					initialMarker,
				);
			});
			cy.get("#alert-list").should("contain.text", "New message received");
			cy.get("#alert-list").should("contain.text", "System update");
			cy.get("#badge").should("contain.text", "1");
			cy.get("#alert-list")
				.find("li")
				.first()
				.should("contain.text", "New message");
		});
	});
});

describe("Head Modes", () => {
	it("Should replace head by default", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/styles/product.css", {
				statusCode: 200,
				body: ".product-grid { display: grid; }",
			});

			cy.intercept("GET", "/styles/checkout.css", {
				statusCode: 200,
				body: ".checkout-form { max-width: 600px; }",
			}).as("getCheckoutStyles");

			cy.intercept("GET", "/scripts/product-analytics.js", {
				statusCode: 200,
				body: "window.__productPageView = true;",
			});

			cy.intercept("GET", "/scripts/checkout-analytics.js", {
				statusCode: 200,
				body: "window.__checkoutPageView = true;",
			}).as("getCheckoutScript");

			cy.intercept("GET", "/products", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Products</title>
							<link rel="stylesheet" href="/styles/product.css">
							<script src="/scripts/product-analytics.js"></script>
							${head.replace(/<head>|<\/head>/g, "")}
						</head>
						<body>
							<div data-htswap>
								<nav>
									<a id="checkout-link" href="/checkout">Checkout</a>
								</nav>
								<main id="content">
									<h1>Products</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/checkout", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Checkout</title>
							<link rel="stylesheet" href="/styles/checkout.css">
							<script src="/scripts/checkout-analytics.js"></script>
						</head>
						<body>
							<div data-htswap>
								<nav>
									<a id="checkout-link" href="/checkout">Checkout</a>
								</nav>
								<main id="content">
									<h1>Checkout</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			}).as("getCheckout");

			cy.visit("/products");

			cy.get('link[href="/styles/product.css"]').should("exist");
			cy.get('script[src="/scripts/product-analytics.js"]').should("exist");

			cy.get("#checkout-link").click();
			cy.wait("@getCheckout");
			cy.wait("@getCheckoutStyles");
			cy.wait("@getCheckoutScript");

			cy.get('link[href="/styles/product.css"]').should("not.exist");
			cy.get('script[src="/scripts/product-analytics.js"]').should("not.exist");
			cy.get('link[href="/styles/checkout.css"]').should("exist");
			cy.get('script[src="/scripts/checkout-analytics.js"]').should("exist");
		});
	});

	it("Should append head if specified", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/styles/base.css", {
				statusCode: 200,
				body: "body { font-family: sans-serif; }",
			});

			cy.intercept("GET", "/styles/maps.css", {
				statusCode: 200,
				body: ".map-container { height: 400px; }",
			}).as("getMapsStyles");

			cy.intercept("GET", "/scripts/core.js", {
				statusCode: 200,
				body: "window.__coreLoaded = true;",
			});

			cy.intercept("GET", "/scripts/leaflet.js", {
				statusCode: 200,
				body: "window.__leafletLoaded = true;",
			}).as("getLeafletScript");

			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Home</title>
							<link rel="stylesheet" href="/styles/base.css">
							<script src="/scripts/core.js"></script>
							${head.replace(/<head>|<\/head>/g, "")}
						</head>
						<body>
							<div data-htswap data-hthead="append">
								<nav>
									<a id="locations-link" href="/locations">Locations</a>
								</nav>
								<main id="content">
									<h1>Home</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/locations", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Locations</title>
							<link rel="stylesheet" href="/styles/maps.css">
							<script src="/scripts/leaflet.js"></script>
						</head>
						<body>
							<div data-htswap data-hthead="append">
								<nav>
									<a id="locations-link" href="/locations">Locations</a>
								</nav>
								<main id="content">
									<h1>Locations</h1>
									<div class="map-container"></div>
								</main>
							</div>
						</body>
					</html>
				`,
			}).as("getLocations");

			cy.visit("/");

			cy.get('link[href="/styles/base.css"]').should("exist");
			cy.get('script[src="/scripts/core.js"]').should("exist");
			cy.get('link[href="/styles/maps.css"]').should("not.exist");

			cy.get("#locations-link").click();
			cy.wait("@getLocations");
			cy.wait("@getMapsStyles");
			cy.wait("@getLeafletScript");

			cy.get('link[href="/styles/base.css"]').should("exist");
			cy.get('script[src="/scripts/core.js"]').should("exist");
			cy.get('link[href="/styles/maps.css"]').should("exist");
			cy.get('script[src="/scripts/leaflet.js"]').should("exist");

			cy.window().its("__coreLoaded").should("be.true");
			cy.window().its("__leafletLoaded").should("be.true");
		});
	});

	it("Should re-evaluate scripts with data-htreeval", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/scripts/logic.js", {
				statusCode: 200,
				body: "window.__logicScriptLoaded = true;",
			});

			cy.intercept("GET", "/scripts/analytics.js", (req) => {
				return req.reply({
					statusCode: 200,
					body: `
						(function() {
							if (document.readyState === 'loading') {
								document.addEventListener('DOMContentLoaded', function() {
									const current = parseInt(document.body.dataset.analyticsScriptLoaded || '0', 10);
									document.body.dataset.analyticsScriptLoaded = String(current + 1);
								});
							} else {
								const current = parseInt(document.body.dataset.analyticsScriptLoaded || '0', 10);
								document.body.dataset.analyticsScriptLoaded = String(current + 1);
							}
						})();
					`,
				});
			}).as("getAnalyticsScript");

			cy.intercept("GET", "/scripts/tracker.js", (req) => {
				return req.reply({
					statusCode: 200,
					body: `
						(function() {
							if (document.readyState === 'loading') {
								document.addEventListener('DOMContentLoaded', function() {
									const current = parseInt(document.body.dataset.trackerScriptLoaded || '0', 10);
									document.body.dataset.trackerScriptLoaded = String(current + 1);
								});
							} else {
								const current = parseInt(document.body.dataset.trackerScriptLoaded || '0', 10);
								document.body.dataset.trackerScriptLoaded = String(current + 1);
							}
						})();
					`,
				});
			}).as("getTrackerScript");

			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Home</title>
							<script src="/scripts/logic.js"></script>
							<script src="/scripts/analytics.js" data-htreeval></script>
							<script src="/scripts/tracker.js"></script>
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
							<script src="/scripts/analytics.js" data-htreeval></script>
							<script src="/scripts/tracker.js"></script>
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
					(win as typeof win & { __logicScriptLoaded: boolean })
						.__logicScriptLoaded,
				).to.be.true;
			});

			cy.get('script[src="/scripts/logic.js"]').should("exist");

			cy.get("#about-link").click();
			cy.wait("@getAbout");
			cy.wait("@getAnalyticsScript");
			cy.wait("@getTrackerScript");

			cy.get('script[src="/scripts/analytics.js"]').should("exist");
			cy.get('script[src="/scripts/tracker.js"]').should("exist");

			cy.get("@getAnalyticsScript.all").should("have.length", 2);
			cy.get("@getTrackerScript.all").should("have.length", 1);

			// script with reeval is executed twice while another without is executed once only
			cy.get("body").should("have.attr", "data-analytics-script-loaded", "2");
			cy.get("body").should("have.attr", "data-tracker-script-loaded", "1");
		});
	});

	it("Should remove old styles when replacing", () => {
		prepareHead().then((head) => {
			cy.intercept("GET", "/styles/theme-light.css", {
				statusCode: 200,
				body: "body { background: white; color: black; }",
			});

			cy.intercept("GET", "/styles/theme-dark.css", {
				statusCode: 200,
				body: "body { background: black; color: white; }",
			}).as("getDarkTheme");

			cy.intercept("GET", "/", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Light Theme</title>
							<link rel="stylesheet" href="/styles/theme-light.css">
							${head.replace(/<head>|<\/head>/g, "")}
						</head>
						<body>
							<div data-htswap data-hthead="replace">
								<nav>
									<a id="dark-link" href="/dark">Dark Mode</a>
								</nav>
								<main id="content">
									<h1>Light Theme</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			});

			cy.intercept("GET", "/dark", {
				statusCode: 200,
				body: `
					<!DOCTYPE html>
					<html>
						<head>
							<title>Dark Theme</title>
							<link rel="stylesheet" href="/styles/theme-dark.css">
						</head>
						<body>
							<div data-htswap data-hthead="replace">
								<nav>
									<a id="dark-link" href="/dark">Dark Mode</a>
								</nav>
								<main id="content">
									<h1>Dark Theme</h1>
								</main>
							</div>
						</body>
					</html>
				`,
			}).as("getDark");

			cy.visit("/");
			cy.get('link[href="/styles/theme-light.css"]').should("exist");

			cy.get("#dark-link").click();
			cy.wait("@getDark");
			cy.wait("@getDarkTheme");

			cy.get('link[href="/styles/theme-light.css"]').should("not.exist");
			cy.get('link[href="/styles/theme-dark.css"]').should("exist");
		});
	});
});
