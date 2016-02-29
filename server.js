'use strict';
const http = require('http');
const Koa = require('koa');
const resolvePkg = require('resolve-pkg');
const serve = require('koa-static');
const SocketIO = require('socket.io');
const pify = require('pify');

function takeFreePort(server, initialPort) {
	const fn = pify(server.listen.bind(server));
	const once = pify(server.once.bind(server));

	const attempt = port => {
		return Promise.race([
			fn(port),
			once('error')
		]).catch(err => {
			if (err.code === 'EADDRINUSE') {
				return attempt(++port);
			}

			throw err;
		});
	};

	return attempt(initialPort).then(() => server);
}

function establishServer() {
	const app = new Koa();

	const socketIOClientDir = resolvePkg('socket.io-client', {cwd: __dirname});

	app.use(serve(socketIOClientDir));
	app.use(serve(`${__dirname}/public`));

	const server = http.createServer(app.callback());

	return takeFreePort(server, 6175);
}

establishServer().then(server => {
	process.send(['@@INIT', server.address()]);

	const io = new SocketIO(server);

	process.on('message', data => {
		io.emit.apply(io, data);
	});

	io.on('connection', socket => {
		socket.emit('start-message', process.env.START_MESSAGE);
	});
});
