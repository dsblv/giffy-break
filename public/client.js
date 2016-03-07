(function (root, io, baseUrl, $) {
	'use strict';
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
		Promise.resolve(fn(data)).then(node => {
			root.innerHTML = '';
			root.appendChild(node);
		});
	};

	io(baseUrl)
		.on('start-message', display(render.message))
		.on('resolve-message', display(render.message))
		.on('reject-message', display(render.rejectMessage))
		.on('gif', display(render.gif));
})(
	window.document.getElementById('root'),
	window.io,
	window.location.origin,
	(tag, text, props) => Object.assign(document.createElement(tag), text && {innerHTML: text}, props)
);
