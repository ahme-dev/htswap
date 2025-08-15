import { defineConfig } from "tsdown";

export default defineConfig([
	{
		name: "Compatiblity",
		entry: "./src/htswap.ts",
		outDir: "dist-compat",
		platform: "browser",
		target: "es2015",
		format: ["commonjs", "esm"],
		dts: true,
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
	},
]);
