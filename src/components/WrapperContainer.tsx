import type {PropsWithChildren} from 'react';
import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';

const stylesFun = (isDarkMode: boolean) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : 'white',
    },
  });
  return styles;
};

type SectionProps = PropsWithChildren<{
  style?: object;
  isSafeAreaView?: boolean;
}>;

const WrapperContainer = ({
  children,
  style,
  isSafeAreaView = true,
}: SectionProps): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  const barStyle = isDarkMode ? 'light-content' : 'dark-content';
  const styles = stylesFun(isDarkMode);

  if (isSafeAreaView) {
    return (
      <SafeAreaView style={[styles.container, style]}>
        <StatusBar barStyle={barStyle} />
        {children}
      </SafeAreaView>
    );
  }
  return (
    <View style={[styles.container, style]}>
      <StatusBar barStyle={barStyle} />
      {children}
    </View>
  );
};

export default React.memo(WrapperContainer);
