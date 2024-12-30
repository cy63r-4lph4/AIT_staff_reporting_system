<?php
session_start();
if (!isset($_SESSION['user'])) {
  header('location:login.php');
  exit();
}

if ($_SESSION['role'] != 1) {
  header('location: pagenotfound.html');
  exit();
} ?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Moderator Dashboard</title>
  <link rel="stylesheet" href="output.css" />
  <script src="scripts/script.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="scripts/summary.js"></script>

</head>
 
<body class="overflow-hidden">
  <div class="lg:flex w-full lg:h-screen lg:py-0 pb-10 overflow-hidden">
    <div Id='menu_icon' class="nav bg-gray-800 h-14 w-full flex items-center text-white px-2 lg:hidden sticky">
      <svg id="ham" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>

    </div>

    
    <div id="sideMenu"style="position: relative;" class=" left_nav bg-gray-800 w-1/4 h-full hidden lg:flex flex-col pt-5 lg:pb-0 pb-14 ">
    <div style="position: absolute; right: -40px; top: 20px; z-index: 50;">>
    <img src="./assets/icons/toggle.png" alt="menu-button" class="cursor-pointer h-12 w-12" id="menuToggle">
  </div>
      <h2 class="text-center text-white text-2xl mb-8 flex-grow-0 collapsible">
        Welcome Prof.
      </h2>
      <div class="actions flex flex-col flex-grow">
        <ul class="flex flex-col flex-grow">
          <li class="text-blue-600 text-lg text-center cursor-pointer hover:text-blue-500 bg-gray-300 hover:bg-gray-300 mx-3 py-2 mt-3" id="dashboard">
            <div class="flex flex-row justify-center align-center gap-4">
            <img src="./assets/icons/dashboard.png" alt="users" class="rounded-full w-6 h-6">
            <div class="collapsible">   Dashboard</div>
       
</div>
          </li>
          
          <li class="text-white text-lg text-center cursor-pointer hover:text-blue-500 bg-gray-700 hover:bg-gray-300 mx-3 py-2 mt-4" id="report">
          <div class="flex flex-row justify-center align-center gap-4">
          <img src="./assets/icons/report.png" alt="report" class="rounded-full w-6 h-6">
          <div class="collapsible">   Report</div>
          </li>
          <li class="text-white text-lg text-center cursor-pointer hover:text-blue-500 bg-gray-700 hover:bg-gray-300 mx-3 py-2 mt-4" id="chpasswd">
          <div class="flex flex-row justify-center align-center gap-4">
          <img src="./assets/icons/pass.png" alt="password" class="rounded-full w-6 h-6">
          <div class="collapsible">   Password</div>
          </li>
          <li class="text-white mt-auto mb-5 rounded text-lg justify-end text-center cursor-pointer hover:text-blue-500 bg-gray-700 hover:bg-gray-300 mx-3 py-2" id="logout">
          <div class="flex flex-row justify-center align-center gap-4">
          <img src="./assets/icons/logout.png" alt="logout" class="rounded-full w-6 h-6">
          <div class="collapsible">   Logout</div>
          </li >
        </ul>
      </div>
    </div>


    <div class="content lg:px-4 lg:w-3/4 w-full   flex-grow overflow-x-hidden" id="mainContent">
    </div>
  </div>
  <script>
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const sideList=document.querySelectorAll(".collapsible");

    menuToggle.addEventListener('click', () => {
      sideMenu.classList.toggle('collapsed');

      sideList.forEach((item) => {
    item.classList.toggle('hidden');
  });
    });
  </script>
</body>

</html>