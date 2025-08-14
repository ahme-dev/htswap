import { defineConfig } from '@rslib/core';

export default defineConfig({
  mode: 'production',
  lib: [
    {
      format: 'esm',
      syntax: ['es6'],
      dts: true,
    },
    {
      format: 'cjs',
      syntax: ['es6'],
    },
  ],
});
