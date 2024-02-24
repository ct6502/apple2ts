import { useEffect, useRef, useState } from "react";
import { FILE_SUFFIXES, RUN_MODE } from "./emulator/utility/utility";
import { handleGetRunMode, passPasteText, passSetRunMode } from "./main2worker";
import BinaryFileDialog from "./devices/binaryfiledialog";
import { RestoreSaveState } from "./restoresavestate";
import { isHardDriveImage } from "./emulator/devices/decodedisk";
import { handleSetDiskData } from "./devices/driveprops";

const FileInput = (props: DisplayProps) => {
  const [displayBinaryDialog, setDisplayBinaryDialog] = useState(false)
  const [binaryBuffer, setBinaryBuffer] = useState(new Uint8Array())
  const hiddenFileOpen = useRef(null);

  const readFile = async (file: File, drive: number) => {
    const fname = file.name.toLowerCase()
    if (fname.endsWith('a2ts')) {
      const fileread = new FileReader()
      const restoreStateReader = RestoreSaveState
      fileread.onload = function (ev) {
        if (ev.target) {
          restoreStateReader(ev.target.result as string)
        }
      };
      fileread.readAsText(file)
    } else {
      const buffer = await file.arrayBuffer();
      if (fname.endsWith('.bin')) {
        // throw up dialog, ask for address
        // put into memory
        setBinaryBuffer(new Uint8Array(buffer))
        if (buffer.byteLength > 0) {
          setDisplayBinaryDialog(true)
        }
      } else if (fname.endsWith('.bas')) {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(buffer);
        if (text !== "") {
          passPasteText(text + '\nRUN\n')
        }
      } else {
        drive = isHardDriveImage(fname) ? 0 : 1
        handleSetDiskData(drive, new Uint8Array(buffer), file.name)
        if (handleGetRunMode() === RUN_MODE.IDLE) {
          passSetRunMode(RUN_MODE.NEED_BOOT)
        } else {
          props.updateDisplay()
        }
      }
    }
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      readFile(e.target.files[0], props.showFileOpenDialog.drive)
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
    window.addEventListener('drop', handleDrop)
    window.addEventListener('dragover', handleDrag)

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('drop', handleDrop)
      window.removeEventListener('dragover', handleDrag)
    }
  })

  const isTouchDevice = "ontouchstart" in document.documentElement

  // This is how we actually display the file selection dialog.
  if (props.showFileOpenDialog.show) {
    // Now that we're in here, turn off our property.
    setTimeout(() => props.setShowFileOpenDialog(false, props.showFileOpenDialog.drive), 0)
    if (hiddenFileOpen.current) {
      const fileInput = hiddenFileOpen.current as HTMLInputElement
      // Hack - clear out old file so we can pick the same file again
      fileInput.value = "";
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
        style={{ display: 'none' }}
      />
      <BinaryFileDialog displayDialog={displayBinaryDialog}
        displayClose={() => setDisplayBinaryDialog(false)}
        binaryBuffer={binaryBuffer} />
    </>
  )
}

export default FileInput;

