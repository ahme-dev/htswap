export async function htswapUpdate(
	target: string = "body",
	historyMode: "replace" | "push" | "none" | string = "push",
	url: string = location.href,
	mode:
		| "append"
		| "prepend"
		| "replace"
		| "update"
		| "after"
		| "before"
		| string = "replace",
	body?: FormData,
) {
	const currenTargElements = target
		.split(",")
		.map((t) => ({
			selector: t.trim(),
			element: document.querySelector(t.trim()),
		}))
		.filter(({ element }) => element);

	currenTargElements.forEach(({ element }) =>
		element?.setAttribute("aria-busy", "true"),
	);

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

		currenTargElements.forEach(({ selector, element }) => {
			const newTargetEl = newDoc.querySelector(selector);
			if (!newTargetEl || !element) {
				console.error(`Target "${selector}" not found`);
				return;
			}

			if (mode === "update") element.innerHTML = newTargetEl.innerHTML;
			else if (mode === "replace") element.outerHTML = newTargetEl.outerHTML;
			else {
				element.insertAdjacentHTML(
					mode === "prepend"
						? "afterbegin"
						: mode === "append"
							? "beforeend"
							: mode === "before"
								? "beforebegin"
								: "afterend",
					newTargetEl.innerHTML,
				);
			}
		});

		if (historyMode === "push") {
			history.pushState({ target, mode }, "", url);
		} else if (historyMode === "replace") {
			history.replaceState({ target, mode }, "", url);
		}
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
			"[data-htswap] form:not([data-htswap-locked]), [data-htswap] a:not([data-htswap-locked])",
		)
		.forEach((el) => {
			el.setAttribute("data-htswap-locked", "true");

			const target = el.getAttribute("data-htswap-target") || undefined;
			const historyMode = el.getAttribute("data-htswap-history") || undefined;
			const mode = el.getAttribute("data-htswap-mode") || undefined;
			const url =
				(el as HTMLFormElement).action ||
				(el as HTMLAnchorElement).href ||
				location.href;

			if (el instanceof HTMLAnchorElement) {
				el.onclick = (e: MouseEvent) => {
					e.preventDefault();
					htswapUpdate(target, historyMode, url, mode);
				};
			} else if (el instanceof HTMLFormElement) {
				el.onsubmit = (e: Event) => {
					e.preventDefault();
					if (el.method.toUpperCase() === "POST") {
						htswapUpdate(target, historyMode, url, mode, new FormData(el));
					} else {
						htswapUpdate(
							target,
							historyMode,
							url +
								(url.includes("?") ? "&" : "?") +
								new URLSearchParams(new FormData(el) as unknown as string),
							mode,
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
		htswapUpdate(e.state?.target, "none", undefined, undefined, e.state?.mode),
	);
}

htswapInit();
