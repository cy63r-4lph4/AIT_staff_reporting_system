<?php
session_start();
if (!isset($_SESSION['user'])) {
  header('location:login.php');
  exit();
}

else{if ($_SESSION['role'] == 1) {
  header('location: profdb.php');
  exit();
}
  else if($_SESSION['role'] == 2){
    header('location: dashboard.php');
  }
  else if($_SESSION['role'] == 3){
    header('location: userDashboard.php');
  }
}
?>
