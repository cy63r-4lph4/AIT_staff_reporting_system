<?php
session_start();
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST["email"];
    $passwd = $_POST['passwd'];

    $stmt = $conn->prepare("SELECT password,dbRole FROM users WHERE email=?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->bind_result($hashed_passwd, $role);
    $stmt->fetch();
    $stmt->close();



    if (password_verify($passwd, $hashed_passwd)) {
        $_SESSION['user'] = $email;
        if ($role == 2) {
            header('location:dashboard.php');
            $_SESSION['role'] = 2;
            exit();
        } 
       else if ($role == 1) {
            header('location:profdb.php');
            $_SESSION['role'] = 1;
            exit();
        } 
        else if ($role == 3) {

            header('location:userDashboard.php');
            $_SESSION['role'] = 3;
            exit();
        }
    } else {
        $_SESSION['error'] = "Invalid Credentials";
        header('Location: login.php');
        exit();
    }
    $conn->close();
} ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login</title>
    <link rel="stylesheet" href="output.css" />

</head>

<body class="overflow-hidden">
    <div class="flex flex-row flex-none h-screen mx-2 content-center w-full justify-center">
        <section class="w-full lg:w-2/5 flex flex-col justify-center h-screen">
            <div class="px-4">
                <div class="b"></div>
                <h1 class="text-2xl lg:text-4xl text-center font-bold font-sans mb-14 text-blue-600">
                    WEEKLY STAFF REPORT
                </h1>
                <h2 class="text-center lg:text-2xl text-xl font-bold mb-6 text-gray-800">
                    Sign In
                </h2>
                <?php if (isset($_SESSION['error'])) : ?>
                    <div id="error-message" class=" text-red-600 text-center">
                        <?php echo $_SESSION['error'];
                        unset($_SESSION['error']); ?>
                    </div>
                <?php endif; ?>
                <form id="loginForm" action="login.php" method="post">
                    <div class="flex flex-col align-middle space-y-4">
                        <label for="email"></label>
                        <input type="email" name="email" placeholder="Enter Email" id="email" autocomplete="email" required class="text-sm md:text-base border rounded p-2" />
                        <label for="password"></label>
                        <input id="password" type="password" name="passwd" placeholder="Enter Password" autocomplete="current-password" required class="text-sm md:text-base border rounded p-2" />
                    </div>
                    <div class="w-full flex flex-col">
                        <button type="submit" class="mt-5 border-none bg-blue-600 py-2 px-4 font-medium justify-center align-middle rounded text-white hover:bg-blue-300 cursor-pointer disabled:bg-blue-300">
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </section>
        <section class="w-full lg:w-3/5 hidden lg:block">
            <div class="h-full w-full bg-no-repeat bg-cover" style="background-image: url('./assets/img/BordOfDAs.jpeg')"></div>
        </section>
    </div>
</body>

</html>