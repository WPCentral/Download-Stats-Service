<?php

$dsn = 'mysql:dbname=wpcentral_stats;host=127.0.0.1';
$user = 'username';
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
