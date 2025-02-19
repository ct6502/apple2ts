import "./flyout.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleArrowDown, faCircleArrowUp, IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { handleGetTheme } from "./main2worker"
import { UI_THEME } from "../common/utility"

const Flyout = (props: {
  icon: IconDefinition,
  buttonId?: string,
  position: string,
  isOpen: () => boolean | undefined,
  onClick: () => void | undefined
  children: any
}) => {
  const className = `flyout-${props.position}`
  const isFlyoutOpen = props.isOpen && props.isOpen()
  const isMinimalTheme = handleGetTheme() == UI_THEME.MINIMAL

  const isTopPosition = () => {
    return props.position.search('top') >= 0
  }

  const getArrowIcon = (): IconDefinition => {
    if (isFlyoutOpen) {
      return isTopPosition() ? faCircleArrowUp : faCircleArrowDown
    } else {
      return props.icon
    }
  }

  return (
    <div
      className={`flyout ${className}`}
      style={{
        width: isMinimalTheme && !isFlyoutOpen ? '72px' : 'auto',
        opacity: isMinimalTheme && !isFlyoutOpen ? '33%' : '100%'
      }}>
      {isTopPosition() && (isFlyoutOpen || handleGetTheme() != UI_THEME.MINIMAL) ? props.children : ''}
      <div
        id={props.buttonId ?? ''}
        className="flyout-button"
        onClick={() => {
          props.onClick && props.onClick()

          // const hiddenText = document.getElementsByClassName('hidden-textarea')[0] as HTMLElement
          // if (hiddenText) {
          //   hiddenText.focus()
          // }
        }}>
        <FontAwesomeIcon icon={getArrowIcon()}></FontAwesomeIcon>
      </div>
      {!isTopPosition() && (isFlyoutOpen || handleGetTheme() != UI_THEME.MINIMAL) ? props.children : ''}
    </div>
  )
}

export default Flyout