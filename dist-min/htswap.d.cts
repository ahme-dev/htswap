//#region src/htswap.d.ts
declare function htswapReplace(href?: string, target?: string, noHistory?: boolean): Promise<void>;
declare function htswapAssign(): void;
declare function htswapInit(): void;
//#endregion
export { htswapAssign, htswapInit, htswapReplace };