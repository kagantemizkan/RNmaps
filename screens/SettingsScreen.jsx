import { View, StatusBar, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Portal, Modal, List, Divider, Text, Button } from 'react-native-paper'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { useAtom } from 'jotai';
import { themeAtom } from '../atoms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next'

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function SettingScreen() {
  const { t, i18n } = useTranslation()
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false)

  const [themeValue, setThemeValue] = useState('system');
  const [languageValue, setLanguageValue] = useState(i18n.language);

  const [theme, setTheme] = useAtom(themeAtom);
  
  const storeThemeData = async (value) => {
    try {
      await AsyncStorage.setItem('theme', value);
    } catch (e) {
      console.log("Error storeThemeData: ", e)
    }
  };

  const storeLanguageData = async (value) => {
    try {
      await AsyncStorage.setItem('language', value);
    } catch (e) {
      console.log("Error storeThemeData: ", e)
    }
  };

  const handleTheme = (value) => {
    console.log(value)
    setTheme(value === "dark" ? "dark" : "light")
    storeThemeData(value === "dark" ? "dark" : "light")
    setThemeModalVisible(false)
  }

  const handleLanguage = (languageValue) => {
    i18n.changeLanguage(languageValue)
    storeLanguageData(languageValue)
    console.log("handleLanguage: ",languageValue)
    setLanguageModalVisible(false)
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" />

      <Portal>
        {/* App Theme Modal */}
        <Modal theme={{colors: {backdrop: 'rgba(16, 16, 16, 0.3)'}}}
          visible={themeModalVisible} onDismiss={() => setThemeModalVisible(false)} contentContainerStyle={{
          paddingVertical: 20,
          marginHorizontal: 28,
          backgroundColor: theme === "dark" ? "#312C38" : "white",
          borderRadius: 32,
          display: "flex"
        }}>
          <Text style={{ fontSize: 26, fontWeight: 700, marginHorizontal: 20 }}>Color Scheme</Text>
          <View style={{ marginTop: 24 }}>
            <RadioButton.Group onValueChange={newValue => setThemeValue(newValue)} value={themeValue}>
              <RadioButton.Item style={{ flexDirection: 'row-reverse', alignSelf: 'flex-start' }}
                value="system" label={t("systemDefault")} />
              <RadioButton.Item style={{ flexDirection: 'row-reverse', alignSelf: 'flex-start' }}
                value="dark" label={t("dark")}/>
              <RadioButton.Item style={{ flexDirection: 'row-reverse', alignSelf: 'flex-start' }}
                value="light" label={t("light")} />
            </RadioButton.Group>
            <Button style={{ marginLeft: "auto", marginHorizontal: 20 }} onPress={() => handleTheme(themeValue)}>
              <Text style={{ fontWeight: 700, fontSize: 16 }}>{t("ok")}</Text>
            </Button>
          </View>
        </Modal>

        {/* Language Modal */}
        <Modal theme={{colors: {backdrop: 'rgba(16, 16, 16, 0.3)'}}}
          visible={languageModalVisible} onDismiss={() => setLanguageModalVisible(false)} contentContainerStyle={{
          paddingVertical: 20,
          marginHorizontal: 28,
          backgroundColor: theme === "dark" ? "#312C38" : "white",
          borderRadius: 32,
          display: "flex"
        }}>
          <Text style={{ fontSize: 26, fontWeight: 700, marginHorizontal: 20 }}>{t("language")}</Text>
          <View style={{ marginTop: 24 }}>
            <RadioButton.Group onValueChange={newLanguageValue => setLanguageValue(newLanguageValue)} value={languageValue}>
              <RadioButton.Item style={{ flexDirection: 'row-reverse', alignSelf: 'flex-start' }}
                value="tr" label={t("turkish")} />
              <RadioButton.Item style={{ flexDirection: 'row-reverse', alignSelf: 'flex-start' }}
                value="en" label={t("english")}/>
            </RadioButton.Group>
            <Button style={{ marginLeft: "auto", marginHorizontal: 20 }} onPress={() => handleLanguage(languageValue)}>
              <Text style={{ fontWeight: 700, fontSize: 16 }}>{t("ok")}</Text>
            </Button>
          </View>
        </Modal>
      </Portal>


      <Text style={{ marginTop: 48, marginBottom: 12, fontSize: 42, marginLeft: 18 }}>{t("settings")}</Text>
      <Divider bold={true} />
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
        onPress={() => console.log('Pressed')}
        title={t("speechVolume")}
        left={props => <Ionicons {...props} name="volume-medium" size={28} />}
        style={{ height: 65, justifyContent: "center" }}
      />
      <List.Item
        onPress={() => console.log('Pressed')}
        title={t("info")}
        left={props => <Ionicons {...props} name="information-circle" size={28} />}
        style={{ height: 65, justifyContent: "center" }}
      />

      <Slider
        style={{ width: windowWidth / 1.2, height: 40 }}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
      />
    </View>
  )
}