# htswap

Minimal, lightweight tool for seamless AJAX-style UI content swapping. By adding `htswap` and applying the `target` attribute on your links and forms, you get the speed of a client-side-rendering in your server-side-rendered/static site.

Based on Swap.js, and inspired by HTMZ, HTMX, Alpine-Ajax, among others. To be a modern, smaller, more semantic alternative.

### Features

Dynamic content: Content on the page will be swapped dynamically, without reloading
History support: Browser back/forward buttons will work seamlessly, without reloading
Progressive enhancement: Links and forms can be enhanced with a single attribute
Loading states: Loading state can be styled through `aria-busy="true"`

### Installation

- Copy the `htswap` file into your codebase from the `dist` directory or its alternatives (dist-compat supports older browsers, dist-min is minified)
- Import from a CDN with `?`
- Install with a package manager: `pnpm i htswap`

### Usage

#### Setup

The script can be imported directly in the html:

```html
<head>
	<script type="module" src="/htswap.js"></script>
</head>
```

#### Links

Links can be enhanced by adding `target`, determining which element to swap dynamically. The already existing `href` will determine with page to fetch for the swap operation.

```html
<!-- on home page (/) -->
<nav>
	<ul>
		<li>
			<a href="/account" target="body">Account</>
		</li>
	</ul>
</nav>
```

If the `body` is targeted, the whole page will be swapped. This can be used as default behaviour, replicating client-side navigation.

```html
<!-- on dashboard users page (/dashboard/users) -->
<div>
	<aside>
			<a href="/dashboard/users" target="#dashboard-content">users</>
			<a href="/dashboard/products" target="#dashboard-content">products</>
	</aside>
	<main id="dashboard-content">
	</main>
</div>
```

Any element can be targeted though, adding the ability to do partial swapping.

All swapping operations work with browser history, and navigating backward will swap back to the previous content, without a reload.

#### Forms 

Forms also can be enhanced easily `target` alongside the existing `method` and `action`. Targeting behaves the same as with links.

```html
<!-- on search page (/products) -->
<div>
	<form action="/products" target="#list" method="get">
		<input type="text" name="product-name" id="product-name">
		<button type="submit">search</button>
	</form>
	<ul id="list">
		<li>PC Gaming Controller</li>
		<li>24 Inch Monitor</li>
		<li>Gaming Chair</li>
	</ul>
</div>
```

Forms add their inputs as url params when fetching, allowing the server to filter according to the current state of the form.

If a form with action set on `/products` has an input named `product-name` inside it with value `pc`, when it is submitted it will send its request as `/products?product-name='pc'`.

Forms also support browser history.