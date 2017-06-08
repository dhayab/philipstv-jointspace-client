import { Command } from './_command';

export interface Payload {
	muted: boolean;
	current: number;
	min: number;
	max: number;
}

/**
 * Interact with the volume on the TV.
 */
export class Volume extends Command {
	protected readonly path: string = 'audio/volume';

	/**
	 * Get the current volume level.
	 *
	 * @param parse Optionally, setting this to false will return the raw data from the resource.
	 */
	get(parse: boolean = true) {
		return super.get()
			.then((payload: Payload) => {
				return !parse && payload || payload.current;
			})
		;
	}

	/**
	 * Set the volume to the desired level.
	 *
	 * @param volume The desired volume level.
	 */
	set(volume: number) {
		return this.get(false)
			.then((payload: Payload) => super.set(Object.assign(
				payload,
				{
					current: Math.min(payload.max, Math.max(volume, payload.min)),
				},
			)))
		;
	}

	/**
	 * Mute or unmute without changing the volume level.
	 * @param muted Set to true in order to mute, false otherwise.
	 */
	mute(muted: boolean) {
		return this.get(false)
			.then((payload: Payload) => super.set(Object.assign(
				payload,
				{
					muted,
				},
			)))
		;
	}
}
