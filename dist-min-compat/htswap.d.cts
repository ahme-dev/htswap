//#region src/htswap.d.ts
declare function htswapReplace(href?: string, target?: string, historyMode?: "replace" | "push" | "none" | string): Promise<void>;
declare function htswapAssign(): void;
declare function htswapInit(): void;
//#endregion
export { htswapAssign, htswapInit, htswapReplace };