let lastTarget = 'body';

export async function htswapUpdate(
  href: string = location.href,
  target: string = 'body',
  noHistory: boolean = false,
): Promise<void> {
  const response = await fetch(href, {
    headers: { 'htswap-target': target },
  });
  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const newElement = doc.querySelector(target);
  const currentElement = document.querySelector(target);

  if (!newElement || !currentElement) {
    console.error(`HTSWAP: Target "${target}" not found`);
    return;
  }

  currentElement.outerHTML = newElement.outerHTML;
  lastTarget = target;
  if (!noHistory) {
    history.pushState({ target, fromUrl: location.href }, '', href);
  }
  htswapRegister();
}

export function htswapRegister(): void {
  document
    .querySelectorAll('a[target]:not([data-registered])')
    .forEach((el) => {
      const anchor = el as HTMLAnchorElement;
      anchor.dataset.registered = 'true';
      anchor.onclick = (e: MouseEvent) => {
        e.preventDefault();
        htswapUpdate(
          anchor.href,
          anchor.getAttribute('target') || 'body',
          anchor.hasAttribute('no-history'),
        );
      };
    });
}

export function htswapInit(): void {
  htswapRegister();
  new MutationObserver(htswapRegister).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  window.addEventListener('popstate', (e: PopStateEvent) =>
    htswapUpdate(e.state?.fromUrl || '/', e.state?.target || lastTarget, true),
  );
}

htswapInit();
