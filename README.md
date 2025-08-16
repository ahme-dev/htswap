# 🔄 htswap

**Minimal, lightweight tool for seamless AJAX-style UI content swapping.** By adding `htswap` and applying the `target` attribute on your links and forms, you get the speed of client-side-rendering in your server-side-rendered/static sites.

Based on **Swap.js**, and inspired by **HTMZ**, **HTMX**, **Alpine-Ajax**, among others. A modern, smaller, more semantic alternative.

## ✨ Features

- **Dynamic content**: Content on the page will be swapped dynamically, without reloading
- **History support**: Browser back/forward buttons will work seamlessly, without reloading  
- **Progressive enhancement**: Links and forms can be enhanced with a single attribute
- **Loading states**: Loading state can be styled through `aria-busy="true"`

## 📦 Installation

There are several options:

📂 Copy the `htswap` file into your codebase from any of the `dist` directories:
  - `dist` is default
  - `dist-compat` supports older browsers
  - `dist-min` is minified

🌐 Import from a CDN with `?`

📋 Install with a package manager: `pnpm i htswap`

## 🚀 Usage

### ⚙️ Setup

The script can be imported directly in the HTML:

```html
<head>
	<script type="module" src="/htswap.js"></script>
</head>
```

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

Forms also support **browser history**.