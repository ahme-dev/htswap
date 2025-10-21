import { prepareHead } from "../support/helpers";

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
            <div data-htbind>
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
          <div data-htbind>
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
            <div data-htbind>
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
          <div data-htbind>
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
				<body data-htbind="auto">
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
					<div data-htbind="auto">
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
				<body data-htbind="auto">
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
				<body data-htbind="auto">
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

describe("Preload", () => {});
