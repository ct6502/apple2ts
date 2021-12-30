import * as React from "react";

export const ENABLE_DARKMODE = "darkmode";

interface EnableDarkmodeAction {
  type: typeof ENABLE_DARKMODE;
  payload: boolean;
}

type SettingsActionTypes = EnableDarkmodeAction;

type Dispatch = (action: SettingsActionTypes) => void;
type State = {
  darkMode: boolean;
};

type SettingsProviderProps = { children: React.ReactNode };

const SettingsStateContext = React.createContext<State | undefined>(undefined);
const SettingsDispatchContext = React.createContext<Dispatch | undefined>(
  undefined
);

function settingsReducer(state: State, action: SettingsActionTypes): State {
  switch (action.type) {
    case ENABLE_DARKMODE: {
      return { ...state, darkMode: action.payload };
    }
    default: {
      throw new Error(`Unhandled action type`);
    }
  }
}

function SettingsProvider({ children }: SettingsProviderProps) {
  const [state, dispatch] = React.useReducer(settingsReducer, {
    darkMode: false,
  });

  return (
    <SettingsStateContext.Provider value={state}>
      <SettingsDispatchContext.Provider value={dispatch}>
        {children}
      </SettingsDispatchContext.Provider>
    </SettingsStateContext.Provider>
  );
}
function useSettingsState() {
  const context = React.useContext(SettingsStateContext);
  if (context === undefined) {
    throw new Error("useSettingsState must be used within a SettingsProvider");
  }
  return context;
}
function useSettingsDispatch() {
  const context = React.useContext(SettingsDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useSettingsDispatch must be used within a SettingsProvider"
    );
  }
  return context;
}
export { SettingsProvider, useSettingsState, useSettingsDispatch };
