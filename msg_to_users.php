<?php
include('connection.php');

class msg_to_users {
	/*
		Для временного отключения доступа к ИС "Дислокация"
		TYPE = 1-выводит сообщение пользователю, 
		TYPE = 2-переносит пользователя в новое окно
		
		TEXT - Текст сообщения
		
		Например: Уважаемые пользователи, система будет остановлена для планового обновления в 15.00!!!
	*/
    public function get_result(){
        global $user;
        global $pwd;
        global $db;
        
        $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
        if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
        }

        $oci_request = oci_parse($conn, 'select * from table(xx_etw.xx_dislocation.get_msg_to_users)');

        oci_execute($oci_request);

        $result = oci_fetch_array($oci_request, OCI_ASSOC+OCI_RETURN_NULLS);
        
        return $result;
    }
    
    public function check_msg(){
        $answer = $this->get_result();
		
        if (is_array($answer) && isset($answer['TYPE']) && $answer['TYPE'] === '2') {
            header("location: /error_page.php?msg=".$answer['TEXT']);
            exit();
        }
    }
}

