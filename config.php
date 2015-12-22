<?php

$dsn = 'mysql:dbname=wpcentral_stats;host=localhost';
$user = 'wpcentral_stats';
$password = 'password';

function get_wp_version() {
	$url     = 'http://api.wordpress.org/core/version-check/1.7/';
	$content = file_get_contents( $url );
	$json    = json_decode( $content );

	if ( $json && isset( $json->offers, $json->offers[0], $json->offers[0]->current ) ) {
		return $json->offers[0]->current;
	}

	return '-';
}

function request_data( $url ) {
	$ch = curl_init( $url );
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	$data = curl_exec( $ch );
	curl_close($ch);

	return $data;
}