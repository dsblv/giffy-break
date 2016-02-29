(function (root, io, baseUrl) {
	'use strict';
	const socket = io(baseUrl);

	const render = {
		message: text => `<h1>${text}</h1>`,
		rejectMessage: text => `<h1 class="error">${text}</h1>`,
		gif: url => `<a href="${url}"><img src="${url}" /></a>`
	};

	const display = renderFn => html => {
		root.innerHTML = renderFn(html);
	};

	socket
		.on('start-message', display(render.message))
		.on('resolve-message', display(render.message))
		.on('reject-message', display(render.rejectMessage))
		.on('gif', display(render.gif));
})(
	window.document.getElementById('root'),
	window.io,
	window.location.origin
);
