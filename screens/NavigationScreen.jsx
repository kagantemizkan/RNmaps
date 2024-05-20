import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StatusBar, Pressable, Keyboard, Image, Dimensions } from 'react-native';
import { Searchbar, FAB, Text, Divider, Avatar } from 'react-native-paper';
// Icons
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
// Gorhom Bottom Sheet
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet';
// MapComponent 
import MapComponent from '../components/MapComponent';
// Voice recognition
import Voice from '@react-native-voice/voice';
// i18n
import { useTranslation } from 'react-i18next';
// JOTAI
import { useAtom } from 'jotai';
import { useAtomCallback } from 'jotai/utils'
import { startPointAtom, searchTextAtom, userLocationAtom, themeAtom, oldUserLocationAtom } from '../atoms'
// Reanimated
import Animated, { useSharedValue, useAnimatedStyle, withTiming, useDerivedValue, useAnimatedReaction } from 'react-native-reanimated';
import Geolocation from '@react-native-community/geolocation';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const NavigationScreen = () => {

  const GOOGLE_PLACES_API_KEY = "AIzaSyCOwMmlEf95NH9VCJj7Ksb-4RIJZFruBu4"
  // i18n
  const { t } = useTranslation();

  // useRefs
  const mapRef = useRef(null);
  const localInputRef = useRef();

  // Atom States
  const [theme, setTheme] = useAtom(themeAtom);
  const [startPoint, setStartPoint] = useAtom(startPointAtom)
  const [searchText, setSearchText] = useAtom(searchTextAtom);
  const [userLocation, setUserLocation] = useAtom(userLocationAtom);
  const [oldUserLocation, setOldUserLocation] = useAtom(oldUserLocationAtom);

  // React States
  const [text, setText] = useState()
  const [isListening, setIsListening] = useState(false)
  const [locationInfo, setLocationInfo] = useState()
  const [placePhotos, setPlacePhotos] = useState([])

  const animatedPosition = useSharedValue(0);

  const animatedFabStyle = useAnimatedStyle(() => {
    const translateY = animatedPosition.value >= 500 ? animatedPosition.value - 800 : -300;
    return {
      transform: [{ translateY }],
    };
  });


  /* useDerivedValue(() => {
    console.log(animatedPosition.value, 'here you will get value of every position');
  }, [animatedPosition]); */


  // useEffects

  // Listen user voice
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

  const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;

    const lat1 = coords1.latitude;
    const lon1 = coords1.longitude;
    const lat2 = coords2.latitude;
    const lon2 = coords2.longitude;

    const R = 6371; // Dünya'nın yarıçapı (kilometre cinsinden)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Kilometre cinsinden mesafe

    return distance;
  };

  const fetchLocationDetails = useAtomCallback(async (get, set) => {
    try {
      const oldUserLocation = get(oldUserLocationAtom); // Get the current userLocation from the atom

      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 25000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      const newLocation = { latitude, longitude };
      
      console.log("newLocation: ", newLocation);
      console.log("oldLocation: ", oldUserLocation);

      // Eğer yeni konum, mevcut konumdan 5 kilometreden az değiştiyse işlemi durdur
      if (oldUserLocation && haversineDistance(oldUserLocation, newLocation) < 10) {
        console.log('Yeni konum mevcut konumdan 5 kilometreden az değişti, fetch isteği atlamıyor.');
        return;
      } else {
        // Fetch geocode data
        const geocodeData = await fetchGeocodeData(latitude, longitude);
        const temporaryLocationValue = geocodeData.results[0].geometry.location;
        const oldLocation = {
          latitude: temporaryLocationValue.lat,
          longitude: temporaryLocationValue.lng
        };
        console.log(oldLocation);
        set(oldUserLocationAtom, oldLocation);

        console.log("Latitude:", geocodeData.results[0].geometry.location);

        const locationInfo = getLocationDetails(geocodeData);
        console.log(locationInfo);

        try {
          // Fetch additional place details
          const photoUrls = await fetchAdditionalPlaceDetails(locationInfo);
          setPlacePhotos(photoUrls);
        } catch (error) {
          console.error('Error fetching place details:', error);
        }

        setLocationInfo(locationInfo);
      }

      
    } catch (error) {
      console.error('Hata:', error);
    }
  });

  const fetchGeocodeData = async (latitude, longitude) => {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`);
    const data = await response.json();
    return data;
  };

  const fetchAdditionalPlaceDetails = async (locationInfo) => {
    const placeId = await fetchPlaceId(`${locationInfo.il} ${locationInfo.ilce} ${locationInfo.mahalle}`);
    const photos = await fetchPlaceDetails(placeId);
    let photoUrls = [];
    if (photos && photos.length > 0) {
      photoUrls = photos.slice(0, 15).map(photo => fetchPlacePhotoUrl(photo.photo_reference));
    }
    return photoUrls;
  };

  useEffect(() => {
    console.log("userLocation Değişti: ", userLocation)
  }, [userLocation])

  useEffect(() => {
    console.log("oldUserLocation Değişti: ", oldUserLocation)
  }, [oldUserLocation])




  // FUNCTIONS //

  function getLocationDetails(geocodeResponse) {
    let mahalle = '';
    let ilce = '';
    let il = '';

    if (geocodeResponse.results && geocodeResponse.results.length > 0) {
      const addressComponents = geocodeResponse.results[0].address_components;

      addressComponents.forEach(component => {
        if (component.types.includes("administrative_area_level_2")) {
          ilce = component.long_name;
        }
        if (component.types.includes("administrative_area_level_4")) {
          mahalle = component.long_name;
        }
        if (component.types.includes("administrative_area_level_1")) {
          il = component.long_name;
        }
      });
    }

    return { il, ilce, mahalle };
  }


  // Handle voice recognition onPress
  const handleVoiceRecognition = async () => {
    console.log("first")
    try {
      setIsListening(true);
      await Voice.start('tr-TR');
    } catch (error) {
      console.error('Voice recognition error:', error);
    }
  };

  // Handle center onPress
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

  // Set searchText onPress
  const handleSubmit = () => {
    Keyboard.dismiss();
    setSearchText(text)
    console.log("handleSubmit: ", text)
  };

  // Set start route onPress
  const startRoute = () => {
    console.log("startRoute: ", userLocation)
    setStartPoint(userLocation)
  }

  const animatedSearchbarStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(animatedPosition.value < 500 ? -100 : 0, {
            duration: 275, // Adjust the duration as needed
          }),
        },
      ],
      opacity: withTiming(animatedPosition.value < 130 ? 0.2 : 1, {
        duration: 275, // Adjust the duration as needed
      }),
    };
  });

  const keyboardDidHideCallback = () => {
    localInputRef.current.blur?.();
  }

  useEffect(() => {
    const keyboardDidHideSubscription = Keyboard.addListener('keyboardDidHide', keyboardDidHideCallback);

    return () => {
      keyboardDidHideSubscription?.remove();
    };
  }, []);


  const fetchPlaceId = async (searchQuery) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}`
    );
    const data = await response.json();
    console.log("fetchPlaceId: ", data)
    return data.results[0].place_id;
  };

  const fetchPlaceDetails = async (placeId) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}`
    );
    const data = await response.json();
    console.log("fetchPlaceDetails: ", data)
    return data.result.photos;
  };

  const fetchPlacePhotoUrl = (photoReference, maxWidth = 800) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
  };

  useState(() => {
    fetchLocationDetails()
  }, [])

  const handleSheetChanges = useCallback((index) => {
    console.log("Current snap point index:", index);
    if (index === 2) {
      fetchLocationDetails()
    }
  }, []);



  return (
    <View style={{ flex: 1 }}>
      {/* StatusBar transparent */}
      <StatusBar translucent backgroundColor="transparent" />

      {/* BottomSheet */}
      <BottomSheet
        onChange={handleSheetChanges}
        style={{ zIndex: 100 }}
        animatedPosition={animatedPosition}
        handleIndicatorStyle={{ backgroundColor: "#CBC4CC" }}
        backgroundStyle={[theme === "dark" ? { backgroundColor: "#202125" } : { backgroundColor: "#FEF7FF" }]}
        snapPoints={[20, 75, '30%', '95%']}>


        {searchText ?
          <Text>
            {searchText}
          </Text>
          :
          <BottomSheetFlatList
            ItemSeparatorComponent={() => <Divider bold={true} />}
            ListHeaderComponent={() =>
              <View style={{ width: windowWidth }}>
                <Text style={[theme === "dark" ? { backgroundColor: "#202125", color: "white" } : { backgroundColor: "#FEF7FF", color: "black" }, { fontSize: 28, paddingBottom: 20, paddingHorizontal: 20, marginTop: -1 }]}>
                  {locationInfo && locationInfo.il} hakkındaki en son bilgiler
                </Text>
                <Divider bold={true} />
              </View>
            }
            stickyHeaderIndices={[0]}
            data={placePhotos}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ marginTop: 24, gap: 14, marginBottom: 18, width: windowWidth, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: windowWidth, paddingHorizontal: 20 }}>
                  <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Avatar.Text size={38} label="A" style={{ backgroundColor: "#7F6550" }} />
                    <View style={{ gap: 4 }}>
                      <Text style={[theme === "dark" ? { color: "white" } : { color: "black" }, { fontSize: 18, fontWeight: 700 }]}>Ayşe Güneş</Text>
                      <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <Text>Yerel Rehber</Text>
                        <Entypo name="dot-single" />
                        <Text>22 fotoğraf</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={[theme === "dark" ? { color: "#869dc3" } : { color: "black" }, { fontSize: 18, fontWeight: 700 }]}>Takip Et</Text>
                </View>
                <Image source={{ uri: item }} style={{ width: windowWidth / 1.1, height: 270, borderRadius: 14 }} />
                <View style={{ display: "flex", flexDirection: "row", gap: 12, alignItems: "center", justifyContent: "space-between", width: windowWidth, paddingHorizontal: 20 }}>
                  <Text style={{ fontSize: 17 }}>4 gün önce</Text>
                  <View style={{ display: "flex", flexDirection: "row", gap: 38, alignItems: "center" }}>
                    <AntDesign name="like2" size={24} color={theme === "dark" ? "white" : "black"} />
                    <Entypo name="dots-three-vertical" size={18} color={theme === "dark" ? "white" : "black"} />
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={[theme === "dark" ? { backgroundColor: "#202125" } : { backgroundColor: "#FEF7FF" }, { alignItems: "center" }]}
            ListEmptyComponent={<Text>Loading photos...</Text>}
          />}


      </BottomSheet>


      {/* Searchbar */}
      <Animated.View style={[animatedSearchbarStyle]}>
        <Searchbar
          ref={(ref) => {
            localInputRef && (localInputRef.current = ref);
          }}
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
      </Animated.View>
      <Animated.View style={[windowHeight > 850 ? { bottom: windowHeight / 85 } : { bottom: windowHeight / 1000 }, { position: 'absolute', width: '100%', alignItems: 'center', zIndex: -1 }, animatedFabStyle]}>
        {/* Floading Action Buttons handleCenter */}
        <FAB
          variant="surface"
          icon={({ size, color }) => <FontAwesome6 name="location-crosshairs" size={size} color={color} />}
          style={[theme === "dark" ? { borderColor: "#202124" } : { borderColor: "gray" }, {
            borderWidth: 1,
            elevation: 3,
            position: 'absolute',
            bottom: 20,
            right: 15,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
          }]}
          onPress={handleCenter}
        />
        {/* Floading Action Button startRoute */}
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
      </Animated.View>
      {/* MapComponent */}
      <MapComponent mapRef={mapRef} />
    </View>
  );
};

export default NavigationScreen