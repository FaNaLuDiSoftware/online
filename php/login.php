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

// Busca el usuario en la base de datos
$stmt = $conn->prepare("SELECT password FROM register_user WHERE user = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
	echo json_encode(["error" => "Usuario no encontrado"]);
	$stmt->close();
	$conn->close();
	exit;
}

$stmt->bind_result($hashed_password);
$stmt->fetch();
$stmt->close();

// Verifica la contraseña
if (password_verify($password, $hashed_password)) {
	echo json_encode(["message" => "Inicio de sesión exitoso"]);
} else {
	echo json_encode(["error" => "Contraseña incorrecta"]);
}
$conn->close();
