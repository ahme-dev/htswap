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

// update and do swaps
export async function update(
	selector: string,
	url: string,
	trigger?: Element,
	newScrollY?: number,
	body?: BodyInit,
) {
	const hist = trigger
		? trigger?.closest("[data-hthistory]")?.getAttribute("data-hthistory") ||
			"push"
		: "none";

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

		// add aria-busy on targets
		for (const t of targets) {
			t.clientEl?.setAttribute("aria-busy", "true");
		}

		// fetch update

		const serverHtml = await fetch(url, {
			method: body ? "POST" : "GET",
			headers: { "x-htswap": selector },
			body,
		}).then((r) => r.text());

		const hasBodyTag = /<body/i.test(serverHtml);
		const serverDoc = new DOMParser().parseFromString(serverHtml, "text/html");

		// use title from server response

		const title = serverDoc.querySelector("title");
		if (title) document.querySelector("title")?.replaceWith(title);

		// run response's added head scripts
		for (const script of serverDoc.head.querySelectorAll("script[src]")) {
			const src = script.getAttribute("src");
			if (src && !document.querySelector(`script[src="${src}"]`)) {
				const newScript = document.createElement("script");
				newScript.src = src;
				document.head.appendChild(newScript);
			}
		}

		// add response's added head stylesheets
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
				const n = document.createElement("script");
				n.textContent = s.textContent;
				s.replaceWith(n);
			}
		}

		// save scroll level before pushing history changes
		if (hist === "push") {
			history.replaceState(
				{ ...history.state, scrollY } satisfies HistoryState,
				"",
			);
		}

		// push or replace history

		if (hist === "push")
			history.pushState({ selector } satisfies HistoryState, "", url);
		else if (hist === "replace")
			history.replaceState({ selector } satisfies HistoryState, "", url);

		// handle scrolling

		const hash = new URL(url, location.href).hash;
		// if a scroll level is provided (saved in history) scroll to that
		if (newScrollY !== undefined) window.scrollTo(0, newScrollY);
		// otherwise if hash exists, scroll there
		else if (hash) document.querySelector(hash)?.scrollIntoView();
		// else by default scroll to top
		else window.scrollTo(0, 0);
	} catch (_e) {
	} finally {
		// remove aria-busy on targets
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
			};
			return;
		}

		// bind anchors

		el.onclick = async (e) => {
			e.preventDefault();
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
