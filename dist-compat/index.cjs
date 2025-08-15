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
//#region src/index.ts
var import_asyncToGenerator = /* @__PURE__ */ __toESM(require_asyncToGenerator(), 1);
let lastTarget = "body";
function htswapUpdate() {
	return _htswapUpdate.apply(this, arguments);
}
function _htswapUpdate() {
	_htswapUpdate = (0, import_asyncToGenerator.default)(function* (href = location.href, target = "body", noHistory = false) {
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
exports.htswapInit = htswapInit;
exports.htswapRegister = htswapRegister;
exports.htswapUpdate = htswapUpdate;