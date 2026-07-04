import React, { useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faWarning
} from "@fortawesome/free-solid-svg-icons"

interface EditFieldProps {
  name?: string;
  value: string;
  setValue: (v: string) => void;
  placeholder?: string;
  width?: string;
  help?: string;
  warning?: string;
  initialFocus?: boolean;
  disabled?: boolean;
  isHex?: boolean;
  isNumber?: boolean;
  showSuggestions?: boolean;
}

const EditField = (props: EditFieldProps) => {
  const inputRef = useRef(null)
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setValue(e.target.value)
  }
  useEffect(() => {
    if (props.initialFocus && inputRef.current) {
      const input = inputRef.current as HTMLInputElement
      input.focus()
    }
  }, [props.initialFocus])

  const testKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow control keys, backspace, delete, arrows, tab, etc.
    const safeKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight",
      "ArrowUp", "ArrowDown", "Tab", "Enter", "Home", "End"]
    if (e.ctrlKey || e.metaKey || e.altKey || safeKeys.includes(e.key)) {
      return
    }
    // Only allow hex digits and space
    if (props.isHex && !/^[0-9a-fA-F\s]$/.test(e.key)) {
      e.preventDefault()
    }
    // Only allow numbers
    if (props.isNumber && !/^[0-9]$/.test(e.key)) {
      e.preventDefault()
    }
  }

  const textfield = <span>
    <input type="text"
      disabled={props.disabled}
      name={props.name ? props.name : "textfield"}
      ref={inputRef}
      className="hex-field"
      autoComplete={props.showSuggestions === false ? "off" : undefined}
      onKeyDown={props.isHex || props.isNumber ? testKey : undefined}
      placeholder={props.placeholder}
      value={props.value}
      style={{ width: props.width || "100%", textAlign: "right" }}
      onChange={(e) => handleValueChange(e)} />
    {props.warning &&
      <div className="warning-div flex-row">
        <FontAwesomeIcon icon={faWarning}
          className="warning-icon"
          title={props.warning} />
        <div className="warning-text">{props.warning}</div>
      </div>}
    {(props.help && !props.warning) &&
      <div className="warning-div flex-row">
        <div className="warning-text-help">{props.help}</div>
      </div>}
  </span>
  return (
    props.name ?
      <div className="flex-row" style={{ marginTop: "2px", position: "relative" }}>
        <div className="dialog-title">{props.name}</div>
        {textfield}
      </div> :
      <span>{textfield}</span>
  )
}

export default EditField
