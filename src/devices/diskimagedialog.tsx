import { Dialog, DialogTitle, IconButton, ImageList, ImageListItem, ImageListItemBar } from "@mui/material"
import { replaceSuffix } from "../emulator/utility";
import { diskImages } from "./diskimages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

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
                sx={{ color: 'rgba(255, 255, 255, 0.44)' }}
                aria-label={`info about ${disk.file}`}>
                <FontAwesomeIcon icon={faQuestionCircle}/>
              </IconButton> : <span></span>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Dialog>
  );
}

export default DiskImageDialog