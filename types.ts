export enum DogSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  UNKNOWN = 'UNKNOWN'
}

export enum SceneType {
  INDOOR = 'INDOOR',
  CASUAL = 'CASUAL',
  SPORT = 'SPORT',
  FANCY = 'FANCY'
}

export interface BreedAnalysis {
  size: DogSize;
  reasoning: string;
  typicalHeightCm: number;
}

export interface UploadedFile {
  url: string;
  type: 'image' | 'video';
  name: string;
  originalFile: File;
}