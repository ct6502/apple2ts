import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import ListItemButton from "@mui/material/ListItemButton";
import Menu from "@mui/material/Menu";
import { getMockingboardName } from "./mockingboard_audio";

export const MockingboardWaveform = (props: {mode: number, change: (mode: number) => void}) => {
  const [anchorButton, setAnchorButton] = React.useState<null | HTMLElement>(null);
  const mockOpen = Boolean(anchorButton);
  const handleMockClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorButton(event.currentTarget);
  };
  const handleMockClose = (index = -1) => {
    setAnchorButton(null);
    if (index >= 0) props.change(index)
  };
  const squareWave = <FontAwesomeIcon icon={faWaveSquare}/>

  return (
    <span>
      <button
        id="basic-button"
        className="pushButton"
        title="Mockingboard wave form"
        aria-controls={mockOpen ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={mockOpen ? 'true' : undefined}
        onClick={handleMockClick}
      >
        {squareWave}
      </button>
      <Menu
        id="basic-menu"
        anchorEl={anchorButton}
        open={mockOpen}
        onClose={() => handleMockClose()}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
        <ListItemButton key={i} onClick={() => handleMockClose(i)} selected={i === props.mode}>
          {i === props.mode ? '\u2714\u2009' : '\u2003'}{getMockingboardName(i)}</ListItemButton>))}
      </Menu>
    </span>
  )
}
