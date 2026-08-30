import { useEffect, useRef, useState } from "react"
import { DISK_CONVERSION_SUFFIXES, FILE_SUFFIXES_ALL } from "../common/utility"
import BinaryFileDialog from "./devices/binaryfiledialog"
import { RestoreSaveState } from "./savestate"
import { handleSetDiskOrFileFromBuffer, prepWritableFile } from "./devices/disk/driveprops"
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

  const readFile = async (file: File, index: number) => {
    const fileExtension = file.name.substring(file.name.lastIndexOf("."))
    if (fileExtension === ".a2ts") {
      const fileread = new FileReader()
      fileread.onload = function (ev) {
        if (ev.target) {
          RestoreSaveState(ev.target.result as string)
          notifyLoadSuccess()
        }
      }
      fileread.readAsText(file)
    } else if (fileExtension === ".bin") {
      const buffer = await file.arrayBuffer()
        // Display dialog, ask for address for where to put into memory
        setBinaryBuffer(new Uint8Array(buffer))
        if (buffer.byteLength > 0) {
          setDisplayBinaryDialog(true)
        }
    } else {
      let filename = file.name
      let writableFileHandle: FileSystemFileHandle | null = null
      if (DISK_CONVERSION_SUFFIXES.has(fileExtension)) {
        const newFileExtension = DISK_CONVERSION_SUFFIXES.get(fileExtension)
        writableFileHandle = await window.showSaveFilePicker({
          excludeAcceptAllOption: false,
          suggestedName: file.name.replace(fileExtension, newFileExtension ?? ""),
          types: [
            {
              description: "Disk Image",
              accept: { "application/octet": [newFileExtension] as `.${string}`[] },
            },
          ]
        })
        filename = writableFileHandle.name
      }
      const newIndex = handleSetDiskOrFileFromBuffer(index,
        await file.arrayBuffer(), filename, null, writableFileHandle)
      if (writableFileHandle) prepWritableFile(newIndex, writableFileHandle)
      notifyLoadSuccess()
    }
  }

  const showReadWriteFilePicker = async (index: number) => {
    const [writableFileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "Disk Images",
          accept: {
            "application/octet-stream": FILE_SUFFIXES_ALL.split(",") as `.${string}`[]
          }
        }
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    })
    if (writableFileHandle) {
      const file = await writableFileHandle.getFile()
      readFile(file, index)
    }
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      readFile(e.target.files[0], props.showFileOpenDialog.index)
    }
  }

  // https://medium.com/@650egor/simple-drag-and-drop-file-upload-in-react-2cb409d88929
  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const f = e.dataTransfer?.files
    if (f && f.length > 0) {
      readFile(f[0], 0)
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
    const { index } = props.showFileOpenDialog
    props.setShowFileOpenDialog(false, index)
    if (isFileSystemApiSupported()) {
      setTimeout(() => showReadWriteFilePicker(index), 0)
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

