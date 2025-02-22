import { useEffect, useRef, useState } from "react"
import { FILE_SUFFIXES } from "../common/utility"
import BinaryFileDialog from "./devices/binaryfiledialog"
import { RestoreSaveState } from "./savestate"
import { handleSetDiskOrFileFromBuffer } from "./devices/driveprops"

const FileInput = (props: DisplayProps) => {
  const [displayBinaryDialog, setDisplayBinaryDialog] = useState(false)
  const [binaryBuffer, setBinaryBuffer] = useState(new Uint8Array())
  const hiddenFileOpen = useRef<HTMLInputElement>(null)

  const readFile = async (file: File, index: number) => {
    const fname = file.name.toLowerCase()
    if (fname.endsWith("a2ts")) {
      const fileread = new FileReader()
      fileread.onload = function (ev) {
        if (ev.target) {
          RestoreSaveState(ev.target.result as string)
        }
      }
      fileread.readAsText(file)
    } else {
      const buffer = await file.arrayBuffer()
      if (fname.endsWith(".bin")) {
        // Display dialog, ask for address for where to put into memory
        setBinaryBuffer(new Uint8Array(buffer))
        if (buffer.byteLength > 0) {
          setDisplayBinaryDialog(true)
        }
      } else {
        handleSetDiskOrFileFromBuffer(index, buffer, file.name, null)
      }
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
  if (props.showFileOpenDialog.show) {
    // Now that we're in here, turn off our property. Send a message to our
    // parent to turn off the dialog, but also manually turn it off here
    // because occasionally the message doesn't get through fast enough
    // and the file dialog pops up again right away.
    props.showFileOpenDialog.show = false

    setTimeout(() => props.setShowFileOpenDialog(false, props.showFileOpenDialog.index), 0)
    if (hiddenFileOpen.current) {
      const fileInput = hiddenFileOpen.current
      // Hack - clear out old file so we can pick the same file again
      fileInput.value = ""
      // Display the dialog.
      fileInput.click()
    }
  }

  return (
    <>
      <input
        type="file"
        accept={isTouchDevice ? "" : FILE_SUFFIXES}
        ref={hiddenFileOpen}
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />
      <BinaryFileDialog displayDialog={displayBinaryDialog}
        displayClose={() => setDisplayBinaryDialog(false)}
        binaryBuffer={binaryBuffer} />
    </>
  )
}

export default FileInput

