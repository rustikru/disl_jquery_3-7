<?php

/**
 * data.php — AJAX-диспетчер
 *
 * Рефакторинг:
 *   - одно OCI-соединение на весь запрос
 *   - один switch
 *   - модуль "Контроль вагонов" вынесен в CarControlRepository
 */

session_start();
//session_write_close();

include __DIR__ . '/login.php';
include __DIR__ . '/connection.php';
include __DIR__ . '/msg_to_users.php';

$auth = new AuthClass();

global $user, $pwd, $db;

$action = $_POST['ajax_action'] ?? '';

// -----------------------------------------------------------------------
// Роутер — делегирует action нужному репозиторию
// Чтобы добавить модуль —  правьте router.php
// -----------------------------------------------------------------------
$routes = include __DIR__ . '/router.php';

if (isset($routes[$action])) {
        [$file, $class] = $routes[$action];
        require_once __DIR__ . '/' . $file;

        $conn = oci_connect($user, $pwd, $db, 'AL32UTF8');
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        (new $class($conn, $auth))->handle($action, $_POST);
        oci_close($conn);
        exit;
}


if ($_POST['ajax_action'] === 'get_users') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_users())');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'stationTree') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.return_child(:bind1,:bind2,:bind3))');
        $id = $_POST['id'];
        $type = $_POST['type'];
        $flag_come = $_POST['flag_come'];

        oci_bind_by_name($oci_child, ":bind1", $id);
        oci_bind_by_name($oci_child, ":bind2", $type);
        oci_bind_by_name($oci_child, ":bind3", $flag_come);
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_tree_station') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $station_id = filter_input(INPUT_POST, 'station_id') ?? '';
        $flag_come = filter_input(INPUT_POST, 'flag_come') ?? '';
        $user_id = $auth->getUserId();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_tree_station(:bind1,:bind2,:bind3))');

        oci_bind_by_name($oci_child, ":bind1", $station_id);
        oci_bind_by_name($oci_child, ":bind2", $flag_come);
        oci_bind_by_name($oci_child, ":bind3", $user_id);
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}


if ($_POST['ajax_action'] === 'change_order') {

        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.change_order(:bind2,:bind3,:bind4); end;');

        // Создаем переменные для всех параметров
        $result = null;
        $id = $_POST['id'];
        $type = $_POST['type'];
        $action = $_POST['action'];

        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $id);
        oci_bind_by_name($oci_request, ":bind3", $type);
        oci_bind_by_name($oci_request, ":bind4", $action);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_all_station_child') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }


        $station_id = filter_input(INPUT_POST, 'station_id');

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_all_station_child(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $station_id);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'getNextStations') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $station_id = $auth->getStationId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.getNextStations(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $station_id);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'move_inside_station_few_child') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.move_inside_station_few_child(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7); end;');
        // Создаем переменные для всех параметров
        $result = null;
        $user_id = $auth->getUserId();
        $cars = filter_input(INPUT_POST, 'cars');
        $parent_id = filter_input(INPUT_POST, 'parent_id');
        $parent_type = filter_input(INPUT_POST, 'parent_type');
        $operation_date = filter_input(INPUT_POST, 'operation_date');
        $comment = filter_input(INPUT_POST, 'comment');

        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $cars);
        oci_bind_by_name($oci_request, ":bind4", $parent_id);
        oci_bind_by_name($oci_request, ":bind5", $parent_type);
        oci_bind_by_name($oci_request, ":bind6", $operation_date);
        oci_bind_by_name($oci_request, ":bind7", $comment);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'receive_into_station_few_child') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.receive_into_station_few_child(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10,:bind11,:bind12,:bind13,:bind14,:bind15,:bind16,:bind17,:bind18,:bind19,:bind20); end;');
        // Создаем переменные для всех параметров
        $result = null;
        $user_id = $auth->getUserId();

        // Список всех POST параметров
        $postKeys = [
                'cars',
                'parent_id',
                'parent_type',
                'bef_aft',
                'bef_aft_elem_id',
                'bef_aft_elem_type',
                'operation_date',
                'comment',
                'sending_time',
                'train_num',
                'loco1_num',
                'loco1_driver1',
                'loco1_driver2',
                'loco1_conductor',
                'loco2_num',
                'loco2_driver1',
                'loco2_driver2',
                'loco2_conductor'
        ];

        // Динамически создаем переменные
        foreach ($postKeys as $key) {
                $$key = filter_input(INPUT_POST, $key) ?? '';
        }

        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $cars);
        oci_bind_by_name($oci_request, ":bind4", $parent_id);
        oci_bind_by_name($oci_request, ":bind5", $parent_type);
        oci_bind_by_name($oci_request, ":bind6", $bef_aft);
        oci_bind_by_name($oci_request, ":bind7", $bef_aft_elem_id);
        oci_bind_by_name($oci_request, ":bind8", $bef_aft_elem_type);
        oci_bind_by_name($oci_request, ":bind9", $operation_date);
        oci_bind_by_name($oci_request, ":bind10", $comment);
        oci_bind_by_name($oci_request, ":bind11", $sending_time);
        oci_bind_by_name($oci_request, ":bind12", $train_num);
        oci_bind_by_name($oci_request, ":bind13", $loco1_num);
        oci_bind_by_name($oci_request, ":bind14", $loco1_driver1);
        oci_bind_by_name($oci_request, ":bind15", $loco1_driver2);
        oci_bind_by_name($oci_request, ":bind16", $loco1_conductor);
        oci_bind_by_name($oci_request, ":bind17", $loco2_num);
        oci_bind_by_name($oci_request, ":bind18", $loco2_driver1);
        oci_bind_by_name($oci_request, ":bind19", $loco2_driver2);
        oci_bind_by_name($oci_request, ":bind20", $loco2_conductor);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_coming_cars') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_coming_cars(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $_POST['station_id']);
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'send_to_station_few_cars') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.send_to_station_few_cars(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10'
                . '                                                                              ,:bind11,:bind12,:bind13,:bind14,:bind15,:bind16,:bind17,:bind18); end;');
        // Создаем переменные для всех параметров
        $result = null;
        $user_id = $auth->getUserId();

        // Список всех POST параметров
        $postKeys = [
                'cars',
                'send_stat_id',
                'dest_stat_id',
                'send_date',
                'arrival_date',
                'reason',
                'train_num',
                'loco1_num',
                'loco1_driver1',
                'loco1_driver2',
                'loco1_conductor',
                'loco2_num',
                'loco2_driver1',
                'loco2_driver2',
                'loco2_conductor',
                'save_name'
        ];

        // Динамически создаем переменные
        foreach ($postKeys as $key) {
                $$key = filter_input(INPUT_POST, $key) ?? '';
        }

        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $cars);
        oci_bind_by_name($oci_request, ":bind4", $send_stat_id);
        oci_bind_by_name($oci_request, ":bind5", $dest_stat_id);
        oci_bind_by_name($oci_request, ":bind6", $send_date);
        oci_bind_by_name($oci_request, ":bind7", $arrival_date);
        oci_bind_by_name($oci_request, ":bind8", $reason);
        oci_bind_by_name($oci_request, ":bind9", $train_num);
        oci_bind_by_name($oci_request, ":bind10", $loco1_num);
        oci_bind_by_name($oci_request, ":bind11", $loco1_driver1);
        oci_bind_by_name($oci_request, ":bind12", $loco1_driver2);
        oci_bind_by_name($oci_request, ":bind13", $loco1_conductor);
        oci_bind_by_name($oci_request, ":bind14", $loco2_num);
        oci_bind_by_name($oci_request, ":bind15", $loco2_driver1);
        oci_bind_by_name($oci_request, ":bind16", $loco2_driver2);
        oci_bind_by_name($oci_request, ":bind17", $loco2_conductor);
        oci_bind_by_name($oci_request, ":bind18", $save_name);
        oci_execute($oci_request);


        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'addBandwagon') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.addBandwagon(:bind2,:bind3,:bind4); end;');
        // Создаем переменные для всех параметров
        $result = null;
        $name = $_POST['name'];
        $parent_id = $_POST['parent_id'];
        $parent_type = $_POST['parent_type'];

        oci_bind_by_name($oci_request, ":bind1", $result, 1000000);
        oci_bind_by_name($oci_request, ":bind2", $name);
        oci_bind_by_name($oci_request, ":bind3", $parent_id);
        oci_bind_by_name($oci_request, ":bind4", $parent_type);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'addInfo') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin xx_dislocation.add_cars_for_add_info_tbl(:bind1,:bind2,:bind3); xx_dislocation.return_child_add_info_bef; end;');
        $id = $_POST['id'];
        $type = $_POST['type'];
        $station_id = $_POST['station_id'];

        oci_bind_by_name($oci_request, ":bind1", $id);
        oci_bind_by_name($oci_request, ":bind2", $type);
        oci_bind_by_name($oci_request, ":bind3", $station_id);
        oci_execute($oci_request);

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.return_child_add_info)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_add_info_for_cars') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $v_car = $_POST['cars'];
        $oci_request = oci_parse($conn, 'begin xx_dislocation.add_cars_for_add_info_tbl(:bind1); xx_dislocation.return_child_add_info_bef; end;');
        oci_bind_by_name($oci_request, ":bind1", $v_car);
        oci_execute($oci_request);

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.return_child_add_info)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_add_info_for_cars_with_round') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $v_car = $_POST['cars'];
        $oci_request = oci_parse($conn, 'begin xx_dislocation.add_cars_for_add_info_tbl_r(:bind1); xx_dislocation.return_child_add_info_bef(1); end;');
        oci_bind_by_name($oci_request, ":bind1", $v_car);
        oci_execute($oci_request);

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.return_child_add_info_for_gu)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_add_info_for_objects') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin xx_dislocation.add_objects_for_car_cont_tbl(:b1); xx_dislocation.populate_car_cont_tbl(:b2,:b3); end;');

        $objects = $_POST['objects'];
        $only_cars = $_POST['only_cars'];
        $user_id = $auth->getUserId();

        oci_bind_by_name($oci_request, ":b1", $objects);
        oci_bind_by_name($oci_request, ":b2", $only_cars);
        oci_bind_by_name($oci_request, ":b3", $user_id);
        oci_execute($oci_request);

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_car_cont_add_info)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

/* 
	Функция возвращает массив инф. по вагону 
	
	@param car_number - Номер вагоны
	
	return array
	
	ID					- номер вагона
	OBJ_TYPE 			- тип 
	NAME				
	FOREIGN_CAR	
	R_ORDER	
	INV_NUMBER			- номер накладной
	STATUS				- статус накладной
	STATE				- состояние: гр. или порож
	CAR_TYPE	
	FREIGHT_NAME		- Наименование груза
	WEIGHT_NET	
	ARRIVE_WEIGHT_NET	- вес груза
	WEIGHT_DEP			- вес тары
	WEIGHT_GROSS		- вес с весов
	CONT				- контейнер
	CONT_COUNT			- кол-во контейнеров
	OWNER				- владелец вагона (МТФ, МД)
	DATE_ARRIVE			- Дата прибытия (УГЛ)
	DATE_LAST_OPER		- дата посл.операции
	DATE_LOADING		- дата операци на произ.площадке
	CAR_LENGTH			- 
	CONT_WITH_INS				- Контейнеры с результатами осмотров
	SCALE_WEIGHT_DEP			- Вес порожний с весов
	SCALE_WEIGHT_GROSS			- Вес брутто с весов
	SCALE_WEIGHT_DEP_ADD		- Указывает на то что вес с предыдущего круга
	SCALE_WEIGHT_GROSS_ADD	
	CAN_CREATE_RETURN_INVOICE	
	RAILCAR_TYPE		- тип (1 - вагон, 2 - контейнер)
	ROUND_ID			- ID оборота вагона. 

*/

