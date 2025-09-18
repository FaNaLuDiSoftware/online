<?php
// gemini-proxy.php
// Endpoint seguro para consultar la API de Gemini desde el frontend

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Tu API Key de Gemini
$apiKey = 'AIzaSyAOhpfcCP-EZCSdUnbvFnDPjxXeT5Gfsqg';

// Endpoint de Gemini
$apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $apiKey;

// Recibe el prompt desde el frontend
$input = json_decode(file_get_contents('php://input'), true);
$question = isset($input['question']) ? $input['question'] : '';
$companyInfo = isset($input['companyInfo']) ? $input['companyInfo'] : '';

if (!$question) {
    echo json_encode(['error' => 'No se recibió la pregunta.']);
    exit;
}

// Construye el prompt completo
$prompt = "Utiliza únicamente la información proporcionada sobre FaNaLuDi Software para responder a la siguiente pregunta. Si la información no es suficiente para responder, indica que no tienes esa información.\n\nInformación de la empresa:\n" . $companyInfo . "\n\nPregunta: \"" . $question . "\"";

$payload = [
    'contents' => [
        [
            'role' => 'user',
            'parts' => [ ['text' => $prompt] ]
        ]
    ]
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($payload)
    ]
];
$context = stream_context_create($options);
$response = file_get_contents($apiUrl, false, $context);

if ($response === FALSE) {
    echo json_encode(['error' => 'No se pudo conectar con la API de Gemini.']);
    exit;
}

// Devuelve la respuesta tal cual
echo $response;

