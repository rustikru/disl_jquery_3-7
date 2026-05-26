<?php
/**
 * head-common.php
 *
 * Общие CSS и JS для всех модулей сайта.
 * Подключать внутри <head> через:
 *   include __DIR__ . '/../../modules/site/head-common.php';
 *
 * Путь $base — всегда корень сайта, независимо от глубины модуля.
 */
$base = '/';
?>
<link rel="stylesheet" href="<?= $base ?>css/site_layout.css" type="text/css">
<link rel="stylesheet" href="<?= $base ?>css/context_menu.css" type="text/css">
<link rel="stylesheet" href="<?= $base ?>css/request_window.css" type="text/css">
<link rel="stylesheet" href="<?= $base ?>jquery/jquery-ui.min.css" type="text/css">
<script src="<?= $base ?>jquery/jquery-3.7.1.js" type="text/javascript"></script>
<!-- <script src="<?= $base ?>jquery/jquery-migrate-3.4.1.js" type="text/javascript"></script> -->
<script src="<?= $base ?>jquery/jquery-ui.js" type="text/javascript"></script>
<script src="<?= $base ?>js/general_function.js" type="text/javascript"></script>
<script src="<?= $base ?>js/jquery.select.js" type="text/javascript"></script>