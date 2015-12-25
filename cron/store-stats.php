<?php
include dirname( dirname(__FILE__) ) . '/config.php';

try {
	$dbh = new PDO($dsn, $user, $password);
} catch (PDOException $e) {
	echo 'Connection failed: ' . $e->getMessage();
	exit;
}

$types = [
	'wordpress',
	'php',
	'mysql'
];

foreach ( $types as $type ) {
	$url = 'http://api.wordpress.org/stats/' . $type . '/1.0/';

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

		$stmt = $dbh->prepare( $sql );

		$stmt->bindParam(':type', $type, PDO::PARAM_STR);
		$stmt->bindParam(':version', $version, PDO::PARAM_STR);
		$stmt->bindParam(':count', $count, PDO::PARAM_INT);
		$stmt->bindParam(':day', date( 'Y-m-d' ), PDO::PARAM_STR);

		$stmt->execute();
	}
}