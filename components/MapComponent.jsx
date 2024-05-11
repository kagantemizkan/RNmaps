import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StatusBar, Pressable, Button } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import CompassHeading from 'react-native-compass-heading';
import Geolocation from '@react-native-community/geolocation';
import MapViewDirections from 'react-native-maps-directions';
import darkMap from "../darkMapStyles.json"
import { useAtom } from 'jotai';
import { searchTextAtom, userLocationAtom, startPointAtom } from '../atoms'


const MapComponent = ({ mapRef }) => {

  const [userLocation, setUserLocation] = useAtom(userLocationAtom);
  const [searchText, setSearchText] = useAtom(searchTextAtom);


  const [startPoint, setStartPoint] = useAtom(startPointAtom)



  const [currentStep, setCurrentStep] = useState(0);
  const [angle, setAngle] = useState(0);
  const [steps, setSteps] = useState(0);


  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    console.log("searchText: ", searchText)
    console.log("startPoint: ", startPoint)
  }, [searchText, startPoint])

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
      },
      error => console.log(error.message),
      { enableHighAccuracy: false, timeout: 25000, maximumAge: 3600000 }
    );
  };





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



  const updateAngle = () => {
    const degree_update_rate = 3;
    CompassHeading.start(degree_update_rate, ({ heading }) => {
      const angle2D = heading;
      setAngle(angle2D);
    });
  };

  useEffect(() => {
    const checkProximity = () => {
      if (Array.isArray(steps) && steps.length > 0) {
        steps.forEach((step, index) => {
          const { latitude, longitude } = userLocation;
          const { end_location } = step;
          const distance = calculateDistance(latitude, longitude, end_location.lat, end_location.lng);
          const proximityThreshold = 20; // Adjust as needed
          if (distance <= proximityThreshold) {
            console.log(`Approaching Step ${index + 1}: ${removeHtmlTags(step.html_instructions)}`);
            // Optionally, you can do something when approaching a step, like updating the current step state
            setCurrentStep(index + 1);
          }
        });
      }
    };

    const proximityCheckInterval = setInterval(() => {
      checkProximity();
    }, 2000); // Check every 5 seconds, adjust as needed

    return () => clearInterval(proximityCheckInterval);
  }, [steps, userLocation]);


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

  function removeHtmlTags(htmlString) {
    return htmlString.replace(/<[^>]*>/g, '');
  }
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
        customMapStyle={darkMap}
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
          origin={startPoint}
          destination={searchText}
          apikey={"AIzaSyCOwMmlEf95NH9VCJj7Ksb-4RIJZFruBu4"}
          strokeWidth={3}
          mode={"WALKING"}
          strokeColor="hotpink"
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
