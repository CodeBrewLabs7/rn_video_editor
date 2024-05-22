import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import TextContainer from '@components/TextContainer';
import WrapperContainer from '@components/WrapperContainer';
import type {RouteStackParamList} from '@navigations/Routes';
import {ScreenTypes} from '@typings/global';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnStyle: {
    marginBottom: 16,
  },
});

const Home = (): React.JSX.Element => {
  const navigation = useNavigation<NavigationProp<RouteStackParamList>>();

  const goToScreen = (type: ScreenTypes) => {
    navigation.navigate(type);
  };

  return (
    <WrapperContainer>
      <View style={styles.container}>
        <Pressable
          onPress={() => goToScreen('Trimmer')}
          style={styles.btnStyle}>
          <TextContainer text="Trim Single Video ✂" />
        </Pressable>
        <Pressable onPress={() => goToScreen('Editor')}>
          <TextContainer text="Video Editor 🎬" />
        </Pressable>
      </View>
    </WrapperContainer>
  );
};

export default Home;
