import React from "react"
import { passSetRunMode, handleSetDiskData, updateDisplay } from "../main2worker";
import { RUN_MODE, replaceSuffix } from "../emulator/utility/utility";
import { resetAllDiskDrives } from "./diskinterface";
import floppyDisks from "./img/disks.png"
import DiskImageDialog from "./diskimagedialog";

export const DiskImageChooser = () => {
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  };

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
    updateDisplay(0, helptext)
    passSetRunMode(RUN_MODE.NEED_BOOT)
  }

  const handleSelect = (disk: diskImage) => {
    setOpen(false)
    setDiskImage(disk)
  };

  return (
    <div className="diskImageMargins">
      <img className="multi-disk"
        src={floppyDisks} alt="disks"
        title="Choose disk image"
        height="65px"
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