if ($_POST['ajax_action'] === 'get_add_info_for_car') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin xx_dislocation.add_car_for_add_info_tbl(:bind1); xx_dislocation.return_child_add_info_bef; end;');
        oci_bind_by_name($oci_request, ":bind1", $_POST['car_number']);
        oci_execute($oci_request);

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.return_child_add_info)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

/* 
	Функция возвращает массив инф. по контейнеру 
	
	@param car_number - Номер вагона
	
*/
if ($_POST['ajax_action'] === 'get_add_info_for_cont') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $car_number = $_POST['car_number'];
        $oci_request = oci_parse($conn, 'begin xx_dislocation.add_cont_for_add_info_tbl(:bind1); xx_dislocation.return_child_add_info_bef; end;');
        oci_bind_by_name($oci_request, ":bind1", $car_number);
        oci_execute($oci_request);

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.return_child_add_info)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}
/* 
	Информация по пользователю
*/
if ($_POST['ajax_action'] === 'getLoginData') {
        $right = $auth->getRights();
        $mas_login_data = $right;
        $mas_login_data['stationId'] = $auth->getStationId();
        $mas_login_data['stationName'] = $auth->getStation();
        $mas_login_data['userName'] = $auth->getFullName();
        $mas_login_data['user_id'] = $auth->getUserId();
        $mas_login_data['administrator'] = $auth->getAdministrator();

        echo json_encode($mas_login_data);
}

if ($_POST['ajax_action'] === 'get_init_data') {
        $right = $auth->getRights();
        $login_data = $right;
        $login_data['stationId']     = $auth->getStationId();
        $login_data['stationName']   = $auth->getStation();
        $login_data['userName']      = $auth->getFullName();
        $login_data['user_id']       = $auth->getUserId();
        $login_data['administrator'] = $auth->getAdministrator();

        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $queries = [
                'freight_list'       => 'select * from table(xx_dislocation.get_freight_list)',
                'org_name_list'      => 'select * from table(xx_dislocation.get_org_name_list)',
                'scales_type_list'   => 'select * from table(xx_dislocation.get_scales_type_list)',
                'define_task_list'   => 'select * from table(xx_dislocation.get_define_task_list)',
                'car_type_list'      => 'select * from table(xx_dislocation.get_car_type_list)',
                'train_drivers'      => 'select * from table(xx_dislocation.get_train_drivers)',
                'users_for_naliv'    => 'select * from table(xx_dislocation.get_users_for_naliv)',
                'conductors'         => 'select * from table(xx_dislocation.get_conductors)',
                'locomotives'        => 'select * from table(xx_dislocation.get_locomotives)',
                'inspection_persons' => 'select * from table(xx_dislocation.get_inspection_persons)',
                'masters'            => 'select * from table(xx_dislocation.get_masters)',
                'ins_results'        => 'select * from table(xx_dislocation.get_ins_results)',
                'ins_doc_types'      => 'select * from table(xx_dislocation.get_ins_doc_types)',
        ];

        $result = ['login' => $login_data];

        foreach ($queries as $key => $sql) {
                $stmt = oci_parse($conn, $sql);
                oci_execute($stmt);
                $rows = [];
                while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
                        $rows[] = $row;
                }
                $result[$key] = $rows;
        }

        oci_close($conn);
        echo json_encode($result);
}

/*
	Авторизовался пользователь. (Да/Нет)
*/
if ($_POST['ajax_action'] === 'get_is_auth') {
        echo $auth->isAuth();
}

if ($_POST['ajax_action'] === 'get_msg_to_users') {
        $l_msg_to_users = new msg_to_users();
        echo json_encode($l_msg_to_users->get_result());
}

if ($_POST['ajax_action'] === 'auth_out') {
        $auth->out();
}

if ($_POST['ajax_action'] === 'updateCarsForUgleuralskaya') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.updateCarsForUgleuralskaya; end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}
/*удаление группы вагонов*/
if ($_POST['ajax_action'] === 'deleteBandwagon') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.deleteBandwagon(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 1000000);
        oci_bind_by_name($oci_request, ":bind2", $_POST['id']);
        oci_bind_by_name($oci_request, ":bind3", $_POST['type']);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'send_cars_from_ugl') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.send_cars_from_ugl(:bind2,:bind3,:bind4,:bind5); end;');
        $result = null;
        $user_id = $auth->getUserId();
        $id_type = filter_input(INPUT_POST, 'id_type') ?? '';
        $dateFact = filter_input(INPUT_POST, 'dateFact') ?? '';
        $comment = filter_input(INPUT_POST, 'comment') ?? '';

        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $id_type);
        oci_bind_by_name($oci_request, ":bind4", $dateFact);
        oci_bind_by_name($oci_request, ":bind5", $comment);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'output_cars') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.output_cars(:bind2,:bind3,:bind4,:bind5); end;');
        $result = null;
        $user_id = $auth->getUserId();

        $cars = filter_input(INPUT_POST, 'cars');
        $oper_date = filter_input(INPUT_POST, 'oper_date');
        $comment = filter_input(INPUT_POST, 'comment');

        // Если filter_input вернул null, заменяем на пустую строку
        $cars = $cars ?? '';
        $oper_date = $oper_date ?? '';
        $comment = $comment ?? '';

        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $cars);
        oci_bind_by_name($oci_request, ":bind4", $oper_date);
        oci_bind_by_name($oci_request, ":bind5", $comment);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'entry_foreign_railcar') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.entry_foreign_railcar(:bind2,:bind3,:bind4); end;');
        $result = null;
        $user_id = $auth->getUserId();
        $railcars = filter_input(INPUT_POST, 'railcars') ?? '';
        $date_fact = filter_input(INPUT_POST, 'date_fact') ?? '';

        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $railcars);
        oci_bind_by_name($oci_request, ":bind4", $date_fact);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'entry_foreign_container') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.entry_foreign_container(:bind2,:bind3,:bind4); end;');
        $result = null;
        $user_id = $auth->getUserId();
        $container = filter_input(INPUT_POST, 'container') ?? '';
        $date_fact = filter_input(INPUT_POST, 'date_fact') ?? '';

        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $container);
        oci_bind_by_name($oci_request, ":bind4", $date_fact);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'fill_railcar_attr') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.fill_railcar_attr(:bind2,:bind3,:bind4); end;');
        $result = null;
        $car_number = filter_input(INPUT_POST, 'car_number') ?? '';
        $car_type = filter_input(INPUT_POST, 'car_type') ?? '';
        $freight_name = filter_input(INPUT_POST, 'freight_name') ?? '';

        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $car_number);
        oci_bind_by_name($oci_request, ":bind3", $car_type);
        oci_bind_by_name($oci_request, ":bind4", $freight_name);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'returnBadInvoices') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.returnBadInvoices)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'returnCountBadInvoices') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.returnCountBadInvoices; end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'fill_railcar_for_invoice') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.fill_railcar_for_invoice(:bind2,:bind3,:bind4); end;');
        $result = null;
        $user_id = $auth->getUserId();
        $inv_id = filter_input(INPUT_POST, 'inv_id') ?? '';
        $carnumber = filter_input(INPUT_POST, 'carnumber') ?? '';

        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $inv_id);
        oci_bind_by_name($oci_request, ":bind4", $carnumber);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_freight_list') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_freight_list)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_org_name_list') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_org_name_list)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_scales_type_list') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_scales_type_list)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_define_task_list') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_define_task_list)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}


if ($_POST['ajax_action'] === 'get_car_type_list') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_car_type_list)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'change_railcar_add_info') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.change_railcar_add_info(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7); end;');
        $result = null;
        $user_id = $auth->getUserId();
        $car_number = filter_input(INPUT_POST, 'car_number') ?? '';
        $car_type = filter_input(INPUT_POST, 'car_type') ?? '';
        $freight_name = filter_input(INPUT_POST, 'freight_name') ?? '';
        $weight_dep = filter_input(INPUT_POST, 'weight_dep') ?? '';
        $owner = filter_input(INPUT_POST, 'owner') ?? '';

        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $car_number);
        oci_bind_by_name($oci_request, ":bind4", $car_type);
        oci_bind_by_name($oci_request, ":bind5", $freight_name);
        oci_bind_by_name($oci_request, ":bind6", $weight_dep);
        oci_bind_by_name($oci_request, ":bind7", $owner);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'change_cont_add_info') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.change_cont_add_info(:bind2,:bind3,:bind4,:bind5,:bind6); end;');
        $result = null;
        $user_id = $auth->getUserId();
        $cont_number = filter_input(INPUT_POST, 'cont_number') ?? '';
        $freight_name = filter_input(INPUT_POST, 'freight_name') ?? '';
        $weight_dep = filter_input(INPUT_POST, 'weight_dep') ?? '';
        $owner = filter_input(INPUT_POST, 'owner') ?? '';

        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $cont_number);
        oci_bind_by_name($oci_request, ":bind4", $freight_name);
        oci_bind_by_name($oci_request, ":bind5", $weight_dep);
        oci_bind_by_name($oci_request, ":bind6", $owner);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_current_time') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.get_current_time; end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_train_drivers') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_train_drivers)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_users_for_naliv') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_users_for_naliv)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_conductors') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_conductors)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_locomotives') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_locomotives)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_cars_in_ugl') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_cars_in_ugl())');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'register_notification') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $result = null;
        $user_id = $auth->getUserId();
        $cars = filter_input(INPUT_POST, 'cars') ?? '';
        $notification_time_from = filter_input(INPUT_POST, 'notification_time_from') ?? '';
        $notification_person_from = filter_input(INPUT_POST, 'notification_person_from') ?? '';
        $notification_railway_number = filter_input(INPUT_POST, 'notification_railway_number') ?? '';
        $notification_time_to = filter_input(INPUT_POST, 'notification_time_to') ?? '';
        $notification_person_to = filter_input(INPUT_POST, 'notification_person_to') ?? '';
        $notification_name = filter_input(INPUT_POST, 'notification_name') ?? '';

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.register_notification(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $cars);
        oci_bind_by_name($oci_request, ":bind4", $notification_time_from);
        oci_bind_by_name($oci_request, ":bind5", $notification_person_from);
        oci_bind_by_name($oci_request, ":bind6", $notification_railway_number);
        oci_bind_by_name($oci_request, ":bind7", $notification_time_to);
        oci_bind_by_name($oci_request, ":bind8", $notification_person_to);
        oci_bind_by_name($oci_request, ":bind9", $notification_name);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_saved_notifications') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_saved_notifications())');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'save_notification') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $result = null;
        $user_id = $auth->getUserId();
        $notification_name = filter_input(INPUT_POST, 'notification_name') ?? '';
        $cars = filter_input(INPUT_POST, 'cars') ?? '';
        $notification_time_from = filter_input(INPUT_POST, 'notification_time_from') ?? '';
        $notification_person_from = filter_input(INPUT_POST, 'notification_person_from') ?? '';
        $notification_railway_number = filter_input(INPUT_POST, 'notification_railway_number') ?? '';
        $notification_time_to = filter_input(INPUT_POST, 'notification_time_to') ?? '';
        $notification_person_to = filter_input(INPUT_POST, 'notification_person_to') ?? '';

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.save_notification(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $notification_name);
        oci_bind_by_name($oci_request, ":bind4", $cars);
        oci_bind_by_name($oci_request, ":bind5", $notification_time_from);
        oci_bind_by_name($oci_request, ":bind6", $notification_person_from);
        oci_bind_by_name($oci_request, ":bind7", $notification_railway_number);
        oci_bind_by_name($oci_request, ":bind8", $notification_time_to);
        oci_bind_by_name($oci_request, ":bind9", $notification_person_to);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}


