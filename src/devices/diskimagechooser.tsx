import React from "react"
import { passSetRunMode, handleSetDiskData } from "../main2worker";
import { RUN_MODE, replaceSuffix } from "../emulator/utility/utility";
import floppyDisks from "./img/diskicons.png"
import DiskImageDialog from "./diskimagedialog";

export const DiskImageChooser = (props: DisplayProps) => {
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  };

  const resetAllDiskDrives = () => {
    handleSetDiskData(0, new Uint8Array(), "")
    handleSetDiskData(1, new Uint8Array(), "")
    handleSetDiskData(2, new Uint8Array(), "")
  }

  const setDiskImage = async (disk: diskImage) => {
    const res = await fetch("/disks/" + disk.file)
    const data = await res.arrayBuffer()
    resetAllDiskDrives()
    handleSetDiskData(1, new Uint8Array(data), disk.file)
    const helpFile = replaceSuffix(disk.file, 'txt')
    const help = await fetch("/disks/" + helpFile, { credentials: "include", redirect: "error" })
    let helptext = ' '
    if (help.ok) {
      helptext = await help.text()
      // Hack: when running on localhost, if the file is missing it just
      // returns the index.html. So just return an empty string instead.
      if (helptext.startsWith('<!DOCTYPE html>')) {
        helptext = ' '
      }
    }
    props.updateDisplay(0, helptext)
    passSetRunMode(RUN_MODE.NEED_BOOT)
  }

  const handleSelect = (disk: diskImage) => {
    setOpen(false)
    setDiskImage(disk)
  };

  return (
    <div style={{ userSelect: "none" }}>
      <img className="disk-image"
        src={floppyDisks} alt="disks"
        title="Choose disk image"
        onClick={handleClickOpen} />
      {open &&
        <DiskImageDialog
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      }
    </div>
  )
}
