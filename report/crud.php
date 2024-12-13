<?php



include 'db.php';

session_start();


$action = $_REQUEST['action'] ?? '';
$table = $_REQUEST['table'] ?? '';

// Create

if ($action === 'create') {
    try {
        $data = $_POST;
        $id = $_REQUEST['id'] ?? '';

        if ($table === "users") {
            if ($_SESSION['role'] != 2) {
                header('location: pagenotfound.html');
                exit();
            }
            $password = password_hash('aitstaff', PASSWORD_DEFAULT);
            $role = mysqli_real_escape_string($conn, $data['role']);
            if ($role === "admin") {
                $role = 2;
            } elseif ($role === 'moderator') {
                $role = 1;
            } else {
                $role = 3;
            }
            $columns = ['email', 'user_name', 'password', 'dbRole'];
            $values = [
                mysqli_real_escape_string($conn, $data['email']),
                mysqli_real_escape_string($conn, $data['name']),
                $password,
                $role
            ];

            $columnsString = implode(", ", $columns);
            $valuesString = "'" . implode("', '", $values) . "'";
            $sql = "INSERT INTO $table ($columnsString) VALUES ($valuesString)";
        } elseif ($table === 'activities') {
            $activity = mysqli_real_escape_string($conn, $data['activity']);
            $description = mysqli_real_escape_string($conn, $data['details']);
            $attachment = $_FILES['attachment'];
            $attachment_path = '';

            if (isset($attachment['name']) && $attachment['name']) {
                $target_dir = 'uploads/';
                $attachment_path = $target_dir . basename($attachment['name']);

                if (move_uploaded_file($attachment['tmp_name'], $attachment_path)) {
                    // File upload successful
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to upload file.']);
                    exit();
                }
            }

            $sql = "INSERT INTO activities (activity_name, details, attachment) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($sql);

            if ($stmt) {
                $stmt->bind_param('sss', $activity, $description, $attachment_path);
                if ($stmt->execute()) {
                    echo json_encode(['status' => 'success', 'message' => 'Record added successfully']);
                    $stmt->close();
                    exit();
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to add record.']);
                    $stmt->close();
                    exit();
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to prepare statement.']);
                exit();
            }
        } elseif ($table === "roles") {


            $role = mysqli_real_escape_string($conn, $data['role']);
            $sql = "INSERT INTO roles (role_name) VALUES (?)";
            $stmt = $conn->prepare($sql);

            if ($stmt) {

                $stmt->bind_param('s', $role); // 's' denotes the parameter type as string


                if ($stmt->execute()) {
                    echo json_encode(['status' => 'success', 'message' => 'Record added successfully']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to add record.']);
                }


                $stmt->close();
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to prepare statement.']);
            }
            exit();
        } elseif ($table === "useractivity") {

            $activity = mysqli_real_escape_string($conn, $data['activity']);
            $role = mysqli_real_escape_string($conn, $data['role']);

            $sql = "INSERT INTO useractivity (email, activity_id, role_id) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($sql);

            if ($stmt) {
                $stmt->bind_param('sii', $id, $activity, $role);

                if ($stmt->execute()) {
                    echo json_encode(['status' => 'success', 'message' => 'Record added successfully']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to add record.']);
                }

                $stmt->close();
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to prepare statement.']);
            }
            exit();
        } elseif ($table === "tasks") {


            $task = mysqli_real_escape_string($conn, $data['task']);
            $sql = "INSERT INTO tasks (task_name) VALUES (?)";
            $stmt = $conn->prepare($sql);

            if ($stmt) {

                $stmt->bind_param('s', $task);


                if ($stmt->execute()) {
                    echo json_encode(['status' => 'success', 'message' => 'Record added successfully']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to add record.']);
                }


                $stmt->close();
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to prepare statement.']);
            }
            exit();
        }

        try {
            if ($conn->query($sql) === TRUE) {
                echo json_encode(["status" => "success", "message" => "Record added successfully"]);
            } else {
                throw new Exception($conn->error);
            }
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
        }
    } catch (mysqli_sql_exception $e) {

        if ($e->getCode() === 1062) {
            echo json_encode(["status" => "error", "message" => "Record already exists"]);
        } else {

            echo json_encode(["status" => "error", "message" => "Database error occurred"]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
    }
}




// Read
elseif ($action === 'read') {
    if ($table === 'users') {
        if (isset($_SESSION))

            $sql = "SELECT email, user_name, dbRole FROM users";
    } elseif ($table === 'activites') {
        $sql = "SELECT activity_id,activity_name,description,attachment FROM activities";
    } elseif ($table === 'useractivity') {
        $email = $_GET["id"];
        $stmt = $conn->prepare("SELECT a.activity_name, r.role_name 
                                FROM useractivity ua 
                                JOIN activities a ON ua.activity_id = a.activity_id 
                                JOIN roles r ON ua.role_id = r.role_id 
                                WHERE ua.email = ?");

        if ($stmt) {
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $result = $stmt->get_result();
            $rows = [];

            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $rows[] = $row;
                }
                $stmt->close();

                header('Content-Type: application/json');
                echo json_encode(["status" => "success", "data" => $rows]);
            } else {

                header('Content-Type: application/json');
                echo json_encode(["status" => "success", "data" => []]);
            }
        } else {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Query preparation failed."]);
        }
        exit();
    } elseif ($table === 'activityRole') {
        $id = $_GET["id"];
        $rolesTasks = [];

        // Query all roles
        $roleQuery = $conn->query("SELECT role_name FROM roles");

        while ($roleRow = $roleQuery->fetch_assoc()) {
            $roleName = $roleRow["role_name"];
            $roleTasks = [];
            $taskQuery = $conn->prepare("SELECT t.task_name FROM 
            roletask rt 
            JOIN tasks t ON rt.task_id = t.task_id
            JOIN roles r ON rt.role_id = r.role_id
            WHERE r.role_name = ? AND rt.activity_id = ?");
            $taskQuery->bind_param("si", $roleName, $id);
            $taskQuery->execute();
            $taskResult = $taskQuery->get_result();

            while ($taskRow = $taskResult->fetch_assoc()) {
                $roleTasks[] = $taskRow['task_name'];
            }

            // Add the tasks for the current role to the array
            $rolesTasks[$roleName] = $roleTasks;
        }

        header('Content-Type: application/json');
        echo json_encode(["status" => "success", "data" => $rolesTasks]);
        exit;
    } else {
        $sql = "SELECT * FROM $table";
    }
    $result = $conn->query($sql);

    $rows = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
    }

    header('Content-Type: application/json');
    echo json_encode(["status" => "success", "data" => $rows]);
}

// Update
elseif ($action === 'update') {
    try {
        if ($_SESSION['role'] != 2) {
            header('location: pagenotfound.html');
            exit();
        }

        if ($table === "users") {
            $id = $_GET['id'] ?? '';
            $data = $_POST;

            $role = mysqli_real_escape_string($conn, $data['role']);
            if ($role === "admin") {
                $role = 2;
            } elseif ($role === 'moderator') {
                $role = 1;
            } else {
                $role = 3;
            }

            $email = mysqli_real_escape_string($conn, $data['email']);
            $userName = mysqli_real_escape_string($conn, $data['name']);
            $id = mysqli_real_escape_string($conn, $id);

            $stmt = $conn->prepare("UPDATE users SET email = ?, user_name = ?, dbRole = ? WHERE email = ?");
            if (!$stmt) {
                throw new Exception("Failed to prepare the SQL statement: " . $conn->error);
            }

            $stmt->bind_param('ssss', $email, $userName, $role, $id);
            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Record updated successfully"]);
            } else {
                throw new Exception("Error executing query: " . $stmt->error);
            }
            $stmt->close();
        } elseif ($table === "activities") {
            if ($_SESSION['role'] != 2) {
                header('location: pagenotfound.html');
                exit();
            }

            $id = $_GET['id'] ?? '';
            $data = $_POST;
            $attachment = $_FILES['attachment'];

            $activity = mysqli_real_escape_string($conn, $data['activity']);
            $details = mysqli_real_escape_string($conn, $data['details']);
            $id = mysqli_real_escape_string($conn, $id);

            if (isset($attachment['name']) && $attachment['name']) {
                $target_dir = 'uploads/';
                $attachment_path = $target_dir . basename($attachment['name']);

                if (move_uploaded_file($attachment['tmp_name'], $attachment_path)) {
                    $sql = "UPDATE activities SET activity_name=?, details=?, attachment=? WHERE activity_id=?";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param('sssi', $activity, $details, $attachment_path, $id);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to upload file.']);
                    exit();
                }
            } else {
                $sql = "UPDATE activities SET activity_name=?, details=? WHERE activity_id=?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('ssi', $activity, $details, $id);
            }

            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Record updated successfully"]);
            } else {
                throw new Exception("Error executing query: " . $stmt->error);
            }
            $stmt->close();
        } elseif ($table === "roles") {
            $id = $_GET['id'] ?? '';
            $data = $_POST;
            $name = mysqli_real_escape_string($conn, $data['role']);
            $id = mysqli_real_escape_string($conn, $id);

            $stmt = $conn->prepare("UPDATE roles SET role_name = ? WHERE role_id = ?");
            if (!$stmt) {
                throw new Exception("Failed to prepare the SQL statement: " . $conn->error);
            }

            $stmt->bind_param('si', $name, $id);
            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Record updated successfully"]);
            } else {
                throw new Exception("Error executing query: " . $stmt->error);
            }
            $stmt->close();
        } elseif ($table === "useractivity") {
            $data = $_POST;
            $email = $_REQUEST['id'] ?? '';
            $activityName = $data['activity'] ?? '';
            $role = $data['role'] ?? '';

            $stmt = $conn->prepare("SELECT activity_id FROM activities WHERE activity_name = ?");
            $stmt->bind_param("s", $activityName);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $activity_id = $row['activity_id'];

                $sql = "UPDATE useractivity SET role_id=? WHERE email=? AND activity_id=?";
                $stmt = $conn->prepare($sql);
                if ($stmt) {
                    $stmt->bind_param('sii', $role, $email, $activity_id);
                    if ($stmt->execute()) {
                        echo json_encode(['status' => 'success', 'message' => 'Record updated successfully']);
                    } else {
                        throw new Exception('Failed to execute update query.');
                    }
                    $stmt->close();
                } else {
                    throw new Exception('Failed to prepare statement.');
                }
                exit();
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Activity not found']);
            }
        } elseif ($table === "tasks") {
            if ($_SESSION['role'] != 2) {
                header('location: pagenotfound.html');
                exit();
            }

            $id = $_GET['id'] ?? '';
            $data = $_POST;
            $name = mysqli_real_escape_string($conn, $data['task']);
            $id = mysqli_real_escape_string($conn, $id);

            $stmt = $conn->prepare("UPDATE tasks SET task_name = ? WHERE task_id = ?");
            if (!$stmt) {
                throw new Exception("Failed to prepare the SQL statement: " . $conn->error);
            }

            $stmt->bind_param('si', $name, $id);
            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Record updated successfully"]);
            } else {
                throw new Exception("Error executing query: " . $stmt->error);
            }
            $stmt->close();
        }
    } catch (mysqli_sql_exception $e) {
        if ($e->getCode() === 1062) {
            echo json_encode(["status" => "error", "message" => "Record already exists"]);
        } else {

            echo json_encode(["status" => "error", "message" => "Database error occurred"]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
    }
}

//DELETE
elseif ($action == 'delete') {
    try {
        if ($_SESSION['role'] != 2) {
            header('location: pagenotfound.html');
            exit();
        }
        $id = $_REQUEST['id'] ?? null;




        if ($table == 'users') {
            $idColumn = 'email';
        } elseif ($table == 'activities') {
            $idColumn = 'activity_id';
        } elseif ($table == 'roles') {
            $idColumn = 'role_id';
        } elseif ($table == 'tasks') {
            $idColumn = 'task_id';
        } elseif ($table == 'useractivity') {
            $email = $_REQUEST['id'] ?? '';
            $activityName = $_REQUEST['activity'] ?? '';


            $stmt = $conn->prepare("SELECT activity_id FROM activities WHERE activity_name = ?");
            $stmt->bind_param("s", $activityName);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $activity_id = $row['activity_id'];


                $stmt = $conn->prepare("DELETE FROM useractivity WHERE email = ? AND activity_id = ?");
                $stmt->bind_param("si", $email, $activity_id);
                $stmt->execute();

                if ($stmt->affected_rows > 0) {
                    echo json_encode(["status" => "success", "message" => "Record deleted successfully"]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Record not found or not deleted "]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => "Activity not found"]);
            }
            exit;
        } elseif ($table == 'roletask') {
            $activity = $_REQUEST['id'] ?? '';
            $roleName = $_REQUEST['role'] ?? '';


            $stmt = $conn->prepare("SELECT role_id FROM roles WHERE role_name = ?");
            $stmt->bind_param("s", $roleName);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $role_id = $row['role_id'];


                $stmt = $conn->prepare("DELETE FROM roletask WHERE activity_id = ? AND role_id = ?");
                $stmt->bind_param("ii", $activity, $role_id);
                $stmt->execute();

                if ($stmt->affected_rows > 0) {
                    echo json_encode(["status" => "success", "message" => "Record deleted successfully"]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Record not found or not deleted "]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => "Activity not found"]);
            }
            exit;
        }


        $stmt = $conn->prepare("DELETE FROM `$table` WHERE `$idColumn` = ?");
        if ($table === 'users') {
            $stmt->bind_param('s', $id);
        } else {
            $stmt->bind_param('i', $id);
        }

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Record deleted successfully."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Error: " . $stmt->error]);
        }
        $stmt->close();
    } catch (Exception $e) {
        echo json_encode(["status" => "error", 'message' => "Database error"]);
    }
}

// GET OBJECT
else if ($action == 'getObj') {
    if ($table === "users") {
        $id = $_GET['id'] ?? '';


        $id = mysqli_real_escape_string($conn, $id);

        try {
            $stmt = $conn->prepare("SELECT user_name FROM users WHERE email = ?");
            if ($stmt === false) {
                throw new Exception('Invalid prepare statement: ' . $conn->error);
            }

            $stmt->bind_param('s', $id);
            if (!$stmt->execute()) {
                throw new Exception('Execute failed: ' . $stmt->error);
            }

            $result = $stmt->get_result();
            if ($result === false) {
                throw new Exception('Get result failed: ' . $stmt->error);
            }

            $data = $result->fetch_assoc();
            if ($data === null) {
                throw new Exception('No record found for the given ID');
            }

            header('Content-Type: application/json');
            echo json_encode(["status" => "success", "data" => $data]);

            $stmt->close();
        } catch (Exception $e) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } elseif ($table === "activities") {
        $id = $_GET['id'] ?? '';


        $id = mysqli_real_escape_string($conn, $id);

        try {
            $stmt = $conn->prepare("SELECT activity_name, details, attachment FROM activities WHERE activity_id = ?");
            if ($stmt === false) {
                throw new Exception('Invalid prepare statement: ' . $conn->error);
            }

            $stmt->bind_param('i', $id);
            if (!$stmt->execute()) {
                throw new Exception('Execute failed: ' . $stmt->error);
            }

            $result = $stmt->get_result();
            if ($result === false) {
                throw new Exception('Get result failed: ' . $stmt->error);
            }

            $data = $result->fetch_assoc();
            if ($data === null) {
                throw new Exception('No record found for the given ID');
            }

            header('Content-Type: application/json');
            echo json_encode(["status" => "success", "data" => $data]);

            $stmt->close();
        } catch (Exception $e) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } elseif ($table === "roles") {
        $id = $_GET['id'] ?? '';


        $id = mysqli_real_escape_string($conn, $id);

        try {
            $stmt = $conn->prepare("SELECT role_name FROM roles WHERE role_id = ?");
            if ($stmt === false) {
                throw new Exception('Invalid prepare statement: ' . $conn->error);
            }

            $stmt->bind_param('i', $id);
            if (!$stmt->execute()) {
                throw new Exception('Execute failed: ' . $stmt->error);
            }

            $result = $stmt->get_result();
            if ($result === false) {
                throw new Exception('Get result failed: ' . $stmt->error);
            }

            $data = $result->fetch_assoc();
            if ($data === null) {
                throw new Exception('No record found for the given ID');
            }

            header('Content-Type: application/json');
            echo json_encode(["status" => "success", "data" => $data]);

            $stmt->close();
        } catch (Exception $e) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } elseif ($table === "tasks") {
        $id = $_GET['id'] ?? '';


        $id = mysqli_real_escape_string($conn, $id);

        try {
            $stmt = $conn->prepare("SELECT task_name FROM tasks WHERE task_id = ?");
            if ($stmt === false) {
                throw new Exception('Invalid prepare statement: ' . $conn->error);
            }

            $stmt->bind_param('i', $id);
            if (!$stmt->execute()) {
                throw new Exception('Execute failed: ' . $stmt->error);
            }

            $result = $stmt->get_result();
            if ($result === false) {
                throw new Exception('Get result failed: ' . $stmt->error);
            }

            $data = $result->fetch_assoc();
            if ($data === null) {
                throw new Exception('No record found for the given ID');
            }

            header('Content-Type: application/json');
            echo json_encode(["status" => "success", "data" => $data]);

            $stmt->close();
        } catch (Exception $e) {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } elseif ($table === "useractivity") {
        $id = $_GET['id'] ?? '';
        $activityName = $_REQUEST['activity'] ?? '';

        // Escape inputs to prevent SQL injection
        $id = mysqli_real_escape_string($conn, $id);

        if (empty($activityName)) {
            echo json_encode(["status" => "error", "message" => "Activity name is required"]);
            exit;
        }

        try {
            // Get the activity_id based on the activity name
            $stmt = $conn->prepare("SELECT activity_id FROM activities WHERE activity_name = ?");
            if ($stmt === false) {
                throw new Exception('Failed to prepare statement');
            }
            $stmt->bind_param("s", $activityName);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $activity_id = $row['activity_id'];

                // Get the role name based on the email and activity_id
                $stmt = $conn->prepare("SELECT r.role_name FROM useractivity ua JOIN roles r ON ua.role_id = r.role_id WHERE email = ? AND activity_id = ?");
                if ($stmt === false) {
                    throw new Exception('Failed to prepare statement');
                }

                $stmt->bind_param('si', $id, $activity_id);
                if (!$stmt->execute()) {
                    throw new Exception('Failed to execute statement');
                }

                $result = $stmt->get_result();
                if ($result->num_rows === 0) {
                    throw new Exception('No record found for the given ID and activity');
                }

                $data = $result->fetch_assoc();

                // Return success response
                echo json_encode(["status" => "success", "data" => $data]);

                $stmt->close();
            } else {
                // Activity not found
                echo json_encode(["status" => "error", "message" => "Activity not found"]);
            }
        } catch (Exception $e) {
            // Return error response
            echo json_encode(["status" => "error", "message" => "An error occurred: " . $e->getMessage()]);
        }
    } elseif ($table === "roletask") {
        $id = $_GET['id'] ?? '';
        $roleName = $_REQUEST['role'] ?? '';

        $id = mysqli_real_escape_string($conn, $id);

        if (empty($roleName)) {
            echo json_encode(["status" => "error", "message" => "Role name is required"]);
            exit;
        }

        try {

            $stmt = $conn->prepare("SELECT role_id FROM roles WHERE role_name = ?");
            if ($stmt === false) {
                throw new Exception('Failed to prepare statement');
            }
            $stmt->bind_param("s", $roleName);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $role_id = $row['role_id'];

                $stmt = $conn->prepare("SELECT t.task_name FROM roletask rt JOIN tasks t ON rt.task_id = t.task_id WHERE activity_id = ? AND role_id = ?");
                if ($stmt === false) {
                    throw new Exception('Failed to prepare statement');
                }

                $stmt->bind_param('ii', $id, $role_id);
                if (!$stmt->execute()) {
                    throw new Exception('Failed to execute statement');
                }

                $result = $stmt->get_result();
                if ($result->num_rows === 0) {
                    throw new Exception('No record found for the given ID and activity');
                }

                $data = $result->fetch_assoc();


                echo json_encode(["status" => "success", "data" => $data]);

                $stmt->close();
            } else {

                echo json_encode(["status" => "error", "message" => "Activity not found"]);
            }
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => "An error occurred: " . $e->getMessage()]);
        }
    }
}

