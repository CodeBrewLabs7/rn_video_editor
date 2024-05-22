import {
  FFmpegKit,
  FFmpegKitConfig,
  FFprobeKit,
  ReturnCode,
} from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';
import { FRAME_PER_SEC, FRAME_WIDTH } from '../utils/Constants';

class FFmpegWrapper {
  
  static getFrames(
    fileName,
    videoURI,
    frameNumber,
    successCallback,
    errorCallback,
    onFrameGenerated
  ) {
    let outputImagePath = `${RNFS.CachesDirectoryPath}/${fileName}_%4d.png`;
    const ffmpegCommand = `-ss 0 -i ${videoURI} -vf "fps=${FRAME_PER_SEC}/1:round=up,scale=${FRAME_WIDTH}:-2" -vframes ${frameNumber} ${outputImagePath}`;

    FFmpegKit.executeAsync(
      ffmpegCommand,
      async (session) => {
        const state = FFmpegKitConfig.sessionStateToString(
          await session.getState()
        );
        const returnCode = await session.getReturnCode();
        const failStackTrace = await session.getFailStackTrace();
        const duration = await session.getDuration();

        if (ReturnCode.isSuccess(returnCode)) {
          console.log(
            `Encode completed successfully in ${duration} milliseconds;.`
          );
          successCallback(outputImagePath);
        } else {
          console.log('Encode failed. Please check log for the details.');
          console.log(
            `Encode failed with state ${state} and rc ${returnCode}.${
              (failStackTrace, '\\n')
            }`
          );
          errorCallback();
        }
      },
      (log) => {},
      (statistics) => {
        const processedFrames = statistics.getVideoFrameNumber();
        const frameUri = `${outputImagePath.replace(
          '%4d',
          String(processedFrames).padStart(4, '0')
        )}`;
        onFrameGenerated(frameUri, processedFrames, frameNumber);
      }
    ).then((session) =>
      console.log(
        `Async FFmpeg process started with sessionId ${session.getSessionId()}.`
      )
    );
  }

  static attachAudio(
    fileName,
    videoURI,
    videoDuration,
    audioURI,
    successCallback,
    errorCallback,
    progressCallback
  ) {
    let outputVideoPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    const ffmpegCommand = `-i ${videoURI} -i ${audioURI} -filter_complex "[1:a]atrim=duration=${videoDuration}[trimmedAudio]" -map 0:v -map "[trimmedAudio]" -c:v copy -c:a aac -shortest ${outputVideoPath}`;

    FFmpegKit.executeAsync(
      ffmpegCommand,
      async (session) => {
        const state = FFmpegKitConfig.sessionStateToString(
          await session.getState()
        );
        const returnCode = await session.getReturnCode();
        const failStackTrace = await session.getFailStackTrace();
        const duration = await session.getDuration();

        if (ReturnCode.isSuccess(returnCode)) {
          console.log(
            `Encode completed successfully in ${duration} milliseconds.`
          );
          successCallback(outputVideoPath);
        } else {
          console.log('Encode failed. Please check log for the details.');
          console.log(
            `Encode failed with state ${state} and rc ${returnCode}. \n${failStackTrace}`
          );
          errorCallback();
        }
      },
      (log) => {},
      (statistics) => {
        const time = statistics.getTime();
        progressCallback(time);
      }
    ).then((session) =>
      console.log(
        `Async FFmpeg process started with sessionId ${session.getSessionId()}.`
      )
    );
  }

  static addWatermark(
    fileName,
    videoURI,
    watermarkURI,
    successCallback,
    errorCallback,
    progressCallback
  ) {
    const uniqueSuffix = Date.now();
    let outputVideoPath = `${RNFS.CachesDirectoryPath}/${
      uniqueSuffix + fileName
    }`;

    const ffmpegCommand = `-y -i ${videoURI} -i ${watermarkURI} -filter_complex "[1:v]format=rgba,colorchannelmixer=aa=0.5,scale=iw*0.25:-1[wm];[0:v][wm]overlay=W-w-10:H-h-10" ${outputVideoPath}`;

    FFmpegKit.executeAsync(
      ffmpegCommand,
      async (session) => {
        const state = FFmpegKitConfig.sessionStateToString(
          await session.getState()
        );
        const returnCode = await session.getReturnCode();
        const failStackTrace = await session.getFailStackTrace();
        const duration = await session.getDuration();

        if (ReturnCode.isSuccess(returnCode)) {
          console.log(
            `Encode completed successfully in ${duration} milliseconds.`
          );
          successCallback(outputVideoPath);
        } else {
          console.log('Encode failed. Please check log for the details.');
          console.log(
            `Encode failed with state ${state} and rc ${returnCode}. \n${failStackTrace}`
          );
          errorCallback();
        }
      },
      (log) => {},
      (statistics) => {
        const time = statistics.getTime();
        progressCallback(time);
      }
    ).then((session) =>
      console.log(
        `Async FFmpeg process started with sessionId ${session.getSessionId()}.`
      )
    );
  }

