
// import Share from 'react-native-share';
import RNFS from 'react-native-fs';

export const shareFile = async (url: string) => {
//   try {
//     const fileExists = await RNFS.exists(url);
//     if (!fileExists) {
//       console.log('File does not exist');
//       return;
//     }
//     const shareOptions = {
//       url,
//       type: 'video/mp4',
//       title: 'Share video file',
//       subject: 'File Shared from My App',
//     };

//     const result = await Share.open(shareOptions);
//     if (result?.success) {
//       await deleteFile(url);
//       return 'success';
//     } else {
//       return 'failure';
//     }
//   } catch (error) {
//     return error;
//   }
};

export const deleteFile = async (path: string) => {
  try {
    await RNFS.unlink(path);
  } catch (error) {}
};

export const deleteAllVideoFiles = async () => {
  try {
    const files = await RNFS.readDir(RNFS.CachesDirectoryPath);
    const filteredFiles = files.filter((file) => {
      return /^\d+_.+\.mp4$/.test(file.name);
    });

    for (let file of filteredFiles) {
      await deleteFile(file.path);
    }
  } catch (error) {}
};

export const writeFile = async (data) => {
  const fileListPath = `${RNFS.CachesDirectoryPath}/filelist.txt`;
  RNFS.writeFile(fileListPath, data, 'utf8')
    .then(() => {})
    .catch((error) => {
      console.error('Failed to write file list:', error);
    });
};
