<?php
include 'db.php';

header('Content-Type: application/json');

if ($conn->connect_error) {
    die(json_encode(array("status" => "error", "message" => "Connection failed: " . $conn->connect_error)));
}

$response = array("status" => "error", "message" => "Invalid request");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $report_type = $_POST['report_type'];

    if (isset($_POST['download_csv'])) {
        $result = generateReport($conn, $report_type, true);
        if ($result) {
            generateCSV($result, $report_type);
        }
    } else {
        $response = generateReport($conn, $report_type);
        echo json_encode($response);
    }
}

$conn->close();

function generateReport($conn, $report_type, $csv = false)
{
    switch ($report_type) {
        case 'weekly':
            $start_date = $_POST['start_date'];
            $end_date = $_POST['end_date'];
            if (!empty($start_date) && !empty($end_date)) {
                $result = generateWeeklyReport($conn, $start_date, $end_date);
                return $csv ? fetchResultAsArray($result) : array("status" => "success", "data" => fetchResultAsArray($result));
            } else {
                return array("status" => "error", "message" => "Please fill in both start and end dates.");
            }

        case 'activity':
            $activity = $_POST['activity'];
            if (!empty($activity)) {
                $result = generateActivityReport($conn, $activity);
                return $csv ? fetchResultAsArray($result) : array("status" => "success", "data" => fetchResultAsArray($result));
            } else {
                return array("status" => "error", "message" => "Please provide activity.");
            }

        case 'monthly':
            $month = isset($_POST['month']) ? (int)$_POST['month'] : null;
            $year = isset($_POST['year']) ? (int)$_POST['year'] : null;
            if ($month >= 1 && $month <= 12 && $year >= 2023 && $year <= 2099) {
                $result = generateMonthlyReport($conn, $month, $year);
                return $csv ? fetchResultAsArray($result) : array("status" => "success", "data" => fetchResultAsArray($result));
            } else {
                return array("status" => "error", "message" => "Invalid month or year.");
            }

        case 'user':
            $user_name = $_POST['name'];
            if (!empty($user_name)) {
                $result = generateUserReport($conn, $user_name);
                return $csv ? fetchResultAsArray($result) : array("status" => "success", "data" => fetchResultAsArray($result));
            } else {
                return array("status" => "error", "message" => "Please provide the user name.");
            }

        default:
            return array("status" => "error", "message" => "Invalid report type.");
    }
}

function generateCSV($data, $reportType)
{
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $reportType . '_report.csv";');

    $output = fopen('php://output', 'w');
    if (!empty($data)) {
        fputcsv($output, array_keys($data[0])); // Add headers
        foreach ($data as $row) {
            fputcsv($output, $row);
        }
    }
    fclose($output);
    exit;
}
function generateWeeklyReport($conn, $start_date, $end_date)
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
            WHERE r.start_date >= ? AND r.end_date <= ?
            GROUP BY r.report_id, r.start_date, r.end_date, u.user_name, a.activity_name, r.description, r.attachment";

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        die('Prepare failed: ' . htmlspecialchars($conn->error));
    }

    $stmt->bind_param("ss", $start_date, $end_date);
    $stmt->execute();

    $result = $stmt->get_result();
    $stmt->close();

    return $result;
}

function generateActivityReport($conn, $id)
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
            WHERE a.activity_id = ?
            GROUP BY r.report_id, r.start_date, r.end_date, u.user_name, r.description, r.attachment";

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        die('Prepare failed: ' . htmlspecialchars($conn->error));
    }

    $stmt->bind_param("i", $id);
    $stmt->execute();

    $result = $stmt->get_result();
    $stmt->close();

    return $result;
}

function generateMonthlyReport($conn, $month, $year)
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
            WHERE YEAR(r.start_date) = ? AND MONTH(r.start_date) = ?
            GROUP BY r.report_id, r.start_date, r.end_date, u.user_name, a.activity_name, r.description, r.attachment";

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        die('Prepare failed: ' . htmlspecialchars($conn->error));
    }

    $stmt->bind_param("ii", $year, $month);
    $stmt->execute();

    $result = $stmt->get_result();
    $stmt->close();

    return $result;
}


function generateUserReport($conn, $user_name)
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
            WHERE u.email = ?
            GROUP BY r.report_id, r.start_date, r.end_date, u.user_name, a.activity_name, r.description, r.attachment";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $user_name);
    $stmt->execute();
    return $stmt->get_result();
}




function fetchResultAsArray($result)
{
    $data = array();
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    return $data;
}
