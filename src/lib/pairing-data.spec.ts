import { test } from 'ava';
import { PairingData } from 'philipstv-jointspace-client';

const pairingData = new PairingData();

test('createSignature', async (t) => {
	pairingData.timestamp = 1337;
	const authInfos = pairingData.generateAuthInfos('42');
	t.deepEqual(authInfos.auth_signature, 'NzE5MTg4ZmY5NTYyMjQ3Zjc5NjFkYjQzOWMyYzc3OTFmZjdkM2JjMQ==');
});
