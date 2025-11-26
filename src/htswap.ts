type Target = {
	serverSel: string;
	clientEl: Element | null;
	clientSel: string;
	mode?: "innerHTML" | "outerHTML" | "remove" | InsertPosition;
};

type HistoryState = {
	selector?: string;
	scrollY?: number;
};

function solveHead(serverDoc: Document, mode: "replace" | "append") {
	const title = serverDoc.querySelector("title");
	if (title) document.querySelector("title")?.replaceWith(title);

	const syncElements = (selector: string, attr: string): void => {
		const serverUrls = new Set<string>();
		for (const el of serverDoc.head.querySelectorAll(selector)) {
			const url = el.getAttribute(attr);
			if (!url) continue;
			serverUrls.add(url);
		}

		if (mode === "replace") {
			for (const el of document.head.querySelectorAll(selector)) {
				const url = el.getAttribute(attr);
				if (!url || serverUrls.has(url)) continue;
				el.remove();
			}
		}

		for (const el of serverDoc.head.querySelectorAll(selector)) {
			const url = el.getAttribute(attr);
			if (!url) continue;

			const shouldReeval = el.hasAttribute("data-htreeval");
			const existing = document.head.querySelector(
				`${selector}[${attr}="${url}"]`,
			);

			if (existing && !shouldReeval) continue;
			if (existing) existing.remove();

			const clone = document.createElement(el.tagName.toLowerCase());
			clone.setAttribute(attr, url);
			if (el.tagName === "LINK") clone.setAttribute("rel", "stylesheet");
			if (shouldReeval) clone.setAttribute("data-htreeval", "");
			document.head.appendChild(clone);
		}
	};

	syncElements("script[src]", "src");
	syncElements("link[rel='stylesheet']", "href");
}

// update and do swaps
export async function update(
	selector: string,
	url: string,
	trigger?: HTMLElement,
	newScrollY?: number,
	body?: BodyInit,
) {
	const histMode = (
		trigger
			? trigger?.closest("[data-hthistory]")?.getAttribute("data-hthistory") ||
				"push"
			: "none"
	) as "push" | "replace" | "none"; // here to be found before swap
	const scrollY = window.scrollY;

	let targets = [] as Target[];

	try {
		targets = selector.split(",").map((s) => {
			const [sel, mode] = s.split("@");
			const [serverSel, clientSel = serverSel] = sel.split("->");
			return {
				serverSel,
				clientEl: document.querySelector(clientSel),
				clientSel,
				mode: mode as Target["mode"],
			} satisfies Target;
		});

		for (const t of targets) {
			t.clientEl?.setAttribute("aria-busy", "true");
		}

		// fetch update

		const controller = new AbortController();
		setTimeout(() => controller.abort(), 4e3);

		const response = await fetch(url, {
			method: body ? "POST" : "GET",
			headers: { "x-htswap": selector },
			body,
			signal: controller.signal,
		});

		const originalUrl = new URL(url, location.href);
		const finalUrl = new URL(response.url);
		if (!finalUrl.hash && originalUrl.hash) {
			finalUrl.hash = originalUrl.hash;
		}
		const serverHtml = await response.text();

		const hasBodyTag = /<body/i.test(serverHtml);
		const hasHeadTag = /<head/i.test(serverHtml);
		const serverDoc = new DOMParser().parseFromString(serverHtml, "text/html");

		if (hasHeadTag) {
			const headMode = (trigger
				?.closest("[data-hthead]")
				?.getAttribute("data-hthead") || "replace") as "replace" | "append";
			solveHead(serverDoc, headMode);
		}

		for (const { clientEl, clientSel, serverSel, mode } of targets) {
			if (!clientEl) continue;
			const serverEl = serverDoc.querySelector(serverSel) || serverDoc.body;

			if (
				!!trigger?.closest('[data-htswap="auto"]') &&
				clientSel === "body" &&
				!hasBodyTag
			) {
				for (const serverAutoEl of serverEl.children) {
					const id = serverAutoEl.getAttribute("id");
					if (!id) continue;

					targets.push({
						clientEl: document.querySelector(`#${id}`),
						clientSel: `#${id}`,
						serverSel: `#${id}`,
					});
				}

				continue;
			}

			if (!serverEl) continue;

			// swap according to mode

			if (mode === "innerHTML" || !mode)
				clientEl.innerHTML = serverEl.innerHTML;
			else if (mode === "outerHTML") clientEl.outerHTML = serverEl.outerHTML;
			else if (mode === "remove") clientEl.remove();
			else clientEl.insertAdjacentHTML(mode, serverEl.innerHTML);

			// run added inline scripts
			for (const s of document
				.querySelector(clientSel)
				?.querySelectorAll("script") || []) {
				if (s.src) {
					const n = document.createElement("script");
					n.src = s.src;
					s.replaceWith(n);
				} else {
					const n = document.createElement("script");
					n.textContent = s.textContent;
					s.replaceWith(n);
				}
			}
		}

		// push or replace history

		if (histMode === "push") {
			// save scroll level before pushing history changes
			history.replaceState(
				{ ...history.state, scrollY } satisfies HistoryState,
				"",
			);
			history.pushState({ selector } satisfies HistoryState, "", finalUrl);
		} else if (histMode === "replace")
			history.replaceState({ selector } satisfies HistoryState, "", finalUrl);

		// handle scrolling

		const hash = new URL(finalUrl, location.href).hash;

		// if a scroll level is provided (saved in history) scroll to that
		if (newScrollY !== undefined) window.scrollTo(0, newScrollY);
		// otherwise if hash exists, scroll there
		else if (hash) document.querySelector(hash)?.scrollIntoView();
		// else by default scroll to top
		else window.scrollTo(0, 0);
	} catch (_e) {
	} finally {
		for (const t of targets) {
			t.clientEl?.setAttribute("aria-busy", "false");
		}
	}
}