  static speed2x(
    fileName,
    videoURI,
    successCallback,
    errorCallback,
    progressCallback
  ) {
    let outputVideoPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    // First, use FFprobe to check for audio streams
    FFprobeKit.execute(
      `-v error -show_streams -select_streams a -of json ${videoURI}`
    ).then(async (session) => {
      const returnCode = await session.getReturnCode();
      let ffmpegCommand;

      if (ReturnCode.isSuccess(returnCode)) {
        const output = await session.getOutput();
        const jsonOutput = JSON.parse(output);
        if (jsonOutput.streams && jsonOutput.streams.length > 0) {
          ffmpegCommand = `-y -i ${videoURI} -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" ${outputVideoPath}`;
        } else {
          ffmpegCommand = `-y -i ${videoURI} -filter:v "setpts=0.5*PTS" -an ${outputVideoPath}`;
        }

        FFmpegKit.executeAsync(
          ffmpegCommand,
          async (session) => {
            const returnCode = await session.getReturnCode();
            const failStackTrace = await session.getFailStackTrace();
            const duration = await session.getDuration();

            if (ReturnCode.isSuccess(returnCode)) {
              console.log(
                `Encode completed successfully in ${duration} milliseconds.`
              );
              successCallback(outputVideoPath);
            } else {
              console.log('Encode failed. Please check log for the details.');
              console.log(
                `Encode failed with state ${state} and rc ${returnCode}. \n${failStackTrace}`
              );
              errorCallback();
            }
          },
          (log) => {
            console.log(log.getMessage());
          },
          (statistics) => {
            const time = statistics.getTime();
            progressCallback(time);
          }
        ).then((session) => {
          console.log(
            `Async FFmpeg process started with sessionId ${session.getSessionId()}.`
          );
        });
      } else {
        console.error('FFprobe failed to analyze the input video.');
        errorCallback();
      }
    });
  }

  static cutSegment(
    fileName,
    videoURI,
    startTime,
    duration,
    successCallback,
    errorCallback,
    progressCallback
  ) {
    const outputVideoPath = `${RNFS.CachesDirectoryPath}/${fileName}_cut.mp4`;

    const ffmpegCommand = `-y -i ${videoURI} -ss ${startTime} -t ${duration} -c copy ${outputVideoPath}`;

    // Execute the FFmpeg command
    FFmpegKit.executeAsync(
      ffmpegCommand,
      async (session) => {
        const state = FFmpegKitConfig.sessionStateToString(
          await session.getState()
        );
        const returnCode = await session.getReturnCode();
        const failStackTrace = await session.getFailStackTrace();

        if (ReturnCode.isSuccess(returnCode)) {
          successCallback(outputVideoPath);
        } else {
          console.log('Encode failed. Please check log for the details.');
          console.log(
            `Encode failed with state ${state} and rc ${returnCode}. \n${failStackTrace}`
          );
          errorCallback();
        }
      },
      (log) => {
        console.log(log.getMessage());
      },
      (statistics) => {
        const time = statistics.getTime();
        progressCallback(time);
      }
    ).then((session) => {
      console.log(
        `Async FFmpeg process for cutting clip started with sessionId ${session.getSessionId()}.`
      );
    });
  }

  static createSlideShow(
    audioURI,
    successCallback,
    errorCallback,
    progressCallback
  ) {
    let outputVideoPath = `${RNFS.CachesDirectoryPath}/final_video.mp4`;
    const fileListPath = `${RNFS.CachesDirectoryPath}/filelist.txt`;

    // const ffmpegCommand = `-f concat -safe 0 -i ${fileListPath} -i ${audioURI} -vsync vfr -pix_fmt yuv420p -c:v libx264 -c:a aac -strict experimental -shortest ${outputVideoPath}`;

    // const ffmpegCommand = `-f concat -safe 0 -i ${fileListPath} -vsync vfr -pix_fmt yuv420p -c:v libx264 -r 30 -c:a aac -strict experimental -shortest ${outputVideoPath}`;

    const ffmpegCommand = `-f concat -safe 0 -i ${fileListPath} -vsync vfr -pix_fmt yuv420p -c:v libx264 -c:a aac -strict experimental -shortest ${outputVideoPath}`;

    FFmpegKit.executeAsync(
      ffmpegCommand,
      async (session) => {
        const state = FFmpegKitConfig.sessionStateToString(
          await session.getState()
        );
        const returnCode = await session.getReturnCode();
        const failStackTrace = await session.getFailStackTrace();
        const duration = await session.getDuration();

        if (ReturnCode.isSuccess(returnCode)) {
          console.log(
            `Encode completed successfully in ${duration} milliseconds.`
          );
          successCallback(outputVideoPath);
        } else {
          console.log('Encode failed. Please check log for the details.');
          console.log(
            `Encode failed with state ${state} and rc ${returnCode}. \n${failStackTrace}`
          );
          errorCallback();
        }
      },
      (log) => {
        console.log(log.getMessage());
      },
      (statistics) => {
        // const time = statistics.getTime();
        // progressCallback(time);
      }
    ).then((session) =>
      console.log(
        `Async FFmpeg process started with sessionId ${session.getSessionId()}.`
      )
    );
  }
}

export default FFmpegWrapper;
