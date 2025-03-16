import "./flyout.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleArrowDown, faCircleArrowUp, IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { handleGetTheme } from "./main2worker"
import { UI_THEME } from "../common/utility"

const Flyout = (props: {
  icon: IconDefinition,
  buttonId?: string,
  position: string,
  title: string,
  highlight?: boolean,
  isOpen: () => boolean | undefined,
  onClick: () => void | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any
}) => {
  const className = `flyout-${props.position}`
  const isFlyoutOpen = props.isOpen && props.isOpen()
  const isMinimalTheme = handleGetTheme() == UI_THEME.MINIMAL

  if (isMinimalTheme) {
    import("./flyout.minimal.css")
  }

  const isTopPosition = () => {
    return props.position.search("top") >= 0
  }

  const getArrowIcon = (): IconDefinition => {
    if (isFlyoutOpen) {
      return isTopPosition() ? faCircleArrowUp : faCircleArrowDown
    } else {
      return props.icon
    }
  }

  const isTouchDevice = "ontouchstart" in document.documentElement
  const isLeftPosition = props.position.indexOf("left") >= 0

  return (
    <div
      className={`flyout ${className} ${props.highlight && !isFlyoutOpen ? "flyout-button-highlight" : ""}`}
      style={{
        left: isMinimalTheme && isLeftPosition ? (!isFlyoutOpen || !isTouchDevice ? "14px" : "48px") : "",
        width: isMinimalTheme && !isFlyoutOpen ? "max(8vw, 72px)" : "auto",
        opacity: isMinimalTheme && !isFlyoutOpen ? "33%" : "100%"
      }}>
      {isTopPosition() && (isFlyoutOpen || handleGetTheme() != UI_THEME.MINIMAL) ? props.children : ""}
      <div
        id={props.buttonId ?? ""}
        className="flyout-button"
        title={!isTouchDevice ? `Click to ${isFlyoutOpen ? "hide" : "show"} ${props.title}` : ""}
        onClick={() => {
          if (props.onClick) {
            props.onClick()
          }
        }}>
        <FontAwesomeIcon icon={getArrowIcon()}></FontAwesomeIcon>
      </div>
      {!isTopPosition() && (isFlyoutOpen || handleGetTheme() != UI_THEME.MINIMAL) ? props.children : ""}
    </div>
  )
}

export default Flyout