if ($_POST['ajax_action'] === 'load_notification') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $notification_name = filter_input(INPUT_POST, 'notification_name');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.load_notification(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $notification_name);
        oci_execute($oci_request);
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'del_notification') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $result = null;
        $notification_name = filter_input(INPUT_POST, 'notification_name');
        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.del_notification(:bind2); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $notification_name);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_location_of_cars') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $find_car  = filter_input(INPUT_POST, 'find_car');
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_location_of_cars(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $find_car);
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_users_for_notification') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $credential_id = filter_input(INPUT_POST, 'credential_id');
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_users_for_notification(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $credential_id);
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_users_for_route') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $credential_id = filter_input(INPUT_POST, 'credential_id');
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_users_for_route(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $credential_id);
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_notifications_gu') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $credential_id = filter_input(INPUT_POST, 'credential_id') ?? '';

        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_notifications_gu(:bind1,:bind2))');
        oci_bind_by_name($oci_child, ":bind1", $credential_id);
        oci_bind_by_name($oci_child, ":bind2", $credential_id);
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'toggle_like_railway') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $result = null;
        $user_id = $auth->getUserId();
        $obj_id = filter_input(INPUT_POST, 'obj_id') ?? '';
        $obj_type = filter_input(INPUT_POST, 'obj_type') ?? '';

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.toggle_like_railway(:bind2,:bind3,:bind4); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $obj_id);
        oci_bind_by_name($oci_request, ":bind4", $obj_type);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'change_cars_weight_net') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $sql = '
        declare
            l_prm                xx_etw.xx_dislocation.t_change_cars_weight_rec;
            x_out_loading_tbl    xx_etw.xx_dislocation.t_loading_table;
        begin
            l_prm.user_id           := :p_user_id;
            l_prm.cars_with_weight  := :p_cars_with_weight;
            l_prm.date_post         := :p_date_post;
            l_prm.date_start        := :p_date_start;
            l_prm.date_end          := :p_date_end;
            l_prm.date_zayavka_uvod := :p_date_zayavka_uvod;
            l_prm.date_uvod         := :p_date_uvod;
            l_prm.who_looked_id     := null;
            l_prm.who_looked        := :p_who_looked;
            l_prm.who_start_id      := null;
            l_prm.who_start         := :p_who_start;
            l_prm.who_end_id        := null;
            l_prm.who_end           := :p_who_end;
            l_prm.who_zayavka_id    := null;
            l_prm.who_zayavka       := :p_who_zayavka;

            :p_result := xx_dislocation.change_cars_weight_net(l_prm, x_out_loading_tbl);
        end;
    ';

        $oci_request = oci_parse($conn, $sql);

        $user_id           = $auth->getUserId();
        $cars_with_weight  = filter_input(INPUT_POST, 'cars_with_weight');
        $date_post         = filter_input(INPUT_POST, 'date_post');
        $date_start        = filter_input(INPUT_POST, 'date_start');
        $date_end          = filter_input(INPUT_POST, 'date_end');
        $date_zayavka_uvod = filter_input(INPUT_POST, 'date_zayavka_uvod');
        $date_uvod         = filter_input(INPUT_POST, 'date_uvod');
        $who_looked        = filter_input(INPUT_POST, 'who_looked');
        $who_start         = filter_input(INPUT_POST, 'who_start');
        $who_end           = filter_input(INPUT_POST, 'who_end');
        $who_zayavka       = filter_input(INPUT_POST, 'who_zayavka');

        oci_bind_by_name($oci_request, ':p_result',            $result,            10000);
        oci_bind_by_name($oci_request, ':p_user_id',           $user_id);
        oci_bind_by_name($oci_request, ':p_cars_with_weight',  $cars_with_weight,  4000);
        oci_bind_by_name($oci_request, ':p_date_post',         $date_post,         30);
        oci_bind_by_name($oci_request, ':p_date_start',        $date_start,        30);
        oci_bind_by_name($oci_request, ':p_date_end',          $date_end,          30);
        oci_bind_by_name($oci_request, ':p_date_zayavka_uvod', $date_zayavka_uvod, 30);
        oci_bind_by_name($oci_request, ':p_date_uvod',         $date_uvod,         30);
        oci_bind_by_name($oci_request, ':p_who_looked',        $who_looked,        200);
        oci_bind_by_name($oci_request, ':p_who_start',         $who_start,         200);
        oci_bind_by_name($oci_request, ':p_who_end',           $who_end,           200);
        oci_bind_by_name($oci_request, ':p_who_zayavka',       $who_zayavka,       200);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_cont_out_date') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $conts = filter_input(INPUT_POST, 'conts');
        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.get_cont_out_date(:bind2); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $conts);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}
if ($_POST['ajax_action'] === 'get_railcar_in_date') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $cars = filter_input(INPUT_POST, 'cars');

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.get_railcar_in_date(:bind2); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $cars);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_move_cont_to_pl') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $cars = filter_input(INPUT_POST, 'cars');

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.get_move_cont_to_pl(:bind2); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $cars);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_cars_from_shop') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $user_id = $auth->getUserId();
        $return_type = filter_input(INPUT_POST, 'return_type') ?? '';
        $loading_subs = filter_input(INPUT_POST, 'loading_subs') ?? '';


        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_cars_from_shop(:b1,:b2,:b3))');
        oci_bind_by_name($oci_child, ":b1", $user_id);
        oci_bind_by_name($oci_child, ":b2", $return_type);
        oci_bind_by_name($oci_child, ":b3", $loading_subs);
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_place_inspection_cars') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_place_inspection_cars)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_inspection_persons') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_inspection_persons)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_masters') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_masters)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_asset_info') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $car_number = filter_input(INPUT_POST, 'car_number');
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_asset_info(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $car_number);
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_priority') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_priority)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_ins_results') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_ins_results)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_status_kurs') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_status_kurs)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_defects') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_defects)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_device_defects') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_device_defects)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_document_types') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_document_types)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'enter_inspection') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $result = null;
        $user_id = $auth->getUserId();
        $car_number = filter_input(INPUT_POST, 'car_number') ?? '';
        $cont = filter_input(INPUT_POST, 'cont') ?? '';
        $inspection_id = filter_input(INPUT_POST, 'inspection_id') ?? '';
        $inspection_date = filter_input(INPUT_POST, 'inspection_date') ?? '';
        $inspection_place = filter_input(INPUT_POST, 'inspection_place') ?? '';
        $inspection_person = filter_input(INPUT_POST, 'inspection_person') ?? '';
        $inspection_person_appoint = filter_input(INPUT_POST, 'inspection_person_appoint') ?? '';
        $master = filter_input(INPUT_POST, 'master') ?? '';
        $priority = filter_input(INPUT_POST, 'priority') ?? '';
        $result_param = filter_input(INPUT_POST, 'result') ?? ''; // переименовал, т.к. $result уже используется
        $status_kurs = filter_input(INPUT_POST, 'status_kurs') ?? '';
        $comment = filter_input(INPUT_POST, 'comment') ?? '';
        $defects = filter_input(INPUT_POST, 'defects') ?? '';

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.enter_inspection(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10,:bind11,:bind12,:bind13,:bind14,:bind15); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $car_number);
        oci_bind_by_name($oci_request, ":bind4", $cont);
        oci_bind_by_name($oci_request, ":bind5", $inspection_id);
        oci_bind_by_name($oci_request, ":bind6", $inspection_date);
        oci_bind_by_name($oci_request, ":bind7", $inspection_place);
        oci_bind_by_name($oci_request, ":bind8", $inspection_person);
        oci_bind_by_name($oci_request, ":bind9", $inspection_person_appoint);
        oci_bind_by_name($oci_request, ":bind10", $master);
        oci_bind_by_name($oci_request, ":bind11", $priority);
        oci_bind_by_name($oci_request, ":bind12", $result_param);
        oci_bind_by_name($oci_request, ":bind13", $status_kurs);
        oci_bind_by_name($oci_request, ":bind14", $comment);
        oci_bind_by_name($oci_request, ":bind15", $defects);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_car_inspections') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_car_inspections(:bind1,:bind2))');
        // Создаем переменные для всех параметров
        $obj_number = filter_input(INPUT_POST, 'obj_number') ?? '';
        $obj_type = filter_input(INPUT_POST, 'obj_type') ?? '';

        oci_bind_by_name($oci_child, ":bind1", $obj_number);
        oci_bind_by_name($oci_child, ":bind2", $obj_type);

        oci_execute($oci_child);

        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_car_dev_inspections') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $obj_number = filter_input(INPUT_POST, 'obj_number');
        $obj_type = filter_input(INPUT_POST, 'obj_type');

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_car_dev_inspections(:bind1,:bind2))');
        oci_bind_by_name($oci_child, ":bind1", $obj_number);
        oci_bind_by_name($oci_child, ":bind2", $obj_type);

        oci_execute($oci_child);

        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_car_containers') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $car_number = filter_input(INPUT_POST, 'car_number');

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_car_containers(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $car_number);

        oci_execute($oci_child);

        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'enter_inspection_for_few_cars') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        // Создаем переменные для всех параметров
        $result = null;
        $user_id = $auth->getUserId();
        $obj_numbers = filter_input(INPUT_POST, 'obj_numbers') ?? '';
        $obj_type = filter_input(INPUT_POST, 'obj_type') ?? '';
        $inspection_date = filter_input(INPUT_POST, 'inspection_date') ?? '';
        $inspection_place = filter_input(INPUT_POST, 'inspection_place') ?? '';
        $inspection_person = filter_input(INPUT_POST, 'inspection_person') ?? '';
        $inspection_person_appoint = filter_input(INPUT_POST, 'inspection_person_appoint') ?? '';
        $master = filter_input(INPUT_POST, 'master') ?? '';
        $priority = filter_input(INPUT_POST, 'priority') ?? '';
        $result_param = filter_input(INPUT_POST, 'result') ?? '';
        $status_kurs = filter_input(INPUT_POST, 'status_kurs') ?? '';
        $comment = filter_input(INPUT_POST, 'comment') ?? '';
        $cars_nsi = filter_input(INPUT_POST, 'cars_nsi') ?? ''; // add 26/10/2022 BekmansurovRR

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.enter_inspection_for_few_cars(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10,:bind11,:bind12,:bind13,:bind14); end;');

        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $obj_numbers);
        oci_bind_by_name($oci_request, ":bind4", $obj_type);
        oci_bind_by_name($oci_request, ":bind5", $inspection_date);
        oci_bind_by_name($oci_request, ":bind6", $inspection_place);
        oci_bind_by_name($oci_request, ":bind7", $inspection_person);
        oci_bind_by_name($oci_request, ":bind8", $inspection_person_appoint);
        oci_bind_by_name($oci_request, ":bind9", $master);
        oci_bind_by_name($oci_request, ":bind10", $priority);
        oci_bind_by_name($oci_request, ":bind11", $result_param);
        oci_bind_by_name($oci_request, ":bind12", $status_kurs);
        oci_bind_by_name($oci_request, ":bind13", $comment);
        oci_bind_by_name($oci_request, ":bind14", $cars_nsi);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}
if ($_POST['ajax_action'] === 'delete_inspection') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $result = null;
        $inspection_id = filter_input(INPUT_POST, 'inspection_id');

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.delete_inspection(:bind2); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $inspection_id);


        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'delete_dev_inspection') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $inspection_id =  filter_input(INPUT_POST, 'inspection_id');

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.delete_dev_inspection(:bind2); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $inspection_id);


        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'create_work_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        
        $userID = $auth->getUserId();
        $inspection_id = filter_input(INPUT_POST, 'inspection_id');
        
        $oci_request = oci_parse($conn, 'begin xx_dislocation.create_work_request(:bind1,:bind2,:bind3,:bind4); end;');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $inspection_id);
        oci_bind_by_name($oci_request, ":bind3", $res, 1000);
        oci_bind_by_name($oci_request, ":bind4", $res_err_log, 1000);


        oci_execute($oci_request);

        oci_close($conn);

        echo json_encode(array($res, $res_err_log));
}

