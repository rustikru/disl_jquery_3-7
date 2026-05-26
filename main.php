<?php
session_start(); //Запускаем сессии
include('login.php');
include('helper.php');
$auth = new AuthClass();
$helper = new helper();
$rights = null;

if (isset($_POST["logout"])) {
    $auth->out();
}
if ($auth->isAuth()&&$auth->getStationId() !== null){
    $rights = $auth->getRights();
//echo '<pre>';
//print_r($_SESSION); // 
//echo '</pre>';
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Внутренняя дислокация</title>
        <link rel="stylesheet" href="css/site_layout.css?ver=2" type="text/css">
        <link rel="stylesheet" href="css/tree.css" type="text/css">
        <link rel="stylesheet" href="css/context_menu.css" type="text/css">
		<link type="image/x-icon" href="img/ico/ico-road.ico" rel="shortcut icon">
		<link type="Image/x-icon" href="img/ico/ico-road.ico" rel="icon">
        <!-- ссылка на календарь http://plugins.jquery.com/datetimepicker/ -->
        <!-- <link rel="stylesheet" href="css/jquery.datetimepicker.css" type="text/css"> -->
        <link rel="stylesheet" href="css/jquery.select.css" type="text/css">
        <link rel="stylesheet" href="css/request_window.css?ver=0" type="text/css">
        <link type="text/css" href="jquery/jquery-ui.min.css" rel="Stylesheet" />
        <link type="text/css" href="css/tooltip.css" rel="Stylesheet" />
		<script src="jquery/3.7/jquery-3.7.1.min.js" type="text/javascript"></script>
        <script src="jquery/3.7/jquery-migrate-3.4.1.js" type="text/javascript"></script>
        <script src="jquery/3.7/jquery-ui.js" type="text/javascript"></script>
        <script src="js/tree.js"></script>
        <script src="js/general_function.js?ver=1"></script> <!-- Контекстная менюшка -->
        <script src="js/jquery.select.js"></script>
        <script src="js/context_menu.js?ver=3"></script>
        <script src="js/site_layout.js"></script>
        <script src="js/request.js?ver=2"></script>
        <!-- <script src="js/jquery.datetimepicker.full.min.js" type="text/javascript"></script> -->
    </head>
    <body>
        <div class="wrapper">
            <header>
				<?php include('modules/site/main-top.php'); ?>
            </header>
            <div class="options">
                <div>
                    <label for="inputFind">Поиск по номеру вагона </label>
                    <input id="inputFind" class="inputFind" maxlength="8" type="text" size="8">
                    <input class="btnFind" type="button" size="15" value="Поиск" onclick="selectFindElements()">  
                    <!--<input class="btnFind" type="button" size="15" value="Тек. user_id" onclick="test_btn()">-->
                </div>
            </div>
            <aside>
				<div>
					<div class="add-btn-window">
						<div class="add-btn-titlebar helper-clearfix">
							<span class="request-title">Доп. кнопки</span>
							<button id="add_btn_turn" title="Скрыть список кнопок" class="add-btn-button add-btn-titlebar-turn-button">
								<span class="request-button-icon request-titlebar-turn-icon"></span>
							</button>
						</div>
						<div id="add_btn_content" class="add-btn-content" style="display: none;">
							<?php if (($auth->getStationId()==='1'||$auth->getStationId()==='2') && $rights['shuntingOperation']==='1') {?>
								<input class="btnFind" style="display: none;" type="button" size="30" value="Обновить данные из КИС" onclick="updateCarsForUgleuralskaya()">
							<?php }?>
							<?php if ($rights['enter_inspection_add']==='Y'||$rights['enter_inspection']==='Y') {?>
								<input id= "inspections_btn" class="btnFind" type="button" size="15" value="Осмотры" onclick="create_md_inspections();">
							<?php }?>
							<?php if ($rights['enter_dev_inspection']==='Y') {?>
								<input id= "inspections_btn_gu" class="btnFind" type="button" size="15" value="Осмотры ЗУ" onclick="create_md_fix_device();">
							<?php }?>
							<?php if ($rights['weigh_import']==='Y') {?>
								<input id= "weigh_import_btn" class="btnFind" type="button" size="20" value="Импорт взвешиваний" onclick="create_md_weigh_import();">
							<?php }?>
							<?php if ('Y'==='Y') {?>
								<input id= "export_shop_info_btn" class="btnFind" type="button" size="20" value="OEBS налив" onclick="create_md_export_shop_info();">
							<?php }?>
							<?php if ('Y'==='Y') {?>
								<input id= "export_gmd_samples_btn" class="btnFind" type="button" size="20" value="OEBS проба" onclick="create_md_export_samples();">
							<?php }?>
							<?php if ('1'==='1') {?>
								<input id= "weigh_result_btn" class="btnFind" type="button" size="15" value="Взвешивания" onclick="create_md_weight_result();">
							<?php }?>
							<?php if ('1'==='1') {?>
								<input id= "car_passport_btn" class="btnFind" type="button" size="15" value="Паспорт вагона" onclick="create_md_cars_passport(false);">
							<?php }?>
							<?php if ($rights['process_of_wagons']==='Y') {?>
								<input id= "processing_wagons_btn" class="btnFind" type="button" size="15" value="Обработка вагонов" onclick="get_processings_of_wagons();">
							<?php }?>
							
							<?php if ($auth->getStationId()==='2' && $rights['entry_foreign_car']==='Y') {?>
								<input id= "entry_foreign_railcar_btn" class="btnFind" style="display:none" type="button" size="15" value="Ввод чужих вагонов" onclick="entry_foreign_railcar();">
							<?php }?>
							<?php if ($rights['entry_foreign_cont']==='Y') {?>
								<input id= "entry_foreign_container_btn" class="btnFind" type="button" size="15" value="Ручной ввод контейнеров" onclick="entry_foreign_container();">
							<?php }?>
							<?php if ($auth->getStationId()==='2' && $rights['register_notification']==='Y') {?>
								<input id= "notification_btn" class="btnFind" style="display:none" type="button" size="15" value="Регистрация уведомлений" onclick="create_modal_dialog_notification();">
							<?php }?>
							<?php if (($auth->getStationId()==='2' && $rights['register_notification_gu']==='Y') || ($rights['administrator']==='Y')) {?>
								<input id= "notification_gu_btn" class="btnFind" type="button" size="15" value="Регистрация уведомлений ГУ" onclick="create_modal_dialog_notification_gu();">
							<?php }?>
							<?php if (($auth->getStationId()==='2' && $rights['export_notification_gu']==='Y') || ($rights['administrator']==='Y')) {?>
								<input id= "open_notification_gu_btn" class="btnFind" type="button" size="15" value="Уведомления ГУ" onclick="create_modal_dialog_list_notification_gu();">
							<?php }?>   
						</div>
					</div>
					<div class="contex-container">
						<!-- <ul class="tree_Container" id="currentCarstree" style="margin-top: 30px;"> -->
						<ul class="tree_Container" id="currentCarstree">
							<li data-id="<?php echo $auth->getStationId();?>" data-type="station" class="tree_Node tree_IsRoot tree_IsLast tree_ExpandOpen">
								<div class="tree_Expand"></div>
								<div class="tree_Content">
									<div id="refreshRailcar" class="refresh" title="Обновить вагоны"></div>
									<select id="selectStation" class="selectStationClass">
									<?php foreach ($helper->returnStations() as $value) {?>
										<option value="<?php echo $value['ID'] ?>" <?php echo $value['ID']==$auth->getStationId() ? 'selected' : ''; ?>><?php echo $value['NAME'] ?></option>
									<?php } ?>
								</select>
								</div>
								<ul class="tree_Container" id="cur_station">
								</ul>
							</li>
						</ul>
						<?php if ($auth->getStationId()!=='1' && $rights['receive_to_station']==='Y') {?>
							<input id= "received_into_station_btn" class="btnFind" type="button" size="15" value="Приём по списку" onclick="create_md_received_into_station_new();">
							<!--<input id= "receivedIntoStationBtnList" class="btnFind" type="button" size="15" value="Приём по списку 2" onclick="createModalDialogReceivedIntoStationBtnList();">-->
						<?php }?>
						<?php /*if ($auth->getStationId()==='1' && $rights['shuntingOperation']==='1') {*/?>
							<input id= "fillRailcarForInvoice" class="btnFind" type="button" size="15" value="Добавить номер вагона" onclick="fill_railcar_for_invoice();">
						<?php /*}*/?>
						<ul class="tree_Container" id="comingCarsTree">
							<li data-id="<?php echo $auth->getStationId();?>" data-type="station" class="tree_Node tree_IsRoot tree_IsLast tree_ExpandOpen">
								<div class="tree_Expand"></div>
								<div class="tree_Content">
									<div id="refreshComingRailcar" class="refresh" title="Обновить приходящие вагоны"></div>
									Подход вагонов
								</div>
								<ul class="tree_Container" id="comingCars">
								</ul>
							</li>
						</ul>
					</div>
				</div>
            </aside>
            <section>
                <table class="addInfoTable">
                    <thead>
                        <tr>
                            <th>Вагон / Платформа</th>
                            <th>Тип</th>
                            <th>Статус</th>
                            <th>Сост.</th>
                            <th>Наим. груза</th>
                            <th>Вес <br>груза</th>
                            <th>Тара</th>
                            <th>Вес <br>брутто</th>
                            <th>Вес <br>с весов</th>
                            <th>№ <br>накладной</th>
                            <th>№ <br>контейнера</th>
                            <th>Пред.</th>
                            <th>Дата <br>прибытия <br>(Угл, мск)</th>
                            <th>Дата <br>посл. <br>опер.</th>
                            <th>Дата операций <br>на произв. площадке</th>
                        </tr>
                    </thead>
                </table>
            </section>
            <div class="loadImg">
                <img src="img/ajax-loader.gif" />
            </div>
        </div>
        <footer></footer>
    </body>
</html>
<?php
}elseif ($auth->isAuth()){
    header("location: /select_station.php");
    exit();
} else {
    header("location: /index.php");
    exit();
}
