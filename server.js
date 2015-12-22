// set variables for environment
var express = require('express'),
	app     = express(),
	mysql   = require('mysql');
	request = require('request');

// Set server port
app.listen(4001);
console.log('server is running');

var pool = mysql.createPool({
	connectionLimit : 10,
	host     : 'localhost',
	user     : 'checksums',
	password : 'password',
	database : 'checksums'
});

pool.on('enqueue', function () {
	log_error('Waiting for available connection slot');
});

app.use(function(req, res, next) {
	res.status(404).json({
		'error': "Route doesn;'t exist"
	});
});