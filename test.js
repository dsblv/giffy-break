import test from 'ava';
import delay from 'delay';
import fn from './';

test('fail on wrong apiKey', async t => {
	try {
		await fn(delay(2e4), 'wrong');
	} catch (err) {
		t.is(err.name, 'HTTPError');
		t.is(err.message, 'Response code 403 (Forbidden)');
	}
});
