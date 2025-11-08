<?php

require_once __DIR__ . "/config.php";


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


$mensaje = "";
$mensaje_key = ""; // clave para traducción dinámica del mensaje
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$username = $_POST['user_name'] ?? "";
	$password = $_POST['password'] ?? "";
	$score = $_POST['score'] ?? 0;
	$money = $_POST['money'] ?? 0;

	if (empty($username) || empty($password)) {
		$mensaje = "Usuario y contraseña requeridos";
		$mensaje_key = "insert-user-required";
	} else {
		$hashed_password = password_hash($password, PASSWORD_DEFAULT);
		$stmt = $conn->prepare("INSERT INTO register_user (user_name, password, score, money) VALUES (?, ?, ?, ?)");
		$stmt->bind_param("ssii", $username, $hashed_password, $score, $money);
		if ($stmt->execute()) {
			$mensaje = "Usuario insertado correctamente";
			$mensaje_key = "insert-user-success";
		} else {
			$mensaje = "No se pudo insertar el usuario";
			$mensaje_key = "insert-user-fail";
		}
		$stmt->close();
	}
}

echo '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title id="insert-user-title-tag">Insertar Usuario</title>';
echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
echo '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">';
echo '</head><body>';
echo '<div class="container mt-5">';
echo '<span><a href="../php/admin-mode.php" class="btn btn-secondary mb-3" id="insert-user-back-button">Atrás</a></span>';
echo '<h2 class="mb-4" id="insert-user-heading">Insertar Usuario</h2>';
if ($mensaje) {
	echo '<div class="alert alert-info" id="insert-user-message" data-lang-key="' . htmlspecialchars($mensaje_key) . '">' . htmlspecialchars($mensaje) . '</div>';
}
echo '<form method="POST" class="row g-3" id="insert-user-form">';
echo '<div class="col-md-6"><label class="form-label" id="insert-user-label-username">Usuario</label><input type="text" name="user_name" class="form-control" required></div>';
echo '<div class="col-md-6"><label class="form-label" id="insert-user-label-password">Contraseña</label><input type="password" name="password" class="form-control" required></div>';
echo '<div class="col-md-6"><label class="form-label" id="insert-user-label-score">Puntaje</label><input type="number" name="score" class="form-control" value="0" min="0"></div>';
echo '<div class="col-md-6"><label class="form-label" id="insert-user-label-money">Monedas</label><input type="number" name="money" class="form-control" value="0" min="0"></div>';
echo '<div class="col-12"><button type="submit" class="btn btn-primary" id="insert-user-submit-button">Insertar usuario</button></div>';
echo '</form>';
echo '</div>';
echo '<script src="../scripts/language.js" defer></script>';
echo '</body></html>';
$conn->close();

?>

