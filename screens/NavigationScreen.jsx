import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StatusBar, Pressable, Button, Keyboard } from 'react-native';
import MapComponent from '../components/MapComponent';
import { Searchbar, FAB } from 'react-native-paper';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Geolocation from '@react-native-community/geolocation';
import { useAtom } from 'jotai';
import { startPointAtom, searchTextAtom, userLocationAtom } from '../atoms'

const NavigationScreen = () => {

  const mapRef = useRef(null);


  const [startPoint, setStartPoint] = useAtom(startPointAtom)

  const [searchText, setSearchText] = useAtom(searchTextAtom);
  const [userLocation, setUserLocation] = useAtom(userLocationAtom);

  const [text, setText] = useState()


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
        style={{ fontSize: 20, position: "absolute", marginTop: 48, marginHorizontal: 8 }}
        placeholder="Search location"
        placeholderTextColor="#9B9DA2"
        onChangeText={(text) => setText(text)}
        value={text}
        onSubmitEditing={handleSubmit}
      />
      <FAB
        icon={({ size, color }) => <FontAwesome6 name="location-crosshairs" size={size} color={color} />}
        style={{
          elevation: 6,
          zIndex: 10,
          position: 'absolute',
          bottom: 20,
          right: 15,
          backgroundColor: '#2B2732',
          borderRadius: 20,
          alignItems: 'center', // Center the content horizontally
          justifyContent: 'center', // Center the content vertically
          width: 64, // Set a fixed width to ensure the button is square
          height: 64, // Set a fixed height to ensure the button is square
        }}
        onPress={handleCenter} // Make sure to invoke the onPress function
      />
      {searchText &&
        <FAB
          icon={({ size, color }) => <MaterialIcons name="directions" size={size} color={color} />}
          label='Start route'
          style={{
            elevation: 6,
            zIndex: 10,
            position: 'absolute',
            bottom: 20,
            left: 15,
            backgroundColor: '#2B2732',
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