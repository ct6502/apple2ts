type PopupMenuProps = {
  location: [number, number] | undefined
  options: number[]
  checkedIndex?: number
  getOptionLabel: (optionIndex: number) => string
  onClick: (selectedIndex: number) => () => void
}

const PopupMenu = (props: PopupMenuProps) => {

  const getPopupLocationStyle = () => {
    if (!props.location) {
      return {}
    }

    const [x, y] = props.location
    let w = 0
    let h = 0

    props.options.forEach((optionIndex) => {
      const optionLabel = props.getOptionLabel(optionIndex)

      if (optionLabel == "-") {
        w = Math.max(w, 9)
        h += 16
      } else {
        w = Math.max(w, optionLabel.length * 9)
        h += 28
      }
    })

    return {
      left: Math.min(x, window.innerWidth - w),
      top: Math.min(y, window.innerHeight - h)
    }
  }

  return (
    props.location
      ? <div className="modal-overlay"
        style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
        onClick={props.onClick(-1)}>
        <div className="floating-dialog flex-column droplist-option"
          style={getPopupLocationStyle()}>
          {props.options.map((i) => (
            <div
              key={i}
              className="droplist-option" style={{ padding: "5px" }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#ccc"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "inherit"}
              onClick={props.onClick(i)}>
              {(i === props.checkedIndex) ? "\u2714\u2009" : "\u2003"}{props.getOptionLabel(i)}
            </div>))}
        </div>
      </div>
      : <div></div>
  )
}

export default PopupMenu