import { PathLike } from 'fs';

export interface IMatcher {
  matches(path: PathLike): boolean;
}