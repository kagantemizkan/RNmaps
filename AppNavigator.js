import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
// Screen Imports
import SettingsScreen from './screens/SettingsScreen';
import NavigationScreen from './screens/NavigationScreen';
import AboutApp from './screens/AboutApp';
// Icons
import Ionicons from 'react-native-vector-icons/Ionicons';
// i18n
import { useTranslation } from 'react-i18next';
// JOTAI
import { useAtom } from 'jotai';
import { themeAtom, searchTextAtom } from './atoms';

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

const SettingsStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} >
            <Stack.Screen name="Home" component={SettingsScreen} />
            <Stack.Screen name="AboutApp" component={AboutApp} />
        </Stack.Navigator>
    );
}


const AppNavigator = () => {
    const [theme, setTheme] = useAtom(themeAtom);
    const [searchText, setSearchText] = useAtom(searchTextAtom);

    const { t } = useTranslation();

    useEffect(() => {
        console.log(theme)
    }, [])

    const CustomDarkTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            background: "#202125"
        }
    }

    const CustomDefaultTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: "rgb(254,247,255)"
        }
    }
    


    return (
        <NavigationContainer theme={theme === "dark" ? CustomDarkTheme : CustomDefaultTheme} >
            <Tab.Navigator
                barStyle={{ height: 67, backgroundColor: theme === "dark" ? "#1E1F21" : "#F3EDF7" }}
                theme={theme === 'dark' ? { colors: { secondaryContainer: '#41526c' } } : { colors: { secondaryContainer: '#BEC1C4' } }}
                activeColor={theme === "dark" ? "#A7C7FB" : "#444746"}
                inactiveColor={theme === "dark" ? '#C4C7C5' : "#444746"}
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => {
                        let iconName;
                        if (route.name === 'Maps') {
                            iconName = focused ? 'location' : 'location-outline';
                        } else if (route.name === 'Settings') {
                            iconName = focused ? 'settings' : 'settings-outline';
                        }
                        return <View style={{ bottom: 2 }}><Ionicons name={iconName} color={color} size={26} /></View>
                    },
                })}>
                <Tab.Screen
                    name="Maps"
                    component={NavigationScreen}
                    options={{
                        tabBarAccessibilityLabel: t("tabBarMap"),
                        tabBarLabel: t("map"),
                    }}
                />
                <Tab.Screen
                    name="Settings"
                    component={SettingsStack}
                    options={{
                        tabBarAccessibilityLabel: t("tabBarSettings"),
                        tabBarLabel: t("settings"),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
