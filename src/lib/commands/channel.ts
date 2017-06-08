import { Command } from './_command';

export type Payload = {
	channel: {
		ccid: number;
		preset: number;
		name: string;
	};
	channelList: {
		id: string;
		version: string;
	};
};

/**
 * Interact with the current TV channel.
 */
export class Channel extends Command {
	protected readonly path = 'activities/tv';

	/**
	 * Get the current channel information.
	 *
	 * @param parse Optionally, setting this to false will return the raw data from the resource.
	 */
	get(parse: boolean = false) {
		return super.get().then((payload: Payload) => {
			return !parse && payload || { id: payload.channel.ccid, name: payload.channel.name };
		});
	}

	/**
	 * Switch the TV channel.
	 * Use the `Channels` command to get the list of available channels.
	 *
	 * @param channelId The channel identifier (or ccid) to switch the TV to.
	 */
	set(channelId: number) {
		return this.get(false)
			.then((payload) => super.set(Object.assign(
				payload,
				{
					channel: {
						ccid: channelId,
					},
				},
			)))
		;
	}
}
