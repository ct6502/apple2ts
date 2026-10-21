import { useEffect, useRef, useState } from "react"
import { CLOUD_SYNC, FILE_SUFFIXES_ALL, getCleanDiskFilename, RUN_MODE } from "../common/utility"
import BinaryFileDialog from "./devices/binaryfiledialog"
import { RestoreSaveState } from "./savestate"
import { appendStandbyDisks, handleSetDiskOrFileFromBuffer, prepWritableFile, setStandbyDisks, StandbyDisk } from "./devices/disk/driveprops"
import { handleGetRunMode } from "./main2worker"
import { decompressAllDiskFiles, compareDiskFilenames } from "../common/zip_utils"
import { isFileSystemApiSupported } from "./ui_utilities"
import { DISK_LOAD_SUCCESS_EVENT } from "./ui_settings"

const FileInput = (props: DisplayProps & { onLoadSuccess?: () => void }) => {
  const [displayBinaryDialog, setDisplayBinaryDialog] = useState(false)
  const [binaryBuffer, setBinaryBuffer] = useState(new Uint8Array())
  const hiddenFileOpen = useRef<HTMLInputElement>(null)
  const notifyLoadSuccess = () => {
    props.onLoadSuccess?.()
    window.dispatchEvent(new CustomEvent(DISK_LOAD_SUCCESS_EVENT))
  }

  const processDiskItem = async (
    file: File,
    writableFileHandle: FileSystemFileHandle | null = null
  ): Promise<StandbyDisk[]> => {
    const filename = file.name
    const buffer = await file.arrayBuffer()
    const decompressedList = await decompressAllDiskFiles(
      buffer,
      filename,
      [".woz", ".po", ".dsk", ".do", ".2mg", ".hdv", ".2meg", ".img", ".nib", ".bin", ".bas", ".a"]
    )
    if (decompressedList && decompressedList.length > 0) {
      const archiveCloudData: CloudData = {
        providerName: "Local",
        syncStatus: CLOUD_SYNC.INACTIVE,
        syncInterval: -1,
        lastSyncTime: -1,
        fileName: filename,
        itemId: "",
        apiEndpoint: "",
        downloadUrl: "",
        detailsUrl: "",
        fileSize: buffer.byteLength,
        isArchive: true,
      }
      return decompressedList.map(item => ({
        filename: getCleanDiskFilename(item.filename),
        diskData: new Uint8Array(item.buffer),
        diskHasChanges: false,
        isWriteProtected: false,
        writableFileHandle: null,
        cloudData: archiveCloudData,
        lastAppleWriteTime: -1,
        lastLocalFileWriteTime: -1,
      }))
    }
    return [{
      filename: getCleanDiskFilename(filename),
      diskData: new Uint8Array(buffer),
      diskHasChanges: false,
      isWriteProtected: false,
      writableFileHandle,
      cloudData: null,
      lastAppleWriteTime: -1,
      lastLocalFileWriteTime: -1,
    }]
  }

  const readFiles = async (
    items: Array<{ file: File; handle: FileSystemFileHandle | null }>,
    index: number,
    append = false
  ) => {
    if (items.length === 0) return

    // If single non-append file, check for special extensions
    if (items.length === 1 && !append) {
      const { file } = items[0]
      const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
      if (fileExtension === ".a2ts") {
        const fileread = new FileReader()
        fileread.onload = function (ev) {
          if (ev.target) {
            RestoreSaveState(ev.target.result as string)
            notifyLoadSuccess()
          }
        }
        fileread.readAsText(file)
        return
      }
      if (fileExtension === ".bin") {
        const buffer = await file.arrayBuffer()
        setBinaryBuffer(new Uint8Array(buffer))
        if (buffer.byteLength > 0) {
          setDisplayBinaryDialog(true)
        }
        return
      }
    }

    const processedList: StandbyDisk[] = []
    for (const item of items) {
      const disks = await processDiskItem(item.file, item.handle)
      processedList.push(...disks)
    }

    // Natural numeric sort so Disk 1, Disk 2, ..., Disk 10, Disk 11 maintain correct sequence
    processedList.sort((a, b) => compareDiskFilenames(a.filename, b.filename))

    if (append) {
      appendStandbyDisks(index, processedList)
      props.updateDisplay?.()
    } else {
      const first = processedList[0]
      const isIdle = handleGetRunMode() === RUN_MODE.IDLE
      const newIndex = handleSetDiskOrFileFromBuffer(
        index,
        first.diskData.buffer as ArrayBuffer,
        first.filename,
        first.cloudData,
        first.writableFileHandle,
        undefined,
        true, // preserveDriveIndex: keep user's chosen drive!
        false, // confirmed
        true, // noReset: inserting a disk from file input must NOT reset other drives!
        !isIdle, // noBoot: if already running, DO NOT reboot! If idle, boot!
      )
      if (first.writableFileHandle) prepWritableFile(newIndex, first.writableFileHandle)
      setStandbyDisks(newIndex, processedList, 0)
      notifyLoadSuccess()
      props.updateDisplay?.()
    }
  }

  const showReadWriteFilePicker = async (index: number, append = false) => {
    try {
      const handles = await window.showOpenFilePicker({
        types: [
          {
            description: "Disk Images",
            accept: {
              "application/octet-stream": FILE_SUFFIXES_ALL.split(",") as `.${string}`[]
            }
          }
        ],
        excludeAcceptAllOption: true,
        multiple: true,
      })
      if (handles && handles.length > 0) {
        const items = []
        for (const handle of handles) {
          const file = await handle.getFile()
          items.push({ file, handle })
        }
        await readFiles(items, index, append)
      }
    } catch {
      // User cancelled picker
    }
  }

  const pendingIndexRef = useRef(2)
  const pendingAppendRef = useRef(false)

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      const files = Array.from(e.target.files)
      const items = files.map(file => ({ file, handle: null }))
      void readFiles(items, pendingIndexRef.current, pendingAppendRef.current)
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const f = e.dataTransfer?.files
    if (f && f.length > 0) {
      const files = Array.from(f)
      const items = files.map(file => ({ file, handle: null }))
      void readFiles(items, 2, false)
    }
  }
  const handleDrag = (e: DragEvent) => { e.preventDefault(); e.stopPropagation() }

  useEffect(() => {
    window.addEventListener("drop", handleDrop)
    window.addEventListener("dragover", handleDrag)

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("drop", handleDrop)
      window.removeEventListener("dragover", handleDrag)
    }
  })

  const isTouchDevice = "ontouchstart" in document.documentElement

  // This is how we actually display the file selection dialog.
  useEffect(() => {
    if (!props.showFileOpenDialog.show) return
    const { index, append } = props.showFileOpenDialog
    pendingIndexRef.current = index
    pendingAppendRef.current = !!append
    props.setShowFileOpenDialog(false, index, append)
    if (isFileSystemApiSupported()) {
      setTimeout(() => showReadWriteFilePicker(index, append), 0)
    } else if (hiddenFileOpen.current) {
      // Hack - clear out old file so we can pick the same file again
      hiddenFileOpen.current.value = ""
      hiddenFileOpen.current.click()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.showFileOpenDialog.show])

  return (
    <>
      <input
        type="file"
        name="fileInput"
        multiple
        accept={isTouchDevice ? "" : FILE_SUFFIXES_ALL}
        ref={hiddenFileOpen}
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />
      <BinaryFileDialog displayDialog={displayBinaryDialog}
        displayClose={() => setDisplayBinaryDialog(false)}
        binaryBuffer={binaryBuffer}
        onLoadSuccess={notifyLoadSuccess} />
    </>
  )
}

export default FileInput
