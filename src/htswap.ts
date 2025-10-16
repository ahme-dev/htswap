type HistoryState = {
	selector?: string;
	scrollY?: number;
};

export async function update(
	selector: string,
	url: string,
	hist?: string,
	newScrollY?: number,
	body?: BodyInit,
) {
	const scrollY = window.scrollY;

	const targets = selector.split(",").map((s) => {
		return {
			el: document.querySelector(s),
			sl: s,
		};
	});

	const serverHtml = await fetch(url, {
		method: body ? "POST" : "GET",
		headers: { "x-htswap": selector },
		body,
	}).then((r) => r.text());

	const serverDoc = new DOMParser().parseFromString(serverHtml, "text/html");

	const title = serverDoc.querySelector("title");
	if (title) {
		document.querySelector("title")?.replaceWith(title);
	}

	for (const script of serverDoc.head.querySelectorAll("script[src]")) {
		const src = script.getAttribute("src");
		if (src && !document.querySelector(`script[src="${src}"]`)) {
			const newScript = document.createElement("script");
			newScript.src = src;
			document.head.appendChild(newScript);
		}
	}
	for (const link of serverDoc.head.querySelectorAll(
		"link[rel='stylesheet']",
	)) {
		const href = link.getAttribute("href");
		if (href && !document.querySelector(`link[href="${href}"]`)) {
			const newLink = document.createElement("link");
			newLink.rel = "stylesheet";
			newLink.href = href;
			document.head.appendChild(newLink);
		}
	}
	for (const target of targets) {
		if (!target.el) continue;
		const serverEl = serverDoc.querySelector(target.sl) || serverDoc.body;
		if (!serverEl) continue;
		target.el.outerHTML = serverEl.outerHTML;
		for (const s of document
			.querySelector(target.sl)
			?.querySelectorAll("script") || []) {
			const n = document.createElement("script");
			n.textContent = s.textContent;
			s.replaceWith(n);
		}
	}

	if (!hist || hist === "push") {
		history.replaceState(
			{ ...history.state, scrollY } satisfies HistoryState,
			"",
		);
	}

	if (!hist || hist === "push") {
		history.pushState({ selector } satisfies HistoryState, "", url);
	} else if (hist === "replace") {
		history.replaceState({ selector } satisfies HistoryState, "", url);
	}

	requestAnimationFrame(() => {
		try {
			const hash = new URL(url, location.href).hash;
			if (newScrollY !== undefined) {
				window.scrollTo(0, newScrollY);
			} else if (hash) {
				document.querySelector(hash)?.scrollIntoView();
			} else {
				window.scrollTo(0, 0);
			}
		} catch (_e) {}
	});
}

export async function bind() {
	for (const el of document.querySelectorAll(
		"[data-htswap]:not([data-htbound])" +
			",[data-htbind] a:not([data-htbound])" +
			",[data-htbind] form:not([data-htbound])",
	) as NodeListOf<HTMLElement>) {
		el.setAttribute("data-htbound", "true");

		const url =
			(el as HTMLFormElement).action ||
			el.getAttribute("href") ||
			location.href;

		if (el instanceof HTMLFormElement) {
			el.onsubmit = (e) => {
				e.preventDefault();

				const data = new FormData(el);
				const method = el.method.toUpperCase();

				update(
					el.dataset.htswap || "body",
					method === "POST"
						? url
						: url +
								(url.includes("?") ? "&" : "?") +
								new URLSearchParams(data as unknown as string),
					el.dataset.hthistory,
					undefined,
					method === "POST" ? data : undefined,
				);
			};
			return;
		}

		el.onclick = (e) => {
			e.preventDefault();
			update(el.dataset.htswap || "body", url, el.dataset.hthistory);
		};
	}
}

export function init() {
	bind();
	new MutationObserver(bind).observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
	window.addEventListener("popstate", (e) =>
		update(
			(e.state as HistoryState)?.selector || "body",
			location.href,
			"none",
			(e.state as HistoryState)?.scrollY,
		),
	);
}

init();
