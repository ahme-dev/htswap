// htswap-0.3.0-git+https://github.com/ahme-dev/htswap.git
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion

//#region node_modules/.pnpm/@oxc-project+runtime@0.81.0/node_modules/@oxc-project/runtime/src/helpers/asyncToGenerator.js
var require_asyncToGenerator = /* @__PURE__ */ __commonJS({ "node_modules/.pnpm/@oxc-project+runtime@0.81.0/node_modules/@oxc-project/runtime/src/helpers/asyncToGenerator.js": ((exports, module) => {
	function asyncGeneratorStep(n, t, e, r, o, a, c) {
		try {
			var i = n[a](c), u = i.value;
		} catch (n$1) {
			return void e(n$1);
		}
		i.done ? t(u) : Promise.resolve(u).then(r, o);
	}
	function _asyncToGenerator$1(n) {
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
	module.exports = _asyncToGenerator$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
}) });

//#endregion
//#region src/htswap.ts
var import_asyncToGenerator = /* @__PURE__ */ __toESM(require_asyncToGenerator(), 1);
function htswapReplace() {
	return _htswapReplace.apply(this, arguments);
}
function _htswapReplace() {
	_htswapReplace = (0, import_asyncToGenerator.default)(function* (href = location.href, target = "body", historyMode = "push") {
		const currentTargetEl = document.querySelector(target);
		currentTargetEl === null || currentTargetEl === void 0 || currentTargetEl.setAttribute("aria-busy", "true");
		const response = yield fetch(href, { headers: { "htswap-target": target } });
		const newDoc = new DOMParser().parseFromString(yield response.text(), "text/html");
		const newTargetEl = newDoc.querySelector(target);
		if (!newTargetEl || !currentTargetEl) return console.error(`HTSWAP: Target "${target}" not found`);
		currentTargetEl.outerHTML = newTargetEl.outerHTML;
		if (historyMode === "push") history.pushState({
			target,
			fromUrl: location.href
		}, "", href);
		else if (historyMode === "replace") history.replaceState({
			target,
			fromUrl: location.href
		}, "", href);
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
		var _e$state$target;
		return htswapReplace(location.href, (_e$state$target = e.state.target) !== null && _e$state$target !== void 0 ? _e$state$target : "body", "none");
	});
}
htswapInit();

//#endregion
exports.htswapAssign = htswapAssign;
exports.htswapInit = htswapInit;
exports.htswapReplace = htswapReplace;