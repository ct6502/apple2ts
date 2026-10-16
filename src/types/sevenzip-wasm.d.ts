declare module "sevenzip-wasm" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SevenZip: (opts?: any) => Promise<any>
  export default SevenZip
}

declare module "sevenzip-wasm/sevenzip-wasm.wasm?url" {
  const url: string
  export default url
}
