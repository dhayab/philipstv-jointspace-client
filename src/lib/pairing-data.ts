import * as btoa from 'btoa';
import { createHmac } from 'crypto';

export type PairingRequest = {
	error_id: 'SUCCESS' | 'CONCURRENT_PAIRING';
	error_text: string;
	auth_key: string;
	timestamp: number;
	timeout: number;
};

export type PairingValidation = {
	error_id: 'SUCCESS' | 'INVALID_PIN' | 'TIMEOUT';
	error_text: string;
};

/**
 * @hidden
 */
const CLIENT_INFOS = {
	device_name: 'philipstv-jointspace-client',
	device_os: process.platform,
	app_name: 'PhilipsTVJointspaceClient',
	type: 'native',
	app_id: 'client.jointspace.philipstv',
};

/**
 * @hidden
 */
const SECRET_KEY = 'ZmVay1EQVFOaZhwQ4Kv81ypLAZNczV9sG4KkseXWn1NEk6cXmPKO/MCa9sryslvLCFMnNe4Z4CPXzToowvhHvA==';

export class PairingData {
	authKey: string;
	timestamp: number;

	private readonly clientId: string;

	constructor() {
		this.clientId = this.createClientId();
	}

	generateAuthInfos(pin: string) {
		return {
			pin,
			auth_AppId: '1',
			auth_timestamp: this.timestamp,
			auth_signature: this.createSignature(SECRET_KEY, this.timestamp, pin),
		};
	}

	get clientInfos() {
		return Object.assign(CLIENT_INFOS, { id: this.clientId });
	}

	get credentials() {
		return { user: this.clientId, pass: this.authKey };
	}

	private createClientId() {
		const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		return Array(16).fill(undefined).map(() => alphabet.charAt(Math.floor(Math.random() * alphabet.length))).join('');
	}

	private createSignature(secret: string, timestamp: number, pin: string): string {
		const signature = createHmac('sha1', Buffer.from(secret, 'base64'))
			.update(timestamp + pin)
			.digest('hex')
		;

		return btoa(signature);
	}
}
