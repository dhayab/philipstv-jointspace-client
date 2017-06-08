import * as Conf from 'conf';

export interface Credentials {
	readonly user: string;
	readonly pass: string;
}

export class Credentials {
	private static config: Conf = new Conf();

	static get(ip: string): Credentials | undefined {
		return Credentials.config.get(Credentials.normalize(ip));
	}

	static save(ip: string, credentials: Credentials): void {
		Credentials.config.set(Credentials.normalize(ip), credentials);
	}

	private static normalize(str: string) {
		return str.replace(/\./g, '-');
	}
}
