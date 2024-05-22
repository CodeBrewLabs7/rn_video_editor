import { Dimensions } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('screen').width;
export const SCREEN_HEIGHT = Dimensions.get('screen').height;
export const FRAME_PER_SEC = 1;
export const FRAME_WIDTH = 120;
export const TILE_HEIGHT = 70;
export const TILE_WIDTH = FRAME_WIDTH / 2; // to get a 2x resolution

export const DURATION_WINDOW_DURATION = 120;
export const DURATION_WINDOW_BORDER_WIDTH = 4;
export const DURATION_WINDOW_WIDTH =
  DURATION_WINDOW_DURATION * FRAME_PER_SEC * TILE_WIDTH;
export const POPLINE_POSITION = '50%';

export const FRAME_STATUS = Object.freeze({
  LOADING: { name: Symbol('LOADING') },
  READY: { name: Symbol('READY') },
});


export type Frame = {
  status: 'READY' | 'LOADING';
  uri: string;
};
