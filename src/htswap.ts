export async function htswapUpdate(
	target: string = "body",
	historyMode: "replace" | "push" | "none" | string = "push",
	url: string = location.href,
	body?: FormData,
) {
	const currentTargetEl = document.querySelector(target);
	currentTargetEl?.setAttribute("aria-busy", "true");

	try {
		const controller = new AbortController();
		setTimeout(() => controller.abort(), 5e3);
		const response = await fetch(url, {
			headers: { "htswap-target": target },
			method: body ? "POST" : "GET",
			signal: controller.signal,
			body,
		}).then((r) => r.text());
		const newDoc = new DOMParser().parseFromString(response, "text/html");
		const newTargetEl = newDoc.querySelector(target);

		if (!newTargetEl || !currentTargetEl)
			throw new Error(`Target "${target}" not found`);

		currentTargetEl.outerHTML = newTargetEl.outerHTML;
		if (historyMode === "push") {
			history.pushState({ target }, "", url);
		} else if (historyMode === "replace") {
			history.replaceState({ target }, "", url);
		}
	} catch (e) {
		currentTargetEl?.setAttribute("aria-busy", "false");
		console.error(`htswap: ${e}`);
	}
}

export function htswapLock() {
	document
		.querySelectorAll(
			"[data-htswap] form:not([data-htswap-locked]), [data-htswap] a:not([data-htswap-locked])",
		)
		.forEach((el) => {
			el.setAttribute("data-htswap-locked", "true");
			if (el instanceof HTMLAnchorElement) {
				el.onclick = (e: MouseEvent) => {
					e.preventDefault();
					htswapUpdate(
						el.getAttribute("data-htswap-target") || undefined,
						el.getAttribute("data-htswap-history") || undefined,
						el.getAttribute("href") || undefined,
					);
				};
			} else if (el instanceof HTMLFormElement) {
				el.onsubmit = (e: Event) => {
					e.preventDefault();
					const action = el.action || location.href;

					if (el.method.toUpperCase() === "POST") {
						htswapUpdate(
							el.getAttribute("data-htswap-target") || undefined,
							el.getAttribute("data-htswap-history") || undefined,
							action,
							new FormData(el),
						);
					} else {
						const params = new URLSearchParams(
							new FormData(el) as unknown as string,
						);
						htswapUpdate(
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
	htswapLock();
	new MutationObserver(htswapLock).observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
	window.addEventListener("popstate", (e) =>
		htswapUpdate(e.state?.target, "none"),
	);
}

htswapInit();
