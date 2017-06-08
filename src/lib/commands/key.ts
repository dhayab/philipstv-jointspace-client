import { Command } from './_command';

/**
 * @hidden
 */
const KEY_SEQUENCE_DELAY = 1000;

/**
 * Interact with the TV input keys.
 */
export class Key extends Command {
	public static STANDBY = 'Standby';
	public static BACK = 'Back';
	public static FIND = 'Find';
	public static RED_COLOUR = 'RedColour';
	public static GREEN_COLOUR = 'GreenColour';
	public static YELLOW_COLOUR = 'YellowColour';
	public static BLUE_COLOUR = 'BlueColour';
	public static HOME = 'Home';
	public static VOLUME_UP = 'VolumeUp';
	public static VOLUME_DOWN = 'VolumeDown';
	public static MUTE = 'Mute';
	public static OPTIONS = 'Options';
	public static DOT = 'Dot';
	public static DIGIT_0 = 'Digit0';
	public static DIGIT_1 = 'Digit1';
	public static DIGIT_2 = 'Digit2';
	public static DIGIT_3 = 'Digit3';
	public static DIGIT_4 = 'Digit4';
	public static DIGIT_5 = 'Digit5';
	public static DIGIT_6 = 'Digit6';
	public static DIGIT_7 = 'Digit7';
	public static DIGIT_8 = 'Digit8';
	public static DIGIT_9 = 'Digit9';
	public static INFO = 'Info';
	public static CURSOR_UP = 'CursorUp';
	public static CURSOR_DOWN = 'CursorDown';
	public static CURSOR_LEFT = 'CursorLeft';
	public static CURSOR_RIGHT = 'CursorRight';
	public static CONFIRM = 'Confirm';
	public static NEXT = 'Next';
	public static PREVIOUS = 'Previous';
	public static ADJUST = 'Adjust';
	public static WATCH_TV = 'WatchTV';
	public static VIEWMODE = 'Viewmode';
	public static TELETEXT = 'Teletext';
	public static SUBTITLE = 'Subtitle';
	public static CHANNEL_STEP_UP = 'ChannelStepUp';
	public static CHANNEL_STEP_DOWN = 'ChannelStepDown';
	public static SOURCE = 'Source';
	public static AMBILIGHT_ON_OFF = 'AmbilightOnOff';
	public static PLAY_PAUSE = 'PlayPause';
	public static PAUSE = 'Pause';
	public static FAST_FORWARD = 'FastForward';
	public static STOP = 'Stop';
	public static REWIND = 'Rewind';
	public static RECORD = 'Record';
	public static ONLINE = 'Online';

	protected readonly path = 'input/key';

	/**
	 * (Not supported)
	 */
	get() { return super.noop(); }

	/**
	 * Send a key input to the TV.
	 *
	 * @param key The identifier of the key to send to the TV.
	 */
	set(key: string) { return super.set({ key }); }

	/**
	 * Send a sequence of key inputs to the TV.
	 * Please note that there is no guarantee the keys will be interpreted in a timely way by the TV.
	 *
	 * @param keys A sequence of key identifiers to send to the TV.
	 */
	async send(...keys: string[]) {
		while (keys.length) {
			await this.set(keys.shift() as string);
			await new Promise((resolve) => setTimeout(() => resolve(), KEY_SEQUENCE_DELAY));
		}
	}
}
