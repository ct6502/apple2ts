import React from "react";

interface DroplistProps {
  name: string;
  value: string;
  values: string[];
  setValue: (v: string) => void;
  address: number;
  isDisabled: (address: number, value: string) => boolean;
}

class Droplist extends React.Component<DroplistProps, object>
{
  handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.setValue(e.target.value)
  }
  render() {
    return <div className="flex-row" style={{ marginTop: '2px', position: "relative" }}>
      <div className="white-title">{this.props.name}</div>
      <select value={this.props.value}
        className="dark-mode-edit"
        style={{ height: "24px" }}
        onChange={this.handleValueChange}>
        {this.props.values.map((value, i) => (
          <option key={i} value={value} disabled={this.props.isDisabled(this.props.address, value)}>{value}</option>))
        }
      </select>
    </div>
  }
}

export default Droplist
