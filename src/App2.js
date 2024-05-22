import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import ImagePicker from 'react-native-image-crop-picker';
import Video from 'react-native-video';
import RangeSlider from './components/RangeSlider';
import FFmpegWrapper from './lib/FFmpeg';
import {FRAME_STATUS} from './utils/Constants';

const getFileNameFromPath = path => {
  const fragments = path.split('/');
  let fileName = fragments[fragments.length - 1];
  fileName = fileName.split('.')[0];
  return fileName;
};

const MIN_DEFAULT = 0;

const App = () => {
  const [selectedVideo, setSelectedVideo] = useState();

  const videoPlayerRef = useRef();
  const childRef = useRef();

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(40);
  const [frames, setFrames] = useState([]);
  const [maxDefault, setMaxDefault] = useState(0);
  const [progress, setProgress] = useState(0);
  const [originalPath, setOriginalPath] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playingTime, setPlayingTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [allVideos, setAllVideos] = useState([
    // {
    //   min: 0,
    //   max: 5000,
    //   uri: 'file:///Users/gulsherkhan/Library/Developer/CoreSimulator/Devices/660CDAA1-63E9-41F2-B231-605089E27816/data/Media/DCIM/100APPLE/IMG_0009.MOV',
    //   selectedMin: 0,
    //   selectedMax: 10000,
    // },
    // {
    //   min: 0,
    //   max: 5000,
    //   uri: 'file:///Users/gulsherkhan/Library/Developer/CoreSimulator/Devices/660CDAA1-63E9-41F2-B231-605089E27816/data/Media/DCIM/100APPLE/IMG_0008.MOV',
    //   selectedMin: 0,
    //   selectedMax: 7000,
    // },
    // {
    //   min: 0,
    //   max: 5000,
    //   uri: 'file:///Users/gulsherkhan/Library/Developer/CoreSimulator/Devices/660CDAA1-63E9-41F2-B231-605089E27816/data/Media/DCIM/100APPLE/IMG_0010.MP4',
    //   selectedMax: 12000,
    //   selectedMin: 0,
    // },
  ]);

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
      multiple: true,
    }).then(videoAsset => {
      setOriginalPath(null);
      let modifyArray = videoAsset.map((val, i) => {
        return {
          uri: val.sourceURL || val.path,
          localFileName: getFileNameFromPath(val.path),
          creationDate: val?.creationDate,
          min: 0,
          max: val.duration / 1000,
        };
      });
      setAllVideos(prev => [...prev, ...modifyArray]);
    });
  };

  useEffect(() => {
    let newValue = 0;
    allVideos.forEach((val, i) => {
      newValue = newValue + val.max;
    });
    setTotalDuration(newValue);
  }, [allVideos]);

  // console.log('aal videos', allVideos);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const handleOnProgress = ({currentTime}) => {
    const accumulatedDuration = allVideos
      .slice(0, currentVideoIndex)
      .reduce((acc, video) => acc + video.max, 0);

    const totalCurrentTime = accumulatedDuration + currentTime;
    setCurrentTime(totalCurrentTime);

    console.log('totalCurrentTimetotalCurrentTime', totalCurrentTime);

    childRef.current.onRun({
      currentTime: totalCurrentTime,
      startTime: 0,
      endTime: totalDuration,
    });

    const currentVideoDuration = allVideos[currentVideoIndex].max;

    if (currentTime >= currentVideoDuration) {
      if (currentVideoIndex < allVideos.length - 1) {
        setCurrentVideoIndex(prev => prev + 1);
        // videoPlayerRef.current.seek(0);
      } else {
        setPlaying(false);
      }
    }

    return;

    let videoPlayTime = currentTime;

    if (videoPlayTime >= totalDuration) {
      childRef.current.onRun({
        currentTime: videoPlayTime,
        startTime: 0,
        endTime: totalDuration / 1000,
      });
    } else {
      videoPlayerRef.current.pause();
    }

    return;

    // // const currentVideoDuration = allVideos[currentVideoIndex].duration;
    // setPlayingTime(currentTime)

    // if (currentTime >= totalDuration) {
    //   if (currentVideoIndex < allVideos.length - 1) {
    //     setCurrentVideoIndex((prev) => prev + 1);
    //   } else {
    //     setPlaying(false);
    //   }
    // }

    // return;

    let myTime = currentTime;

    // console.log('currentTimecurrentTimecurrentTimecurrentTime', currentTime);
    // let myTime = currentTime;
    // if (currentIndex !== 0) {
    //   let newTime = allVideos[currentIndex - 1].max / 1000;
    //   myTime = myTime + newTime;
    // }

    // console.log('myTimemyTime', myTime);
    // setPlayingTime(myTime);
    // if (myTime >= allVideos[currentIndex].max / 1000) {
    //   if (allVideos.length > currentIndex + 1) {
    //     setCurrentIndex(currentIndex + 1);
    //     videoPlayerRef.current.seek(0);
    //   }
    // } else {
    //   // console.log('no');
    // }
    // if (childRef.current) {
    //   childRef.current.onRun(myTime, 0, totalDuration / 1000);
    // }
  };

  const onPlay = () => {
    videoPlayerRef.current.resume();
  };

  const onPause = () => {
    videoPlayerRef.current.pause();
  };

  useEffect(() => {
    // handleVideoLoad()
  }, []);

  // console.log('total duration', totalDuration);
  const handleVideoLoad = videoAssetLoaded => {
    const updatedVideos = selectedVideo.map(video => {
      const numberOfFrames = Math.ceil(video.duration); // Assuming the duration is in milliseconds

      const frames = Array(numberOfFrames).fill({
        status: FRAME_STATUS.LOADING.name.description,
      });

      FFmpegWrapper.getFrames(
        video.localFileName,
        video.uri,
        numberOfFrames,
        filePath => {
          const _framesURI = [];
          for (let i = 0; i < numberOfFrames; i++) {
            _framesURI.push(
              `${filePath.replace('%4d', String(i + 1).padStart(4, '0'))}`,
            );
          }
          const _frames = _framesURI.map(_frameURI => ({
            uri: _frameURI,
            status: FRAME_STATUS.READY.name.description,
          }));
          video.frames = _frames;
          setSelectedVideo([...selectedVideo]); // Trigger a state update
        },
        () => {},
        (frameUri, processedFrames, totalFrames) => {
          setSelectedVideo(prevSelectedVideo => {
            const newSelectedVideo = prevSelectedVideo.map(v => {
              if (v.localFileName === video.localFileName) {
                const newFrames = [...v.frames];
                newFrames[processedFrames - 1] = {
                  uri: frameUri,
                  status: FRAME_STATUS.READY.name.description,
                };
                return {
                  ...v,
                  frames: newFrames,
                };
              }
              return v;
            });
            return newSelectedVideo;
          });
        },
      );

      return {
        ...video,
        frames: frames,
      };
    });

    setSelectedVideo(updatedVideos);
  };

  // console.log("selectedVideoselectedVideo",selectedVideo)

  const cutVideoSegment = () => {
    restart();
    // FFmpegWrapper.cutSegment(
    //   selectedVideo.fileName,
    //   selectedVideo.uri,
    //   startTime.toFixed(2),
    //   endTime.toFixed(2),
    //   filePath => {
    //     setOriginalPath(`file://${filePath}`);
    //     console.log('original path++++', `file://${filePath}`);
    //   },
    //   error => {
    //     console.error('Failed to cut segment:', error);
    //   },
    //   time => {
    //     const progressPercentage = Math.min(
    //       (time / (selectedVideo.duration * 1000)) * 100,
    //       100,
    //     );
    //     setProgress(progressPercentage);
    //   },
    // );
  };

  const restart = () => {
    setCurrentVideoIndex(0);
    setCurrentTime(0);
    setPlaying(true);
  };

  const handleEnd = () => {
    alert('end video`');
    // if (currentVideoIndex < allVideos.length - 1) {
    //   setCurrentVideoIndex(prev => prev + 1);
    //   videoPlayerRef.current.seek(0);
    // } else {
    //   setPlaying(false);
    // }
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView>
        <View style={styles.container}>
          <Button
            title="Select Videos"
            onPress={handlePressSelectVideoButton}
          />

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

          {!!allVideos.length > 0 ? (
            <>
              <Video
                // controls
                ref={videoPlayerRef}
                style={styles.video}
                source={{uri: allVideos[currentVideoIndex].uri}}
                // repeat={true}
                // paused={!playing}
                // onLoad={handleVideoLoad}
                paused={true}
                onProgress={handleOnProgress}
                onEnd={handleEnd}
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
                  {currentTime.toFixed(0)}/{totalDuration}
                </Text>

                <Button title="Play" onPress={onPlay} />
                <Button title="Pause" onPress={onPause} />
                <Button title="Trim Video" onPress={cutVideoSegment} />
                <View />
              </View>
            </>
          ) : null}
          <View>
            {allVideos.length > 0 && totalDuration > 0 ? (
              <RangeSlider
                allVideos={allVideos}
                key={allVideos}
                ref={childRef}
                maxDuration={totalDuration}
                videoPlayerRef={videoPlayerRef}
                // onValueChange={onValueChange}
                // onValueChange2={onValueChange2}
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
    height: '55%',
    width: '70%',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
});
