<?php
include dirname( dirname(__FILE__) ) . '/config.php';

try {
	$dbh = new PDO($dsn, $user, $password);
} catch (PDOException $e) {
	echo 'Connection failed: ' . $e->getMessage();
	exit;
}


$date     = strtotime('2012-05-29');
$date_end = strtotime('now');
$types    = [
	//'wordpress', Doesn't have the date argument
	'php',
	'mysql'
];

foreach ( $types as $type ) {
	while ( $date <= $date_end ) {
		// Build url
		$url = 'http://api.wordpress.org/stats/' . $type . '/1.0/?day=' . date( "Y-m-d", $date );

		$data = json_decode( request_data( $url ) );

		foreach ( $data as $version => $count ) {
			$sql = "INSERT INTO versions (
				type,
				version,
				count,
				day) VALUES (
				:type,
				:version,
				:count,
				:day
			)";

			$stmt = $dbh->prepare($sql);

			$stmt->bindParam(':type', $type, PDO::PARAM_STR);
			$stmt->bindParam(':version', $version, PDO::PARAM_STR);
			$stmt->bindParam(':count', $count, PDO::PARAM_INT);
			$stmt->bindParam(':day', date( "Y-m-d", $date ), PDO::PARAM_STR);

			$stmt->execute();
		}

		// Set next date
		$date = strtotime( "+1 day", $date );
	}
}