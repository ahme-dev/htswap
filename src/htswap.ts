export async function htswapReplace(
	href: string = location.href,
	target: string = "body",
	historyMode: "replace" | "push" | "none" | string = "push",
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
	if (historyMode === "push") {
		history.pushState({ target }, "", href);
	} else if (historyMode === "replace") {
		history.replaceState({ target }, "", href);
	}
}

export function htswapAssign() {
	document
		.querySelectorAll(
			"form:not([data-htswap-locked]), a:not([data-htswap-locked])",
		)
		.forEach((el) => {
			el.setAttribute("data-htswap-locked", "true");
			if (el instanceof HTMLAnchorElement) {
				el.onclick = (e: MouseEvent) => {
					e.preventDefault();
					htswapReplace(
						el.getAttribute("href") || undefined,
						el.getAttribute("data-htswap-target") || undefined,
						el.getAttribute("data-htswap-history") || undefined,
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
						el.getAttribute("data-htswap-target") || undefined,
						el.getAttribute("data-htswap-history") || undefined,
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
	window.addEventListener("popstate", (e) =>
		htswapReplace(undefined, e.state?.target, "none"),
	);
}

htswapInit();
