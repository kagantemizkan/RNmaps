import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import HomeScreen from './screens/SettingsScreen';
import NavigationScreen from './screens/NavigationScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAtom } from 'jotai';
import { themeAtom } from './atoms';
import { useTranslation } from 'react-i18next';

const Tab = createMaterialBottomTabNavigator();

const AppNavigator = () => {
    const [theme, setTheme] = useAtom(themeAtom);
    const { t } = useTranslation();


    return (
        <NavigationContainer>
            <Tab.Navigator
                barStyle={{ height: 70, backgroundColor: theme === "dark" ? "#211F26" : "#F3EDF7" }}
                //activeColor='#C2E7FF'
                //theme={{colors: {secondaryContainer: '#004A77'}}}
                
                activeColor={theme === "dark" ? "#C2E7FF" : "#444746"}
                inactiveColor={theme ==="dark" ? '#C4C7C5' : "#444746"}
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => { 
                        let iconName;
                        if (route.name === 'Maps') {
                            iconName = focused ? 'location' : 'location-outline'; 
                        } else if (route.name === 'Settings') {
                            iconName = focused ? 'settings' : 'settings-outline'; 
                        }
                        return <View style={{bottom: 2}}><Ionicons name={iconName} color={color} size={26} /></View>
                    },
                })}>
                <Tab.Screen
                    name="Maps"
                    component={NavigationScreen}
                    options={{
                        tabBarLabel: t("map"),
                    }}
                    
                />
                <Tab.Screen
                    name="Settings"
                    component={HomeScreen}
                    options={{
                        tabBarLabel: t("settings"),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
