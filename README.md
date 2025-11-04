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
- **History Modes**: Swap without url changes or replace the url than pushing to it
- **Head Modes**: Can append head elements rather than replace, or re-eval existing scripts, as needed
- **Smart Targeting**: Able to automatically match partial server responses to elements on page
- **Target Aliases**: Swap content with different elements on the server
- **Swap Modes**: Swap content in different ways (innerHTML, outerHTML, etc.)

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

Note that the parent element having `data-htswap` is not necessary anymore as the elements themselves have it, though it doesn't conflict with it.

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

Multiple targets can be specified by separating them with a comma, with full support for query selectors.

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

### History

Several modes of interacting with history are supported, with `push` being the default.

- `push`: changes the URL but the user can navigate back to the previous URL. 
- `replace`: changes the URL but the user can't navigate back. 
- `none`: doesn't change the URL.

```html
<div>
	<a href="/settings" data-htswap="#settings-panel" data-hthistory="none">Edit Profile</a>
	<div id="settings-panel"></div>
</div>
```

### Merge Modes

The `data-htswap` attribute can include specific merge modes, using the `@` symbol, to determine how the content is inserted into the target.

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

- `outerHTML`: The default mode, which replaces the entire target element with the new content.
- `innerHTML`: Replaces the inner content of the target element with the new content.
- `afterbegin`: Inserts the new content inside the target element, as the first child.
- `afterend`: Inserts the new content inside the target element, as the last child.
- `beforebegin`: Inserts the new content as sibling of the target element, before it.
- `beforeend`: Inserts the new content as sibling of the target element, after it.
- `remove`: Removes the target element.

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

### More

#### Opt Out

Individual elements under `data-htswap` can be opted out of swapping, using `data-htlocked`.

```html
<div data-htswap>
	<!-- Prepared but set to act as native anchor for now -->
	<a href="/products" data-htswap="#product-list" data-htlocked>Products</a>
</div>
```

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