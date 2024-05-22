import {Button, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import RangeSlider from './components/RangeSlider';
import Video from 'react-native-video';
import ImagePicker from 'react-native-image-crop-picker';
import {FRAME_STATUS} from './utils/Constants';
import FFmpegWrapper from './lib/FFmpeg';

const getFileNameFromPath = path => {
  const fragments = path.split('/');
  let fileName = fragments[fragments.length - 1];
  fileName = fileName.split('.')[0];
  return fileName;
};

const MIN_DEFAULT = 0;
const MAX_DEFAULT = 40;

const App = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const videoPlayerRef = useRef();
  const childRef = useRef();

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(40);
  const [frames, setFrames] = useState([]);
  const [maxDefault, setMaxDefault] = useState(0);
  const [progress, setProgress] = useState(0);
  const [originalPath, setOriginalPath] = useState('');
  const [allVideos, setAllVideos] = useState([]);

  const onValueChange = useCallback(val => {
    videoPlayerRef.current.pause();
    setStartTime(val);
    videoPlayerRef.current.seek(val);
  }, []);

  const onValueChange2 = useCallback(
    val => {
      videoPlayerRef?.current?.seek(startTime);
      setEndTime(val);
    },
    [startTime],
  );

  const handlePressSelectVideoButton = () => {
    ImagePicker.openPicker({
      mediaType: 'video',
      compressVideoPreset: 'Passthrough',
    }).then(videoAsset => {
      setOriginalPath(null);
      setSelectedVideo({
        uri: videoAsset.sourceURL || videoAsset.path,
        localFileName: getFileNameFromPath(videoAsset.path),
        creationDate: videoAsset.creationDate,
        duration: videoAsset.duration,
      });
      setAllVideos(prev => [
        ...prev,
        {
          uri: videoAsset.sourceURL || videoAsset.path,
          localFileName: getFileNameFromPath(videoAsset.path),
          creationDate: videoAsset.creationDate,
          max: videoAsset.duration,
          min: 0,
        },
      ]);
    });
  };

  const [currentTimeRef, setCurrentTimeRef] = useState(0);

  const handleOnProgress = ({currentTime}) => {
    setCurrentTimeRef(currentTime.toFixed(0));
    if (childRef.current) {
      childRef.current.onRun(currentTime, startTime, endTime);
    }
    if (currentTime >= endTime) {
      videoPlayerRef.current.pause();
    }
  };

  const onPlay = () => {
    videoPlayerRef.current.resume();
  };

  const onPause = () => {
    videoPlayerRef.current.pause();
  };

  const handleVideoLoad = videoAssetLoaded => {
    const numberOfFrames = Math.ceil(videoAssetLoaded.duration);
    setEndTime(videoAssetLoaded.duration.toFixed(0));
    setMaxDefault(videoAssetLoaded.duration.toFixed(0));

    setFrames(
      Array(numberOfFrames).fill({
        status: FRAME_STATUS.LOADING.name.description,
      }),
    );

    FFmpegWrapper.getFrames(
      selectedVideo.localFileName,
      selectedVideo.uri,
      numberOfFrames,
      filePath => {
        const _framesURI = [];
        for (let i = 0; i < numberOfFrames; i++) {
          _framesURI.push(
            `${filePath.replace('%4d', String(i + 1).padStart(4, 0))}`,
          );
        }
        const _frames = _framesURI.map(_frameURI => ({
          uri: _frameURI,
          status: FRAME_STATUS.READY.name.description,
        }));
        setFrames(_frames);
      },
    );
  };

  const cutVideoSegment = () => {
    FFmpegWrapper.cutSegment(
      selectedVideo.fileName,
      selectedVideo.uri,
      startTime.toFixed(2),
      endTime.toFixed(2),
      filePath => {
        setOriginalPath(`file://${filePath}`);
        console.log('original path++++', `file://${filePath}`);
      },
      error => {
        console.error('Failed to cut segment:', error);
      },
      time => {
        const progressPercentage = Math.min(
          (time / (selectedVideo.duration * 1000)) * 100,
          100,
        );
        setProgress(progressPercentage);
      },
    );
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView>
        <View style={styles.container}>
          <Button title="Open picker" onPress={handlePressSelectVideoButton} />

          {!!originalPath && (
            <Text
              style={{
                color: 'green',
                fontWeight: 'bold',
                marginHorizontal: 16,
                alignSelf: 'center',
                textAlign: 'center',
                marginBottom: 8,
              }}>
              {originalPath}
            </Text>
          )}

          {!!selectedVideo ? (
            <>
              <Video
                // controls
                ref={videoPlayerRef}
                style={styles.video}
                source={{uri: selectedVideo.uri}}
                repeat={true}
                onLoad={handleVideoLoad}
                onProgress={handleOnProgress}
              />
              <View
                style={{
                  marginLeft: '20%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                  }}>
                  {currentTimeRef}/{endTime}
                </Text>

                <Button title="Play" onPress={onPlay} />
                <Button title="Pause" onPress={onPause} />
                <Button title="Trime Video" onPress={cutVideoSegment} />
                <View />
              </View>
            </>
          ) : null}
          <View>
            {frames.length > 0 ? (
              <RangeSlider
                key={selectedVideo}
                ref={childRef}
                sliderWidth={300}
                min={MIN_DEFAULT}
                max={maxDefault}
                step={1}
                onValueChange={onValueChange}
                onValueChange2={onValueChange2}
                frames={frames}
                allVideos={allVideos}
              />
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default React.memo(App);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  contentContainer: {
    width: '90%',
    height: 300,
    backgroundColor: 'white',
    borderRadius: 25,
  },

  video: {
    height: '60%',
    width: '70%',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
});
