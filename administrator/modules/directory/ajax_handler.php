<?php
include('../../../connection.php');
include('../../../login.php');

header('Content-Type: application/json');
// Получаем входящие данные
$requestData = json_decode(file_get_contents('php://input'), true);

// Проверяем действие
if (isset($requestData['ajax_action'])) {
    $auth = new AuthClass();
    
    $userID = $auth->getUserId();
    $objectId = $requestData['objectId'] ?? null;
    $ajax_action = $requestData['ajax_action'];
    $paramData = $requestData['paramData'] ?? null;
    if ($objectId) {
        // Получение атрибутов по выбранному каталогу
        if ($ajax_action === 'get_list_attributes') {
            try {
                $attributes = get_list_attributes($objectId);
                $catalogData = get_catalog_data($objectId);

                $attributesData[$objectId] = $attributes;
                $recordsData[$objectId] = $catalogData;

                // Возвращаем данные в формате JSON
                echo json_encode([
                    'success' => true,
                    'attributesData' => $attributesData,
                    'recordsData' => $recordsData
                ]);
            } catch (Exception $e) {
                // Обработка исключений
                echo json_encode([
                    'success' => false,
                    'error' => '',
                    'details' => $e->getMessage()
                ]);
            }
        }
        elseif ($ajax_action === 'saveCatalogData') {
            try {
                $result = saveDataCatalog($userID, $paramData);
                // Возвращаем данные в формате JSON
                $str = "false";
                $boolValue = ($result === "true") ? true : ($str === "false" ? false : (bool)$str);
                
                echo json_encode([
                    'success' => $boolValue,
                    'error' => $result
                ]);
            } 
            catch (Exception $e) {
                // Обработка исключений
                echo json_encode([
                    'success' => false,
                    'error' => '',
                    'details' => $e->getMessage()
                ]);
            }
        }
        elseif ($ajax_action === 'get_source_for_column') {
            try {
                // Возвращаем данные в формате JSON
                $result = get_source_for_column( $paramData);
                echo json_encode([
                    'success' => true,
                    'result' => $result,
                    'error' => ''
                ]);
            } 
            catch (Exception $e) {
                // Обработка исключений
                echo json_encode([
                    'success' => false,
                    'error' => '',
                    'details' => $e->getMessage()
                ]);
            }
        }
        else {
            echo json_encode(['success' => false, 
                              'error' => 'Нет обработчика для события: '.$ajax_action]
                            );
        }
    } else {
        echo json_encode(['success' => false, 
                            'error' => 'Не указан objectId.'
                         ]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Некорректное действие.']);
}

function saveDataCatalog($userID, $paramData){
    global $user, $pwd, $db; 

    $resultData = "";
    $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
    if (!$conn) {
        throw new Exception('Ошибка подключения к базе данных: ' . htmlentities(oci_error()['message'], ENT_QUOTES));
    }
    
    $clob = oci_new_descriptor($conn, OCI_DTYPE_LOB);
	$clob->writeTemporary($paramData);

    $stid = oci_parse($conn, 'begin 
                                    xx_etw.xx_dislocation.prc_save_catalog(p_user_id => :bind1, 
                                                                         p_param_data => :bind2, 
                                                                         p_out_result => :bind3);
                              end;');
    oci_bind_by_name($stid, ":bind1", $userID);
    oci_bind_by_name($stid, ':bind2', $clob, -1, OCI_B_CLOB);
    oci_bind_by_name($stid, ":bind3", $resultData, 10000);

    if (!oci_execute($stid)) {
        $e = oci_error($stid);
        oci_close($conn);
        throw new Exception($e['message']);
    }

    oci_free_descriptor($clob);
    oci_free_statement($stid);
    oci_close($conn);

    return $resultData;
}

// Функция для получения списка атрибутов
function get_list_attributes($objectId)
{
    global $user, $pwd, $db;

    $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
    if (!$conn) {
        throw new Exception('Ошибка подключения к базе данных: ' . htmlentities(oci_error()['message'], ENT_QUOTES));
    }

    $attributesData = [];
    $stid = oci_parse($conn, 'SELECT x.* FROM TABLE (xx_dislocation.get_attribute_for_catalog (p_object_id => :object_id)) x');
    oci_bind_by_name($stid, ":object_id", $objectId);

    if (!oci_execute($stid)) {
        $e = oci_error($stid);
        oci_close($conn);
        throw new Exception('Ошибка выполнения запроса: ' . $e['message']);
    }

    while ($tmp = oci_fetch_array($stid, OCI_ASSOC + OCI_RETURN_NULLS)) {
        array_push($attributesData, $tmp);
    }

    oci_free_statement($stid);
    oci_close($conn);

    return $attributesData;
}

// Функция для получения списка значений для столбца с источников
function get_source_for_column($paramData)
{
    global $user, $pwd, $db;

    $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
    if (!$conn) {
        throw new Exception('Ошибка подключения к базе данных: ' . htmlentities(oci_error()['message'], ENT_QUOTES));
    }

    $sourceData = [];
    $stid = oci_parse($conn, 'SELECT x.* FROM TABLE (xx_dislocation.get_source_for_column (p_param_data => :paramData)) x');
    oci_bind_by_name($stid, ":paramData", $paramData);

    if (!oci_execute($stid)) {
        $e = oci_error($stid);
        oci_close($conn);
        throw new Exception('Ошибка выполнения запроса: ' . $e['message']);
    }

    while ($tmp = oci_fetch_array($stid, OCI_ASSOC + OCI_RETURN_NULLS)) {
        array_push($sourceData, $tmp);
    }

    oci_free_statement($stid);
    oci_close($conn);

    return $sourceData;
}

// Функция для получения данных каталога
function get_catalog_data($objectId)
{
    global $user, $pwd, $db;

    $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
    if (!$conn) {
        throw new Exception('Ошибка подключения к базе данных: ' . htmlentities(oci_error()['message'], ENT_QUOTES));
    }

    $sql = "BEGIN :cursor := xx_etw.xx_dislocation.get_combined_data(:object_id); END;";
    $stid = oci_parse($conn, $sql);
    $cursor = oci_new_cursor($conn);

    oci_bind_by_name($stid, ":cursor", $cursor, -1, OCI_B_CURSOR);
    oci_bind_by_name($stid, ":object_id", $objectId);

    if (!oci_execute($stid)) {
        $e = oci_error($stid);
        oci_free_statement($stid);
        oci_close($conn);
        throw new Exception('Ошибка выполнения запроса: ' . $e['message']);
    }

    if (!oci_execute($cursor)) {
        $e = oci_error($cursor);
        oci_free_statement($stid);
        oci_free_statement($cursor);
        oci_close($conn);
        throw new Exception('Ошибка выполнения курсора: ' . $e['message']);
    }

    $data = [];
    while (($row = oci_fetch_assoc($cursor)) != false) {
        $data[] = $row;
    }

    oci_free_statement($stid);
    oci_free_statement($cursor);
    oci_close($conn);

    return $data;
}
