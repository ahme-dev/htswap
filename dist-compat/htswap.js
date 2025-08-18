// htswap-0.3.0-git+https://github.com/ahme-dev/htswap.git
//#region node_modules/.pnpm/@oxc-project+runtime@0.82.2/node_modules/@oxc-project/runtime/src/helpers/esm/asyncToGenerator.js
function asyncGeneratorStep(n, t, e, r, o, a, c) {
	try {
		var i = n[a](c), u = i.value;
	} catch (n$1) {
		return void e(n$1);
	}
	i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
	return function() {
		var t = this, e = arguments;
		return new Promise(function(r, o) {
			var a = n.apply(t, e);
			function _next(n$1) {
				asyncGeneratorStep(a, r, o, _next, _throw, "next", n$1);
			}
			function _throw(n$1) {
				asyncGeneratorStep(a, r, o, _next, _throw, "throw", n$1);
			}
			_next(void 0);
		});
	};
}

//#endregion
//#region src/htswap.ts
function htswapReplace() {
	return _htswapReplace.apply(this, arguments);
}
function _htswapReplace() {
	_htswapReplace = _asyncToGenerator(function* (href = location.href, target = "body", historyMode = "push") {
		const currentTargetEl = document.querySelector(target);
		currentTargetEl === null || currentTargetEl === void 0 || currentTargetEl.setAttribute("aria-busy", "true");
		const response = yield fetch(href, { headers: { "htswap-target": target } });
		const newDoc = new DOMParser().parseFromString(yield response.text(), "text/html");
		const newTargetEl = newDoc.querySelector(target);
		if (!newTargetEl || !currentTargetEl) return console.error(`HTSWAP: Target "${target}" not found`);
		currentTargetEl.outerHTML = newTargetEl.outerHTML;
		if (historyMode === "push") history.pushState({ target }, "", href);
		else if (historyMode === "replace") history.replaceState({ target }, "", href);
	});
	return _htswapReplace.apply(this, arguments);
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
	window.addEventListener("popstate", (e) => {
		var _e$state;
		return htswapReplace(void 0, (_e$state = e.state) === null || _e$state === void 0 ? void 0 : _e$state.target, "none");
	});
}
htswapInit();

//#endregion
export { htswapAssign, htswapInit, htswapReplace };