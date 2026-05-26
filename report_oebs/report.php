<?php
/**
 * report.php — универсальный запуск Oracle-отчётов
 *
 * Вызов: /report.php?report=REPORT_ID&param1=val1&param2=val2...
 *
 * Паттерны get_request_data:
 *   pdf   — get_request_data(:request_id)
 *   excel — get_request_data(:request_id, 'excel')
 *
 * Ключи конфига отчёта:
 *   output    — 'pdf' | 'excel'
 *   proc      — имя Oracle-функции (для простого вызова)
 *   params    — массив имён GET-параметров в порядке передачи в proc
 *   sql_block — raw PL/SQL (если нужна конвертация дат или сложная логика)
 *   auth_user — true: добавить :user_id = $auth->getUserId() в sql_block
 *   commit    — true: добавить COMMIT после get_request_data
 */

session_start();
include __DIR__ . '/../login.php';
include __DIR__ . '/../connection.php';
include __DIR__ . '/../msg_to_users.php';

$auth = new AuthClass();

// ════════════════════════════════════════════════════════════════
//  РЕЕСТР ОТЧЁТОВ
// ════════════════════════════════════════════════════════════════
$reports = [

    // ── PDF ──────────────────────────────────────────────────────
    'xxeam013_1' => [
        'output' => 'pdf',
        'proc'   => 'apps.xx_dislocation_helper.start_xxeam013_1',
        'params' => ['car_number', 'inspection_id', 'user_name'],
    ],
    'xxeam013_2' => [
        'output' => 'pdf',
        'proc'   => 'apps.xx_dislocation_helper.start_xxeam013_2',
        'params' => ['car_number', 'inspection_id', 'user_name'],
    ],

    // ── Excel (простые) ──────────────────────────────────────────
    'xx_etw_car_nsi' => [
        'output' => 'excel',
        'proc'   => 'apps.xx_dislocation_helper.start_xx_etw_car_nsi',
        'params' => ['car_number', 'user_name'],
    ],
    'xx_etw_disl_003' => [
        'output' => 'excel',
        'proc'   => 'apps.xx_dislocation_helper.start_xx_etw_disl_003',
        'params' => ['not_id', 'user_name'],
    ],
    'xx_etw_disl_007' => [
        'output' => 'excel',
        'proc'   => 'apps.xx_dislocation_helper.start_xx_etw_disl_007',
        'params' => ['p_from_date', 'p_to_date', 'p_owner'],
    ],

    // ── Excel (кастомный PL/SQL: конвертация дат + auth user) ────
    'xx_etw_disl_009' => [
        'output'    => 'excel',
        'auth_user' => true,
        'commit'    => true,
        'params'    => ['freight', 'date_from', 'date_to', 'status', 'type'],
        'sql_block' => "declare
                            l_request_id number;
                        begin
                            l_request_id := apps.xx_dislocation_helper.start_xx_etw_disl_009(
                                :user_id,
                                :freight,
                                to_char(to_date(:date_from,'DD.MM.YYYY HH24:MI'),'YYYY/MM/DD HH24:MI:SS'),
                                to_char(to_date(:date_to,  'DD.MM.YYYY HH24:MI'),'YYYY/MM/DD HH24:MI:SS'),
                                :status,
                                :type
                            );
                            :request_id := l_request_id;
                        end;",
    ],

    // ── Добавляйте новые отчёты сюда ─────────────────────────────
];

// ════════════════════════════════════════════════════════════════
//  РОУТИНГ
// ════════════════════════════════════════════════════════════════
$report_id = $_GET['report'] ?? '';
if (!isset($reports[$report_id])) {
    http_response_code(400);
    die('Unknown report: ' . htmlspecialchars($report_id));
}
$cfg = $reports[$report_id];

$conn = oci_connect($user, $pwd, $db, 'AL32UTF8');
if (!$conn) {
    $e = oci_error();
    http_response_code(500);
    die('DB connection error: ' . $e['message']);
}

// ════════════════════════════════════════════════════════════════
//  ШАГ 1: запуск процедуры отчёта
// ════════════════════════════════════════════════════════════════
$request_id = null;

if (isset($cfg['sql_block'])) {
    // Кастомный PL/SQL-блок
    $stmt1 = oci_parse($conn, $cfg['sql_block']);
    OCIBindByName($stmt1, ':request_id', $request_id, 100);
    if (!empty($cfg['auth_user'])) {
        $user_id = $auth->getUserId();
        OCIBindByName($stmt1, ':user_id', $user_id);
    }
} else {
    // Стандартный: begin :request_id := proc(:p1,:p2,...); end;
    $binds = implode(',', array_map(fn($p) => ":$p", $cfg['params']));
    $stmt1 = oci_parse($conn, "begin :request_id := {$cfg['proc']}($binds); end;");
    OCIBindByName($stmt1, ':request_id', $request_id, 100);
}

// Биндим GET-параметры (через отдельный массив — bind by reference)
$vals = [];
foreach ($cfg['params'] as $p) {
    $vals[$p] = $_GET[$p] ?? '';
    OCIBindByName($stmt1, ":$p", $vals[$p]);
}

if (!oci_execute($stmt1)) {
    $e = oci_error($stmt1);
    http_response_code(500);
    die('Step 1 error: ' . $e['message']);
}

// ════════════════════════════════════════════════════════════════
//  ШАГ 2: получение BLOB
// ════════════════════════════════════════════════════════════════
$blob = oci_new_descriptor($conn, OCI_D_LOB);

$commit_sql = !empty($cfg['commit']) ? 'commit; ' : '';

if ($cfg['output'] === 'excel') {
    $stmt2 = oci_parse($conn,
        "begin :blob := xx_etw.xx_dislocation.get_request_data(:request_id, :fmt); {$commit_sql}end;"
    );
    $fmt = 'excel';
    oci_bind_by_name($stmt2, ':blob',       $blob,       -1, OCI_B_BLOB);
    oci_bind_by_name($stmt2, ':request_id', $request_id);
    oci_bind_by_name($stmt2, ':fmt',        $fmt);
} else {
    $stmt2 = oci_parse($conn,
        "begin :blob := xx_etw.xx_dislocation.get_request_data(:request_id); {$commit_sql}end;"
    );
    oci_bind_by_name($stmt2, ':blob',       $blob,       -1, OCI_B_BLOB);
    oci_bind_by_name($stmt2, ':request_id', $request_id);
}

if (!oci_execute($stmt2)) {
    $e = oci_error($stmt2);
    http_response_code(500);
    die('Step 2 error: ' . $e['message']);
}

oci_free_statement($stmt1);
oci_free_statement($stmt2);
oci_close($conn);

// ════════════════════════════════════════════════════════════════
//  ШАГ 3: отдаём файл браузеру
// ════════════════════════════════════════════════════════════════
$data     = $blob->load();
$blob->free();

$filename = $request_id ?: '1';

if ($cfg['output'] === 'excel') {
    header('Content-Type: application/vnd.ms-excel');
    header("Content-Disposition: inline; filename={$filename}.xml");
} else {
    header('Content-Type: application/pdf');
    header("Content-Disposition: inline; filename={$filename}.pdf");
}

print $data;