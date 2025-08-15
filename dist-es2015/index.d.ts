//#region src/index.d.ts
declare function htswapUpdate(href?: string, target?: string, noHistory?: boolean): Promise<void>;
declare function htswapRegister(): void;
declare function htswapInit(): void;
//#endregion
export { htswapInit, htswapRegister, htswapUpdate };