import React, { useState, useEffect } from 'react';
// Map releated 
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import CompassHeading from 'react-native-compass-heading';
import Geolocation from '@react-native-community/geolocation';
// Dark Map Style Json
import darkMap from "../darkMapStyles.json"
// Text-To-Speech
import Tts from 'react-native-tts';
// i18n
import { useTranslation } from 'react-i18next'
// JOTAI
import { useAtom } from 'jotai';
import { speechRateAtom, speechVolumeAtom, searchTextAtom, userLocationAtom, startPointAtom, themeAtom } from '../atoms'

const MapComponent = ({ mapRef }) => {

  // i18n
  const { t, i18n } = useTranslation()

  // Atom States
  const [systemTheme, setSystemTheme] = useAtom(themeAtom);
  const [userLocation, setUserLocation] = useAtom(userLocationAtom);
  const [searchText, setSearchText] = useAtom(searchTextAtom);
  const [startPoint, setStartPoint] = useAtom(startPointAtom)
  const [speechVolume, setSpeechVolume] = useAtom(speechVolumeAtom);
  const [speechRate, setSpeechRate] = useAtom(speechRateAtom);

  // React  States
  const [currentStep, setCurrentStep] = useState(0);
  const [angle, setAngle] = useState(0);
  const [steps, setSteps] = useState(0);
  const [voiceStep, setVoiceStep] = useState("")

  // useEffects




  // On voiceStep change TTS the routes 
  useEffect(() => {
    Tts.setDefaultLanguage(i18n.language)
    Tts.setDefaultRate(speechRate);
    Tts.speak(voiceStep, {
      androidParams: {
        KEY_PARAM_VOLUME: speechVolume,
      }
    })
  }, [voiceStep])

  // Update the user location
  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        updateAngle(position.coords);
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );
    return () => Geolocation.clearWatch(watchId);
  }, []);


  // TTS, route and steps releated 
  useEffect(() => {
    const checkProximity = () => {
      if (Array.isArray(steps) && steps.length > 0) {
        steps.forEach((step, index) => {
          const { latitude, longitude } = userLocation;
          const { start_location } = step;
          const distance = calculateDistance(latitude, longitude, start_location.lat, start_location.lng);
          const proximityThreshold = 10; // Adjust as needed
          if (distance <= proximityThreshold) {
            setVoiceStep(removeHtmlTags(step.html_instructions))
            console.log(`Approaching Step ${index + 1}: ${removeHtmlTags(step.html_instructions)}`);
            setCurrentStep(index + 1);
              if (index < steps.length - 1) {
              const nextStep = steps[index + 1];
              console.log(`You've completed Step ${index + 1}.`);
            } else {
              console.log("Congratulations! You've completed the journey.");
              clearInterval(proximityCheckInterval);
            }
          }
        });
      }
    };
  
    const proximityCheckInterval = setInterval(() => {
      checkProximity();
    }, 800); 
  
    return () => clearInterval(proximityCheckInterval);
  }, [steps, userLocation]);


  // console.log the steps
  useEffect(() => {
    if (Array.isArray(steps) && steps.length > 0) {
      console.log("first")
      steps.forEach((direction, index) => {
        console.log(`Step ${index + 1}:`);
        // console.log(`Distance: ${direction.distance.text} (${direction.distance.value} meters)`);
        // console.log(`Duration: ${direction.duration.text} (${direction.duration.value} seconds)`);
        console.log(`Instructions: ${removeHtmlTags(direction.html_instructions)}`);
        // console.log(`Polyline Points: ${direction.polyline.points}`);
        console.log(`Start Location: (${direction.start_location.lat}, ${direction.start_location.lng})`);
        console.log(`End Location: (${direction.end_location.lat}, ${direction.end_location.lng})`);
        // console.log(`Travel Mode: ${direction.travel_mode}`);
        console.log("\n");
      });
    }
  }, [steps])

  // FUNCTIONS //



  // Get users heading
  const updateAngle = () => {
    const degree_update_rate = 3;
    CompassHeading.start(degree_update_rate, ({ heading }) => {
      const angle2D = heading;
      setAngle(angle2D);
    });
  };


  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return "Invalid inputs!"; // Handle invalid input values
    }
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    if (a === 1) {
      return 0; // Handle cases where a = 1 to avoid NaN
    }
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Distance in meters
    return distance;
  };

  // Remove html tags from instructions
  function removeHtmlTags(htmlString) {
    return htmlString.replace(/<[^>]*>/g, '');
  }


  if (userLocation) {
    return (
      <MapView  
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1, zIndex: -5 }}
        region={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0043,
          longitudeDelta: 0.0034
        }}
        customMapStyle={systemTheme === "dark" ? darkMap : []}
        ref={mapRef}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0043,
          longitudeDelta: 0.0034
        }}
      >
        {userLocation && typeof angle === 'number' && (
          <Marker
            key={angle}
            coordinate={userLocation}
            title="Ben Buradayım"
            description="Şu anki konumum"
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={angle}
            icon={require('../assets/heading.png')}
          />
        )}
        { searchText && startPoint && 
        <MapViewDirections
          language={i18n.language}
          origin={startPoint}
          destination={searchText}
          apikey={"AIzaSyCOwMmlEf95NH9VCJj7Ksb-4RIJZFruBu4"}
          strokeWidth={6}
          mode={"WALKING"}
          strokeColor="#00affe"
          optimizeWaypoints={true}
          onStart={(params) => {
            console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
          }}
          onReady={result => {
            console.log("userLocation: ", userLocation)
            console.log(`Distance: ${result.distance} km`)
            console.log(`Duration: ${result.duration} min.`)
            setSteps(result.legs[0].steps);
            console.log(result.fare)
            console.log(result.waypointOrder)
          }}
          onError={(errorMessage) => {
            console.log(errorMessage);
          }}
        />}
      </MapView>
    );
  };
}
export default MapComponent
