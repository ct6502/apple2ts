import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWarning
} from "@fortawesome/free-solid-svg-icons";

interface EditFieldProps {
  name: string;
  value: string;
  setValue: (v: string) => void;
  placeholder?: string;
  width?: string;
  warning?: string;
}

class EditField extends React.Component<EditFieldProps, object>
{
  handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.setValue(e.target.value)
  }
  render() {
    return <div className="flex-row" style={{position: "relative"}}>
      <div className="white-title">{this.props.name}: </div>
      <input type="text"
        className="dark-mode-edit"
        placeholder={this.props.placeholder}
        value={this.props.value}
        style={{width: this.props.width || "100%"}}
        onChange={(e) => this.handleValueChange(e)}/>
      {this.props.warning &&
        <div className="warning-div flex-row">
        <FontAwesomeIcon icon={faWarning}
          className="warning-icon"
          title={this.props.warning}/>
        <div className="warning-text">{this.props.warning}</div>
        </div>}
    </div>
  }
}

export default EditField
