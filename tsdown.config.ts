import { defineConfig } from "tsdown";
import swc from "unplugin-swc";
import pkg from "./package.json" with { type: "json" };

const banner = `// ${pkg.name}-${(pkg as any).version || "dev"}-${pkg.repository.url}`;

export default defineConfig([
	{
		name: "Legacy",
		entry: "./src/htswap.ts",
		outDir: "dist-legacy",
		target: false,
		platform: "browser",
		format: ["commonjs", "esm"],
		dts: true,
		banner: {
			js: banner,
		},
		plugins: [
			swc.rollup({
				jsc: {
					target: "es5",
					parser: {
						syntax: "typescript",
						tsx: true,
					},
				},
			}),
		],
	},
	{
		name: "Legacy (Minified)",
		entry: "./src/htswap.ts",
		outDir: "dist-legacy-min",
		target: false,
		platform: "browser",
		format: ["commonjs", "esm"],
		dts: true,
		banner: {
			js: banner,
		},
		plugins: [
			swc.rollup({
				jsc: {
					target: "es5",
					parser: {
						syntax: "typescript",
						tsx: true,
					},
					minify: {
						compress: {
							unused: true,
						},
						mangle: true,
					},
				},
				minify: true,
			}),
		],
	},
	{
		name: "Compatible",
		entry: "./src/htswap.ts",
		outDir: "dist-compat",
		platform: "browser",
		target: "es2015",
		format: ["commonjs", "esm"],
		dts: true,
		banner: {
			js: banner,
		},
	},
	{
		name: "Compatible (Minified)",
		entry: "./src/htswap.ts",
		outDir: "dist-compat-min",
		minify: true,
		platform: "browser",
		target: "es2015",
		format: ["commonjs", "esm"],
		dts: true,
		banner: {
			js: banner,
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
		banner: {
			js: banner,
		},
	},
	{
		name: "Modern (Minified)",
		entry: "./src/htswap.ts",
		outDir: "dist-min",
		minify: true,
		target: "es2020",
		platform: "browser",
		format: ["commonjs", "esm", "es"],
		dts: true,
		banner: {
			js: banner,
		},
	},
]);
