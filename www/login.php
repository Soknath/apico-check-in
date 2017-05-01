<?php
	include('config_db.php');
	$errors = array();
	$data = array();
	// Getting posted data and decodeing json
	$_POST = json_decode(file_get_contents('php://input'), true);

	// checking for blank values.
	if (empty($_POST['username']))
	  $errors['username'] = 'กรุณาใส่รหัสพนักงาน';

	if (empty($_POST['password']))
	  $errors['password'] = 'กรุณาใส่รหัสผ่าน';

	
	$conn_string = "host=$DB_HOST port=$DB_PORT dbname=$DB_DATABASE user=$DB_USER password=$DB_PASSWORD";
	$conn = pg_pconnect($conn_string);

	if (!empty($errors)) {
	  $data['errors']  = $errors;
	} else {
	  // check with database
		$username = $_POST['username'];
		$password = $_POST['password'];

		$result = pg_query($conn,"select * from userdb where username = '$username' and password = '$password'");
		if (pg_num_rows($result) == 0) {
		  $data['message'] = "รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง";
		} else {
	  		$data['message'] = 'successful';
	  		$data['id'] = pg_fetch_result($result,0,2);
	  		$data['username'] = pg_fetch_result($result,0,0);
	  		$data['password'] = pg_fetch_result($result,0,1);
	  		$data['link'] = pg_fetch_result($result,0,3);
	  		$data['name'] = pg_fetch_result($result,0,5);
		};
	}
	// response back.
	echo json_encode($data);
	pg_close($conn);
?>