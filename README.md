# 🔄 htswap

**Minimal, lightweight script for seamless AJAX-style UI content swapping.** By using `htswap`, your anchors and forms become enhanced and fast, not broken or replaced.

The aim of `htswap` is to be a small, simple solution for removing reloads and implementing seamless content swapping, while allowing no-js users of your site to still have a good experience.

Based on a number of other libraries, see [why it exists](#-why).

<br>

[
![NPM Version](https://img.shields.io/npm/v/htswap?style=flat-square&color=lightsalmon&label=htswap)
![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hw/htswap?style=flat-square&label=CDN%20Hits&color=khaki)
![NPM Downloads](https://img.shields.io/npm/dw/htswap?style=flat-square&label=Installs&color=lightcyan)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/htswap?style=flat-square&label=Size%20(gzip)&color=wheat)
](https://www.npmjs.com/package/htswap)

<br>

## ✴️️ Features

- **Dynamic Content**: Content on the page is swapped dynamically, without reloading
- **Progressive Enhancement**: Anchors and forms (or whole sections) can be opted in by a single attribute
- **Graceful Degradation**: If JS is turned off, your anchors and forms still work
- **Preserved Inlines**: Inline scripts and styles are preserved and work as expected
- **Working Head**: Swapped head tags work as expected, including styles and scripts
- **History Support**: Browser back/forward buttons work seamlessly
- **Normal Fragments**: Anchor links (#) work within swapped content, in-page and across pages
- **Maintained Scroll**: Scroll position between swap history is maintained
- **Redirects Handled**: Redirects are followed, including PRG pattern

Extra:

- **Loading States**: Loading state can be styled (through `aria-busy="true"`)
- **Multiple Targets**: Swap multiple elements at once
- **History Modes**: Swap without URL changes or replace the URL rather than pushing to it
- **Head Modes**: Can append head elements rather than replace, or re-eval existing scripts
- **Auto Targeting**: Automatically match server response elements by ID to client elements
- **Target Aliases**: Map server selectors to different client selectors
- **Swap Modes**: Control how content is inserted (innerHTML, outerHTML, beforeend, etc.)

## 📦 Installation

There are several build/distribution variants: 

- `dist`: modern and default (es2020)
- `dist-compat`: compatible with older browsers (es2015)
- `dist-legacy`: legacy support (es5)
- `dist-min`: same as `dist` but minified
- `dist-min-compat`: same as `dist-compat` but minified
- `dist-min-legacy`: same as `dist-legacy` but minified

Any of the variants can be installed through the following methods:

- Import from a CDN, changing the `dist` part to any of the variants:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/htswap@latest/dist/htswap.js"></script>
```

- Download a copy of the script file into your codebase from [any of the dist directories here](https://cdn.jsdelivr.net/npm/htswap/).

- Install with a package manager and import any of the variants on the client side: `pnpm i htswap`

## 🛠️ Usage

After making sure `htswap` is imported, the `data-htswap` attribute can be on any element to let its children work with `htswap` automatically.

The attribute can be added on the `body` element to enable `htswap` on all the links and anchors in the site, without manually adding it to each element, if desired.

### Anchors

Anchors automatically replace the whole page, replicating client-side behaviour. The `href` will determine which page to fetch for swapping.

```html
<body data-htswap>
	<nav>
		<a href="/login">Login</a>
		<a href="/signup">Sign Up</a>
		<a href="/contact">Contact</a>
	</nav>
	<main>
		<!-- Page content -->
	</main>
</body>
```

They can be further enhanced by adding `data-htswap` on each of them and giving it a target, determining which element to swap dynamically, rather than using the whole page.

```html
<div>
	<nav>
		<a href="/posts" data-htswap="#content">All Posts</a>
		<a href="/posts?category=tech" data-htswap="#content">Tech</a>
		<a href="/posts?category=design" data-htswap="#content">Design</a>
	</nav>
	<main id="content">
		<!-- Post list -->
	</main>
</div>
```

Since `data-htswap` uses the closest parent selector, you can set it once on a parent instead of repeating it on each child:

```html
<div>
	<!-- All these anchors will inherit data-htswap="#content" -->
	<nav data-htswap="#content">
		<a href="/posts">All Posts</a>
		<a href="/posts?category=tech">Tech</a>
		<a href="/posts?category=design">Design</a>
	</nav>
	<main id="content">
		<!-- Post list -->
	</main>
</div>
```

All swapping operations work with **browser history**, and navigating backward will swap back to the previous content, without a reload.

### Forms 

Forms are also automatically enhanced and support targetting. And they will add their inputs as URL or body params when swapping, allowing the server to take actions according to the current state of the form.

```html
<div>
	<form action="/search" data-htswap="#results" method="get">
		<input type="text" name="q" placeholder="Search articles...">
		<select name="category">
			<option value="">All Categories</option>
			<option value="news">News</option>
			<option value="reviews">Reviews</option>
		</select>
		<button type="submit">Search</button>
	</form>
	<div id="results">
		<!-- Article list -->
	</div>
</div>
```

### Multiple Targets

Multiple targets can be specified by separating them with a comma, with full support for query selectors. Each target can have its own swap mode and alias.

```html
<div>
	<header>
		<span id="cart-count">3 items</span>
	</header>

	<main>
		<div id="product-list">
			<!-- Product cards -->
		</div>
	</main>

	<form action="/add-to-cart" data-htswap="#product-list, #cart-count" method="post">
		<input type="hidden" name="product_id" value="123">
		<button type="submit">Add to Cart</button>
	</form>
</div>
```

Swap modes and aliases can be mixed for different targets:

```html
<div>
	<ul id="notifications"></ul>
	<span id="badge">0</span>

	<!-- Append new notification to list, replace badge count -->
	<a href="/new-notification"
	   data-htswap="#notifications@afterbegin, #badge@innerHTML">
		Check Notifications
	</a>
</div>
```

### History Modes

The `data-hthistory` attribute controls how swaps interact with browser history. The `push` mode is the default and doesn't need to be specified.

- `push` (default): Adds a new entry to browser history, allowing the user to navigate back.
- `replace`: Updates the current history entry without adding a new one.
- `none`: Performs the swap without changing the URL at all.

```html
<div>
	<!-- Default push mode - adds to history -->
	<a href="/products" data-htswap="#content">Products</a>

	<!-- Replace mode - updates URL without adding to history -->
	<a href="/products?sort=price" data-htswap="#content" data-hthistory="replace">Sort by Price</a>

	<!-- None mode - swaps content without changing URL -->
	<a href="/settings/modal" data-htswap="#modal" data-hthistory="none">Open Settings</a>

	<main id="content"><!-- Content --></main>
	<div id="modal"><!-- Modal --></div>
</div>
```

Since `data-hthistory` uses the closest parent selector, you can set it on a container to apply to all child elements:

```html
<!-- All filtering links will use replace mode, not adding history entries -->
<div data-htswap="#results" data-hthistory="replace">
	<a href="/products?category=tech">Tech</a>
	<a href="/products?category=books">Books</a>
	<a href="/products?sort=price">By Price</a>
	<a href="/products?sort=date">By Date</a>
</div>
<div id="results"><!-- Results --></div>
```

### Swap Modes

The `data-htswap` attribute can include specific swap modes, using the `@` symbol, to determine how the content is inserted into the target.

```html
<div>
	<div id="comments">
		<div class="comment">First comment</div>
		<div class="comment">Second comment</div>
	</div>
	<a href="/comments/load-more" data-htswap="#comments@beforeend">Load More Comments</a>
</div>
```

The following modes are available:

- `innerHTML`: The default mode, which replaces the inner content of the target element.
- `outerHTML`: Replaces the entire target element with the new content.
- `beforebegin`: Inserts the new content before the target element.
- `afterbegin`: Inserts the new content inside the target element, before its first child.
- `beforeend`: Inserts the new content inside the target element, after its last child.
- `afterend`: Inserts the new content after the target element.
- `remove`: Removes the target element.

### Auto Targeting

When `data-htswap="auto"` is used, elements with IDs in the server response are automatically matched and swapped with elements of the same ID on the client, without needing to specify each target explicitly.

```html
<body data-htswap="auto">
	<header id="header">
		<h1>Dashboard</h1>
		<p>Last updated: 10:00 AM</p>
	</header>
	<main id="content">
		<p>Main content</p>
	</main>
	<footer id="footer">
		<p>Version 1.0</p>
	</footer>

	<!-- Only #header and #footer in the response will be swapped -->
	<a href="/sync">Sync Header & Footer</a>
</body>
```

This is useful when you want to update multiple specific sections without listing all their IDs, and you have control over the response structure.

### Target Aliases

The `->` symbol can be used to specify an alias for the target element, which will be used on the response document, and mapped to the target element on the client side.

```html
<div>
	<form action="/filter-products" data-htswap="#server-results->#client-list" method="get">
		<input type="text" name="brand" placeholder="Filter by brand...">
		<button type="submit">Filter</button>
	</form>
	<ul id="client-list">
		<li>iPhone 15</li>
		<li>Samsung Galaxy</li>
		<li>Google Pixel</li>
	</ul>
</div>
```

### Head Modes

By default, head elements (stylesheets and scripts) are replaced when swapping content. This can be changed using `data-hthead` on the container element.

```html
<body data-htswap data-hthead="append">
	<nav>
		<a href="/locations">Locations Map</a>
	</nav>
	<main id="content">
		<h1>Home</h1>
	</main>
</body>
```

The following modes are available:

- `replace`: The default mode, which removes old head elements not present in the new response and adds new ones.
- `append`: Keeps existing head elements and only adds new ones from the response.

Like other `data-ht*` attributes, `data-hthead` uses the closest parent selector, so you can set different head modes for different sections of your application:

```html
<body data-htswap>
	<!-- These pages will replace head elements (default) -->
	<nav>
		<a href="/products">Products</a>
		<a href="/about">About</a>
	</nav>

	<!-- This section will append head elements instead -->
	<aside data-hthead="append">
		<a href="/tools/calculator">Calculator</a>
		<a href="/tools/converter">Converter</a>
	</aside>
</body>
```

Additionally, scripts can be marked with `data-htreeval` to force them to re-execute on every swap, even if they already exist:

```html
<head>
	<script src="/analytics.js" data-htreeval></script>
	<script src="/core.js"></script>
</head>
```

With this setup, `/analytics.js` will run on every swap, while `/core.js` will only load once.

### More

#### Opt Out

Individual elements under `data-htswap` can be opted out of swapping, using `data-htlocked`.

```html
<div data-htswap>
	<!-- Prepared but set to act as native anchor for now -->
	<a href="/products" data-htswap="#product-list" data-htlocked>Products</a>
</div>
```

#### Ctrl+Click

Holding Ctrl (or Cmd on Mac) while clicking a link will bypass htswap and perform a normal navigation, allowing users to open links in new tabs as expected.

#### Loading States

During a swap operation, `aria-busy="true"` is set on the document body and all target elements. This can be used to style loading states with CSS:

```css
[aria-busy="true"] {
	opacity: 0.6;
	pointer-events: none;
}
```

For forms, the submit button is automatically disabled during the request to prevent duplicate submissions.

#### No Script

It is recommended for the backend to check the `x-htswap` header, and only return partial content if it's present, otherwise return the full page to avoid users who have js disabled from seeing partial content as a page.

## ❓ Why?

With this section being personal reasoning, I'll first go through similar libraries/scripts, detailing what I don't like about them:

- [`Swap.js`](https://github.com/josephernest/Swap.js): 450b gzipped, no form support, no history or merge modes. This was actually the inspiration for `htswap`, but it needed modernization and more features.
- [`Alpine-AJAX`](https://alpine-ajax.js.org/): 3.59kb gzipped, requires Alpine.js to work which adds ~15kb. Great if you're already using Alpine, but that's an 18kb total commitment for just AJAX swapping.
- [`HTMZ`](https://leanrada.com/htmz/): 166b gzipped, clever iframe hack but has a noticeable delay on first click, no history or merge modes. Links are broken when JS is turned off, rather than working normally.
- [`HTMX`](https://htmx.org/): 14-16kb gzipped, powerful but too large for my needs, encourages non-semantic patterns like making divs and buttons trigger requests instead of using proper anchors/forms.
- [`zjax`](https://www.zjax.dev/): 4.9kb gzipped, bundles client-side interactivity which I want to handle separately, overrides native anchor/form behaviors rather than progressively enhancing them.
- [`data-star`](https://data-star.dev/): 10.68kb gzipped, ambitious reactive framework but too heavy, treats forms as an afterthought with its signals-first approach, requires buying into its entire paradigm.

Your use case or preference might align with one of the above, but I needed `htswap`, which:

- Doesn't exceed 2kb (gzipped) in size.
- Doesn't include anything beyond anchor/form enhancements.
- Doesn't break existing anchor/form functionality when JS is disabled.
- Doesn't impose opinions about client-side interactivity.
- Doesn't require users to have JavaScript for basic functionality.
- Doesn't depend on any other library.
- Doesn't care about your backend technology.

This is obviously subject to change as `htswap` reaches v1, and more can be integrated from the excellent alternatives mentioned above.