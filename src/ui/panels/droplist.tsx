import React, { useEffect, useRef } from "react"

interface DroplistProps {
  name?: string;
  value: string;
  values: string[];
  setValue: (v: string) => void;
  userdata?: number;
  disabled?: boolean;
  isDisabled?: (value: string, userdata: number) => boolean;
  narrow?: boolean;
  monospace?: boolean;
}

export const Droplist = (props: DroplistProps) => {
  const selectRef = useRef<HTMLSelectElement>(null)
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (selectRef.current && spanRef.current) {
      let maxWidth = 45  // minimum width
      for (const option of selectRef.current.options) {
        spanRef.current.textContent = option.textContent || ""
        const spanWidth = spanRef.current.getBoundingClientRect().width + 5
        maxWidth = Math.max(maxWidth, spanWidth)
      }
      // The narrow width should be enough for a single character
      selectRef.current.style.width = `${props.narrow ? 40 : maxWidth}px`
    }
  }, [props.values, props.narrow])

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    props.setValue(e.target.value)
  }

  const spanselect = <span>
    <select value={props.value}
      ref={selectRef}
      className={"droplist-edit" + (props.monospace ? " use-monospace" : "")}
      style={{ height: "24px" }}
      disabled={props.disabled}
      onChange={handleValueChange}>
      {props.values.map((value, i) => (
        <option key={i} value={value}
          className={props.monospace ? "use-monospace" : ""}
          disabled={props.isDisabled && props.isDisabled(value, props.userdata || 0)}>{value}
        </option>))
      }
    </select>
    <span
      ref={spanRef}
      style={{
        visibility: "hidden",
        whiteSpace: "nowrap",
        position: "absolute",
        fontSize: "1rem", // Adjust this to match the font size of the select element
      }}
    />
  </span>

  return (props.name ? <div className="flex-row">
    <div className="dialog-title">{props.name}</div>{spanselect}</div> :
    <span>{spanselect}</span>)
}
