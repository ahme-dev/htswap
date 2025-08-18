[![NPM Version](https://img.shields.io/npm/v/htswap?style=flat&color=lightsalmon&label=htswap)](https://www.npmjs.com/package/htswap)
![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hw/htswap?style=flat&label=CDN%20Hits&color=khaki)
![NPM Downloads](https://img.shields.io/npm/dw/htswap?style=flat&label=Installs&color=lightcyan)

# 🔄 htswap

**Minimal, lightweight script for seamless AJAX-style UI content swapping.** By adding `htswap` and applying the `target` attribute on your links and forms, you get the speed of client-side-rendering in your server-side-rendered/static sites.

Based on **Swap.js**, and inspired by **HTMZ**, **HTMX**, **Alpine-Ajax**, among others. A modern, smaller, more semantic alternative.

> [!WARNING]  
> Expect breaking changes until v1.

## ✨ Features

- **Dynamic content**: Content on the page will be swapped dynamically, without reloading
- **History support**: Browser back/forward buttons will work seamlessly, without reloading  
- **Progressive enhancement**: Links and forms can be enhanced with a single attribute
- **Loading states**: Loading state can be styled through `aria-busy="true"`

## 📦 Installation

There are several build/distribution variants: 

- `dist`: modern and default (es2020)
- `dist-compat`: compatible with older browsers (es2015)
- `dist-min`: same as `dist` but minified
- `dist-min-compat`: same as `dist-compat` but minified

Any of the variants can be installed through the following methods:

🌐 Import from a CDN, changing the `dist` part to any of the variants:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/htswap@latest/dist/htswap.js"></script>
```

📂 Download a copy of the script file into your codebase from [any of the dist directories here](https://cdn.jsdelivr.net/npm/htswap/).

📋 Install with a package manager and import any of the variants on the client side: `pnpm i htswap`

## 🚀 Usage

After making sure `htswap` is imported, you can utilize it as detailed below.

### 🔗 Links

Links can be enhanced by adding `target`, determining which element to swap dynamically. The already existing `href` will determine which page to fetch for the swap operation.

```html
<!-- on home page (/) -->
<nav>
	<ul>
		<li>
			<a href="/account" target="body">Account</a>
		</li>
	</ul>
</nav>
```

If the `body` is targeted, the whole page will be swapped. This can be used as default behaviour, replicating client-side navigation.

```html
<!-- on dashboard users page (/dashboard/users) -->
<div>
	<aside>
		<a href="/dashboard/users" target="#dashboard-content">Users</a>
		<a href="/dashboard/products" target="#dashboard-content">Products</a>
	</aside>
	<main id="dashboard-content">
		<!-- Content gets swapped here -->
	</main>
</div>
```

**Any element can be targeted**, adding the ability to do partial swapping.

All swapping operations work with **browser history**, and navigating backward will swap back to the previous content, without a reload.

### 📝 Forms 

Forms can also be enhanced easily with `target` alongside the existing `method` and `action`. Targeting behaves the same as with links.

```html
<!-- on search page (/products) -->
<div>
	<form action="/products" target="#list" method="get">
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

Forms add their inputs as URL params when fetching, allowing the server to filter according to the current state of the form.

**For example**, if a form with action set on `/products` has an input named `product-name` with value `pc`, when submitted it will send its request as `/products?product-name=pc`.

### 📕 History

Several modes of interacting with history are supported, with `push` being the default.

- `push`: changes the URL but the user can navigate back to the previous URL. 
- `replace`: changes the URL but the user can't navigate back. 
- `none`: doesn't change the URL.

```html
<a data-htswap-history="replace" href="/search" target="#list">Search</a>
```

### 🔒 Locking

If you have existing elements with `target` you can opt them out of swapping, using `data-htswap-locked`.

```html
<a data-htswap-locked href="/content" target="anIframe">Iframe</a>
```
