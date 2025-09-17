<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

// Configuración de la base de datos
$host = "localhost";
$user = "root";
$pass = "";
$db = "usuarios_registrados_bd";

// Recibe los datos enviados por POST (JSON)
$data = json_decode(file_get_contents("php://input"), true);
$username = $data["username"] ?? "";
$password = $data["password"] ?? "";
$score = $data["score"] ?? 0;
$money = $data["money"] ?? 0;

// Validación básica
if (empty($username) || empty($password)) {
    echo json_encode(["error" => "Usuario y contraseña requeridos"]);
    exit;
}

// Conexión a la base de datos
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}

// Verifica si el usuario ya existe
$stmt = $conn->prepare("SELECT id_user FROM register_user WHERE user = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["error" => "El usuario ya existe"]);
    $stmt->close();
    $conn->close();
    exit;
}
$stmt->close();

// Encripta la contraseña
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insertarta nombre, contraseña, score y money en la base de datos
$stmt = $conn->prepare("INSERT INTO register_user (user, password, score, money) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssii", $username, $hashed_password, $score, $money);
if ($stmt->execute()) {
    echo json_encode(["message" => "Usuario registrado exitosamente"]);
} else {
    echo json_encode(["error" => "Error al registrar usuario"]);
}
$stmt->close();
$conn->close();
?>