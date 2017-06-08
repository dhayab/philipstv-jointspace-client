const debug = require('debug')(require('../../package.json').name);

import { Credentials } from './credentials';
import { allowInsecureRequests, request, RequestError } from './request';
import { PairingRequest, PairingValidation, PairingData } from './pairing-data';
import { CommandClass } from './commands/index';

type TVInfos = {
	name: string;
	version: number;
};

/**
 * Main entry point to interact with the TV (via the Jointspace API).
 */
export class TV {
	/**
	 * The TV is connected to the client and ready to receive secure requests.
	 */
	static readonly CONNECTED = 'connected';
	/**
	 * The TV is offline.
	 */
	static readonly OFFLINE = 'offline';
	/**
	 * The TV is online.
	 */
	static readonly ONLINE = 'online';
	/**
	 * The TV needs to be paired with the client.
	 */
	static readonly PAIRING_REQUIRED = 'pairing.required';
	/**
	 * The TV and the client are pairing.
	 */
	static readonly PAIRING_IN_PROGRESS = 'pairing.in.progress';

	private _infos: TVInfos;
	private _status: string = TV.OFFLINE;
	private initPromise: Promise<any>;
	private pairingData: PairingData;

	/**
	 * Initialize a new client.
	 *
	 * @param ip The IP address of the TV.
	 */
	constructor(
		readonly ip: string,
	) {
		debug(`🏁\tInitializing client for TV @ ${this.ip}...`);
		allowInsecureRequests();
		this.initPromise = this.getTvInfos()
			.then(() => {
				debug('TV is online.', this.infos);
				this._status = TV.ONLINE;
			})
			.catch((error: RequestError) => {
				throw new RequestError(error.message, undefined, 'OFFLINE');
			})
		;
	}

	/**
	 * Take command of a specific feature on the TV.
	 *
	 * @param command The name of a supported command (ie: "channel", or "volume")
	 */
	command<C>(command: string) {
		if (!CommandClass[command]) {
			throw Error(`There is no "${command}" command available.`);
		}

		const instance = new CommandClass[command](this);
		return instance as C;
	}

	/**
	 * Connect to the TV.
	 * Check for status when the promise is resolved to know what to do next.
	 */
	connect() {
		return this.initPromise
			.then(() => {
				if (this.status !== TV.ONLINE) {
					throw Error('TV is offline.');
				}

				debug('Getting secure connection to TV...');
				return request({
					url: this.url('powerstate'),
					credentials: Credentials.get(this.ip),
				});
			})
			.then(() => {
				debug('✔ Connected successfully.');
				this._status = TV.CONNECTED;
			})
			.catch((error: RequestError) => {
				if (error.status === 401) {
					debug('⚠️\tPairing with TV is necessary.');
					this._status = TV.PAIRING_REQUIRED;
				}
			})
		;
	}

	/**
	 * Start the pairing process with the TV.
	 */
	requestAccess() {
		this.pairingData = this.pairingData || new PairingData();

		debug('Starting pairing process...');
		this._status = TV.PAIRING_IN_PROGRESS;
		return request({
			url: this.url('pair/request'),
			method: 'POST',
			data: {
				scope: ['read', 'write', 'control'],
				device: this.pairingData.clientInfos,
			},
		}).then(({ data }: { data: PairingRequest }) => {
			if (data.error_id !== 'SUCCESS') {
				this._status = TV.ONLINE;

				throw new RequestError(data.error_text, undefined, data.error_id);
			}

			debug('Successfully received pairing challenge. PIN is displayed on TV.');
			this.pairingData.authKey = data.auth_key;
			this.pairingData.timestamp = data.timestamp;
		});
	}

	/**
	 * Finalize the pairing process.
	 *
	 * @param pin A 4-digit number displayed on screen that will confirm the pairing.
	 */
	validateAccess(pin: string) {
		debug('Validating pairing with TV...');
		return request({
			url: this.url('pair/grant'),
			method: 'POST',
			data: {
				auth: this.pairingData.generateAuthInfos(pin),
				device: this.pairingData.clientInfos,
			},
			credentials: this.pairingData.credentials,
		}).then(({ data }: { data: PairingValidation }) => {
			if (data.error_id !== 'SUCCESS') {
				this._status = TV.ONLINE;

				throw new RequestError(data.error_text, undefined, data.error_id);
			}

			debug('✔ Pairing with TV complete.');
			this._status = TV.CONNECTED;
			Credentials.save(this.ip, this.pairingData.credentials);
		});
	}

	url(path?: string) {
		return `https://${this.ip}:1926/` + ([] as any[]).concat(
			this.infos.version ? [this.infos.version] : [],
			path ? [path] : [],
		).join('/');
	}

	/**
	 * Return the name and the api version of the TV.
	 */
	get infos() { return this._infos || {}; }

	/**
	 * Return the connection status between the client and the TV.
	 */
	get status() { return this._status; }

	private getTvInfos() {
		return request({ url: this.url('system') })
			.then((res) => {
				this._infos = {
					name: res.data.name,
					version: res.data.api_version.Major,
				};
			})
		;
	}
}
