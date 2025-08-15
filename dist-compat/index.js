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
//#region src/index.ts
let lastTarget = "body";
function htswapUpdate() {
	return _htswapUpdate.apply(this, arguments);
}
function _htswapUpdate() {
	_htswapUpdate = _asyncToGenerator(function* (href = location.href, target = "body", noHistory = false) {
		const response = yield fetch(href, { headers: { "htswap-target": target } });
		const newDoc = new DOMParser().parseFromString(yield response.text(), "text/html");
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
	});
	return _htswapUpdate.apply(this, arguments);
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
	globalThis.addEventListener("popstate", (e) => {
		var _e$state$fromUrl, _e$state, _e$state$target, _e$state2;
		return htswapUpdate((_e$state$fromUrl = (_e$state = e.state) === null || _e$state === void 0 ? void 0 : _e$state.fromUrl) !== null && _e$state$fromUrl !== void 0 ? _e$state$fromUrl : "/", (_e$state$target = (_e$state2 = e.state) === null || _e$state2 === void 0 ? void 0 : _e$state2.target) !== null && _e$state$target !== void 0 ? _e$state$target : lastTarget, true);
	});
}
htswapInit();

//#endregion
export { htswapInit, htswapRegister, htswapUpdate };