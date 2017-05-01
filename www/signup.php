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

	if (empty($_POST['repassword']))
	  $errors['repassword'] = 'Retype-Password is required.';

	if (($_POST['repassword']) !== ($_POST['password']))
	  $errors['repassword'] = 'Retype-Password and password not match.';

	if (!empty($errors)) {
	  $data['errors']  = $errors;
	  
	} else {
	  // check with database
		$username = $_POST['username'];
		$password = $_POST['password'];
		$randid = $_POST['randId'];
		$name = $_POST['name'];
		// check existing record for both username and password
		$result = pg_query($conn, " select * from userdb where username = '$username' and password = '$password'");
		if (pg_num_rows($result) != 0){
			$data['message'] = "These username or password already exist";
		} else {
			$res = pg_query($conn,"insert into userdb (username, password, randid, link, name) values ('$username', '$password', '$randid', '', '$name')");
			$data['message'] = 'successful';
		};
	}
	// response back.
	echo json_encode($data);
	pg_close($conn);
?>