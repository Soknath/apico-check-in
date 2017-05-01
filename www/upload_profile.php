<?php

include('config_db.php');
if ( !empty( $_FILES ) ) {

    $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];

    $randid = $_POST['randid'];
    //get file extension
    function findext($filename) {
    	$filename = strtolower($filename);
    	$exts = pathinfo($filename, PATHINFO_EXTENSION);
    	return $exts;
    }

    // $uploadPath = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $_FILES[ 'file' ][ 'name' ];

    $ext = findext($_FILES[ 'file' ][ 'name' ]);
    $ran = rand()."_".time().".";
    $target = 'uploads' . DIRECTORY_SEPARATOR . 'profile'. DIRECTORY_SEPARATOR . $ran.$ext;

    if (move_uploaded_file( $tempPath, $target )){
    	echo "files are uploaded";
	    // save file name into link
		$conn_string = "host=$DB_HOST port=$DB_PORT dbname=$DB_DATABASE user=$DB_USER password=$DB_PASSWORD";
		$conn = pg_pconnect($conn_string);

    	echo $target;
		pg_query($conn,"update userdb set link = '$target' where randid = '$randid'");

    } else {
    	echo "Sorry, there was an error occure";
    };

} else {
    echo 'No files';
}

	pg_close($conn);
?>