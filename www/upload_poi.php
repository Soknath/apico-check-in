<?php

include('config_db.php');
if ( !empty( $_FILES ) ) {

    $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];

    $userId = $_POST['userId'];
    // $lat = $_POST['lat'];
    // $lng = $_POST['lng'];
    //get file extension
    function findext($filename) {
    	$filename = strtolower($filename);
    	$exts = pathinfo($filename, PATHINFO_EXTENSION);
    	return $exts;
    }

    // $uploadPath = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $_FILES[ 'file' ][ 'name' ];

    $ext = findext($_FILES[ 'file' ][ 'name' ]);
    $ran = rand()."_".time().".";
    $target = 'uploads' . DIRECTORY_SEPARATOR . 'poi'. DIRECTORY_SEPARATOR . $ran.$ext;

    if (move_uploaded_file( $tempPath, $target )){
    	echo "files are uploaded";
	    // save file name into link
		$conn_string = "host=$DB_HOST port=5432 dbname=$DB_DATABASE user=$DB_USER password=$DB_PASSWORD";
		$conn = pg_pconnect($conn_string);
        $getId = pg_query($conn, "select * from poidb where userid = $userId order by id desc limit 1");
        $new_id = pg_fetch_result($getId, 0, 'id');
		pg_query($conn,"update poidb set link = '$target' || ' | ' || link where id = $new_id");
    } else {
    	echo "Sorry, there was an error occure";
    };

} else {
    echo 'No files';
}

?>