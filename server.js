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

app.get( '/count/:version', function(req, res) {
	pool.getConnection(function(err, connection) {
		var sql     = "SELECT * FROM downloads WHERE version = ? ORDER BY count DESC LIMIT 1";
		var inserts = [ req.params.version ];
		sql         = mysql.format(sql, inserts);

		connection.query( sql, function(err, rows, fields) {
			if ( ! err && rows.length > 0 ) {
				res.json(rows[0]);
			}
			else {
				res.json({
					'count': 0
				});
			}

			connection.release();
		});
	});
});

app.get( '/versions', function(req, res) {
	pool.getConnection(function(err, connection) {
		var sql     = "SELECT DISTINCT version FROM downloads";

		connection.query( sql, function(err, rows, fields) {
			if ( ! err && rows.length > 0 ) {
				res.json(rows);
			}
			else {
				res.json({});
			}

			connection.release();
		});
	});
});

app.use(function(req, res, next) {
	res.status(404).json({
		'error': "Route doesn;'t exist"
	});
});