declare module "sevenzip-wasm" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SevenZip: () => Promise<any>
  export default SevenZip
}
