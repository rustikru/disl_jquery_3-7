<?php
session_start(); //Запускаем сессии
include('../connection.php');
global $user;
global $pwd;
global $db;

include('../login.php');
$auth = new AuthClass();

if ($_POST['ajax_action']==='railway_add_info') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_railway_add_info(:bind1))');
    OCIBindByName($oci_child, ":bind1", $_POST['railway_id']);
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($arrChild, $tmp);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='change_parent_for_railway') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.change_parent_for_railway(:bind2,:bind3,:bind4,:bind5); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'id'));
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'type'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'new_parent_id'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'new_parent_type'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='add_railway') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.add_railway(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10,:bind11,:bind12,:bind13,:bind14,:bind15); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'parent_id'));
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'parent_type'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'number'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'purpose'));
    OCIBindByName($oci_request, ":bind6", filter_input(INPUT_POST,'pointer_from'));
    OCIBindByName($oci_request, ":bind7", filter_input(INPUT_POST,'pointer_to'));
    OCIBindByName($oci_request, ":bind8", filter_input(INPUT_POST,'length_limit'));
    OCIBindByName($oci_request, ":bind9", filter_input(INPUT_POST,'length_useful'));
    OCIBindByName($oci_request, ":bind10", filter_input(INPUT_POST,'capacity'));
    OCIBindByName($oci_request, ":bind11", filter_input(INPUT_POST,'add_field1'));
    OCIBindByName($oci_request, ":bind12", filter_input(INPUT_POST,'add_field2'));
    OCIBindByName($oci_request, ":bind13", filter_input(INPUT_POST,'add_field3'));
    OCIBindByName($oci_request, ":bind14", filter_input(INPUT_POST,'disabled'));
    OCIBindByName($oci_request, ":bind15", filter_input(INPUT_POST,'type'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='change_railway_attr') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.change_railway_attr(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10,:bind11,:bind12,:bind13,:bind14); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'railway_id'));
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'number'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'purpose'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'pointer_from'));
    OCIBindByName($oci_request, ":bind6", filter_input(INPUT_POST,'pointer_to'));
    OCIBindByName($oci_request, ":bind7", filter_input(INPUT_POST,'length_limit'));
    OCIBindByName($oci_request, ":bind8", filter_input(INPUT_POST,'length_useful'));
    OCIBindByName($oci_request, ":bind9", filter_input(INPUT_POST,'capacity'));
    OCIBindByName($oci_request, ":bind10", filter_input(INPUT_POST,'add_field1'));
    OCIBindByName($oci_request, ":bind11", filter_input(INPUT_POST,'add_field2'));
    OCIBindByName($oci_request, ":bind12", filter_input(INPUT_POST,'add_field3'));
    OCIBindByName($oci_request, ":bind13", filter_input(INPUT_POST,'disabled'));
    OCIBindByName($oci_request, ":bind14", filter_input(INPUT_POST,'type'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='get_stations') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.getStations)');
    oci_execute($oci_request);

    $arrResult = array();
    while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC+OCI_RETURN_NULLS)) {
            array_push($arrResult, $tmp);
    }

    oci_close($conn);

    echo json_encode($arrResult);
}

if ($_POST['ajax_action']==='add_point') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.add_point(:bind2,:bind3,:bind4,:bind5); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'parent_id'));
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'parent_type'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'name'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'descr'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='change_order_for_railway') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.change_order_for_railway(:bind2,:bind3,:bind4); end;');
    OCIBindByName($oci_request, ":bind1", $result,100);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'id'));
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'type'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'action'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='get_credentials') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_credentials)');
    oci_execute($oci_request);

    $arrResult = array();
    while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC+OCI_RETURN_NULLS)) {
            array_push($arrResult, $tmp);
    }

    oci_close($conn);

    echo json_encode($arrResult);
}
//Не используется
if ($_POST['ajax_action']==='old_get_credential_descr') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_credential_descr(:bind1))');
    OCIBindByName($oci_child, ":bind1", filter_input(INPUT_POST,'credential_id'));
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($arrChild, $tmp);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='get_credential_descr') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_credential_descr_new(:bind1))');
    OCIBindByName($oci_child, ":bind1", filter_input(INPUT_POST,'credential_id'));
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($arrChild, $tmp);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='save_new_credential') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    $oci_request = oci_parse($conn, '
		declare	
		begin
            :bind1:=xx_dislocation.save_new_credential_new(:bind2, :bind3);
		end;');

        OCIBindByName($oci_request, ":bind1", $result,100);
        OCIBindByName($oci_request, ":bind2", $auth->getUserId());
        OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'params'));
        oci_execute($oci_request);
        oci_close($conn);
        echo $result;
}


