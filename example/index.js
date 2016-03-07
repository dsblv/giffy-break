const giffyBreak = require('../');
const delay = require('delay');
const opn = require('opn');

giffyBreak(delay(6e4), 'dc6zaTOxFJmzC').then(opn);
// enjoy a gif slideshow in your browser for a minute
// using the [Public Beta API Key](https://github.com/Giphy/GiphyAPI#public-beta-key)