if ($_POST['ajax_action'] === 'refusal_to_repair') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $res_err_log;

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.refusal_to_repair(:bind2,:bind3,:bind4); end;');
        $result = null;
        $user_id = $auth->getUserId();
        $inspection_id = filter_input(INPUT_POST, 'inspection_id') ?? '';
        $person = filter_input(INPUT_POST, 'person') ?? '';

        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $inspection_id);
        oci_bind_by_name($oci_request, ":bind4", $person);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'refusal_dev_to_repair') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $res_err_log;
        $userID = $auth->getUserId();
        $inspection_id = filter_input(INPUT_POST, 'inspection_id');
        $person = filter_input(INPUT_POST, 'person');

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.refusal_dev_to_repair(:bind2,:bind3,:bind4); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $inspection_id);
        oci_bind_by_name($oci_request, ":bind4", $person);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_railways_for_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $station_id = filter_input(INPUT_POST, 'station_id');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_railways_for_request(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $station_id);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_fixing_person_for_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_fixing_person_for_request())');
        //oci_bind_by_name($oci_request, ":bind1", filter_input(INPUT_POST,'station_id'));
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_control_person_for_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_control_person_for_request())');
        //oci_bind_by_name($oci_request, ":bind1", filter_input(INPUT_POST,'station_id'));
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_respon_person_for_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_respon_person_for_request())');
        //oci_bind_by_name($oci_request, ":bind1", filter_input(INPUT_POST,'station_id'));
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'save_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $res_err_log;

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_request(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8); end;');
        $result = null;
        $user_id = $auth->getUserId();
        $request_id = filter_input(INPUT_POST, 'request_id') ?? '';
        $deadline_date_in = filter_input(INPUT_POST, 'deadline_date_in') ?? '';
        $deadline_date_out = filter_input(INPUT_POST, 'deadline_date_out') ?? '';
        $task = filter_input(INPUT_POST, 'task') ?? '';
        $criticality = filter_input(INPUT_POST, 'criticality') ?? '';
        $cars = filter_input(INPUT_POST, 'cars') ?? '';

        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $request_id);
        oci_bind_by_name($oci_request, ":bind4", $deadline_date_in);
        oci_bind_by_name($oci_request, ":bind5", $deadline_date_out);
        oci_bind_by_name($oci_request, ":bind6", $task);
        oci_bind_by_name($oci_request, ":bind7", $criticality);
        oci_bind_by_name($oci_request, ":bind8", $cars);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_requests') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $UserId = $auth->getUserId();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_requests(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $UserId);

        oci_execute($oci_child);

        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_request_criterias') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $request_id = filter_input(INPUT_POST, 'request_id');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.get_request_criterias(:bind2); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $request_id);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_request_criteria_cars') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $criteria_id = filter_input(INPUT_POST, 'criteria_id');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.get_request_criteria_cars(:bind2); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $criteria_id);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_request_criteria_cars_new') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $criteria_id = filter_input(INPUT_POST, 'criteria_id');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_request_criteria_cars_new(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $criteria_id);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_tasks_for_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_tasks_for_request)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_criteria_tasks_for_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_criteria_tasks_for_request)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_criticality_for_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_criticality_for_request)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $request_id = filter_input(INPUT_POST, 'request_id');
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_request(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $request_id);

        oci_execute($oci_child);

        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'save_request_status') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $res_err_log;
        $result = null;
        $user_id = $auth->getUserId();
        $request_id = filter_input(INPUT_POST, 'request_id') ?? '';
        $status = filter_input(INPUT_POST, 'status') ?? '';
        $status_descr = filter_input(INPUT_POST, 'status_descr') ?? '';

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_request_status(:bind2,:bind3,:bind4,:bind5); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $request_id);
        oci_bind_by_name($oci_request, ":bind4", $status);
        oci_bind_by_name($oci_request, ":bind5", $status_descr);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'save_processing_status') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $res_err_log;
        $userID = $auth->getUserId();
        $request_id = filter_input(INPUT_POST, 'request_id');
        
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_processing_status(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $request_id);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'save_send_to_station_form') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $res_err_log;
        // Создаем переменные для всех параметров
        $result = null;
        $user_id = $auth->getUserId();

        // Список POST параметров
        $postKeys = [
                'name',
                'sending_time',
                'arrival_time',
                'reason',
                'train_num',
                'loco1_num',
                'loco1_driver1',
                'loco1_driver2',
                'loco1_conductor',
                'loco2_num',
                'loco2_driver1',
                'loco2_driver2',
                'loco2_conductor',
                'cars'
        ];

        // Динамически создаем переменные
        foreach ($postKeys as $key) {
                $$key = filter_input(INPUT_POST, $key) ?? '';
        }
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_send_to_station_form(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10,:bind11,:bind12,:bind13'
                . '                                                                              ,:bind14,:bind15,:bind16); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $name);
        oci_bind_by_name($oci_request, ":bind4", $sending_time);
        oci_bind_by_name($oci_request, ":bind5", $arrival_time);
        oci_bind_by_name($oci_request, ":bind6", $reason);
        oci_bind_by_name($oci_request, ":bind7", $train_num);
        oci_bind_by_name($oci_request, ":bind8", $loco1_num);
        oci_bind_by_name($oci_request, ":bind9", $loco1_driver1);
        oci_bind_by_name($oci_request, ":bind10", $loco1_driver2);
        oci_bind_by_name($oci_request, ":bind11", $loco1_conductor);
        oci_bind_by_name($oci_request, ":bind12", $loco2_num);
        oci_bind_by_name($oci_request, ":bind13", $loco2_driver1);
        oci_bind_by_name($oci_request, ":bind14", $loco2_driver2);
        oci_bind_by_name($oci_request, ":bind15", $loco2_conductor);
        oci_bind_by_name($oci_request, ":bind16", $cars);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_saved_send_to_station_forms') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_saved_elems())');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'load_send_to_station_form') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $name = filter_input(INPUT_POST, 'name');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.load_send_to_station_form(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $name);
        oci_execute($oci_request);
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'del_send_to_station_form') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $userID = $auth->getUserId();
        $name = filter_input(INPUT_POST, 'name');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.del_send_to_station_form(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $name);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_all_cars') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_all_cars)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_all_fix_dev') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_all_fix_dev)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_suitable_cars') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $enter_text = filter_input(INPUT_POST, 'enter_text');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_suitable_cars(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $enter_text);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_param_for_xxeam013_1') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $enter_text = filter_input(INPUT_POST, 'enter_text');
        $oci_child = oci_parse($conn, 'select * from table(apps.xx_dislocation_helper.get_param_for_xxeam013_1(:bind1,:bind2))');
        oci_bind_by_name($oci_child, ":bind1", $par1);
        oci_bind_by_name($oci_child, ":bind2", $enter_text);

        oci_execute($oci_child);

        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}



if ($_POST['ajax_action'] === 'add_docs_for_inspection') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $data = array();
        $error = false;
        $files = array();

        $ins_id = filter_input(INPUT_POST, 'ins_id');
        $userID = $auth->getUserId();
        $ins_doc_type_id = filter_input(INPUT_POST, 'ins_doc_type_id');

        $upload_dir_base = 'request_data/';
        $upload_dir_base_add = $upload_dir_base . $ins_id . '/';

        // Создадим папку если её нет
        if (!is_dir($upload_dir_base)) mkdir($upload_dir_base, 0777);
        if (!is_dir($upload_dir_base_add)) mkdir($upload_dir_base_add, 0777);

        // переместим файлы из временной директории в указанную
        foreach ($_FILES as $file) {
                $oci_request = oci_parse($conn, "begin  :bind1 := xx_dislocation.get_inspection_docs_id; end;");
                oci_bind_by_name($oci_request, ":bind1", $ins_doc_id, 900000);
                oci_execute($oci_request);

                $uploaddir = $upload_dir_base_add . $ins_doc_id . '/';
                if (!is_dir($uploaddir)) mkdir($uploaddir, 0777);

                if (move_uploaded_file($file['tmp_name'], $uploaddir . basename($file['name']))) {
                        $real_path = $uploaddir . $file['name'];
                        
                        $oci_request = oci_parse($conn, "begin  :bind1 := xx_dislocation.add_doc_for_inspection(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7); end;");
                        oci_bind_by_name($oci_request, ":bind1", $res, 100);
                        oci_bind_by_name($oci_request, ":bind2", $ins_id);
                        oci_bind_by_name($oci_request, ":bind3", $ins_doc_id);
                        oci_bind_by_name($oci_request, ":bind4", $ins_doc_type_id);
                        oci_bind_by_name($oci_request, ":bind5", $file['name']);
                        oci_bind_by_name($oci_request, ":bind6", $real_path);
                        oci_bind_by_name($oci_request, ":bind7", $userID);
                        oci_execute($oci_request);

                        if ($res === 'done') {
                                $files[] = array("0" => $ins_doc_id, "1" => $real_path, "2" => $file['name']);
                        }
                } else {
                        $error = true;
                }
        }

        $data = $error ? array('error' => 'Ошибка загрузки файлов.') : array('files' => $files);

        echo json_encode($data);
}

if ($_POST['ajax_action'] === 'get_ins_docs') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $inspection_id = filter_input(INPUT_POST, 'inspection_id');
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_ins_docs(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $inspection_id);

        oci_execute($oci_child);

        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'del_ins_doc') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $ins_doc_id = filter_input(INPUT_POST, 'ins_doc_id');
        $oci_request = oci_parse($conn, "begin  :bind1 := xx_dislocation.del_ins_doc(:bind2,:bind3); end;");
        oci_bind_by_name($oci_request, ":bind1", $res, 100);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $ins_doc_id);
        oci_execute($oci_request);

        if ($res === 'done') {
                $file_path = filter_input(INPUT_POST, 'real_path');

                unlink($file_path);

                if (!file_exists($file_path)) {
                        echo 'done';
                }
        } else {
                echo 'fail';
        }
}

