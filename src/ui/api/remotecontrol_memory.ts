import {
  requestClearMemoryWriteWatchpoint,
  requestMemorySearch,
  requestMemoryView,
  requestSetMemoryWriteWatchpoint,
} from "../main2worker"

const parseMemoryRange = (payload: Record<string, unknown>) => ({
  address: Number(payload.address),
  length: Number(payload.length),
  space: payload.space as MemorySpace,
  auxBank: payload.auxBank === undefined ? undefined : Number(payload.auxBank),
})

export const readRemoteMemory = async (payload: Record<string, unknown>) => {
  const request = parseMemoryRange(payload)
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

export const setRemoteMemoryWriteWatchpoint = (payload: Record<string, unknown>) =>
  requestSetMemoryWriteWatchpoint(parseMemoryRange(payload))

export const clearRemoteMemoryWriteWatchpoint = () => requestClearMemoryWriteWatchpoint()