if ($_POST['ajax_action']==='old_save_new_credential') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, '
		declare
			l_add_data  xx_etw.xx_dislocation.t_xx_user_credential_row;
		begin
			l_add_data.p_credential_name  :=:bind2;
			l_add_data.p_moving_inside_railway  :=:bind3;
			l_add_data.p_moving_inside_shop  :=:bind4;
			l_add_data.p_moving_inside_station  :=:bind5;
			l_add_data.p_moving_between_station  :=:bind6;
			l_add_data.p_change_attribute  :=:bind7;
			l_add_data.p_change_weight  :=:bind8;
			l_add_data.p_enter_inspection  :=:bind9;
			l_add_data.p_enter_inspection_add  :=:bind10;
			l_add_data.p_register_notification  :=:bind11;
			l_add_data.p_entry_foreign_car  :=:bind12;
			l_add_data.p_administrator  :=:bind13;
			l_add_data.p_receive_to_station  :=:bind14;
			l_add_data.p_work_with_groups  :=:bind15;
			l_add_data.p_out_from_ugl  :=:bind16;
			l_add_data.p_add_attribute  :=:bind17;
			l_add_data.p_create_request  :=:bind18;
			l_add_data.p_change_request  :=:bind19;
			l_add_data.p_view_request  :=:bind20;
			l_add_data.p_complete_request  :=:bind21;
			l_add_data.p_del_ins_doc  :=:bind22;
			l_add_data.p_return_from_psp  :=:bind23;
			l_add_data.p_autocreate_request_v  :=:bind24;
			l_add_data.p_autocreate_request_o  :=:bind25;
			l_add_data.p_autocreate_request_t  :=:bind26;
			l_add_data.p_weigh_import  :=:bind27;
			l_add_data.p_weigh_import_corr  :=:bind28;
			l_add_data.p_weigh_delete  :=:bind29;
			l_add_data.p_export_shop_info  :=:bind30;
			l_add_data.p_create_invoice_out  :=:bind31;
			l_add_data.p_send_invoice_to_etran  :=:bind32;
			l_add_data.p_register_notification_gu  :=:bind33;
			l_add_data.p_route_add  :=:bind34;
			l_add_data.p_route_processing  :=:bind35;
			l_add_data.p_route_closing  :=:bind36;
			l_add_data.p_output_defective_cars  :=:bind37;
			l_add_data.p_export_notification_gu  :=:bind38;
			l_add_data.p_fix_dev_rule  :=:bind39;
			l_add_data.p_fix_dev_place  :=:bind40;
			l_add_data.p_enter_dev_inspection  :=:bind41;
			l_add_data.p_fix_dev_add  :=:bind42;
			l_add_data.p_fix_dev_undock  :=:bind43;
			l_add_data.p_fix_dev_update  :=:bind44;
			l_add_data.p_shift_update  :=:bind45;
			l_add_data.p_control_cars  :=:bind46;
			l_add_data.p_weighing_dispatcher  :=:bind47;
			l_add_data.p_process_of_wagons  :=:bind48;
			l_add_data.p_update_of_nsi  :=:bind49;
			l_add_data.p_export_samples  :=:bind50;
			l_add_data.p_entry_foreign_cont  :=:bind51;
			l_add_data.p_scale_type_1831_manual  :=:bind52;
			
			
			
			
			:bind1:=xx_dislocation.save_new_credential(l_add_data);
		end;');
    OCIBindByName($oci_request, ":bind1", $result,100);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'credential_name'));
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'moving_inside_railway'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'moving_inside_shop'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'moving_inside_station'));
    OCIBindByName($oci_request, ":bind6", filter_input(INPUT_POST,'moving_between_station'));
    OCIBindByName($oci_request, ":bind7", filter_input(INPUT_POST,'change_attribute'));
    OCIBindByName($oci_request, ":bind8", filter_input(INPUT_POST,'change_weight'));
    OCIBindByName($oci_request, ":bind9", filter_input(INPUT_POST,'enter_inspection'));
    OCIBindByName($oci_request, ":bind10", filter_input(INPUT_POST,'enter_inspection_add'));
    OCIBindByName($oci_request, ":bind11", filter_input(INPUT_POST,'register_notification'));
    OCIBindByName($oci_request, ":bind12", filter_input(INPUT_POST,'entry_foreign_car'));
    OCIBindByName($oci_request, ":bind13", filter_input(INPUT_POST,'administrator'));
    OCIBindByName($oci_request, ":bind14", filter_input(INPUT_POST,'receive_to_station'));
    OCIBindByName($oci_request, ":bind15", filter_input(INPUT_POST,'work_with_groups'));
    OCIBindByName($oci_request, ":bind16", filter_input(INPUT_POST,'out_from_ugl'));
    OCIBindByName($oci_request, ":bind17", filter_input(INPUT_POST,'add_attribute'));
    OCIBindByName($oci_request, ":bind18", filter_input(INPUT_POST,'create_request'));
    OCIBindByName($oci_request, ":bind19", filter_input(INPUT_POST,'change_request'));
    OCIBindByName($oci_request, ":bind20", filter_input(INPUT_POST,'view_request'));
    OCIBindByName($oci_request, ":bind21", filter_input(INPUT_POST,'complete_request'));
    OCIBindByName($oci_request, ":bind22", filter_input(INPUT_POST,'del_ins_doc'));
    OCIBindByName($oci_request, ":bind23", filter_input(INPUT_POST,'return_from_psp'));
    OCIBindByName($oci_request, ":bind24", filter_input(INPUT_POST,'autocreate_request_v'));
    OCIBindByName($oci_request, ":bind25", filter_input(INPUT_POST,'autocreate_request_o'));
    OCIBindByName($oci_request, ":bind26", filter_input(INPUT_POST,'autocreate_request_t'));
    OCIBindByName($oci_request, ":bind27", filter_input(INPUT_POST,'weigh_import'));
    OCIBindByName($oci_request, ":bind28", filter_input(INPUT_POST,'weigh_import_corr'));
    OCIBindByName($oci_request, ":bind29", filter_input(INPUT_POST,'weigh_delete'));
    OCIBindByName($oci_request, ":bind30", filter_input(INPUT_POST,'export_shop_info'));
    OCIBindByName($oci_request, ":bind31", filter_input(INPUT_POST,'create_invoice_out'));
    OCIBindByName($oci_request, ":bind32", filter_input(INPUT_POST,'send_invoice_to_etran'));
    OCIBindByName($oci_request, ":bind33", filter_input(INPUT_POST,'register_notification_gu'));
    
    OCIBindByName($oci_request, ":bind34", filter_input(INPUT_POST,'route_add'));
    OCIBindByName($oci_request, ":bind35", filter_input(INPUT_POST,'route_processing'));
    OCIBindByName($oci_request, ":bind36", filter_input(INPUT_POST,'route_closing'));
    
    OCIBindByName($oci_request, ":bind37", filter_input(INPUT_POST,'output_defective_cars'));
    OCIBindByName($oci_request, ":bind38", filter_input(INPUT_POST,'export_notification_gu'));
    OCIBindByName($oci_request, ":bind39", filter_input(INPUT_POST,'fix_dev_rule'));
    OCIBindByName($oci_request, ":bind40", filter_input(INPUT_POST,'fix_dev_place'));
	
	OCIBindByName($oci_request, ":bind41", filter_input(INPUT_POST,'enter_dev_inspection'));
	OCIBindByName($oci_request, ":bind42", filter_input(INPUT_POST,'fix_dev_add'));
	OCIBindByName($oci_request, ":bind43", filter_input(INPUT_POST,'fix_dev_undock'));
	OCIBindByName($oci_request, ":bind44", filter_input(INPUT_POST,'fix_dev_update'));
	
	OCIBindByName($oci_request, ":bind45", filter_input(INPUT_POST,'shift_update'));
	OCIBindByName($oci_request, ":bind46", filter_input(INPUT_POST,'control_cars'));
	OCIBindByName($oci_request, ":bind47", filter_input(INPUT_POST,'weighing_dispatcher'));
	OCIBindByName($oci_request, ":bind48", filter_input(INPUT_POST,'process_of_wagons'));
	OCIBindByName($oci_request, ":bind49", filter_input(INPUT_POST,'update_of_nsi'));
	OCIBindByName($oci_request, ":bind50", filter_input(INPUT_POST,'export_samples'));
	OCIBindByName($oci_request, ":bind51", filter_input(INPUT_POST,'entry_foreign_cont'));
	OCIBindByName($oci_request, ":bind52", filter_input(INPUT_POST,'scale_type_1831_manual'));
	
	
	
	
	
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='change_credential') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, '
		declare
			l_add_data  xx_etw.xx_dislocation.t_xx_user_credential_row;
		begin
			l_add_data.p_credential_name  :=:bind3;
			l_add_data.p_moving_inside_railway  :=:bind4;
			l_add_data.p_moving_inside_shop  :=:bind5;
			l_add_data.p_moving_inside_station  :=:bind6;
			l_add_data.p_moving_between_station  :=:bind7;
			l_add_data.p_change_attribute  :=:bind8;
			l_add_data.p_change_weight  :=:bind9;
			l_add_data.p_enter_inspection  :=:bind10;
			
			l_add_data.p_enter_inspection_add  :=:bind11;
			l_add_data.p_register_notification  :=:bind12;
			l_add_data.p_entry_foreign_car  :=:bind13;
			l_add_data.p_administrator  :=:bind14;
			l_add_data.p_receive_to_station  :=:bind15;
			l_add_data.p_work_with_groups  :=:bind16;
			l_add_data.p_out_from_ugl  :=:bind17;
			l_add_data.p_add_attribute  :=:bind18;
			l_add_data.p_create_request  :=:bind19;
			l_add_data.p_change_request  :=:bind20;
			l_add_data.p_view_request  :=:bind21;
			l_add_data.p_complete_request  :=:bind22;
			l_add_data.p_del_ins_doc  :=:bind23;
			l_add_data.p_return_from_psp  :=:bind24;
			l_add_data.p_autocreate_request_v  :=:bind25;
			l_add_data.p_autocreate_request_o  :=:bind26;
			l_add_data.p_autocreate_request_t  :=:bind27;
			l_add_data.p_weigh_import  :=:bind28;
			l_add_data.p_weigh_import_corr  :=:bind29;
			l_add_data.p_weigh_delete  :=:bind30;
			l_add_data.p_export_shop_info  :=:bind31;
			l_add_data.p_create_invoice_out  :=:bind32;
			l_add_data.p_send_invoice_to_etran  :=:bind33;
			l_add_data.p_register_notification_gu  :=:bind34;
			l_add_data.p_route_add  :=:bind35;
			l_add_data.p_route_processing  :=:bind36;
			l_add_data.p_route_closing  :=:bind37;
			l_add_data.p_output_defective_cars  :=:bind38;
			l_add_data.p_export_notification_gu  :=:bind39;
			l_add_data.p_fix_dev_rule  :=:bind40;
			l_add_data.p_fix_dev_place  :=:bind41;
			l_add_data.p_enter_dev_inspection  :=:bind42;
			l_add_data.p_fix_dev_add  :=:bind43;
			l_add_data.p_fix_dev_undock  :=:bind44;
			l_add_data.p_fix_dev_update  :=:bind45;
			l_add_data.p_shift_update  :=:bind46;
			l_add_data.p_control_cars  :=:bind47;
			l_add_data.p_weighing_dispatcher  :=:bind48;
			l_add_data.p_process_of_wagons  :=:bind49;
			l_add_data.p_update_of_nsi  :=:bind50;
			l_add_data.p_export_samples  :=:bind51;
			l_add_data.p_entry_foreign_cont  :=:bind52;
			l_add_data.p_scale_type_1831_manual  :=:bind53;
			
			
			
			
		   
			:bind1:=xx_dislocation.change_credential(:bind2,l_add_data);
		end;');
    OCIBindByName($oci_request, ":bind1", $result,1000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'credential_id'));
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'credential_name'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'moving_inside_railway'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'moving_inside_shop'));
    OCIBindByName($oci_request, ":bind6", filter_input(INPUT_POST,'moving_inside_station'));
    OCIBindByName($oci_request, ":bind7", filter_input(INPUT_POST,'moving_between_station'));
    OCIBindByName($oci_request, ":bind8", filter_input(INPUT_POST,'change_attribute'));
    OCIBindByName($oci_request, ":bind9", filter_input(INPUT_POST,'change_weight'));
    OCIBindByName($oci_request, ":bind10", filter_input(INPUT_POST,'enter_inspection'));
    OCIBindByName($oci_request, ":bind11", filter_input(INPUT_POST,'enter_inspection_add'));
    OCIBindByName($oci_request, ":bind12", filter_input(INPUT_POST,'register_notification'));
    OCIBindByName($oci_request, ":bind13", filter_input(INPUT_POST,'entry_foreign_car'));
    OCIBindByName($oci_request, ":bind14", filter_input(INPUT_POST,'administrator'));
    OCIBindByName($oci_request, ":bind15", filter_input(INPUT_POST,'receive_to_station'));
    OCIBindByName($oci_request, ":bind16", filter_input(INPUT_POST,'work_with_groups'));
    OCIBindByName($oci_request, ":bind17", filter_input(INPUT_POST,'out_from_ugl'));
    OCIBindByName($oci_request, ":bind18", filter_input(INPUT_POST,'add_attribute'));
    OCIBindByName($oci_request, ":bind19", filter_input(INPUT_POST,'create_request'));
    OCIBindByName($oci_request, ":bind20", filter_input(INPUT_POST,'change_request'));
    OCIBindByName($oci_request, ":bind21", filter_input(INPUT_POST,'view_request'));
    OCIBindByName($oci_request, ":bind22", filter_input(INPUT_POST,'complete_request'));
    OCIBindByName($oci_request, ":bind23", filter_input(INPUT_POST,'del_ins_doc'));
    OCIBindByName($oci_request, ":bind24", filter_input(INPUT_POST,'return_from_psp'));
    OCIBindByName($oci_request, ":bind25", filter_input(INPUT_POST,'autocreate_request_v'));
    OCIBindByName($oci_request, ":bind26", filter_input(INPUT_POST,'autocreate_request_o'));
    OCIBindByName($oci_request, ":bind27", filter_input(INPUT_POST,'autocreate_request_t'));
    OCIBindByName($oci_request, ":bind28", filter_input(INPUT_POST,'weigh_import'));
    OCIBindByName($oci_request, ":bind29", filter_input(INPUT_POST,'weigh_import_corr'));
    OCIBindByName($oci_request, ":bind30", filter_input(INPUT_POST,'weigh_delete'));
    OCIBindByName($oci_request, ":bind31", filter_input(INPUT_POST,'export_shop_info'));
    OCIBindByName($oci_request, ":bind32", filter_input(INPUT_POST,'create_invoice_out'));
    OCIBindByName($oci_request, ":bind33", filter_input(INPUT_POST,'send_invoice_to_etran'));
    OCIBindByName($oci_request, ":bind34", filter_input(INPUT_POST,'register_notification_gu'));
    
    OCIBindByName($oci_request, ":bind35", filter_input(INPUT_POST,'route_add'));
    OCIBindByName($oci_request, ":bind36", filter_input(INPUT_POST,'route_processing'));
    OCIBindByName($oci_request, ":bind37", filter_input(INPUT_POST,'route_closing'));
    
    OCIBindByName($oci_request, ":bind38", filter_input(INPUT_POST,'output_defective_cars'));
    OCIBindByName($oci_request, ":bind39", filter_input(INPUT_POST,'export_notification_gu'));
    OCIBindByName($oci_request, ":bind40", filter_input(INPUT_POST,'fix_dev_rule'));
    OCIBindByName($oci_request, ":bind41", filter_input(INPUT_POST,'fix_dev_place'));
	
	OCIBindByName($oci_request, ":bind42", filter_input(INPUT_POST,'enter_dev_inspection'));
	OCIBindByName($oci_request, ":bind43", filter_input(INPUT_POST,'fix_dev_add'));
	OCIBindByName($oci_request, ":bind44", filter_input(INPUT_POST,'fix_dev_undock'));
	OCIBindByName($oci_request, ":bind45", filter_input(INPUT_POST,'fix_dev_update'));
    
	OCIBindByName($oci_request, ":bind46", filter_input(INPUT_POST,'shift_update'));
	OCIBindByName($oci_request, ":bind47", filter_input(INPUT_POST,'control_cars'));
	
	OCIBindByName($oci_request, ":bind48", filter_input(INPUT_POST,'weighing_dispatcher'));
	OCIBindByName($oci_request, ":bind49", filter_input(INPUT_POST,'process_of_wagons'));
	OCIBindByName($oci_request, ":bind50", filter_input(INPUT_POST,'update_of_nsi'));
	OCIBindByName($oci_request, ":bind51", filter_input(INPUT_POST,'export_samples'));
	OCIBindByName($oci_request, ":bind52", filter_input(INPUT_POST,'entry_foreign_cont'));
	OCIBindByName($oci_request, ":bind53", filter_input(INPUT_POST,'scale_type_1831_manual'));
	
	
	
	
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='delete_credential') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.delete_credential(:bind2); end;');
    OCIBindByName($oci_request, ":bind1", $result,100);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'credential_id'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='get_users') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_users)');
    oci_execute($oci_request);

    $arrResult = array();
    while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC+OCI_RETURN_NULLS)) {
            array_push($arrResult, $tmp);
    }

    oci_close($conn);

    echo json_encode($arrResult);
}