if ($_POST['ajax_action'] === 'get_ins_doc_types') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_ins_doc_types)');

        oci_execute($oci_child);

        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'get_cars_with_railways') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $cars = filter_input(INPUT_POST, 'cars');
        $need_railway = filter_input(INPUT_POST, 'need_railway');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.get_cars_with_railways(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $cars);
        oci_bind_by_name($oci_request, ":bind3", $need_railway);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_info_for_car_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;

        $car_number = filter_input(INPUT_POST, 'car_number');
        $info_type = filter_input(INPUT_POST, 'info_type');
        
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.get_info_for_car_request(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $car_number);
        oci_bind_by_name($oci_request, ":bind3", $info_type);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'save_crit_complete_for_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res = null;
        $user_id = filter_input(INPUT_POST, 'user_id') ?? '';
        $criteria_id = filter_input(INPUT_POST, 'criteria_id') ?? '';
        $complete = filter_input(INPUT_POST, 'complete') ?? '';

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_crit_complete_for_request(:bind2,:bind3,:bind4); end;');
        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $criteria_id);
        oci_bind_by_name($oci_request, ":bind4", $complete);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'save_car_complete_for_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $userID = filter_input(INPUT_POST, 'user_id');
        $criteria_id = filter_input(INPUT_POST, 'criteria_id');
        $car_number = filter_input(INPUT_POST, 'car_number');
        $complete = filter_input(INPUT_POST, 'complete');

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_car_complete_for_request(:bind2,:bind3,:bind4,:bind5); end;');
        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $criteria_id);
        oci_bind_by_name($oci_request, ":bind4", $car_number);
        oci_bind_by_name($oci_request, ":bind5", $complete);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'save_crit_close_for_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $user_id = filter_input(INPUT_POST, 'user_id');
        $criteria_id = filter_input(INPUT_POST, 'criteria_id');
        $close = filter_input(INPUT_POST, 'close');
        $close_comment = filter_input(INPUT_POST, 'close_comment');

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_crit_close_for_request(:bind2,:bind3,:bind4,:bind5); end;');
        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $criteria_id);
        oci_bind_by_name($oci_request, ":bind4", $close);
        oci_bind_by_name($oci_request, ":bind5", $close_comment);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'save_car_close_for_request') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_car_close_for_request(:bind2,:bind3,:bind4,:bind5,:bind6); end;');
        $res = null;
        $user_id = filter_input(INPUT_POST, 'user_id') ?? '';
        $criteria_id = filter_input(INPUT_POST, 'criteria_id') ?? '';
        $car_number = filter_input(INPUT_POST, 'car_number') ?? '';
        $close = filter_input(INPUT_POST, 'close') ?? '';
        $close_comment = filter_input(INPUT_POST, 'close_comment') ?? '';

        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $criteria_id);
        oci_bind_by_name($oci_request, ":bind4", $car_number);
        oci_bind_by_name($oci_request, ":bind5", $close);
        oci_bind_by_name($oci_request, ":bind6", $close_comment);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'get_reasons_for_return') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_reasons_for_return)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'return_from_psp') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res = null;
        $user_id = $auth->getUserId();
        $car_numbers = filter_input(INPUT_POST, 'car_numbers') ?? '';
        $return_time = filter_input(INPUT_POST, 'return_time') ?? '';
        $return_reason = filter_input(INPUT_POST, 'return_reason') ?? '';
        $return_comment = filter_input(INPUT_POST, 'return_comment') ?? '';
        $return_correction_reason = filter_input(INPUT_POST, 'return_correction_reason') ?? '';
        $station_operator = filter_input(INPUT_POST, 'station_operator') ?? '';
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.return_from_psp(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8); end;');


        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $car_numbers);
        oci_bind_by_name($oci_request, ":bind4", $return_time);
        oci_bind_by_name($oci_request, ":bind5", $return_reason);
        oci_bind_by_name($oci_request, ":bind6", $return_comment);
        oci_bind_by_name($oci_request, ":bind7", $return_correction_reason);
        oci_bind_by_name($oci_request, ":bind8", $station_operator);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}
if ($_POST['ajax_action'] === 'get_last_cars_train_time') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $cars_number = filter_input(INPUT_POST, 'cars_number');
        $reason = filter_input(INPUT_POST, 'reason');

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.get_last_cars_train_time(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $cars_number);
        oci_bind_by_name($oci_request, ":bind3", $reason);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'get_car_scale_weights') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin xx_dislocation.car_scale_get_data; end;');
        oci_execute($oci_request);

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_car_scale_weights())');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'load_car_scale_weights') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.load_car_scale_weights(:bind2,:bind3,:bind4,:bind5); end;');
        $res = null;
        $user_id = $auth->getUserId();
        $train_id = filter_input(INPUT_POST, 'train_id') ?? '';
        $general_com = filter_input(INPUT_POST, 'general_com') ?? '';
        $cars = filter_input(INPUT_POST, 'cars') ?? '';

        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $train_id);
        oci_bind_by_name($oci_request, ":bind4", $general_com);
        oci_bind_by_name($oci_request, ":bind5", $cars);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'get_car_scale_weights_add') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $car_number = filter_input(INPUT_POST, 'car_number');
        $arrChild = array();

        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_car_scale_weights_add(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $car_number);
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'save_change_weight_car') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_change_weight_car(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $add_data);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_places_for_cont') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $station_id = filter_input(INPUT_POST, 'station_id');
        $area_type = filter_input(INPUT_POST, 'area_type');

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_places_for_cont(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $station_id);
        oci_bind_by_name($oci_request, ":bind2", $area_type);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_add_info_for_conts') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin xx_dislocation.add_conts_for_add_info_tbl(:bind1); xx_dislocation.return_child_add_info_bef; end;');
        oci_bind_by_name($oci_request, ":bind1", $_POST['conts']);
        oci_execute($oci_request);

        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.return_child_add_info)');
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'move_conts') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res = null;
        $user_id = $auth->getUserId();
        $conts = filter_input(INPUT_POST, 'conts') ?? '';
        $place_id = filter_input(INPUT_POST, 'place_id') ?? '';
        $place_type = filter_input(INPUT_POST, 'place_type') ?? '';
        $oper_date = filter_input(INPUT_POST, 'oper_date') ?? '';
        $comment = filter_input(INPUT_POST, 'comment') ?? '';

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.move_conts(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7); end;');

        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $conts);
        oci_bind_by_name($oci_request, ":bind4", $place_id);
        oci_bind_by_name($oci_request, ":bind5", $place_type);
        oci_bind_by_name($oci_request, ":bind6", $oper_date);
        oci_bind_by_name($oci_request, ":bind7", $comment);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'get_cars_from_shop_for_oebs') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $user_id = $auth->getUserId();
        $freight = filter_input(INPUT_POST, 'freight') ?? '';
        $date_from = filter_input(INPUT_POST, 'date_from') ?? '';
        $date_to = filter_input(INPUT_POST, 'date_to') ?? '';
        $status = filter_input(INPUT_POST, 'status') ?? '';
        $type = filter_input(INPUT_POST, 'type') ?? '';

        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_cars_from_shop_for_oebs(:bind1,:bind2,:bind3,:bind4,:bind5,:bind6)) order by id');

        oci_bind_by_name($oci_child, ":bind1", $user_id);
        oci_bind_by_name($oci_child, ":bind2", $freight);
        oci_bind_by_name($oci_child, ":bind3", $date_from);
        oci_bind_by_name($oci_child, ":bind4", $date_to);
        oci_bind_by_name($oci_child, ":bind5", $status);
        oci_bind_by_name($oci_child, ":bind6", $type);

        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'export_shop_info') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $userID = $auth->getUserId();
        $shop_info = filter_input(INPUT_POST, 'shop_info');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.create_output_in_oebs(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $shop_info);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'create_return_invoice_adapter') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res = null;
        $user_id = $auth->getUserId();
        $car_number = filter_input(INPUT_POST, 'car_number') ?? '';
        $otpr = filter_input(INPUT_POST, 'otpr') ?? '';
        $graph = filter_input(INPUT_POST, 'graph') ?? '';
        $recip_address = filter_input(INPUT_POST, 'recip_address') ?? '';
        $recip_telefon = filter_input(INPUT_POST, 'recip_telefon') ?? '';
        $depl_person = filter_input(INPUT_POST, 'depl_person') ?? '';
        $cont_csl = filter_input(INPUT_POST, 'cont_csl') ?? '';

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.create_return_invoice_adapter(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9); end;');
        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $car_number);
        oci_bind_by_name($oci_request, ":bind4", $otpr);
        oci_bind_by_name($oci_request, ":bind5", $graph);
        oci_bind_by_name($oci_request, ":bind6", $recip_address);
        oci_bind_by_name($oci_request, ":bind7", $recip_telefon);
        oci_bind_by_name($oci_request, ":bind8", $depl_person);
        oci_bind_by_name($oci_request, ":bind9", $cont_csl);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'send_invoice_to_etran') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $userID = $auth->getUserId();
        $car_number = filter_input(INPUT_POST, 'car_number');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.send_invoice_to_etran(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $car_number);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'close_return_invoice') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $userID = $auth->getUserId();
        $car_number = filter_input(INPUT_POST, 'car_number');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.close_return_invoice(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $car_number);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'enter_claim') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res = null;
        $user_id = $auth->getUserId();
        $car_number = filter_input(INPUT_POST, 'car_number') ?? '';
        $claim_number = filter_input(INPUT_POST, 'claim_number') ?? '';

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.enter_claim(:bind2,:bind3,:bind4); end;');

        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $car_number);
        oci_bind_by_name($oci_request, ":bind4", $claim_number);
        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'get_claim') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $car_number = filter_input(INPUT_POST, 'car_number');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.get_claim(:bind2); end;');
        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $car_number);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'get_graph_pod') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $claim_number = filter_input(INPUT_POST, 'claim_number');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_graph_pod(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $claim_number);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_claim_otpr') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $claim_number = filter_input(INPUT_POST, 'claim_number');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_claim_otpr(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $claim_number);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_recip_address') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $claim_number = filter_input(INPUT_POST, 'claim_number');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_recip_address(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $claim_number);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_front_end_id') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $car_number = filter_input(INPUT_POST, 'car_number');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.get_front_end_id(:bind2); end;');
        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $car_number);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'get_send_inv_number') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $res;
        $car_number = filter_input(INPUT_POST, 'car_number');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.get_send_inv_number(:bind2); end;');
        oci_bind_by_name($oci_request, ":bind1", $res, 10000);
        oci_bind_by_name($oci_request, ":bind2", $car_number);

        oci_execute($oci_request);

        oci_close($conn);

        echo $res;
}

