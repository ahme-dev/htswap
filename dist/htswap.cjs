
//#region src/htswap.ts
let htswapLastTarget = "body";
async function htswapReplace(href = location.href, target = "body", noHistory = false) {
	const currentTargetEl = document.querySelector(target);
	currentTargetEl?.setAttribute("aria-busy", "true");
	const response = await fetch(href, { headers: { "htswap-target": target } });
	const newDoc = new DOMParser().parseFromString(await response.text(), "text/html");
	const newTargetEl = newDoc.querySelector(target);
	if (!newTargetEl || !currentTargetEl) return console.error(`HTSWAP: Target "${target}" not found`);
	currentTargetEl.outerHTML = newTargetEl.outerHTML;
	htswapLastTarget = target;
	if (!noHistory) history.pushState({
		target,
		fromUrl: location.href
	}, "", href);
}
function htswapAssign() {
	document.querySelectorAll("[target]:not([data-assigned])").forEach((el) => {
		if (el.tagName === "A") {
			const anchor = el;
			anchor.dataset.assigned = "true";
			anchor.onclick = (e) => {
				e.preventDefault();
				htswapReplace(anchor.href, anchor.getAttribute("target") || "body", anchor.hasAttribute("no-history"));
			};
		}
		if (el.tagName === "FORM") el.onsubmit = (e) => {
			e.preventDefault();
			const action = el.getAttribute("action") || location.pathname;
			const params = new URLSearchParams(new FormData(el)).toString();
			htswapReplace(action + (action.includes("?") ? "&" : "?") + params, el.getAttribute("target") || "");
		};
	});
}
function htswapInit() {
	htswapAssign();
	new MutationObserver(htswapAssign).observe(document.documentElement, {
		childList: true,
		subtree: true
	});
	window.addEventListener("popstate", (e) => htswapReplace(e.state?.fromUrl ?? "/", e.state?.target ?? htswapLastTarget, true));
}
htswapInit();

//#endregion
exports.htswapAssign = htswapAssign;
exports.htswapInit = htswapInit;
exports.htswapReplace = htswapReplace;