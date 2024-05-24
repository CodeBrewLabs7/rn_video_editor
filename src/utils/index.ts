/* eslint-disable */

import RNFS from 'react-native-fs';

export const deleteFile = async (path: string) => {
  try {
    await RNFS.unlink(path);
  } catch (error) { }
};

export const deleteAllVideoFiles = async () => {
  try {
    const files = await RNFS.readDir(RNFS.CachesDirectoryPath);
    const filteredFiles = files.filter(file => {
      return /^\d+_.+\.mp4$/.test(file.name);
    });

    for (let file of filteredFiles) {
      await deleteFile(file.path);
    }
  } catch (error) { }
};
export const writeFile = async (data: any) => {
  const fileListPath = `${RNFS.CachesDirectoryPath}/filelist.txt`;
  RNFS.writeFile(fileListPath, data, 'utf8')
    .then(() => { })
    .catch(error => {
      console.error('Failed to write file list:', error);
    });
};
