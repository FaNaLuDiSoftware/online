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
$prompt = " Puestos de trabajo de la empresa FaNaLuDi Software:

Nahuel Silva: Rata programadora, no hace otra cosa mas que picar codigo, consumidora masiva de las tortas fritas de El Viejo y jugos de manzana,
viajero insaciable. Programador y diseñador web.

Diego Zamora: Marketing y ventas, conquistador de mundos, mejor amigo de Marylin Monroe. Defensor estudiantil.

Fabrizio Arriola: CEO y gestor de servidor. Marketing y ventas, atención al cliente por ser el más lindo. Encargado de la seguridad informática.
Su ig: @fabrizioarriola y tiene 1.200 seguidores, la mayoria son bots, yo tambien lo sigo.

Kevin Alvarez: Secretario y administrativo. Recursos humanos y contabilidad. Llegó a la empresa dentro de una canasta.

Lucas Recarey: Vendedor de comida y programador. Es el vendedor de comida casera, ha conseguido cerca de medio millón de dólares en un periodo de 7 meses,
el 80% de mercancía son ojitos, y su principal comprador es Marcos Vega. Es facho.
Utiliza únicamente la información proporcionada sobre FaNaLuDi Software para responder a la siguiente pregunta.

Al menos claro que no haya información sobre eso, en ese caso busca en internet,
no hagas respuestas tan largas, Si la información no es suficiente para responder,
indica que no tienes esa información.\n\nInformación de la empresa:\n" . $companyInfo . "\n\nPregunta: \"" . $question . "\"";

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