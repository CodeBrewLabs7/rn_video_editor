import React, {useRef, useState} from 'react';

import {FFmpegKit, FFmpegKitConfig, ReturnCode} from 'ffmpeg-kit-react-native';
import {useEffect} from 'react';
import {
  Button,
  Dimensions,
  NativeEventEmitter,
  NativeModules,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import {launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';
import {isValidVideo} from 'react-native-video-trim';
import {
  SCREEN_HEIGHT,
  FRAME_PER_SEC,
  TILE_WIDTH,
  DURATION_WINDOW_WIDTH,
  POPLINE_POSITION,
  FRAME_STATUS,
} from './utils/Constants';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import RangeSlider from './components/RangeSlider';
import imagePath from './constants/imagePath';

export default function App() {
  const [currentVideo, setCurrentVideo] = useState('');
  const [allVideos, setAllVideos] = useState([]);

  const video = useRef(null);
  const [frames, setFrames] = useState();
  const [clipSelected, setClipSelected] = useState('');

  const [muted, setMuted] = useState(false);

  const [convertedAsset, setConvertedAsset] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const handleOnScroll = (value, type) => {
    if (type == 1) {
      video?.current?.seek(value);
      setStartTime(value);
    } else {
      video?.current?.seek(startTime);
      setEndTime(value);
    }
  };

  const handleOnProgress = ({currentTime}) => {
    if (currentTime >= endTime) {
      // video.current.seek(currentTime);
      video.current.pause()
    }
  };

  const playVideo = () => {
    video.current.seek(startTime);
    video.current.resume();
  };
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        <Video
          ref={video}
          key={clipSelected}
          ignoreSilentSwitch="ignore"
          style={styles.video}
          source={imagePath.video1}
          resizeMode={'contain'}
          repeat={true}
          muted={muted}
          paused={true}
          onProgress={handleOnProgress}
          controls
        />
        <Button title="Play Trimmed Portion" onPress={playVideo} />
        <RangeSlider
          sliderWidth={300}
          min={0}
          max={120}
          step={1}
          onValueChange1={range => {
            handleOnScroll(range.min, 1);
          }}
          onValueChange2={range => {
            handleOnScroll(range.max, 2);
          }}
       
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    height: '60%',
    width: '80%',
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
  },
});
