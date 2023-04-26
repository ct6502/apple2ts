import React from "react"
import { Button, Dialog, DialogTitle, List, ListItem, ListItemButton, ListItemText } from "@mui/material"
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

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Choose a disk image...</DialogTitle>
      <List sx={{ pt: 0 }} >
        {diskImages.map((disk: string) => (
          <ListItem disableGutters key={disk}>
            <ListItemButton onClick={() => handleListItemClick(disk)} key={disk}>
              <ListItemText primary={disk} />
              <img src={'/disks/'+replaceSuffix(disk, 'png')} alt="" width={200}></img>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
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
