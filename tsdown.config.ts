import { defineConfig } from "tsdown";

// "build": "tsdown ./src/index.ts -d dist-es6 --platform browser --target es6 --format cjs,esm --dts;",
export default defineConfig([
	{
		entry: "./src/index.ts",
		outDir: "dist-es2015",
		platform: "browser",
		target: "es2015",
		format: ["commonjs", "esm"],
		dts: true,
	},
	{
		entry: "./src/index.ts",
		outDir: "dist-es2020",
		target: "es2020",
		platform: "browser",
		format: ["commonjs", "esm", "es"],
		dts: true,
	},
]);
