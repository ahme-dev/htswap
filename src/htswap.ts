const cache = new Map<string, string>();

export async function htswapUpdate(
	target: string,
	url: string,
	hist?: string,
	body?: BodyInit,
	preload?: boolean,
) {
	const targets = target.split(",").map((t) => {
		const [sel, merge = "outerHTML"] = t.split("@");
		const [from, to = from] = sel.split("->");
		return {
			from,
			toEl: document.querySelector(to) || document.body,
			to,
			merge: merge as "outerHTML" | "innerHTML" | "remove" | InsertPosition,
		};
	});

	targets.forEach((t) => t.toEl?.setAttribute("aria-busy", "true"));

	try {
		const html =
			(cache.get(url) as string) ||
			(await fetch(url, {
				method: body ? "POST" : "GET",
				headers: { "x-htswap": target },
				body,
				signal: AbortSignal.timeout(5000),
			}).then((r) => r.text()));
		if (html) cache.delete(url);
		if (preload) {
			cache.set(url, html);
			return;
		}

		const doc = new DOMParser().parseFromString(html, "text/html");

		targets.forEach(({ from, toEl, to, merge }) => {
			if (!toEl) return;
			const fromEl = doc.querySelector(from) || doc.body;
			if (!fromEl) return;

			if (merge === "outerHTML") toEl.outerHTML = fromEl.outerHTML;
			else if (merge === "innerHTML") toEl.innerHTML = fromEl.innerHTML;
			else if (merge === "remove") toEl.remove();
			else toEl.insertAdjacentHTML(merge, fromEl.innerHTML);

			document
				.querySelector(to)
				?.querySelectorAll("script")
				.forEach((s) => {
					const n = document.createElement("script");
					n.textContent = s.textContent;
					s.replaceWith(n);
				});
		});

		if (!hist || hist === "push") history.pushState({ target }, "", url);
		else if (hist === "replace") history.replaceState({ target }, "", url);
	} catch (e) {
		console.error(`htswap: ${e}`);
	} finally {
		targets.forEach((t) => t.toEl?.setAttribute("aria-busy", "false"));
	}
}

export function htswapBind() {
	document
		.querySelectorAll(
			"[data-htswap]:not([data-htbound])" +
				",[data-htbind] a:not([data-htbound])" +
				",[data-htbind] form:not([data-htbound])",
		)
		.forEach((el) => {
			el.setAttribute("data-htbound", "true");
			const url =
				(el as HTMLFormElement).action ||
				(el as HTMLAnchorElement).href ||
				location.href;

			if (el instanceof HTMLFormElement) {
				el.onsubmit = (e) => {
					e.preventDefault();
					const data = new FormData(el);
					const method = el.method.toUpperCase();

					htswapUpdate(
						(el as HTMLElement).dataset.htswap || "body",
						method === "POST"
							? url
							: url +
									(url.includes("?") ? "&" : "?") +
									new URLSearchParams(data as unknown as string),
						(el as HTMLElement).dataset.hthistory,
						method === "POST" ? data : undefined,
					);
				};
			} else {
				if (el.hasAttribute("data-htpreload")) {
					htswapUpdate(
						(el as HTMLElement).dataset.htswap || "body",
						url,
						(el as HTMLElement).dataset.hthistory,
						undefined,
						true,
					);
				}

				(el as HTMLElement).onclick = (e) => {
					e.preventDefault();
					htswapUpdate(
						(el as HTMLElement).dataset.htswap || "body",
						url,
						(el as HTMLElement).dataset.hthistory,
					);
				};
			}
		});
}

export function htswapInit() {
	htswapBind();
	new MutationObserver(htswapBind).observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
	window.addEventListener("popstate", (e) =>
		htswapUpdate(e.state?.target || "body", location.href, "none"),
	);
}
htswapInit();
