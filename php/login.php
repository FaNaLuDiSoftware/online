<?php

require_once __DIR__ . "/config.php";


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");


// Recibe los datos enviados por POST (JSON)
$data = json_decode(file_get_contents("php://input"), true);
$username = $data["username"] ?? "";
$password = $data["password"] ?? "";

// Validación básica
if (empty($username) || empty($password)) {
	http_response_code(400); // Bad Request
	echo json_encode(["error" => "Usuario y contraseña requeridos"]);
	exit;
}


// Busca el usuario en la base de datos
$stmt = $conn->prepare("SELECT password FROM register_user WHERE user_name = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
	http_response_code(404); // Not Found
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
	http_response_code(200); // OK
	echo json_encode(["message" => "Inicio de sesión exitoso"]);
} else {
	http_response_code(401); // Unauthorized
	echo json_encode(["error" => "Contraseña incorrecta"]);
}
$conn->close();




