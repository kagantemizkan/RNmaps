/**
 * @format
 */

import React, { useRef, useEffect, useState } from 'react';
import { AppRegistry, AppState, LogBox } from 'react-native';
import i18n from './i18n/i18n';
import App from './App';
import { name as appName } from './app.json';
import { DefaultTheme, MD3DarkTheme, Provider as PaperProvider } from 'react-native-paper';
import { Appearance } from 'react-native';
import { useAtom } from 'jotai';
import { themeAtom } from './atoms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next'


export default function Main() {
  const { t, i18n } = useTranslation()

  const [theme, setTheme] = useAtom(themeAtom);
  const [appReady, setAppReady] = useState(false)

  const storeThemeData = async (value) => {
    try {
      await AsyncStorage.setItem('theme', value);
    } catch (e) {
      console.log("Error storeData: ", e)
    }
  };

  const getThemeData = async () => {
    try {
      const value = await AsyncStorage.getItem("theme");
      if (value !== null) {
        return value
      } else {
        return false
      }
    } catch (e) {
      console.log("Error getThemeData: ", e)
    }
  };


  
  const storeLanguageData = async (value) => {
    try {
      await AsyncStorage.setItem('theme', value);
    } catch (e) {
      console.log("Error storeData: ", e)
    }
  };


  const getLanguageData = async () => {
    try {
      const value = await AsyncStorage.getItem("language");
      if (value !== null) {
        return value
      } else {
        return false
      }
    } catch (e) {
      console.log("Error getThemeData: ", e)
    }
  };
  


  useEffect(() => {
    const fetchData = async () => {
      const asyncTheme = await getThemeData();
      const asyncLanguage = await getLanguageData();
      if (asyncTheme === null) {
        storeThemeData(Appearance.getColorScheme())
        setTheme(Appearance.getColorScheme())
      }
      setTheme(asyncTheme)
      if (asyncLanguage === null) {
        storeLanguageData("en")
      } else {
        i18n.changeLanguage(asyncLanguage)
      }
    };
    fetchData()
    .then(() => {
      setAppReady(true)
    })
  }, []);




  if (appReady) {
    return (
      <PaperProvider theme={theme === 'dark' ?
        {
          ...MD3DarkTheme,
          colors: {
            ...MD3DarkTheme.colors,
            background: "#141218",
            primary: "#CBC4CC",
            secondaryContainer: "#004A77",
          },
        }
        :
        {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: "#FEF7FF",
            primary: "gray",
            secondaryContainer: "#BEC1C4",
          },
        }
      }>
        <App />
      </PaperProvider>
    );
  }
}

AppRegistry.registerComponent(appName, () => Main);