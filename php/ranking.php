<?php

<?php
require_once __DIR__ . "/config.php";

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$host = "localhost";
$user = "root";
$pass = "";
$db = "usuarios_registrados_bd";
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Error de conexión a la base de datos");
}

// --- Lógica para acciones POST ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    $id_user = intval($input['id_user'] ?? 0);
    $response = [];
    if ($id_user > 0) {
        if ($action === 'delete') {
            $stmt = $conn->prepare('DELETE FROM register_user WHERE id_user = ?');
            $stmt->bind_param('i', $id_user);
            if ($stmt->execute()) {
                $response['message'] = 'Usuario eliminado correctamente';
            } else {
                $response['error'] = 'No se pudo eliminar el usuario';
            }
            $stmt->close();
        } elseif ($action === 'reset_score') {
            $stmt = $conn->prepare('UPDATE register_user SET score = 0 WHERE id_user = ?');
            $stmt->bind_param('i', $id_user);
            if ($stmt->execute()) {
                $response['message'] = 'Puntaje vaciado correctamente';
            } else {
                $response['error'] = 'No se pudo vaciar el puntaje';
            }
            $stmt->close();
        } elseif ($action === 'reset_money') {
            $stmt = $conn->prepare('UPDATE register_user SET money = 0 WHERE id_user = ?');
            $stmt->bind_param('i', $id_user);
            if ($stmt->execute()) {
                $response['message'] = 'Monedas vaciadas correctamente';
            } else {
                $response['error'] = 'No se pudo vaciar las monedas';
            }
            $stmt->close();
        } else {
            $response['error'] = 'Acción no válida';
        }
    } else {
        $response['error'] = 'ID de usuario no válido';
    }
    header('Content-Type: application/json');
    echo json_encode($response);
    $conn->close();
    exit;
}

$result = $conn->query("SELECT user_name, score FROM register_user ORDER BY score DESC");

$puesto = 1;
echo '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Ranking de Jugadores</title>';
echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
echo '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">';
echo '<style>.table-primary{background-color:#cce5ff!important;}</style>';
echo '</head><body>';
echo '<div class="container-fluid p-3">';
echo '<span><a href="../menu-admin.html" class="btn btn-secondary mb-3">Atrás</a></span>';
echo '<div class="container-fluid p-3">';
echo '<span><h1 class="mb-4 text-center">Ranking de Jugadores</h1></span>';
echo '<div class="table-responsive">';
echo '<table class="table table-bordered table-striped align-middle">';
echo '<thead class="table-dark"><tr>';
echo '<th class="text-center"># Puesto</th><th class="text-center">Usuario</th><th class="text-center">Puntaje</th>';
echo '</tr></thead><tbody>';
while ($row = $result->fetch_assoc()) {
    echo '<tr>';
    echo '<td class="text-center">' . $puesto . '</td>';
    echo '<td class="text-center">' . htmlspecialchars($row['user_name']) . '</td>';
    echo '<td class="text-center">' . htmlspecialchars($row['score']) . '</td>';
    echo '</tr>';
    $puesto++;
}
echo '</tbody></table>';
echo '</div>';
echo '</div>';
echo '</body></html>';
$conn->close();

?>