if ($_POST['ajax_action']==='get_user_descr') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_user_descr(:bind1))');
    OCIBindByName($oci_child, ":bind1", filter_input(INPUT_POST,'user_id'));
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($arrChild, $tmp);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='add_user') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.add_user(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10,:bind11); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'login'));
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'full_name'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'enterprise'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'division'));
    OCIBindByName($oci_request, ":bind6", filter_input(INPUT_POST,'change_pwd'));
    OCIBindByName($oci_request, ":bind7", filter_input(INPUT_POST,'open'));
    OCIBindByName($oci_request, ":bind8", filter_input(INPUT_POST,'phone_num'));
    OCIBindByName($oci_request, ":bind9", filter_input(INPUT_POST,'default_station'));
    OCIBindByName($oci_request, ":bind10", filter_input(INPUT_POST,'stations'));
    OCIBindByName($oci_request, ":bind11", filter_input(INPUT_POST,'credentials'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='change_user') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.change_user(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10,:bind11,:bind12); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'user_id'));
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'login'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'full_name'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'enterprise'));
    OCIBindByName($oci_request, ":bind6", filter_input(INPUT_POST,'division'));
    OCIBindByName($oci_request, ":bind7", filter_input(INPUT_POST,'change_pwd'));
    OCIBindByName($oci_request, ":bind8", filter_input(INPUT_POST,'open'));
    OCIBindByName($oci_request, ":bind9", filter_input(INPUT_POST,'phone_num'));
    OCIBindByName($oci_request, ":bind10", filter_input(INPUT_POST,'default_station'));
    OCIBindByName($oci_request, ":bind11", filter_input(INPUT_POST,'stations'));
    OCIBindByName($oci_request, ":bind12", filter_input(INPUT_POST,'credentials'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='get_ins_doc_types') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_ins_doc_types)');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($arrChild, $tmp);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='change_ins_doc_type') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.change_ins_doc_type(:bind2,:bind3,:bind4,:bind5); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'type_id'));
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'name'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'descr'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'storage_life'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='create_new_ins_doc_type') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
        $e = oci_error();
        trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.create_new_ins_doc_type(); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='del_ins_doc_type') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
        $e = oci_error();
        trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.del_ins_doc_type(:bind2); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'type_id'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='get_rail_services_rgd') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_rail_services_rgd)');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($arrChild, $tmp);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='save_rail_service_rgd') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.save_rail_service_rgd(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", $auth->getUserId());        
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'id'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'code'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'category'));
    OCIBindByName($oci_request, ":bind6", filter_input(INPUT_POST,'beg_date'));
    OCIBindByName($oci_request, ":bind7", filter_input(INPUT_POST,'end_date'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='del_rail_service_rgd') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
        $e = oci_error();
        trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.del_rail_service_rgd(:bind2); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'id'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='get_rail_services') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_rail_services)');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($arrChild, $tmp);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='save_rail_service') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.save_rail_service(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", $auth->getUserId());   
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'id'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'code'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'descr'));
    OCIBindByName($oci_request, ":bind6", filter_input(INPUT_POST,'descr_full'));
    OCIBindByName($oci_request, ":bind7", filter_input(INPUT_POST,'beg_date'));
    OCIBindByName($oci_request, ":bind8", filter_input(INPUT_POST,'end_date'));
    OCIBindByName($oci_request, ":bind9", filter_input(INPUT_POST,'service_rgd_id'));
    OCIBindByName($oci_request, ":bind10", filter_input(INPUT_POST,'request_tasks'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='del_rail_service') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
        $e = oci_error();
        trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.del_rail_service(:bind2); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'id'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='get_rail_contracts') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_rail_contracts)');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($arrChild, $tmp);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='save_rail_contract') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.save_rail_contract(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9,:bind10); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", $auth->getUserId());  
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'id'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'num'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'descr'));
    OCIBindByName($oci_request, ":bind6", filter_input(INPUT_POST,'owner'));
    OCIBindByName($oci_request, ":bind7", filter_input(INPUT_POST,'freight_owner'));
    OCIBindByName($oci_request, ":bind8", filter_input(INPUT_POST,'freight_owner_short'));
    OCIBindByName($oci_request, ":bind9", filter_input(INPUT_POST,'beg_date'));
    OCIBindByName($oci_request, ":bind10", filter_input(INPUT_POST,'end_date'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='del_rail_contract') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
        $e = oci_error();
        trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.del_rail_contract(:bind2); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'id'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='get_rail_contract_dop') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_rail_contract_dop)');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($arrChild, $tmp);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='save_rail_contract_dop') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.save_rail_contract_dop(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", $auth->getUserId());  
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'id'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'num'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'descr'));
    OCIBindByName($oci_request, ":bind6", filter_input(INPUT_POST,'beg_date'));
    OCIBindByName($oci_request, ":bind7", filter_input(INPUT_POST,'end_date'));
    OCIBindByName($oci_request, ":bind8", filter_input(INPUT_POST,'contract_id'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='del_rail_contract_dop') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
        $e = oci_error();
        trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.del_rail_contract_dop(:bind2); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'id'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='get_rail_contract_change') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_rail_contract_change)');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($arrChild, $tmp);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='get_rail_parent_contracts') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_rail_parent_contracts)');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($arrChild, $tmp);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='save_rail_contract_change') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.save_rail_contract_change(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", $auth->getUserId());  
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'id'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'num'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'descr'));
    OCIBindByName($oci_request, ":bind6", filter_input(INPUT_POST,'beg_date'));
    OCIBindByName($oci_request, ":bind7", filter_input(INPUT_POST,'end_date'));
    OCIBindByName($oci_request, ":bind8", filter_input(INPUT_POST,'contract_id'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='del_rail_contract_change') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
        $e = oci_error();
        trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.del_rail_contract_change(:bind2); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'id'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='get_rail_contract_services') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_rail_contract_services)');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($arrChild, $tmp);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='get_rail_parent_contracts_add') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_rail_parent_contracts_add)');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        array_push($arrChild, $tmp);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='save_rail_contract_services') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.save_rail_contract_services(:bind2,:bind3,:bind4,:bind5,:bind6,:bind7,:bind8,:bind9); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", $auth->getUserId());
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'id'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'contract_id'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'service_id'));
    OCIBindByName($oci_request, ":bind6", filter_input(INPUT_POST,'ei'));
    OCIBindByName($oci_request, ":bind7", filter_input(INPUT_POST,'ei_descr'));
    OCIBindByName($oci_request, ":bind8", filter_input(INPUT_POST,'cost'));
    OCIBindByName($oci_request, ":bind9", filter_input(INPUT_POST,'cost_nds'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='del_rail_contract_services') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
        $e = oci_error();
        trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.del_rail_contract_services(:bind2); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'id'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='add_area') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.add_area(:bind2,:bind3,:bind4,:bind5); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'parent_id'));
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'parent_type'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'name'));
    OCIBindByName($oci_request, ":bind5", filter_input(INPUT_POST,'descr'));
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}

