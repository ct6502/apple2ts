import { replaceSuffix } from "../emulator/utility/utility";
import { diskImages } from "./diskimages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

interface DiskImageDialogProps {
  onClose: () => void;
  onSelect: (value: diskImage) => void;
}

const DiskImageDialog = (props: DiskImageDialogProps) => {
  const { onClose, onSelect } = props;
  let helpButton = false;

  const handleListItemClick = (value: diskImage) => {
    if (helpButton) {
      helpButton = false
      return
    }
    onSelect(value);
  };

  // Find a decent dialog width, such that it takes up most of the height.
  // If we're in landscape mode on a short screen (like a phone),
  // switch to a horizontal grid and take up most of the width.
  let width = window.innerWidth ? window.innerWidth : window.outerWidth
  const height = window.innerHeight ? window.innerHeight : window.outerHeight
  const isLandscape = (height < 500) && (width > height)
  const columns = isLandscape ? '1fr 1fr 1fr 1fr 1fr' : '1fr 1fr 1fr'
  width = isLandscape ? Math.min(width, 1.6 * height) : Math.min(0.83 * width, 0.55 * height)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="floating-dialog flex-column"
        style={{ left: "5%", top: "2%" }}>
        <div style={{
          display: 'grid',
          margin: '10px',
          gridTemplateColumns: columns,
          gap: '10px',
          width: width
        }}>
          {diskImages.map((disk) => (
            <div key={disk.file}
              onClick={() => handleListItemClick(disk)}
              style={{ cursor: "pointer" }}>
              <img src={`${'/disks/' + replaceSuffix(disk.file, 'png')}`}
                alt={disk.file}
                loading="lazy"
                style={{ width: '100%', height: '100%' }}
              />
              {disk.url &&
                <div style={{
                  position: 'absolute',
                  cursor: 'help',
                  marginLeft: '5px', marginTop: '-30px'
                }}
                  onClick={() => { helpButton = true; window.open(disk.url, '_blank') }}>
                  <FontAwesomeIcon icon={faQuestionCircle} size="lg"
                    style={{ color: '#ccc', backgroundColor: 'black' }} />
                </div>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DiskImageDialog