import * as React from 'react';
import AppNavigator from './AppNavigator';
import { LogBox } from 'react-native';

const App = () => {
LogBox.ignoreLogs(['new NativeEventEmitter']);
  return  <AppNavigator />
};

export default App;
