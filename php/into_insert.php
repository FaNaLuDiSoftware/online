<?php

require_once __DIR__ . "/config.php";


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


$mensaje = "";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$username = $_POST['user_name'] ?? "";
	$password = $_POST['password'] ?? "";
	$score = $_POST['score'] ?? 0;
	$money = $_POST['money'] ?? 0;

	if (empty($username) || empty($password)) {
		$mensaje = "Usuario y contraseña requeridos";
	} else {
		$hashed_password = password_hash($password, PASSWORD_DEFAULT);
		$stmt = $conn->prepare("INSERT INTO register_user (user_name, password, score, money) VALUES (?, ?, ?, ?)");
		$stmt->bind_param("ssii", $username, $hashed_password, $score, $money);
		if ($stmt->execute()) {
			$mensaje = "Usuario insertado correctamente";
		} else {
			$mensaje = "No se pudo insertar el usuario";
		}
		$stmt->close();
	}
}

echo '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Insertar Usuario</title>';
echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
echo '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">';
echo '</head><body>';
echo '<div class="container mt-5">';
echo '<span><a href="../php/admin-mode.php" class="btn btn-secondary mb-3">Atrás</a></span>';
echo '<h2 class="mb-4">Insertar Usuario</h2>';
if ($mensaje) {
	echo '<div class="alert alert-info">' . htmlspecialchars($mensaje) . '</div>';
}
echo '<form method="POST" class="row g-3">';
echo '<div class="col-md-6"><label class="form-label">Usuario</label><input type="text" name="user_name" class="form-control" required></div>';
echo '<div class="col-md-6"><label class="form-label">Contraseña</label><input type="password" name="password" class="form-control" required></div>';
echo '<div class="col-md-6"><label class="form-label">Puntaje</label><input type="number" name="score" class="form-control" value="0" min="0"></div>';
echo '<div class="col-md-6"><label class="form-label">Monedas</label><input type="number" name="money" class="form-control" value="0" min="0"></div>';
echo '<div class="col-12"><button type="submit" class="btn btn-primary">Insertar usuario</button></div>';
echo '</form>';
echo '</div></body></html>';
$conn->close();

?>

