import React, {useRef, useState} from 'react';

import {FFmpegKit, FFmpegKitConfig, ReturnCode} from 'ffmpeg-kit-react-native';
import {useEffect} from 'react';
import {
  Button,
  Dimensions,
  NativeEventEmitter,
  NativeModules,
  SafeAreaView,
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
import FFmpegWrapper from './lib/FFmpeg';
import { deleteFile } from './utils';

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

  const [videoDuration, setVideoDuration] = useState(0)



  const handleOnScroll = (value, type) => {
    video?.current?.pause();
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
      video.current.pause();
    }
  };

  const playVideo = () => {
    video.current.seek(startTime);
    video.current.resume();
  };

  const openPicker = async () => {
    setConvertedAsset(null);

    const result = await launchImageLibrary({
      mediaType: 'video',
      videoQuality: 'medium',
      includeExtra: true,
      assetRepresentationMode: 'current',
    });

    if (result?.assets !== undefined) {
      const {assets} = result;
      deleteFrames();
      setCurrentVideo(assets[0]);
      setClipSelected(assets[0].uri);
    }
  };

  console.log("currentVideocurrentViddeo",currentVideo)

  const getFrames = (videoAssetLoaded) => {





    const numberOfFrames = Math.ceil(videoAssetLoaded.duration);
    setVideoDuration(120)
    const dummyArray = Array(numberOfFrames).fill({
      status: FRAME_STATUS.LOADING.name.description,
      uri: '',
    });
    setFrames(dummyArray);


    FFmpegWrapper.getFrames(
      currentVideo.fileName,
      currentVideo.uri,
      numberOfFrames,
      (filePath) => {
        const _framesURI = [];
        for (let i = 0; i < numberOfFrames; i++) {
          _framesURI.push(
            `${filePath.replace('%4d', String(i + 1).padStart(4, 0))}`
          );
        }
        const _frames = _framesURI.map((_frameURI) => ({
          uri: _frameURI,
          status: FRAME_STATUS.READY.name.description,
        }));
        setFrames(_frames);
      },
      () => {},
      (frameUri, processedFrames, totalFrames) => {
        setFrames((prevFrames) => {
          const newFrames = [...prevFrames];
          newFrames[processedFrames - 1] = {
            uri: frameUri,
            status: FRAME_STATUS.READY.name.description,
          };
          return newFrames;
        });
      }
    );
  };

  const deleteFrames = () => {
    if (frames !== undefined) {
      frames.forEach((frame) => {
        if (frame.uri) {
          deleteFile('file://' + frame.uri);
        }
      });
      setFrames([]);
    }
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={{flex:1}}>
      <View style={styles.container}>
        {!!currentVideo ?
          <Video
            ref={video}
            key={clipSelected}
            ignoreSilentSwitch="ignore"
            style={styles.video}
            source={{uri: currentVideo.uri}}
            resizeMode={'contain'}
            repeat={true}
            muted={muted}
            paused={true}
            onProgress={handleOnProgress}
            controls
            onLoad={getFrames}
          /> :<View />
        }
        <View>
        <Button title="Play Video" onPress={playVideo} />
        <View  style={{marginVertical: 16}}/>
        <Button title="Open Picker" onPress={openPicker} />

        <RangeSlider 
        sliderWidth={Dimensions.get('screen').width/1.2}
        // frames={{}}
        min={0}
        max={videoDuration}
        step={1}
        onValueChange1={range => {
          handleOnScroll(range.min, 1);
        }}
        onValueChange2={range => {
          handleOnScroll(range.max, 2);
        }}
        />

{/* 
        {frames && frames.length > 0 ? 
    
        <RangeSlider
          sliderWidth={Dimensions.get('screen').width/1.2}
          frames={frames}
          min={0}
          max={videoDuration}
          step={1}
          onValueChange1={range => {
            handleOnScroll(range.min, 1);
          }}
          onValueChange2={range => {
            handleOnScroll(range.max, 2);
          }}
        />

        : null} */}
        </View>
      </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:'space-between'

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
