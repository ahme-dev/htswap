export async function htswapReplace(
	target: string = "body",
	historyMode: "replace" | "push" | "none" | string = "push",
	url: string = location.href,
	body?: FormData,
) {
	const currentTargetEl = document.querySelector(target);
	currentTargetEl?.setAttribute("aria-busy", "true");

	const response = await fetch(url, {
		headers: { "htswap-target": target },
		method: body ? "POST" : "GET",
		body,
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
		history.pushState({ target }, "", url);
	} else if (historyMode === "replace") {
		history.replaceState({ target }, "", url);
	}
}

export function htswapAssign() {
	document
		.querySelectorAll(
			"[data-htswap] form:not([data-htswap-locked]), [data-htswap] a:not([data-htswap-locked])",
		)
		.forEach((el) => {
			el.setAttribute("data-htswap-locked", "true");
			if (el instanceof HTMLAnchorElement) {
				el.onclick = (e: MouseEvent) => {
					e.preventDefault();
					htswapReplace(
						el.getAttribute("data-htswap-target") || undefined,
						el.getAttribute("data-htswap-history") || undefined,
						el.getAttribute("href") || undefined,
					);
				};
			} else if (el instanceof HTMLFormElement) {
				el.onsubmit = (e: Event) => {
					e.preventDefault();
					const action = el.action || location.href;

					if (el.method === "POST") {
						htswapReplace(
							el.getAttribute("data-htswap-target") || undefined,
							el.getAttribute("data-htswap-history") || undefined,
							action,
							new FormData(el),
						);
					} else {
						const params = new URLSearchParams(
							new FormData(el) as unknown as string,
						);
						htswapReplace(
							el.getAttribute("data-htswap-target") || undefined,
							el.getAttribute("data-htswap-history") || undefined,
							action + (action.includes("?") ? "&" : "?") + params,
						);
					}
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
		htswapReplace(e.state?.target, "none"),
	);
}

htswapInit();
