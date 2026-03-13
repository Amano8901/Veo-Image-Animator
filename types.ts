
export type AspectRatio = '16:9' | '9:16';

export enum VideoStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
}
