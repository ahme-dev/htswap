//#region node_modules/.pnpm/@oxc-project+runtime@0.81.0/node_modules/@oxc-project/runtime/src/helpers/esm/asyncToGenerator.js
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
let htswapLastTarget = "body";
function htswapReplace() {
	return _htswapReplace.apply(this, arguments);
}
function _htswapReplace() {
	_htswapReplace = _asyncToGenerator(function* (href = location.href, target = "body", noHistory = false) {
		const currentTargetEl = document.querySelector(target);
		currentTargetEl === null || currentTargetEl === void 0 || currentTargetEl.setAttribute("aria-busy", "true");
		const response = yield fetch(href, { headers: { "htswap-target": target } });
		const newDoc = new DOMParser().parseFromString(yield response.text(), "text/html");
		const newTargetEl = newDoc.querySelector(target);
		if (!newTargetEl || !currentTargetEl) return console.error(`HTSWAP: Target "${target}" not found`);
		currentTargetEl.outerHTML = newTargetEl.outerHTML;
		htswapLastTarget = target;
		if (!noHistory) history.pushState({
			target,
			fromUrl: location.href
		}, "", href);
	});
	return _htswapReplace.apply(this, arguments);
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
	window.addEventListener("popstate", (e) => {
		var _e$state$fromUrl, _e$state, _e$state$target, _e$state2;
		return htswapReplace((_e$state$fromUrl = (_e$state = e.state) === null || _e$state === void 0 ? void 0 : _e$state.fromUrl) !== null && _e$state$fromUrl !== void 0 ? _e$state$fromUrl : "/", (_e$state$target = (_e$state2 = e.state) === null || _e$state2 === void 0 ? void 0 : _e$state2.target) !== null && _e$state$target !== void 0 ? _e$state$target : htswapLastTarget, true);
	});
}
htswapInit();

//#endregion
export { htswapAssign, htswapInit, htswapReplace };