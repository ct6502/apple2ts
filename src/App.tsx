import './App.css';
import { SettingsProvider } from "./contexts/settings";
import DisplayApple2 from "./display";

const App = () => {
  return (
    <SettingsProvider>
        <link rel="preload" href="./src/fonts/PrintChar21.woff2" as="font"/>
      <DisplayApple2 />
    </SettingsProvider>
  );
};

export default App;
