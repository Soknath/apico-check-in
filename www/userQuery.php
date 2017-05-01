<?php
	include('config_db.php');
	
  // check with database
	$conn_string = "host=$DB_HOST port=$DB_PORT dbname=$DB_DATABASE user=$DB_USER password=$DB_PASSWORD";
	$conn = pg_pconnect($conn_string);
	// check existing record for both username and password
	$result = pg_query($conn, "select t.*, a.username, a.link from (SELECT userid, COUNT(*)::int AS totalcount FROM poidb GROUP BY userid ) t INNER JOIN userdb a on a.id = t.userid ORDER BY totalcount desc;");

	$result = pg_fetch_all($result);
	// $res = array();
	// while ($row = pg_fetch_row($result)) {
	//   $res[] = $row;
	// }
	echo json_encode($result);
	pg_close($conn);
?>