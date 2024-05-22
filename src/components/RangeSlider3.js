import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
  } from 'react';
  import {Dimensions, Image, Platform, StyleSheet, View} from 'react-native';
  import {PanGestureHandler, ScrollView} from 'react-native-gesture-handler';
  import Animated, {
    Easing,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
  } from 'react-native-reanimated';
  
  const {height, width} = Dimensions.get('screen');
  
  const RangeSlider = forwardRef((props, ref) => {
    const {
      onValueChange1,
      onValueChange2,
      frames = [],
      allVideos = [{
        min: 0,
        max: 127000, 
        uri: 'file:///Users/gulsherkhan/Library/Developer/CoreSimulator/Devices/660CDAA1-63E9-41F2-B231-605089E27816/data/Media/DCIM/100APPLE/IMG_0007.MP4',
        selectedMin: 0, 
        selectedMax: 127000
      }],
    } = props;
  
    const baseSliderWidth = width / 1.2;
    const thumbWidth = 10;
    const moreSliders = allVideos;
    const centerGap = width / 2; // Gap on left and right sides
  
    // Determine the maximum duration to scale the widths proportionally
    const maxDuration = Math.max(...moreSliders.map(slider => slider.max));
  
    const scrollViewRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentScrollPosition, setCurrentScrollPosition] = useState(0);
  
    const createSliderState = ({min, max, sliderWidth, uri}) => ({
      position: useSharedValue(0),
      position2: useSharedValue(sliderWidth),
      min,
      max,
      sliderWidth,
      selectedMin: min,
      selectedMax: max,
      uri,
    });
  
    const [sliders, setSliders] = useState(
      moreSliders.map(slider => {
        const sliderWidth = (slider.max / maxDuration) * baseSliderWidth;
        return createSliderState({
          min: slider.min,
          max: slider.max,
          sliderWidth,
          uri: slider.uri,
        });
      }),
    );
    console.log('sliderssliders', sliders);
  
    const onValueChange = useCallback(
      (index, isSecond) => {
        const slider = sliders[index];
        const newMin =
          slider.min +
          Math.floor(
            slider.position.value /
              (slider.sliderWidth / (slider.max - slider.min)),
          );
        const newMax =
          slider.min +
          Math.floor(
            slider.position2.value /
              (slider.sliderWidth / (slider.max - slider.min)),
          );
        setSliders(prev =>
          prev.map((s, i) =>
            i === index ? {...s, selectedMin: newMin, selectedMax: newMax} : s,
          ),
        );
        if (isSecond) {
          runOnJS(onValueChange2)({min: newMin, max: newMax});
        } else {
          runOnJS(onValueChange1)({min: newMin, max: newMax});
        }
      },
      [onValueChange1, onValueChange2, sliders],
    );
  
    const createGestureHandler = useCallback(
      (index, isSecond) =>
        useAnimatedGestureHandler({
          onStart: (_, ctx) => {
            ctx.startX = isSecond
              ? sliders[index].position2.value
              : sliders[index].position.value;
          },
          onActive: (e, ctx) => {
            const slider = sliders[index];
            const minGap =
              5 * (slider.sliderWidth / (slider.max - slider.min)) + thumbWidth; // Calculate the minimum gap in pixels including thumb width
            if (isSecond) {
              const newX = ctx.startX + e.translationX;
              if (newX > slider.sliderWidth) {
                slider.position2.value = slider.sliderWidth;
              } else if (newX < slider.position.value + minGap) {
                slider.position2.value = slider.position.value + minGap;
              } else {
                slider.position2.value = newX;
              }
            } else {
              const newX = ctx.startX + e.translationX;
              if (newX < 0) {
                slider.position.value = 0;
              } else if (newX > slider.position2.value - minGap) {
                slider.position.value = slider.position2.value - minGap;
              } else {
                slider.position.value = newX;
              }
            }
          },
          onEnd: () => {
            runOnJS(onValueChange)(index, isSecond);
            if (isSecond) {
            } else {
            }
          },
        }),
      [sliders, onValueChange],
    );
  
    const createAnimatedStyle = useCallback(
      (index, isSecond) =>
        useAnimatedStyle(() => ({
          transform: [
            {
              translateX: isSecond
                ? sliders[index].position2.value
                : sliders[index].position.value,
            },
          ],
        })),
      [sliders],
    );
  
    const createSliderStyle = useCallback(
      index =>
        useAnimatedStyle(() => ({
          transform: [{translateX: sliders[index].position.value}],
          width: sliders[index].position2.value - sliders[index].position.value,
        })),
      [sliders],
    );
  
    const selectedValues = useMemo(
      () =>
        sliders.map(slider => ({
          min: slider.selectedMin,
          max: slider.selectedMax,
        })),
      [sliders],
    );
  
    const position = useSharedValue(0);
    const position2 = useSharedValue(sliderWidth);
  
    const sliderPinPosition = useSharedValue(0);
  
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
  
    const handleScrollBeginDrag = () => {
      setIsPlaying(false);
    };
  
    const handleScrollEndDrag = event => {
      setCurrentScrollPosition(event.nativeEvent.contentOffset.x);
    };
  
    const togglePlayPause = () => {
      setIsPlaying(prev => !prev);
    };
  
    return (
      <>
        <View style={styles.horizontalLine} />
        <ScrollView
          horizontal
          ref={scrollViewRef}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          contentContainerStyle={{
            paddingHorizontal: centerGap,
            height: height / 3,
            alignItems: 'flex-start',
          }}
          // onScroll={handleOnScroll}
          bounces={false}
          scrollEventThrottle={1} // Update scroll events more frequently
          alwaysBounceHorizontal={true}
          showsHorizontalScrollIndicator={false}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {sliders.map((slider, index) => {
              const gestureHandler = createGestureHandler(index, false);
              const gestureHandler2 = createGestureHandler(index, true);
              const animatedStyle = createAnimatedStyle(index, false);
              const animatedStyle2 = createAnimatedStyle(index, true);
              const sliderStyle = createSliderStyle(index);
              return (
                <View
                  key={String(index)}
                  style={[styles.sliderContainer, {width: slider.sliderWidth}]}>
                  <View
                    style={[
                      styles.sliderFront,
                      {width: slider.sliderWidth, backgroundColor: '#DFEAFB'},
                    ]}
                  />
                  <Animated.View style={[sliderStyle, styles.sliderFront]} />
                  <PanGestureHandler onGestureEvent={gestureHandler}>
                    <Animated.View
                      style={[
                        animatedStyle,
                        {...styles.thumb, width: thumbWidth},
                      ]}
                    />
                  </PanGestureHandler>
                  <PanGestureHandler onGestureEvent={gestureHandler2}>
                    <Animated.View
                      style={[
                        animatedStyle2,
                        {...styles.thumb, width: thumbWidth},
                      ]}
                    />
                  </PanGestureHandler>
                </View>
              );
            })}
          </View>
          {/* <View style={[styles.sliderContainer, {width: sliderWidth}]}>
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
        </View> */}
        </ScrollView>
      </>
    );
  });
  
  export default React.memo(RangeSlider);
  
  const styles = StyleSheet.create({
    container: {},
    sliderContainer: {
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: 45,
      marginTop: 50,
      // marginRight: 16,
    },
    horizontalLine: {
      height: 1.5,
      backgroundColor: 'grey',
      width: width,
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
      overflow: 'hidden',
    },
    sliderPin: {
      height: 60,
      backgroundColor: 'red',
      // borderRadius: 20,
      position: 'absolute',
      width: 2,
      overflow: 'hidden',
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
  