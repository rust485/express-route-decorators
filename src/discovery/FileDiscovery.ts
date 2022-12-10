import fs from 'fs';
import path from 'path';

import {IDiscovery} from './IDiscovery';
import {IMatcher} from './IMatcher';

/**
 * Discover all files that match the given matcher starting
 * at the root path and working down to the root paths contents
 *
 * When discovering matching files, those files will be imported using
 * `require`
 */
export class FileDiscovery implements IDiscovery {
	private static readonly IGNORE = new Set(['node_modules']);

	private readonly _rootPath: string;
	private readonly _matcher: IMatcher;

	constructor(matcher: IMatcher, rootPath: string) {
		this._rootPath = rootPath;
		this._matcher = matcher;
	}

	/**
   * Find all files that match the given matcher starting
   * at the root path
   */
	findFiles() {
		this._findRec(this._rootPath);
	}

	private _findRec(targetPath: string) {
		const base = path.basename(targetPath);
		if (FileDiscovery.IGNORE.has(base)) {
			return;
		}

		if (fs.lstatSync(targetPath).isFile()) {
			if (this._matcher.matches(targetPath)) {
				require(targetPath);
			}

			return;
		}

		fs.readdirSync(targetPath)
			.forEach((child) => this._findRec(path.join(targetPath, child)));
	}
}