if ($_POST['ajax_action'] === 'get_claim_info') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $car_number = filter_input(INPUT_POST, 'car_number');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_claim_info(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $car_number);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_depl_person') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_depl_person)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_seal_types') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_seal_types)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_seal_owner_types') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_seal_owner_types)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_inv_cont_csl') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $front_end_id = filter_input(INPUT_POST, 'front_end_id');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_inv_cont_csl(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $front_end_id);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_suitable_claims') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $enter_text = filter_input(INPUT_POST, 'car_enter_textnumber');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_suitable_claims(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $enter_text);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'register_notification_gu') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $result = null;
        $user_id = $auth->getUserId();
        $not_id = filter_input(INPUT_POST, 'not_id') ?? '';
        $cars = filter_input(INPUT_POST, 'cars') ?? '';
        $num = filter_input(INPUT_POST, 'num') ?? '';
        $notification_time = filter_input(INPUT_POST, 'notification_time') ?? '';
        $notification_person_from = filter_input(INPUT_POST, 'notification_person_from') ?? '';
        $comment = filter_input(INPUT_POST, 'comment') ?? '';
        $notification_time_fact = filter_input(INPUT_POST, 'notification_time_fact') ?? '';
        $notification_person_to = filter_input(INPUT_POST, 'notification_person_to') ?? '';
        $crg_pcalid = filter_input(INPUT_POST, 'crg_pcalid') ?? '';
        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.register_notification_gu(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10,:bind11); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 4000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $not_id);
        oci_bind_by_name($oci_request, ":bind4", $cars);
        oci_bind_by_name($oci_request, ":bind5", $num);
        oci_bind_by_name($oci_request, ":bind6", $notification_time);
        oci_bind_by_name($oci_request, ":bind7", $notification_person_from);
        oci_bind_by_name($oci_request, ":bind8", $comment);
        oci_bind_by_name($oci_request, ":bind9", $notification_time_fact);
        oci_bind_by_name($oci_request, ":bind10", $notification_person_to);
        oci_bind_by_name($oci_request, ":bind11", $crg_pcalid);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'export_notif_etran') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.export_notif_etran(:bind2,:bind3,:bind4); end;');
        $not_id = filter_input(INPUT_POST, 'not_id');
        $pcalid = filter_input(INPUT_POST, 'pcalid');
        oci_bind_by_name($oci_request, ":bind1", $result, 4000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $not_id);
        oci_bind_by_name($oci_request, ":bind4", $pcalid);

        oci_execute($oci_request);
        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_notification_gu') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $not_id = filter_input(INPUT_POST, 'not_id');
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_notification_gu(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $not_id);

        oci_execute($oci_child);

        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'check_open_period') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $oper_id = filter_input(INPUT_POST, 'oper_id');
        $date = filter_input(INPUT_POST, 'date');

        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.check_open_period(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $oper_id);
        oci_bind_by_name($oci_request, ":bind3", $date);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_route_statuses') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_route_statuses)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_route_smena') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_route_smena)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'returnStations') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.returnStations)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_locomotives_from_oebs') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_locomotives_from_oebs)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'save_route') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        // Создаем переменные для всех параметров
        $result = null;
        $user_id = $auth->getUserId();
        $route_id = filter_input(INPUT_POST, 'route_id') ?? '';
        $date_from = filter_input(INPUT_POST, 'date_from') ?? '';
        $date_to = filter_input(INPUT_POST, 'date_to') ?? '';
        $status = filter_input(INPUT_POST, 'status') ?? '';
        $smena = filter_input(INPUT_POST, 'smena') ?? '';
        $station = filter_input(INPUT_POST, 'station') ?? '';
        $station_officer = filter_input(INPUT_POST, 'station_officer') ?? '';
        $route_gave = filter_input(INPUT_POST, 'route_gave') ?? '';
        $loco = filter_input(INPUT_POST, 'loco') ?? '';
        $driver1 = filter_input(INPUT_POST, 'driver1') ?? '';
        $driver2 = filter_input(INPUT_POST, 'driver2') ?? '';
        $conductor = filter_input(INPUT_POST, 'conductor') ?? '';
        $com = filter_input(INPUT_POST, 'com') ?? '';

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_route(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10,:bind11,:bind12,:bind13,:bind14,:bind15); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $route_id);
        oci_bind_by_name($oci_request, ":bind4", $date_from);
        oci_bind_by_name($oci_request, ":bind5", $date_to);
        oci_bind_by_name($oci_request, ":bind6", $status);
        oci_bind_by_name($oci_request, ":bind7", $smena);
        oci_bind_by_name($oci_request, ":bind8", $station);
        oci_bind_by_name($oci_request, ":bind9", $station_officer);
        oci_bind_by_name($oci_request, ":bind10", $route_gave);
        oci_bind_by_name($oci_request, ":bind11", $loco);
        oci_bind_by_name($oci_request, ":bind12", $driver1);
        oci_bind_by_name($oci_request, ":bind13", $driver2);
        oci_bind_by_name($oci_request, ":bind14", $conductor);
        oci_bind_by_name($oci_request, ":bind15", $com);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_routes') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }


        $date_from = filter_input(INPUT_POST, 'date_from') ?? '';
        $date_to = filter_input(INPUT_POST, 'date_to') ?? '';
        $smena = filter_input(INPUT_POST, 'smena') ?? '';
        $station = filter_input(INPUT_POST, 'station') ?? '';
        $loco = filter_input(INPUT_POST, 'loco') ?? '';

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_routes(:bind1,:bind2,:bind3,:bind4,:bind5))');
        oci_bind_by_name($oci_request, ":bind1", $date_from);
        oci_bind_by_name($oci_request, ":bind2", $date_to);
        oci_bind_by_name($oci_request, ":bind3", $smena);
        oci_bind_by_name($oci_request, ":bind4", $station);
        oci_bind_by_name($oci_request, ":bind5", $loco);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'save_route_status') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $route_id = filter_input(INPUT_POST, 'route_id');
        $status = filter_input(INPUT_POST, 'status');
        $status_descr = filter_input(INPUT_POST, 'status_descr');

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_route_status(:bind2,:bind3,:bind4,:bind5); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $route_id);
        oci_bind_by_name($oci_request, ":bind4", $status);
        oci_bind_by_name($oci_request, ":bind5", $status_descr);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_route_operations') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_route_operations)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_route_actions') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $date_from = filter_input(INPUT_POST, 'date_from');
        $date_to = filter_input(INPUT_POST, 'date_to');
        $station = filter_input(INPUT_POST, 'station');
        $oper = filter_input(INPUT_POST, 'oper');
        $exists_route = filter_input(INPUT_POST, 'exists_route');


        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_route_actions(:bind1,:bind2,:bind3,:bind4,:bind5))');
        oci_bind_by_name($oci_request, ":bind1", $date_from);
        oci_bind_by_name($oci_request, ":bind2", $date_to);
        oci_bind_by_name($oci_request, ":bind3", $station);
        oci_bind_by_name($oci_request, ":bind4", $oper);
        oci_bind_by_name($oci_request, ":bind5", $exists_route);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_suitable_routes') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $date = filter_input(INPUT_POST, 'date');
        $enter_text = filter_input(INPUT_POST, 'enter_text');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_suitable_routes(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $date);
        oci_bind_by_name($oci_request, ":bind2", $enter_text);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'save_route_links') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $actions = filter_input(INPUT_POST, 'actions');
        $routes = filter_input(INPUT_POST, 'routes');
        $date_from = filter_input(INPUT_POST, 'date_from');
        $date_to = filter_input(INPUT_POST, 'date_to');


        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_route_links(:bind2,:bind3,:bind4,:bind5,:bind6); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $actions);
        oci_bind_by_name($oci_request, ":bind4", $routes);
        oci_bind_by_name($oci_request, ":bind5", $date_from);
        oci_bind_by_name($oci_request, ":bind6", $date_to);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'del_route_links') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $actions = filter_input(INPUT_POST, 'actions');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.del_route_links(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $actions);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_other_route_operations') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_other_route_operations)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_other_operation_descr') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_other_operation_descr)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'save_other_actions') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $user_id = $auth->getUserId();
        $action_id = filter_input(INPUT_POST, 'action_id') ?? '';
        $date_from = filter_input(INPUT_POST, 'date_from') ?? '';
        $date_to = filter_input(INPUT_POST, 'date_to') ?? '';
        $routes = filter_input(INPUT_POST, 'routes') ?? '';
        $station = filter_input(INPUT_POST, 'station') ?? '';
        $oper = filter_input(INPUT_POST, 'oper') ?? '';
        $oper_descr = filter_input(INPUT_POST, 'oper_descr') ?? '';
        $descr = filter_input(INPUT_POST, 'descr') ?? '';
        $cars = filter_input(INPUT_POST, 'cars') ?? '';

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_other_actions(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10,:bind11); end;');

        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $action_id);
        oci_bind_by_name($oci_request, ":bind4", $date_from);
        oci_bind_by_name($oci_request, ":bind5", $date_to);
        oci_bind_by_name($oci_request, ":bind6", $routes);
        oci_bind_by_name($oci_request, ":bind7", $station);
        oci_bind_by_name($oci_request, ":bind8", $oper);
        oci_bind_by_name($oci_request, ":bind9", $oper_descr);
        oci_bind_by_name($oci_request, ":bind10", $descr);
        oci_bind_by_name($oci_request, ":bind11", $cars);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'del_other_actions') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $actions = filter_input(INPUT_POST, 'actions');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.del_other_actions(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $actions);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_other_actions') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $date_from = filter_input(INPUT_POST, 'date_from') ?? '';
        $date_to = filter_input(INPUT_POST, 'date_to') ?? '';
        $station = filter_input(INPUT_POST, 'station') ?? '';
        $oper = filter_input(INPUT_POST, 'oper') ?? '';
        $route = filter_input(INPUT_POST, 'route') ?? '';
        $action_id = filter_input(INPUT_POST, 'action_id') ?? '';
        
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_other_actions(:bind1,:bind2,:bind3,:bind4,:bind5,:bind6))');

        oci_bind_by_name($oci_request, ":bind1", $date_from);
        oci_bind_by_name($oci_request, ":bind2", $date_to);
        oci_bind_by_name($oci_request, ":bind3", $station);
        oci_bind_by_name($oci_request, ":bind4", $oper);
        oci_bind_by_name($oci_request, ":bind5", $route);
        oci_bind_by_name($oci_request, ":bind6", $action_id);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}


if ($_POST['ajax_action'] === 'get_routes_totals') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $date_from = filter_input(INPUT_POST, 'date_from');
        $date_to = filter_input(INPUT_POST, 'date_to');
        $smena = filter_input(INPUT_POST, 'smena');
        $station = filter_input(INPUT_POST, 'station');
        $loco = filter_input(INPUT_POST, 'loco');

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_routes_totals(:bind1,:bind2,:bind3,:bind4,:bind5))');
        oci_bind_by_name($oci_request, ":bind1", $date_from);
        oci_bind_by_name($oci_request, ":bind2", $date_to);
        oci_bind_by_name($oci_request, ":bind3", $smena);
        oci_bind_by_name($oci_request, ":bind4", $station);
        oci_bind_by_name($oci_request, ":bind5", $loco);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'save_route_add') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $result = null;
        $user_id = $auth->getUserId();
        $route_id = filter_input(INPUT_POST, 'route_id') ?? '';
        $fuel_in = filter_input(INPUT_POST, 'fuel_in') ?? '';
        $fuel_out = filter_input(INPUT_POST, 'fuel_out') ?? '';
        $waiting = filter_input(INPUT_POST, 'waiting') ?? '';
        $waiting_hot = filter_input(INPUT_POST, 'waiting_hot') ?? '';
        $waiting_cold = filter_input(INPUT_POST, 'waiting_cold') ?? '';
        $excess_work = filter_input(INPUT_POST, 'excess_work') ?? '';
        $refill = filter_input(INPUT_POST, 'refill') ?? '';
        $fuel_in_input_who = filter_input(INPUT_POST, 'fuel_in_input_who') ?? '';
        $refill_who = filter_input(INPUT_POST, 'refill_who') ?? '';
        $fuel_out_input_who = filter_input(INPUT_POST, 'fuel_out_input_who') ?? '';

        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_route_add(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10,:bind11,:bind12,:bind13); end;');

        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $user_id);
        oci_bind_by_name($oci_request, ":bind3", $route_id);
        oci_bind_by_name($oci_request, ":bind4", $fuel_in);
        oci_bind_by_name($oci_request, ":bind5", $fuel_out);
        oci_bind_by_name($oci_request, ":bind6", $waiting);
        oci_bind_by_name($oci_request, ":bind7", $waiting_hot);
        oci_bind_by_name($oci_request, ":bind8", $waiting_cold);
        oci_bind_by_name($oci_request, ":bind9", $excess_work);
        oci_bind_by_name($oci_request, ":bind10", $refill);
        oci_bind_by_name($oci_request, ":bind11", $fuel_in_input_who);
        oci_bind_by_name($oci_request, ":bind12", $refill_who);
        oci_bind_by_name($oci_request, ":bind13", $fuel_out_input_who);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_flag_route_closed') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $route_id = filter_input(INPUT_POST, 'route_id');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.get_flag_route_closed(:bind2); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $route_id);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_route_operation_details') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $route_id = filter_input(INPUT_POST, 'route_id');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_route_operation_details(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $route_id);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_cars_passport') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $cars = filter_input(INPUT_POST, 'cars');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_cars_passport(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $cars);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_fuel_loco') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_fuel_loco)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_fuel_standart_spr') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_fuel_standart_spr)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'save_fuel_standart') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $row_id = filter_input(INPUT_POST, 'row_id');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_fuel_standart(:bind2,:bind3,:bind4); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $row_id);
        oci_bind_by_name($oci_request, ":bind4", $add_data);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_fuel_standart') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_fuel_standart(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === '-get_control_standart') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_control_standart(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'delete_control_car') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $row_id = filter_input(INPUT_POST, 'row_id');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.delete_control_car(:bind2,:bind3,:bind4); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $row_id);
        oci_bind_by_name($oci_request, ":bind4", $add_data);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}
