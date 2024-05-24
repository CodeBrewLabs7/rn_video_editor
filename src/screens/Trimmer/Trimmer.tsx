import RangeSliderTrimmer from '@components/RangeSliderTrimmer';
import WrapperContainer from '@components/WrapperContainer';
import FFmpegWrapper from '@lib/FFmpeg';
import {FRAME_STATUS, getFileNameFromPath, width} from '@utils/Constants';
import React, {useCallback, useRef, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Video, {OnLoadData, OnProgressData, VideoRef} from 'react-native-video';
import {RangeSliderTrimmerRef, VideoType} from 'src/types';

const SLIDER_WIDTH = width / 1.3;

const styles = StyleSheet.create({
  video: {
    height: '60%',
    width: '70%',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  timeText: {
    fontWeight: 'bold',
  },
  bottomView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    alignSelf: 'center',
  },
  trimmerText: {
    color: 'green',
    fontWeight: 'bold',
    marginHorizontal: 16,
    alignSelf: 'center',
    textAlign: 'center',
    marginBottom: 8,
  },
});

const Trimmer = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoType>();
  const videoPlayerRef = useRef<VideoRef>(null);
  const childRef = useRef<RangeSliderTrimmerRef>();

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [frames, setFrames] = useState<any>([]);
  const [progress, setProgress] = useState(0);
  const [originalPath, setOriginalPath] = useState('');
  const [totalDuration, setTotalDuration] = useState<number>();

  const onValueChange = useCallback((val: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
      setStartTime(val);
      videoPlayerRef.current.seek(val);
    }
  }, []);

  const onValueChange2 = useCallback(
    (val: number) => {
      if (videoPlayerRef.current) {
        videoPlayerRef?.current?.seek(startTime);
        setEndTime(val);
      }
    },
    [startTime],
  );

  const handlePressSelectVideoButton = () => {
    ImagePicker.openPicker({
      mediaType: 'video',
      compressVideoPreset: 'Passthrough',
    }).then(videoAsset => {
      setOriginalPath('');
      setSelectedVideo({
        uri: videoAsset.sourceURL || videoAsset.path,
        localFileName: getFileNameFromPath(videoAsset.path),
        creationDate: videoAsset?.creationDate || null,
        duration: videoAsset?.duration || 0,
      });
    });
  };

  const [currentTimeRef, setCurrentTimeRef] = useState(0);

  const handleOnProgress = ({currentTime}: OnProgressData) => {
    setCurrentTimeRef(Number(currentTime.toFixed(0)));
    if (childRef.current) {
      childRef.current.onRun({currentTime, startTime, endTime});
    }
    if (currentTime >= endTime) {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.pause();
      }
    }
  };

  const onPlay = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.resume();
    }
  };

  const onPause = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
    }
  };

  const handleVideoLoad = (videoAssetLoaded: OnLoadData) => {
    const numberOfFrames = Math.ceil(videoAssetLoaded.duration);
    setEndTime(Number(videoAssetLoaded.duration.toFixed(0)));
    setTotalDuration(Number(videoAssetLoaded.duration.toFixed(0)));
    let tempFrames = Array(numberOfFrames).fill({
      status: FRAME_STATUS.LOADING.name.description,
    });

    setFrames(tempFrames);

    if (selectedVideo) {
      FFmpegWrapper.getFrames(
        selectedVideo.localFileName,
        selectedVideo.uri,
        numberOfFrames,
        (filePath: string) => {
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
          setFrames(_frames);
        },
        () => {},
        () => {},
      );
    }
  };

  const cutVideoSegment = () => {
    if (selectedVideo) {
      FFmpegWrapper.cutSegment(
        selectedVideo.localFileName,
        selectedVideo.uri,
        startTime.toFixed(2),
        endTime.toFixed(2),
        (filePath: string) => {
          setOriginalPath(`file://${filePath}`);
          console.log('original path++++', `file://${filePath}`);
        },
        (error: unknown) => {
          console.error('Failed to cut segment:', error);
        },
        (time: number) => {
          const progressPercentage = Math.min(
            (time / (selectedVideo.duration * 1000)) * 100,
            100,
          );
          setProgress(progressPercentage);
        },
      );
    }
  };

  console.log('trimmer progress', progress);

  return (
    <WrapperContainer>
      <>
        <Button title="Select a video" onPress={handlePressSelectVideoButton} />

        {originalPath && <Text style={styles.trimmerText}>{originalPath}</Text>}

        {selectedVideo ? (
          <>
            <Video
              ref={videoPlayerRef}
              style={styles.video}
              source={{uri: selectedVideo.uri}}
              onLoad={handleVideoLoad}
              onProgress={handleOnProgress}
            />
            <View style={styles.bottomView}>
              <Text style={styles.timeText}>
                {currentTimeRef}/{endTime}
              </Text>
              <Button title="Play" onPress={onPlay} />
              <Button title="Pause" onPress={onPause} />
              <Button title="Trim Video" onPress={cutVideoSegment} />
              <View />
            </View>
          </>
        ) : null}
        <View>
          {frames.length > 0 && selectedVideo && totalDuration ? (
            <RangeSliderTrimmer
              key={frames}
              ref={childRef}
              //@ts-ignore : will fix later
              min={0}
              max={totalDuration}
              step={1}
              onValueChange={onValueChange}
              onValueChange2={onValueChange2}
              frames={frames}
              sliderWidth={SLIDER_WIDTH}
            />
          ) : null}
        </View>
      </>
    </WrapperContainer>
  );
};

export default Trimmer;
