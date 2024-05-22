import React from 'react';
import {View} from 'react-native';
import Routes from './navigations/Routes';

const App = (): React.JSX.Element => {
  return (
    <View style={{flex: 1}}>
      <Routes />
    </View>
  );
};

export default App;
