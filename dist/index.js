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
export { htswapInit, htswapRegister, htswapUpdate };
