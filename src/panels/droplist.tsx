import React, { useEffect, useRef } from "react";

interface DroplistProps {
  name: string;
  className: string;
  value: string;
  values: string[];
  setValue: (v: string) => void;
  userdata: number;
  isDisabled: (value: string, userdata: number) => boolean;
}

export const Droplist = (props: DroplistProps) => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (selectRef.current && spanRef.current) {
      let maxWidth = 0;
      for (const option of selectRef.current.options) {
        spanRef.current.textContent = option.textContent || '';
        const spanWidth = spanRef.current.getBoundingClientRect().width;
        if (spanWidth > maxWidth) {
          maxWidth = spanWidth;
        }
      }
      selectRef.current.style.width = `${maxWidth}px`;
    }
  }, [props.values]);

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    props.setValue(e.target.value)
  }

  return <div className="flex-row">
    {props.name && <div className="white-title">{props.name}</div>}
    <select value={props.value}
      ref={selectRef}
      className={props.className}
      style={{ height: "24px" }}
      onChange={handleValueChange}>
      {props.values.map((value, i) => (
        <option key={i} value={value}
          disabled={props.isDisabled(value, props.userdata)}>{value}
        </option>))
      }
    </select>
    <span
      ref={spanRef}
      style={{
        visibility: 'hidden',
        whiteSpace: 'nowrap',
        position: 'absolute',
        fontSize: '1rem', // Adjust this to match the font size of the select element
      }}
    />
  </div>
}
