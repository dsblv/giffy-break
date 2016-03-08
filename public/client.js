(function (root, io, baseUrl, $) {
	'use strict';
	let finished = false;

	function preloadGif(gif) {
		const video = $('video', null, {
			src: gif.images.original.mp4,
			autoplay: true,
			loop: true
		});

		return new Promise(resolve => {
			video.addEventListener('canplay', () => {
				resolve(video);
			});
		});
	}

	function renderGif(gif) {
		const node = $('a', null, {
			href: gif.bitly_gif_url
		});

		return preloadGif(gif).then(vid => {
			node.appendChild(vid);
			return node;
		});
	}

	const render = {
		message: msg => $('h1', msg),
		rejectMessage: msg => $('h1', msg, {className: 'error'}),
		gif: renderGif
	};

	const display = fn => data => {
		if (finished) {
			return;
		}

		Promise.resolve(fn(data)).then(node => {
			root.innerHTML = '';
			root.appendChild(node);
		});
	};

	const show = {};

	for (const key of Object.keys(render)) {
		show[key] = display(render[key]);
	}

	io(baseUrl)
		.on('start-message', show.message)
		.on('gif', show.gif)
		.on('resolve-message', (msg) => {
			show.message(msg);
			finished = true;
		})
		.on('reject-message', (msg) => {
			show.rejectMessage(msg);
			finished = true;
		});
})(
	window.document.getElementById('root'),
	window.io,
	window.location.origin,
	(tag, text, props) => Object.assign(document.createElement(tag), text && {innerHTML: text}, props)
);
