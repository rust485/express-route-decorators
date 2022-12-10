import fs, {PathLike} from 'fs';
import {IMatcher} from './IMatcher';

export class FileContentMatcher implements IMatcher {
	private readonly _pattern: string | RegExp;

	constructor(pattern: string | RegExp) {
		this._pattern = pattern;
	}

	matches(path: PathLike) {
		if (!fs.existsSync(path) || !fs.lstatSync(path).isFile()) {
			return false;
		}

		const content = fs.readFileSync(path);
		return content.toString().search(this._pattern) !== -1;
	}
}
