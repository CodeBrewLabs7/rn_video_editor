import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const {height, width} = Dimensions.get('screen');

const thumbWidth = 2;
const centerGap = width / 2; // Gap on left and right sides
const baseSliderWidth = width / 1.2;
let totalWidth = 0;

const RangeSlider = forwardRef((props, ref) => {
  const {
    // onValueChange1,
    // onValueChange2,
    allVideos = [],
    maxDuration = 0,
    videoPlayerRef,
  } = props;

  const scrollViewRef = useRef(null);

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

  const sliders = allVideos.map(slider => {
    const sliderWidth = (slider.max / maxDuration) * baseSliderWidth;
    totalWidth = totalWidth + sliderWidth;
    return createSliderState({
      min: slider.min,
      max: slider.max,
      sliderWidth: sliderWidth,
      uri: slider.uri,
    });
  });

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
      }),
    [sliders],
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

  console.log('selectedValues', selectedValues);

  const onRun = ({currentTime, startTime, endTime}) => {
    const relativeTime = currentTime - startTime;
    const scrollPosition = (relativeTime / endTime) * baseSliderWidth;
    console.log('scrollPosition', scrollPosition);
    scrollViewRef.current?.scrollTo({
      x: scrollPosition,
      animated: true,
    });
  };

  useImperativeHandle(ref, () => ({
    onRun,
  }));

  const handleScrollBeginDrag = useCallback(() => {
    videoPlayerRef.current.pause();
  }, [videoPlayerRef]);

  const handleScrollEndDrag = useCallback(
    ({nativeEvent}) => {
      let current = nativeEvent.contentOffset.x;

      const scrollPosition =
        0 + Math.floor(current / (totalWidth / (maxDuration - 0)));

      videoPlayerRef.current.seek(scrollPosition);
    },
    [videoPlayerRef, maxDuration],
  );

  const handleOnScroll = ({}) => {
    // let current = nativeEvent.contentOffset.x;
    // const newMin = 0 + Math.floor(current / (327.5 / (maxDuration - 0)));
    // console.log('newMin', newMin);
    // // videoPlayerRef.current.seek(newMin);
    // // alert(`drag ${current}`);
    // // setCurrentScrollPosition(current);
  };

  const handleOnMomentumScrollEnd = useCallback(({nativeEvent}) => {
    // let current = nativeEvent.contentOffset.x;
    // alert(`end ${current}`);
    // setCurrentScrollPosition(current);
  }, []);

  console.log('sliderssliderssliders', sliders);

  return (
    <>
      <View style={styles.horizontalLine} />
      <Animated.ScrollView
        horizontal
        ref={scrollViewRef}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleOnMomentumScrollEnd}
        onScroll={handleOnScroll}
        contentContainerStyle={{
          paddingHorizontal: centerGap,
          height: height / 3,
          alignItems: 'flex-start',
        }}
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
                {/* background view */}
                <Animated.View
                  style={[
                    {
                      ...styles.sliderFront,
                      backgroundColor: '#DFEAFB',
                      width: slider.sliderWidth,
                    },
                  ]}
                />
                {/* front view */}
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
      </Animated.ScrollView>
      <Animated.View style={[styles.sliderPin, {marginLeft: centerGap}]} />
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
  },
  horizontalLine: {
    height: 1.5,
    backgroundColor: 'grey',
    width: width,
  },
  sliderBack: {
    height: 60,
    backgroundColor: '#DFEAFB',
  },
  sliderFront: {
    height: 60,
    backgroundColor: '#3F4CF6',
    position: 'absolute',
    overflow: 'hidden',
  },
  sliderPin: {
    height: '100%',
    backgroundColor: 'red',
    position: 'absolute',
    width: 2,
    overflow: 'hidden',
  },
  thumb: {
    // left: -10,
    width: 1,
    height: 60,
    position: 'absolute',
    backgroundColor: 'yellow',
  },
});
