import "./flyout.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleArrowDown, faCircleArrowUp, IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { isMinimalTheme } from "./ui_settings"
import { useTranslation } from "../i18n/useTranslation"

const flyoutButtonWidth = "0px"

const Flyout = (props: {
  icon: IconDefinition,
  buttonId?: string,
  position: string,
  title: string,
  highlight?: boolean,
  hideButtonWhenClosed?: boolean,
  minimalPresentation?: boolean,
  width?: string,
  isOpen: () => boolean | undefined,
  onClick: () => void | undefined,
  shift?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any
}) => {
  const className = `flyout-${props.position}`
  const isFlyoutOpen = props.isOpen && props.isOpen()
  const useMinimalPresentation = props.minimalPresentation || isMinimalTheme()
  const { t } = useTranslation()

  if (useMinimalPresentation) {
    import("./flyout.minimal.css")
  }

  if (!isFlyoutOpen && props.hideButtonWhenClosed) {
    return null
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

  let left = "auto"
  let right = "auto"
  const isLeft = props.position.indexOf("left") >= 0
  if (useMinimalPresentation) {
    if (isLeft) {
      left = isFlyoutOpen ? "0px" : (props.shift ? "40px" : "0px")
    } else if (props.position.indexOf("center") >= 0) {
      left = `calc( ${isFlyoutOpen ? "-1.25vw" : "-0.625vw"} + ${window.outerWidth / 2}px - ${isFlyoutOpen ? props.width ?? "auto" : flyoutButtonWidth} / 2)`
    } else {  // right position
      right = isFlyoutOpen ? "0px" : (props.shift ? "80px" : "40px")
    }
  }

  return (
    <div
      className={`flyout ${className} ${useMinimalPresentation ? "flyout-minimal" : ""} ${props.highlight && !isFlyoutOpen ? "flyout-button-highlight" : ""}`}
      style={{
        left: left,
        right: right,
        width: useMinimalPresentation && !isFlyoutOpen ? flyoutButtonWidth : props.width,
        maxHeight: "100%",
        zIndex: isFlyoutOpen ? 10001 : useMinimalPresentation ? 10000 : undefined,
      }}>
      {isTopPosition() && (isFlyoutOpen || !useMinimalPresentation) ? props.children : ""}
      <div
        id={props.buttonId ?? ""}
        className="flyout-button"
        title={!isTouchDevice ? `${isFlyoutOpen ? t("disk.clickToHide") : t("disk.clickToShow")} ${props.title}` : ""}
        onClick={() => {
          if (props.onClick) {
            props.onClick()
          }
        }}>
        <FontAwesomeIcon icon={getArrowIcon()}></FontAwesomeIcon>
      </div>
      {!isTopPosition() && (isFlyoutOpen || !useMinimalPresentation) ? props.children : ""}
    </div>
  )
}

export default Flyout