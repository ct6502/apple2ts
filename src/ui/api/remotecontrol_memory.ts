import { requestMemorySearch, requestMemoryView } from "../main2worker"

export const readRemoteMemory = async (payload: Record<string, unknown>) => {
  const request = {
    address: Number(payload.address),
    length: Number(payload.length),
    space: payload.space as MemorySpace,
    auxBank: payload.auxBank === undefined ? undefined : Number(payload.auxBank),
  }
  const view = await requestMemoryView(request)
  return {...view, bytes: Array.from(view.bytes)}
}

export const findRemoteMemory = (payload: Record<string, unknown>) => requestMemorySearch({
  address: Number(payload.address),
  length: Number(payload.length),
  space: payload.space as MemorySpace,
  auxBank: payload.auxBank === undefined ? undefined : Number(payload.auxBank),
  bytes: payload.bytes as number[],
  maxMatches: payload.maxMatches === undefined ? undefined : Number(payload.maxMatches),
})
