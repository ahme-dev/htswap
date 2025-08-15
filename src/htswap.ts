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
		if (el.tagName === "A") {
			const anchor = el as HTMLAnchorElement;
			anchor.dataset.assigned = "true";
			anchor.onclick = (e: MouseEvent) => {
				e.preventDefault();
				htswapReplace(
					anchor.href,
					anchor.getAttribute("target") || "body",
					anchor.hasAttribute("no-history"),
				);
			};
		}
		if (el.tagName === "FORM") {
			(el as HTMLFormElement).onsubmit = (e: Event) => {
				e.preventDefault();
				const action =
					(el as HTMLFormElement).getAttribute("action") || location.pathname;
				const params = new URLSearchParams(
					new FormData(el as HTMLFormElement) as unknown as string,
				).toString();
				htswapReplace(
					action + (action.includes("?") ? "&" : "?") + params,
					(el as HTMLFormElement).getAttribute("target") || "",
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
