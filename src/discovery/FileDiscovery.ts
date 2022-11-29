import fs from 'fs';
import path from 'path';

import { IDiscovery } from "./IDiscovery";
import { IMatcher } from "./IMatcher";

export class FileDiscovery implements IDiscovery {

  private static readonly IGNORE = new Set(['node_modules']);

  private readonly _initialPath: string;
  private readonly _matcher: IMatcher;
  constructor(matcher: IMatcher, initialPath: string) {
    this._initialPath = initialPath;
    this._matcher = matcher;
  }

  findFiles() {
    this._findRec(this._initialPath);
  }

  private _findRec(targetPath: string) {
    const base = path.basename(targetPath);
    if (FileDiscovery.IGNORE.has(base))
      return;

    if (fs.lstatSync(targetPath).isFile()) {
      if (this._matcher.matches(targetPath))
        require(targetPath)

      return;
    }

    fs.readdirSync(targetPath)
      .forEach((child) => this._findRec(path.join(targetPath, child)));
  }
}