import React, {forwardRef, useImperativeHandle} from 'react';
import {Image, Platform, StyleSheet, View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const RangeSlider = forwardRef((props, ref) => {
  const {
    sliderWidth,
    min,
    max,
    step,
    onValueChange,
    onValueChange2,
    frames = [],
  } = props;
  const position = useSharedValue(0);
  const position2 = useSharedValue(sliderWidth);

  const sliderPinPosition = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = position.value;
    },
    onActive: (e, ctx) => {
      const newValue = ctx.startX + e.translationX;
      if (newValue < 0) {
        position.value = 0;
      } else if (newValue > position2.value - 25) {
        // Adjusted boundary condition
        position.value = position2.value - 25;
      } else {
        position.value = newValue;
      }

      runOnJS(onValueChange)(
        min +
          Math.floor(position.value / (sliderWidth / ((max - min) / step))) *
            step,
      );
      sliderPinPosition.value = position.value;
    },
    onEnd: () => {},
  });

  const gestureHandler2 = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = position2.value;
    },
    onActive: (e, ctx) => {
      const newValue = ctx.startX + e.translationX;
      if (newValue > sliderWidth) {
        position2.value = sliderWidth;
      } else if (newValue < position.value + 25) {
        // Adjusted boundary condition
        position2.value = position.value + 25;
      } else {
        position2.value = newValue;
      }
      runOnJS(onValueChange2)(
        min +
          Math.floor(position2.value / (sliderWidth / ((max - min) / step))) *
            step,
      );
    },
    onEnd: () => {},
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: position.value}],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{translateX: position2.value}],
  }));

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{translateX: position.value}],
    width: position2.value - position.value,
  }));

  const sliderPin = useAnimatedStyle(() => ({
    transform: [{translateX: sliderPinPosition.value}],
  }));

  const onRun = (currentTime, startTime, endTime) => {
    const rangeDuration = endTime - startTime;
    const relativeTime = currentTime - startTime;
    const sliderRange = position2.value - position.value;
    sliderPinPosition.value = withTiming(
      (relativeTime / rangeDuration) * sliderRange + position.value,
      {
        duration: 500,
        easing: Easing.linear,
      },
    );
  };
  useImperativeHandle(ref, () => ({
    onRun,
  }));

  return (
    <>
      <View style={[styles.sliderContainer, {width: sliderWidth}]}>
        <View style={[styles.sliderBack, {width: sliderWidth}]}>
          <View style={{flexDirection: 'row'}}>
            {frames.map((frame, index) => {
              return !!frame?.uri ? (
                <Image
                  key={index}
                  style={{
                    opacity: 0.4,
                    height: 60,
                    width: sliderWidth / frames.length,
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
                  key={index}
                  style={{
                    opacity: 0.4,
                    height: 60,
                    width: sliderWidth / frames.length,
                  }}
                />
              );
            })}
          </View>
        </View>
        <Animated.View style={[sliderStyle, styles.sliderFront]}>
          <View style={{flexDirection: 'row'}}>
            {frames.map((frame, index) => {
              return !!frame?.uri ? (
                <Image
                  key={index}
                  style={{
                    height: 60,
                    width: sliderWidth / frames.length,
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
                  key={index}
                  style={{
                    height: 60,
                    width: sliderWidth / frames.length,
                  }}
                />
              );
            })}
          </View>
        </Animated.View>

        <Animated.View style={[styles.sliderPin, sliderPin]} />

        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[animatedStyle, styles.thumb]} />
        </PanGestureHandler>
        <PanGestureHandler onGestureEvent={gestureHandler2}>
          <Animated.View style={[animatedStyle2, styles.thumb, {left: 0}]} />
        </PanGestureHandler>
      </View>
    </>
  );
});

export default React.memo(RangeSlider);

const styles = StyleSheet.create({
  sliderContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
  },
  sliderBack: {
    height: 60,
    backgroundColor: '#DFEAFB',
    // borderRadius: 20,
  },
  sliderFront: {
    height: 60,
    backgroundColor: '#3F4CF6',
    // borderRadius: 20,
    position: 'absolute',
    overflow:'hidden'
  },
  sliderPin: {
    height: 60,
    backgroundColor: 'red',
    // borderRadius: 20,
    position: 'absolute',
    width: 2,
    overflow:'hidden'
  },
  thumb: {
    left: -10,
    width: 10,
    height: 60,
    position: 'absolute',
    backgroundColor: 'yellow',
    // borderWidth: 5,
    // borderRadius: 10,
  },
});
