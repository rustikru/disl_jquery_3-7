<?php
session_start(); //Запускаем сессии
include('../login.php');
include('../connection.php');
$auth = new AuthClass();

?>
<!DOCTYPE html>
<html> 
    <head>
        <meta charset="utf-8">
        <title>Внутренняя дислокация</title>
        <link rel="stylesheet" href="../css/site_layout.css" type="text/css">
        <link rel="stylesheet" href="../css/context_menu.css" type="text/css">
        <link type="text/css" href="../jquery/jquery-ui.min.css" rel="Stylesheet" />
        <link rel="stylesheet" href="instructions.css" type="text/css">
        <link rel="stylesheet" href="../css/request_window.css" type="text/css">
        
        <script src="../jquery/jquery-1.11.3.min.js" type="text/javascript"></script>
        <script src="../jquery/jquery-ui.js" type="text/javascript"></script>
        <script src="../js/general_function.js" type="text/javascript"></script>
        <script src="instructions.js?ver=2" type="text/javascript"></script>
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
                    <li><a href="#tabs-5">Инкструкции</a></li>
                </ul>
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
