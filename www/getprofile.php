<?php
	include('config_db.php');
	$errors = array();
	$data = array();
	// Getting posted data and decodeing json
	$_POST = json_decode(file_get_contents('php://input'), true);

	$userid = $_POST['user_id'];
    // check with database
	$conn_string = "host=$DB_HOST port=$DB_PORT dbname=$DB_DATABASE user=$DB_USER password=$DB_PASSWORD";
	$conn = pg_pconnect($conn_string);
	$result = pg_query($conn, " select * from userdb where id = $userid");

	if (pg_fetch_result($result, 0, 'link') === null) {
		$data['errors'] = 'nolink';
	} else {
		$data['link'] = pg_fetch_result($result, 0, 'link');
	};

	// response back.
	echo json_encode($data);
	pg_close($conn);
?>