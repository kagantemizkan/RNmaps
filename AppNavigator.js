import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import HomeScreen from './screens/HomeScreen';
import NavigationScreen from './screens/NavigationScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createMaterialBottomTabNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => { // focused durumu kontrol edilecek
                        let iconName;

                        if (route.name === 'Maps') {
                            iconName = focused ? 'location' : 'location-outline'; // Farklı ikonlar için duruma göre ayarlayın
                        } else if (route.name === 'Home') {
                            iconName = focused ? 'settings' : 'settings-outline'; // Farklı ikonlar için duruma göre ayarlayın
                        }

                        return <Ionicons name={iconName} color={color} size={26} />;
                    },
                })}>
                <Tab.Screen
                    name="Maps"
                    component={NavigationScreen}
                    options={{
                        tabBarLabel: 'Home'
                    }}
                />
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        tabBarLabel: 'Home',
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