//rP
else if ($action == 'resetPasswd') {
    $id = $_GET['id'] ?? '';


    $id = mysqli_real_escape_string($conn, $id);
    $password = password_hash('aitstaff', PASSWORD_DEFAULT);
    try {
        $stmt = $conn->prepare("UPDATE users SET password=?  WHERE email = ?");
        if ($stmt === false) {
            throw new Exception('Invalid prepare statement: ' . $conn->error);
        }

        $stmt->bind_param('ss', $password, $id);
        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Record updated successfully"]);
        } else {
            throw new Exception("Error executing query: " . $stmt->error);
        }


        $stmt->close();
    } catch (Exception $e) {
        header('Content-Type: application/json');
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} elseif ($action === "logout") {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    $_SESSION = array();

    session_destroy();

    header('Location: login.php');
    exit();
} elseif ($action === "changePasswd") {
    if (!isset($_SESSION['user'])) {
        header('Location: login.php');
        exit();
    } else {
        $id = $_SESSION['user'];
        $oldPasswd = $_POST['currentPassword'];
        $newPasswd = $_POST['newPassword'];

        $stmt = $conn->prepare('SELECT password FROM users WHERE email = ?');
        $stmt->bind_param('s', $id);
        $stmt->execute();
        $stmt->bind_result($hashedPasswd);
        $stmt->fetch();
        $stmt->close();

        if (password_verify($oldPasswd, $hashedPasswd)) {
            $newHashedPasswd = password_hash($newPasswd, PASSWORD_DEFAULT);

            try {
                $stmt = $conn->prepare('UPDATE users SET password = ? WHERE email = ?');
                $stmt->bind_param('ss', $newHashedPasswd, $id);

                if ($stmt->execute()) {
                    session_destroy();
                    header('Content-Type: application/json');
                    echo json_encode(["status" => "success", "message" => "Password updated successfully"]);
                    exit();
                } else {
                    throw new Exception("Error executing query: " . $stmt->error);
                }

                $stmt->close();
            } catch (Exception $e) {
                header('Content-Type: application/json');
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        } else {
            header('Content-Type: application/json');
            echo json_encode(["status" => "error", "message" => "Old password is incorrect"]);
        }
    }
} elseif ($action === 'createOupdate') {
    try {

        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['role']) && isset($data['tasks']) && isset($data['id'])) {
            $role = $data['role'];
            $tasks = $data['tasks'];
            $id = $data['id'];




            $response = ['status' => 'success', 'message' => 'Tasks assigned to role successfully!'];

            foreach ($tasks as $task) {
                // Prepare and execute the task query
                $taskQuery = $conn->prepare("SELECT task_id FROM tasks WHERE task_name = ? ");
                $taskQuery->bind_param("s", $task);
                $taskQuery->execute();
                $result = $taskQuery->get_result();

                if ($result->num_rows == 0) {
                    // Task not found, insert it
                    $insertTaskQuery = $conn->prepare("INSERT INTO tasks (task_name) VALUES (?)");
                    $insertTaskQuery->bind_param("s", $task);
                    $insertTaskQuery->execute();
                    $taskId = $insertTaskQuery->insert_id;
                    $insertTaskQuery->close();
                } else {
                    $row = $result->fetch_assoc();
                    $taskId = $row['task_id'];
                }

                $stmt = $conn->prepare("INSERT INTO roletask (role_id, task_id,activity_id) VALUES (?, ?,?)");
                if ($stmt === false) {
                    $response = ['status' => 'error', 'message' => 'Error preparing SQL statement for roletask.'];
                    header('Content-Type: application/json');
                    echo json_encode($response);
                    exit;
                }

                $stmt->bind_param("iii", $role, $taskId, $id);
                if (!$stmt->execute()) {
                    $response = ['status' => 'error', 'message' => 'Error executing SQL statement for roletask: ' . $stmt->error];
                    header('Content-Type: application/json');
                    echo json_encode($response);
                    exit;
                }

                $stmt->close();
            }
        } else {
            $response = ['status' => 'error', 'message' => 'Invalid input.'];
        }

        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    } catch (mysqli_sql_exception $e) {

        if ($e->getCode() === 1062) {
            echo json_encode(["status" => "error", "message" => "Record already exists"]);
        } else {

            echo json_encode(["status" => "error", "message" => "Database error occurred"]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
    }
} else {
    $response = ['status' => 'error', 'message' => 'Invalid action.'];
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}


$conn->close();
