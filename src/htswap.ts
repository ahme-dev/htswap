let htswapLastTarget = "body";

export async function htswapReplace(
	href: string = location.href,
	target: string = "body",
	noHistory: boolean = false,
) {
	const currentTargetEl = document.querySelector(target);
	currentTargetEl?.setAttribute("aria-busy", "true");

	const response = await fetch(href, {
		headers: { "htswap-target": target },
	});
	const newDoc = new DOMParser().parseFromString(
		await response.text(),
		"text/html",
	);
	const newTargetEl = newDoc.querySelector(target);

	if (!newTargetEl || !currentTargetEl) {
		return console.error(`HTSWAP: Target "${target}" not found`);
	}

	currentTargetEl.outerHTML = newTargetEl.outerHTML;
	htswapLastTarget = target;
	if (!noHistory) {
		history.pushState({ target, fromUrl: location.href }, "", href);
	}
}

export function htswapAssign() {
	document
		.querySelectorAll('[target]:not([data-htswap-assigned]):not([target^="_"])')
		.forEach((el) => {
			el.setAttribute("data-htswap-assigned", "true");
			if (el instanceof HTMLAnchorElement) {
				el.onclick = (e: MouseEvent) => {
					e.preventDefault();
					htswapReplace(
						el.getAttribute("href") || location.href,
						el.getAttribute("target") || "body",
						el.hasAttribute("no-history"),
					);
				};
			} else if (el instanceof HTMLFormElement) {
				el.onsubmit = (e: Event) => {
					e.preventDefault();
					const action = el.getAttribute("action") || location.href;
					const params = new URLSearchParams(
						new FormData(el) as unknown as string,
					).toString();
					htswapReplace(
						action + (action.includes("?") ? "&" : "?") + params,
						el.getAttribute("target") || "body",
						el.hasAttribute("no-history"),
					);
				};
			}
		});
}

export function htswapInit() {
	htswapAssign();
	new MutationObserver(htswapAssign).observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
	window.addEventListener("popstate", (e: PopStateEvent) =>
		htswapReplace(
			e.state?.fromUrl ?? "/",
			e.state?.target ?? htswapLastTarget,
			true,
		),
	);
}

htswapInit();
