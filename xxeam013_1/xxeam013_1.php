<?php
    session_start(); //Запускаем сессии

    include('../login.php');
    include('../connection.php');
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");

    $oci_request = oci_parse($conn, 'begin  :bind1 := apps.xx_dislocation_helper.start_xxeam013_1(:bind2,:bind3,:bind4); end;');
    OCIBindByName($oci_request, ":bind1", $request_id,100);
    OCIBindByName($oci_request, ":bind2", $_GET['car_number']);
    OCIBindByName($oci_request, ":bind3", $_GET['inspection_id']);
    OCIBindByName($oci_request, ":bind4", $_GET['user_name']);
    oci_execute($oci_request);
    
    $oci_request_2 = oci_parse($conn, 'begin  :bind1 := xx_etw.xx_dislocation.get_request_data(:bind2); end;');
    $blob = oci_new_descriptor($conn, OCI_D_LOB);
    oci_bind_by_name($oci_request_2, ':bind1', $blob, -1, OCI_B_BLOB);
    oci_bind_by_name($oci_request_2, ":bind2", $request_id);
    oci_execute($oci_request_2);
    
    oci_free_statement($oci_request);
    oci_free_statement($oci_request_2);
    oci_close($conn);
    
    $img = $blob->load();
    header("Content-type: application/pdf");
    header('Content-disposition: inline;filename=1.pdf');
    print $img;
    
    $blob->free();

?>