<div?php
session_start();
if (!isset($_SESSION['user'])) {
    header('location:login.php');
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIT Staff Reporting System</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100 min-h-screen flex flex-col items-center">
    <!-- Header -->
    <header class="w-full bg-blue-800 text-white py-4 shadow-md">
        <div class="max-w-6xl mx-auto flex justify-between items-center px-4">
            <h1 class="text-2xl font-bold">AIT Staff Reporting System</h1>
            <button onclick="logout()" class="text-sm bg-red-500 hover:bg-red-600 px-4 py-2 rounded">Logout</button>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow w-full max-w-6xl mx-auto mt-10">
        <h2 class="text-3xl font-semibold text-gray-700 text-center mb-8">Select a Unit</h2>
        
        <!-- Cards Section -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <?php
            // Example units
            $units = [
                ["name" => "DAA", "description" => "Division of Academic Affairs", "icon" => "academic-cap"],
                ["name" => "SDSU", "description" => "Systems Development and Support Unit", "icon" => "users"],
                ["name" => "LITIS", "description" => "Library and IT Services", "icon" => "computer-desktop"],
                // Add more units as needed
            ];

            foreach ($units as $unit) {
                echo "
                <a href='report.php?unit={$unit['name']}' class='bg-white shadow rounded-lg p-6 hover:shadow-lg transition transform hover:-translate-y-1'>
                    <div class='flex items-center space-x-4'>
                        <div class='text-blue-600'>
                            <svg class='w-12 h-12' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5.121 13.243A3 3 0 017.707 15H16.293a3 3 0 012.586-1.757L19 13M9.414 8H13v8M4 8v.586M15 5v-.586M10 5v-.586' />
                            </svg>
                        </div>
                        <div>
                            <h3 class='text-lg font-semibold text-gray-800'>{$unit['name']}</h3>
                            <p class='text-sm text-gray-600'>{$unit['description']}</p>
                        </div>
                    </div>
                </a>";
            }
            ?>
        </div>
    </main>

    <!-- Footer -->
    <footer class="w-full bg-gray-800 text-white py-4 mt-10">
        <div class="max-w-6xl mx-auto text-center text-sm">
            &copy; <?php echo date("Y"); ?> AIT Staff Reporting System. All rights reserved.
        </div>
    </footer>
    <script>
        function logout(){
            if (confirm("Are you sure you want to logout")) {
      fetch(`daa/crud.php?action=logout`)
        .then((response) => {
            console.log(response);
          if (response.ok) {
            console.log("Logout successful");
            window.location.href = "login.php"; // Redirect to login page
          } else {
            console.error("Logout failed");
          }
        })
        .catch((error) => {
          console.error("Error during logout:", error);
        });
    }
        }
    </script>
</body>

</html>
