<?php
session_start(); //Запускаем сессии
include('../login.php');
include('../connection.php');
$auth = new AuthClass();
$rights;
if (isset($_POST["logout"])) {
    $auth->out();
}

if ($auth->isAuth()){
    $rights = $auth->getRights();
    if ($rights['route_add']==='Y'||$rights['route_processing']==='Y'||$rights['route_closing']==='Y'||$auth->isAuthAdmin()){ 
?>
<!DOCTYPE html>
<html> 
    <head>
        <meta charset="utf-8">
        <title>Внутренняя дислокация</title>
        <link rel="stylesheet" href="../css/site_layout.css" type="text/css">
        <link rel="stylesheet" href="../css/context_menu.css" type="text/css">
        <link type="text/css" href="../jquery/jquery-ui.min.css" rel="Stylesheet" />
        <link rel="stylesheet" href="route.css" type="text/css">
        <link rel="stylesheet" href="../css/request_window.css" type="text/css">
        <script src="../jquery/jquery-1.11.3.min.js" type="text/javascript"></script>
		<!-- <script src="../jquery/jquery-3.7.1.js" type="text/javascript"></script>
		<script src="../jquery/jquery-migrate-3.4.1.js" type="text/javascript"></script> -->
        <script src="../jquery/jquery-ui.js" type="text/javascript"></script>
        <script src="../js/general_function.js" type="text/javascript"></script>
        <script src="route.js?ver=2" type="text/javascript"></script>
        <script src="../js/jquery.select.js" type="text/javascript"></script>
    </head>
    <body>
        <div class="wrapper">
            <header>
                <header>
					<?php include('../modules/site/main-top.php'); ?>
				</header>
            </header>
            <div id="tabs" class="tabs">
                <ul>
                    <li><a href="#tabs-1">Маршруты</a></li>
                    <li><a href="#tabs-2">Операции</a></li>
                    <li><a href="#tabs-3">Прочие операции</a></li>
                    <li><a href="#tabs-4">Маршруты (Итоги)</a></li>
                    <li><a href="#tabs-5">Нормы расхода ГСМ</a></li>
                </ul>
                <div id="tabs-1">
                
                </div>
                <div id="tabs-2">

                </div>
                <div id="tabs-3">

                </div>
                <div id="tabs-4">

                </div>
                <div id="tabs-5">

                </div>
            </div>
            <script type="text/javascript">
                $('#tabs').tabs();
            </script>
            <div class="loadImg">
                <img src="../img/ajax-loader.gif" />
            </div>
        </div>
        <footer></footer>
    </body>
</html>
<?php
    }else{
        header("location: /index.php");
        exit();  
    }
}else {
    header("location: /index.php");
    exit();
}
