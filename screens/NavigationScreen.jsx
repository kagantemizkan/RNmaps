import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StatusBar, Pressable, Keyboard, Image, Dimensions, Share } from 'react-native';
import { PanGestureHandler, FlatList, ScrollView } from "react-native-gesture-handler";
import { Searchbar, FAB, Text, Divider, Avatar, Button } from 'react-native-paper';
// Icons
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
// Gorhom Bottom Sheet
import BottomSheet, { BottomSheetScrollView, BottomSheetFlatList } from '@gorhom/bottom-sheet';
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

  const GOOGLE_PLACES_API_KEY = ""
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
  const [searchResults, setSearchResults] = useState([])
  const [placeSlider, setPlaceSlider] = useState(1)
  const [toggleOpeningHours, setToggleOpeningHours] = useState(false)

  const animatedPosition = useSharedValue(0);
  const slideAnimation = useSharedValue(30);

  const animatedFabStyle = useAnimatedStyle(() => {
    const translateY = animatedPosition.value >= 500 ? animatedPosition.value - 800 : -300;
    return {
      transform: [{ translateY }],
    };
  });


  const handleButtonPress = (newPosition) => {
    slideAnimation.value = withTiming(newPosition === 0 ? 30 : newPosition === 1 ? 165 : 292, { duration: 300 });
    setPlaceSlider(newPosition)
  };



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

  const fetchAdditionalPlaceDetails = async (locationInfo, getingPlaceId) => {
    if (!getingPlaceId) {
      const placeId = await fetchPlaceId(`${locationInfo.il} ${locationInfo.ilce} ${locationInfo.mahalle}`);
      const photos = await fetchPlaceDetails(placeId);
      let photoUrls = [];
      if (photos && photos.length > 0) {
        photoUrls = photos.slice(0, 15).map(photo => fetchPlacePhotoUrl(photo.photo_reference));
      }
      return photoUrls;
    } else {
      const data = await fetchPlaceDetails(getingPlaceId);
      let photoUrls = [];
      let placeDetails = {};

      if (data) {
        // Fotoğraf URL'lerini al
        photoUrls = data.photos.slice(0, 15).map(photo => fetchPlacePhotoUrl(photo.photo_reference));
        console.log(" ")
        console.log(" ")
        console.log("photoUrls: ", photoUrls)
        console.log("AAAAA: ", data.website)
        console.log("AAAAA: ", data.url)
        console.log("AAAAA: ", data.current_opening_hours.periods,)
        console.log("AAAAA: ", data.current_opening_hours.weekday_text)
        console.log(" ")
        console.log(" ")
        console.log(" ")
        console.log(" ")


        // Diğer detayları al
        placeDetails = {
          website: data.website,
          url: data.url,
          periods: data.current_opening_hours.periods,
          weekday_text: data.current_opening_hours.weekday_text
        };
      }
      console.log(" ")
      console.log(" ")
      console.log("placeDetails: ", placeDetails)
      console.log(" ")
      console.log(" ")
      return { photoUrls, placeDetails };
    }


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

  /* Set start route onPress (2. FAB)
  const startRoute = () => {
    console.log("startRoute: ", userLocation)
    setStartPoint(userLocation)
  } */

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
    return data.result;
  };

  const fetchPlacePhotoUrl = (photoReference, maxWidth = 2400) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
  };

  useState(() => {
    fetchLocationDetails()
  }, [])

  const handleSheetChanges = useCallback((index) => {
    if (!searchText) {
      console.log("Current snap point index:", index);
      if (index === 2) {
        fetchLocationDetails()
      }
    }
  }, []);

  const fetchPlacesInArea = async (searchQuery, location, radius) => {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${location.latitude},${location.longitude}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("Error fetching places in area:", error);
      return [];
    }
  };


  const handleSubmitttt = async () => {
    Keyboard.dismiss();

    const results = await fetchPlacesInArea(searchText, userLocation, 3000);
    setSearchResults(results);

    console.log("handleSubmittt: ", searchText, results);

    if (results.length === 1) {
      const singleResult = results[0];
      console.log("Single result: ", singleResult);

      if (singleResult.photos && singleResult.photos.length > 0) {

        const { photoUrls, placeDetails } = await fetchAdditionalPlaceDetails(null, singleResult.place_id);

        console.log("Photo URLs FROM handleSubmitttt meme: ", photoUrls);

        // photoUrls alanını ekleyerek veriyi güncelle
        setSearchResults(prevResults => prevResults.map(result => ({
          ...result,
          photoUrls: photoUrls,
          placeDetails: placeDetails
        })));
      } else {
        console.log("No photos available for this place.");
      }
    } else {
      console.log("Multiple results received.");
    }
  };

  useEffect(() => {
    console.log("BIKTIM: ", searchResults)
  }, [searchResults])

  const onShare = async (url) => {
    try {
      const result = await Share.share({
        url: url
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  function formatTime(time) {
    const timeString = time.toString();
    const hours = timeString.slice(0, 2);
    const minutes = timeString.slice(2);
    return `${hours}:${minutes}`;
  }


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


        {searchText ? (
          searchResults.length === 1 ? (
            <BottomSheetFlatList
              data={searchResults}
              keyExtractor={(index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={{ display: "flex", flexDirection: "column", gap: 12 }} key={index}>
                  <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20 }}>
                    <View style={{ gap: 4 }}>
                      <Text style={[theme === "dark" ? { color: "white" } : { color: "black" }, { fontSize: 28, marginBottom: 4, maxWidth: windowWidth / 1.7 }]} >{item.name}</Text>

                      <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2.5 }}>
                          <Text style={{ fontSize: 16, marginRight: 3 }} >{item.rating}</Text>
                          {[...Array(5)].map((_, index) => (
                            <FontAwesome
                              size={16}
                              key={index}
                              name="star"
                              style={{ color: index < Math.round(item.rating) ? "#f9bc02" : "gray" }}
                            />
                          ))}
                        </View>
                        <Text style={{ fontSize: 16 }}>({item.user_ratings_total})</Text>
                      </View>

                      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                        <Text style={{ color: item.opening_hours.open_now ? "#84c896" : "#E0574D", fontSize: 15 }} >{item.opening_hours.open_now ? "Açık" : "Kapalı"}</Text>
                        <Text style={{ fontSize: 15 }}>Açılış saati: ÖÖ 10:00</Text>
                      </View>

                      <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 3 }}>
                        <Text style={{ fontSize: 16 }}>{t(item.types[0])}</Text>
                        <Entypo name="dot-single" />
                        <FontAwesome6 size={16} name="wheelchair-move" />
                        <Entypo name="dot-single" />
                        <FontAwesome6 size={16} name="car" />
                        <Text style={{ marginLeft: 4 }}>11 dk.</Text>
                      </View>

                      {/*<Text>{item.formatted_address}</Text>*/}
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 18 }}>

                      {item.placeDetails && <Pressable onPress={() => onShare(item.placeDetails.url)} style={{ backgroundColor: "#303030", padding: 6, borderRadius: 30 }} >
                        <Entypo color={theme === "dark" ? "white" : "black"} size={24} name="share" />
                      </Pressable>}
                      <Pressable style={{ backgroundColor: "#303030", padding: 6, borderRadius: 30 }} >
                        <AntDesign color={theme === "dark" ? "white" : "black"} size={24} name="close" />
                      </Pressable>
                    </View>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Button
                      labelStyle={{ fontSize: 16 }}
                      buttonColor='#89b4f8'
                      textColor='#202125'
                      icon={() => <MaterialIcons name="directions" color="#202125" size={22} />}
                      mode="contained"
                      onPress={() => console.log('Pressed')}
                      style={{ marginLeft: 20 }} // Sağa boşluk ver
                    >
                      Yol tarifi
                    </Button>
                    <Button
                      labelStyle={{ fontSize: 16 }}
                      textColor='#88abe3'
                      icon={() => <FontAwesome6 color="#88abe3" size={18} name="location-arrow" />}
                      mode="outlined"
                      onPress={() => console.log('Pressed')}
                      style={{ marginLeft: 10, borderColor: "gray" }} // Sağa boşluk ver
                    >
                      Başla
                    </Button>
                    <Button
                      labelStyle={{ fontSize: 16 }}
                      textColor='#88abe3'
                      icon={() => <FontAwesome6 color="#88abe3" size={18} name="phone" />}
                      mode="outlined"
                      onPress={() => console.log('Pressed')}
                      style={{ marginLeft: 10, borderColor: "gray" }} // Sağa boşluk ver
                    >
                      Ara
                    </Button>
                    <Button
                      labelStyle={{ fontSize: 16 }}
                      textColor='#88abe3'
                      icon={() => <FontAwesome6 color="#88abe3" size={18} name="bookmark" />}
                      mode="outlined"
                      onPress={() => console.log('Pressed')}
                      style={{ marginLeft: 10, borderColor: "gray" }}
                    >
                      Kaydet
                    </Button>
                    <Button
                      labelStyle={{ fontSize: 16 }}
                      textColor='#88abe3'
                      icon={() => <Entypo name="dots-three-horizontal" color="#88abe3" size={18} />}
                      mode="outlined"
                      onPress={() => console.log('Pressed')}
                      style={{ marginLeft: 10, marginRight: 20, borderColor: "gray" }}
                    >
                      Diğer
                    </Button>
                  </ScrollView>
                  <ScrollView style={{ marginTop: 10 }} horizontal showsHorizontalScrollIndicator={false}>
                    {item.photoUrls && item.photoUrls.length > 0 ? (
                      item.photoUrls.map((url, urlIndex) => {
                        if ([0, 3, 6, 9, 12, 15, 18, 20].includes(urlIndex)) {
                          return (
                            <Image
                              key={urlIndex}
                              source={{ uri: url }}
                              style={{
                                width: windowWidth / 1.6,
                                height: 300,
                                borderRadius: 14,
                                marginRight: 10,
                                marginLeft: urlIndex === 0 && 20
                              }}
                            />)
                        }
                        if ([1, 4, 7, 10, 13, 16, 19, 21].includes(urlIndex)) {
                          return (
                            <View key={urlIndex} style={{ flexDirection: "column", gap: 10 }}>
                              <Image
                                source={{ uri: item.photoUrls[urlIndex] }}
                                style={{
                                  width: windowWidth / 2.8,
                                  height: 145,
                                  borderRadius: 14,
                                  marginRight: 10
                                }}
                              />
                              <Image
                                source={{ uri: item.photoUrls[urlIndex + 1] }}
                                style={{
                                  width: windowWidth / 2.8,
                                  height: 145,
                                  borderRadius: 14,
                                  marginRight: 10
                                }}
                              />
                            </View>)
                        }
                      })
                    ) : (
                      <Text>Yükleniyor...</Text>
                    )}
                  </ScrollView>
                  <View style={{ flexDirection: "column", marginTop: 8 }}>
                    <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between", paddingHorizontal: 20 }}>
                      <View style={{ flexDirection: "column", alignItems: "center" }}>
                        <Button onPress={() => handleButtonPress(0)} style={{ borderRadius: 0 }} mode="text" labelStyle={[placeSlider === 0 ? { color: "#88abe3" } : { color: "#A9A9A9" }, { fontSize: 15, fontWeight: 700 }]}>
                          GENEL BAKIŞ
                        </Button>
                      </View>
                      <View>
                        <Button onPress={() => handleButtonPress(1)} style={{ borderRadius: 0 }} mode="text" labelStyle={[placeSlider === 1 ? { color: "#88abe3" } : { color: "#A9A9A9" }, { fontSize: 15, fontWeight: 700 }]}>
                          YORUMLAR
                        </Button>
                      </View>
                      <View>
                        <Button onPress={() => handleButtonPress(2)} style={{ borderRadius: 0 }} mode="text" labelStyle={[placeSlider === 2 ? { color: "#88abe3" } : { color: "#A9A9A9" }, { fontSize: 15, fontWeight: 700 }]}>
                          HAKKINDA
                        </Button>
                      </View>
                    </View>
                    <Animated.View style={{ transform: [{ translateX: slideAnimation }], height: 3, backgroundColor: "#88abe3", borderTopLeftRadius: 100, borderTopRightRadius: 100, width: 100 }} />
                    <View style={{
                      backgroundColor: '#333333', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3, height: 2,
                    }} />
                  </View>


                  {item.placeDetails ? (
                    <View>

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 24, marginHorizontal: 20, marginBottom: 12, marginTop: 4 }}>
                        <Ionicons color="#88abe3" size={24} name="location-outline" />
                        <Text style={{ fontSize: 17, lineHeight: 26 }}>{item.formatted_address}</Text>
                      </View>

                      <Divider bold={true} />

                      {toggleOpeningHours ?
                        <Pressable onPress={() => setToggleOpeningHours(!toggleOpeningHours)} android_ripple={{ color: 'gray', borderless: false }} style={{ flexDirection: "row", justifyContent: "space-between", gap: 24, paddingHorizontal: 20, paddingVertical: 16 }}>
                          <View style={{ flexDirection: "row", gap: 24 }}>
                            <Feather color="#88abe3" size={24} name="clock" />
                            <View style={{ gap: 18 }}>
                              {item.placeDetails.periods.map((period, index) => (
                                <Text style={{ fontSize: 17 }} key={index}>{t(`day_${period.open.day}`)}</Text>
                              ))}
                            </View>
                            <View style={{ gap: 18 }}>
                              {item.placeDetails.periods.map((period, index) => (
                                <Text style={{ fontSize: 17 }} key={index}>{t("A.M.")} {formatTime(period.open.time)} - {t("P.M.")} {formatTime(period.close.time)}</Text>
                              ))}
                            </View>
                          </View>
                          <FontAwesome6 size={20} name="angle-up" />

                        </Pressable>
                        :
                        <Pressable onPress={() => setToggleOpeningHours(!toggleOpeningHours)} android_ripple={{ color: 'gray', borderless: false }} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 24, paddingHorizontal: 20, paddingVertical: 16 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
                            <Feather color="#88abe3" size={24} name="clock" />
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                              <Text style={{ color: item.opening_hours.open_now ? "#84c896" : "#E0574D", fontSize: 17 }} >{item.opening_hours.open_now ? "Açık" : "Kapalı"}</Text>
                              <Entypo name="dot-single" />
                              <Text style={{ fontSize: 17 }}>Açılış saati: {formatTime(item.placeDetails.periods[0].open.time)}</Text>
                            </View>
                          </View>

                          <FontAwesome6 size={20} name="angle-down" />
                        </Pressable>}


                      <Divider bold={true} />

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 24, paddingHorizontal: 20, paddingVertical: 16 }}>
                        <FontAwesome color="#88abe3" size={24} name="globe" />
                        <Text style={{ fontSize: 17 }}>{item.placeDetails.website}</Text>
                      </View>

                      <Divider bold={true} />

                    </View>
                  ) : (
                    <Text>Bilgiler Yükleniyor...</Text>
                  )}
                </View>
              )}
              contentContainerStyle={[theme === "dark" ? { backgroundColor: "#202125" } : { backgroundColor: "#FEF7FF" }, { alignItems: "center" }]}
            />
          ) : (
            <BottomSheetFlatList
              data={searchResults}
              keyExtractor={(index) => index.toString()}
              renderItem={({ item, index }) => (
                <View key={index} style={{ padding: 20 }}>
                  <Text>{item.name}</Text>
                  <Text>{item.formatted_address}</Text>
                </View>
              )}
              contentContainerStyle={[theme === "dark" ? { backgroundColor: "#202125" } : { backgroundColor: "#FEF7FF" }, { alignItems: "center" }]}
            />
          )
        ) :
          <BottomSheetFlatList
            ItemSeparatorComponent={() => <Divider bold={true} />}
            ListHeaderComponent={() => (
              <View style={{ width: windowWidth }}>
                <Text style={[theme === "dark" ? { backgroundColor: "#202125", color: "white" } : { backgroundColor: "#FEF7FF", color: "black" }, { fontSize: 28, paddingBottom: 20, paddingHorizontal: 20, marginTop: -1 }]}>
                  {locationInfo && locationInfo.il} hakkındaki en son bilgiler
                </Text>
                <Divider bold={true} />
              </View>
            )}
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
            onPress={handleSubmitttt} // Make sure to invoke the onPress function
          />
        }
      </Animated.View>
      {/* MapComponent */}
      <MapComponent mapRef={mapRef} />
    </View>
  );
};

export default NavigationScreen