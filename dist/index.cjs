"use strict";
var __webpack_require__ = {};
(()=>{
    __webpack_require__.d = (exports1, definition)=>{
        for(var key in definition)if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports1, key)) Object.defineProperty(exports1, key, {
            enumerable: true,
            get: definition[key]
        });
    };
})();
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
(()=>{
    __webpack_require__.r = (exports1)=>{
        if ('undefined' != typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports1, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports1, '__esModule', {
            value: true
        });
    };
})();
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
    htswapInit: ()=>htswapInit,
    htswapRegister: ()=>htswapRegister,
    htswapUpdate: ()=>htswapUpdate
});
let lastTarget = 'body';
async function htswapUpdate() {
    let href = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : location.href, target = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 'body', noHistory = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : false;
    const response = await fetch(href, {
        headers: {
            'htswap-target': target
        }
    });
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newElement = doc.querySelector(target);
    const currentElement = document.querySelector(target);
    if (!newElement || !currentElement) return void console.error(`HTSWAP: Target "${target}" not found`);
    currentElement.outerHTML = newElement.outerHTML;
    lastTarget = target;
    if (!noHistory) history.pushState({
        target,
        fromUrl: location.href
    }, '', href);
    htswapRegister();
}
function htswapRegister() {
    document.querySelectorAll('a[target]:not([data-registered])').forEach((el)=>{
        const anchor = el;
        anchor.dataset.registered = 'true';
        anchor.onclick = (e)=>{
            e.preventDefault();
            htswapUpdate(anchor.href, anchor.getAttribute('target') || 'body', anchor.hasAttribute('no-history'));
        };
    });
}
function htswapInit() {
    htswapRegister();
    new MutationObserver(htswapRegister).observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    window.addEventListener('popstate', (e)=>{
        var _e_state, _e_state1;
        return htswapUpdate((null == (_e_state = e.state) ? void 0 : _e_state.fromUrl) || '/', (null == (_e_state1 = e.state) ? void 0 : _e_state1.target) || lastTarget, true);
    });
}
htswapInit();
exports.htswapInit = __webpack_exports__.htswapInit;
exports.htswapRegister = __webpack_exports__.htswapRegister;
exports.htswapUpdate = __webpack_exports__.htswapUpdate;
for(var __webpack_i__ in __webpack_exports__)if (-1 === [
    "htswapInit",
    "htswapRegister",
    "htswapUpdate"
].indexOf(__webpack_i__)) exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
Object.defineProperty(exports, '__esModule', {
    value: true
});
