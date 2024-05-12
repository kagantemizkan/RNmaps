/**
 * @format
 */

import React, {useRef, useEffect} from 'react';
import { AppRegistry, AppState } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { DefaultTheme, MD3DarkTheme, Provider as PaperProvider } from 'react-native-paper';
import { Appearance } from 'react-native';
import { useAtom } from 'jotai';
import { themeAtom } from './atoms';


export default function Main() {


  const appState = useRef(AppState.currentState);
  const [systemTheme, setSystemTheme] = useAtom(themeAtom);
  
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // console.log('App has come to the foreground!');
      }
      appState.current = nextAppState;
      // console.log('AppState', appState.current);
      if(appState.current === "active") {
        setSystemTheme(Appearance.getColorScheme())
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const theme = systemTheme === 'dark' ? MD3DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={theme}>
      <App />
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);