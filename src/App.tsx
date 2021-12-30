// import logo from './logo.svg';
import './App.css';
import { SettingsProvider } from "./contexts/settings";
import DisplayApple2 from "./display";

const App = () => {
  return (
    <SettingsProvider>
      <DisplayApple2 />
    </SettingsProvider>
  );
};

export default App;
