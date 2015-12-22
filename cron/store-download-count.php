<?php
include dirname( dirname(__FILE__) ) . '/config.php';

$url = 'http://wordpress.org/download/counter/?ajaxupdate=1&time=' . time();


$ch = curl_init( $url );
curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$count = curl_exec( $ch );
curl_close($ch);

$version = get_wp_version();
$count   = str_replace( '.', '', $count );
$count   = str_replace( ',', '', $count );

if ( $count || $count == 0 ) {
	try {
		$dbh = new PDO($dsn, $user, $password);

		$sql = "INSERT INTO downloads (
			version,
			count,
			date_gmt) VALUES (
			:version,
			:count,
			UTC_TIMESTAMP())";

		$stmt = $dbh->prepare($sql);

		$stmt->bindParam(':version', $version, PDO::PARAM_STR);
		$stmt->bindParam(':count', $count, PDO::PARAM_INT);

		$stmt->execute();
	} catch (PDOException $e) {
		echo 'Connection failed: ' . $e->getMessage();
	}
}
