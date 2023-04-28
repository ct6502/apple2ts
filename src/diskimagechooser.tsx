import React from "react"
import { Button, Dialog, DialogTitle, ImageList, ImageListItem, ImageListItemBar } from "@mui/material"
import { handleSetDiskData } from "./main2worker";
import { replaceSuffix } from "./emulator/utility";

const diskImages = [
'AppleIIeDiagnostic2.1.woz',
'Aztec.woz',
'Chivalry.woz',
'Gameboy Tetris.woz',
'Nox Archaist Demo.hdv',
'Olympic Decathlon.woz',
'Puyo.woz',
'Total Replay 5.0b3.hdv'];

export interface DiskImageDialogProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
}

const DiskImageDialog = (props: DiskImageDialogProps) => {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value: string) => {
    onClose(value);
  };

  const isPhone = "ontouchstart" in document.documentElement

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Choose a disk image...</DialogTitle>
      <ImageList sx={{ width: 500, height: 500 }} cols={isPhone ? 2 : 3} rowHeight={104}>
        {diskImages.map((disk) => (
          <ImageListItem key={disk}
            onClick={() => handleListItemClick(disk)}
          >
            <img
              src={`${'/disks/'+replaceSuffix(disk, 'png')}?w=248&h=248&fit=clip&auto=format`}
              alt={disk}
              loading="lazy"
            />
            <ImageListItemBar
              title={disk}
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Dialog>
  );
}

export const DiskImageChooser = () => {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(diskImages[1])

  const handleClickOpen = () => {
    setOpen(true)
  };

  const setDiskImage = async (diskImage: string) => {
    const res = await fetch("/disks/" + diskImage)
    const data = await res.arrayBuffer()
    handleSetDiskData(1, new Uint8Array(data), diskImage)
  }

  const handleClose = (value: string) => {
    setOpen(false)
    setSelectedValue(value)
    setDiskImage(value)
  };

  return (
    <div>
      <Button className="textButton" variant="contained"
        onClick={handleClickOpen}>
        Choose Disk Image
      </Button>
      <DiskImageDialog
        selectedValue={selectedValue}
        open={open}
        onClose={handleClose}
      />
    </div>
  )
}
