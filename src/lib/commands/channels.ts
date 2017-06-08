import { Command } from './_command';

export type Channel = {
	ccid: number;
	preset: number;
	name: string;
	onId: number;
	tsid: number;
	sid: number;
	type: string;
	serviceType: string;
	logoVersion: number;
};

export type Payload = {
	version: number;
	id: string;
	operator: string;
	installCountry: string;
	Channel: Channel[];
};

/**
 * Interact with the list of TV channels.
 */
export class Channels extends Command {
	protected readonly path = 'channeldb/tv/channelLists/alltv';

	/**
	 * Get the list of available channels on the TV.
	 */
	get() {
		return super.get().then((payload: Payload) => payload.Channel.map((channel) => ({
			id: channel.ccid,
			name: channel.name,
		})));
	}

	/**
	 * (Not supported)
	 * @hidden
	 */
	set() { return super.noop(); }
}
