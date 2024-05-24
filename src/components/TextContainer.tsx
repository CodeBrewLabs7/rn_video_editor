import React from 'react';
import {StyleSheet, Text, TextProps, useColorScheme} from 'react-native';

const stylesFun = (isDarkMode: boolean) => {
  const styles = StyleSheet.create({
    sectionTitle: {
      fontSize: 14,
      color: isDarkMode ? 'white' : 'black',
    },
  });
  return styles;
};

interface TextContainterProps extends TextProps {
  text: string | '';
  style?: object;
  isDynamicText?: boolean;
}

const TextContainer: React.FC<TextContainterProps> = ({
  text,
  style,
  ...rest
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = stylesFun(isDarkMode);

  return (
    <Text style={[styles.sectionTitle, style]} {...rest}>
      {text}
    </Text>
  );
};

export default React.memo(TextContainer);
