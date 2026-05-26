<?php
    require_once "db_config.php";
	
	$conn1 = oci_connect($user,$pwd,$db,"AL32UTF8");
	if (!$conn1) {
		$e = oci_error();
		$error = "Не удалось установить сетевое соединение с базой данных.";
		header("location: /error_page.php?msg=".$error);
	}

