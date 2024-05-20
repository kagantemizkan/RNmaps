import React, { useState } from 'react'
import { View, StatusBar, Appearance } from 'react-native'
import { Portal, Modal, List, Divider, Text, Button, RadioButton } from 'react-native-paper'
// Slider
import Slider from '@react-native-community/slider';
// Icons
import Ionicons from 'react-native-vector-icons/Ionicons';
// AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
// i18n
import { useTranslation } from 'react-i18next'
// JOTAI
import { useAtom } from 'jotai';
import { themeAtom, speechVolumeAtom, speechRateAtom } from '../atoms';

export default function SettingScreen({ navigation }) {

  // i1n
  const { t, i18n } = useTranslation()

  // Atom States
  const [theme, setTheme] = useAtom(themeAtom);
  const [speechRate, setSpeechRate] = useAtom(speechRateAtom);
  const [speechVolume, setSpeechVolume] = useAtom(speechVolumeAtom);

  // React  States
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false)
  const [speechModalVisible, setSpeechModalVisible] = useState(false)
  const [themeValue, setThemeValue] = useState(theme);
  const [languageValue, setLanguageValue] = useState(i18n.language);

  // FUNCTIONS //

  // AsyncStorage theme setter
  const storeThemeData = async (value) => {
    try {
      await AsyncStorage.setItem('theme', value);
    } catch (e) {
      console.log("Error storeThemeData: ", e)
    }
  };

  // AsyncStorage language setter
  const storeLanguageData = async (value) => {
    try {
      await AsyncStorage.setItem('language', value);
    } catch (e) {
      console.log("Error storeThemeData: ", e)
    }
  };

  // Handle theme setting onPress
  const handleTheme = (value) => {
    if (value === 'system') {
      console.log(Appearance.getColorScheme())
      setTheme(Appearance.getColorScheme())
      storeThemeData(Appearance.getColorScheme())
    } else {
      setTheme(value === "dark" ? "dark" : "light")
      storeThemeData(value === "dark" ? "dark" : "light")
    }
    setThemeModalVisible(false)
  }

  // Handle language setting onPress
  const handleLanguage = (languageValue) => {
    i18n.changeLanguage(languageValue)
    storeLanguageData(languageValue)
    console.log("handleLanguage: ", languageValue)
    setLanguageModalVisible(false)
  }

  // Handle Speech Volume onSlide
  const handleSpeechValueChange = (value) => {
    console.log("handleSpeechValueChange", (value / 10))
    setSpeechVolume((value / 10));
  };

  // Handle Speech Speed onSlide
  const handleSpeechRateChange = (value) => {
    console.log("handleSpeechRateChange", (value / 10))
    setSpeechRate((value / 10));
  };


  return (
    <View style={{ flex: 1 }}>

      {/* StatusBar transparent */}
      <StatusBar translucent backgroundColor="transparent" />

      {/* Modals */}
      <Portal>
        {/* App Theme Modal */}
        <Modal theme={{ colors: { backdrop: 'rgba(16, 16, 16, 0.3)' } }}
          visible={themeModalVisible} onDismiss={() => setThemeModalVisible(false)} contentContainerStyle={{
            paddingVertical: 20,
            marginHorizontal: 28,
            backgroundColor: theme === "dark" ? "#312C38" : "white",
            borderRadius: 32,
            display: "flex"
          }}>
          <Text style={{ fontSize: 26, fontWeight: 700, marginHorizontal: 20 }}>{t("colorScheme")}</Text>
          <View style={{ marginTop: 15 }}>
            <Divider bold={true} />
            <RadioButton.Group onValueChange={newValue => setThemeValue(newValue)} value={themeValue}>
              <RadioButton.Item style={{ flexDirection: 'row-reverse', alignSelf: 'flex-start' }}
                value="system" label={t("systemDefault")} />
              <RadioButton.Item style={{ flexDirection: 'row-reverse', alignSelf: 'flex-start' }}
                value="dark" label={t("dark")} />
              <RadioButton.Item style={{ flexDirection: 'row-reverse', alignSelf: 'flex-start' }}
                value="light" label={t("light")} />
            </RadioButton.Group>
            <Button style={{ marginLeft: "auto", marginHorizontal: 20 }} onPress={() => handleTheme(themeValue)}>
              <Text style={{ fontWeight: 700, fontSize: 16 }}>{t("ok")}</Text>
            </Button>
          </View>
        </Modal>
        {/* Language Modal */}
        <Modal theme={{ colors: { backdrop: 'rgba(16, 16, 16, 0.3)' } }}
          visible={languageModalVisible} onDismiss={() => setLanguageModalVisible(false)} contentContainerStyle={{
            paddingVertical: 20,
            marginHorizontal: 28,
            backgroundColor: theme === "dark" ? "#312C38" : "white",
            borderRadius: 32,
            display: "flex"
          }}>
          <Text style={{ fontSize: 26, fontWeight: 700, marginHorizontal: 20 }}>{t("language")}</Text>
          <View style={{ marginTop: 15 }}>
            <Divider bold={true} />
            <RadioButton.Group onValueChange={newLanguageValue => setLanguageValue(newLanguageValue)} value={languageValue}>
              <RadioButton.Item style={{ flexDirection: 'row-reverse', alignSelf: 'flex-start' }}
                value="tr" label={t("turkish")} />
              <RadioButton.Item style={{ flexDirection: 'row-reverse', alignSelf: 'flex-start' }}
                value="en" label={t("english")} />
            </RadioButton.Group>
            <Button style={{ marginLeft: "auto", marginHorizontal: 20 }} onPress={() => handleLanguage(languageValue)}>
              <Text style={{ fontWeight: 700, fontSize: 16 }}>{t("ok")}</Text>
            </Button>
          </View>
        </Modal>
        {/* Speech Settings Modal */}
        <Modal theme={{ colors: { backdrop: 'rgba(16, 16, 16, 0.3)' } }}
          visible={speechModalVisible} onDismiss={() => setSpeechModalVisible(false)} contentContainerStyle={{
            paddingVertical: 20,
            marginHorizontal: 28,
            backgroundColor: theme === "dark" ? "#312C38" : "white",
            borderRadius: 32,
            display: "flex"
          }}>
          <Text style={{ fontSize: 26, fontWeight: 700, marginHorizontal: 20 }}>{t("speechSettings")}</Text>
          <View style={{ marginTop: 15 }}>
            <Divider bold={true} style={{marginBottom: 15}} />
            <View style={{ gap: 16 }}>
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 18, marginHorizontal: 20 }}>{t("speechVolume")}</Text>
                <Slider
                  //tapToSeek
                  //renderStepNumber
                  style={{ height: 40, marginHorizontal: 10 }}
                  minimumValue={0}
                  maximumValue={10}
                  step={1}
                  onValueChange={handleSpeechValueChange}
                  value={speechVolume * 10}
                />
              </View>
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 18, marginHorizontal: 20 }}>{t("speechRate")}</Text>
                <Slider
                  //tapToSeek
                  //renderStepNumber
                  style={{ height: 40, marginHorizontal: 10 }}
                  minimumValue={0}
                  maximumValue={10}
                  step={1}
                  onValueChange={handleSpeechRateChange}
                  value={speechRate * 10}
                />
              </View>
            </View>
            <Button style={{ marginLeft: "auto", marginHorizontal: 20 }} onPress={() => setSpeechModalVisible(false)}>
              <Text style={{ fontWeight: 700, fontSize: 16 }}>{t("ok")}</Text>
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Settings Header */}
      <Text style={{ paddingTop: 36, paddingBottom: 18, fontSize: 46, paddingLeft: 18 }}>{t("settings")}</Text>
      {/* List Items */}
      <List.Item
        onPress={() => setThemeModalVisible(true)}
        title={t("colorScheme")}
        left={props => <Ionicons {...props} name="sunny" size={28} />}
        //moon
        style={{ height: 65, justifyContent: "center" }}
      />
      <List.Item
        onPress={() => setLanguageModalVisible(true)}
        title={t("language")}
        left={props => <Ionicons {...props} name="language" size={28} />}
        style={{ height: 65, justifyContent: "center" }}
      />
      <List.Item
        onPress={() => setSpeechModalVisible(true)}
        title={t("speechSettings")}
        left={props => <Ionicons {...props} name="volume-medium" size={28} />}
        style={{ height: 65, justifyContent: "center" }}
      />
      <List.Item
        onPress={() => navigation.navigate('AboutApp')}
        title={t("info")}
        left={props => <Ionicons {...props} name="information-circle" size={28} />}
        style={{ height: 65, justifyContent: "center" }}
      />
    </View>
  )
}