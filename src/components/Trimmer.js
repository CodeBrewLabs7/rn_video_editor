import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';

const TrimmerMarker = ({initialPosition, onDrag, totalWidth}) => {
  const translateX = useSharedValue(initialPosition);

  const panGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = Math.min(
        Math.max(ctx.startX + event.translationX, 0),
        totalWidth,
      );
    },
    onEnd: () => {
      runOnJS(onDrag)(translateX.value); // Correctly using runOnJS to call JS function from UI thread
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={panGestureEvent}>
      <Animated.View style={[styles.marker, animatedStyle]} />
    </PanGestureHandler>
  );
};

const VideoTrimmer = ({
  getStartTime = () => {},
  getEndTime = () => {},
}
) => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(300);
  const totalWidth = 300; // This should be the total width of the timeline

  const handleStartDrag = position => {
    setStartTime(position);
    getStartTime(position)
  };

  const handleEndDrag = position => {
    setEndTime(position);
    getEndTime(position)
  };

  console.log('YES++');
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ScrollView bounces={false} horizontal style={styles.container}>
        <View style={[styles.timeline, {width: totalWidth}]}>
          <TrimmerMarker
            initialPosition={startTime}
            onDrag={handleStartDrag}
            totalWidth={totalWidth}
          />
          <TrimmerMarker
            initialPosition={endTime}
            onDrag={handleEndDrag}
            totalWidth={totalWidth}
          />
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  timeline: {
    height: 50,
    backgroundColor: '#ccc',
    position: 'relative',
  },
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: 'yellow',
    borderRadius: 5,
  },
});

export default VideoTrimmer;
