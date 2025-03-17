import DiskCollectionPanel from "../panels/diskcollectionpanel";

interface DiskImageDialogProps {
  onClose: () => void;
  onSelect: (value: diskImage) => void;
  displayProps: DisplayProps
}

const DiskImageDialog = (props: DiskImageDialogProps) => {
  const { onClose } = props

  // Find a decent dialog width, such that it takes up most of the height.
  // If we're in landscape mode on a short screen (like a phone),
  // switch to a horizontal grid and take up most of the width.
  let width = window.innerWidth ? window.innerWidth : window.outerWidth
  const height = window.innerHeight ? window.innerHeight : window.outerHeight
  const isLandscape = (height < 500) && (width > height)
  width = isLandscape ? Math.min(width, 1.6 * height) : Math.min(0.83 * width, 0.55 * height)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="floating-dialog"
        style={{ left: "5%", top: "2%" }}>
        <div style={{
          display: "inline",
          // margin: "10px",
          gap: "10px",
          width: width,
          overflowX: "hidden",
          overflowY: "auto",
        }}>
          <DiskCollectionPanel {...props.displayProps} />
        </div>
      </div>
    </div>
  )
}

export default DiskImageDialog