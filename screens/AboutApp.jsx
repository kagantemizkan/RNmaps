import { View, StatusBar, Pressable } from 'react-native'
import { Portal, Modal, List, Divider, Text, Button, RadioButton } from 'react-native-paper'
import React from 'react'
// Icons
import Ionicons from 'react-native-vector-icons/Ionicons';
// i18n
import { useTranslation } from 'react-i18next'
// JOTAI
import { useAtom } from 'jotai';
import { themeAtom } from '../atoms';

export default function AboutApp({ navigation }) {
  
  // i18n
  const { t, i18n } = useTranslation()

  // Atom States
  const [theme, setTheme] = useAtom(themeAtom);

  return (
    <View style={{ flex: 1 }}>
      {/* StatusBar transparent */}
      <StatusBar translucent backgroundColor="transparent" />
      {/* Settings Header */}
      <View style={{ marginTop: 42, marginBottom: 18, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 20 }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={34} style={[theme === "dark" ? {color: "white"} : {color: "black"}, { marginTop: 2 }]} />
        </Pressable>
        <Text style={{ fontSize: 28 }}>{t("aboutApp")}</Text>
      </View>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>
          {t("appDescription")}
        </Text>
        <Text style={{ fontSize: 16, color: 'gray', marginTop: 10 }}>
          {t("appFeatures")}
        </Text>
        <Text style={{ fontSize: 16, color: 'gray', marginTop: 10 }}>
          {t("appProjectInfo")}
        </Text>
      </View>
    </View>
  )
}