
//#region src/index.ts
let lastTarget = "body";
async function htswapUpdate(href = location.href, target = "body", noHistory = false) {
	const response = await fetch(href, { headers: { "htswap-target": target } });
	const newDoc = new DOMParser().parseFromString(await response.text(), "text/html");
	const newElement = newDoc.querySelector(target);
	const currentElement = document.querySelector(target);
	if (!newElement || !currentElement) {
		console.error(`HTSWAP: Target "${target}" not found`);
		return;
	}
	currentElement.outerHTML = newElement.outerHTML;
	lastTarget = target;
	if (!noHistory) history.pushState({
		target,
		fromUrl: location.href
	}, "", href);
	htswapRegister();
}
function htswapRegister() {
	document.querySelectorAll("a[target]:not([data-registered])").forEach((el) => {
		const anchor = el;
		anchor.dataset.registered = "true";
		anchor.onclick = (e) => {
			e.preventDefault();
			htswapUpdate(anchor.href, anchor.getAttribute("target") || "body", anchor.hasAttribute("no-history"));
		};
	});
}
function htswapInit() {
	htswapRegister();
	new MutationObserver(htswapRegister).observe(document.documentElement, {
		childList: true,
		subtree: true
	});
	globalThis.addEventListener("popstate", (e) => htswapUpdate(e.state?.fromUrl ?? "/", e.state?.target ?? lastTarget, true));
}
htswapInit();

//#endregion
exports.htswapInit = htswapInit;
exports.htswapRegister = htswapRegister;
exports.htswapUpdate = htswapUpdate;