import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown as iconPulldown,
} from "@fortawesome/free-solid-svg-icons";
import { toHex } from "../emulator/utility/utility";

interface PullDownProps {
  values: Array<string>;
  setValue: (v: string) => void;
}

class PullDownMenu extends React.Component<PullDownProps, {open: boolean, position: {x: number, y: number}}>
{
  dialogRef = React.createRef<HTMLDivElement>();

  constructor(props: PullDownProps) {
    super(props);
    this.state = {
      open: false,
      position: {x: 0, y: 0}
    }
  }
  handleToggleDialog = () => {
    this.setState({open: !this.state.open})
  }

  handleChooseItem = (value: number) => {
    this.setState({open: false})
    if (value) this.props.setValue(value.toString(16))
  }

  render() {
    return <div ref={this.dialogRef}
      onClick={this.handleToggleDialog}>
      <FontAwesomeIcon icon={iconPulldown}
        className='breakpoint-pushbutton'
        style={{color: "white", fontSize: "12pt", marginTop: "4pt"}}/>
      {this.state.open &&
        <div className="floating-dialog flex-column dark-mode-edit small-mono-text"
          style={{margin: '0', padding: '5px',
            overflow: 'auto',
            height: `${window.innerHeight / 2}px`}}>
          {this.props.values.map((description, addr) => (
            <div style={{cursor: 'pointer'}}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor =  '#aaa'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'inherit'}
              key={addr} onClick={() => this.handleChooseItem(addr)}>
              {`${toHex(addr)} ${description}`}
            </div>))
          }
        </div>
      }
    </div>

  }
}

export default PullDownMenu
