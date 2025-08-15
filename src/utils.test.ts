import { expect } from 'bun:test';

function htmlWrap(content: string): string {
  return `<html><head></head><body>${content}</body></html>`;
}

export function setupRoutes(routes: Record<string, string>) {
  const f = async (url: string) => {
    const content = routes[url] ?? '';
    return {
      text: async () => htmlWrap(content),
      ok: !!routes[url],
      status: routes[url] ? 200 : 404,
      headers: new Headers(),
    } as Response;
  };
  globalThis.fetch = f as typeof fetch;
}

export function setupPage(content: string) {
  document.body.innerHTML = htmlWrap(content);
}

export function click(selector: string) {
  const element = document.querySelector(selector);
  if (!element) {
    return expect(element).not.toBeNull();
  }
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

export async function sleep(n: number = 10) {
  await new Promise((r) => setTimeout(r, n));
}
