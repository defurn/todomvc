'use strict';

var express = require('express');
var fs = require('fs');
var learnJson = require('./learn.json');

var app = module.exports = express();
var favicon = require('serve-favicon');

app.use(express.static(__dirname));
app.use(favicon(__dirname + '/site-assets/favicon.ico'));

const PORT = 8080
const HOST = '0.0.0.0'
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

Object.defineProperty(module.exports, 'learnJson', {
	set: function (backend) {
		learnJson.backend = backend;
		fs.writeFile(require.resolve('./learn.json'), JSON.stringify(learnJson, null, 2), function (err) {
			if (err) {
				throw err;
			}
		});
	}
});
