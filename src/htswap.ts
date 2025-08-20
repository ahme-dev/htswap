export async function htswapUpdate(
	target: string = "body",
	historyMode: "replace" | "push" | "none" | string = "push",
	url: string = location.href,
	body?: FormData,
) {
	const currenTargElements = target
		.split(",")
		.map((t) => {
			const [selector, mergeMode = "outerHTML"] = t.split("@");
			return {
				selector,
				element: document.querySelector(selector) as Element,
				mergeMode: mergeMode as InsertPosition | "outerHTML" | "innerHTML",
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

			if (mergeMode === "outerHTML") element.outerHTML = newTargetEl.outerHTML;
			else if (mergeMode === "innerHTML")
				element.innerHTML = newTargetEl.innerHTML;
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
			"[data-htswap] form:not([data-htlocked]), [data-htswap] a:not([data-htlocked]), a[data-htswap]:not([data-htlocked]), form[data-htswap]:not([data-htlocked])",
		)
		.forEach((el) => {
			el.setAttribute("data-htlocked", "true");

			const target = el.getAttribute("data-htswap") || undefined;
			const historyMode = el.getAttribute("data-hthistory") || undefined;
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
					htswapUpdate(
						target,
						historyMode,
						el.method.toUpperCase() === "POST"
							? url
							: url +
									(url.includes("?") ? "&" : "?") +
									new URLSearchParams(new FormData(el) as unknown as string),
						new FormData(el),
					);
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
