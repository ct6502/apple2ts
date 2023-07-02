import React from "react"
import { Button, Dialog, DialogTitle, IconButton, ImageList, ImageListItem, ImageListItemBar } from "@mui/material"
import HelpIcon from '@mui/icons-material/Help';
import { handleSetCPUState, handleSetDiskData, updateDisplay } from "./main2worker";
import { STATE, replaceSuffix } from "./emulator/utility";
import { diskImages } from "./diskimages";
import { resetAllDiskDrives } from "./diskinterface";
import disks from "./img/disks.png"

export interface DiskImageDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (value: diskImage) => void;
}

const DiskImageDialog = (props: DiskImageDialogProps) => {
  const { open, onClose, onSelect } = props;
  let helpButton = false;

  const handleClose = () => {
    onClose()
  };

  const handleListItemClick = (value: diskImage) => {
    if (helpButton) {
      helpButton = false
      return
    }
    onSelect(value);
  };

  const isTouchDevice = "ontouchstart" in document.documentElement
  const width = isTouchDevice ? 368 : 600
  const nrows = Math.ceil(diskImages.length / 3)
  const height = nrows * (width / 3 / 1.33)
  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Choose a disk image...</DialogTitle>
      <ImageList sx={{ width: width, height: height }}
        cols={isTouchDevice ? 3 : 3}>
        {diskImages.map((disk) => (
          <ImageListItem key={disk.file}
            onClick={() => handleListItemClick(disk)}
          >
            <img
              src={`${'/disks/'+replaceSuffix(disk.file, 'png')}`}
              alt={disk.file}
              loading="lazy"
            />
            <ImageListItemBar
              title={disk.file}
              actionIcon={disk.url ? <IconButton
                hidden={true}
                onClick = {() => {helpButton = true}}
                href={disk.url}
                target="_blank"
                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                aria-label={`info about ${disk.file}`}>
              <HelpIcon sx={{ fontSize: '1rem' }} />
              </IconButton> : <span></span>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Dialog>
  );
}

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
    handleSetCPUState(STATE.NEED_BOOT)
  }

  const handleSelect = (disk: diskImage) => {
    setOpen(false)
    setDiskImage(disk)
  };

  return (
    <div className="DiskImageChooser">
      <Button className="imgButton" variant="contained"
        onClick={handleClickOpen}>
        <img className="multiDisk" src={disks} alt="disks" height="57px"/>
      </Button>
      <DiskImageDialog
        onSelect={handleSelect}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}
