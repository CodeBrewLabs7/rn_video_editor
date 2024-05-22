import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View, Button } from 'react-native';
import { PanGestureHandler, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { height, width } = Dimensions.get('screen');

const RangeSlider = ({
  onValueChange1,
  onValueChange2,
  allVideos = [],
  handleOnScroll = () => {}
}) => {
  const baseSliderWidth = width / 1.2;
  const thumbWidth = 10;
  const moreSliders = allVideos
  const centerGap = width / 2; // Gap on left and right sides

  // Determine the maximum duration to scale the widths proportionally
  const maxDuration = Math.max(...moreSliders.map(slider => slider.max));




  const createSliderState = (min, max, sliderWidth) => ({
    position: useSharedValue(0),
    position2: useSharedValue(sliderWidth),
    opacity: useSharedValue(0),
    opacity2: useSharedValue(0),
    zIndex: useSharedValue(0),
    zIndex2: useSharedValue(0),
    min,
    max,
    sliderWidth,
    selectedMin: min,
    selectedMax: max,
  });

  const [sliders, setSliders] = useState(moreSliders.map(slider => {
    const sliderWidth = (slider.max / maxDuration) * baseSliderWidth;
    return createSliderState(slider.min, slider.max, sliderWidth);
  }));



  const onValueChange = useCallback((index, isSecond) => {
    const slider = sliders[index];
    const newMin = slider.min + Math.floor(slider.position.value / (slider.sliderWidth / (slider.max - slider.min)));
    const newMax = slider.min + Math.floor(slider.position2.value / (slider.sliderWidth / (slider.max - slider.min)));
    setSliders(prev => prev.map((s, i) => i === index ? { ...s, selectedMin: newMin, selectedMax: newMax } : s));
    if (isSecond) {
      runOnJS(onValueChange2)({ min: newMin, max: newMax });
    } else {
      runOnJS(onValueChange1)({ min: newMin, max: newMax });
    }
  }, [onValueChange1, onValueChange2, sliders]);

  const createGestureHandler = useCallback((index, isSecond) => useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = isSecond ? sliders[index].position2.value : sliders[index].position.value;
    },
    onActive: (e, ctx) => {
      const slider = sliders[index];
      const minGap = 5 * (slider.sliderWidth / (slider.max - slider.min)) + thumbWidth; // Calculate the minimum gap in pixels including thumb width
      if (isSecond) {
        slider.opacity2.value = 1;
        const newX = ctx.startX + e.translationX;
        if (newX > slider.sliderWidth) {
          slider.position2.value = slider.sliderWidth;
        } else if (newX < slider.position.value + minGap) {
          slider.position2.value = slider.position.value + minGap;
          slider.zIndex.value = 0;
          slider.zIndex2.value = 1;
        } else {
          slider.position2.value = newX;
        }
      } else {
        slider.opacity.value = 1;
        const newX = ctx.startX + e.translationX;
        if (newX < 0) {
          slider.position.value = 0;
        } else if (newX > slider.position2.value - minGap) {
          slider.position.value = slider.position2.value - minGap;
          slider.zIndex.value = 1;
          slider.zIndex2.value = 0;
        } else {
          slider.position.value = newX;
        }
      }
    },
    onEnd: () => {
      runOnJS(onValueChange)(index, isSecond);
      if (isSecond) {
        sliders[index].opacity2.value = 0;
      } else {
        sliders[index].opacity.value = 0;
      }
    },
  }), [sliders, onValueChange]);

  const createAnimatedStyle = useCallback((index, isSecond) => useAnimatedStyle(() => ({
    transform: [{ translateX: isSecond ? sliders[index].position2.value : sliders[index].position.value }],
    zIndex: isSecond ? sliders[index].zIndex2.value : sliders[index].zIndex.value,
  })), [sliders]);

  const createSliderStyle = useCallback((index) => useAnimatedStyle(() => ({
    transform: [{ translateX: sliders[index].position.value }],
    width: sliders[index].position2.value - sliders[index].position.value,
  })), [sliders]);

  const selectedValues = useMemo(() => sliders.map(slider => ({
    min: slider.selectedMin,
    max: slider.selectedMax,
  })), [sliders]);

  const scrollViewRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);

  // // Simulate video playback progress by scrolling the ScrollView
  // useEffect(() => {
  //   if (!isPlaying) return;

  //   const scrollInterval = setInterval(() => {
  //     setCurrentScrollPosition(prev => {
  //       const newScrollPosition = prev + 10; // Adjust the scroll speed as needed
  //       if (scrollViewRef.current) {
  //         scrollViewRef.current.scrollTo({ x: newScrollPosition, animated: true });
  //       }
  //       return newScrollPosition;
  //     });
  //   }, 1000); // Update every second

  //   return () => clearInterval(scrollInterval);
  // }, [isPlaying]);

  // Handle user scroll events
  const handleScrollBeginDrag = () => {
    setIsPlaying(false);
  };

  const handleScrollEndDrag = (event) => {
    setCurrentScrollPosition(event.nativeEvent.contentOffset.x);
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  console.log("sliderssliders",sliders)

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        ref={scrollViewRef}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        contentContainerStyle={{ paddingHorizontal: centerGap }}
        onScroll={handleOnScroll}
        bounces={false}
        scrollEventThrottle={1} // Update scroll events more frequently
        alwaysBounceHorizontal={true}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {sliders.map((slider, index) => {
            const gestureHandler = createGestureHandler(index, false);
            const gestureHandler2 = createGestureHandler(index, true);
            const animatedStyle = createAnimatedStyle(index, false);
            const animatedStyle2 = createAnimatedStyle(index, true);
            const sliderStyle = createSliderStyle(index);
            return (
              <View
                key={String(index)}
                style={[styles.sliderContainer, { width: slider.sliderWidth }]}>
                <View
                  style={[
                    styles.sliderFront,
                    { width: slider.sliderWidth, backgroundColor: '#DFEAFB' },
                  ]}
                />
                <Animated.View style={[sliderStyle, styles.sliderFront]} />
                <PanGestureHandler onGestureEvent={gestureHandler}>
                  <Animated.View style={[animatedStyle, { ...styles.thumb, width: thumbWidth }]} />
                </PanGestureHandler>
                <PanGestureHandler onGestureEvent={gestureHandler2}>
                  <Animated.View style={[animatedStyle2, { ...styles.thumb, width: thumbWidth }]} />
                </PanGestureHandler>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.verticalLine} />
      <Button title={isPlaying ? "Pause" : "Play"} onPress={togglePlayPause} />
    </View>
  );
};

export default React.memo(RangeSlider);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 45,
    marginTop: 50,
    // marginRight: 16,
  },
  sliderBack: {
    height: 8,
    backgroundColor: '#DFEAFB',
    borderRadius: 20,
  },
  sliderFront: {
    backgroundColor: '#3F4CF6',
    position: 'absolute',
    height: 60,
  },
  thumb: {
    height: 60,
    backgroundColor: 'yellow',
    position: 'absolute',
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
  verticalLine: {
    position: 'absolute',
    height: '100%',
    width: 1.5,
    backgroundColor: 'white',
    left: '50%',
  },
});
