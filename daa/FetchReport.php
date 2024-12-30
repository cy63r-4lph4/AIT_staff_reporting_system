<?php
include 'db.php';

header('Content-Type: application/json');

if ($conn->connect_error) {
    die(json_encode(array("status" => "error", "message" => "Connection failed: " . $conn->connect_error)));
}

$response = array("status" => "error", "message" => "Invalid request");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $report_type = $_POST['report_type'];

    $filters = [
        'start_date' => $_POST['start_date'] ?? null,
        'end_date' => $_POST['end_date'] ?? null,
        'activity_ids' => $_POST['activity_ids'] ?? null, // Array of activity IDs
        'user_emails' => $_POST['user_emails'] ?? null  // Array of user emails
    ];

    $response = generateReport($conn, $report_type, $filters);
    echo json_encode($response);
}

$conn->close();

function generateReport($conn, $report_type, $filters)
{
    switch ($report_type) {
        case 'weekly':
            if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
                $result = generateWeeklyReport($conn, $filters);
                return array("status" => "success", "data" => fetchResultAsArray($result));
            } else {
                return array("status" => "error", "message" => "Please fill in both start and end dates.");
            }

        case 'activity':
            if (!empty($filters['activity_ids'])) {
                $result = generateActivityReport($conn, $filters);
                return array("status" => "success", "data" => fetchResultAsArray($result));
            } else {
                return array("status" => "error", "message" => "Please provide at least one activity.");
            }

        case 'monthly':
            if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
                $result = generateMonthlyReport($conn, $filters);
                return array("status" => "success", "data" => fetchResultAsArray($result));
            } else {
                return array("status" => "error", "message" => "Invalid date range.");
            }

        case 'user':
            if (!empty($filters['user_emails'])) {
                $result = generateUserReport($conn, $filters);
                return array("status" => "success", "data" => fetchResultAsArray($result));
            } else {
                return array("status" => "error", "message" => "Please provide at least one user email.");
            }

        default:
            return array("status" => "error", "message" => "Invalid report type.");
    }
}

function generateWeeklyReport($conn, $filters)
{
    $sql = "SELECT 
                r.start_date, 
                r.end_date, 
                u.user_name, 
                a.activity_name,
                GROUP_CONCAT(t.task_name SEPARATOR ', ') AS tasks, 
                r.description, 
                r.attachment
            FROM reports r
            JOIN users u ON r.email = u.email
            JOIN reporttasks rt ON r.report_id = rt.report_id
            JOIN activities a ON rt.activity_id = a.activity_id
            JOIN tasks t ON rt.task_id = t.task_id
            WHERE r.start_date >= ? AND r.end_date <= ?";

    $params = ["ss", $filters['start_date'], $filters['end_date']];

    if (!empty($filters['user_emails'])) {
        $placeholders = implode(",", array_fill(0, count($filters['user_emails']), "?"));
        $sql .= " AND r.email IN ($placeholders)";
        $params[0] .= str_repeat("s", count($filters['user_emails']));
        $params = array_merge($params, $filters['user_emails']);
    }

    if (!empty($filters['activity_ids'])) {
        $placeholders = implode(",", array_fill(0, count($filters['activity_ids']), "?"));
        $sql .= " AND a.activity_id IN ($placeholders)";
        $params[0] .= str_repeat("i", count($filters['activity_ids']));
        $params = array_merge($params, $filters['activity_ids']);
    }

    $sql .= " GROUP BY r.report_id, r.start_date, r.end_date, u.user_name, a.activity_name, r.description, r.attachment";

    return executeQuery($conn, $sql, $params);
}

function generateActivityReport($conn, $filters)
{
    $sql = "SELECT 
                r.start_date, 
                r.end_date, 
                u.user_name, 
                GROUP_CONCAT(t.task_name SEPARATOR ', ') AS tasks, 
                r.description, 
                r.attachment
            FROM reports r
            JOIN users u ON r.email = u.email
            JOIN reporttasks rt ON r.report_id = rt.report_id
            JOIN activities a ON rt.activity_id = a.activity_id
            JOIN tasks t ON rt.task_id = t.task_id
            WHERE a.activity_id IN (" . implode(",", array_fill(0, count($filters['activity_ids']), "?")) . ")
            GROUP BY r.report_id, r.start_date, r.end_date, u.user_name, r.description, r.attachment";

    return executeQuery($conn, $sql, array_merge([str_repeat("i", count($filters['activity_ids']))], $filters['activity_ids']));
}

function generateMonthlyReport($conn, $filters)
{
    $sql = "SELECT 
                r.start_date, 
                r.end_date, 
                u.user_name, 
                a.activity_name, 
                GROUP_CONCAT(t.task_name SEPARATOR ', ') AS tasks, 
                r.description, 
                r.attachment
            FROM reports r
            JOIN users u ON r.email = u.email
            JOIN reporttasks rt ON r.report_id = rt.report_id
            JOIN activities a ON rt.activity_id = a.activity_id
            JOIN tasks t ON rt.task_id = t.task_id
            WHERE r.start_date >= ? AND r.end_date <= ?";

    $params = ["ss", $filters['start_date'], $filters['end_date']];

    if (!empty($filters['user_emails'])) {
        $placeholders = implode(",", array_fill(0, count($filters['user_emails']), "?"));
        $sql .= " AND r.email IN ($placeholders)";
        $params[0] .= str_repeat("s", count($filters['user_emails']));
        $params = array_merge($params, $filters['user_emails']);
    }

    if (!empty($filters['activity_ids'])) {
        $placeholders = implode(",", array_fill(0, count($filters['activity_ids']), "?"));
        $sql .= " AND a.activity_id IN ($placeholders)";
        $params[0] .= str_repeat("i", count($filters['activity_ids']));
        $params = array_merge($params, $filters['activity_ids']);
    }

    $sql .= " GROUP BY r.report_id, r.start_date, r.end_date, u.user_name, a.activity_name, r.description, r.attachment";

    return executeQuery($conn, $sql, $params);
}

function generateUserReport($conn, $filters)
{
    $sql = "SELECT 
                r.start_date, 
                r.end_date, 
                a.activity_name, 
                GROUP_CONCAT(t.task_name SEPARATOR ', ') AS tasks, 
                r.description, 
                r.attachment
            FROM reports r
            JOIN users u ON r.email = u.email
            JOIN reporttasks rt ON r.report_id = rt.report_id
            JOIN activities a ON rt.activity_id = a.activity_id
            JOIN tasks t ON rt.task_id = t.task_id
            WHERE r.email IN (" . implode(",", array_fill(0, count($filters['user_emails']), "?")) . ")
            GROUP BY r.report_id, r.start_date, r.end_date, a.activity_name, r.description, r.attachment";

    return executeQuery($conn, $sql, array_merge([str_repeat("s", count($filters['user_emails']))], $filters['user_emails']));
}
function executeQuery($conn, $sql, $params)
{
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        die('Prepare failed: ' . htmlspecialchars($conn->error));
    }

    if (!empty($params)) {
        $stmt->bind_param(...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();

    return $result;
}