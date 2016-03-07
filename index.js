'use strict';
var fork = require('child_process').fork;
var resolve = require('path').resolve;
var got = require('got');
var uniqueRandomArray = require('unique-random-array');
var delay = require('delay');

function establishServer(startMessage) {
	var serverProcess = fork(resolve(__dirname, 'server.js'), {
		env: {
			START_MESSAGE: startMessage
		}
	});

	return new Promise(function (resolve) {
		serverProcess.once('message', function (msg) {
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
	}).then(function (res) {
		return res.body.data;
	});
}

function rotateGifs(gifs, interval, next) {
	var randomGif = uniqueRandomArray(gifs);
	var flow = true;

	var loop = function () {
		if (!flow) {
			return;
		}

		next(randomGif());
		setTimeout(loop, interval);
	};

	loop();

	return function () {
		flow = false;
	};
}

function generateMessageRenderers(opts) {
	var defaults = {
		start: 'Hi',
		resolve: 'Here you go',
		reject: 'Le wild error appers'
	};

	var createRenderer = function (opt) {
		return function (msg) {
			return typeof opt === 'function' ? opt(msg) : opt;
		};
	};

	var ret = {};

	for (var key of Object.keys(defaults)) {
		ret[key] = createRenderer(opts[key + 'Message'] || defaults[key]);
	}

	return ret;
}

function giffyBreak(input, apiKey, opts) {
	opts = opts || {};

	var message = generateMessageRenderers(opts);

	return Promise.all([
		establishServer(message.start()),
		fetchGifs(apiKey)
	]).then(function (res) {
		var serverProcess = res[0].process;
		var address = res[0].address;
		var gifs = res[1];

		var stopGifs = rotateGifs(gifs, opts.interval || 5000, function (gif) {
			console.log('gif yo');
			serverProcess.send(['gif', gif]);
		});

		var stop = function () {
			stopGifs();
			serverProcess.kill();
		};

		input.then(function (res) {
			serverProcess.send(['resolve-message', message.resolve(res)]);
		}, function (err) {
			serverProcess.send(['reject-message', message.reject(err)]);
		}).then(delay(100)).then(stop);

		return 'http://localhost:' + address.port;
	});
}

module.exports = giffyBreak;
