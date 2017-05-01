<?php
	include('config_db.php');
	$errors = array();
	$data = array();
	// Getting posted data and decodeing json
	$_POST = json_decode(file_get_contents('php://input'), true);

	// checking for blank values.
	if (empty($_POST['name']))
	  $errors['name'] = 'Name is required.';

	// if (empty($_POST['username']))
	//   $errors['username'] = 'Username is required.';

	if (empty($_POST['type']))
	  $errors['type'] = 'Type is required.';

	
	$conn_string = "host=$DB_HOST port=5432 dbname=$DB_DATABASE user=$DB_USER password=$DB_PASSWORD";
	$conn = pg_pconnect($conn_string);

	if (!empty($errors)) {
	  $data['errors']  = $errors;

	} else {
	  // $data['message'] = 'Form data is going well';
	  // check with database here
	  // check with database
		$name = $_POST['name'];
		$type = $_POST['type'];
		$userid = $_POST['userid'];
		$lat = $_POST['lat'];
		$lng = $_POST['lng'];
		if(!empty($_POST['address'])){
			$address = $_POST['address'];
		} else {
			$address = null;
		}; 
		if(!empty($_POST['tel'])){
			$tel = $_POST['tel'];
		} else {
			$tel = null;
		};
		
		$detail = $_POST['detail'];
		pg_query($conn,"insert into poidb (name,type,address,tel, link, userid, lat, lng, detail) values ('$name', '$type', '$address', '$tel', '', '$userid', '$lat', '$lng', '$detail') ");
		$data['message'] = 'successful';
	}
	// response back.
	echo json_encode($data);
	// pg_close($conn);
?>