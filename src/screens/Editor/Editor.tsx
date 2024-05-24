import RangeSlider from '@components/RangeSlider';
import WrapperContainer from '@components/WrapperContainer';
import {getFileNameFromPath} from '@utils/Constants';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, Button, StyleSheet, Text, View} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Video, {VideoRef} from 'react-native-video';
import {MultipleVideoType, RangeSliderTrimmerRef} from 'src/types';

const Editor = () => {
  const videoPlayerRef = useRef<VideoRef>(null);
  const RangeSliderRef = useRef<RangeSliderTrimmerRef>();
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [playingTime, setPlayingTime] = useState<number>(0);
  const [allVideos, setAllVideos] = useState<MultipleVideoType[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);

  const handlePressSelectVideoButton = useCallback(() => {
    ImagePicker.openPicker({
      mediaType: 'video',
      compressVideoPreset: 'Passthrough',
      multiple: true,
    }).then(videoAsset => {
      let modifyArray = videoAsset.map(val => {
        return {
          uri: val.sourceURL || val.path,
          localFileName: getFileNameFromPath(val.path),
          creationDate: val.creationDate || null,
          duration: val?.duration ? val.duration / 1000 : 0,
          min: 0,
          max: val?.duration ? val.duration / 1000 : 0,
        };
      });
      setAllVideos(prev => [...prev, ...modifyArray]);
    });
  }, []);

  useEffect(() => {
    let newValue = 0;
    allVideos.forEach(val => {
      newValue = newValue + val.max;
    });
    setTotalDuration(newValue);
  }, [allVideos]);

  console.log('sumDurationsumDurationsumDuration', totalDuration);

  const handleOnProgress = (currentTime: number) => {
    const accumulatedDuration = allVideos
      .slice(0, currentVideoIndex)
      .reduce((acc, video) => acc + video.max, 0);

    const totalCurrentTime = accumulatedDuration + currentTime;
    setPlayingTime(totalCurrentTime);

    RangeSliderRef.current?.onRun({
      currentTime: totalCurrentTime,
      startTime: 0,
      endTime: totalDuration,
    });

    const currentVideoDuration = allVideos[currentVideoIndex].max;

    if (currentTime >= currentVideoDuration) {
      if (currentVideoIndex < allVideos.length - 1) {
        setCurrentVideoIndex(prev => prev + 1);
      } else {
        videoPlayerRef.current?.pause();
      }
    }
  };
  const onPlayPause = useCallback((isPlay: boolean) => {
    if (isPlay) {
      videoPlayerRef.current?.pause();
    } else {
      videoPlayerRef.current?.resume();
    }
  }, []);

  const resetVideo = () => {
    setCurrentVideoIndex(0);
    setPlayingTime(0);
  };

  const handleEnd = () => {
    Alert.alert('end video');
  };

  return (
    <WrapperContainer>
      <>
        <Button title="Select Multiple Videos" onPress={handlePressSelectVideoButton} />

        {allVideos.length > 0 ? (
          <>
            <Video
              ref={videoPlayerRef}
              style={styles.video}
              source={{uri: allVideos[currentVideoIndex].uri}}
              paused={false}
              onProgress={({currentTime}) => handleOnProgress(currentTime)}
              onEnd={handleEnd}
            />
            <View style={styles.textStyle}>
              <Text style={styles.timeText}>
                {playingTime.toFixed(0)}/{totalDuration}
              </Text>
              <Button title="Play" onPress={() => onPlayPause(false)} />
              <Button title="Pause" onPress={() => onPlayPause(true)} />
              <Button title="Reset Video" onPress={resetVideo} />
              <View />
            </View>
          </>
        ) : null}
        <View>
          {allVideos.length > 0 && totalDuration > 0 ? (
            <RangeSlider
              allVideos={allVideos}
              //@ts-ignore: will handle later
              key={allVideos}
              ref={RangeSliderRef}
              maxDuration={totalDuration}
              videoPlayerRef={videoPlayerRef}
            />
          ) : null}
        </View>
      </>
    </WrapperContainer>
  );
};

export default Editor;

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
  textStyle: {
    marginLeft: '20%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  timeText: {
    fontWeight: 'bold',
  },
});
