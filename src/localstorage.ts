import { passDarkMode } from "./main2worker";

export const setLocalStorageDarkMode = (darkMode: boolean) => {
  localStorage.setItem('darkMode', JSON.stringify(darkMode));
  passDarkMode(darkMode);
}

export const updateFromLocalStorage = () => {
  const darkMode = JSON.parse(localStorage.getItem('darkMode') || 'false') as boolean;
  passDarkMode(darkMode);
}

