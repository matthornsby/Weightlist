<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
//validate
/*
if (!$_POST){
  echo "error: must be a post request";
}
*/
//echo "hi";



if ($_REQUEST['stub'] && strlen($_REQUEST['stub']) == 64 ){
  //$stub = mysql_real_escape_string($_REQUEST['stub']);
  $stub = $_REQUEST['stub'];
  //echo "stub OK";
} else{
  echo "error: stub value is invalid";
  exit;
}


if ($_REQUEST['list_content']){
  //$content = mysql_real_escape_string($_REQUEST['list_content']);
  $content = $_REQUEST['list_content'];
  //echo "content: OK";
} else{
  echo "error: list_content is invalid";
  exit;
}


//connect to the Database
include('connect.php');



$query = "REPLACE INTO lists (stub, content) VALUES ('$stub', '$content')";

//echo $query;

if ($result = mysqli_query($conn, $query)) {
    //printf("Select returned %d rows.\n", mysqli_num_rows($result));

    //echo "yes";
} else {
  echo "failed";
}
mysqli_close($conn);


?>