if ($_POST['ajax_action']==='get_periods') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }
    
    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_periods)');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS)) {
        //array_push($arrChild, $tmp);
		array_push($arrChild,['PER_ID' => $tmp['PER_ID']
							 ,'PERIOD' => $tmp['PERIOD']
							 ,'PER_MONTH' => $tmp['PER_MONTH']
							 ,'PER_YEAR' => $tmp['PER_YEAR']
							 ,'PER_FROM' => $tmp['PER_FROM']
							 ,'PER_TO' => $tmp['PER_TO']
							 ,'PERIOD_CLOSING' => $tmp['PERIOD_CLOSING']->load()
		]);
    }
    oci_close($conn);

    echo json_encode($arrChild);
}

if ($_POST['ajax_action']==='get_period_closing') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_period_closing(:bind1))');
    OCIBindByName($oci_request, ":bind1", filter_input(INPUT_POST,'period_id'));
    oci_execute($oci_request);

    $arrResult = array();
    while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC+OCI_RETURN_NULLS)) {
            array_push($arrResult, $tmp);
    }

    oci_close($conn);

    echo json_encode($arrResult);
}

if ($_POST['ajax_action']==='get_period_status') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'select * from table(xx_dislocation.get_period_status)');
    oci_execute($oci_request);

    $arrResult = array();
    while ($tmp = oci_fetch_array($oci_request, OCI_ASSOC+OCI_RETURN_NULLS)) {
            array_push($arrResult, $tmp);
    }

    oci_close($conn);

    echo json_encode($arrResult);
}

if ($_POST['ajax_action']==='save_period_status') {
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $oci_request = oci_parse($conn, 'begin  :bind1 := xx_dislocation.save_period_status(:bind2,:bind3,:bind4,:bind5); end;');
    OCIBindByName($oci_request, ":bind1", $result,1000000);   
    OCIBindByName($oci_request, ":bind2", filter_input(INPUT_POST,'period_id'));
    OCIBindByName($oci_request, ":bind3", filter_input(INPUT_POST,'oper_id'));
    OCIBindByName($oci_request, ":bind4", filter_input(INPUT_POST,'status_id'));
    OCIBindByName($oci_request, ":bind5", $auth->getUserId());   
    oci_execute($oci_request);

    oci_close($conn);

    echo $result;
}