<?php
	include('config_db.php');
	
	$userid = $_GET['userid'];
  // check with database
	$conn_string = "host=$DB_HOST port=$DB_PORT dbname=$DB_DATABASE user=$DB_USER password=$DB_PASSWORD";
	$conn = pg_pconnect($conn_string);
	// check existing record for both username and password
	$result = pg_query($conn, "select*, split_part(link,' |',1) as linkname from poidb where userid = $userid order by id desc");


	if (pg_num_rows($result) === 0){
		$result = 'no result found.';
	} else { 
		$result = pg_fetch_all($result);
	};
	
	echo json_encode($result);
	pg_close($conn);
?>