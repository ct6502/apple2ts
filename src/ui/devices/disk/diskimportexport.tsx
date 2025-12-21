import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { getDiskImageFromLocalStorage, hasDiskImageInLocalStorage, setDiskImageToLocalStorage } from "../../localstorage"
import { handleGetDriveProps, handleSetDiskFromURL } from "./driveprops"
import {
  faUpload,
  faDownload,
} from "@fortawesome/free-solid-svg-icons"
import { useRef, useState } from "react"
import { passSetRunMode } from "../../main2worker"
import { RUN_MODE } from "../../../common/utility"

const DiskImportExport = () => {
  const dprops = handleGetDriveProps(0)
  const [showFileOpenDialog, setShowFileOpenDialog] = useState(false)
  const hiddenFileOpen = useRef<HTMLInputElement>(null)

  const saveLocalStorageDiskImage = (url: string) => {
    if (!hasDiskImageInLocalStorage()) {
      return
    }
    const state = getDiskImageFromLocalStorage()
    if (!state) {
      return
    }
    const blob = new Blob([state.data], { type: "application/octet-stream" })
    const link = document.createElement("a")
    const downloadUrl = URL.createObjectURL(blob)
    link.setAttribute("href", downloadUrl)
    const filename = url.split("/").pop() || url
    link.setAttribute("download", `${filename}`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const verifyImport = () => {
    if (dprops.filename) {
      // If we have a disk image already, confirm overwrite.
      const confirmResult = window.confirm(
        "A disk image is already loaded. " +
        "Importing a new disk image will replace the existing data. " +
        "Do you want to continue?")
      if (!confirmResult) {
        return
      }
    }
    setShowFileOpenDialog(true)
  }

  // This is how we actually display the file selection dialog.
  if (showFileOpenDialog) {
    // Now that we're in here, turn off our property.
    setTimeout(() => setShowFileOpenDialog(false), 0)
    if (hiddenFileOpen.current) {
      const fileInput = hiddenFileOpen.current
      // Hack - clear out old file so we can pick the same file again
      fileInput.value = ""
      // Display the dialog.
      fileInput.click()
    }
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      const file = e.target.files[0]
      const buffer = await file.arrayBuffer()
      // For now just handle hard drive images, so hardcode drive index = 0.
      setDiskImageToLocalStorage(0, new Uint8Array(buffer))
      handleSetDiskFromURL("file://" + file.name)
      passSetRunMode(RUN_MODE.NEED_BOOT)
    }
  }

  const isTouchDevice = "ontouchstart" in document.documentElement
  const hasDiskImage = hasDiskImageInLocalStorage()

  return (
    <span className="flex-row" style={{alignItems: "center"}}>
      <button className="push-button" title="Import Disk Image into Emulator"
        onClick={verifyImport}>
        <FontAwesomeIcon icon={faUpload} />
      </button>
      <button className="push-button" title="Download Disk Image"
        disabled={!hasDiskImage}
        onClick={() => saveLocalStorageDiskImage(dprops.filename)}>
        <FontAwesomeIcon icon={faDownload} />
      </button>
      {/* <span style={{ marginLeft: "8px" }}>
        {hasDiskImage ?
          <span className={"bigger-font" + (dprops.diskHasChanges ? " disk-label-unsaved" : "")}>
            {dprops.diskHasChanges ? "*" : ""}{dprops.filename}</span> :
          <span className="bigger-font">No disk image</span>
        }
      </span> */}
      <input
        name="fileInput"
        type="file"
        accept={isTouchDevice ? "" : ".po,.2mg,.hdv"}
        ref={hiddenFileOpen}
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />
    </span>
  )
}

export default DiskImportExport