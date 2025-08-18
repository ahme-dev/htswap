[
![NPM Version](https://img.shields.io/npm/v/htswap?style=flat-square&color=lightsalmon&label=htswap)
![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hw/htswap?style=flat-square&label=CDN%20Hits&color=khaki)
![NPM Downloads](https://img.shields.io/npm/dw/htswap?style=flat-square&label=Installs&color=lightcyan)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/htswap?style=flat-square&label=Size%20(gzip)&color=wheat)
](https://www.npmjs.com/package/htswap)

# 🔄 htswap

**Minimal, lightweight script for seamless AJAX-style UI content swapping.** By adding `htswap` your anchors and forms get the speed of client-side-rendering in your server-side-rendered/static sites.

Based on **Swap.js**, and inspired by **HTMZ**, **HTMX**, **Alpine-Ajax**, among others. A modern, smaller, more semantic alternative.

> [!WARNING]  
> Expect breaking changes until v1.

## ✴️️ Features

- **Dynamic Content**: Content on the page will be swapped dynamically, without reloading
- **History Support**: Browser back/forward buttons will work seamlessly, without reloading  
- **Opt-Out Enhancement**: Anchors and forms can be opted out by a single attribute
- **Loading States**: Loading state can be styled through `aria-busy="true"`
- **NoJS Usable**: If JS is turned off, your anchors and forms will work as normal

## 📦 Installation

There are several build/distribution variants: 

- `dist`: modern and default (es2020)
- `dist-compat`: compatible with older browsers (es2015)
- `dist-min`: same as `dist` but minified
- `dist-min-compat`: same as `dist-compat` but minified

Any of the variants can be installed through the following methods:

- Import from a CDN, changing the `dist` part to any of the variants:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/htswap@latest/dist/htswap.js"></script>
```

- Download a copy of the script file into your codebase from [any of the dist directories here](https://cdn.jsdelivr.net/npm/htswap/).

- Install with a package manager and import any of the variants on the client side: `pnpm i htswap`

## 🛠️ Usage

After making sure `htswap` is imported, you can utilize it as detailed below.

### Anchors

Anchors automatically replace the whole page, replicating client-side behaviour. The `href` will determine which page to fetch for swapping.

```html
<!-- on home page (/) -->
<nav>
	<ul>
		<li>
			<a href="/account">Account</a>
		</li>
	</ul>
</nav>
```

They can be enhanced by adding `data-htswap-target`, determining which element to swap dynamically, rather than using the whole page.

```html
<!-- on dashboard users page (/dashboard/users) -->
<div>
	<aside>
		<a href="/dashboard/users" data-htswap-target="#dashboard-content">Users</a>
		<a href="/dashboard/products" data-htswap-target="#dashboard-content">Products</a>
	</aside>
	<main id="dashboard-content">
		<!-- Content gets swapped here -->
	</main>
</div>
```

All swapping operations work with **browser history**, and navigating backward will swap back to the previous content, without a reload.

### Forms 

Forms are also automatically enhanced and support targetting. But they also add their inputs as URL params when swapping, allowing the server to filter according to the current state of the form.

```html
<!-- on search page (/products) -->
<div>
	<form action="/products" data-htswap-target="#list" method="get">
		<input type="text" name="product-name" id="product-name" placeholder="Search products...">
		<button type="submit">Search</button>
	</form>
	<ul id="list">
		<li>PC Gaming Controller</li>
		<li>24 Inch Monitor</li>
		<li>Gaming Chair</li>
	</ul>
</div>
```

**For example**, if a form with action set on `/products` has an input named `product-name` with value `pc`, when submitted it will send its request as `/products?product-name=pc`.

### History

Several modes of interacting with history are supported, with `push` being the default.

- `push`: changes the URL but the user can navigate back to the previous URL. 
- `replace`: changes the URL but the user can't navigate back. 
- `none`: doesn't change the URL.

```html
<a data-htswap-history="replace" href="/search" data-htswap-target="#list">Search</a>
```

### Locking

Existing elements can be opted out of swapping, using `data-htswap-locked`.

```html
<a data-htswap-locked href="/content" target="anIframe">Iframe</a>
```

## ❓ Why? 

With this section being personal reasoning, I'll first go through similar libraries/scripts, detailing what I don't like about them:

- [`Swap.js`](https://github.com/josephernest/Swap.js): 450b gzipped, no form support, old codebase.
- [`Alpine-AJAX`](https://alpine-ajax.js.org/): 3kb gzipped, requires `alpinejs` to work.
- [`HTMZ`](https://leanrada.com/htmz/): 160b gzipped, noticeable 1-2 second delay on the first click, elements don't work when js is turned off. 
- [`HTMX`](https://htmx.org/): 11kb gzipped, too large, too flexible and verbose, decides that other elements (e.g. buttons, divs) should make ajax requests.
- [`zjax`](https://www.zjax.dev/): 5kb gzipped, includes client-side interactivity logic, disregards built-in anchor/form logic.
- [`data-star`](https://data-star.dev/): 10kb gzipped, too large, covers too much ground, includes client-side interactivity logic, disregards built-in anchor/form logic, needs backend integration (potentially outdated point).

Your usecase or preference might align with one of the above, but I needed `htswap`, which:

- Doesn't hit 1kb (gzipped) in size.
- Doesn't include anything more than enhancements for anchors/forms.
- Doesn't break existing anchor/form functionality.
- Doesn't force you to use its aproach for client-side interactivity.
- Doesn't require site users to use JS.
- Doesn't need any other library to work.
- Doesn't care about the backend tech.

This is obviously subject to change as `htswap` reaches v1. More can be integrated from the great alternatives mentioned above.