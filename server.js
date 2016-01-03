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
	console.log('Waiting for available connection slot');
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

app.get( '/count-history/:version', function(req, res) {
	pool.getConnection(function(err, connection) {
		var sql     = "SELECT MAX(count) as count, date_format(date_gmt,'%Y-%m-%d') as date FROM downloads WHERE version = ? GROUP BY YEAR(date_gmt), MONTH(date_gmt), DATE(date_gmt) ORDER BY date_gmt";
		var inserts = [ req.params.version ];
		sql         = mysql.format(sql, inserts);

		connection.query( sql, function(err, rows, fields) {
			if ( ! err ) {
				res.json(rows);
			}
			else {
				res.json([]);
			}

			connection.release();
		});
	});
});

app.get( '/count-stats/:version', function(req, res) {
	pool.getConnection(function(err, connection) {
		var sql     = "SELECT ( MAX(count) - MIN(count) ) as downloads, WEEKDAY( date_gmt ) as weekday, HOUR( date_gmt ) as hour FROM downloads WHERE version = ? GROUP BY YEAR(date_gmt), MONTH(date_gmt), DATE(date_gmt), HOUR(date_gmt)";
		var inserts = [ req.params.version ];
		sql         = mysql.format(sql, inserts);

		connection.query( sql, function(err, rows, fields) {
			var data = {
				'days':  [ 0, 0, 0, 0, 0, 0, 0 ],
				'hours': [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
			}

			if ( ! err ) {
				for (var row_id in rows) {
					var row = rows[ row_id ];

					data.days[ row.weekday ] = data.days[ row.weekday ] + row.downloads;
					data.hours[ row.hour ]   = data.hours[ row.hour ] + row.downloads;
				}

				res.json(data);
			}
			else {
				res.json(data);
			}

			connection.release();
		});
	});
});

app.get( '/last-7days/:version', function(req, res) {
	pool.getConnection(function(err, connection) {
		var sql     = "SELECT ( MAX(count) - MIN(count) ) as downloads, WEEKDAY( date_gmt ) as weekday FROM downloads WHERE version = ? GROUP BY YEAR(date_gmt), MONTH(date_gmt), DATE(date_gmt) ORDER BY date_gmt DESC LIMIT 7";
		var inserts = [ req.params.version ];
		sql         = mysql.format(sql, inserts);

		connection.query( sql, function(err, rows, fields) {
			if ( ! err ) {
				res.json(rows);
			}
			else {
				res.json([]);
			}

			connection.release();
		});
	});
});

app.get( '/stats/:type', function(req, res) {
	pool.getConnection(function(err, connection) {
		var sql     = "SELECT count as value, version as label FROM versions WHERE day = (SELECT day FROM versions WHERE type=? ORDER BY day DESC LIMIT 1) AND count !=0 AND type=?";
		var inserts = [ req.params.type, req.params.type ];
		sql         = mysql.format(sql, inserts);

		connection.query( sql, function(err, rows, fields) {
			if ( ! err ) {
				res.json(rows);
			}
			else {
				res.json([]);
			}

			connection.release();
		});
	});
});

app.get( '/stats-history/:type', function(req, res) {
	pool.getConnection(function(err, connection) {
		var skipped_versions = [];

		switch(req.params.type) {
			case 'wordpress':
				skipped_versions = ['2.7', '2.8', '2.9'];
				break;
			case 'php':
				skipped_versions = ['4.3', '4.4', '5.0', '5.7'];
				break;
			case 'mysql':
				skipped_versions = ['3.23', '4.0', '4.1', '5.', '5.13', '5.2', '5.3', '5.4', '5.7'];
				break;
		}

		var sql  = "SELECT DATE_FORMAT(day,'%X W%V') AS date, version, AVG(count) AS count FROM versions ";
			sql += "WHERE TYPE=? AND VERSION NOT IN (?) ";
			sql += "GROUP BY DATE_FORMAT(day,'%X W%V'), version ";
			sql += "ORDER BY day, INET_ATON(SUBSTRING_INDEX(CONCAT(version,'.0'),'.',2))"

		var inserts = [ req.params.type, skipped_versions ];
		sql         = mysql.format(sql, inserts);

		connection.query( sql, function(err, rows, fields) {
			if ( ! err ) {
				var data = {};

				rows.forEach(function(entry) {
					if ( ! data[ entry.date ] ) {
						data[ entry.date ] = {};
					}

					data[ entry.date ].date             = entry.date;
					data[ entry.date ][ entry.version ] = entry.count;
				});

				res.json( array_values(data) );
			}
			else {
				res.json([]);
			}

			connection.release();
		});
	});
});

app.get( '/releases/:version', function(req, res) {
	pool.getConnection(function(err, connection) {
		var sql     = "SELECT * FROM releases WHERE major = ? ORDER BY minor ASC";
		var inserts = [ req.params.version ];
		sql         = mysql.format(sql, inserts);

		connection.query( sql, function(err, rows, fields) {
			if ( ! err ) {
				res.json(rows);
			}
			else {
				res.json([]);
			}

			connection.release();
		});
	});
});

app.get( '/versions', function(req, res) {
	pool.getConnection(function(err, connection) {
		var sql = "SELECT DISTINCT version FROM downloads";

		connection.query( sql, function(err, rows, fields) {
			if ( ! err ) {
				res.json(rows);
			}
			else {
				res.json([]);
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





function array_values(input) {
	var tmp_arr = [], key = '';

	for (key in input) {
		tmp_arr[tmp_arr.length] = input[key];
	}

	return tmp_arr;
}