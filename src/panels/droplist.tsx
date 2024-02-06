import React from "react";

interface DroplistProps {
  name: string;
  className: string;
  value: string;
  values: string[];
  setValue: (v: string) => void;
  address: number;
  isDisabled: (address: number, value: string) => boolean;
}

export const Droplist = (props: DroplistProps) => {
  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    props.setValue(e.target.value)
  }

  return <div className="flex-row">
    {props.name && <div className="white-title">{props.name}</div>}
    <select value={props.value}
      className={props.className}
      style={{ height: "24px" }}
      onChange={handleValueChange}>
      {props.values.map((value, i) => (
        <option key={i} value={value} disabled={props.isDisabled(props.address, value)}>{value}</option>))
      }
    </select>
  </div>
}
