import React from "react"
import floppyDisks from "./img/diskicons.png"
import DiskImageDialog from "./diskimagedialog";
import { handleSetDiskFromFile } from "./driveprops";

export const DiskImageChooser = (props: DisplayProps) => {
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleSelect = (disk: diskImage) => {
    setOpen(false)
    handleSetDiskFromFile(disk, props.updateDisplay)
  }

  return (
    <span className="flex-column" style={{userSelect: "none", width:'16.66%'}}>
      <img className="disk-image"
        src={floppyDisks} alt="disks"
        id="tour-disk-images"
        title="Choose disk image"
        onClick={handleClickOpen} />
      {open &&
        <DiskImageDialog
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      }
    </span>
  )
}
