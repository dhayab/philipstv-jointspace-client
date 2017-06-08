import { Command } from './_command';

export type Powerstate = {
	On: string;
	Standby: string;
};

type Payload = {
	powerstate: keyof Powerstate;
};

/**
 * Interact with the TV power state.
 */
export class Power extends Command {
	protected readonly path = 'powerstate';

	/**
	 * Return whether the TV is powered or in standby.
	 */
	get() {
		return super.get().then((payload: Payload) => payload.powerstate);
	}

	/**
	 * Set the desired state of the TV.
	 *
	 * @param state The new state of the TV ("On" or "Standby")
	 */
	set(state: keyof Powerstate) {
		return super.set({
			powerstate: state,
		});
	}
}
