import { expect, test } from 'bun:test';
import { hi } from '.';

test('Hi', async () => {
  const expected = 'Hello';
  const actual = hi();

  expect(actual).toBe(expected);
});
