<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('location: login.php');
    exit();
}

// Get the 'unit' parameter from the query string
$unit = $_GET['unit'] ?? null;

// If no unit is specified, redirect to a 404 page
if (!$unit) {
    header('location: pagenotfound.php');
    exit();
}

// Redirect based on the unit parameter value
switch (strtolower($unit)) {
    case 'daa':
        header('location: daa');
        break;

    case 'sdsu':
        header('location: sdsu');
        break;

    case 'litis':
        header('location: litis');
        break;

    // Add more cases here as needed for different units
    default:
        header('location: pagenotfound.php');
        break;
}

exit();
?>
