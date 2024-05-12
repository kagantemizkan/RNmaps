import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import HomeScreen from './screens/HomeScreen';
import NavigationScreen from './screens/NavigationScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

const Tab = createMaterialBottomTabNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                barStyle={{ height: 74 }}
                activeColor='#99B1ED'
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => { 
                        let iconName;
                        if (route.name === 'Maps') {
                            iconName = focused ? 'location' : 'location-outline'; 
                        } else if (route.name === 'Home') {
                            iconName = focused ? 'settings' : 'settings-outline'; 
                        }
                        return <View style={{bottom: 2}}><Ionicons name={iconName} color={color} size={26} /></View>
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
                        tabBarLabel: 'Settings'
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
