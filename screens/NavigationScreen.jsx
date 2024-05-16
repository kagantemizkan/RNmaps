import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StatusBar, Pressable, Button, Keyboard, Image } from 'react-native';
import MapComponent from '../components/MapComponent';
import { Searchbar, FAB } from 'react-native-paper';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Voice from '@react-native-voice/voice';
import { useAtom } from 'jotai';
import { startPointAtom, searchTextAtom, userLocationAtom, themeAtom } from '../atoms'
import { useTranslation } from 'react-i18next';

const NavigationScreen = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const { t } = useTranslation();
  // console.log("i18n ready: ",ready)
  const mapRef = useRef(null);
  const [startPoint, setStartPoint] = useAtom(startPointAtom)
  const [searchText, setSearchText] = useAtom(searchTextAtom);
  const [userLocation, setUserLocation] = useAtom(userLocationAtom);
  const [text, setText] = useState()
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      setText(event.value[0]);
      setIsListening(false);
      Voice.stop();
      console.log('Recognized text:', event.value[0]);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);



  const handleVoiceRecognition = async () => {
    console.log("first")
    try {
      setIsListening(true);
      await Voice.start('tr-TR');
    } catch (error) {
      console.error('Voice recognition error:', error);
    }
  };

  const handleCenter = () => {
    if (userLocation) { // Check if mapRef.current is defined
      const { latitude, longitude } = userLocation;
      mapRef.current.animateToRegion({ // Use mapRef.current.animateToRegion
        latitude,
        longitude,
        latitudeDelta: 0.0043,
        longitudeDelta: 0.0034
      });
    }
  }

  const handleSubmit = () => {
    Keyboard.dismiss();
    setSearchText(text)
    console.log(text)
  };

  const startRoute = () => {
    console.log("startRoute: ", userLocation)
    setStartPoint(userLocation)
  }


  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" />
      <Searchbar
        elevation={3}
        inputStyle={{
          color: theme === "dark" ? "white" : "black",
          fontSize: 18,
          minHeight: 0
        }}
        right={() =>
          <Pressable onPress={handleVoiceRecognition}>
            <Ionicons name="mic" size={28} color={theme === "dark" ? "#CBC4CC" : "gray"} />
          </Pressable>
        }
        icon={() => <Image source={require("../assets/mapIcon.png")} style={{ width: 22, height: 34 }} />}
        style={{ position: "absolute", marginTop: 44, marginHorizontal: 8, paddingRight: 14 }}
        placeholder={t("searchLocation")}
        placeholderTextColor="#9B9DA2"
        onChangeText={(text) => setText(text)}
        value={text}
        onSubmitEditing={handleSubmit}
      />
      <FAB
        variant="surface"
        icon={({ size, color }) => <FontAwesome6 name="location-crosshairs" size={size} color={color} />}
        style={{
          elevation: 3,
          zIndex: 10,
          position: 'absolute',
          bottom: 20,
          right: 15,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          width: 64,
          height: 64,
        }}
        onPress={handleCenter}
      />
      {searchText &&
        <FAB
          variant="surface"
          icon={({ size, color }) => <MaterialIcons name="directions" size={size} color={color} />}
          label='Start route'
          style={{
            elevation: 3,
            zIndex: 10,
            position: 'absolute',
            bottom: 20,
            left: 15,
            borderRadius: 20,
            alignItems: 'center', // Center the content horizontally
            justifyContent: 'center', // Center the content vertically
            height: 64, // Set a fixed height to ensure the button is square
          }}
          onPress={startRoute} // Make sure to invoke the onPress function
        />
      }
      <MapComponent mapRef={mapRef} />
    </View>
  );
};

export default NavigationScreen