<?php

require_once __DIR__ . "/config.php";

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


$result = $conn->query("SELECT user_name_rt, score_rt FROM ranking_tracking ORDER BY score_rt DESC, id_user_rt ASC");

$puesto = 1;
echo '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title id="tracking-ranking-title-tag">Ranking del Seguimiento</title>';
echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
echo '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">';
echo '<style>.table-primary{background-color:#cce5ff!important;}</style>';
echo '</head><body>';
echo '<div class="container-fluid p-3">';
echo '<span><a href="../menu.html" class="btn btn-secondary mb-3" id="tracking-ranking-back-button">Atrás</a></span>';
echo '<div class="container-fluid p-3">';
echo '<span><h1 class="mb-4 text-center" id="tracking-ranking-page-title">Ranking del Seguimiento</h1></span>';
echo '<div class="table-responsive">';
echo '<table class="table table-bordered table-striped align-middle">';
echo '<thead class="table-dark" id="tracking-ranking-thead"><tr>';
echo '<th class="text-center" id="th-tracking-rank"># Puesto</th><th class="text-center" id="th-tracking-user">Usuario</th><th class="text-center" id="th-tracking-score">Puntaje</th>';
echo '</tr></thead><tbody>';
while ($row = $result->fetch_assoc()) {
    echo '<tr>';
    echo '<td class="text-center">' . $puesto . '</td>';
    echo '<td class="text-center">' . htmlspecialchars($row['user_name_rt']) . '</td>';
    echo '<td class="text-center">' . htmlspecialchars($row['score_rt']) . '</td>';
    echo '</tr>';
    $puesto++;
}
echo '</tbody></table>';
echo '</div>';
echo '</div>';
// Cargar sistema de idiomas
echo '<script src="../scripts/language.js" defer></script>';
echo '</body></html>';
$conn->close();

?>


