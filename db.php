<?php
/* =========================================================
   ZYVRA SALES DB CONNECTION
   File: db.php
   ========================================================= */

$host = "localhost";
$dbname = "zyvra_sales_db";
$username = "root";        // เปลี่ยนตามเครื่องคุณ
$password = "";            // XAMPP ปกติว่าง, ถ้ามีรหัสให้ใส่

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    die(json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $e->getMessage()
    ]));
}
?>