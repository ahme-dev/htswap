// htswap-undefined-git+https://github.com/ahme-dev/htswap.git
//#region src/htswap.ts
async function htswapReplace(href = location.href, target = "body", historyMode = "push") {
	const currentTargetEl = document.querySelector(target);
	currentTargetEl?.setAttribute("aria-busy", "true");
	const response = await fetch(href, { headers: { "htswap-target": target } });
	const newDoc = new DOMParser().parseFromString(await response.text(), "text/html");
	const newTargetEl = newDoc.querySelector(target);
	if (!newTargetEl || !currentTargetEl) return console.error(`HTSWAP: Target "${target}" not found`);
	currentTargetEl.outerHTML = newTargetEl.outerHTML;
	if (historyMode === "push") history.pushState({ target }, "", href);
	else if (historyMode === "replace") history.replaceState({ target }, "", href);
}
function htswapAssign() {
	document.querySelectorAll("[target]:not([data-htswap-locked]):not([target^=\"_\"])").forEach((el) => {
		el.setAttribute("data-htswap-locked", "true");
		if (el instanceof HTMLAnchorElement) el.onclick = (e) => {
			e.preventDefault();
			htswapReplace(el.getAttribute("href") || void 0, el.getAttribute("target") || void 0, el.getAttribute("data-htswap-history") || void 0);
		};
		else if (el instanceof HTMLFormElement) el.onsubmit = (e) => {
			e.preventDefault();
			const action = el.getAttribute("action") || location.href;
			const params = new URLSearchParams(new FormData(el)).toString();
			htswapReplace(action + (action.includes("?") ? "&" : "?") + params, el.getAttribute("target") || void 0, el.getAttribute("data-htswap-history") || void 0);
		};
	});
}
function htswapInit() {
	htswapAssign();
	new MutationObserver(htswapAssign).observe(document.documentElement, {
		childList: true,
		subtree: true
	});
	window.addEventListener("popstate", (e) => htswapReplace(void 0, e.state?.target, "none"));
}
htswapInit();

//#endregion
export { htswapAssign, htswapInit, htswapReplace };