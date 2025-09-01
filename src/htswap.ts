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
		let html = cache.get(url);
		if (!html) {
			const res = await fetch(url, {
				method: body ? "POST" : "GET",
				headers: { "x-htswap": target },
				body,
				signal: AbortSignal.timeout(5000),
			});
			html = await res.text();
		}
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

			const newToEl = document.querySelector(to);

			newToEl?.querySelectorAll("script").forEach((s) => {
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
			const element = el as HTMLElement;

			const target = element.dataset.htswap || "body";
			const history = element.dataset.hthistory;
			const url =
				(element as HTMLFormElement).action ||
				(element as HTMLAnchorElement).href ||
				location.href;

			if (element instanceof HTMLFormElement) {
				element.onsubmit = (e) => {
					e.preventDefault();
					const data = new FormData(element);
					const method = element.method.toUpperCase();

					htswapUpdate(
						target,
						method === "POST"
							? url
							: url +
									(url.includes("?") ? "&" : "?") +
									new URLSearchParams(data as unknown as string),
						history,
						method === "POST" ? data : undefined,
					);
				};
			} else {
				if (element.hasAttribute("data-htpreload")) {
					htswapUpdate(target, url, history, undefined, true);
				}

				element.onclick = (e) => {
					e.preventDefault();
					htswapUpdate(target, url, history);
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
