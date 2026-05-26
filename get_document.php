<?php
    session_start(); //Запускаем сессии

    include('login.php');
    include('connection.php');
    
    function file_force_download($file,$p_file_name) {
      if (file_exists($file)) {
        // сбрасываем буфер вывода PHP, чтобы избежать переполнения памяти выделенной под скрипт
        // если этого не сделать файл будет читаться в память полностью!
        if (ob_get_level()) {
          ob_end_clean();
        }
        // заставляем браузер показать окно сохранения файла
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename='. $p_file_name);
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        // читаем файл и отправляем его пользователю
        if ($fd = fopen($file, 'rb')) {
          while (!feof($fd)) {
            print fread($fd, 1024);
          }
          fclose($fd);
        }
        exit;
      }
    }
    
    $conn = oci_connect($user,$pwd,$db,"AL32UTF8");
    if (!$conn) {
            $e = oci_error();
            trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $arrChild = array();
    $oci_child = oci_parse($conn, 'select * from table(xx_dislocation.get_ins_doc(:bind1))');
    OCIBindByName($oci_child, ":bind1", $_GET['ins_doc_id']);
    
    oci_execute($oci_child);
    
    $doc_info = oci_fetch_array($oci_child, OCI_ASSOC+OCI_RETURN_NULLS);

    oci_close($conn);    
    
    file_force_download($doc_info['REAL_PATH'],$doc_info['DOC_NAME']);
