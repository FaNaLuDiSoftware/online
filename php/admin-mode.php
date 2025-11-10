<?php

require_once __DIR__ . "/config.php";


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


// --- Lógica para acciones POST ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    $id_user = intval($input['id_user'] ?? 0);
    $response = [];
    if ($id_user > 0) {
        // Proteger usuario administrador: si el id pertenece a 'admin', bloquear cualquier acción
        $stmtCheck = $conn->prepare('SELECT user_name FROM register_user WHERE id_user = ? LIMIT 1');
        $stmtCheck->bind_param('i', $id_user);
        $stmtCheck->execute();
        $stmtCheck->bind_result($user_name_checked);
        $stmtCheck->fetch();
        $stmtCheck->close();

        if (isset($user_name_checked) && strtolower($user_name_checked) === 'admin') {
            $response['error'] = 'No puedes modificar al usuario administrador';
            $response['code'] = 'protected-user';
            header('Content-Type: application/json');
            echo json_encode($response);
            $conn->close();
            exit;
        }

        if ($action === 'delete') {
            $stmt = $conn->prepare('DELETE FROM register_user WHERE id_user = ?');
            $stmt->bind_param('i', $id_user);
            if ($stmt->execute()) {
                $response['message'] = 'Usuario eliminado correctamente';
                $response['code'] = 'delete-success';
            } else {
                $response['error'] = 'No se pudo eliminar el usuario';
                $response['code'] = 'delete-fail';
            }
            $stmt->close();
        } elseif ($action === 'reset_score') {
            $stmt = $conn->prepare('UPDATE register_user SET score = 0 WHERE id_user = ?');
            $stmt->bind_param('i', $id_user);
            if ($stmt->execute()) {
                $response['message'] = 'Puntaje vaciado correctamente';
                $response['code'] = 'reset-score-success';
            } else {
                $response['error'] = 'No se pudo vaciar el puntaje';
                $response['code'] = 'reset-score-fail';
            }
            $stmt->close();
        } elseif ($action === 'reset_money') {
            $stmt = $conn->prepare('UPDATE register_user SET money = 0 WHERE id_user = ?');
            $stmt->bind_param('i', $id_user);
            if ($stmt->execute()) {
                $response['message'] = 'Monedas vaciadas correctamente';
                $response['code'] = 'reset-money-success';
            } else {
                $response['error'] = 'No se pudo vaciar las monedas';
                $response['code'] = 'reset-money-fail';
            }
            $stmt->close();
        } else {
            $response['error'] = 'Acción no válida';
            $response['code'] = 'invalid-action';
        }
    } else {
        $response['error'] = 'ID de usuario no válido';
        $response['code'] = 'invalid-user-id';
    }
    header('Content-Type: application/json');
    echo json_encode($response);
    $conn->close();
    exit;
}

$result = $conn->query("SELECT id_user, user_name, password, score, money FROM register_user WHERE LOWER(user_name) != 'admin' ORDER BY id_user ASC");

echo '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title id="admin-title-tag">Modificar como Administrador</title>';
echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
echo '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">';
echo '<link rel="icon" type="image/png" href="assets/logoDraftosaurus.png">'
echo '<style>.table-primary{background-color:#cce5ff!important;}</style>';
echo '</head><body>';
echo '<div class="container-fluid p-3">';
echo '<div class="d-flex justify-content-between align-items-center mb-3">';
echo '<span><a href="../menu.html" class="btn btn-secondary" id="admin-back-button">Atrás</a></span>';
echo '<span><a href="../php/into_insert.php" class="btn btn-secondary" id="admin-insert-user-link">Insertar usuario</a></span>';
echo '</div>';
echo '<span><h1 class="mb-4 text-center" id="admin-page-title">Modificar como Administrador</h1></span>';
echo '<div class="container-admin-buttons mb-4 d-flex gap-2 justify-content-center">';
echo '<button class="btn btn-danger" id="admin-ban-user-button">Banear usuario</button>';
echo '<button class="btn btn-danger" id="admin-reset-score-button">Vaciar puntajes</button>';
echo '<button class="btn btn-danger" id="admin-reset-money-button">Vaciar monedas</button>';
echo '</div>';
echo '<div class="container-admin-form">';
echo '<div class="table-responsive">';
echo '<table class="table table-bordered table-striped align-middle">';
echo '<thead class="table-dark"><tr>';
echo '<th class="text-center" id="th-id-user">Id_Usuario</th><th class="text-center" id="th-username">Usuario</th><th class="text-center" id="th-password">Contraseña</th><th class="text-center" id="th-score">Puntaje</th><th class="text-center" id="th-money">Monedas</th>';
echo '</tr></thead><tbody>';
while ($row = $result->fetch_assoc()) {
    echo '<tr>';
    echo '<td class="text-center">' . htmlspecialchars($row['id_user']) . '</td>';
    echo '<td class="text-center">' . htmlspecialchars($row['user_name']) . '</td>';
    echo '<td class="text-center">Contraseña existente</td>';
    echo '<td class="text-center">' . htmlspecialchars($row['score']) . '</td>';
    echo '<td class="text-center">' . htmlspecialchars($row['money']) . '</td>';
    echo '</tr>';
}
echo '</tbody></table>';
echo '</div>';
echo '</div>';
echo '</div>';
// Cargar sistema de idiomas y script específico con defer para aplicar traducciones tras el DOM
echo '<script src="../scripts/language.js" defer></script>';
echo '<script src="../scripts/admin-mode.js" defer></script>';
echo '</body></html>';
$conn->close();

?>
