<?php
session_start(); //Запускаем сессии
include('../login.php');
include('../connection.php');
include('modules/adm_railway/adm_railway.php');
include('query/queries.php');
$auth = new AuthClass();

if (isset($_POST["logout"])) {
    $auth->out();
}

if (!$auth->isAuthAdmin()){
    header("location: enter.php");
    exit();
}else{
    $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
    // Получаем данные с помощью функций из queries.php
    $mas_stations = getStations($conn);
    $mas_divisions = getDivisions($conn);
    $mas_credential = getCredentials($conn);
    $mas_rights_list = getRightsList($conn);
    $mas_enterprise = getEnterprise($conn);
    
    // Закрываем соединение с базой
    oci_close($conn);
?>
<!DOCTYPE html>
<html> 
    <head>
        <meta charset="utf-8">
        <title>Внутренняя дислокация</title>
        <!--<script src="../jquery/jquery-1.11.3.min.js" type="text/javascript"></script>-->
		<script src="../jquery/jquery-3.7.1.js" type="text/javascript"></script>
		<script src="../jquery/jquery-migrate-3.4.1.js" type="text/javascript"></script>
        <script src="../jquery/jquery-ui.min.js" type="text/javascript"></script>
        
        <script src="../js/general_function.js" type="text/javascript"></script>
        <link type="text/css" href="../jquery/jquery-ui.min.css" rel="Stylesheet" />

		<link rel="stylesheet" href="../css/site_layout.css?ver=2" type="text/css">
        <link rel="stylesheet" href="../css/context_menu.css" type="text/css">
        <link rel="stylesheet" href="../css/tree.css" type="text/css">
        <link rel="stylesheet" href="modules/adm_main/adm_main.css" type="text/css">
        <script type="text/javascript" src="modules/adm_main/adm_main.js" ></script>
        <link rel="stylesheet" href="modules/adm_railway/adm_railway.css" type="text/css">
        <script type="text/javascript" src="modules/adm_railway/adm_railway.js" ></script>
        
        <link rel="stylesheet" href="modules/adm_credential/adm_credential.css" type="text/css">
        <script type="text/javascript" src="modules/adm_credential/adm_credential.js" ></script>
        
        <script type="text/javascript" src="modules/adm_user/adm_user.js" ></script>
        <link rel="stylesheet" href="modules/adm_user/adm_user.css" type="text/css">

        <link rel="stylesheet" href="modules/directory/css/style.css" type="text/css">
        
        <link rel="stylesheet" href="modules/periods/periods.css" type="text/css">
        <script type="text/javascript" src="modules/periods/periods.js" ></script>

    </head>
    <body>
        <div class="wrapper">
            <header>
				<?php include('modules/site/main-top.php'); ?>
			</header>
			<div id="tabs" class="tabs">
                <ul>
                    <li><a href="#tabs-1">Полномочия</a></li>
                    <li><a href="#tabs-2">Пользователи</a></li>
                    <li><a href="#tabs-3">Пути</a></li>
                    <li><a href="#tabs-4">Справочники</a></li>
                    <li><a href="#tabs-5">Периоды</a></li>
                </ul>
                <div id="tabs-1">
                    <div class="aside new_font">
                        <div class="buttonset" style="margin-top: 5px; margin-left: 15px; margin-bottom: 5px;">
                            <button id="add_new_credential_btn" class="button">
                                <span class="button-text button-text-size-1">Добавить</span>
                            </button>
                        </div>  
                    </div>
                    <div class="section new_font">
                        <div style="display: inline-block;">
                            <div style="display: table">
                                <div class="credential-descr">
                                    <div>
                                        <label>Наименование</label>
                                        <input id="credential_name" maxlength="100" class="text ui-widget-content ui-corner-all">
                                    </div>
                                </div>
                            </div>

                            <div style="display: table" class="border">
                                <div class="header" style="width: 100px;">Права</div>
                                <?php 
                                    foreach ($mas_rights_list as $value) {
                                        echo '<label class="credential-checkbox"> <input id="rights_'.$value['ID'].'" class="credential-input" type="checkbox">'.$value['RIGHTS_NAME'].'</label>';
                                    }
                                ?>
                            </div>
                            <div class="buttonset" style="float: right;">
                                <button id="save_new_credential_btn" class="button">
                                    <span class="button-text button-text-size">Сохранить</span>
                                </button>
                                <button id="change_credential_btn" class="button">
                                    <span class="button-text button-text-size">Изменить</span>
                                </button>
                                <button id="delete_credential_btn" class="button">
                                    <span class="button-text button-text-size">Удалить</span>
                                </button>
                            </div>    
                        </div>
                    </div>
                </div>
                <div id="tabs-2">
                    <div class="aside new_font">
                        <div class="buttonset" style="margin-top: 5px; margin-left: 15px; margin-bottom: 5px;">
                            <button id="add_new_user_btn" class="button">
                                <span class="button-text button-text-size-1">Добавить</span>
                            </button>
                            <!--<input class="btnFind" type="button" size="15" value="Добавить пользователя" onclick="create_modal_dialog_add_user();">-->
                        </div>
                    </div>
                    <div class="section new_font">
                        <div style="display: inline-block;">
                            <div style="display: table">
                                <div class="user-descr">
                                    <div>
                                        <label>Логин</label>
                                        <input id="user_login" maxlength="100" class="text ui-widget-content ui-corner-all">
                                    </div>
                                    <div>
                                        <label>Полное имя (Фамилия И.О.)</label>
                                        <input id="user_full_name" maxlength="100" class="text ui-widget-content ui-corner-all">
                                    </div>
                                    <div>
                                        <label>Предприятие</label>
                                        <select id="user_enterprise">
                                            <option value=""></option>
                                            <?php 
                                                foreach ($mas_enterprise as $value) {
                                                    echo '<option value="'.$value['ID'].'" >'.$value['NAME'].'</option>';
                                                }
                                            ?>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Подразделение</label>
                                        <select id="user_division">
                                            <option value=""></option>
                                            <?php 
                                                foreach ($mas_divisions as $value) {
                                                    echo '<option value="'.$value['ID'].'" >'.$value['NAME'].'</option>';
                                                }
                                            ?>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Сменить пароль</label>
                                        <select id="user_change_pwd">
                                            <option value="Y">Да</option>
                                            <option value="N">Нет</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Станция по-умолчанию</label>
                                        <select id="user_default_station">
                                            <option value="" ></option>;
                                            <?php 
                                                foreach ($mas_stations as $value) {
                                                    echo '<option value="'.$value['ID'].'" >'.$value['NAME'].'</option>';
                                                }
                                            ?>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Открыт</label>
                                        <select id="user_open">
                                            <option value="Y">Да</option>
                                            <option value="N">Нет</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Телефон</label>
                                        <input id="user_phone_num" maxlength="20" style="width:10em" class="text ui-widget-content ui-corner-all">
                                    </div>
                                </div>
                            </div>
                            <div id="user_stations" style="display: table" class="border">
                                <div class="header" style="width: 70px;">Станции</div>
                                <?php 
                                    foreach ($mas_stations as $value) {
                                        echo '<label class="checkbox-label"><input value="'.$value['ID'].'" class="checkbox-input" type="checkbox">'.$value['NAME'].'</label>';
                                    }
                                ?>
                            </div>
                            <div id="user_credentials" style="display: table" class="border">
                                <div class="header" style="width: 100px;">Полномочия</div>
                                <?php 
                                    foreach ($mas_credential as $value) {
                                        echo '<label class="checkbox-label"><input value="'.$value['ID'].'" class="checkbox-input" type="checkbox">'.$value['NAME'].'</label>';
                                    }
                                ?>
                            </div>
                            
                            <div class="buttonset" style="float: right;">
                                <button id="save_new_user_btn" class="button">
                                    <span class="button-text button-text-size">Сохранить</span>
                                </button>
                                <button id="change_user_btn" class="button">
                                    <span class="button-text button-text-size">Изменить</span>
                                </button>
                            </div>    
                        </div>
                    </div>
                </div>
                <div id="tabs-3">
                    <div class="aside">
                        <div id="railways_list">
                            <?php get_tree_with_stations();?>
                        </div>
                    </div>
                    <div class="section">
                        <div style="display: inline-block;">
                            <div style="display: table">
                                <div class="user-descr">
                                    <div>
                                        <label>Путь</label>
                                        <input id="rw_number" maxlength="50" style="width:15em;" class="text ui-widget-content ui-corner-all">
                                    </div>
                                    <div>
                                        <label>Назначение</label>
                                        <input id="rw_purpose" maxlength="100" style="width:20em;" class="text ui-widget-content ui-corner-all">
                                    </div>
                                    <div>
                                        <label>Стрелки огр-ие путь: от</label>
                                        <input id="rw_pointer_from" maxlength="100" style="width:5em;" class="text ui-widget-content ui-corner-all">
                                    </div> 
                                    <div>
                                        <label>Стрелки огр-ие путь: до</label>
                                        <input id="rw_pointer_to" maxlength="100" style="width:5em;" class="text ui-widget-content ui-corner-all">
                                    </div> 
                                    <div>
                                        <label>Длина предельная (метры)</label>
                                        <input id="rw_length_limit" maxlength="100" style="width:5em;" class="text ui-widget-content ui-corner-all">
                                    </div> 
                                    <div>
                                        <label>Длина полезная (метры)</label>
                                        <input id="rw_length_useful" maxlength="100" style="width:5em;" class="text ui-widget-content ui-corner-all">
                                    </div>
                                    <div>
                                        <label>Вместимость</label>
                                        <input id="rw_capacity" maxlength="100" style="width:5em;" class="text ui-widget-content ui-corner-all">
                                    </div>
                                    <div>
                                        <label>Доп. поле 1</label>
                                        <input id="rw_add_field_1" maxlength="100" style="width:15em;" class="text ui-widget-content ui-corner-all">
                                    </div>
                                    <div>
                                        <label>Доп. поле 2</label>
                                        <input id="rw_add_field_2" maxlength="100" style="width:15em;" class="text ui-widget-content ui-corner-all">
                                    </div>
                                    <div>
                                        <label>Доп. поле 3</label>
                                        <input id="rw_add_field_3" maxlength="100" style="width:15em;" class="text ui-widget-content ui-corner-all">
                                    </div>
                                    <div>
                                        <label>Не доступен</label>
                                        <select id="rw_disabled">
                                            <option value=""></option>
                                            <option value="Y">Да</option>
                                            <option value="N">Нет</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Тип пути</label>
                                        <select id="rw_type">
                                            <option value=""></option>
                                            <option value="1">Погрузочно-разгрузочный</option>
                                        </select>
                                    </div>
                                    
                                    <div class="buttonset" style="float: right;">
                                        <button id="save_new_railway_btn" class="button">
                                            <span class="button-text button-text-size">Сохранить</span>
                                        </button>
                                        <button id="change_railway_btn" class="button">
                                            <span class="button-text button-text-size">Изменить</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>   
                    </div>
                </div>
                <div id="tabs-4">
                    <?php include('modules/directory/directory.php');?>
                </div>
                <div id="tabs-5">
                </div>
            </div>
            <script type="text/javascript">
                $('#tabs').tabs();
            </script>
        </div>
        <footer></footer>
    </body>
</html>
<?php
}
