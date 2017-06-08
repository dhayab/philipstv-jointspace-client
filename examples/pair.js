const { createInterface } = require('readline');

const { TV } = require('../build/index');
const { Credentials } = require('../build/lib/credentials');

const myTV = new TV('192.168.0.140');
console.log(`Connecting to TV at ${myTV.ip}...`);
myTV.connect()
	.then(() => {
		if (myTV.status === TV.PAIRING_REQUIRED) {
			console.log('Requesting pairing...');
			return myTV
				.requestAccess()
				.then(() => readPin())
				.then((pin) => myTV.validateAccess(pin))
			;
		}
		
		if (myTV.status === TV.OFFLINE) {
			throw Error('Could not reach TV.');
		}
	})
	.then(() => {
		if (myTV.status === TV.CONNECTED) {
			console.log('TV is ready. The following credentials have been saved for future requests:', Credentials.get(myTV.ip));
		} else {
			console.log('Pairing failed. Please try again.');
		}
	})
	.catch((error) => {
		console.log('An error occurred =>', error);
	})
;

const readPin = () => new Promise((resolve) => {
	const input = createInterface({ input: process.stdin, output: process.stdout });
	input.question('Please enter PIN shown on screen: ', (answer) => {
		resolve(answer);
		input.close();
	});
});
