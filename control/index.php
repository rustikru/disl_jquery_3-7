<?php
/**
 * control/index.php — Контроль вагонов + Контроль простоев
 */
session_start();

include __DIR__ . '/../login.php';
include __DIR__ . '/../connection.php';

$auth = new AuthClass();

if (isset($_POST['logout'])) {
    $auth->out();
}

if (!$auth->isAuth()) {
    header('location: /index.php');
    exit;
}

$rights = $auth->getRights();
if (!isset($rights['control_cars']) || ($rights['control_cars'] !== 'Y' && !$auth->isAuthAdmin())) {
    header('location: /index.php');
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Внутренняя дислокация</title>
    <?php include __DIR__ . '/../modules/site/head-common.php'; ?>
    <!-- Стили модулей -->
    <link rel="stylesheet" href="control.css" type="text/css">
    <!-- <link rel="stylesheet" href="IdleControl/idleControl.css" type="text/css"> -->
</head>
<body>
    <div class="wrapper">
        <header>
            <header>
                <?php include __DIR__ . '/../modules/site/main-top.php'; ?>
            </header>
        </header>

        <div id="tabs" class="tabs">
            <ul>
                <li><a href="#tabs-5">Контроль вагонов</a></li>
                <li><a href="#tabs-6">Контроль простоев</a></li>
            </ul>

            <div id="tabs-5"></div>
            <div id="tabs-6"></div> 
        </div>

        <script type="text/javascript">
            $('#tabs').tabs();
        </script>

        <div class="loadImg">
            <img src="/img/ajax-loader.gif" />
        </div>
    </div>
    <footer></footer>

    <script src="CarControl/control.js?ver=5" type="text/javascript"></script>
    <script src="IdleControl/IdleControl.js?ver=1"></script>
</body>
</html>