// bind targets
export async function bind() {
	for (const el of document.querySelectorAll(
		"a[data-htswap]:not([data-htlocked])" +
			",form[data-htswap]:not([data-htlocked])" +
			",[data-htswap] a:not([data-htlocked])" +
			",[data-htswap] form:not([data-htlocked])",
	) as NodeListOf<HTMLElement>) {
		el.setAttribute("data-htlocked", "true");

		const url =
			(el as HTMLFormElement).action ||
			el.getAttribute("href") ||
			location.href;

		const selector = (
			el.closest("[data-htswap]")?.getAttribute("data-htswap") || "body"
		).replace(/^auto$/, "body");

		// bind forms

		if (el instanceof HTMLFormElement) {
			el.onsubmit = async (e) => {
				e.preventDefault();
				const submitBtn = el.querySelector(
					"[type='submit']",
				) as HTMLButtonElement | null;
				if (submitBtn) submitBtn.disabled = true;

				const data = new FormData(el);
				const method = el.method.toUpperCase();

				await update(
					selector,
					// add form data to url if GET
					method === "POST"
						? url
						: url +
								(url.includes("?") ? "&" : "?") +
								new URLSearchParams(data as unknown as string),
					el,
					undefined,
					// only add form data as body when POST
					method === "POST" ? data : undefined,
				);

				if (submitBtn) submitBtn.disabled = false;
			};
			continue;
		}

		// bind anchors

		el.onclick = async (e) => {
			e.preventDefault();
			if (e.ctrlKey) return;
			await update(selector, url, el);
		};
	}
}

// initialize on import
export function init() {
	bind();
	// rebind newly swapped elements
	new MutationObserver(bind).observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
	// intercept browser history navigation
	window.addEventListener("popstate", (e) =>
		update(
			(e.state as HistoryState)?.selector || "body",
			location.href,
			undefined,
			(e.state as HistoryState)?.scrollY,
		),
	);
}
init();
