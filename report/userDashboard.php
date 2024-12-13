<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('location:login.php');
    exit();
}


?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Portal</title>
    <link rel="stylesheet" href="output.css" />
    <script src="scripts/myportal.js"></script>
</head>

<body class="flex overflow-hidden">
    <div class="lg:flex w-full lg:h-screen overflow-hidden">
        <div class="nav bg-gray-800 h-14 w-full flex justify-between items-center text-white px-2 lg:hidden">
            <div Id='menu_icon'>
                <svg id="ham" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>


            </div>
            <span class="text-xl font-semibold">User Dashboard</span>
        </div>


        <div id='sideMenu' class="left_nav bg-gray-800 w-1/4 h-full hidden lg:flex flex-col pt-5  pb-14 lg:pb-0">
            <h2 id="userName" class="text-center text-white text-2xl mb-8 flex-grow-0 text-wrap">
                User Dashboard
            </h2>
            <div class="actions flex flex-col flex-grow">
                <ul class="flex flex-col flex-grow">
                    <li class="text-blue-600 text-lg text-center cursor-pointer hover:text-blue-500 bg-gray-300 hover:bg-gray-300 mx-3 py-2 mt-3" id="profile">
                        Profile
                    </li>
                    <li class="text-white text-lg text-center cursor-pointer hover:text-blue-500 bg-gray-700 hover:bg-gray-600 mx-3 py-2 mt-4" id="activities">
                        My Activities
                    </li>

                    <li class="text-white text-lg text-center cursor-pointer hover:text-blue-500 bg-gray-700 hover:bg-gray-600 mx-3 py-2 mt-4" id="report">
                        Report
                    </li>
                    <li class="text-white text-lg text-center cursor-pointer hover:text-blue-500 bg-gray-700 hover:bg-gray-600 mx-3 py-2 mt-4" id="chpasswd">
                        Change Password
                    </li>
                    <li class="text-white mt-auto mb-5 rounded text-lg justify-end text-center cursor-pointer hover:text-blue-500 bg-gray-700 hover:bg-gray-600 mx-3 py-2" id="logout">
                        Logout
                    </li>
                </ul>
            </div>
        </div>
        <div id="content" class="content lg:px-4 lg:w-3/4 overflow-y-auto flex-grow lg:p-8 h-full">
        </div>
    </div>
</body>

</html>