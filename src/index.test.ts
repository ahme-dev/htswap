import { expect, test } from 'bun:test';
import { click, setupPage, setupRoutes, sleep } from './utils.test';

test('Swapping should work.', async () => {
  setupRoutes({
    '/new': '<div id="target">Updated by swapInit</div>',
  });

  setupPage(`
		<div>
			<a id="go" href="/new" target="#target">
				Go
			</a>
			<div id="target">Original</div>
		</div>
	`);

  const { htswapInit } = await import('.');

  htswapInit();

  click('#go');

  await sleep(10);

  expect(document.querySelector('#target')?.textContent).toEqual(
    'Updated by swapInit',
  );
});

test('Back button should work.', async () => {
  setupRoutes({
    '/new': '<div id="target">Updated by swapInit</div>',
    '/': '<div id="target">Original</div>',
  });

  setupPage(`
		<div>
			<a id="go" href="/new" target="#target">
				Go
			</a>
			<div id="target">Original</div>
		</div>
	`);

  const { htswapInit } = await import('.');
  htswapInit();

  click('#go');
  await sleep(10);

  expect(document.querySelector('#target')?.textContent).toEqual(
    'Updated by swapInit',
  );

  window.dispatchEvent(new Event('popstate'));
  await sleep(100);

  expect(document.querySelector('#target')?.textContent).toEqual('Original');
});
