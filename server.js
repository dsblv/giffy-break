'use strict';
var http = require('http');
var express = require('express');
var serve = express.static;
var resolve = require('path').resolve;
var resolvePkg = require('resolve-pkg');
var SocketIO = require('socket.io');
var pify = require('pify');

function takeFreePort(server, initialPort) {
	var fn = pify(server.listen.bind(server));
	var once = pify(server.once.bind(server));

	var attempt = function (port) {
		return Promise.race([
			fn(port),
			once('error')
		]).catch(function (err) {
			if (err.code === 'EADDRINUSE') {
				return attempt(++port);
			}

			throw err;
		});
	};

	return attempt(initialPort).then(function () {
		return server;
	});
}

function establishServer() {
	var app = express();

	app.use(serve(resolvePkg('socket.io-client', {cwd: __dirname})));
	app.use(serve(resolve(__dirname, 'public')));

	var server = http.createServer(app);

	return takeFreePort(server, 6175);
}

establishServer().then(function (server) {
	process.send(['@@INIT', server.address()]);

	var io = new SocketIO(server);

	process.on('message', function (data) {
		io.emit.apply(io, data);
	});

	io.on('connection', function (socket) {
		socket.emit('start-message', process.env.START_MESSAGE);
	});
});
