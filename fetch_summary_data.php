<?php
header('Content-Type: application/json');
session_start();

// Ensure the user has moderator privileges
if (!isset($_SESSION['user']) || $_SESSION['role'] != 1) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

require_once 'db.php';

try {
    // Fetch total report counts (total, with start_date set, without start_date set)
    $totalReportsQuery = "
        SELECT 
            (SELECT COUNT(*) FROM reports) AS total,
            (SELECT COUNT(*) FROM reports WHERE start_date IS NOT NULL) AS withStartDate,
            (SELECT COUNT(*) FROM reports WHERE start_date IS NULL) AS withoutStartDate
    ";
    $result = $conn->query($totalReportsQuery);
    $totalReports = $result->fetch_assoc();

    // Fetch activity report counts
    $activitiesQuery = "
        SELECT a.activity_name AS label, COUNT(rt.report_task_id) AS data 
        FROM activities a
        LEFT JOIN reporttasks rt ON a.activity_id = rt.activity_id
        GROUP BY a.activity_id
    ";
    $activitiesResult = $conn->query($activitiesQuery);
    $activities = ['labels' => [], 'data' => []];
    while ($row = $activitiesResult->fetch_assoc()) {
        $activities['labels'][] = $row['label'];
        $activities['data'][] = $row['data'];
    }

    // Fetch monthly report submissions
    $monthlyQuery = "
        SELECT MONTHNAME(created_at) AS label, COUNT(report_id) AS data 
        FROM reports 
        GROUP BY YEAR(created_at), MONTH(created_at)
        ORDER BY YEAR(created_at), MONTH(created_at)
    ";
    $monthlyResult = $conn->query($monthlyQuery);
    $monthly = ['labels' => [], 'data' => []];
    while ($row = $monthlyResult->fetch_assoc()) {
        $monthly['labels'][] = $row['label'];
        $monthly['data'][] = $row['data'];
    }

    // Fetch user contributions
    $usersQuery = "
        SELECT u.user_name AS label, COUNT(r.report_id) AS data 
        FROM users u
        LEFT JOIN reports r ON u.email = r.email
        GROUP BY u.email
    ";
    $usersResult = $conn->query($usersQuery);
    $users = ['labels' => [], 'data' => []];
    while ($row = $usersResult->fetch_assoc()) {
        $users['labels'][] = $row['label'];
        $users['data'][] = $row['data'];
    }

    // Combine data
    $data = [
        'totalReports' => [
            (int) $totalReports['total'], 
            (int) $totalReports['withStartDate'], 
            (int) $totalReports['withoutStartDate']
        ],
        'activities' => $activities,
        'monthly' => $monthly,
        'users' => $users,
    ];

    echo json_encode($data);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
