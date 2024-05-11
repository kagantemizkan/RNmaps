import React from 'react';
import { Provider as PaperProvider, DarkTheme, LightTheme } from 'react-native-paper';
import { useAtom } from 'jotai';    
import { themeAtom } from './ThemeAtom';

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useAtom(themeAtom);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = themeMode === 'dark' ? DarkTheme : LightTheme;

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
};
