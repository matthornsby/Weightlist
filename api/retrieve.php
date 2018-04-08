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


//connect to the Database
include('connect.php');


//upsert into the database
$query = "SELECT content FROM lists WHERE stub ='$stub' limit 1";

//echo $query;

if ($result = mysqli_query($conn, $query)) {
    //printf("Select returned %d rows.\n", mysqli_num_rows($result));

    if (mysqli_num_rows($result) > 0) {
        // output data of each row
        while($row = mysqli_fetch_assoc($result)) {
            echo $row['content'];
        }
    } else {
        echo '{"name": "New List",
          "items": [
            { "item_name": "Swipe right to rename" },
            { "item_name": "Swipe left to edit" }
          ]
        }';
    }

} else {
  echo "failed";
}
mysqli_close($conn);


?>
