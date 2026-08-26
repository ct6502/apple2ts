import { determineVtocType } from "../common/prodos_hdv"

type VtocWorkerRequest = {
  id: number
  filename: string
  data: Uint8Array
  title?: string
}

self.onmessage = (event: MessageEvent<VtocWorkerRequest>) => {
  const { id, filename, data, title } = event.data
  self.postMessage({
    id,
    vtocType: determineVtocType(filename, data, title),
  })
}
