
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
		const targEl = el;
		targEl.dataset.assigned = "true";
		if (targEl instanceof HTMLAnchorElement) targEl.onclick = (e) => {
			e.preventDefault();
			htswapReplace(targEl.href, targEl.target || "body", targEl.hasAttribute("no-history"));
		};
		else if (targEl instanceof HTMLFormElement) targEl.onsubmit = (e) => {
			e.preventDefault();
			const action = targEl.action;
			const params = new URLSearchParams(new FormData(targEl)).toString();
			htswapReplace(action + (action.includes("?") ? "&" : "?") + params, targEl.target, targEl.hasAttribute("no-history"));
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