if ($_POST['ajax_action'] === 'get_stations') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.getStations)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_fixing_side') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_fixing_side(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_railway_part') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $railway_id = filter_input(INPUT_POST, 'railway_id');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_railway_part(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $railway_id);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'save_railway_part') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $part_id = filter_input(INPUT_POST, 'part_id');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_railway_part(:bind2,:bind3,:bind4); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $part_id);
        oci_bind_by_name($oci_request, ":bind4", $add_data);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_fixing_device_rule') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_fixing_device_rule(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'save_fixing_device_rule') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_fixing_device_rule(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $add_data);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_fixing_device') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_fixing_device(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_device_for_assignment') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_device_for_assignment(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_device_for_update') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $userID = $auth->getUserId();
        $params = filter_input(INPUT_POST, 'params');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_device_for_update(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'set_header_value_fix') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $params = filter_input(INPUT_POST, 'params');

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.set_header_value_fix(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_device_for_ondock') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_device_for_ondock(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_parent_storage_place') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_parent_storage_place(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

/* Контроль.Список цветов */
if ($_POST['ajax_action'] === 'get_car_color_select') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_car_color_select(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}
/* Контроль.Список причин */
if ($_POST['ajax_action'] === 'get_control_code_cause') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_control_code_cause(:bind2))');
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}
/* Места хранение. Сохранение */
if ($_POST['ajax_action'] === 'save_storage_place') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_storage_place(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $add_data);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_storage_place') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_storage_place(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                //array_push($arrResult,$tmp);
                //l_device_mas
                //echo 'size='.$tmp['DEVICE_MAS']->size()."  ";
                array_push($arrResult, [
                        'PLACE_ID' => $tmp['PLACE_ID'],
                        'PLACE_NAME' => $tmp['PLACE_NAME'],
                        'CONTROL_COUNT' => $tmp['CONTROL_COUNT'],
                        'TOP_LEVEL' => $tmp['TOP_LEVEL'],
                        'STATION_ID' => $tmp['STATION_ID'],
                        'PARENT_ID' => $tmp['PARENT_ID'],
                        'PARENT_NAME' => $tmp['PARENT_NAME'],
                        'LAST_UPDATE_DATE' => $tmp['LAST_UPDATE_DATE'],
                        'FIXING_PERSON_1' => $tmp['FIXING_PERSON_1'],
                        'FIXING_PERSON_1_DESCR' => $tmp['FIXING_PERSON_1_DESCR'],
                        'FIXING_PERSON_2' => $tmp['FIXING_PERSON_2'],
                        'FIXING_PERSON_2_DESCR' => $tmp['FIXING_PERSON_2_DESCR'],
                        'REMOVE_PERSON_1' => $tmp['REMOVE_PERSON_1'],
                        'REMOVE_PERSON_1_DESCR' => $tmp['REMOVE_PERSON_1_DESCR'],
                        'REMOVE_PERSON_2' => $tmp['REMOVE_PERSON_2'],
                        'REMOVE_PERSON_2_DESCR' => $tmp['REMOVE_PERSON_2_DESCR'],
                        'CONTROL_PERSON_1' => $tmp['CONTROL_PERSON_1'],
                        'CONTROL_PERSON_1_DESCR' => $tmp['CONTROL_PERSON_1_DESCR'],
                        'CONTROL_PERSON_2' => $tmp['CONTROL_PERSON_2'],
                        'CONTROL_PERSON_2_DESCR' => $tmp['CONTROL_PERSON_2_DESCR'],
                        'DESCR' => $tmp['DESCR'],
                        'RAILWAY_MAS' => $tmp['RAILWAY_MAS']->load(),
                        'DEVICE_MAS' => $tmp['DEVICE_MAS']->load(),
                        'CON_PERSON_MAS' => $tmp['CON_PERSON_MAS']->load(),
                        'CON_PERSON_STR' => $tmp['CON_PERSON_STR'],
                        'REP_PERSON_MAS' => $tmp['REP_PERSON_MAS']->load(),
                        'REP_PERSON_STR' => $tmp['REP_PERSON_STR'],
                        'RES_PERSON_MAS' => $tmp['RES_PERSON_MAS']->load(),
                        'RES_PERSON_STR' => $tmp['RES_PERSON_STR'],
                        'DEVICE_STR' => $tmp['DEVICE_STR']->load()
                ]);
        }

        oci_close($conn);
        echo json_encode($arrResult);
}
/* Кто докладывает */
if ($_POST['ajax_action'] === 'get_open_users') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_open_users)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}
/* Кто проводит */
if ($_POST['ajax_action'] === 'get_cond_train_dr') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_cond_train_dr)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}
/*  Часть пути */
if ($_POST['ajax_action'] === 'get_railway_parts') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_railway_parts(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

/*  Название пути */
if ($_POST['ajax_action'] === 'get_railway_add_info') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $railway_id = filter_input(INPUT_POST, 'railway_id');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_railway_add_info(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $railway_id);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_railway_cars') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_railway_cars(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_railway_cars_for_upd') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_railway_cars_for_upd(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

/* Кто проводит (select)*/
if ($_POST['ajax_action'] === 'get_users_for_cond_train') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_users_for_cond_train(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}
/* Кто проводит (select)*/
if ($_POST['ajax_action'] === 'set_users_for_cond_train') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.set_users_for_cond_train(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}
/* Список сторон для пути */
if ($_POST['ajax_action'] === 'get_side_for_device') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_side_for_device(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}


if ($_POST['ajax_action'] === 'get_device_id') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_device_id(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

/* Транзакции закрепления ЗУ. Сохранение */
if ($_POST['ajax_action'] === 'save_transaction_fix_device') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_transaction_fix_device(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $add_data);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

/* Транзакции снятия ЗУ. Сохранение */
if ($_POST['ajax_action'] === 'save_transaction_ondock') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_transaction_ondock(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $add_data);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

/* Update закрепления ЗУ. Сохранение */
if ($_POST['ajax_action'] === 'update_transaction_fix_device') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.update_transaction_fix_device(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $add_data);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'validation_ondock') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.validation_ondock(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $params);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}
if ($_POST['ajax_action'] === 'validation_fix') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.validation_fix(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $params);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}
/* Удаляем (помечаем) ЗУ.*/
if ($_POST['ajax_action'] === 'delete_fix') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.delete_fix(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $params);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}
/* Сохранение. Осмотр ЗУ */
if ($_POST['ajax_action'] === 'enter_dev_inspection') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.enter_dev_inspection(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $params);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}
if ($_POST['ajax_action'] === 'get_suitable_device_rules') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.get_suitable_device_rules(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $params);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_snapshot_wagon') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_snapshot_wagon(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);
        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {

                array_push(
                        $arrResult,
                        [
                                'SNAPSHOT_SHORT' => $tmp['SNAPSHOT_SHORT']->load(),
                                'SNAPSHOT_DETAILED' => $tmp['SNAPSHOT_DETAILED']->load()
                        ]
                );
        }

        oci_close($conn);
        echo json_encode($arrResult);
}
if ($_POST['ajax_action'] === 'get_status_shift') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_status_shift(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'save_shift_change') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        $userID = $auth->getUserId();
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $clob = oci_new_descriptor($conn, OCI_DTYPE_LOB);
        $clob->writeTemporary($_POST['add_data']);
        $oci_request = oci_parse($conn, "declare
									   l_clob clob;
									 begin 
										:bind1 := xx_dislocation.save_shift_change(:bind2,:bind3 ); 
									 end;");

        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        //oci_bind_by_name($oci_request, ':bind3', filter_input(INPUT_POST,'add_data'));
        oci_bind_by_name($oci_request, ':bind3', $clob, -1, OCI_B_CLOB);

        oci_execute($oci_request);
        oci_free_descriptor($clob);
        oci_close($conn);
        echo $result;
}
if ($_POST['ajax_action'] === 'get_smena_change') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_smena_change(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {

                array_push(
                        $arrResult,
                        [
                                'MASS_SHORT_WAG' => $tmp['L_MASS_SHORT_WAG']->load(),
                                'MASS_DETAIL_WAG' => '[]',
                                'REP_PERSON_MAS' => $tmp['REP_PERSON_MAS'],
                                'SMENA_NUM' => $tmp['SMENA_NUM'],
                                'STATUS_NAME' => $tmp['STATUS_NAME'],
                                'STATUS_ID' => $tmp['STATUS_ID'],
                                'LAST_STATUS_ID' => $tmp['LAST_STATUS_ID'],
                                'CREATED_NAME' => $tmp['CREATED_NAME'],
                                'CREATED_DATE' => $tmp['CREATED_DATE'],
                                'RAILWAYS_COUNT' => $tmp['RAILWAYS_COUNT'],
                                'PLACE_COUNT' => $tmp['PLACE_COUNT'],
                                'INCORRECT_RAILWAYS' => $tmp['INCORRECT_RAILWAYS'],
                                'INCORRECT_PLACE' => $tmp['INCORRECT_PLACE'],
                                'INCCORECT_TOTAL' => $tmp['INCCORECT_TOTAL'],
                                'STATION_SHORT_NAME' => $tmp['STATION_SHORT_NAME'],
                                'SIGN_OF_CHANGE' => $tmp['SIGN_OF_CHANGE'],
                                'SHIFT_CHANGE_ID' => $tmp['SHIFT_CHANGE_ID'],
                                'START_DATE_SHIFT' => $tmp['START_DATE_SHIFT'],
                                'SMENA_CHANGE' => $tmp['SMENA_CHANGE'],
                                'SMENA_CHANGE_ID' => $tmp['SMENA_CHANGE_ID'],
                                'USER_CHANGE_ID' => $tmp['USER_CHANGE_ID'],
                                'USER_CHANGE' => $tmp['USER_CHANGE'],
                                'DATE_CHANGE' => $tmp['DATE_CHANGE'],
                                'NOTE_CHANGE' => $tmp['NOTE_CHANGE'],
                                'DEV_CHANGE_TOTAL' => $tmp['DEV_CHANGE_TOTAL'],
                                'DEV_CHANGE_CORRECT' => $tmp['DEV_CHANGE_CORRECT'],
                                'DEV_CHANGE_INCCORECT' => $tmp['DEV_CHANGE_INCCORECT'],
                                'LAST_UPDATE_DATE' => $tmp['LAST_UPDATE_DATE'],
                                'SIGN_OF_RECEPTION' => $tmp['SIGN_OF_RECEPTION'],
                                'SMENA_RECEPTION' => $tmp['SMENA_RECEPTION'],
                                'SMENA_RECEPTION_ID' => $tmp['SMENA_RECEPTION_ID'],
                                'USER_RECEPTION_ID' => $tmp['USER_RECEPTION_ID'],
                                'USER_RECEPTION' => $tmp['USER_RECEPTION'],
                                'DATE_RECEPTION' => $tmp['DATE_RECEPTION'],
                                'NOTE_RECEPTION' => $tmp['NOTE_RECEPTION'],
                                'DEV_RECEPTION_TOTAL' => $tmp['DEV_RECEPTION_TOTAL'],
                                'DEV_RECEPTION_CORRECT' => $tmp['DEV_RECEPTION_CORRECT'],
                                'DEV_RECEPTION_INCCORECT' => $tmp['DEV_RECEPTION_INCCORECT']

                        ]
                );
        }

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_users_for_change') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $credential_id = filter_input(INPUT_POST, 'credential_id');
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_users_for_change(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $credential_id);
        oci_execute($oci_child);
        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

if ($_POST['ajax_action'] === 'save_shift_status') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_shift_status(:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $params);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_route_smena_change') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_route_smena_change)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'save_control_car') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $row_id = filter_input(INPUT_POST, 'row_id');
        $oci_request = oci_parse($conn, 'begin :bind1 := xx_dislocation.save_control_car(:bind2,:bind3,:bind4); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 10000);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $row_id);
        oci_bind_by_name($oci_request, ":bind4", $add_data);

        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

/*******************************************************************************/
/*							Обработка вагонов   							   */
/*******************************************************************************

Функция возвращает список Мэппинг категорий позиций OeBS и наим.груза 
Параметры:
 * 
Возвращаемые данные:
	INVENTORY_ITEM_ID 	- ID ГП позиции
	ITEM_NAME			- Код позиции
	FREIGHT_NAME		- Наименование груза
	CODE_BASE			- Код основания
	FREIGHT_SELECTED	- Сопоставленный груз с параметром [@FREIGHT_NAME]. 0 - не сопоставлен, 1 - сопоставлен
/*******************************************************************************/
if ($_POST['ajax_action'] === 'get_disl_freight_oebs') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_disl_freight_oebs(:bind1))');
        oci_bind_by_name($oci_request, ":bind1", $params);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}
