<?php
    session_start(); //Запускаем сессии

    include('../login.php');
    include('../connection.php');
	include('../msg_to_users.php');
	$auth = new AuthClass();
	
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
	
	
	
    $oci_request = oci_parse($conn, "declare
										l_request_id number;
									 begin  
										l_request_id := apps.xx_dislocation_helper.start_xx_etw_disl_009
															(:bind2,
															:bind3,
															to_char(to_date(:bind4,'DD.MM.YYYY HH24:MI'),'YYYY/MM/DD HH24:MI:SS'),
															to_char(to_date(:bind5,'DD.MM.YYYY HH24:MI'),'YYYY/MM/DD HH24:MI:SS'),
															:bind6,
															:bind7); 
										:bind1 := l_request_id;
									 end;");
    OCIBindByName($oci_request, ":bind1", $request_id,100);
    OCIBindByName($oci_request, ":bind2", $auth->getUserId());
    OCIBindByName($oci_request, ":bind3", $_GET['freight']);
    OCIBindByName($oci_request, ":bind4", $_GET['date_from']);
	OCIBindByName($oci_request, ":bind5", $_GET['date_to']);
	OCIBindByName($oci_request, ":bind6", $_GET['status']);
	OCIBindByName($oci_request, ":bind7", $_GET['type']);
	
	
    oci_execute($oci_request);
	
	$blob = oci_new_descriptor($conn, OCI_D_LOB);
    $oci_request_2 = oci_parse($conn, 'begin  :bind1 := xx_etw.xx_dislocation.get_request_data(:bind2,:bind3); commit; end;');
    $const = "excel";    
    oci_bind_by_name($oci_request_2, ':bind1', $blob, -1, OCI_B_BLOB);
    oci_bind_by_name($oci_request_2, ":bind2", $request_id);
    oci_bind_by_name($oci_request_2, ":bind3", $const);
    oci_execute($oci_request_2);
    
	oci_free_statement($oci_request);
	oci_free_statement($oci_request_2);
		
    oci_close($conn);
    
    $img = $blob->load();
    header("Content-type: application/vnd.ms-excel");
    header('Content-disposition: inline;filename='.$request_id.'.xml');
    echo $img;
    
    $blob->free();
?>