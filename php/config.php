<?php
// Configuración central de la base de datos (MariaDB/MySQL)
$DB_HOST = "127.0.0.1";          // si PHP y MariaDB corren en el mismo server
$DB_USER = "fanaludi";           // usuario MariaDB que creaste
$DB_PASS = "PescadoRabioso96.";  // contraseña de ese usuario
$DB_NAME = "usuarios_registrados_bd";
$DB_PORT = 3306;                 // puerto por defecto

// Conexión
$conn = @new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);
if ($conn->connect_error) {
    http_response_code(500);
    die("Error de conexión a la base de datos: " . htmlspecialchars($conn->connect_error));
}
$conn->set_charset("utf8mb4");
?>