/*******************************************************************************
Функция возвращает список данных по вагону для формы "Обработка вагонов"
Параметры:
 * params - массив данных в формет JSON 
		{car_number} - номер вагона
		{inventory_item_id} - ID позиции
		{trx_date_begin} - Дата начала обработки
		{trx_date_end} - Дата окончания обработки
		
Возвращаемые данные:
	disl_hdr_id			- ID заголовка формы "Обработки вагонов"
    created_by			- ID пользователя (создатель записи)
    created_fio			- ФИО пользователя (создатель записи)
    creation_date		- дата создания 
    last_updated_fio	- ФИО пользователя (послд. обн. записи)
    last_updated_by		- ID пользователя (послд. обн. записи)
    last_update_date	- Дата обновления
    trx_date_begin		- Дата/время начала обработки (формат DD.MM.YYYY HH24:MI)
    trx_date_end		- Дата/время окончания обработки (формат DD.MM.YYYY HH24:MI)
    batch_id			- ID задания
    disl_lines_id		- ID строки формы "Обработки вагонов"
    round_id			- ID оборота (вагона/платформы)
    car_number			- Номер вагона/платформы
    cont_round_id		- ID оборота (контейнера)
    cont_number			- Номер контейнера
    freight_name		- Наименование груза
    inventory_item_id	- ID позиции
    code_base			- Код основания
 *******************************************************************************/
if ($_POST['ajax_action'] === 'get_process_of_wagons') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $params = filter_input(INPUT_POST, 'params');
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_process_of_wagons(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $params);

        oci_execute($oci_child);

        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}

/*******************************************************************************
Функция возвращает список данных по вагону для формы "Обработка вагонов (историческая таблица)"
Параметры:
 * params - массив данных в формет JSON 
		{inventory_item_id} - ID позиции
		{trx_date_begin} - Дата начала обработки
		{trx_date_end} - Дата окончания обработки
		
Возвращаемые данные:
	product					- Продукт (Позиция)
    lot_number				- Партия (Вагон/Контейнер)
    begin_transaction_date	- Дата/время начала 
    end_transaction_date	- Дата/время завершения 
    qty_production			- Кол-во выработка 
    qty_write_off			- Кол-во списание 
	
 *******************************************************************************/
if ($_POST['ajax_action'] === 'get_process_of_wagons_history') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $arrChild = array();
        $params = filter_input(INPUT_POST, 'params');
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_process_of_wagons_history(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $params);

        oci_execute($oci_child);

        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}
/*******************************************************************************
Процедура Сохраняет данные из формы "Обработка вагонов"
Параметры:
 * IN p_user_id - ID пользователя
 * IN params - массив данных в формет JSON
				{
					header_id			- ID заголовка 
					trx_date_begin		- Дата начала обработки (формат даты: DD.MM.YYYY HH24:MI)
					trx_date_end		- Дата окончания обработки (формат даты: DD.MM.YYYY HH24:MI)
					opm_trx_lines		- массив строк
										{
											line_id			- ID строки
											round_id		- ID оборота (вагон/платформы)
											car_number		- Номер вагона/платформы
											cont_number		- Номер контейнера
											freight_name	- Название груза
											item_id			- ID позиции
										}
				}
 * OUT p_result - результат выполнения (массив): done - успешно
                                    fail$MessageError - Ошибка$текст_ошибки
 *******************************************************************************/
if ($_POST['ajax_action'] === 'save_process_of_wagons') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'begin xx_dislocation.save_process_of_wagons(:bind1,:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_bind_by_name($oci_request, ":bind3", $result, 10000);

        oci_execute($oci_request);
        oci_close($conn);
        echo $result;
}

/*******************************************************************************
Процедура заполняет интерфейсную таблицу для создания задания и запускает интерфейс.
Параметры:
 * p_user_id - пользователь
 * p_add_data - массив данных в формет JSON
			{header_id} - ID заголовка 
 * p_result - результат выполнения (массив): done$Message - успешно$Номер_задания
                                    fail$MessageError - ошибка$текст_ошибки
 *******************************************************************************/
if ($_POST['ajax_action'] === 'run_process_of_wagons') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $params = filter_input(INPUT_POST, 'params');
        $userID = $auth->getUserId();
        $oci_request = oci_parse($conn, 'begin xx_dislocation.run_process_of_wagons(:bind1,:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $userID);
        oci_bind_by_name($oci_request, ":bind2", $params);
        oci_bind_by_name($oci_request, ":bind3", $result, 10000);

        oci_execute($oci_request);
        oci_close($conn);
        echo $result;
}
/*******************************************************************************
Функция возвращает список вагонов для формы "Обработка вагонов"
Параметры:
 * p_params - массив данных в формет JSON 
		{car_number} - номер вагона
		
Возвращаемые данные:
	disl_lines_id		- ID строки формы "Обработки вагонов"
    car_number			- Номер вагона/платформы
    cont_number			- Номер контейнера
    freight_name		- Наименование груза
	batch_num			- Номер задания
 *******************************************************************************/
if ($_POST['ajax_action'] === 'add_car_for_process_of_wagons') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $oci_request = oci_parse($conn, 'BEGIN
									   if xx_dislocation.xx_is_number (:bind1) then
										  xx_dislocation.add_cars_for_add_info_tbl (:bind1);
									   else 
										  xx_dislocation.add_cont_for_add_info_tbl (:bind1);
									   end if;
									   
									   BEGIN
										  xx_dislocation.return_child_add_info_bef;
									   EXCEPTION
										  WHEN OTHERS
										  THEN
											 NULL;
									   END;
									   xx_dislocation.update_info_for_proc_of_wagons (:bind1);
									END;');
        oci_bind_by_name($oci_request, ":bind1", $_POST['car_number']);
        oci_execute($oci_request);
        $car_number = filter_input(INPUT_POST, 'car_number');
        $arrChild = array();
        $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.add_car_for_process_of_wagons(:bind1))');
        oci_bind_by_name($oci_child, ":bind1", $car_number);

        oci_execute($oci_child);

        while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrChild, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrChild);
}
if ($_POST['ajax_action'] === 'check_carnumber_in_db') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $car_number = filter_input(INPUT_POST, 'car_number');
        $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.check_carnumber_in_db(:bind2); end;');
        oci_bind_by_name($oci_request, ":bind1", $result, 100);
        oci_bind_by_name($oci_request, ":bind2", $car_number);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}
/*******************************************************************************/

/*******************************************************************************/
/*					ПРОБА и РЕЗУЛЬТЫ										   */
/*******************************************************************************/
if ($_POST['ajax_action'] === 'get_product_for_freight') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_product_for_freight(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $add_data);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);
        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_sample_tbl_header') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_sample_tbl_header(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $add_data);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                //array_push($arrResult, $tmp);

                array_push($arrResult, [
                        'TEST_ID' => $tmp['TEST_ID'],
                        'SAMPLE_CODE' => $tmp['SAMPLE_CODE'],
                        'TITLE' => $tmp['TITLE'],
                        'REQUIRED_T' => $tmp['REQUIRED_T'],
                        'DATA_TYPE' => $tmp['DATA_TYPE'],
                        'MIN_VALUE_NUM' => $tmp['MIN_VALUE_NUM'],
                        'MAX_VALUE_NUM' => $tmp['MAX_VALUE_NUM'],
                        'DISABLED' => $tmp['DISABLED'],
                        'QC_TEST_VALUES' => $tmp['QC_TEST_VALUES']->load()
                ]);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_disl_samples_info') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_disl_samples_info(:bind1,:bind2))');
        oci_bind_by_name($oci_request, ":bind1", $add_data);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                //array_push($arrResult, $tmp);
                array_push($arrResult, [
                        'ID' => $tmp['ID'],
                        'FREIGHT_NAME' => $tmp['FREIGHT_NAME'],
                        'PRODUCT' => $tmp['PRODUCT'],
                        'DATE_POST' => $tmp['DATE_POST'],
                        'CAR_NUMBER' => $tmp['CAR_NUMBER'],
                        'CONT_NUMBER' => $tmp['CONT_NUMBER'],
                        'CONT_COUNT' => $tmp['CONT_COUNT'],
                        'BATCH_NO' => $tmp['BATCH_NO'],
                        'LOT_NUMBER' => $tmp['LOT_NUMBER'],
                        'SHOP_INFO_ID' => $tmp['SHOP_INFO_ID'],
                        'BATCH_ID' => $tmp['BATCH_ID'],
                        'SPEC_ID' => $tmp['SPEC_ID'],
                        'OWNER' => $tmp['OWNER'],
                        'GR_COUNT' => $tmp['GR_COUNT'],
                        'SAMPLE_NO' => $tmp['SAMPLE_NO'],
                        'WEIGHT_NET_TONN' => $tmp['WEIGHT_NET_TONN'],
                        'LOCATOR_ID' => $tmp['LOCATOR_ID'],
                        'SAMPLES' => $tmp['SAMPLES']->load()
                ]);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'export_samples_info') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }
        $userID = $auth->getUserId();
        $add_data = filter_input(INPUT_POST, 'add_data');
        $oci_request = oci_parse($conn, 'begin  xx_dislocation.export_samples_info(:bind1,:bind2,:bind3); end;');
        oci_bind_by_name($oci_request, ":bind1", $add_data);
        oci_bind_by_name($oci_request, ":bind2", $userID);
        oci_bind_by_name($oci_request, ":bind3", $result, 10000);
        oci_execute($oci_request);

        oci_close($conn);

        echo $result;
}

if ($_POST['ajax_action'] === 'get_contract_default_for_gu') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'begin  xx_etw.etw_common_pkg.set_nls_session; commit; end;');
        oci_execute($oci_request);

        $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_contract_default_for_gu)');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);

        echo json_encode($arrResult);
}
/*
if ($_GET['action']==='xx_akm_mail_weight') {
	date_default_timezone_set('Asia/Yekaterinburg');
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  xx_dislocation.xx_akm_mail_weight; commit; end;');
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}*/

if ($_POST['ajax_action'] === 'get_product_name_list') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_etw.xx_dislocation.get_product_name_list())');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);
        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_loadind_status_oebs_list') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_etw.xx_dislocation.get_loadind_status_oebs_list())');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);
        echo json_encode($arrResult);
}

if ($_POST['ajax_action'] === 'get_loadind_type_oebs_list') {
        $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
        if (!$conn) {
                $e = oci_error();
                trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_etw.xx_dislocation.get_loadind_type_oebs_list())');
        oci_execute($oci_request);

        $arrResult = array();
        while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC + OCI_RETURN_NULLS)) {
                array_push($arrResult, $tmp);
        }

        oci_close($conn);
        echo json_encode($arrResult);
}



/*******************************************************************************/
