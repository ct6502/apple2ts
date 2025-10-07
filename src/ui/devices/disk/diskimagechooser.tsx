const floppyDisks = window.assetRegistry.diskicons
import DiskImageDialog from "./diskimagedialog"
import { handleSetDiskFromFile } from "./driveprops"
import { useState } from "react"

export const DiskImageChooser = (props: DisplayProps) => {
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleSelect = (disk: string) => {
    setOpen(false)
    handleSetDiskFromFile(disk, props.updateDisplay)
  }

  return (
    <div style={{ userSelect: "none" }}>
      <img className="disk-image"
        src={floppyDisks} alt="disks"
        id="tour-disk-images"
        title="Choose disk image"
        onClick={handleClickOpen} />
      {open &&
        <DiskImageDialog
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
          displayProps={props}
        />
      }
    </div>
  )
}
