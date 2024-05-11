/**
 * @format
 */

import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { DefaultTheme, MD3DarkTheme, Provider as PaperProvider } from 'react-native-paper';
import { Appearance } from 'react-native';

export default function Main() {
  const systemTheme = Appearance.getColorScheme();

  const theme = systemTheme === 'dark' ? MD3DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={theme}>
      <App />
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);