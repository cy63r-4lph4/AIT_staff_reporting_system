<?php
include 'db.php';
session_start();

if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit();
} else {
    $id = $_SESSION['user'];
    $act = $_REQUEST['a'] ?? "";
    $user = $_REQUEST['r'] ?? "";

    try {
        if ($act == "getDet") {
            $stmt = $conn->prepare('SELECT user_name FROM users WHERE email = ?');

            if ($stmt) {
                $stmt->bind_param('s', $id);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows > 0) {
                    $user_data = $result->fetch_assoc();
                    echo json_encode($user_data);
                } else {
                    echo json_encode(['error' => 'No user found']);
                }

                $stmt->close();
            } else {
                echo json_encode(['error' => 'Failed to prepare statement']);
            }
        } elseif ($act === 'getActivities') {
            $stmt = $conn->prepare('SELECT ua.activity_id, a.activity_name FROM useractivity ua JOIN activities a ON ua.activity_id = a.activity_id WHERE ua.email = ?');

            if ($stmt) {
                if ($user != '') {
                    $stmt->bind_param('s', $user);
    
                } else {
                $stmt->bind_param('s', $id);
                }
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows > 0) {
                    $activities = [];
                    while ($row = $result->fetch_assoc()) {
                        $activities[] = $row;
                    }
                    echo json_encode($activities);
                } else {
                    echo json_encode(['error' => 'No activity found']);
                }

                $stmt->close();
            } else {
                echo json_encode(['error' => 'Failed to prepare statement']);
            }
        } elseif ($act === 'getTasks') {
            $activity_id = $_GET['activity_id'] ?? '';
            if (empty($activity_id)) {
                echo json_encode(['error' => 'Activity ID is required']);
                exit();
            }

            $userRole = '';

            $stmt = $conn->prepare('SELECT role_id FROM useractivity WHERE email = ? AND activity_id = ?');
            if ($stmt) {
                $stmt->bind_param('si', $id, $activity_id);
                $stmt->execute();
                $stmt->bind_result($userRole);
                $stmt->fetch();
                $stmt->close();

                if (empty($userRole)) {
                    echo json_encode(['error' => 'No role found for the user']);
                    exit();
                }

                $stmt = $conn->prepare('SELECT t.task_id, t.task_name FROM roletask rt JOIN tasks t ON rt.task_id = t.task_id WHERE rt.activity_id = ? AND rt.role_id = ?');
                if ($stmt) {
                    $stmt->bind_param('ii', $activity_id, $userRole);
                    $stmt->execute();
                    $result = $stmt->get_result();

                    if ($result->num_rows > 0) {
                        $tasks = [];
                        while ($row = $result->fetch_assoc()) {
                            $tasks[] = $row;
                        }
                        echo json_encode($tasks);
                    } else {
                        echo json_encode([]);
                    }

                    $stmt->close();
                } else {
                    echo json_encode(['error' => 'Failed to prepare statement']);
                }
            } else {
                echo json_encode(['error' => 'Failed to prepare statement']);
            }
        } elseif ($act === 'getReport') {
            $stmt = $conn->prepare(
                'SELECT 
                    r.report_id, 
                    r.start_date, 
                    r.end_date, 
                    a.activity_name,
                    r.description,
                    r.attachment, 
                    GROUP_CONCAT(t.task_name ORDER BY t.task_name SEPARATOR ", ") AS tasks
                 FROM 
                    reports r 
                    JOIN reporttasks rt ON r.report_id = rt.report_id
                    JOIN activities a ON a.activity_id = rt.activity_id
                    JOIN tasks t ON t.task_id = rt.task_id
                 WHERE 
                    r.email = ?
                 GROUP BY 
                    r.report_id, a.activity_name, r.start_date, r.end_date'
            );

            if ($stmt) {
                $stmt->bind_param('s', $id);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows > 0) {
                    $data = [];
                    while ($row = $result->fetch_assoc()) {
                        $data[] = $row;
                    }
                    echo json_encode($data);
                } else {
                    echo json_encode([]);
                }

                $stmt->close();
            } else {
                echo json_encode(['error' => 'Failed to prepare statement']);
            }
        } elseif ($act === 'deleteReport') {
            $reportId = $_GET['report_id'] ?? '';

            if (empty($reportId)) {
                echo json_encode(['error' => 'Report ID is required']);
                exit();
            }

            // Start transaction
            $conn->begin_transaction();

            try {
                $stmt = $conn->prepare("DELETE FROM reports WHERE report_id = ?");
                $stmt->bind_param('i', $reportId);
                $stmt->execute();
                $stmt->close();


                $conn->commit();
                echo json_encode(["status" => "success", "message" => "Report deleted successfully"]);
            } catch (Exception $e) {
                $conn->rollback();
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        } elseif ($act === 'myAct') {
            $stmt = $conn->prepare(
                'SELECT a.activity_name, r.role_name 
                FROM useractivity ua
                JOIN activities a ON ua.activity_id = a.activity_id
                JOIN roles r ON ua.role_id = r.role_id
                WHERE ua.email = ?'
            );

            if ($stmt) {
                $stmt->bind_param('s', $id);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows > 0) {
                    $data = [];
                    while ($row = $result->fetch_assoc()) {
                        $data[] = $row;
                    }
                    echo json_encode($data);
                } else {
                    echo json_encode([]);
                }

                $stmt->close();
            } else {
                echo json_encode(['error' => 'Failed to prepare statement']);
            }
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
    }
}
