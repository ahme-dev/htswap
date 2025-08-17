import { defineConfig } from "tsdown";
import pkg from "./package.json" with { type: "json" };

export default defineConfig([
	{
		name: "Compatiblity",
		entry: "./src/htswap.ts",
		outDir: "dist-compat",
		platform: "browser",
		target: "es2015",
		format: ["commonjs", "esm"],
		dts: true,
		banner: {
			js: `// ${pkg.name}-${pkg.version}-${pkg.repository.url}`,
		},
	},
	{
		name: "Modern",
		entry: "./src/htswap.ts",
		outDir: "dist",
		target: "es2020",
		platform: "browser",
		format: ["commonjs", "esm", "es"],
		dts: true,
		publint: true,
		banner: {
			js: `// ${pkg.name}-${pkg.version}-${pkg.repository.url}`,
		},
	},
	{
		name: "Modern Minified",
		entry: "./src/htswap.ts",
		outDir: "dist-min",
		minify: true,
		target: "es2020",
		platform: "browser",
		format: ["commonjs", "esm", "es"],
		dts: true,
		banner: {
			js: `// ${pkg.name}-${pkg.version}-${pkg.repository.url}`,
		},
	},
]);
