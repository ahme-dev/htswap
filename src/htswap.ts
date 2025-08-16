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
	document.querySelectorAll("[target]:not([data-assigned])").forEach((el) => {
		const targEl = el as HTMLAnchorElement | HTMLFormElement;
		targEl.dataset.assigned = "true";

		if (targEl instanceof HTMLAnchorElement) {
			targEl.onclick = (e: MouseEvent) => {
				e.preventDefault();
				htswapReplace(
					targEl.getAttribute("href") || location.href,
					targEl.getAttribute("target") || "body",
					targEl.hasAttribute("no-history"),
				);
			};
		} else if (targEl instanceof HTMLFormElement) {
			targEl.onsubmit = (e: Event) => {
				e.preventDefault();
				const action = targEl.getAttribute("action") || location.href;
				const params = new URLSearchParams(
					new FormData(targEl) as unknown as string,
				).toString();
				htswapReplace(
					action + (action.includes("?") ? "&" : "?") + params,
					targEl.getAttribute("target") || "body",
					targEl.hasAttribute("no-history"),
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
