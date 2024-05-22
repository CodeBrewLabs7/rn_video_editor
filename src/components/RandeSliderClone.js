import React from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
const RangeSlider = ({
  sliderWidth,
  min,
  max,
  step,
  onValueChange1,
  onValueChange2,
  frames = [],
}) => {
  const position = useSharedValue(0);
  const position2 = useSharedValue(sliderWidth);
  const opacity = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const zIndex = useSharedValue(0);
  const zIndex2 = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = position.value;
    },
    onActive: (e, ctx) => {
      opacity.value = 1;
      if (ctx.startX + e.translationX < 0) {
        position.value = 0;
      } else if (ctx.startX + e.translationX > position2.value) {
        position.value = position2.value;
        zIndex.value = 1;
        zIndex2.value = 0;
      } else {
        position.value = ctx.startX + e.translationX;
      }
    },
    onEnd: () => {
      opacity.value = 0;
      runOnJS(onValueChange1)({
        min:
          min +
          Math.floor(position.value / (sliderWidth / ((max - min) / step))) *
            step,
        max:
          min +
          Math.floor(position2.value / (sliderWidth / ((max - min) / step))) *
            step,
      });
    },
  });

  const gestureHandler2 = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = position2.value;
    },
    onActive: (e, ctx) => {
      opacity2.value = 1;
      if (ctx.startX + e.translationX > sliderWidth) {
        position2.value = sliderWidth;
      } else if (ctx.startX + e.translationX < position.value) {
        position2.value = position.value;
        zIndex.value = 0;
        zIndex2.value = 1;
      } else {
        position2.value = ctx.startX + e.translationX;
      }
    },
    onEnd: () => {
      opacity2.value = 0;
      runOnJS(onValueChange2)({
        min:
          min +
          Math.floor(position.value / (sliderWidth / ((max - min) / step))) *
            step,
        max:
          min +
          Math.floor(position2.value / (sliderWidth / ((max - min) / step))) *
            step,
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: position.value}],
    zIndex: zIndex.value,
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{translateX: position2.value}],
    zIndex: zIndex2.value,
  }));

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{translateX: position.value}],
    width: position2.value - position.value,
  }));


 
 
  return (
    <View style={[styles.sliderContainer, {width: sliderWidth}]}>
      <View
        style={[
          styles.sliderFront,
          {width: sliderWidth, backgroundColor: '#DFEAFB'},
        ]}>
        <View style={{flexDirection: 'row'}}>
          {frames.map((frame, index) => {
            return !!frame?.uri ? (
              <Image
                key={index}
                style={{
                  opacity: 0.4,
                  height: 60,
                  width: 60,
                }}
                source={{
                  uri:
                    Platform['OS'] == 'android'
                      ? 'file://' + frame.uri
                      : frame.uri,
                }}
              />
            ) : (
              <View
                style={{
                  opacity: 0.4,
                  height: 60,
                  width: 60,
                }}
              />
            );
          })}
        </View>
      </View>

      <Animated.View style={[sliderStyle, styles.sliderFront]}>
        <View style={{flexDirection: 'row', overflow: 'hidden'}}>
          {frames.map((frame, index) => {
            return !!frame?.uri ? (
              <Image
                key={index}
                style={{
                  opacity: 0.4,
                  height: 60,
                  width: 60,
                }}
                source={{
                  uri:
                    Platform['OS'] == 'android'
                      ? 'file://' + frame.uri
                      : frame.uri,
                }}
              />
            ) : (
              <View
                style={{
                  opacity: 0.4,
                  height: 60,
                  width: 60,
                }}
              />
            );
          })}
        </View>
      </Animated.View>

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[animatedStyle, styles.thumb]} />
      </PanGestureHandler>
      <PanGestureHandler onGestureEvent={gestureHandler2}>
        <Animated.View style={[animatedStyle2, styles.thumb]} />
      </PanGestureHandler>
    </View>
  );
};

export default RangeSlider;

const styles = StyleSheet.create({
  sliderContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 45,
    marginTop: 50,
  },
  sliderBack: {
    height: 8,
    backgroundColor: '#DFEAFB',
    borderRadius: 20,
  },
  sliderFront: {
    backgroundColor: '#3F4CF6',
    // borderRadius: 20,
    position: 'absolute',
    height: 60,
  },
  thumb: {

    height: 60,
    width: 20,
    backgroundColor:'yellow',
    position: 'absolute',
    // left: -10,
    // width: 20,
    // height: 20,
    // position: 'absolute',
    // backgroundColor: 'white',
    // borderColor: '#3F4CF6',
    // borderWidth: 5,
    // borderRadius: 10,
  },
  label: {
    position: 'absolute',
    top: -40,
    bottom: 20,
    backgroundColor: 'black',
    borderRadius: 5,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    color: 'white',
    padding: 5,
    fontWeight: 'bold',
    fontSize: 16,
    width: '100%',
  },
});
