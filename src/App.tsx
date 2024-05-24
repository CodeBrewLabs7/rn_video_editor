import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Routes from './navigations/Routes';

const style = {flex: 1};

const App = (): React.JSX.Element => {
  return (
    <GestureHandlerRootView style={style}>
      <Routes />
    </GestureHandlerRootView>
  );
};

export default App;
