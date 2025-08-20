export async function htswapUpdate(
	target: string = "body",
	historyMode: "replace" | "push" | "none" | string = "push",
	url: string = location.href,
	body?: FormData,
) {
	const currenTargElements = target
		.split(",")
		.map((t) => {
			const [selector, mergeMode = "replace"] = t.split("@");
			return {
				selector,
				element: document.querySelector(selector) as Element,
				mergeMode: mergeMode as InsertPosition & ("replace" | "update"),
			};
		})
		.filter(({ element }) => element);

	currenTargElements.forEach(({ element }) =>
		element?.setAttribute("aria-busy", "true"),
	);

	try {
		const controller = new AbortController();
		setTimeout(() => controller.abort(), 5e3);
		const response = await fetch(url, {
			headers: { "x-htswap": target },
			method: body ? "POST" : "GET",
			signal: controller.signal,
			body,
		}).then((r) => r.text());

		currenTargElements.forEach(({ selector, element, mergeMode }) => {
			const newTargetEl = new DOMParser()
				.parseFromString(response, "text/html")
				.querySelector(selector);
			if (!newTargetEl) {
				return console.error(`htswap: "${selector}" not in response`);
			}

			if (mergeMode === "update") element.innerHTML = newTargetEl.innerHTML;
			else if (mergeMode === "replace")
				element.outerHTML = newTargetEl.outerHTML;
			else element.insertAdjacentHTML(mergeMode, newTargetEl.innerHTML);
		});

		if (historyMode === "push") history.pushState({ target }, "", url);
		else if (historyMode === "replace")
			history.replaceState({ target }, "", url);
	} catch (e) {
		currenTargElements.forEach(({ element }) =>
			element?.setAttribute("aria-busy", "false"),
		);
		console.error(`htswap: ${e}`);
	}
}

export function htswapLock() {
	document
		.querySelectorAll(
			"[data-htswap] form:not([data-htswap-locked]), [data-htswap] a:not([data-htswap-locked]), a[data-htswap]:not([data-htswap-locked]), form[data-htswap]:not([data-htswap-locked])",
		)
		.forEach((el) => {
			el.setAttribute("data-htswap-locked", "true");

			const target = el.getAttribute("data-htswap") || undefined;
			const historyMode = el.getAttribute("data-htswap-history") || undefined;
			const url =
				(el as HTMLFormElement).action ||
				(el as HTMLAnchorElement).href ||
				location.href;

			if (el instanceof HTMLAnchorElement) {
				el.onclick = (e: MouseEvent) => {
					e.preventDefault();
					htswapUpdate(target, historyMode, url);
				};
			} else if (el instanceof HTMLFormElement) {
				el.onsubmit = (e: Event) => {
					e.preventDefault();
					if (el.method.toUpperCase() === "POST") {
						htswapUpdate(target, historyMode, url, new FormData(el));
					} else {
						htswapUpdate(
							target,
							historyMode,
							url +
								(url.includes("?") ? "&" : "?") +
								new URLSearchParams(new FormData(el) as unknown as string),
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
