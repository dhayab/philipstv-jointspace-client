const debug = require('debug')(require('../../../package.json').name);

import { Credentials } from '../credentials';
import { request } from '../request';
import { TV } from '../tv';

/**
 * Base class that is extended by other supported commands.
 */
export class Command {
	/**
	 * The path of the remote resource where the request will be made.
	 */
	protected readonly path: string;

	constructor(
		private readonly tv: TV,
	) {
	}

	get() {
		debug(`⬅  GET ${this.path} ...`);
		return request({
			url: this.tv.url(this.path),
			credentials: Credentials.get(this.tv.ip),
		}).then(({ data }) => {
			debug(`OK (${this.path})`, data);
			return data;
		});
	}

	set(data: any) {
		debug(`➡  SET ${this.path} ...`, data);
		return request({
			url: this.tv.url(this.path),
			method: 'POST',
			data,
			credentials: Credentials.get(this.tv.ip),
		}).then(({ data }) => {
			debug(`OK (${this.path})`);
			return data;
		});
	}

	protected noop() {
		return Promise.resolve();
	}
}
