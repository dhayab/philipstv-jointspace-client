export { Channel } from './channel';
export { Channels } from './channels';
export { Key } from './key';
export { Power } from './power';
export { Volume } from './volume';

const commands = [
	'channel',
	'channels',
	'key',
	'power',
	'volume',
];

// tslint:disable-next-line:variable-name
export const CommandClass = commands
	.reduce((commandList, command) => {
		commandList[command] = require(`./${command}`)[command.replace(/^./, (l) => l.toUpperCase())];
		return commandList;
	}, {})
;
