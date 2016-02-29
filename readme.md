# giffy-break [![Build Status](https://travis-ci.org/dsblv/giffy-break.svg?branch=master)](https://travis-ci.org/dsblv/giffy-break)

> Watch random gifs in a browser while your `promise` is resolving

*Inspired by [gifi](https://github.com/vdemedes/gifi)*


## Install

```
$ npm install --save giffy-break
```


## Usage

```js
const giffyBreak = require('giffy-break');
const delay = require('delay');
const opn = require('opn');

giffyBreak(delay(6e4), 'dc6zaTOxFJmzC').then(opn);
// enjoy a gif slideshow in your browser for a minute
```


## API

### giffyBreak(input, apiKey, [options])

Starts a local server and returns a `promise` that resolves to its `url`.

#### input

Type: `promise`  
*Required*

A `promise` to show gifs while it is resolving.

#### apiKey

Type: `string`  
*Required*

A [giphy.com](//giphy.com/) API key.

#### options

##### startMessage

Type: `string`  
Default: `'Hi'`

Message to show before all the gifs.

##### resolveMessage

Type: `string` or `function`  
Default: `'Here you go'`

Message to show on success. If a `function` is passed, it'll be supplied with `input`'s resolved value.

##### rejectMessage

Type: `string`  
Default: `'Le wild error appears'`

Message to show on failure. If a `function` is passed, it'll be supplied with `input`'s rejected value.

##### interval

Type: `number`  
Default: `5000`

Time between gifs in milliseconds.


## Related

- [giffy-break-cli](https://github.com/dsblv/giffy-break-cli) — a CLI for this module.


## License

MIT © [Dmitriy Sobolev](http://github.com/dsblv)
