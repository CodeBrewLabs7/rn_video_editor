
import React, {useState} from 'react';
import {Button, Text, View} from 'react-native';
import {FFmpegKit, FFmpegKitConfig, ReturnCode} from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';
import {launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';

function getRandomString(length = 10) {
  // Define the characters to use in the random string
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  // Generate a random index and append the character to the result
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

const App = () => {
  const [videoPaths, setVideoPaths] = useState([]);

  const [playingVideo, setPlayingVideo] = useState('');

  const handleVideoSelect = async () => {
    try {
      const result = await launchImageLibrary({mediaType: 'video'});
      if (result.assets) {
        setVideoPaths(prevPaths => [...prevPaths, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking video:', error);
    }
  };

  const audioUrl =
    'https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.wav';

  const mergeVideos = async () => {
    if (videoPaths.length < 2) {
      alert('Please select at least two videos to merge.');
      return;
    }

    // const fileList = videoPaths.map(path => `file '${path}'`).join('\n');
    // const listPath = `${RNFS.DocumentDirectoryPath}/${getRandomString()}.txt`;
      let inputFiles = '';
      videoPaths.forEach((uri, index) => {
        inputFiles += `-i ${uri} `;
      });

      let outputVideoPath = `${RNFS.CachesDirectoryPath}/${getRandomString()}.txt`;

      var ffmpegCommand = `${inputFiles}-filter_complex "[0:v]`;
      videoPaths.forEach((_, index) => {
        ffmpegCommand += `[${index}:v]`;
      });
      ffmpegCommand += `concat=n=${videoPaths.length}:v=1:a=0[outv]" -map "[outv]" -c:v copy ${outputVideoPath}`;


      console.log("ffmpegCommandffmpegCommand",ffmpegCommand)
      FFmpegKit.executeAsync(
        ffmpegCommand,
        async session => {
          const state = FFmpegKitConfig.sessionStateToString(
            await session.getState(),
          );
          const returnCode = await session.getReturnCode();
          const failStackTrace = await session.getFailStackTrace();
          const duration = await session.getDuration();

          if (ReturnCode.isSuccess(returnCode)) {
            console.log(
              `Merge completed successfully in ${duration} milliseconds ${outputVideoPath}`,
            );
          } else {
            console.log('Merge failed. Please check log for the details.');
            console.log(
              `Merge failed with state ${state} and rc ${returnCode}. \n${failStackTrace}`,
            );
          }
        },
        log => {
          console.log(log.getMessage());
        },
        statistics => {
          const time = statistics.getTime();
        },
      ).then(session =>
        console.log(
          `Async FFmpeg process for merging videos started with sessionId ${session.getSessionId()}.`,
        ),
      );
      // await FFmpegKit.executeAsync(command);

      // console.log('merge video output path', outputPath);
      // setPlayingVideo(outputPath);
      return;
      await addAudioToVideo(outputPath, listPath);
    
  };

  const addAudioToVideo = async (mergedVideoPath: string, listPath: string) => {
    try {
      const outputPath = `${
        RNFS.DocumentDirectoryPath
      }/${getRandomString()}.mp4`;

      const mergeCommand = `-f concat -safe 0 -i ${listPath} -c copy ${outputPath}`;
      await FFmpegKit.execute(mergeCommand);

      console.log('set final video path', outputPath);
      alert('Video and audio merged successfully!');
    } catch (error) {
    } finally {
      // await RNFS.unlink(listPath);
      alert('im run');
    }
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      {!!playingVideo ? (
        <Video
          controls
          source={{uri: playingVideo}}
          style={{
            height: 200,
            width: 200,
          }}
        />
      ) : null}

      <Button title="Select Video" onPress={handleVideoSelect} />
      {videoPaths.length > 0 && (
        <Text>Selected Videos: {videoPaths.length}</Text>
      )}
      <Button title="Merge Videos" onPress={mergeVideos} />
    </View>
  );
};

export default App;
