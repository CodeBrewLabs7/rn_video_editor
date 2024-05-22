import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Screens from '../screens';

import React from 'react';

export type RouteStackParamList = {
  Home: undefined;
  Trimmer: undefined;
  Editor: undefined;
};
const Stack = createNativeStackNavigator<RouteStackParamList>();

const Routes = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={Screens.Home} />
        <Stack.Screen name="Editor" component={Screens.Editor} />
        <Stack.Screen name="Trimmer" component={Screens.Trimmer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
