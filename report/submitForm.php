<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit();
} else {
    $email = $_SESSION['user'];
}


include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn->begin_transaction();

    try {
        $startDate = $_POST['start_date'];
        $endDate = $_POST['end_date'];
        $activities = $_POST['activities'];

        // Validate start and end dates
        if (strtotime($startDate) > strtotime($endDate)) {
            throw new Exception("Start date cannot be later than the end date.");
        }

        $stmt = $conn->prepare("INSERT INTO reports (start_date, end_date, email) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $startDate, $endDate, $email);
        $stmt->execute();
        $reportId = $stmt->insert_id;

        foreach ($activities as $index => $activity) {
            $activityId = $activity['activity'];
            $taskIds = $activity['tasks'] ?? [];
            $details = $activity['details'] ?? '';
            $attachment = $_FILES['activities']['name'][$index]['attachment'] ?? null;
            $otherTasks = $activity['other_task'] ?? [];

            if (!empty($otherTasks) && is_array($otherTasks)) {
                foreach ($otherTasks as $otherTask) {
                    if (!empty($otherTask)) {
                        // Check if the task already exists
                        $stmt = $conn->prepare("SELECT task_id FROM tasks WHERE task_name = ?");
                        $stmt->bind_param("s", $otherTask);
                        $stmt->execute();
                        $stmt->bind_result($existingTaskId);
                        $stmt->fetch();
                        $stmt->close();

                        if ($existingTaskId) {
                            // Task already exists, use existing ID
                            $taskIds[] = $existingTaskId;
                        } else {
                            // Task does not exist, insert new task
                            $stmt = $conn->prepare("INSERT INTO tasks (task_name) VALUES (?)");
                            $stmt->bind_param("s", $otherTask);
                            $stmt->execute();
                            $taskIds[] = $stmt->insert_id;
                        }
                    }
                }
            }

            // Insert into reporttasks
            foreach ($taskIds as $taskId) {
                $stmt = $conn->prepare("INSERT INTO reporttasks (report_id, activity_id, task_id) VALUES (?, ?, ?)");
                $stmt->bind_param("iii", $reportId, $activityId, $taskId);
                $stmt->execute();
            }

            // Handle details
            if (!empty($details)) {
                $stmt = $conn->prepare("UPDATE reports SET description = ? WHERE report_id = ?");
                $stmt->bind_param("si", $details, $reportId);
                $stmt->execute();
            }

            // Handle file uploads
            if ($attachment && $_FILES['activities']['size'][$index]['attachment'] > 0) {
                $uploadDir = 'uploads/';
                $uploadFile = $uploadDir . basename($_FILES['activities']['name'][$index]['attachment']);

                if (move_uploaded_file($_FILES['activities']['tmp_name'][$index]['attachment'], $uploadFile)) {
                    $stmt = $conn->prepare("UPDATE reports SET attachment = ? WHERE report_id = ?");
                    $stmt->bind_param("si", $uploadFile, $reportId);
                    $stmt->execute();
                } else {
                    throw new Exception("Failed to upload attachment.");
                }
            }
        }

        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Report submitted successfully"]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["status" => "Failed", "message" => $e->getMessage()]);
    }
}
