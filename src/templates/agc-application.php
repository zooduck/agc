<?php

// Note: PHP 5.4.0+ comes with a built in web-server
// which can be run from th command line using "php -S localhost:8000" for example


$request_method = $_SERVER["REQUEST_METHOD"];
$request_uri = $_SERVER["REQUEST_URI"];

$funct = null;
if( $_POST && $_POST["_function"] ){
	$funct = $_POST["_function"];
}else{
	echo "TEST function was NOT called...";
}

function TEST(){
	echo "TEST function was called!";
};



?>