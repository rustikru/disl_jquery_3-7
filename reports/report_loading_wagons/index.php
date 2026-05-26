<?php
session_start(); //Запускаем сессии
include('../../login.php');
include('../../connection.php');
$auth = new AuthClass();

if (isset($_POST["logout"])) {
    $auth->out();
}

if ($auth->isAuth()){
    $rights = $auth->getRights();
    if ( 1===1) {
	//if ($rights['control_cars']==='Y'||$auth->isAuthAdmin()){ 
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
		<link type="image/x-icon" href="../../img/ico/ico-road.ico" rel="shortcut icon">
		<link type="Image/x-icon" href="../../img/ico/ico-road.ico" rel="icon">
        <title>Внутренняя дислокация(отчёты)</title>
        <link rel="stylesheet" href="../../css/site_layout.css" type="text/css">
        <link rel="stylesheet" href="../../css/context_menu.css" type="text/css">
        <link rel="stylesheet" href="reports.css" type="text/css">
        <link type="text/css" href="../../jquery/jquery-ui.min.css" rel="Stylesheet" />
        <link rel="stylesheet" href="../../css/tree.css" type="text/css">
        <!--<script src="../jquery/jquery-1.11.3.min.js" type="text/javascript"></script>-->
		<script src="../../jquery/jquery-3.7.1.js" type="text/javascript"></script>
		<script src="../../jquery/jquery-migrate-3.4.1.js" type="text/javascript"></script>
        <script src="../../jquery/jquery-ui.min.js" type="text/javascript"></script>
        <script src="../../js/general_function.js" type="text/javascript"></script>
        <script src="reports.js" type="text/javascript"></script>
    </head>
    <body>
        <div class="wrapper">
            <header>
                <header>
					<?php include('../../modules/site/main-top.php'); ?>
				</header>
            </header>
            <div id="tabs" class="tabs">
                <ul>
                    <li><a href="#tabs-1">Вкладка 1</a></li>
                </ul>
                <div id="tabs-1">

                </div>
            </div>
            <script type="text/javascript">
                $('#tabs').tabs();
            </script>
            <div class="loadImg">
                <img src="../../img/ajax-loader.gif" />
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
