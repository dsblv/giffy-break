'use strict';
const fork = require('child_process').fork;
const got = require('got');
const pify = require('pify');
const uniqueRandomArray = require('unique-random-array');

function establishServer(startMessage) {
	const serverProcess = fork(`${__dirname}/server.js`, {
		env: {
			START_MESSAGE: startMessage
		}
	});

	return new Promise(resolve => {
		serverProcess.once('message', msg => {
			if (msg[0] === '@@INIT') {
				resolve({
					process: serverProcess,
					address: msg[1]
				});
			}
		});
	});
}

function fetchGifs(apiKey) {
	return got('http://api.giphy.com/v1/gifs/trending', {
		json: true,
		query: {
			limit: 50,
			api_key: apiKey // eslint-disable-line camelcase
		}
	}).then(res => res.body.data);
}

function rotateGifs(gifs, interval, next) {
	const randomGif = uniqueRandomArray(gifs);
	let flow = true;

	const loop = () => {
		if (!flow) {
			return;
		}

		next(randomGif());
		setTimeout(loop, interval);
	};

	loop();

	return () => {
		flow = false;
	};
}

function generateMessageRenderers(opts) {
	const defaults = {
		start: 'Hi',
		resolve: 'Here you go',
		reject: 'Le wild error appers'
	};

	const ret = {};

	for (const key of Object.keys(defaults)) {
		const opt = opts[`${key}Message`] || defaults[key];

		ret[key] = (msg) => {
			return typeof opt === 'function' ? opt(msg) : opt;
		};
	}

	return ret;
}

function giffyBreak(input, apiKey, opts) {
	opts = opts || {};

	const message = generateMessageRenderers(opts);

	return Promise.all([
		establishServer(message.start()),
		fetchGifs(apiKey)
	]).then(res => {
		const serverProcess = res[0].process;
		const address = res[0].address;
		const gifs = res[1];

		const send = pify(serverProcess.send.bind(serverProcess));

		const stopGifs = rotateGifs(
			gifs,
			opts.interval || 5000,
			gif => send(['gif', gif])
		);

		const stop = () => {
			stopGifs();
			serverProcess.kill();
		};

		input.then(
			res => send(['resolve-message', message.resolve(res)]),
			err => send(['reject-message', message.reject(err)])
		).then(stop);

		return `http://localhost:${address.port}`;
	});
}

module.exports = giffyBreak;
