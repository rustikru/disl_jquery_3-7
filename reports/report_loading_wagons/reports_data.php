<?php
session_start(); //Запускаем сессии

include('../../login.php');
include('../../connection.php');
$auth = new AuthClass();

global $user;
global $pwd;
global $db;

if ($_POST['ajax_action']==='get_report_1_data') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_report_1_data)');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
            array_push($arrChild, $tmp);
    }

    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='get_report_2_data') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_report_2_data)');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
            array_push($arrChild, $tmp);
    }

    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='get_report_3_data') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_report_3_data) order by station, railway, car_number');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
            array_push($arrChild, $tmp);
    }

    oci_close($conn);

    echo json_encode($arrChild);
}
