<?php
	include('config_db.php');
	$errors = array();
	$data = array();
	// Getting posted data and decodeing json
	$_POST = json_decode(file_get_contents('php://input'), true);
	
	$conn_string = "host=$DB_HOST port=$DB_PORT dbname=$DB_DATABASE user=$DB_USER password=$DB_PASSWORD";
	$conn = pg_pconnect($conn_string);

	// checking for blank values.
	if (empty($_POST['username']))
	  $errors['username'] = 'Username is required.';

	if (empty($_POST['password']))
	  $errors['password'] = 'Password is required.';

	if (!empty($errors)) {
	  $data['errors']  = $errors;
	} else { 
		$username = $_POST['username'];
		$password = $_POST['password'];
		$userid = $_POST['userid'];

		$name = $_POST['name'];
		$position = $_POST['position'];
		$company = $_POST['company'];
		$tel = $_POST['tel'];
		$email = $_POST['email'];
		// check existing record for both username and password
		$result = pg_query($conn, " update userdb set username = '$username', password = '$password', name = '$name', position = '$position', company = '$company', tel = '$tel', email = '$email' where id = $userid");
		$data['message'] = 'successful';
	};
	// response back.
	echo json_encode($data);
	pg_close($conn);
?>