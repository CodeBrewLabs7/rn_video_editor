export type OnRuntype = {
  currentTime: number;
  startTime: number;
  endTime: number;
};

export interface RangeSliderTrimmerRef {
  currentTime: number;
  onRun: ({ currentTime, startTime, endTime }: OnRuntype) => void;
}


export interface VideoType {
  uri: string;
  localFileName: string;
  creationDate: string | null;
  duration: number;
}

export interface MultipleVideoType extends VideoType {
  min: number;
  max: number;
}
