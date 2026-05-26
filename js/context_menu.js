var clickedLi;
var user_id;
var user_name;                  /*пользователь*/
var user_admin;                 /*пользователь-админ*/
var user_station_id;            /*станция пользователя*/
var user_station_name;          /*станция пользователя*/
var g_freight_list;             /*Массив продуктов*/
var g_org_name_list				/*Массив организаций*/
var g_scales_type_list;         /*Массив типов весов*/
var g_car_type_list;            /*Массив типов вагонов*/
var g_selected_railcar = [];    /*Массив выбранных вагонов (для сохранения порядка выбора)*/
var g_define_task;				/*Массив Определить задачу*/

//var g_flag_same_parent_selected_railcar = false; /*флаг для определения того, что у выделенных вагонов один родитель(станция,)*/
var g_train_drivers;
var g_conductors;
var g_locomotives;
var g_users_for_naliv;

var g_masters=[];/*Мастер смены (Регистрация осмотров)*/
var g_inspection_persons=[];/*Осмотр произвел (Регистрация осмотров)*/
var g_inspection_results=[];/*Результат осмотра*/

var g_ins_doc_types=[]/*список типов документов осмотра*/;

var g_cars_in_ugl_mas=[];
var g_coming_cars_mas=[];

var g_contract_2gu=[]; // add 08.11.2024 BekmansurovRR по наряду 0000068904  контракты 2ГУ

var g_from_station;
var g_to_station;

/******************************************/
/**										  */
/**			ПОЛНОМОЧИЯ					  */
/**										  */
/******************************************/

var r_moving_inside_railway; /*Перемещение внутри путей (вверх\вниз)*/
var r_moving_inside_shop; /*Перемещение внутри цехов*/
var r_moving_inside_station;/*Перемещение внутри станции*/
var r_moving_between_station; /*Перемещение между станциями*/
var r_change_attribute; /*Изменение атрибутов*/
var r_change_weight; /*Погрузка\разгрузка вагонов*/
var r_enter_inspection; /*Ввод осмотров*/
var r_enter_inspection_add; /*Осмотры (расширенные права)*/
var r_register_notification; /*Регистрация уведомлений*/
var r_entry_foreign_car; /*Ввод чужих вагонов (не из ЭТРАНа)*/
var r_receive_to_station;/*Принятие вагонов*/
var r_work_with_groups;/*Работа с группами*/
var r_out_from_ugl; /*Вывод с Углеуральской*/
var r_add_attribute; /*Добавление типа\груза*/
var r_change_request; /*Изменение заявок*/
var r_view_request;/*Просмотр заявок*/
var r_del_ins_doc;/*Удаление документов осмотра*/
var r_return_from_psp;/*Возврат с ПСП*/
var r_create_request; /* Создание заявок */
var r_weigh_import; /*Импорт с автовесов*/
var r_weigh_import_corr;/*Корректировка импорта с автовесов*/
var r_weigh_delete; /*Удаление взвешиваний*/
var r_export_shop_info; /*Создание выработки в OEBS*/
var r_create_invoice_out;/*Создание накладных на возврат порожняка*/
var r_send_invoice_to_etran;/*Создание накладных на возврат порожняка: отправка в ЭТРАН*/
var r_register_notification_gu; /*Регистрация уведомлений ГУ 26-2б ВЦ*/
var r_output_defective_cars; /*Вывод. Вагон разобран*/
var r_fix_dev_add; /*Полномочия: ЗУ. Назначение*/
var r_fix_dev_undock; /*Полномочия: ЗУ. Уборка*/
var r_fix_dev_update; /*Полномочия: ЗУ. Корректировка*/
var r_weighing_dispatcher; /*Полномочия: Диспетчер "Результаты взвешиваний"*/
var r_process_of_wagons; /*Полномочия: Обработка вагонов*/
var r_update_of_nsi; /*Полномочия: Обновление НСИ*/
var r_scale_type_1831_manual; /*Полномочия: Ручное взвешивание с весов корп.1831 (карбамид)*/
var r_export_samples; /*Загрузка проб в OeBS*/

function check_undefined (p_obj){
	if (typeof p_obj !== typeof undefined && p_obj !== false) {
		return 1;
	}
	else {
		return 0;
	}
}

async function get_server_current_time(){
    try {
        return await $.ajax({ url: 'data.php', type: 'POST', dataType: "text", data: { ajax_action: 'get_current_time' } });
    } catch(e) {
        return 'fail';
    }
}

/*Убираем стандартное контекстное меню*/
document.oncontextmenu = function() {return false;}; 

$(document).ready(function() {
    var $accountButton = $("#accountButton");
    var $accountMenu = $("#dropdownMenu");

    // Обработка клика по кнопке "Мой аккаунт"
    $accountButton.on("click", function (event) {
        event.preventDefault(); // Останавливаем стандартное поведение
        if ($accountMenu.hasClass("active")) {
            $accountMenu.removeClass("active"); // Скрываем меню
        } else {
            $accountMenu.addClass("active"); // Показываем меню
        }
    });

    // Закрытие меню при клике вне области
    $(document).on("click", function (event) {
        if (!$(event.target).closest($accountButton).length && !$(event.target).closest($accountMenu).length) {
            $accountMenu.removeClass("active"); // Скрываем меню
        }
    });
    function test_auth(){
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            /*async:false,*/
            data: { ajax_action: 'get_is_auth'},
            success: function (auth_res) {
                if (auth_res!='1') {
                    document.location.href = "./index.php";
                }
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
    };
    
    function check_msg_to_users(){
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            /*async:false,*/
            data: { ajax_action: 'get_msg_to_users'},
            success: function (data) {
				//console.log(data);
                var result = JSON.parse(data);
                if (result.TYPE == '2') {
                    document.location.href = "./index.php";
                }else if((result.TYPE == '1')){
                    $('#msg_box').text(result.TEXT).show();
                } else if (result.TYPE == undefined){
                    $('#msg_box').hide();
                }
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
    };
	
	
    
    setInterval(function() {
        test_auth();
        check_msg_to_users();
    }, 1000*5*60);
    check_msg_to_users();
    
    /*для кнопки "Добавить номер вагона" меняем цвет фона*/
    changeBackground();
    
	
    /* Загрузка прав пользователя и всех справочников одним запросом */
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: 'json',
        data: { ajax_action: 'get_init_data' },
        success: function (d) {
            var r = d.login;
            user_station_id   = r.stationId;
            user_station_name = r.stationName;
            user_name         = r.userName;
            user_id           = r.user_id;
            user_admin        = (r.administrator === 'Y');

            r_moving_inside_railway    = (r.moving_inside_railway === 'Y');
            r_moving_inside_shop       = (r.moving_inside_shop === 'Y');
            r_moving_inside_station    = (r.moving_inside_station === 'Y');
            r_moving_between_station   = (r.moving_between_station === 'Y');
            r_change_attribute         = (r.change_attribute === 'Y');
            r_change_weight            = (r.change_weight === 'Y');
            r_enter_inspection         = (r.enter_inspection === 'Y');
            r_enter_inspection_add     = (r.enter_inspection_add === 'Y');
            r_register_notification    = (r.register_notification === 'Y');
            r_entry_foreign_car        = (r.entry_foreign_car === 'Y');
            r_receive_to_station       = (r.receive_to_station === 'Y');
            r_work_with_groups         = (r.work_with_groups === 'Y');
            r_out_from_ugl             = (r.out_from_ugl === 'Y');
            r_add_attribute            = (r.add_attribute === 'Y');
            r_create_request           = (r.create_request === 'Y');
            r_change_request           = (r.change_request === 'Y');
            r_view_request             = (r.view_request === 'Y');
            r_del_ins_doc              = (r.del_ins_doc === 'Y');
            r_complete_request         = (r.complete_request === 'Y');
            r_return_from_psp          = (r.return_from_psp === 'Y');
            r_weigh_import             = (r.weigh_import === 'Y');
            r_weigh_import_corr        = (r.weigh_import_corr === 'Y');
            r_weigh_delete             = (r.weigh_delete === 'Y');
            r_export_shop_info         = (r.export_shop_info === 'Y');
            r_create_invoice_out       = (r.create_invoice_out === 'Y');
            r_send_invoice_to_etran    = (r.send_invoice_to_etran === 'Y');
            r_register_notification_gu = (r.register_notification_gu === 'Y');
            r_output_defective_cars    = (r.output_defective_cars === 'Y');
            r_fix_dev_add              = (r.fix_dev_add === 'Y');
            r_fix_dev_undock           = (r.fix_dev_undock === 'Y');
            r_fix_dev_update           = (r.fix_dev_update === 'Y');
            r_weighing_dispatcher      = (r.weighing_dispatcher === 'Y');
            r_process_of_wagons        = (r.process_of_wagons === 'Y');
            r_update_of_nsi            = (r.update_of_nsi === 'Y');
            r_scale_type_1831_manual   = (r.scale_type_1831_manual === 'Y');
            r_export_samples           = (r.export_samples === 'Y');

            g_masters            = d.masters;
            g_inspection_persons = d.inspection_persons;
            g_freight_list       = d.freight_list;
            g_org_name_list      = d.org_name_list;
            g_scales_type_list   = d.scales_type_list;
            g_define_task        = d.define_task_list;
            g_car_type_list      = d.car_type_list;
            g_train_drivers      = d.train_drivers;
            g_conductors         = d.conductors;
            g_locomotives        = d.locomotives;
            g_users_for_naliv    = d.users_for_naliv;
            g_inspection_results = d.ins_results;
            g_ins_doc_types      = d.ins_doc_types;
        },
        error: function (xhr) { window.alert('Ошибка загрузки данных: ' + xhr.status); }
    });
    
    /*обработчик нажатия по дереву*/  
    $('#currentCarstree,#comingCarsTree').on('mousedown', function(event) {
        var target = $(event.target);
        var parentTarget = target.parent(); // Получаем родительский элемент: 
        var cur_cars_tree_station = $('#currentCarstree > li').attr('data-id');

        /*Проверяем нажата ли именно правая кнопка мыши и текущая станция равна станции пользователя*/
        if (event.which === 3){ /*&&(cur_cars_tree_station === user_station_id ||(user_station_id==='2'&&cur_cars_tree_station==='1'))*/
            /*Удаляем предыдущие вызванное контекстное меню*/
            $('.context-menu').remove(); 
            
            var ul = $('<ul/>');
            var clickedDataType;
			var movementUnLoading;      			
            var l_selected_obj = get_selected_objects();
             var clickedLi = parentTarget;
            if (target.parents('#currentCarstree').length!==0 && user_station_id !=='1' ){//ищем родителей с классом #cur_station
                if (target.hasClass('tree_Content')) {
                   
                    clickedDataType = clickedLi.attr('data-type');
					movementUnLoading = clickedLi.attr('movement-un-loading');
                    
                    if (!target.hasClass('tree_selected')) {
                        addInfoAjax(clickedLi,false,$('#selectStation > option:selected').val());
                        $('.tree_selected').removeClass('tree_selected');
                        target.addClass('tree_selected'); 
                    }
                    
                    var l_flag_same_parent_selected_railcar = get_flag_same_parent_selected_railcar();
					
					
                    var l_flag_selected_railcars_not_have_notification = get_flag_selected_railcars_not_have_notification();
                    
                    if (cur_cars_tree_station===user_station_id 
							|| user_admin /*add 10.09.2024 BekmansrurovRR*/
					   ) {                        
                        if ((r_moving_inside_railway)&&l_flag_same_parent_selected_railcar){ 
                            if ((clickedDataType === 'bandwagon' || clickedDataType === 'railcar' || clickedDataType === 'cont')&&($('.tree_selected').length===1)) {
                                ul.append('<li data-action="up">Вверх</li>');
                                ul.append('<li data-action="down">Вниз</li>');
                            }
                        }
                        
                        if (r_moving_inside_station && ((clickedDataType === 'railcar' && l_selected_obj.length===1 && l_selected_obj[0].cont != '')
                            ||(clickedDataType === 'cont' && get_type_selected_elements()=='cont'))){
                            ul.append('<li data-action="move_cont">Переместить контейнера</li>');
                        }
                            
                        if (l_flag_same_parent_selected_railcar){
                            if (r_moving_inside_station&&(clickedDataType === 'bandwagon' || clickedDataType === 'railcar')) {
                                ul.append('<li data-action="move">Переместить внутри станции</li>');
                            }
                            if (r_moving_between_station&&(clickedDataType === 'bandwagon' || clickedDataType === 'railcar')) {
                                ul.append('<li data-action="sendToStation">Отправить на другую станцию</li>');
                            }
                            if (r_work_with_groups&&(clickedDataType === 'railway' || clickedDataType === 'bandwagon')) {
                                ul.append('<li data-action="addBandwagon">Добавить группу</li>');
                            }
                            if (r_work_with_groups&&clickedDataType === 'bandwagon'&&($('.tree_selected').length===1)) {
                                ul.append('<li data-action="deleteBandwagon">Удалить группу</li>');
                            }
                            if ((r_register_notification_gu&&cur_cars_tree_station==='2') 
									//|| user_admin /*add 10.09.2024 BekmansrurovRR*/
								) {
                                ul.append('<li data-action="register_notification_gu">Регистрация уведомлений ГУ</li>');
                            }
                            if (r_output_defective_cars && cur_cars_tree_station ==='3' && l_selected_obj.length!==0 &&
							clickedLi.parents('[output-defective-cars="Y"]').length===1
							/*&& clickedLi.parents('li[data-id="81"][data-type="point"]').length===1 && clickedLi.parents('li[data-id="96"][data-type="railway"]').length===1*/){
                                ul.append('<li data-action="output_cars">Вывод. Вагон разобран</li>');
                            }
                            if (clickedDataType === 'railway') {
								//if (r_fix_dev_add){
									ul.append('<li data-action="add_fix_device">Назначить ЗУ</li>');
								//}
                                //if (r_fix_dev_undock){
									ul.append('<li data-action="undock_fix_device">Снять закрепление ЗУ</li>');
								//}
								//if (r_fix_dev_update){
									ul.append('<li data-action="update_fix_device">Корректировка закреплений ЗУ</li>');
								//}
                            }
                        }         
                    } else if (r_register_notification&&user_station_id ==='2'&&cur_cars_tree_station==='1'&&l_flag_selected_railcars_not_have_notification){
                        ul.append('<li data-action="register_notification">Регистрация уведомлений</li>');
                    } 
                    
                    if (clickedDataType === 'railway' || clickedDataType === 'area') {
                        ul.append('<li data-action="toggle_like_railway">Доб/убрать любимый путь</li>');
                    }
                }
            } 
            else if (target.parents('#comingCars').length!==0){//ищем родителей с классом #comingCars
                if (target.hasClass('tree_Content')) {
                    clickedLi = parentTarget;
                    clickedDataType = clickedLi.attr('data-type');
					movementUnLoading = clickedLi.attr('movement-un-loading');

                    if (!target.hasClass('tree_selected')) {
                        addInfoAjax(clickedLi,false,$('#selectStation > option:selected').val()); 
                        $('.tree_selected').removeClass('tree_selected');
                        target.addClass('tree_selected'); 

                        if (target.parents('#comingCars').length!==0){
                            parentTarget.children('ul').find('.tree_Content').addClass('tree_selected');
                        }
                    }
                    var l_flag_same_parent_selected_railcar = get_flag_same_parent_selected_railcar();
                    var l_flag_selected_railcars_not_have_notification = get_flag_selected_railcars_not_have_notification();
                    var l_flag_can_received_selected_railcars = get_flag_can_received_selected_railcars();
					console.log('l_flag_same_parent_selected_railcar='+l_flag_same_parent_selected_railcar);
					console.log('cur_cars_tree_station='+cur_cars_tree_station);
					console.log('user_station_id='+user_station_id);
					console.log('l_flag_same_parent_selected_railcar='+l_flag_same_parent_selected_railcar);
					console.log('l_flag_can_received_selected_railcars='+l_flag_can_received_selected_railcars);
                    console.log('r_receive_to_station='+r_receive_to_station);

					
					if (l_flag_same_parent_selected_railcar&&(cur_cars_tree_station===user_station_id)) {
                        if (r_receive_to_station&&user_station_id !=='1'&&((user_station_id==='2'&&l_flag_can_received_selected_railcars)||user_station_id!=='2')) {
                            ul.append('<li data-action="receivedIntoStation">Принять</li>');
                        } 
                    } 
                    
                    if ((l_flag_same_parent_selected_railcar&&cur_cars_tree_station ==='1'
                            &&r_out_from_ugl 
                            && ($('.tree_selected').parent('li[data-from_station_id="-1"]').length===0) || (user_admin) /*add 03.03.2026 BekmansurovRR*/) 
                        ){
                        ul.append('<li data-action="send_from_ugl">Вывод из системы</li>');
                    }
                    
                    if (l_flag_same_parent_selected_railcar&&cur_cars_tree_station ==='1'&&r_return_from_psp && $('.tree_selected').parent('li[data-from_station_id="-1"]').length===0){
                        ul.append('<li data-action="return_from_psp">Возврат с ПСП</li>');
                    }
                    
                    if (r_register_notification && user_station_id ==='2'&&cur_cars_tree_station==='1'&&l_flag_selected_railcars_not_have_notification){
                        ul.append('<li data-action="register_notification">Регистрация уведомлений</li>');
                    }
                }
            }
            
            /*проверка прав пользователя: "Изменение атрибутов"*/
            if (r_change_attribute){
				/*Изменяем атрибуты вагона*/
                if ((clickedDataType === 'railcar')&&($('.tree_selected').length===1)) {
                    ul.append('<li data-action="change_attr">Изменить аттрибуты</li>');
                }
				/*Изменяем атрибуты контейнера*/
                if (clickedDataType === 'railcar' && l_selected_obj.length===1 && l_selected_obj[0].cont != ''){
                    ul.append('<li data-action="change_cont_attr_in_car">Изменить аттрибуты контейнера</li>');
                }
				/*Изменяем атрибуты контейнера*/
                if ((clickedDataType === 'cont')&&($('.tree_selected').length===1)) {
                    ul.append('<li data-action="change_cont_attr">Изменить аттрибуты контейнера</li>');
                }
            }
            
            /*форма изменения веса*/
            var l_state = get_selected_objects_state();
            var exists_platform_without_conts = false; // Платформа без контейнеров (Y/No)
            l_selected_obj.forEach(function(obj){
                if (obj.railcar_type === '1' && obj.cont === '') {
                    exists_platform_without_conts = true;
                }
            });
            if (r_change_weight&&!exists_platform_without_conts&&l_flag_same_parent_selected_railcar&&(clickedDataType === 'railcar'||clickedDataType === 'cont')){
                ul.append('<li data-action="change_cars_weight_net">'+(l_state=='empty'?'Погрузка':'Разгрузка')+'</li>');
            }
			//console.log('movementUnLoading='+movementUnLoading);
			if (r_change_weight&&(movementUnLoading == 'Y')&&(clickedDataType === 'railcar'||clickedDataType === 'cont')){
                // add 11.12.2023 BekmansurovRR
				if (l_state!='empty'){
					ul.append('<li data-action="change_cars_weight_net_akm">'+(l_state=='empty'?'Погрузка при перемещении(АКМ)':'Разгрузка при перемещении(АКМ)')+'</li>');
				}
				
            }
            /*форма постановки платформ*/			
			/*
				railcar_type = 0 - вагон
				railcar_type = 1 - платформа
			*/
            if (r_change_weight&&l_selected_obj.length===1&&clickedDataType==='railcar'&&l_selected_obj[0].railcar_type==='1'){
                ul.append('<li data-action="change_pl_cars_weight_net">Постановка платформы</li>');
            }
                        
            if (r_add_attribute && $('.tree_selected').length===1 
                && clickedLi.hasClass('need_fill_attr'))
            {
                ul.append('<li data-action="fill_railcar_attr">Добавить груз/тип</li>');
            }
            
            if (r_enter_inspection && (clickedDataType === 'railcar'||clickedDataType === 'cont') && $('.tree_selected').length===1 && (target.parents('#currentCarstree').length!==0||target.parents('#comingCars').length!==0)) {
                ul.append('<li data-action="enter_inspection">Ввод осмотра</li>');
            }
			if (r_process_of_wagons && r_enter_inspection && clickedDataType === 'railcar' && get_type_selected_elements()=='railcar' && (target.parents('#currentCarstree').length!==0||target.parents('#comingCars').length!==0)) {
				ul.append('<li data-action="processing_of_wagons">Обработка вагонов</li>');
			}
            if (r_enter_inspection && clickedDataType === 'railcar' && get_type_selected_elements()=='railcar' && (target.parents('#currentCarstree').length!==0||target.parents('#comingCars').length!==0)) {
                ul.append('<li data-action="enter_inspection_for_few_cars">Ввод осмотра нескольких вагонов</li>');
            }
            
            if (r_enter_inspection && clickedDataType === 'cont'&& get_type_selected_elements()=='cont' &&(target.parents('#currentCarstree').length!==0||target.parents('#comingCars').length!==0)) {
                ul.append('<li data-action="enter_inspection_for_few_conts">Ввод осмотра нескольких контейнеров</li>');
            }
            
            if (r_create_request&&clickedDataType === 'railcar'){
                ul.append('<li data-action="create_request">Создать заявку</li>');
            }
            
            if (clickedDataType === 'railcar' && $('.tree_selected').length===1 && (target.parents('#currentCarstree').length!==0||target.parents('#comingCars').length!==0)) {
                ul.append('<li data-action="weight_result">Результаты взвешиваний</li>');
            }
            
            if (r_create_invoice_out && $('.tree_selected').length===1 && get_type_selected_elements()=='railcar' && get_flag_can_create_return_invoice()==='Y'){
                ul.append('<li data-action="create_return_invoice">Создать накладную на возврат</li>');
            }
            
            if (clickedDataType === 'railcar' && get_type_selected_elements()=='railcar' && (target.parents('#currentCarstree').length!==0||target.parents('#comingCars').length!==0)) {
                ul.append('<li data-action="cars_passport">Паспорт вагонов</li>');
            }
            if (r_out_from_ugl && user_admin /*add 03.03.2026 BekmansurovRR*/) 
                {
                ul.append('<li data-action="send_from_ugl">Вывод из системы</li>');
            }

            if (ul.children('li').length>0) {
                $('<div/>',{class: 'context-menu'})  // Присваиваем блоку наш css класс контекстного меню:
                .attr('id','context-menu-1lvl')
                .css({                 
                    left: event.pageX+'px', // Задаем позицию меню на X                 
                    top: event.pageY+'px' // Задаем позицию меню по Y             
                })
                .appendTo('body') // Присоединяем наше меню к body документа:             
                .append(ul)
                .on('click',function(event) {
                    contextMenuAction1lvl(event,clickedLi);
                })
                .show('fast'); // Показываем меню с небольшим стандартным эффектом jQuery. Как раз очень хорошо подходит для меню
            } else{
                ul.remove();
            }
        } else if (event.which === 1)  {
            /*Удаляем предыдущие вызванное контекстное меню*/
            $('.context-menu').remove();
            
            if (target.parents('#cur_station, #comingCars').length!==0) {
                if (target.hasClass('tree_Content')) {
                    // если не нажата кнопка ctrl убираем все выделения 
                    if (event.ctrlKey !== true) {
                        $('.tree_selected').removeClass('tree_selected');
                    }
                    /*добавляем/убираем выделение для всех дочерних элементов*/
                    if (parentTarget.attr('data-type')==='bandwagon'||parentTarget.attr('data-type')==='railway'||parentTarget.attr('data-type')==='point'||parentTarget.attr('data-type')==='area') {
                        if (target.hasClass('tree_selected')) parentTarget.children('ul').find('.tree_Content').removeClass('tree_selected');
                        else parentTarget.children('ul').find('.tree_Content').addClass('tree_selected');
                    }
                    /*убираем выделение с родителей*/
                    if (parentTarget.attr('data-type')==='railcar' || parentTarget.attr('data-type')==='cont' || parentTarget.attr('data-type')==='bandwagon'|| parentTarget.attr('data-type')==='point'|| parentTarget.attr('data-type')==='area') {
                        if (target.hasClass('tree_selected')) {
                            parentTarget.parents('li[data-type="bandwagon"]').children('.tree_Content').removeClass('tree_selected');
                            parentTarget.parents('li[data-type="railway"]').children('.tree_Content').removeClass('tree_selected');
                            parentTarget.parents('li[data-type="area"]').children('.tree_Content').removeClass('tree_selected');
                        }
                    }

                    target.toggleClass('tree_selected');
                    
                    var l_flag_selected_railcars_not_have_notification = get_flag_selected_railcars_not_have_notification();
                    if (l_flag_selected_railcars_not_have_notification) {
                        $('#notification_btn').attr('disabled',false);
                    }else{
                        $('#notification_btn').attr('disabled',true);
                    }
                    
                    var l_flag_selected_cars_on_station = get_flag_selected_cars_on_station();
                    if (l_flag_selected_cars_on_station) {
                        $('#notification_gu_btn').attr('disabled',false);
                    }else{
                        $('#notification_gu_btn').attr('disabled',true);
                    }
                    
                    var l_flag_can_received_selected_railcars = get_flag_can_received_selected_railcars();
                    if (l_flag_can_received_selected_railcars) {
                        $('#received_into_station_btn').attr('disabled',false);
                    }else{
                        $('#received_into_station_btn').attr('disabled',true);
                    }
                    
                    /*выводим дополнительную информацию по вагонам*/
                    clickedLi = parentTarget;
                    clickedDataType = clickedLi.attr('data-type');
                    if (clickedDataType === 'bandwagon' || clickedDataType === 'railcar' || clickedDataType === 'railway'|| clickedDataType === 'point'|| clickedDataType === 'area'|| clickedDataType === 'cont') {
                        if (target.hasClass('tree_selected')) {
                            addInfoAjax(clickedLi,event.ctrlKey,$('#selectStation > option:selected').val());
                        } else{
                            remAddInfo(clickedLi);
                        }
                    }
                }
            } 
        }
    }); 
});

/*тестовая вывода тек. пользователя*/
function test_btn (){
   $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        data: { ajax_action: 'getLoginData'
              },
        success: function (data) {
            var result = JSON.parse(data);
            alert('user_id = ' + result.user_id);
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
    
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        data: { ajax_action: 'get_is_auth'
              },
        success: function (data) {
            alert(data);
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
    
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        data: { ajax_action: 'auth_out'
              },
        success: function (data) {
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
}

/*устарел нужнно везде заменить. Новая ф-ция в файле general_fanction.js*/
function create_info_modal_dialog (p_title,p_msg){
    $('#modalDialog,#md_lvl_2').remove();
    $('<div/>')
        .attr('id','modalDialog')
        .attr('title',p_title)
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append('<p>'+p_msg+'</p>');
    $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: '400px',
        draggable: false,
        buttons:{
            'Закрыть': function(){
                $(this).dialog( "close" );
            }       
        }
    });
}

/*в дереве могут быть не только вагоны но и контейнера*/
function get_selected_objects(){
    var l_cars = [];
    $('table.addInfoTable tbody tr:not(:last)').each(function(){
        var l_car = {};
        l_car.obj_number = $(this).children('td:nth-child(1)').text();
        l_car.obj_type = $(this).children('td:nth-child(20)').text();
        l_car.freight = $(this).children('td:nth-child(5)').text();
        l_car.weight_net = $(this).children('td:nth-child(6)').text();
        l_car.weight_dep = $(this).children('td:nth-child(7)').text();
        l_car.weight_gross = $(this).children('td:nth-child(8)').text();
        l_car.length = $(this).children('td:nth-child(16)').text();
        l_car.type = $(this).children('td:nth-child(2)').text();
        l_car.cont = $(this).children('td:nth-child(19)').text();
        l_car.owner = $(this).children('td:nth-child(12)').text();
        l_car.can_create_return_invoice = $(this).children('td:nth-child(21)').text();
        l_car.railcar_type = $(this).children('td:nth-child(22)').text();
        l_car.status_nsi = $(this).children('td:nth-child(3)').text(); // add 26/10/2022 BekmansurovRR Статус НСИ
		l_car.un_loading_subs = $(this).children('td:nth-child(23)').text(); // add 27/12/2022 BekmansurovRR Погрузка/Разгрузка при перемещении на конкретных путях
		
        l_cars.push(l_car);
    });
    return l_cars;
}

function get_selected_cars(){
    var l_cars = [];
    $('table.addInfoTable tbody tr:not(:last)').each(function(){
        var l_car = {};
        l_car.car_number = $(this).children('td:nth-child(1)').text();
        l_car.freight = $(this).children('td:nth-child(5)').text();
        l_car.weight_net = $(this).children('td:nth-child(6)').text();
        l_car.weight_dep = $(this).children('td:nth-child(7)').text();
        l_car.weight_gross = $(this).children('td:nth-child(8)').text();
        l_car.length = $(this).children('td:nth-child(16)').text();
        l_car.type = $(this).children('td:nth-child(2)').text();
        l_car.cont = $(this).children('td:nth-child(19)').text();
        l_car.owner = $(this).children('td:nth-child(12)').text();
		l_car.cond_length_train = $(this).children('td:nth-child(24)').text();
        
        l_cars.push(l_car);
    });
    return l_cars;
}

function returnSelectedElem(){
    var param = '';
    $('table.addInfoTable tbody tr:not(:last)').each(function(){
        param+= $(this).children('td:nth-child(1)').text() + '|' + 'railcar' + '$';
    });
    
    return param;
}
/*используем в дальнейшем эту функцию а не returnSelectedElem*/
function return_selected_cars(){
    var param = '';
    $('table.addInfoTable tbody tr:not(:last)').each(function(){
        param+= $(this).children('td:nth-child(1)').text() + '|';
    });
    
    return param;
}

/*функция определяет одинаковые предки(станция - местоположение) ли у выделенных элементов*/
function get_flag_same_parent_selected_railcar(){
    var prev_station_id = null;
    var prev_location =null;
    var cur_station_id = null;
    var cur_location = null;
    var l_flag = true;

    $('.tree_selected').each(function(index){
        cur_station_id = $(this).parents('li[data-type="station"]').attr('data-id');
        cur_location =  ($(this).parents('ul#currentCarstree').length === 1) ? 'in_station' : 'coming_to_station';
    
        if (((prev_station_id!==cur_station_id)||(prev_location!==cur_location))&&prev_station_id!==null){
            l_flag = false;
            return;
        }
        
        prev_station_id = cur_station_id;
        prev_location = cur_location;
    });
    return l_flag;
}

/*функция определяет что все выбранные элементы на станции*/
function get_flag_selected_cars_on_station(){
    //var cur_station_id = null;
    var cur_location = null;
    var l_flag = true;

    $('.tree_selected').each(function(index){
        //cur_station_id = $(this).parents('li[data-type="station"]').attr('data-id');
        cur_location =  ($(this).parents('ul#currentCarstree').length === 1) ? 'in_station' : 'coming_to_station';
    
        if (cur_location === 'coming_to_station'){
            l_flag = false;
            return;
        }
    });
    return l_flag;
}

/*функция определяет нужно ли выводить пункт "Регистрация уведомлений"*/
function get_flag_selected_railcars_not_have_notification(){
    var l_flag = true;

    $('.tree_selected').each(function(index){
        if ($(this).parent().attr('data-notification')=== 'Y'||$(this).parent().attr('data-from_station_id')=== '2'){
            l_flag = false;
            return;
        }    
    });
    return l_flag;
}

/*возвращает тип выделенных элементов*/
function get_type_selected_elements(){
    var l_prev_type = null; 
    var l_type = null;
    $('.tree_selected').each(function(){
        l_type = $(this).parent().attr('data-type');
        
        if (l_prev_type != 'other' && (l_type == 'railcar'||l_type == 'cont')){
            if (l_prev_type == null){
                l_prev_type = l_type;
            }else if(l_prev_type == l_type){
                null;
            }else{
                l_prev_type = 'other';
            }
        }
    });
    return l_prev_type;
}

function get_cars_state(p_mas_cars_weight){
    var count_empty = 0;
    var count_loaded = 0;
    
    p_mas_cars_weight.forEach(function(item){
        if (item==0){
            count_empty++;
        } else{
            count_loaded++;
        }
    });
    
    return (count_empty>count_loaded?'empty':'loaded');
}
function get_selected_objects_state(){
    var mas=[];
    var cars  = get_selected_objects();
    cars.forEach(function(p_car){
        mas.push(p_car.weight_net);
    });
    
    return get_cars_state(mas);
}
/* Список контейнеров по конкретному вагону */
async function get_car_containers(p_car_number){
    try {
        return JSON.parse(await $.ajax({ url: 'data.php', type: 'POST', dataType: "text", data: { car_number: p_car_number, ajax_action: 'get_car_containers' } }));
    } catch(e) {
        window.alert(e);
        return [];
    }
}

/*функция определяет нужно ли выводить пункт "Принять"*/
function get_flag_can_received_selected_railcars(){
    var l_flag = true;

    $('.tree_selected').each(function(index){
        if (($(this).parent().attr('data-from_station_id')=== '1'&&$(this).parent().attr('data-notification')=== 'N')||($(this).parents('#comingCars').length===0)){
            l_flag = false;
            return;
        } 
    });
    return l_flag;
}

/*function get_flag_can_create_return_invoice*/
function get_flag_can_create_return_invoice(){
    var l_mas_object = get_selected_objects();
    if (check_undefined(l_mas_object[0]) == 1){
		return l_mas_object[0].can_create_return_invoice;
	} else {
		return null;
	}
	
}

function changeRailcarCount() {
    var newCount;
    $('#currentCarstree li[data-type="railway"]').each(function(){
        newCount = $(this).find('li[data-type="railcar"]').length;
        $(this).children('span').text(' ('+newCount+')');
    });
}
function change_cont_count() {
    var newCount;
    $('#currentCarstree li[data-type="area"]').each(function(){
        newCount = $(this).find('li[data-type="cont"]').length;
        $(this).children('span').text(' ('+newCount+')');
    });
}

/*Действие на нажатие кнопки контексного меню 1-ого уровня*/
function contextMenuAction1lvl(event,p_clicked_li) {
    var target = $(event.target);
    var action = target.attr('data-action');

    switch (action) {
		/* Вверх */
        case 'up':
            $('.context-menu').remove();
            var res = changeOrderAjax(p_clicked_li,action);
            if (res === 'done') {
                    p_clicked_li.insertBefore(p_clicked_li.prev());
            }
            break;
		/* Вниз */ 
        case 'down':
            $('.context-menu').remove();
            if (changeOrderAjax(p_clicked_li,action)==='done') {
                p_clicked_li.insertAfter(p_clicked_li.next());
            }			
            break;
		/* модальное окно "Переместить внутри станции" */
        case 'move':
            create_modal_dialog_move_inside_station();
            break;
        /*Модальное окно "Принять вагоны"*/
		case 'receivedIntoStation':
            create_md_received_into_station_new();
            break;
        /*Создаем модальное окно - добавление групп вагонов */
		case 'addBandwagon':
            createModalDialogAddBandwagon();	
            break;
		/*Создаем модальное окно - удаление групп вагонов */
        case 'deleteBandwagon':
            createModalDialogDeleteBandwagon();	
            break;
		
        case 'sendToStation':
            $('.context-menu-2lvl').remove();
            /*Создаем контексное меню 2-ого уровня для отправки на соседние станции*/
			create_contect_menu_2lvl_send_to_station(target.offset().left+target.innerWidth(),target.offset().top);	
            break;
		/*Модальное окно "Измененить атрибуты"*/
        case 'change_attr':
            create_md_change_attr(p_clicked_li);	
            break;
        case 'change_cont_attr_in_car':
             $('.context-menu-2lvl').remove();
			 /*Создаем контексное меню 2-ого уровня для отправки на соседние станции*/
            create_contect_menu_2lvl_change_cont_attr(target.offset().left+target.innerWidth(),target.offset().top,p_clicked_li);	
            break;
        /*Модальное окно "Измененить атрибы контейнера"*/
		case 'change_cont_attr':
            create_md_change_cont_attr(p_clicked_li,p_clicked_li.attr('data-id'));	
            break;
		/*Вывод из системы*/
        case 'send_from_ugl':
            create_md_send_from_ugl();	
            break;
		/*Добавить груз/тип*/
        case 'fill_railcar_attr':
            create_modal_dialog_fill_railcar_attr(p_clicked_li);	
            break;
		/*Регистрация уведомлений*/
        case 'register_notification':
            create_modal_dialog_notification();	
            break;
		/*Доб/убрать любимый путь*/
        case 'toggle_like_railway':
            toggle_like_railway(p_clicked_li);
            break;
		/*Погрузка':'Разгрузка*/
        case 'change_cars_weight_net':
            md_change_cars_weight_net_new(null, null);
            break;
		/*Постановка платформы*/
        case 'change_pl_cars_weight_net':
            md_change_cars_weight_net_new('platform',null);
            break;
		/*Ввод осмотра*/
        case 'enter_inspection':
            create_md_inspections(p_clicked_li);//create_md_enter_inspection(p_clicked_li);	
            break;
		/* Установить ЗУ */
		case 'enter_fix_device':
            create_md_fix_device(p_clicked_li);
            break;
		/*Ввод осмотра нескольких вагонов*/
        case 'enter_inspection_for_few_cars':
            create_md_enter_inspection_for_few_cars('railcar');
            break;
        /*Ввод осмотра нескольких контейнеров*/
		case 'enter_inspection_for_few_conts':
            create_md_enter_inspection_for_few_cars('cont');
            break;
		/*Возврат вагонов с ПСП*/
        case 'return_from_psp':
            create_md_return_from_PSP();
            break;
		/*Создать заявку*/
        case 'create_request':
            var l_cars = return_selected_cars().replace(/\|/g,':');
            $('.context-menu').remove();
            start_loading_animation();
            call_create_request_window(null,l_cars,'N');
            stop_loading_animation();
            break;
		/*Результаты взвешиваний*/
        case 'weight_result':
            create_md_weight_result(p_clicked_li);
            break;
		/*Переместить контейнера*/
        case 'move_cont':
            create_md_move_cont(p_clicked_li);
            break; 
		/*Форма Создать накладную на возврат*/
        case 'create_return_invoice':
            create_return_invoice(p_clicked_li);
            break;
		/*Регистрация уведомлений ГУ*/
        case 'register_notification_gu':
            create_modal_dialog_notification_gu();	
            break;
		/*Вывод. Вагон разобран*/
        case 'output_cars':
            create_md_output_cars();	
            break;
		/*Паспорт вагонов*/
        case 'cars_passport':
            create_md_cars_passport(true);	
            break;
		/* Назначить ЗУ*/
        case 'add_fix_device':
            $('.context-menu-2lvl').remove();
            create_contect_menu_2lvl_add_fix_device(p_clicked_li.attr('data-id'),target.offset().left+target.innerWidth(),target.offset().top);	
            break;
		/*Снять закрепление ЗУ*/
		case 'undock_fix_device':
            $('.context-menu-2lvl').remove();
            create_contect_menu_2lvl_undock_fix_device(p_clicked_li.attr('data-id'),target.offset().left+target.innerWidth(),target.offset().top);	
            break;
		case 'processing_of_wagons':
            create_md_processing_of_wagons();
            break;
		/*Корректировка закреплений ЗУ*/
		case 'update_fix_device':
            $('.context-menu-2lvl').remove();
            create_contect_menu_2lvl_update_fix_device(p_clicked_li.attr('data-id'),target.offset().left+target.innerWidth(),target.offset().top);	
            break;
		/*Погрузка:Разгрузка при перемещении(АКМ)*/
		case 'change_cars_weight_net_akm': 
			md_change_cars_weight_net_new(null,'un-loading-akm');
            break;
    }
}

/*Создаем контексное меню 2-ого уровня для отправки на соседние станции*/
async function create_contect_menu_2lvl_change_cont_attr(p_x,p_y,p_clicked_li) {
    if ($('#context_menu_2lvl_change_cont_attr').length===0) {
        try {
            var data = await $.ajax({ url: 'data.php', type: 'POST', dataType: "text", data: { car_number: p_clicked_li.attr('data-id'), ajax_action: 'get_car_containers' } });
            var records = JSON.parse(data);
            var ul = $('<ul/>');
            $.each(records, function( i, item ) {
                ul.append(
                    $('<li/>')
                    .css({'margin-left': (item.LVL-1)*10 + 'px'})
                    .text(item.CONT_NUMBER)
                    .attr('data-id',item.CONT_NUMBER)
                    .attr('data-type','station')
                );
            });
            $('<div/>',{class: 'context-menu context-menu-2lvl'})  // Присваиваем блоку наш css класс контекстного меню:
            .attr('id','context_menu_2lvl_change_cont_attr')
            .css({
                    left: p_x+'px', // Задаем позицию меню на X
                    top: p_y+'px' // Задаем позицию меню по Y
            })
            .appendTo('body') // Присоединяем наше меню к body документа:
            .append(ul)
            .on('click',function(event){
                $('.context-menu').remove();
               create_md_change_cont_attr(p_clicked_li,$(event.target).attr('data-id'));
                //create_modal_dialog_send_to_station(event);
            })
            .show('fast'); // Показываем меню с небольшим стандартным эффектом jQuery. Как раз очень хорошо подходит для меню
        } catch(e) {}
    }
}

/*Создаем контексное меню 2-ого уровня для отправки на соседние станции*/
async function create_contect_menu_2lvl_send_to_station(p_x,p_y) {
    if ($('#context_menu_2lvl_send_to_station').length===0) {
        try {
            var data = await $.ajax({ url: 'data.php', type: 'POST', dataType: "text", data: {ajax_action: 'getNextStations'} });
            var records = JSON.parse(data);
            var ul = $('<ul/>');
            $.each(records, function( i, item ) {
                ul.append(
                    $('<li/>')
                    .css({'margin-left': (item.LVL-1)*10 + 'px'})
                    .text(item.NAME)
                    .attr('data-id',item.ID)
                    .attr('data-type','station')
                );
            });
            $('<div/>',{class: 'context-menu context-menu-2lvl'})  // Присваиваем блоку наш css класс контекстного меню:
            .attr('id','context_menu_2lvl_send_to_station')
            .css({
                    left: p_x+'px', // Задаем позицию меню на X
                    top: p_y+'px' // Задаем позицию меню по Y
            })
            .appendTo('body') // Присоединяем наше меню к body документа:
            .append(ul)
            .on('click',function(event){
                $('.context-menu').remove();
                create_modal_dialog_send_to_station(event);
            })
            .show('fast'); // Показываем меню с небольшим стандартным эффектом jQuery. Как раз очень хорошо подходит для меню
        } catch(e) {}
    }
}

/*Создание модального окна погрузки/разгрузки вагонов*/
function get_select_users_for_naliv_new(){
    var result_select = $('<select/>');
    result_select.append($('<option/>'));
    
    $.each(g_users_for_naliv, function( i, item ){
        result_select.append($('<option/>').val(item.ID).text(item.NAME));
    });
    return result_select; 
}

function md_change_cars_weight_net_new(p_type, p_loading_subs){
	//console.log('p_type = '+p_type+' p_loading_subs = '+p_loading_subs+' r_scale_type_1831_manual='+r_scale_type_1831_manual);
    var date_start_label = $('<label>');
    var date_end_label = $('<label>');
    var who_start_label = $('<label>');
    var who_end_label = $('<label>');
        
    var history_select = $('<select/>',{css:{'width':'300px'}});
    
    var date_post_input = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required'}).attr('size','15');
    var date_start_input = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all'}).attr('size','15');
    var date_end_input = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all'}).attr('size','15');
    var date_zayavka_uvod_input = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all'}).attr('size','15');
    var date_uvod_input = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all'}).attr('size','15');
    var who_looked_select = get_select_users_for_naliv_new();
    var who_start_select = get_select_users_for_naliv_new();
    var who_end_select = get_select_users_for_naliv_new();
    var who_zayavka_select = get_select_users_for_naliv_new();
    
    async function md_change_cars_weight_net_ajax(p_cars_with_weight,p_date_post,p_date_start,p_date_end,p_date_zayavka_uvod,p_date_uvod,p_who_looked,p_who_start,p_who_end,p_who_zayavka){
        try {
            return await $.ajax({ url: 'data.php', type: 'POST', dataType: "text", data: { cars_with_weight: p_cars_with_weight, date_post: p_date_post, date_start: p_date_start, date_end: p_date_end, date_zayavka_uvod: p_date_zayavka_uvod, date_uvod: p_date_uvod, who_looked: p_who_looked, who_start: p_who_start, who_end: p_who_end, who_zayavka: p_who_zayavka, ajax_action: 'change_cars_weight_net' } });
        } catch(e) {
            return 'fail';
        }
    }
    function railcar_table_const_local(){
        var self = this;
        this.cars_table_total_row;
        this.cars_count = 0;
        this.cars_lenght= 0;
        
        var tr_mas = [];
        
        var return_table = $('<div>');
		return_table.head = $('<table>',{class:'change_weight_table'}).append($('<tbody>'));
		
		return_table.tr = $('<tr>');
		return_table.tr.append($('<th>').append(''));
		return_table.tr.append($('<th>').append('№'));
		return_table.tr.append($('<th>').append('Вагон / Платформа'));
		return_table.tr.append($('<th>').append('Контейнер'));
		return_table.tr.append($('<th>').append('Наим. груза'));
		return_table.tr.append($('<th>').append('Вес <br>груза'));
		return_table.tr.append($('<th>').append('Тара'));
		return_table.tr.append($('<th>').append('Вес <br>брутто'));
		
		return_table.tr.append($('<th>').append('Грузо<br>под-ть(т)'));
		if (p_loading_subs == 'un-loading-akm'){
			return_table.tr.append($('<th>').append('Когда и<br>кем погружен'));
		}else {
			return_table.tr.append($('<th>').append('Отказ <br>от операции'));
		}
		
		if (r_scale_type_1831_manual && p_loading_subs !== 'un-loading-akm'){
			return_table.tr.append($('<th>').append('Данные<br>с весов'));
		}
		if (p_loading_subs == 'un-loading-akm'){
			return_table.tr.append($('<th>').append('Принят вес, т'));
			return_table.tr.append($('<th>').append('Определить задачу'));
		}
		
		return_table.head.append(
			return_table.tr
		);
		
		return_table.append(return_table.head);	
        return_table.cars_table = $('<table>',{class:'change_weight_table'}).append($('<tbody>'));
        return_table.append(
            $('<div>',{class:'modalDialogContainer',css:{'display':'inline-block'}})  
            .append(return_table.cars_table)
        );
        return_table.cars_table_total_row = $('<tr>',{css:{'background':'#EBEBEB','font-weight':'bold'}});
        self.cars_table_total_row = return_table.cars_table_total_row;
        return_table.append(
            $('<table>',{class:'change_weight_table',css:{'margin-top':'-4px'}})
            .append(
                $('<tbody>').append(return_table.cars_table_total_row)
            )
        );
        
        function change_cars_table_total_tr(){
            
        }
            
        function del_cars_table_tr(p_tr){
            /*p_tr.nextAll().children('td:nth-child(2)').each(function(){
                $(this).text(parseInt($(this).text())-1);
            });
            p_tr.remove();
            self.cars_count--;*/
        }    
           
        this.spec_check_car_number = function(p_car_number){
            return true;
        };
        this.check_car_number = function(p_car_number){
            /*var find_result = self.spec_check_car_number(p_car_number);
            if (!find_result){
                return_table.add_carnumber_input.addClass('red_bckg_color');
                alert('На путях нет вагона с номером '+p_car_number+'!');
                return false;
            } else if(return_table.cars_table.find('tr td:contains("'+p_car_number+'")').length!==0) {
                return_table.add_carnumber_input.addClass('red_bckg_color');
                alert('Вагон '+p_car_number+' уже добавлен!');
                return false;
            } else{
                return_table.add_carnumber_input.removeClass('red_bckg_color').val('');
            }*/
            return true;
        };
        
        this.empty_table = function(){
            return_table.cars_table.find('tbody').empty();
            tr_mas = [];
            self.cars_count = 0;
        };
        
        this.add_cars_in_table = function(
            p_car_number,
            p_cont_number,
            p_freight_name,
            p_weight_net,
            p_weight_dep,
            p_weight_gross,
            p_arrive_weight_net,
            p_refusal,
            p_shop_info_id,
            p_railcar_type,
            p_car_tonnage,
            p_accepted_weight, 
            p_define_task, 
            p_define_comment,
            p_otgruzka_1c_id
		){
			//console.log('p_shop_info_id='+p_shop_info_id);
            self.cars_count++;
            
            var tr = $('<tr>');
            
			tr.scales_type = $('<select>',{class:'scales_type',css:{'width':'100px'}});
			tr.define_task = $('<select>',{class:'weight_net',css:{'width':'85px'}});
			
			if (!r_scale_type_1831_manual) {
				$(tr.scales_type).prop('disabled', 'disabled');
			}
            tr.checkbox = $('<input>',{'type':'checkbox','checked':'checked'});
            tr.car_number = (p_car_number==null?'':p_car_number);
            tr.cont_number = (p_cont_number==null?'':p_cont_number);
            tr.freight_select = get_select_freight_list(p_freight_name);
            tr.weight_net_input = $('<input>',{class:'weight_net','type':'text','maxlength':'6'}).val(p_weight_net.replace(',','.'));
			tr.accepted_weight = $('<input>',{class:'accepted_weight','type':'text','maxlength':'6'}).val(p_accepted_weight);
			tr.weight_dep = $('<input>',{class:'weight_dep','type':'text','maxlength':'6'}).val(p_weight_dep.replace(',','.'));
            //tr.weight_dep = p_weight_dep.replace(',','.');
            //tr.weight_gross_td = $('<td>').text(p_weight_gross.replace(',','.'));
			tr.weight_gross_td = $('<input>',{class:'weight_gross_td','type':'text','maxlength':'6'}).val(p_weight_gross.replace(',','.'));
            tr.refusal_input = $('<input>',{'type':'text','maxlength':'200',css:{'width':'100px'}}).val(p_refusal);
			tr.car_tonnage = (p_car_tonnage==null?'':p_car_tonnage);
            tr.arrive_weight_net = p_arrive_weight_net;
            tr.shop_info_id = p_shop_info_id;
			tr.nsi_weight_dep = p_weight_dep.replace(',','.');
			tr.nsi_weight_net_input = p_weight_net.replace(',','.');
			tr.nsi_weight_gross_td = p_weight_gross.replace(',','.');
			tr.p_loading_subs = p_loading_subs;
            tr.otgruzka_1c_id = p_otgruzka_1c_id;
            
            
			tr.scales_type = get_select_scales_type_list(tr.scales_type,r_scale_type_1831_manual,p_otgruzka_1c_id);
			tr.define_task = get_select_define_task_list(tr.define_task,p_define_task);
			
			tr.scales_type.on('change',function (e){
				
				if (tr.scales_type.val() == '1'){
					tr.weight_dep.val(tr.nsi_weight_dep);
					tr.weight_net_input.val(tr.nsi_weight_net_input);
					tr.weight_net_input.trigger('keyup');
					tr.weight_dep.attr('disabled',true);
					tr.weight_gross_td.attr('disabled',true);
				}
				if (tr.scales_type.val() == '2'){
					//console.log(tr.nsi_weight_dep);
					tr.weight_dep.attr('disabled',false);
					tr.weight_gross_td.attr('disabled',false);
				}
			});
			if (tr.p_loading_subs == 'un-loading-akm'){
				
				tr.refusal_input.val(p_define_comment);
			}
            if (p_railcar_type === '1'){
                tr.freight_select.attr('disabled',true);
                tr.weight_net_input.attr('disabled',true);
            }
			
			tr.weight_dep.attr('disabled',true);
			tr.weight_gross_td.attr('disabled',true);
			
            tr.append($('<td>').append(tr.checkbox));
            tr.append($('<td>').text(self.cars_count));
            tr.append($('<td>').text(tr.car_number));
            tr.append($('<td>').text(tr.cont_number));
            tr.append($('<td>').append(tr.freight_select));
            tr.append($('<td>').append(tr.weight_net_input));
            //tr.append($('<td>').text(tr.weight_dep));
			tr.append($('<td>').append(tr.weight_dep));
            tr.append($('<td>').append(tr.weight_gross_td));
			tr.append($('<td>').text(tr.car_tonnage));
            tr.append($('<td>').append(tr.refusal_input));
			if (r_scale_type_1831_manual && tr.p_loading_subs !== 'un-loading-akm'){ 
				tr.append($('<td>').append(tr.scales_type));
			}
			if (tr.p_loading_subs == 'un-loading-akm'){
				
				if (tr.shop_info_id !== 0 && tr.shop_info_id !== '' && tr.shop_info_id !== null && ( $(date_end_input).val() !== '' && $(date_end_input).val() !== null)){
					$(tr.accepted_weight).prop( "disabled", true );
					$(tr.define_task).prop( "disabled", true );
					$(tr.refusal_input).prop( "disabled", true );
				}
				tr.append($('<td>').append(tr.accepted_weight));
				tr.append($('<td>').append(tr.define_task));
			}
			if (r_scale_type_1831_manual && tr.p_loading_subs !== 'un-loading-akm'){
				tr.weight_dep.attr('disabled',false);
				tr.weight_gross_td.attr('disabled',false);
			}
            tr.appendTo(return_table.cars_table);
            
            tr_mas.push(tr);
            
            tr.accepted_weight.on('keypress',function (e){
                // Разрешаем: backspace, delete, влево, вправо
                if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
                    return;
                }

                var chr = String.fromCharCode(e.charCode);

                if (chr == null) return;

                if (chr === '.') {
                    return;
                }

                if (chr < '0' || chr > '9') {
                    return false;
                }
            });
			tr.weight_net_input.on('keypress',function (e){
                // Разрешаем: backspace, delete, влево, вправо
                if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
                    return;
                }

                var chr = String.fromCharCode(e.charCode);

                if (chr == null) return;

                if (chr === '.') {
                    return;
                }

                if (chr < '0' || chr > '9') {
                    return false;
                }
            });
			tr.weight_gross_td.on('keypress',function (e){
                // Разрешаем: backspace, delete, влево, вправо
                if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
                    return;
                }

                var chr = String.fromCharCode(e.charCode);

                if (chr == null) return;

                if (chr === '.') {
                    return;
                }

                if (chr < '0' || chr > '9') {
                    return false;
                }
            });
			tr.weight_dep.on('keypress',function (e){
                // Разрешаем: backspace, delete, влево, вправо
                if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
                    return;
                }

                var chr = String.fromCharCode(e.charCode);

                if (chr == null) return;

                if (chr === '.') {
                    return;
                }

                if (chr < '0' || chr > '9') {
                    return false;
                }
            });
			// Изм Груза
            tr.weight_net_input.on('keyup',function (e){
                if (!isNaN(+$(this).val())&&$(this).val()!=''){

                    var a = parseFloat(+$(this).val());
                    var b = parseFloat(tr.weight_dep.val());

                    //tr.children('td:nth-child(8)').text(Math.round((a+b) * 100)/100);
					var c = Math.round((a+b) * 100)/100;
					
					
					
					tr.weight_gross_td.val(c); // Изм Брутто
                }
            });
			// Изм Тары
			tr.weight_dep.on('keyup',function (e){
                if (!isNaN(+$(this).val())&&$(this).val()!=''){

                    var a = parseFloat(+$(this).val());
                    var b = parseFloat(tr.weight_gross_td.val());
					var c = Math.round((b-a) * 100)/100;
					var weight_net = parseFloat(tr.weight_net_input.val());

					//tr.children('td:nth-child(8)').text(Math.round((a+b) * 100)/100);
					if (weight_net == 0){
						c = Math.round((a+weight_net) * 100)/100;
						tr.weight_gross_td.val(c);
					}else {
						c = Math.round((b-a) * 100)/100;
						tr.weight_net_input.val(c);
					}
                }
            });
			
			// Изм Брутто
			tr.weight_gross_td.on('keyup',function (e){
                if (!isNaN(+$(this).val())&&$(this).val()!=''){

                    var a = parseFloat(+$(this).val());
                    var b = parseFloat(tr.weight_dep.val());
					var c = Math.round((a-b) * 100)/100;

                    //tr.children('td:nth-child(8)').text(Math.round((a+b) * 100)/100);
					tr.weight_net_input.val(c);
					
                }
            });
			
			tr.scales_type.triggerHandler('change');
        };
        
        this.add_selected_cars_rows_for_table = function (p_objects,p_only_cars,p_loading_subs){
			/*console.log(p_objects);
			console.log(p_only_cars);
			console.log(p_loading_subs);*/
            var records = [];
            $.ajax({
                url: 'data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data: { objects: p_objects
                       ,only_cars: p_only_cars
                       ,ajax_action: 'get_add_info_for_objects'
                      },
                success: function (data) {
					//console.log(data);
                    records = JSON.parse(data);

                    records.forEach(function(item){
                        if (item.EXISTS_POST!='Y' 
								|| p_loading_subs == 'un-loading-akm' // Перемещение АКМ
								){
							
                            self.add_cars_in_table(item.CAR_NUMBER,
												   item.CONT_NUMBER,
												   item.FREIGHT_NAME,
												   ((item.WEIGHT_NET !== null) ? item.WEIGHT_NET : '0'),
												   item.WEIGHT_DEP,
												   item.WEIGHT_GROSS,
												   item.ARRIVE_WEIGHT_NET,
												   ((item.REFUSAL !== null) ? item.REFUSAL : ''),
												   null,
												   p_only_cars, 
												   item.CAR_TONNAGE,
												   item.ACCEPTED_WEIGHT,
												   null,
												   item.REFUSAL_AKM,
                                                   0
												   );
                        }
                    });            
                },
                error: function (m1,m2) {window.alert(m1+m2);}
            });
            
            return records;
        };
		this.validation_save = function (){
			var validation_save = true;
			tr_mas.forEach(function(item){
				validation_save = true;
				if (item.checkbox.prop('checked')){
					var car_num = item.car_number;
					var weight_dep = item.weight_dep.val();
					var car_weight = item.weight_net_input.val();
					var accepted_weight = item.accepted_weight.val();
					var define_task = item.define_task.val();
					////
					if (weight_dep<0) {
						create_info_modal_dialog_new('Оповещение','У вагона '+car_num+' тара меньше 0!');
						validation_save = false;
						return false;
					}
					if (car_weight<0) {
						create_info_modal_dialog_new('Оповещение','У вагона '+car_num+' вес меньше 0!');
						validation_save = false;
						return false;
					}
					
					if (car_weight>100) {
						create_info_modal_dialog_new('Оповещение','У вагона '+car_num+' вес больше 100!');
						validation_save = false;
						return false;
					}
					
					if (weight_dep>40) {
						create_info_modal_dialog_new('Оповещение','У вагона '+car_num+' тара больше 40!');
						validation_save = false;
						return false;
					}
					
					if (define_task ==1 && p_loading_subs == 'un-loading-akm') {
						create_info_modal_dialog_new('Оповещение','У вагона '+car_num+' не выбрано значение для столбца "Определить задачу"!');
						validation_save = false;
						return false;
					}
					
					if (car_weight ==0 && (accepted_weight =='' || accepted_weight == null) && p_loading_subs == 'un-loading-akm') {
						create_info_modal_dialog_new('Оповещение','У вагона '+car_num+' не выбрано значение для столбца "Вес принят, т"!');
						validation_save = false;
						return false;
					}
					
				}
			});
			return validation_save;
		}
        this.get_cars_in_table = function(){            
            var result = '';
            tr_mas.forEach(function(item){
                if (item.checkbox.prop('checked')){
                    var car_num = item.car_number;
                    var cont_number = item.cont_number;
                    var car_weight = item.weight_net_input.val();
                    var freight = item.freight_select.val();
                    var refusal = item.refusal_input.val();
                    var shop_info_id = item.shop_info_id;
					// add 21.12.2022
					var scales_type = item.scales_type.val();
					var weight_dep = item.weight_dep.val();
					var weight_gross_td = item.weight_gross_td.val();
					var l_loading_subs = item.p_loading_subs;
					var accepted_weight = item.accepted_weight.val();
					var define_task = item.define_task.val();
                    var otgruzka_1c_id = item.otgruzka_1c_id;
					  
                    result+=(car_num!==''?car_num:'_')+'|';
                    result+=(cont_number!==''?cont_number:'_')+'|';
                    result+=(car_weight!==''?car_weight:'_')+'|';
                    result+=(freight!==''?freight:'_')+'|';
                    result+=(refusal!==''?refusal:'_')+'|';
                    result+=(shop_info_id!==null?shop_info_id:'_')+'|';
					result+=(scales_type!==''?scales_type:'_')+'|';
					result+=(weight_dep!==''?weight_dep:'_')+'|';
					result+=(weight_gross_td!==''?weight_gross_td:'_')+'|';
					// add 21.12.2022
					result+=(l_loading_subs!==''?l_loading_subs:'_')+'|';
					result+=(accepted_weight!==''?accepted_weight:'_')+'|';
					result+=(define_task!==''?define_task:'_')+'|';
                    result+=(otgruzka_1c_id!==''?otgruzka_1c_id:'_');
					

                    result+= '$';
                }
            });
            return result;
        };
        
        this.exists_car_nums = function(){
            var result = false;
            tr_mas.forEach(function(item){
                if (item.checkbox.prop('checked')){
                    if (item.car_number != '' ){
                        result = true;
                    }
                }
            });
            return result;
        };
        
        this.mark_same_platform = function(){            
            var prev_car_number = '';
            var next_car_number = '';
            tr_mas.forEach(function(item,index,arr){
                prev_car_number = (0 === index)? '' : arr[index-1].car_number;
                next_car_number = (arr.length - 1 === index)? '' : arr[index+1].car_number;
                    
                if (prev_car_number == item.car_number  && item.car_number == next_car_number && next_car_number != '' && prev_car_number != ''){
                    item.addClass('middle_elem');
                }else if (prev_car_number == item.car_number && prev_car_number != ''){
                    item.addClass('last_elem');
                }else if (item.car_number == next_car_number && next_car_number != ''){
                    item.addClass('first_elem');
                }
            });
        };
        
        this.get_cars_in_table_mas = function(){
            return tr_mas;
        };
        
        this.get_cars_for_request_in_table = function(){            
            var result = '';
            tr_mas.forEach(function(item){
                if (item.checkbox.prop('checked') && item.car_number != ''){
                    if (result.indexOf(item.car_number) == -1){
                        result+=item.car_number+':';
                    } 
                }
            });
            return result;
        };
        
		this.set_undisable_accepted_weight = function(p_disabled){
			var result = '';
			tr_mas.forEach(function(item){
                if (item.checkbox.prop('checked') && item.car_number != ''){
                    if (result.indexOf(item.car_number) == -1){
                        $(item.accepted_weight).prop( "disabled", p_disabled );
                    } 
                }
            });
		}
        this.get_flag_exist_empty_fields = function(p_manual_input){
            /*var l_result = true;
            tr_mas.forEach(function(item){
                if (item.weight_input.val()==''||(p_manual_input && (!item.car_number_input.hasClass('true-car-number')
                                                                    ||item.speed_input.val()==''
                                                                    ||item.date_input.val()==''
                                                                    ||item.date_input.hasClass('red_bckg_color')
                                                                    ||item.weight_input.hasClass('red_bckg_color')
                                                                    )
                                                 )
                    ) {
                    l_result = false;
                }
            }); 
            return l_result;*/
        };

        this.get_table = function(){
            return return_table;
        };
    };
    function fill_select_with_history(p_select,p_cars_from_shop_mas){
        var options = '<option value="0"></option>';
        p_cars_from_shop_mas.forEach(function(item,index) {
            options += '<option style="'+(item.selected_car_in==='Y'?'background:yellow':'')+'" value="'+index+'">'+item.date_post+' '+item.created_by+'</option>';
        });
        p_select.append(options);
    }
    function change_label_text(p_state, p_loading_subs){
		//console.log('p_loading_subs ='+p_loading_subs);
        date_start_label.text('Нач. '+((p_type === 'platform'?'постановки':(p_state=='empty'?'погрузки':'разгрузки')))+' (местное)');
        date_end_label.text('Кон. '+((p_type === 'platform'?'постановки':(p_state=='empty'?'погрузки':'разгрузки')))+' (местное)');
        who_start_label.text((p_state=='empty'?'Погрузку':'Разгрузку')+' начал');
        who_end_label.text((p_state=='empty'?'Погрузку':'Разгрузку')+' закончил');
        $('#modalDialog,#ui-id-1').attr('title',(p_state=='empty'?'Погрузка':'Разгрузка')+' вагонов'+(p_loading_subs=='un-loading-akm'?' при перемещении.':'-'));
        $('.ui-dialog-title').text((p_state=='empty'?'Погрузка':'Разгрузка')+' вагонов'+(p_loading_subs=='un-loading-akm'?' при перемещении.':''));
    }
    function disable_save_btn(){
        if (date_post_input.hasClass('red_bckg_color')||date_post_input.val()==''||
            date_start_input.hasClass('red_bckg_color')||
            date_end_input.hasClass('red_bckg_color')||
            date_zayavka_uvod_input.hasClass('red_bckg_color')||
            date_uvod_input.hasClass('red_bckg_color'))
        {
            $('#md_save_btn').prop( "disabled", true );
        }else{
            $('#md_save_btn').prop( "disabled", false );
        }
    }
    function get_select_freight_list(p_freight){        
        var result_select = $('<select>',{class:'freight',css:{'width':'150px'}});

        result_select.append('<option selected value="'+p_freight+'">'+p_freight+'</option>');

        $.each(g_freight_list, function( i, item ) {
            result_select.append('<option value="'+item.FREIGHT_NAME+'">'+item.FREIGHT_NAME+'</option>');
        });

        return result_select; 
    }
	
	
	
	function get_select_scales_type_list(p_obj, p_scales_type,p_otgruzka_1c_id){        
        var result_select = p_obj; 
		var selected = p_scales_type;
        
		
		//console.log('selected='+selected+' p_otgruzka_1c_id='+p_otgruzka_1c_id);
        $.each(g_scales_type_list, function( i, item ) {
			selected ='';
            if (p_otgruzka_1c_id !=='0'){
                if (item.ID === '0'){
                    selected = 'selected';
                }
            }else if(p_scales_type){
                if (item.ID === '2'){
                    selected = 'selected';
                }
            } 
            
            result_select.append('<option '+(selected)+' value="'+item.ID+'">'+item.SCALES_TYPE+'</option>');
			
        });
        return result_select; 
    }
	
	function get_select_define_task_list(p_obj,p_define_task){    
		//console.log('p_define_task='+p_define_task);
        var result_select = p_obj; 
		var selected = '';
		
		//console.log('selected='+selected);
        $.each(g_define_task, function( i, item ) {
			if (p_define_task == item.ID){
				selected = 'selected';
			}
			else {
				selected ='';
			}
			//console.log('ID='+item.ID+' selected='+selected);
            result_select.append('<option '+(selected)+' value="'+item.ID+'">'+item.NAME+'</option>');
			
			
        });
        return result_select; 
    }
	
    function get_cont_out_date(p_conts){
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { conts: p_conts             
                   ,ajax_action: 'get_cont_out_date'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = '';
            }
        });
        return res;
    }
    function get_railcar_in_date(p_cars){
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { cars: p_cars             
                   ,ajax_action: 'get_railcar_in_date'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = '';
            }
        });
        return res;
    }
    function get_move_cont_to_pl(p_cars){
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { cars: p_cars             
                   ,ajax_action: 'get_move_cont_to_pl'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = '';
            }
        });
        return res;
    }
    
    
    $('.context-menu').remove();
    
    var md_div = $('<div/>')
        .attr('title',(p_type === 'platform'?'Постановка платформы':'Погрузка/разгрузка вагонов'+(p_loading_subs=='un-loading-akm'?' при перемещении.':'')))
        .appendTo('body');
    
    md_div.append(
        $('<div>',{class:'border',css:{'display':'table'}}).append(
            $('<div>',{css:{'float':'left'}}).append('История: ').append(history_select)
        )
    );
    md_div.append(
        $('<div>',{css:{'display':'table'}}).append(
            $('<div>',{class:'attr',css:{'border':'none','width':'490px'}})
            .append(
                $('<div>')
                    .append($('<label>').text('Постановка (местное)'))
                    .append(date_post_input)
            )
            .append(
                $('<div>')
                    .append(date_start_label)
                    .append(date_start_input)
            )
            .append(
                $('<div>')
                    .append(date_end_label)
                    .append(date_end_input)
            )
            .append(
                $('<div>')
                    .append($('<label>').text('Заявка на увод (местное)'))
                    .append(date_zayavka_uvod_input)
            )
            .append(
                $('<div>')
                    .append($('<label>').text('Увод (местное)'))
                    .append(date_uvod_input)
            )
            .append(
                $('<div>')
                    .append($('<label>').text('Осмотрел'))
                    .append(who_looked_select)
            )
            .append(
                $('<div>')
                    .append(who_start_label)
                    .append(who_start_select)
            )
            .append(
                $('<div>')
                    .append(who_end_label)
                    .append(who_end_select)
            )
            .append(
                $('<div>')
                    .append($('<label>').text('Заявил'))
                    .append(who_zayavka_select)
            )
        )
    );
    
    var railcar_table = new railcar_table_const_local();
    md_div.append(railcar_table.get_table());
    
    var l_selected_objects_mas = get_selected_objects();
    var l_selected_objects = '';
    l_selected_objects_mas.forEach(function(obj){
		if (p_loading_subs == 'un-loading-akm'){
			if (obj.un_loading_subs == 'LOAD' || obj.un_loading_subs == 'UN_LOAD' ){
				l_selected_objects += obj.obj_number + '$' + obj.obj_type + '|';
			}
		} else {
			l_selected_objects += obj.obj_number + '$' + obj.obj_type + '|';
		}
		
        
    });
    
    var l_selected_car_cont_mas = railcar_table.add_selected_cars_rows_for_table(l_selected_objects,(p_type === 'platform'?'1':'0'), p_loading_subs);
    var l_selected_car_cont = [];
    l_selected_car_cont_mas.forEach(function(item){
        if (item.CONT_NUMBER != null){
            l_selected_car_cont.push(item.CONT_NUMBER);
        }else{
            l_selected_car_cont.push(item.CAR_NUMBER);
        }
    });
    railcar_table.mark_same_platform();
    //console.log('p_type='+(p_type === 'platform'?'1':'0'));
    var l_cars_from_shop=[];
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async:false,
        data: {return_type:(p_type === 'platform'?'1':'0'),
			   loading_subs:p_loading_subs,
               ajax_action: 'get_cars_from_shop'},
        success: function (data) {
			//console.log(data);
            l_cars_from_shop = JSON.parse(data);
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
    
    var l_cars_from_shop_mas =[];
    var l_prev_id = 0;
    l_cars_from_shop.forEach(function(item) {
        var l_car = {car_number:item.CAR_NUMBER,cont_number:item.CONT_NUMBER,freight_name:item.FREIGHT_NAME
                    ,weight_net:item.WEIGHT_NET,weight_dep:item.WEIGHT_DEP
                    ,weight_gross:item.WEIGHT_GROSS
                    ,arrive_weight_net:item.ARRIVE_WEIGHT_NET,refusal:item.REFUSAL
                    ,shop_info_id:item.SHOP_INFO_ID
					,car_tonnage:item.CAR_TONNAGE
					,accepted_weight:item.ACCEPTED_WEIGHT
					,define_task:item.DEFINE_TASK
					,define_comment:item.DEFINE_COMMENT
                    ,otgruzka_1c_id:item.OTGRUZKA_1C_ID
                    };
                    
        var l_selected_car_flag = item.CONT_NUMBER==null?l_selected_car_cont.indexOf(item.CAR_NUMBER):l_selected_car_cont.indexOf(item.CONT_NUMBER);
        if (l_prev_id!=item.ID){
            l_cars_from_shop_mas[item.ID] = {date_post:item.DATE_POST,date_start:item.DATE_START,date_end:item.DATE_END
                                            ,date_zayavka_uvod:item.DATE_ZAYAVKA_UVOD, date_uvod:item.DATE_UVOD,created_by:item.CREATED_BY
                                            ,who_looked:item.WHO_LOOKED,who_start:item.WHO_START,who_end:item.WHO_END,who_zayavka:item.WHO_ZAYAVKA
                                            ,selected_car_in:'N'
                                            ,cars:[l_car]};
                                         
        } else{
            l_cars_from_shop_mas[item.ID].cars.push(l_car);
        }
        
        if (l_selected_car_flag !== -1){
            l_cars_from_shop_mas[item.ID].selected_car_in = 'Y';
        }
        
        l_prev_id=item.ID;
    });
    
    fill_select_with_history(history_select,l_cars_from_shop_mas);
    
    l_cars_from_shop_mas['0'] = {date_post:'',date_start:'',date_end:'',date_zayavka_uvod:'', date_uvod:'',who_looked:'',who_start:'',who_end:'',who_zayavka:'',cars:[]};
    var l_tmp_cars = railcar_table.get_cars_in_table_mas();
    var l_conts_in_table = '';
    var l_platforms_in_table = '';
    l_tmp_cars.forEach(function(item){
        if (item.cont_number != ''){l_conts_in_table += item.cont_number + '|';}
        if (p_type === 'platform' && item.car_number != ''){l_platforms_in_table += item.car_number + '|';}
        var l_car = {car_number:item.car_number,cont_number:item.cont_number,freight_name:item.freight_select.val()
                    ,weight_net:item.weight_net_input.val(),weight_dep:item.weight_dep
                    ,weight_gross:item.weight_gross_td.text(),car_length:item.car_length
                    ,arrive_weight_net:item.arrive_weight_net,shop_info_id:null,car_tonnage:item.car_tonnage
					,accepted_weight:item.accepted_weight
					,define_task:item.define_task
					,define_comment:item.define_comment
                    ,otgruzka_1c_id:item.otgruzka_1c_id
					
                    };

        l_cars_from_shop_mas['0'].cars.push(l_car);
    });
    
    if (l_conts_in_table != '') {
        date_post_input.val(get_cont_out_date(l_conts_in_table));
    }
    if (l_platforms_in_table != ''){
        var l_date = get_railcar_in_date(l_platforms_in_table);
        date_post_input.val(l_date);
    }
    
    var l_init_val_date_end = '';
    
    history_select.on('change',{p_cars:l_cars_from_shop_mas},function(e){
        var l_history = e.data.p_cars[$(e.target).val()];
        
        date_post_input.val(l_history.date_post);
        date_start_input.val(l_history.date_start);
        date_end_input.val(l_history.date_end);
        date_zayavka_uvod_input.val(l_history.date_zayavka_uvod);
        date_uvod_input.val(l_history.date_uvod);
        
        who_looked_select.val(l_history.who_looked);
        who_start_select.val(l_history.who_start);
        who_end_select.val(l_history.who_end);
        who_zayavka_select.val(l_history.who_zayavka);
        
        l_init_val_date_end = date_end_input.val();
        
        railcar_table.empty_table();
        var mas = [];
        var l_pl = '';
        l_history.cars.forEach(function(item,i){
            railcar_table.add_cars_in_table(
                item.car_number,
                item.cont_number,
                (item.freight_name !== null) ? item.freight_name : '',
                (item.weight_net !== null) ? item.weight_net.replace(',','.') : '',
                (item.weight_dep !== null) ? item.weight_dep.replace(',','.') : '',
                (item.weight_gross !== null) ? item.weight_gross.replace(',','.') : '',
                (item.arrive_weight_net !== null) ? item.arrive_weight_net.replace(',','.') : '',
                (item.refusal !== null) ? item.refusal : '',
                item.shop_info_id,
                (p_type === 'platform'?'1':'0')
				,item.car_tonnage
				,item.accepted_weight
				,item.define_task
				,item.define_comment
                ,item.otgruzka_1c_id
            );
            mas.push(item.arrive_weight_net);
            if (p_type === 'platform' && l_history.date_start == null){
                l_pl += item.car_number + '|';
            }
        });
        
        if (p_type === 'platform'){
            if (l_history.date_start == null){
                date_start_input.val(get_move_cont_to_pl(l_pl)); 
            } 
        } else{
            railcar_table.mark_same_platform();
        }
        
        disable_save_btn();
        
        change_label_text(get_cars_state(mas));
    });
    
    var l_state = get_selected_objects_state();
    change_label_text(l_state, p_loading_subs);
    
    var l_compare_date = get_server_current_time();
    var l_compare_date_from = add_day_to_date(l_compare_date,-30);
    var l_compare_date_to = add_day_to_date(l_compare_date,1);
    
	
	
    init_date_time_input_btw(date_post_input,l_compare_date_from,l_compare_date_to);
    init_date_time_input_btw(date_start_input,l_compare_date_from,l_compare_date_to);
    init_date_time_input_btw(date_end_input,l_compare_date_from,l_compare_date_to);
    init_date_time_input_btw(date_zayavka_uvod_input,l_compare_date_from,l_compare_date_to);
    init_date_time_input_btw(date_uvod_input,l_compare_date_from,l_compare_date_to);
    
    date_post_input.on('blur',function(){disable_save_btn();});
    date_start_input.on('blur',function(){disable_save_btn();});
    date_end_input.on('blur',function(){disable_save_btn();});
    date_zayavka_uvod_input.on('blur',function(){disable_save_btn();});
    date_uvod_input.on('blur',function(){disable_save_btn();});
    date_end_input.on('blur','keypress',function (e){
		//console.log($(this).val());
		if ($(this).val() == '' || $(this).val() == null){
			railcar_table.set_undisable_accepted_weight(false);
		}else {
			railcar_table.set_undisable_accepted_weight(true);
		}
	});
    md_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Сохранить':{
                text: "Сохранить",
                  id: "md_save_btn",
               click: function(){
						if (date_end_input.val() != ''){
							
							if (date_comparison(date_post_input.val(),date_end_input.val(),'>')){
								create_info_modal_dialog_new('Оповещение','"Нач. погрузки (местное)" больше/равно "Кон. погрузки (местное)"');
								return;
							}
						}
						//return;
						var validation_save = railcar_table.validation_save()
						//console.log(validation_save);
						if (!validation_save){
							return;
						}
						
                        if (date_uvod_input.val() != '' && check_open_period('2',date_uvod_input.val()) == '0') {
                            create_info_modal_dialog_new('Оповещение','Для даты '+date_uvod_input.val()+' нет открытого периода! Операции сохранить не возможно!');
                        }else{
							
							
                            var l_cars = railcar_table.get_cars_in_table(); //сохраняем выбранные элементы
							//console.log(l_cars);
							//console.log('l_cars='+l_cars);
							//return;
                            var l_cars_for_request = railcar_table.get_cars_for_request_in_table();
							
							//console.log('l_cars='+l_cars);
							
							
							var f_res = md_change_cars_weight_net_ajax(l_cars,date_post_input.val(),date_start_input.val(),date_end_input.val(),date_zayavka_uvod_input.val()
                                                              ,date_uvod_input.val(),who_looked_select.val(),who_start_select.val(),who_end_select.val()
                                                              ,who_zayavka_select.val()
                                                              );
                            var f_res_mas = f_res.split('$');
							//console.log('f_res_mas='+f_res_mas);
							//return;
							if (f_res_mas[0]=='done') 
                            {                            
                                $('#md_save_btn').prop('disabled',true);
								$('.tree_selected').removeClass('tree_selected');
                                clear_add_info();
                                
                                var l = railcar_table.exists_car_nums();
                                if (l_init_val_date_end == '' && date_end_input.val()!='' && railcar_table.exists_car_nums()){
                                    $('<div/>')
                                        .attr('title','Уведомление')
                                        .appendTo('body') // Присоединяем наше меню к body документа: 
                                        .append('<p>Нужно создать заявку на увод?</p>')
                                        .dialog({
                                            resizable:false,
                                            modal:true,
                                            width: '400px',
                                            draggable: false,
                                            buttons:{
                                                'Да': function(){
                                                    call_create_request_window('2',l_cars_for_request,'Y');
                                                    $(this).dialog( "close" );
                                                },
                                                'Нет': function(){
                                                    $(this).dialog( "close" );
                                                }       
                                            },
                                            close: function() {
                                                $(this).remove();
                                            }
                                        });
                                }
                            }else{
                                create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!'+f_res_mas[1]);
								return;
                            }

                            $(this).dialog( "close" );
                        }
                    }   
                }, 
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
    
    disable_save_btn();
}

function toggle_like_railway(p_clicked_li){
    function toggle_like_railway_ajax(p_obj_id,p_obj_type){
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { obj_id: p_obj_id
                   ,obj_type: p_obj_type
                   ,ajax_action: 'toggle_like_railway'
               },
            success: function (data) {
                    res = data;
                },
            error: function (data) {
                    res = 'fail';
                }
        });
        return res;
    }
    
    $('.context-menu').remove();
    
    if (toggle_like_railway_ajax(p_clicked_li.attr('data-id'),p_clicked_li.attr('data-type'))==='done') {
        if (p_clicked_li.attr('data-id')=='railway'){
            p_clicked_li.children('div.tree_img').toggleClass('tree_img_like_railway');
        }else{
            p_clicked_li.children('div.tree_img').toggleClass('tree_img_like_area');
        }
        
        
        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
    }else{
        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
    }
}

/*конструктор таблицы с вагонами*/
function railcar_table_const(){
    var self = this;
    this.add_error_msg = null;
    this.cars_table_total_row;
    this.cars_count = 0;
    this.cars_lenght= 0;

    var return_table = $('<div>');
    return_table.append(
        '<table class="received_cars_table">'+
            '<thead>'+
                '<tr>'+
                    '<th></th>'+
                    '<th></th>'+
                    '<th>№</th>'+
                    '<th>Вагон</th>'+
                    '<th>Наим. груза</th>'+
                    '<th>Вес <br>груза</th>'+
                    '<th>Тара</th>'+
                    '<th>Вес <br>брутто</th>'+
                    '<th>Длина</th>'+
					'<th>Усл.<br>ед.ваг</th>'+
                '</tr>'+
            '</thead>'+
        '</table>'
    );
    
    
    return_table.add_carnumber_input = $('<input>',{type:'text',css:{'font-size':'11px'}, class:'text ui-widget-content ui-corner-all'}).attr('size', '8').attr('maxlength', '8');
    
    this.car_number_input = return_table.add_carnumber_input;
    
    return_table.add_carnumber_btn = $('<input>',{type:'button',css:{'font-size':'11px','height':'17px'}, class:'btnAdd'}).val('Добавить');
    return_table.add_carnumber_btn.on('click', function(){
        self.add_cars_in_table(null,true);
    });
    return_table.add_carnumber_input.on('keypress', function(e){
        if(e.keyCode===13){
            self.add_cars_in_table(null,true);
        }
    });

    return_table.append(
        $('<div>',{css:{'margin-left':'61px'}})
        .append(return_table.add_carnumber_input)
        .append(return_table.add_carnumber_btn)
    );

    return_table.cars_table = $('<table>',{class:'received_cars_table'}).append($('<tbody>'));
    return_table.append(
        $('<div>',{class:'modalDialogContainer',css:{'display':'inline-block'}})  
        .append(return_table.cars_table)
    );
    return_table.cars_table_total_row = $('<tr>',{css:{'background':'#EBEBEB','font-weight':'bold'}});
    self.cars_table_total_row = return_table.cars_table_total_row;
    return_table.append(
        $('<table>',{class:'received_cars_table',css:{'margin-top':'-4px'}})
        .append(
            $('<tbody>').append(return_table.cars_table_total_row)
        )
    );

    this.check_transport_restriction = function (){
        null;
    };
    this.action_change_table = function (){
        null;
    };

    function up_down_cars_table_tr(p_action,p_tr){
        if (p_action==='up' && p_tr.prev().length!==0){
            var td = p_tr.children('td:nth-child(3)');
            td.text(parseInt(td.text())-1);
            var td_prev = p_tr.prev().children('td:nth-child(3)');
            td_prev.text(parseInt(td_prev.text())+1);

            p_tr.insertBefore(p_tr.prev());

        } else if (p_action==='down' && p_tr.next().length!==0){
            var td = p_tr.children('td:nth-child(3)');
            td.text(parseInt(td.text())+1);
            var td_next = p_tr.next().children('td:nth-child(3)');
            td_next.text(parseInt(td_next.text())-1);

            p_tr.insertAfter(p_tr.next());
        }
    }
    function del_cars_table_tr(p_tr){
        p_tr.nextAll().children('td:nth-child(3)').each(function(){
            $(this).text(parseInt($(this).text())-1);
        });
        p_tr.remove();
        self.cars_count--;
    }
    function change_cars_table_total_tr(){
        return_table.cars_table_total_row.find('td').remove();
        if (self.cars_count!==0) {
            var sum_weight_net = 0;
            return_table.cars_table.find('tr td:nth-child(6)').each(function(){
                sum_weight_net+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
            });
            var sum_weight_dep = 0;
            return_table.cars_table.find('tr td:nth-child(7)').each(function(){
                sum_weight_dep+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
            });
            var sum_weight_gross = 0;
            return_table.cars_table.find('tr td:nth-child(8)').each(function(){
                sum_weight_gross+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
            });
            var sum_car_length = 0;
            return_table.cars_table.find('tr td:nth-child(9)').each(function(){
                sum_car_length+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
            });
			var sum_car_cond_length = 0;
            return_table.cars_table.find('tr td:nth-child(10)').each(function(){
                sum_car_cond_length+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
            });
            
            self.cars_lenght = Math.round(sum_car_length * 100)/100;
			self.cond_length_train = Math.round(sum_car_cond_length * 100)/100;

            return_table.cars_table_total_row.append('<td></td>');
            return_table.cars_table_total_row.append('<td></td>');
            return_table.cars_table_total_row.append('<td></td>');
            return_table.cars_table_total_row.append('<td>Кол-во: '+ self.cars_count +'</td>');
            return_table.cars_table_total_row.append('<td></td>');
            return_table.cars_table_total_row.append('<td>'+Math.round(sum_weight_net * 100)/100+'</td>');
            return_table.cars_table_total_row.append('<td>'+Math.round(sum_weight_dep * 100)/100+'</td>');
            return_table.cars_table_total_row.append('<td>'+ Math.round(sum_weight_gross * 100)/100 +'</td>');
            return_table.cars_table_total_row.append('<td>'+ Math.round(sum_car_length * 100)/100 +'</td>');
			return_table.cars_table_total_row.append('<td>'+ Math.round(sum_car_cond_length * 100)/100 +'</td>');
        }else{
            self.cars_lenght = 0;
			self.cond_length_train = 0;
            
            return_table.cars_table_total_row.append('<td></td>');
            return_table.cars_table_total_row.append('<td></td>');
            return_table.cars_table_total_row.append('<td></td>');
            return_table.cars_table_total_row.append('<td>Кол-во: 0</td>');
            return_table.cars_table_total_row.append('<td></td>');
            return_table.cars_table_total_row.append('<td>0</td>');
            return_table.cars_table_total_row.append('<td>0</td>');
            return_table.cars_table_total_row.append('<td>0</td>'); 
            return_table.cars_table_total_row.append('<td>0</td>'); 
			return_table.cars_table_total_row.append('<td>0</td>');
        }
        self.check_transport_restriction();
        self.action_change_table();
    }
    
    this.spec_check_car_number = function(p_car_number){
        return true;
    };
    this.check_car_number = function(p_car_number){
        var find_result = self.spec_check_car_number(p_car_number);
        if (!find_result){
            return_table.add_carnumber_input.addClass('red_bckg_color');
            if (this.add_error_msg === null){
                alert('На путях нет вагона с номером '+p_car_number+'!');
            }else{
                alert(this.add_error_msg);
            }
            return false;
        } else if(return_table.cars_table.find('tr td:contains("'+p_car_number+'")').length!==0) {
            return_table.add_carnumber_input.addClass('red_bckg_color');
            alert('Вагон '+p_car_number+' уже добавлен!');
            return false;
        } else{
            return_table.add_carnumber_input.removeClass('red_bckg_color').val('');
        }
        return true;
    };

    /*p_carnumber может быть просто номер вагона: когда добавляем вагон на форме по кнопке
      или же список номеров вагонов разделенных "|": вызывается при открытии формы*/
    this.add_cars_in_table = function(p_car_number,p_need_check){
        var add_car_number;
        if (p_car_number === null || p_car_number === '') {
            add_car_number = return_table.add_carnumber_input.val();
        } else {
            add_car_number = p_car_number;
        }

        var check_car_number_result = true;
        if (p_need_check) {
            check_car_number_result = self.check_car_number(add_car_number);
        }

        if (check_car_number_result && add_car_number !== null && add_car_number !== '') {
            $.ajax({
                url: 'data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data: { cars: add_car_number
                       ,ajax_action: 'get_add_info_for_cars'
                      },
                success: function (data) {
					
                    var records = JSON.parse(data);

                    for(var i=0; i<records.length; i++) {
                        self.cars_count++;
                        var child = records[i];

                        var tr = $('<tr/>');
                        tr.append(
                            $('<td>').append(
                                $('<div>',{class:'up_image'}).on('click', function(){up_down_cars_table_tr('up',$(this).parent().parent());})
                            )
                        );
                        tr.append(
                            $('<td>').append(
                                $('<div>',{class:'down_image'}).on('click', function(){up_down_cars_table_tr('down',$(this).parent().parent());})
                            )
                        );
                        tr.append('<td>'+self.cars_count+'</td>');
                        tr.append('<td>'+child.ID+'</td>');
                        tr.append('<td>'+((child.FREIGHT_NAME !== null) ? child.FREIGHT_NAME : '')+'</td>');
                        tr.append('<td>'+((child.WEIGHT_NET !== null) ? child.WEIGHT_NET.replace(',','.') : '')+'</td>');
                        tr.append('<td>'+((child.WEIGHT_DEP !== null) ? child.WEIGHT_DEP.replace(',','.') : '')+'</td>');
                        tr.append('<td>'+((child.WEIGHT_GROSS !== null) ? child.WEIGHT_GROSS.replace(',','.') : '')+'</td>');
                        tr.append('<td>'+((child.CAR_LENGTH !== null) ? child.CAR_LENGTH.replace(',','.') : '')+'</td>');
						tr.append('<td>'+((child.COND_LENGTH_TRAIN !== null) ? child.COND_LENGTH_TRAIN.replace(',','.') : '')+'</td>');
                        tr.append(
                            $('<td>').append(
                                $('<div>',{class:'deleteImage deleteImage13px'}).on('click', function(){
                                    del_cars_table_tr($(this).parent().parent());
                                    change_cars_table_total_tr(); 
                                })
                            )
                        );
                        tr.appendTo(return_table.cars_table); 
                    }
                },
                error: function (m1,m2) {window.alert(m1+m2);}
            });
        }
        change_cars_table_total_tr();
    };

    this.get_cars_in_table = function(){
        var result = '';
        return_table.cars_table.find('tr').each(function(){
            result+= $(this).children('td:nth-child(4)').text() + '|';
        });
        return result;
    };

    this.get_table = function(){
        return return_table;
    };
};

/*конструктор таблицы с контейнерами*/
function cont_table_const(){
    var self = this;
    this.table_total_row;
    this.count = 0;

    var return_table = $('<div>');
    return_table.append(
        '<table class="cont_table">'+
            '<thead>'+
                '<tr>'+
                    '<th></th>'+
                    '<th></th>'+
                    '<th>№</th>'+
                    '<th>Контейнер</th>'+
                    '<th>Наим. груза</th>'+
                    '<th>Вес <br>груза</th>'+
                    '<th>Тара</th>'+
                    '<th>Вес <br>брутто</th>'+
                '</tr>'+
            '</thead>'+
        '</table>'
    );
    
    
    return_table.add_number_input = $('<input>',{type:'text',css:{'font-size':'11px'}, class:'text ui-widget-content ui-corner-all'}).attr('size', '11').attr('maxlength', '11');
    
    this.number_input = return_table.add_number_input;
    
    return_table.add_number_btn = $('<input>',{type:'button',css:{'font-size':'11px','height':'17px'}, class:'btnAdd'}).val('Добавить');
    return_table.add_number_btn.on('click', function(){
        self.add_in_table(null,true);
    });
    return_table.add_number_btn.on('keypress', function(e){
        if(e.keyCode===13){
            self.add_in_table(null,true);
        }
    });

    return_table.append(
        $('<div>',{css:{'margin-left':'61px'}})
        .append(return_table.add_number_input)
        .append(return_table.add_number_btn)
        .hide()
    );

    return_table.table = $('<table>',{class:'cont_table'}).append($('<tbody>'));
    return_table.append(
        $('<div>',{class:'modalDialogContainer',css:{'display':'inline-block'}})  
        .append(return_table.table)
    );
    return_table.table_total_row = $('<tr>',{css:{'background':'#EBEBEB','font-weight':'bold'}});
    self.table_total_row = return_table.table_total_row;
    return_table.append(
        $('<table>',{class:'cont_table',css:{'margin-top':'-4px'}})
        .append(
            $('<tbody>').append(return_table.table_total_row)
        )
    );

    this.check_transport_restriction = function (){
        null;
    };
    this.action_change_table = function (){
        null;
    };

    function up_down_table_tr(p_action,p_tr){
        if (p_action==='up' && p_tr.prev().length!==0){
            var td = p_tr.children('td:nth-child(3)');
            td.text(parseInt(td.text())-1);
            var td_prev = p_tr.prev().children('td:nth-child(3)');
            td_prev.text(parseInt(td_prev.text())+1);

            p_tr.insertBefore(p_tr.prev());

        } else if (p_action==='down' && p_tr.next().length!==0){
            var td = p_tr.children('td:nth-child(3)');
            td.text(parseInt(td.text())+1);
            var td_next = p_tr.next().children('td:nth-child(3)');
            td_next.text(parseInt(td_next.text())-1);

            p_tr.insertAfter(p_tr.next());
        }
    }
    function del_table_tr(p_tr){
        p_tr.nextAll().children('td:nth-child(3)').each(function(){
            $(this).text(parseInt($(this).text())-1);
        });
        p_tr.remove();
        self.count--;
    }
    function change_table_total_tr(){
        return_table.table_total_row.find('td').remove();
        if (self.count!==0) {
            var sum_weight_net = 0;
            return_table.table.find('tr td:nth-child(6)').each(function(){
                sum_weight_net+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
            });
            var sum_weight_dep = 0;
            return_table.table.find('tr td:nth-child(7)').each(function(){
                sum_weight_dep+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
            });
            var sum_weight_gross = 0;
            return_table.table.find('tr td:nth-child(8)').each(function(){
                sum_weight_gross+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
            });

            return_table.table_total_row.append('<td></td>');
            return_table.table_total_row.append('<td></td>');
            return_table.table_total_row.append('<td></td>');
            return_table.table_total_row.append('<td>Кол-во: '+ self.count +'</td>');
            return_table.table_total_row.append('<td></td>');
            return_table.table_total_row.append('<td>'+Math.round(sum_weight_net * 100)/100+'</td>');
            return_table.table_total_row.append('<td>'+Math.round(sum_weight_dep * 100)/100+'</td>');
            return_table.table_total_row.append('<td>'+ Math.round(sum_weight_gross * 100)/100 +'</td>');
        }else{
            return_table.table_total_row.append('<td></td>');
            return_table.table_total_row.append('<td></td>');
            return_table.table_total_row.append('<td></td>');
            return_table.table_total_row.append('<td>Кол-во: 0</td>');
            return_table.table_total_row.append('<td></td>');
            return_table.table_total_row.append('<td>0</td>');
            return_table.table_total_row.append('<td>0</td>');
            return_table.table_total_row.append('<td>0</td>'); 
            return_table.table_total_row.append('<td>0</td>'); 
        }
        self.check_transport_restriction();
        self.action_change_table();
    }
    
    this.spec_check_number = function(p_number){
        return true;
    };
    this.check_number = function(p_number){
        /*var find_result = self.spec_check_car_number(p_car_number);
        if (!find_result){
            return_table.add_carnumber_input.addClass('red_bckg_color');
            alert('На путях нет вагона с номером '+p_car_number+'!');
            return false;
        } else if(return_table.cars_table.find('tr td:contains("'+p_car_number+'")').length!==0) {
            return_table.add_carnumber_input.addClass('red_bckg_color');
            alert('Вагон '+p_car_number+' уже добавлен!');
            return false;
        } else{
            return_table.add_carnumber_input.removeClass('red_bckg_color').val('');
        }*/
        return true;
    };

    /*p_number может быть просто номер вагона: когда добавляем вагон на форме по кнопке
      или же список номеров вагонов разделенных "|": вызывается при открытии формы*/
    this.add_in_table = function(p_number,p_need_check){
        var add_number;
        if (p_number === null || p_number === '') {
            add_number = return_table.add_number_input.val();
        } else {
            add_number = p_number;
        }

        var check_car_number_result = true;
        if (p_need_check) {
            check_car_number_result = self.check_car_number(add_number);
        }

        if (check_car_number_result && add_number !== null && add_number !== '') {
            $.ajax({
                url: 'data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data: { conts: add_number
                       ,ajax_action: 'get_add_info_for_conts'},
                success: function (data) {
                    var records = JSON.parse(data);

                    for(var i=0; i<records.length; i++) {
                        self.count++;
                        var child = records[i];

                        var tr = $('<tr/>');
                        tr.append(
                            $('<td>').append(
                                $('<div>',{class:'up_image'}).on('click', function(){up_down_table_tr('up',$(this).parent().parent());})
                            )
                        );
                        tr.append(
                            $('<td>').append(
                                $('<div>',{class:'down_image'}).on('click', function(){up_down_table_tr('down',$(this).parent().parent());})
                            )
                        );
                        tr.append('<td>'+self.count+'</td>');
                        tr.append('<td>'+child.ID+'</td>');
                        tr.append('<td>'+((child.FREIGHT_NAME !== null) ? child.FREIGHT_NAME : '')+'</td>');
                        tr.append('<td>'+((child.WEIGHT_NET !== null) ? child.WEIGHT_NET.replace(',','.') : '')+'</td>');
                        tr.append('<td>'+((child.WEIGHT_DEP !== null) ? child.WEIGHT_DEP.replace(',','.') : '')+'</td>');
                        tr.append('<td>'+((child.WEIGHT_GROSS !== null) ? child.WEIGHT_GROSS.replace(',','.') : '')+'</td>');
                        tr.append(
                            $('<td>').append(
                                $('<div>',{class:'deleteImage deleteImage13px'}).on('click', function(){
                                    del_table_tr($(this).parent().parent());
                                    change_table_total_tr(); 
                                })
                            )
                        );
                        tr.appendTo(return_table.table); 
                    }
                },
                error: function (m1,m2) {window.alert(m1+m2);}
            });
        }
        change_table_total_tr();
    };

    this.get_cont_in_table = function(){
        var l_res_mas = [];
        return_table.table.find('tr').each(function(){
            l_res_mas.push($(this).children('td:nth-child(4)').text())
        });
        return l_res_mas;
    };

    this.get_table = function(){
        return return_table;
    };
};

/*Создание модального окна "Переместить внутри станции"*/
function create_modal_dialog_move_inside_station(){
    function move_inside_station_ajax(p_cars,p_new_parent_id,p_new_parent_type,p_operation_date,p_comment) {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { cars: p_cars
                   ,parent_id: p_new_parent_id
                   ,parent_type: p_new_parent_type
                   ,operation_date: p_operation_date
                   ,comment: p_comment
                   ,ajax_action: 'move_inside_station_few_child'
               },
            success: function (data) {
                    res = data;
                },
            error: function (data) {
                    res = 'fail';
                }
        });
        return res;
    }
    function get_selected_cars_rows_for_moved_table(){
        var res = '';
        var j=1;
        var l_cars = get_selected_cars();
        l_cars.forEach(function(item){
            res+='<tr>';
            res+='<td><div class="up_image" onclick="up_down_moved_cars_table_tr(\'up\',$(this).parent().parent());"></div></td>';
            res+='<td><div class="down_image" onclick="up_down_moved_cars_table_tr(\'down\',$(this).parent().parent());"></div></td>';
            res+='<td>'+(j++)+'</td>';
            res+='<td>'+item.car_number+'</td>';
            res+='<td>'+item.freight+'</td>';
            res+='<td>'+item.weight_net+'</td>';
            res+='<td>'+item.weight_dep+'</td>';
            res+='<td>'+item.weight_gross+'</td>';
            res+='<td>'+item.length+'</td>';
            res+='<td>'+'<div class="deleteImage deleteImage13px" title="Удалить" onclick="$(this).parent().parent().remove(); change_moved_cars_table_total_tr();md_disable_moved_btn();"></div>'+'</td>';
            res+='</tr>';
            //res+= $(this).children('td:nth-child(1)').text() + '|' + 'railcar' + '$';
        });
        return res;
    }
    function get_select_with_station_child(p_id,p_station_id){
        var result = '<select id="'+p_id+'" class="required">';
        result+='<option value=""></option>';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {station_id: p_station_id 
                    ,ajax_action: 'get_all_station_child'
                    },
            success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        result += '<option '+((item.DISABLED=='Y')?'disabled':'')+' style="'+('margin-left: '+(item.LVL-1)*10 + 'px')+'" data-id="'+item.ID
                                 +'" data-type="'+item.TYPE+'" value="'+item.ID+'" '+'" data-cars_count="'+item.COUNT_RAILCARS+'" data-free_length="'+item.FREE_LENGTH+'">'+item.NAME+'</option>';
                    }); 
                }
        });
        result += '</select>';
        return result;
    }
    function get_moved_cars(){
        var param = '';
        $('table#moved_cars_table tbody tr').each(function(){
            param+= $(this).children('td:nth-child(4)').text() + '|' + 'railcar' + '$';
        });
    
        return param;
    }
    
    start_loading_animation();
    
    var server_current_time;
    
    /* оставил для памяти
    var r_changeRailway = false;
    var targetRailwayId = -1;
    if (target.attr('data-type') === 'railway') {
        targetRailwayId = target.attr('data-id');
    } else {
        //вначале ищем среди потомков #currentCarstree элемент li соотвествующий нашему target, потом среди его предков ищем li соответсвующей пути 
        targetRailwayId = $('#currentCarstree li[data-id="'+target.attr('data-id')+'"][data-type="'+target.attr('data-type')+'"]').parents('li[data-type="railway"]').attr('data-id');
    }
    
    //находим путь на котором стоят выбранные элементы и сравниваем с target путем
    params.forEach(function(item, i, arr) {
        var items = item.split('|');
        var selectRailwayId = $('#currentCarstree li[data-id="'+items[0]+'"][data-type="'+items[1]+'"]').parents('li[data-type="railway"]').attr('data-id');
        if (targetRailwayId !== selectRailwayId) {
            r_changeRailway=true;
        }
    });*/
    
    $('.context-menu').remove();
    
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { ajax_action: 'get_current_time'
        },
        success: function (data) {
            server_current_time = data;
        },
        error: function (data) {
            server_current_time = 'fail';
        }
    });
    
    // создаем div для отображения модального окна
    $('<div/>')
    .attr('id','modalDialog')
    .attr('title','Перемещение вагонов внутри станции')
    .appendTo('body') // Присоединяем наше меню к body документа: 
    .append('<div style="display: table;">'+
                '<div class="attr" style="width:285px;">'+
                    '<div>'+
                        '<label>Станция отправления:</label>'+
                        '<input disabled type="text" size="13" class="text ui-widget-content ui-corner-all" value=""></input>'+
                    '</div>'+
                    '<div>'+
                        '<label>Станция назначения:</label>'+
                        '<input disabled type="text" size="13" class="text ui-widget-content ui-corner-all" value="'+user_station_name+'"></input>'+
                    '</div>'+
                '</div>'+
                '<div class="attr" style="margin-left:14px; text-align:right; float:right">'+
                    '<input disabled type="text" size="14" class="text ui-widget-content ui-corner-all" value="'+server_current_time+'"></input><br>'+
                    '<input disabled type="text" size="20" class="text ui-widget-content ui-corner-all" style="margin-top:10px;" value="'+user_name+'"></input>'+
                '</div>'+
            '</div>'+
            
            '<div style="display: table;">'+
                '<div class="attr" style="border:none; width: 484px;">'+
                    '<div>'+
                        '<label for="md_operation_date">Дата и время операции (Мск)</label>'+
                        '<input id="md_operation_date" type="text" size="15" class="text ui-widget-content ui-corner-all required">' +
                    '</div>'+
                    '<div>'+
                        '<label for="md_comment">Комментарий</label>'+
                        '<input id="md_comment" type="text" style="width:350px;" class="text ui-widget-content ui-corner-all">' +
                    '</div>'+
                '</div>'+
            '</div>'+
                        
            '<div style="display: table;">'+
                '<div class="border" style="clear:both">'+
                    '<div class="header" style="width: 180px;">Место назначения</div>'+
                    '<div style="display: inline-table;">'+
                        '<div class="attr" style="border:none; width: 470px;">'+
                            '<div>'+
                                '<label for="md_new_parent">Куда перемещаем</label>'+
                                get_select_with_station_child('md_new_parent',$('#currentCarstree li[data-type="station"]').attr('data-id')) +
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            
            '<table class="moved_cars_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th></th>'+
                        '<th></th>'+
                        '<th>№</th>'+
                        '<th>Вагон</th>'+
                        '<th>Наим. груза</th>'+
                        '<th>Вес <br>груза</th>'+
                        '<th>Тара</th>'+
                        '<th>Вес <br>брутто</th>'+
                        '<th>Длина</th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'+
            '<div style="margin-left:61px;">'+
                '<input id="md_moved_add_car" style="font-size: 11px;" type="text" maxlength="8" size="8" class="text ui-widget-content ui-corner-all">' +
                '<input type="button" style="font-size: 11px; height: 17px;" value="Добавить" onclick="add_car_in_moved_table();" class="btnAdd">'+
            '</div>'+
            '<div class="modalDialogContainer" style="display: inline-block;">'+
                '<table id="moved_cars_table" class="moved_cars_table">'+
                    '<tbody>'+
                        get_selected_cars_rows_for_moved_table()+
                    '</tbody>'+
                '</table>'+
            '</div>'+
            '<table class="moved_cars_table" style="margin-top: -4px;">'+
                '<tbody>'+
                    '<tr id="moved_cars_table_total_tr" style="background: #EBEBEB; font-weight: bold;"></tr>'+
                '</tbody>'+
            '</table>'
           );
    
    // инициализируем input с датой
    var l_compare_date = get_server_current_time();
    var l_compare_date_from = add_day_to_date(l_compare_date,-30);
    var l_compare_date_to = add_day_to_date(l_compare_date,1);
    
    init_date_time_input_btw($('#md_operation_date'),l_compare_date_from,l_compare_date_to);
    
    //init_date_time_input($('#md_operation_date'));
    $('#md_operation_date').on('blur',function(){md_disable_moved_btn();});
    
    $("#md_new_parent").combobox({menuMaxHeight: '50em'});
    
    $('#md_new_parent').select(function(){
        md_disable_moved_btn();
        md_move_inside_station_alert();
    });
    
    /*beg заполняем input с автозаполнением вагонов*/
    var in_station_cars_mas = [];
    var in_station_cars = $('#currentCarstree > li[data-type="station"][data-id="'+user_station_id+'"] li[data-type="railcar"]');
    in_station_cars.sort(function(a, b) {
        var compA = $(a).attr('data-id');
        var compB = $(b).attr('data-id');
        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    });
    
    in_station_cars.each(function (){
        in_station_cars_mas.push($(this).attr('data-id'));
    });
    
    $("#md_moved_add_car").autocomplete({source: in_station_cars_mas,minLength: 2});
    
    $('#md_moved_add_car').on('keypress', function(e){
        if(e.keyCode===13){
            add_car_in_moved_table();
        }
    });
    /*end заполняем input с автозаполнением вагонов*/
    
    // вызываем модальное окно 
    $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Переместить':{
                text: "Переместить",
                  id: "md_moved_btn",
               click: function(){
                        if (check_open_period('2',$('#md_operation_date').val())=='0') {
                            create_info_modal_dialog_new('Оповещение','Для даты '+$('#md_operation_date').val()+' нет открытого периода! Переместить вагоны не возможно!');
                        }else{
                            var l_cars = get_moved_cars(); //сохраняем выбранные элементы
                            var l_cars_mas = l_cars.split('$'); //создаем массив
                            l_cars_mas.pop(); //убираем последний элемент массива, т.к. он пустой

                            var new_parent = {'id':$('#md_new_parent > option:selected').attr('data-id'),'type':$('#md_new_parent > option:selected').attr('data-type')}

                            if (move_inside_station_ajax(l_cars,new_parent.id,new_parent.type,$('#md_operation_date').val(),$('#md_comment').val())==='done') {
                                //Выбираем все элементы li с заданными аттрибутами внутри ul с заданным id и берем потомок ul
                                var newParent = $('ul#cur_station li[data-id='+new_parent.id+'][data-type='+new_parent.type+']');
                                var newParentCont = newParent.children('ul');
                                if (newParent.hasClass('tree_ExpandLeaf')) {
                                        newParent.removeClass('tree_ExpandLeaf');
                                        newParent.addClass('tree_ExpandOpen');
                                }
                                l_cars_mas.forEach(function(item, i, arr) {
                                    var items = item.split('|');
                                    $('li[data-id="'+items[0]+'"][data-type="'+items[1]+'"]').detach().appendTo(newParentCont);
                                });

                                $('.tree_selected').removeClass('tree_selected');
                                clear_add_info();
                                changeRailcarCount();
                                create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                            }else{
                                create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
                            }

                            $(this).dialog( "close" );
                        }
                    }   
                }, 
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    }); 
	/* Скрываем кнопку */
    md_disable_moved_btn();
	/* Изменяем итоговое кол-во */
    change_moved_cars_table_total_tr();
    stop_loading_animation();
}
function add_car_in_moved_table(){
    var sent_table = $('table#moved_cars_table > tbody');
    var add_car = $('#md_moved_add_car').val();
    var count = sent_table.children('tr').length + 1;
    
    if ($('#currentCarstree > li[data-type="station"][data-id="'+user_station_id+'"] li[data-id="'+add_car+'"][data-type="railcar"]').length===0){
        $('#md_moved_add_car').addClass('red_bckg_color');
        alert('На путях нет вагона с номером '+add_car+'!');
    } else if(sent_table.find('tr td:contains("'+add_car+'")').length!==0) {
        $('#md_moved_add_car').addClass('red_bckg_color');
        alert('Вагон '+add_car+' уже добавлен!');
    } else{
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            data: { id: add_car
                   ,type: 'railcar'
                   ,station_id: user_station_id
                   ,ajax_action: 'addInfo'
                  },
            success: function (data) {
                var records = JSON.parse(data);

                for(var i=0; i<records.length; i++) {
                    var child = records[i];
                    
                    var tr = $('<tr/>');
                    tr.append('<td><div class="up_image" onclick="up_down_moved_cars_table_tr(\'up\',$(this).parent().parent());"></div></td>');
                    tr.append('<td><div class="down_image" onclick="up_down_moved_cars_table_tr(\'down\',$(this).parent().parent());"></div></td>');
                    tr.append('<td>'+count+'</td>');
                    tr.append('<td>'+child.ID+'</td>');
                    tr.append('<td>'+((child.FREIGHT_NAME !== null) ? child.FREIGHT_NAME : '')+'</td>');
                    tr.append('<td>'+((child.WEIGHT_NET !== null) ? child.WEIGHT_NET.replace(',','.') : '')+'</td>');
                    tr.append('<td>'+((child.WEIGHT_DEP !== null) ? child.WEIGHT_DEP.replace(',','.') : '')+'</td>');
                    tr.append('<td>'+((child.WEIGHT_GROSS !== null) ? child.WEIGHT_GROSS.replace(',','.') : '')+'</td>');
                    tr.append('<td>'+((child.CAR_LENGTH !== null) ? child.CAR_LENGTH.replace(',','.') : '')+'</td>');
                    tr.append('<td>'+'<div class="deleteImage deleteImage13px" title="Удалить" onclick="$(this).parent().parent().remove(); change_moved_cars_table_total_tr(); md_disable_moved_btn();"></div>'+'</td>');
                    tr.appendTo(sent_table);
                }
                
                md_disable_moved_btn();
                change_moved_cars_table_total_tr();
                $('#md_moved_add_car').removeClass('red_bckg_color');
                $('#md_moved_add_car').val('');
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
    }
}
function change_moved_cars_table_total_tr(){
    $('#moved_cars_table_total_tr td').remove();
    if ($('#moved_cars_table tbody tr').length!==0) {
        var sum_weight_net = 0;
        $('#moved_cars_table tbody tr td:nth-child(6)').each(function(){
            sum_weight_net+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        var sum_weight_dep = 0;
        $('#moved_cars_table tbody tr td:nth-child(7)').each(function(){
            sum_weight_dep+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        var sum_weight_gross = 0;
        $('#moved_cars_table tbody tr td:nth-child(8)').each(function(){
            sum_weight_gross+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        var sum_car_length = 0;
        $('#moved_cars_table tbody tr td:nth-child(9)').each(function(){
            sum_car_length+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        
        var tr = $('#moved_cars_table_total_tr');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td>Кол-во: '+ $('#moved_cars_table tbody tr').length+'</td>');
        tr.append('<td></td>');
        tr.append('<td>'+Math.round(sum_weight_net * 100)/100+'</td>');
        tr.append('<td>'+Math.round(sum_weight_dep * 100)/100+'</td>');
        tr.append('<td>'+ Math.round(sum_weight_gross * 100)/100 +'</td>');
        tr.append('<td>'+ Math.round(sum_car_length * 100)/100 +'</td>');
    }else{
        var tr = $('#moved_cars_table_total_tr');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td>Кол-во: 0</td>');
        tr.append('<td></td>');
        tr.append('<td>0</td>');
        tr.append('<td>0</td>');
        tr.append('<td>0</td>'); 
        tr.append('<td>0</td>');
    }
    md_move_inside_station_alert();
}
function up_down_moved_cars_table_tr(p_action,p_tr){
    //var p = p_tr;
    //var d = 1;
    if (p_action==='up' && p_tr.prev().length!==0){
        var td = p_tr.children('td:nth-child(3)');
        td.text(parseInt(td.text())-1);
        var td_prev = p_tr.prev().children('td:nth-child(3)');
        td_prev.text(parseInt(td_prev.text())+1);
        
        p_tr.insertBefore(p_tr.prev());

    } else if (p_action==='down' && p_tr.next().length!==0){
        var td = p_tr.children('td:nth-child(3)');
        td.text(parseInt(td.text())+1);
        var td_next = p_tr.next().children('td:nth-child(3)');
        td_next.text(parseInt(td_next.text())-1);
        
        p_tr.insertAfter(p_tr.next());
    }
}
function md_disable_moved_btn(){
    if ($('#md_operation_date').hasClass('red_bckg_color')||$('#md_operation_date').val()==''||   
        $('#md_new_parent').val()==''||$('#moved_cars_table tbody tr').length===0
       )
    {
        $('#md_moved_btn').prop( "disabled", true );
    }else{
        $('#md_moved_btn').prop( "disabled", false );
    }
}
function md_move_inside_station_alert(){
    if ($('#md_new_parent').val()==''||$('#md_new_parent').val()=='-1') {
        
    }else {
        var free_cars_count = parseInt($('#md_new_parent option:selected').attr('data-cars_count'));
        var free_cars_length = parseInt($('#md_new_parent option:selected').attr('data-free_length'));
        
        var cars_count = parseInt($('#moved_cars_table_total_tr td:nth-child(4)').text().match(/[^ ]+/g)[1]);

        var cars_length = parseFloat($('#moved_cars_table_total_tr td:nth-child(9)').text());
    
        if (cars_count > free_cars_count){
            var td_count = $('#moved_cars_table_total_tr td:nth-child(4)');
            td_count
                .addClass('red_bckg_color')
                .attr('title','Кол-во вагонов превысило допустимое значение: ' + cars_count + ' > '+ free_cars_count)
                .tooltip({
                    tooltipClass: "ui-red-border",
                    position: {
                        my: "left top",
                        at: "left bottom+11",
                        using: function( position, feedback ) {
                          $( this ).css( position );
                          $( "<div>" )
                            .addClass( "arrow" )
                            .addClass( feedback.vertical )
                            .addClass( feedback.horizontal )
                            .appendTo( this );
                        }
                      }
                })
                .tooltip( "open" );
            setTimeout(function() { td_count.tooltip( 'close' ) }, 2500);
        } else {
            var td_count = $('#moved_cars_table_total_tr td:nth-child(9)');
            td_count
                .removeClass('red_bckg_color')
                .attr('title','');
            if (td_count.tooltip("instance")!=null){td_count.tooltip( "disable" );}
        }
        
        if (cars_length > free_cars_length){
            var td_length = $('#moved_cars_table_total_tr td:nth-child(9)');
            td_length
                .addClass('red_bckg_color')
                .attr('title','Длина состава превысила допустимое значение: ' + cars_length + ' > '+ free_cars_length)
                .tooltip({
                    tooltipClass: "ui-red-border",
                    position: {
                        my: "left top",
                        at: "left bottom+11",
                        using: function( position, feedback ) {
                          $( this ).css( position );
                          $( "<div>" )
                            .addClass( "arrow" )
                            .addClass( feedback.vertical )
                            .addClass( feedback.horizontal )
                            .appendTo( this );
                        }
                      }
                })
                .tooltip( "open" );
            setTimeout(function() { td_length.tooltip( 'close' ) }, 2500);
        } else {
            var td_length = $('#moved_cars_table_total_tr td:nth-child(9)');
            td_length
                .removeClass('red_bckg_color')
                .attr('title','');
            if (td_length.tooltip("instance")!=null){td_length.tooltip( "disable" );}
        }
    }
}

function get_select_train_drivers(p_id){
    var result = '<select id="'+p_id+'">';
    result += '<option value="-1"></option>';
    $.each(g_train_drivers, function( i, item ) {
        result += '<option value="'+item.ID+'">'+item.NAME+'</option>';
    });
    result += '</select>';
    return result; 
}
function get_select_train_drivers_obj(){
    var result = $('<select>');
    result.append('<option value="-1"></option>');
    $.each(g_train_drivers, function( i, item ) {
        result.append('<option value="'+item.ID+'">'+item.NAME+'</option>');
    });
    return result; 
}
function get_select_conductors(p_id){
    var result = '<select id="'+p_id+'">';
    result += '<option value="-1"></option>';
    $.each(g_conductors, function( i, item ) {
        result += '<option value="'+item.ID+'">'+item.NAME+'</option>';
    });
    result += '</select>';
    return result; 
}
function get_select_conductors_obj(){
    var result = $('<select>');
    result.append('<option value="-1"></option>');
    $.each(g_conductors, function( i, item ) {
        result.append('<option value="'+item.ID+'">'+item.NAME+'</option>');
    });
    return result; 
}
function get_select_locomotives(p_id){
    var result = '<select id="'+p_id+'">';
    result += '<option value="-1"></option>';
    $.each(g_locomotives, function( i, item ) {
        result += '<option value="'+item.ID+'">'+item.NAME+'</option>';
    });
    result += '</select>';
    return result; 
}
function get_select_locomotives_obj(){
    var result = $('<select>');
    result.append('<option value="-1"></option>');
    $.each(g_locomotives, function( i, item ) {
        result.append('<option value="'+item.ID+'">'+item.NAME+'</option>');
    });
    return result; 
}


/*Действие на нажатие кнопки контексного меню 2-ого уровня: отправка вагонов на другую станцию*/
function create_modal_dialog_send_to_station(event) {
    /*Изменяем предка на сервере*/
    function send_to_station_ajax(p_cars,p_send_stat_id,p_dest_stat_id,p_send_date,p_arrival_date,p_reason,p_train_num
                                 ,p_loco1_num,p_loco1_driver1,p_loco1_driver2,p_loco1_conductor
                                 ,p_loco2_num,p_loco2_driver1,p_loco2_driver2,p_loco2_conductor
                                 ,p_save_name) 
    {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { cars: p_cars
                   ,send_stat_id:p_send_stat_id
                   ,dest_stat_id:p_dest_stat_id
                   ,send_date:p_send_date
                   ,arrival_date:p_arrival_date
                   ,reason:p_reason
                   ,train_num:p_train_num
                   ,loco1_num:p_loco1_num
                   ,loco1_driver1:p_loco1_driver1
                   ,loco1_driver2:p_loco1_driver2
                   ,loco1_conductor:p_loco1_conductor
                   ,loco2_num:p_loco2_num
                   ,loco2_driver1:p_loco2_driver1
                   ,loco2_driver2:p_loco2_driver2
                   ,loco2_conductor:p_loco2_conductor
                   ,save_name:p_save_name
                   ,ajax_action: 'send_to_station_few_cars'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }   
    function get_selected_cars_rows(){
        var res = '';
        var j=1;
        
        var l_cars = get_selected_cars();
		l_cars.forEach(function(item){
            res+='<tr>';
            res+='<td><div class="up_image" onclick="up_down_sent_cars_table_tr(\'up\',$(this).parent().parent());"></div></td>';
            res+='<td><div class="down_image" onclick="up_down_sent_cars_table_tr(\'down\',$(this).parent().parent());"></div></td>';
            res+='<td>'+(j++)+'</td>';
            res+='<td>'+item.car_number+'</td>';
            res+='<td>'+item.freight+'</td>';
            res+='<td>'+item.weight_net+'</td>';
            res+='<td>'+item.weight_dep+'</td>';
            res+='<td>'+item.weight_gross+'</td>';
            res+='<td>'+item.length+'</td>';
			res+='<td>'+item.cond_length_train+'</td>';
            res+='<td>'+'<div class="deleteImage deleteImage13px" title="Удалить" onclick="del_sent_cars_table_tr($(this).parent().parent()); change_sent_cars_table_total_tr(); md_disable_send_btn();"></div>'+'</td>';
            res+='</tr>';
            //res+= $(this).children('td:nth-child(1)').text() + '|' + 'railcar' + '$';
        });
        return res;
    }
    function fill_table_with_selected_cars(){
        var l_cars = get_selected_cars();
        l_cars.forEach(function(item){
            add_car_in_sent_table(item.car_number);
        }); 
    }
    function get_sent_cars(){
        var param = '';
        $('table#sent_cars_table tbody tr').each(function(){
            param+= $(this).children('td:nth-child(4)').text() + '|' + 'railcar' + '$';
        });
    
        return param;
    }
    function run_report(p_type){
        var l_train_num = $('#md_send_to_station_train_num').val();
        var l_loco1_num = $('#md_send_to_station_loco1_num option:selected').text();
        var l_loco1_driver1 = $('#md_send_to_station_loco1_driver1 option:selected').text();
        var l_loco1_driver2 = $('#md_send_to_station_loco1_driver2 option:selected').text();
        var l_loco1_conductor = $('#md_send_to_station_loco1_conductor option:selected').text();
        var l_loco2_num = $('#md_send_to_station_loco2_num option:selected').text();
        var l_loco2_driver1 = $('#md_send_to_station_loco2_driver1 option:selected').text();
        var l_loco2_driver2 = $('#md_send_to_station_loco2_driver2 option:selected').text();
        var l_loco2_conductor = $('#md_send_to_station_loco2_conductor option:selected').text();
        var l_cars = get_sent_cars_for_wagon_list();

        var win = window.open('wagon_list/wagon_list_word.php?'+
                                'date_from='+$('#md_send_to_station_sending_time').val()+'&'+
                                'report='+p_type+'&'+
                                'station_from='+user_station_name+'&'+
                                'station_to='+target.text()+'&'+
                                'train_num='+l_train_num+'&'+
                                'loco1_num='+l_loco1_num+'&'+
                                'loco1_driver1='+l_loco1_driver1+'&'+
                                'loco1_driver2='+l_loco1_driver2+'&'+
                                'loco1_conductor='+l_loco1_conductor+'&'+
                                'loco2_num='+l_loco2_num+'&'+
                                'loco2_driver1='+l_loco2_driver1+'&'+
                                'loco2_driver2='+l_loco2_driver2+'&'+
                                'loco2_conductor='+l_loco2_conductor+'&'+
                                'cars='+l_cars,'_blank');
    }
    
    var server_current_time; 
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { ajax_action: 'get_current_time'
        },
        success: function (data) {
            server_current_time = data;
        },
        error: function (data) {
            server_current_time = 'fail';
        }
    });
    
    var target = $(event.target); // сохраняем элемент на который нажали (станция на которую отправляем) 
    
    $('.context-menu').remove();
    
    // создаем div для отображения модального окна
    $('<div/>')
    .attr('id','modalDialog')
    .attr('title','Отправка вагонов на станцию ' + target.text())
    .appendTo('body') // Присоединяем наше меню к body документа: 
    .append('<div style="display: table;">'+
                '<div class="attr" style="width:300px;">'+
                    '<div>'+
                        '<label>Станция отправления:</label>'+
                        '<input disabled type="text" size="13" class="text ui-widget-content ui-corner-all" value="'+user_station_name+'"></input>'+
                    '</div>'+
                    '<div>'+
                        '<label>Станция назначения:</label>'+
                        '<input disabled type="text" size="13" class="text ui-widget-content ui-corner-all" value="'+target.text()+'"></input>'+
                    '</div>'+
                '</div>'+
                '<div class="attr" style="margin-left:50px; text-align:right; float:right">'+
                    '<input disabled type="text" size="14" class="text ui-widget-content ui-corner-all" value="'+server_current_time+'"></input><br>'+
                    '<input disabled type="text" size="20" class="text ui-widget-content ui-corner-all" style="margin-top:10px;" value="'+user_name+'"></input>'+
                '</div>'+
            '</div>'+
            '<div style="display: table; margin-top: 5px;">'+
                '<div class="border" style="clear:both; margin-top: 0px !important;">'+
                    '<div style="display: inline-table;">'+
                        '<div style="float: left;">'+
                            '<input id="md_save_send_to_station_form_btn" class="md_save_load" type="button" value="Сохранить" onclick="save_send_to_station_form_btn_action();"></br>'+
                            '<input id="md_save_send_to_station_form_inp" class="md_save_load" type="text" value="'+user_name.slice(0, user_name.indexOf(' '))+'_'+server_current_time+'" maxlength="30">'+
                        '</div>'+
                        '<div style="float: left; margin-left: 15px;">'+
                            '<input id="md_load_send_to_station_form_btn" class="md_save_load" type="button" value="Загрузить" onclick="load_send_to_station_form_btn_action()"></br>'+
                            '<select id="md_load_send_to_station_form_sel" class="md_save_load">'+
                                get_select_options_with_saved_send_to_station_forms()+
                            '</select>'+
                        '</div>'+
                        '<div style="float: left; margin-left: 15px;">'+
                            '<input id="md_del_send_to_station_form_btn" class="md_save_load" type="button" value="Очистить" onclick="del_send_to_station_form_btn_action()"></br>'+
                            '<select id="md_del_send_to_station_form_sel" class="md_save_load">'+
                                get_select_options_with_saved_send_to_station_forms()+
                            '</select>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<div style="display: inline-table;">'+
                '<div class="attr" style="border:none; width: 560px;">'+
                    '<div>'+
                        '<label for="md_send_to_station_sending_time">Дата и время отправления (Мск)</label>'+
                        '<input id="md_send_to_station_sending_time" type="text" size="15" class="text ui-widget-content ui-corner-all required">' +
                    '</div>'+
                    '<div>'+
                        '<label for="md_send_to_station_arrival_time">Дата и время прибытия (Мск)</label>'+
                        '<input id="md_send_to_station_arrival_time" type="text" size="15" class="text ui-widget-content ui-corner-all required">' +
                    '</div>'+
                    '<div>'+
                        '<label for="md_send_to_station_estimated_time">Расчетное время в пути</label>'+
                        '<input disabled id="md_send_to_station_estimated_time" type="text" size="15" class="text ui-widget-content ui-corner-all">' +
                    '</div>'+
                    '<div>'+
                        '<label for="md_send_to_station_reason">Комментарий</label>'+
                        '<input id="md_send_to_station_reason" type="text" size="60" class="text ui-widget-content ui-corner-all">'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<table class="sent_cars_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th></th>'+
                        '<th></th>'+
                        '<th>№</th>'+
                        '<th>Вагон</th>'+
                        '<th>Наим. груза</th>'+
                        '<th>Вес <br>груза</th>'+
                        '<th>Тара</th>'+
                        '<th>Вес <br>брутто</th>'+
                        '<th>Длина</th>'+
						'<th>Усл.<br>ед.ваг</th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'+
            '<div style="margin-left:61px;">'+
                '<input id="md_send_to_station_add_car" style="font-size: 11px;" type="text" maxlength="8" size="8" class="text ui-widget-content ui-corner-all">' +
                '<input type="button" style="font-size: 11px; height: 17px;" value="Добавить" onclick="add_car_in_sent_table();" class="btnAdd">'+
            '</div>'+
            '<div class="modalDialogContainer" style="display: inline-block;">'+
                '<table id="sent_cars_table" class="sent_cars_table">'+
                    '<tbody>'+
                    //get_selected_cars_rows()+
                    '</tbody>'+
                '</table>'+
            '</div>'+
            '<table class="sent_cars_table" style="margin-top: -4px;">'+
                '<tbody>'+
                    '<tr id=sent_cars_table_total_tr style="background: #EBEBEB; font-weight: bold;"></tr>'+
                '</tbody>'+
            '</table>'+
            '<div class="border" style="clear: both;">'+
                '<div class="header" style="width:190px;">Формирование бригады</div>'+
                
                '<div style="display: inline-table">'+
                    '<div class="attr" style="border:none; margin-top:0px; margin-bottom:0px;">'+
                        '<div>'+
                            '<label for="md_send_to_station_train_num">Номер поезда </label>'+
                            '<input id="md_send_to_station_train_num" type="text" size="4" class="text ui-widget-content ui-corner-all required">' +
                        '</div>'+
                    '</div>'+
                '</div>'+
                
                '<div style="display: table">'+
                    '<div class="border" style="float:left;">'+
                        '<div class="header" style="width:110px;">'+
                            'Локомотив 1'+
                        '</div>'+
                        '<div style="display: inline-table">'+
                            '<div class="attr" style="border:none; margin-top:0px; margin-bottom:0px;">'+
                                '<div>'+
                                    '<label for="md_send_to_station_loco1_num">№ локомотива</label>'+
                                    get_select_locomotives('md_send_to_station_loco1_num')+ 
                                '</div>'+
                                '<div>'+
                                    '<label for="md_send_to_station_loco1_driver1">Машинист</label>'+
                                    get_select_train_drivers('md_send_to_station_loco1_driver1')+ 
                                '</div>'+
                                '<div>'+
                                    '<label for="md_send_to_station_loco1_driver2">Пом. машиниста</label>'+
                                    get_select_train_drivers('md_send_to_station_loco1_driver2')+
                                '</div>'+
                                '<div>'+
                                    '<label for="md_send_to_station_loco1_conductor">Кондуктор</label>'+
                                    get_select_conductors('md_send_to_station_loco1_conductor')+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+

                    '<div class="border" style="float:left;">'+
                        '<div class="header" style="width:110px;">'+
                            'Локомотив 2'+
                        '</div>'+
                        '<div style="display: inline-table">'+
                            '<div class="attr" style="border:none; margin-top:0px; margin-bottom:0px;">'+
                                '<div>'+
                                    '<label for="md_send_to_station_loco2_num">№ локомотива</label>'+
                                    get_select_locomotives('md_send_to_station_loco2_num')+ 
                                '</div>'+
                                '<div>'+
                                    '<label for="md_send_to_station_loco2_driver1">Машинист</label>'+
                                    get_select_train_drivers('md_send_to_station_loco2_driver1')+
                                '</div>'+
                                '<div>'+
                                    '<label for="md_send_to_station_loco2_driver2">Пом. машиниста</label>'+
                                    get_select_train_drivers('md_send_to_station_loco2_driver2')+
                                '</div>'+
                                '<div>'+
                                    '<label for="md_send_to_station_loco2_conductor">Кондуктор</label>'+
                                    get_select_conductors('md_send_to_station_loco2_conductor')+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'
            
           );
           
    fill_table_with_selected_cars();       
        
    $('#md_send_to_station_add_car').on('keypress', function(e){
        if(e.keyCode===13){
            add_car_in_sent_table();
        }
    });
    
    $('#md_send_to_station_loco1_num, #md_send_to_station_loco2_num').on("change",function(){
        md_send_to_station_alert();
    });
    
    /*beg заполняем input с автозаполнением вагонов*/
    var in_station_cars_mas = [];
    var in_station_cars = $('#currentCarstree > li[data-type="station"][data-id="'+user_station_id+'"] li[data-type="railcar"]');
    in_station_cars.sort(function(a, b) {
        var compA = $(a).attr('data-id');
        var compB = $(b).attr('data-id');
        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    });
    
    in_station_cars.each(function (){
        in_station_cars_mas.push($(this).attr('data-id'));
    });
    
    $( "#md_send_to_station_add_car" ).autocomplete({source: in_station_cars_mas,minLength: 2});
    /*end заполняем input с автозаполнением вагонов*/
    
    // инициализируем input с датой
    var l_compare_date = get_server_current_time();
    var l_compare_date_from = add_day_to_date(l_compare_date,-30);
    var l_compare_date_to = add_hours_to_date(l_compare_date,2);
    
    init_date_time_input_btw($('#md_send_to_station_sending_time'),l_compare_date_from,l_compare_date_to);
    
    //init_date_time_input($('#md_send_to_station_sending_time'));
    
    // инициализируем input с датой
    init_date_time_input($('#md_send_to_station_arrival_time'));
    
    $('#md_send_to_station_sending_time,#md_send_to_station_arrival_time').on('blur',function (e){
        var l_sending_time = $('#md_send_to_station_sending_time').val();
        var l_arrival_time = $('#md_send_to_station_arrival_time').val();
        
        var pattern = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2})\:(\d{2})/;
        var l_sending_time_d = new Date(l_sending_time.replace(pattern,'$3-$2-$1T$4:$5:00'));
        var l_arrival_time_d = new Date(l_arrival_time.replace(pattern,'$3-$2-$1T$4:$5:00'));
        
        var diff_hh = parseInt((l_arrival_time_d - l_sending_time_d)/1000/60/60);
        var diff_mi = ((l_arrival_time_d - l_sending_time_d)/1000/60)%60;
        
        $('#md_send_to_station_estimated_time').val((diff_hh<0||diff_mi<0?'-':'')+Math.abs(diff_hh)+':'+Math.abs(diff_mi));
    });
    
    $('#md_send_to_station_sending_time,#md_send_to_station_arrival_time,#md_send_to_station_train_num').on('blur',function(){md_disable_send_btn();});
    
    g_from_station = user_station_id;
    g_to_station = target.attr('data-id'); 
    
    // вызываем модальное окно 
    $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        buttons:{
            'Отправить':{
                text: "Отправить",
                  id: "md_sent_btn",
               click: function(){
                    if (user_station_id=='2' && target.attr('data-id') =='1' && check_open_period('1',$('#md_send_to_station_sending_time').val())=='0') {
                        create_info_modal_dialog_new('Оповещение','Для даты '+$('#md_send_to_station_sending_time').val()+' нет открытого периода! Отправить вагоны с данной датой не возможно!');
                    }else if ((user_station_id=='3' || target.attr('data-id') =='3') && check_open_period('2',$('#md_send_to_station_sending_time').val())=='0') {
                        create_info_modal_dialog_new('Оповещение','Для даты '+$('#md_send_to_station_sending_time').val()+' нет открытого периода! Отправить вагоны с данной датой не возможно!');
                    }else{
                        var l_cars = get_sent_cars(); //сохраняем выбранные элементы
                        var l_cars_mas = l_cars.split('$'); //создаем массив
                        l_cars_mas.pop(); //убираем последний элемент массива, т.к. он пустой

                        if (send_to_station_ajax(l_cars,user_station_id,target.attr('data-id'),$('#md_send_to_station_sending_time').val(),$('#md_send_to_station_arrival_time').val()
                                                ,$('#md_send_to_station_reason').val(),$('#md_send_to_station_train_num').val()
                                                ,$('#md_send_to_station_loco1_num').val(),$('#md_send_to_station_loco1_driver1').val(),$('#md_send_to_station_loco1_driver2').val(),$('#md_send_to_station_loco1_conductor').val()        
                                                ,$('#md_send_to_station_loco2_num').val(),$('#md_send_to_station_loco2_driver1').val(),$('#md_send_to_station_loco2_driver2').val(),$('#md_send_to_station_loco2_conductor').val()
                                                ,$('#md_save_send_to_station_form_inp').val()        
                                                )==='done') 
                        {
                            l_cars_mas.forEach(function(item, i, arr) {
                                var items = item.split('|');
                                $('li[data-id="'+items[0]+'"][data-type="'+items[1]+'"]').remove();
                            });
                            clear_add_info();
                            changeRailcarCount();
                            create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                        }else{
                            create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
                        }

                        $('.tree_selected').removeClass('tree_selected');
                        $(this).dialog( "close" );
                    }
                }   
            },
            'ВУ-14':{
                text: "ВУ-14",
                id: "md_sent_btn",
                click: function(){
                    run_report('VU');                                
                }   
            }, 
            'ДУ-1':{
                text: "ДУ-1",
                id: "md_sent_btn",
                click: function(){
                    run_report('DU');
                }   
            }, 
            'Закрыть': function(){
                $(this).dialog("close");
            }
        },
        close: function() {
            $(this).remove();
        }
    });
    md_disable_send_btn();
    change_sent_cars_table_total_tr();
}
function up_down_sent_cars_table_tr(p_action,p_tr){
    //var p = p_tr;
    //var d = 1;
    if (p_action==='up' && p_tr.prev().length!==0){
        var td = p_tr.children('td:nth-child(3)');
        td.text(parseInt(td.text())-1);
        var td_prev = p_tr.prev().children('td:nth-child(3)');
        td_prev.text(parseInt(td_prev.text())+1);
        
        p_tr.insertBefore(p_tr.prev());

    } else if (p_action==='down' && p_tr.next().length!==0){
        var td = p_tr.children('td:nth-child(3)');
        td.text(parseInt(td.text())+1);
        var td_next = p_tr.next().children('td:nth-child(3)');
        td_next.text(parseInt(td_next.text())-1);
        
        p_tr.insertAfter(p_tr.next());
    }
}
function del_sent_cars_table_tr(p_tr){
    p_tr.nextAll().children('td:nth-child(3)').each(function(){
        $(this).text(parseInt($(this).text())-1);
    });
    p_tr.remove();
}
function change_sent_cars_table_total_tr(){
    $('#sent_cars_table_total_tr td').remove();
    if ($('#sent_cars_table tbody tr').length!==0) {
        var sum_weight_net = 0;
        $('#sent_cars_table tbody tr td:nth-child(6)').each(function(){
            sum_weight_net+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        var sum_weight_dep = 0;
        $('#sent_cars_table tbody tr td:nth-child(7)').each(function(){
            sum_weight_dep+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        var sum_weight_gross = 0;
        $('#sent_cars_table tbody tr td:nth-child(8)').each(function(){
            sum_weight_gross+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        var sum_car_length = 0;
        $('#sent_cars_table tbody tr td:nth-child(9)').each(function(){
            sum_car_length+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
		var sum_car_cond_length = 0;
        $('#sent_cars_table tbody tr td:nth-child(10)').each(function(){
            sum_car_cond_length+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        
        var tr = $('#sent_cars_table_total_tr');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td>Кол-во: '+ $('#sent_cars_table tbody tr').length+'</td>');
        tr.append('<td></td>');
        tr.append('<td>'+Math.round(sum_weight_net * 100)/100+'</td>');
        tr.append('<td>'+Math.round(sum_weight_dep * 100)/100+'</td>');
        tr.append('<td>'+ Math.round(sum_weight_gross * 100)/100 +'</td>');
        tr.append('<td>'+ Math.round(sum_car_length * 100)/100 +'</td>');
		tr.append('<td>'+ Math.round(sum_car_cond_length * 100)/100 +'</td>');
    }else{
        var tr = $('#sent_cars_table_total_tr');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td>Кол-во: 0</td>');
        tr.append('<td></td>');
        tr.append('<td>0</td>');
        tr.append('<td>0</td>');
        tr.append('<td>0</td>'); 
        tr.append('<td>0</td>');
		tr.append('<td>0</td>');
    }
    md_send_to_station_alert();
}
function add_car_in_sent_table(p_railcar){
    var sent_table = $('table#sent_cars_table > tbody');
    
    var add_car;
    if (p_railcar === undefined) {
        add_car = $('#md_send_to_station_add_car').val();
    } else{
        add_car = p_railcar;
    }
    
    var count = sent_table.children('tr').length + 1;
    
    if ($('#currentCarstree > li[data-type="station"][data-id="'+user_station_id+'"] li[data-id="'+add_car+'"][data-type="railcar"]').length===0){
        $('#md_send_to_station_add_car').addClass('red_bckg_color');
        alert('На путях нет вагона с номером '+add_car+'!');
    } else if(sent_table.find('tr td:contains("'+add_car+'")').length!==0) {
        $('#md_send_to_station_add_car').addClass('red_bckg_color');
        alert('Вагон '+add_car+' уже добавлен!');
    } else if (g_from_station==2 && g_to_station==1 
               && $('#currentCarstree > li[data-type="station"][data-id="'+user_station_id+'"] li[data-id="'+add_car+'"][data-type="railcar"][data-notification-gu="Y"]').length==0){
        alert('Для вагона '+add_car+' нет регистрации уведомления ГУ 26-2б ВЦ!');
    } else{
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            data: { id: add_car
                   ,type: 'railcar'
                   ,station_id: user_station_id
                   ,ajax_action: 'addInfo'
                  },
            success: function (data) {
                var records = JSON.parse(data);

                for(var i=0; i<records.length; i++) {
                    var child = records[i];
                    
                    var tr = $('<tr/>');
                    tr.append('<td><div class="up_image" onclick="up_down_sent_cars_table_tr(\'up\',$(this).parent().parent());"></div></td>');
                    tr.append('<td><div class="down_image" onclick="up_down_sent_cars_table_tr(\'down\',$(this).parent().parent());"></div></td>');
                    tr.append('<td>'+count+'</td>');
                    tr.append('<td>'+child.ID+'</td>');
                    tr.append('<td>'+((child.FREIGHT_NAME !== null) ? child.FREIGHT_NAME : '')+'</td>');
                    tr.append('<td>'+((child.WEIGHT_NET !== null) ? child.WEIGHT_NET.replace(',','.') : '')+'</td>');
                    tr.append('<td>'+((child.WEIGHT_DEP !== null) ? child.WEIGHT_DEP.replace(',','.') : '')+'</td>');
                    tr.append('<td>'+((child.WEIGHT_GROSS !== null) ? child.WEIGHT_GROSS.replace(',','.') : '')+'</td>');
                    tr.append('<td>'+((child.CAR_LENGTH !== null) ? child.CAR_LENGTH.replace(',','.') : '')+'</td>');
					tr.append('<td>'+((child.COND_LENGTH_TRAIN !== null) ? child.COND_LENGTH_TRAIN.replace(',','.') : '')+'</td>');
                    tr.append('<td>'+'<div class="deleteImage deleteImage13px" title="Удалить" onclick="del_sent_cars_table_tr($(this).parent().parent()); change_sent_cars_table_total_tr(); md_disable_send_btn();"></div>'+'</td>');
                    tr.appendTo(sent_table);
                }
                
                md_disable_send_btn();
                change_sent_cars_table_total_tr();
                $('#md_send_to_station_add_car').removeClass('red_bckg_color');
                $('#md_send_to_station_add_car').val('');
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
    }
}
function md_disable_send_btn(){
    if ($('#md_send_to_station_sending_time').hasClass('red_bckg_color')||$('#md_send_to_station_sending_time').val()==''||   
        $('#md_send_to_station_arrival_time').hasClass('red_bckg_color')||$('#md_send_to_station_arrival_time').val()==''||  
        $('#md_send_to_station_train_num').val()==''||$('#sent_cars_table tbody tr').length===0
       )
    {
        $('#md_sent_btn').prop( "disabled", true );
    }else{
        $('#md_sent_btn').prop( "disabled", false );
    }
}
function md_send_to_station_alert(){
    var max_railway_length;
    var max_railway_weight;
    
    var loco_count = ($('#md_send_to_station_loco1_num').val()=='-1'?0:1) + ($('#md_send_to_station_loco2_num').val()=='-1'?0:1);
    
    if (g_from_station==2 && g_to_station==1) /*Вод -> ПСП*/{
        max_railway_length = 5500;
        max_railway_weight = 3000;
    } else if (g_from_station==2 && g_to_station==3)/*Вод -> Новая*/{
        max_railway_length = 4000;
        max_railway_weight = 1650; 
    } else if (g_from_station==3 && g_to_station==2)/*Новая -> Вод*/{
        max_railway_length = 4000;
        max_railway_weight = (loco_count==2?1300:650);  
    }
    
    var cars_length = parseFloat($('#sent_cars_table_total_tr td:nth-child(9)').text());
    var cars_weight = parseFloat($('#sent_cars_table_total_tr td:nth-child(8)').text());
    
    if (cars_length > max_railway_length){
        var td_length = $('#sent_cars_table_total_tr td:nth-child(9)');
        td_length
            .addClass('red_bckg_color')
            .attr('title','Длина состава превысила допустимое значение: '+cars_length+' > '+max_railway_length)
            .tooltip({
                tooltipClass: "ui-red-border",
                position: {
                    my: "left top",
                    at: "left bottom+11",
                    using: function( position, feedback ) {
                      $( this ).css( position );
                      $( "<div>" )
                        .addClass( "arrow" )
                        .addClass( feedback.vertical )
                        .addClass( feedback.horizontal )
                        .appendTo( this );
                    }
                  }
            })
            .tooltip( "open" );
        setTimeout(function() { td_length.tooltip( 'close' ) }, 2500);
    } 
    
    if (cars_weight > max_railway_weight){
        var td_weight = $('#sent_cars_table_total_tr td:nth-child(8)');
        td_weight.addClass('red_bckg_color')
            .attr('title','Масса состава превысила допустимое значение: '+cars_weight+' > '+max_railway_weight)
            .tooltip({
                tooltipClass: "ui-red-border",
                position: {
                    my: "right top",
                    at: "right bottom+11",
                    using: function( position, feedback ) {
                      $( this ).css( position );
                      $( "<div>" )
                        .addClass( "arrow" )
                        .addClass( feedback.vertical )
                        .addClass( feedback.horizontal )
                        .appendTo( this );
                    }
                  }
            })
            .tooltip( "open" );
        setTimeout(function() { td_weight.tooltip( 'close' ) }, 2500);
    }
}
function get_sent_cars_for_wagon_list(){
    var param = '';
    $('table#sent_cars_table tbody tr').each(function(){
        param+= $(this).children('td:nth-child(4)').text() + '|';
    });

    return param;
}
// Возвращем части пути
function get_railway_parts (p_railway_id,p_part_id){
	var l_params = {};
	var records;
        l_params.railway_id = p_railway_id;
		l_params.p_part_id = p_part_id;
		$.ajax({
				url: 'data.php',
				type: 'POST',
				dataType: "text",
				async: false,
				data:   {params: JSON.stringify(l_params)
						,ajax_action: 'get_railway_parts'},
				success: function (data) {
					records = JSON.parse(data);
				}
		});
	return records;
}


// Возвращем название пути
function get_railway_add_info (p_railway_id){
	var records;
		$.ajax({
				url: 'data.php',
				type: 'POST',
				dataType: "text",
				async: false,
				data:   {railway_id: p_railway_id
						,ajax_action: 'get_railway_add_info'},
				success: function (data) {
					records = JSON.parse(data);	
				}
		});
	return records;
}


function save_send_to_station_form_btn_action(){
    function save_send_to_station_form_ajax() 
    {
        var l_cars = get_sent_cars_for_wagon_list(); //сохраняем выбранные элементы
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: {
                 name: $('#md_save_send_to_station_form_inp').val() 
                ,sending_time:$('#md_send_to_station_sending_time').val()
                ,arrival_time:$('#md_send_to_station_arrival_time').val()
                ,reason:$('#md_send_to_station_reason').val()
                ,train_num:$('#md_send_to_station_train_num').val()
                ,loco1_num:$('#md_send_to_station_loco1_num').val()
                ,loco1_driver1:$('#md_send_to_station_loco1_driver1').val()
                ,loco1_driver2:$('#md_send_to_station_loco1_driver2').val()
                ,loco1_conductor:$('#md_send_to_station_loco1_conductor').val()
                ,loco2_num:$('#md_send_to_station_loco2_num').val()
                ,loco2_driver1:$('#md_send_to_station_loco2_driver1').val()
                ,loco2_driver2:$('#md_send_to_station_loco2_driver2').val()
                ,loco2_conductor:$('#md_send_to_station_loco2_conductor').val()
                ,cars:l_cars
                ,ajax_action: 'save_send_to_station_form'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    $('#md_save_send_to_station_form_btn,#md_load_send_to_station_form_btn,#md_del_send_to_station_form_btn').removeClass('md_save_load_btn_done md_save_load_btn_fail');
    
    if (save_send_to_station_form_ajax()==='done'){
        $('#md_save_send_to_station_form_btn').addClass('md_save_load_btn_done');
        $('#md_load_send_to_station_form_sel,#md_del_send_to_station_form_sel').empty();
        $('#md_load_send_to_station_form_sel,#md_del_send_to_station_form_sel').append(get_select_options_with_saved_send_to_station_forms());
    }else{
        $('#md_save_send_to_station_form_btn').addClass('md_save_load_btn_fail');
    }
}
function get_select_options_with_saved_send_to_station_forms(){
    var result = '';
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { ajax_action: 'get_saved_send_to_station_forms'
              },
        success: function (data) {
            var saved_notifications = JSON.parse(data);
            var options = '<option value="-1"></option>';
            $.each(saved_notifications, function( i, item ) {
                options += '<option value="'+item.NAME+'">'+item.NAME+'</option>';
            });
            result = options; 
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
    return result;
}
function load_send_to_station_form_btn_action(){
    $('#md_save_send_to_station_form_btn,#md_load_send_to_station_form_btn,#md_del_send_to_station_form_btn').removeClass('md_save_load_btn_done md_save_load_btn_fail');
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: {name: $('#md_load_send_to_station_form_sel').val() 
              ,ajax_action: 'load_send_to_station_form'
              },
        success: function (data) {
            try {
                var l_save = JSON.parse(data);

                if (l_save[0].CARS !== null){
                    var l_cars = l_save[0].CARS.split('|');
                    l_cars.pop();

                    $('table#sent_cars_table > tbody > tr').remove();
                    $.each(l_cars, function( i, item ) {
                        add_car_in_sent_table(item);
                    });
                }
                
                $('#md_send_to_station_sending_time').val(l_save[0].SENDING_TIME);
                $('#md_send_to_station_arrival_time').val(l_save[0].ARRIVAL_TIME);
                $('#md_send_to_station_reason').val(l_save[0].REASON);
                $('#md_send_to_station_train_num').val(l_save[0].TRAIN_NUM);
                $('#md_send_to_station_loco1_num').val(l_save[0].LOCO1_NUM);
                $('#md_send_to_station_loco1_driver1').val(l_save[0].LOCO1_DRIVER1);
                $('#md_send_to_station_loco1_driver2').val(l_save[0].LOCO1_DRIVER2);
                $('#md_send_to_station_loco1_conductor').val(l_save[0].LOCO1_CONDUCTOR);
                $('#md_send_to_station_loco2_num').val(l_save[0].LOCO2_NUM);
                $('#md_send_to_station_loco2_driver1').val(l_save[0].LOCO2_DRIVER1);
                $('#md_send_to_station_loco2_driver2').val(l_save[0].LOCO2_DRIVER2);
                $('#md_send_to_station_loco2_conductor').val(l_save[0].LOCO2_CONDUCTOR);

                $('#md_save_send_to_station_form_inp').val($('#md_load_send_to_station_form_sel').val());
                $('#md_load_send_to_station_form_sel').val('-1');

                $('#md_load_send_to_station_form_btn').addClass('md_save_load_btn_done');
                md_disable_send_btn();
                
            } catch(e){
                $('#md_load_send_to_station_form_btn').addClass('md_save_load_btn_fail');
            }
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
}
function del_send_to_station_form_btn_action(){
    function del_send_to_station_form_ajax() 
    {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: {
                 name: $('#md_del_send_to_station_form_sel').val() 
                ,ajax_action: 'del_send_to_station_form'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    $('#md_save_send_to_station_form_btn,#md_load_send_to_station_form_btn,#md_del_send_to_station_form_btn').removeClass('md_save_load_btn_done md_save_load_btn_fail');
    
    if (del_send_to_station_form_ajax()==='done'){
        $('#md_del_send_to_station_form_btn').addClass('md_save_load_btn_done');
        $('#md_load_send_to_station_form_sel,#md_del_send_to_station_form_sel').empty();
        $('#md_load_send_to_station_form_sel,#md_del_send_to_station_form_sel').append(get_select_options_with_saved_send_to_station_forms());
    }else{
        $('#md_del_send_to_station_form_btn').addClass('md_save_load_btn_fail');
    }
}

/*Изменяем порядок на сервере*/
function changeOrderAjax(p_elem,p_action) {
	var res;
	$.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { id: p_elem.attr('data-id')
                   ,type: p_elem.attr('data-type')
                   ,action: p_action
                   ,ajax_action: 'change_order'
                  },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
	});
	return res;
}
/*Создаем контексное меню 2-ого уровня для перемещения по уровням дерева*/
function createContectMenu2lvl(addId,p_x,p_y) {
    if ($('#context-menu-2lvl'+addId).length===0) {
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {station_id: $('#selectStation option:selected').val() 
                    ,ajax_action: 'get_all_station_child'
                    },
            success: function (data) {
                    var records = JSON.parse(data);
                    var ul = $('<ul/>');
                    $.each(records, function( i, item ) {
                        ul.append($('<li/>')
                                    .css({'margin-left': (item.LVL-1)*10 + 'px'})
                                    .text(item.NAME)
                                    .attr('data-id',item.ID)
                                    .attr('data-type',item.TYPE)
                                    .addClass(((item.DISABLED=='Y')?'disabled':''))
                                    
                                );
                    });
                    $('<div/>',{class: 'context-menu context-menu-2lvl'})  // Присваиваем блоку наш css класс контекстного меню:
                    .attr('id','context-menu-2lvl'+addId)
                    .css({                 
                            left: p_x+'px', // Задаем позицию меню на X                 
                            top: p_y+'px' // Задаем позицию меню по Y             
                    })
                    .appendTo('body') // Присоединяем наше меню к body документа: 
                    .append(ul)
                    .on('click',function(event){
                        if (addId==='Move') {
                            contextMenuAction2lvlMove(event);
                        }
                    })
                    .show('fast'); // Показываем меню с небольшим стандартным эффектом jQuery. Как раз очень хорошо подходит для меню     
                }
        });
    }
}

/*Создаем модальное окно - добавление групп вагонов */
function createModalDialogAddBandwagon() {
    function addElemTreeAjax() {
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { name: $('#modalDialogAddName').val()
                   ,parent_id: clickedLi.attr('data-id')
                   ,parent_type: clickedLi.attr('data-type')
                   ,ajax_action: 'addBandwagon'
                  },
            success: function (data) {
                        if (data!=='0'){
                            var li = $('<li/>');
                            li.attr('data-id',data)
                            li.attr('data-type','bandwagon');
                            li.addClass('tree_Node tree_ExpandOpen');
                            li.append('<div class="tree_Expand"></div><div class="tree_Content">'+$('#modalDialogAddName').val()+'</div>');
                            li.append('<ul class="tree_Container"></ul>');
                            var newParentCont = clickedLi.children('ul');
                            li.appendTo(newParentCont);
                        } else {
                            window.alert('Ошибка при добавлении!!!');
                        }
                    },
            error: function (m1,m2) {
                        window.alert(m1+m2);
                    }
        });
    }
    $('#modalDialog').remove();
    $('.context-menu').remove();
    
    $('<div/>')
        .attr('id','modalDialog')
        .attr('title','Добавление группы вагонов')
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append('<label for="modalDialogAddName">Наименование</label><br>'+
                '<input id="modalDialogAddName" type="text" size="40" class="text ui-widget-content ui-corner-all">'
               );
    dialog = $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Добавить': function(){
                addElemTreeAjax();
                $(this).dialog( "close" );
            },
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
}

/*Создаем модальное окно - удаление групп вагонов */
function createModalDialogDeleteBandwagon() {
    function deleteElemTreeAjax() {
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { id: clickedLi.attr('data-id')
                   ,type: clickedLi.attr('data-type')
                   ,ajax_action: 'deleteBandwagon'
                  },
            success: function (data) {
                        if (data==='done'){
                            $('li[data-id="' + clickedLi.attr('data-id')+'"][data-type="'+clickedLi.attr('data-type')+'"]').remove();
                        } else {
                            window.alert('Ошибка при удалении!!!');
                        }
                    },
            error: function (m1,m2) {
                        window.alert(m1+m2);
                    }
        });
    }
    $('#modalDialog').remove();
    $('.context-menu').remove();
    
    if (clickedLi.find('.tree_Container > li').length===0) {
        $('<div/>')
            .attr('id','modalDialog')
            .attr('title','Удаление группы вагонов')
            .appendTo('body') // Присоединяем наше меню к body документа: 
            .append('<p>Вы хотите удалить группу вагонов: "' + clickedLi.children('.tree_Content').text()+'"? </p>');
        dialog = $("#modalDialog").dialog({
            resizable:false,
            modal:true,
            width: 'auto',
            draggable: false,
            buttons:{
                'Да': function(){
                    deleteElemTreeAjax();
                    $(this).dialog( "close" );
                },
                'Нет': function(){
                    $(this).dialog( "close" );
                }
            },
            close: function() {
                $(this).remove();
            }
        });
    } else {
        $('<div/>')
            .attr('id','modalDialog')
            .attr('title','Удаление группы вагонов')
            .appendTo('body') // Присоединяем наше меню к body документа: 
            .append('<p>Удаление группы вагонов: "' + clickedLi.children('.tree_Content').text()+'" не возможно, т.к. существуют дочерние элементы!</p>');
        dialog = $("#modalDialog").dialog({
            resizable:false,
            modal:true,
            width: 'auto',
            buttons:{
                'Закрыть': function(){
                    $(this).dialog( "close" );
                }
            },
            close: function() {
                $(this).remove();
            }
        });
    }   
}

function addInfoAjax(clickedElem,ctrlKey,p_station_id) {
    start_loading_animation();
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        data: { id: clickedElem.attr('data-id')
               ,type: clickedElem.attr('data-type')
               ,station_id: p_station_id
               ,ajax_action: 'addInfo'
              },
        success: function (data) {
			//console.log(data);
			addInfo(data,ctrlKey);
			
		},
        error: function (m1,m2) {window.alert(m1+m2);}
    });
}
// Информация по выделнному вагону
function addInfo(data,ctrlKey) {
    //alert(data);
	//console.log(data);
    var records = JSON.parse(data);
    if (ctrlKey!==true){
        $('table.addInfoTable tbody').empty();
    }
    var table = $('table.addInfoTable');

    for(var i=0; i<records.length; i++) {
        var child = records[i];
        if ($('table.addInfoTable tbody tr td:contains("'+child.ID+'")').length===0){
			var ClassFromUgl;
			
			if (child.INV_FROM_UGL === '1'){
				ClassFromUgl = 'FromUgl';
			}
			
            var tr = $('<tr/>');
            tr.append('<td>'+child.ID+'</td>');
            tr.append('<td>'+((child.CAR_TYPE !== null) ? child.CAR_TYPE : '')+'</td>'); 
            tr.append('<td>'+((child.STATUS !== null) ? child.STATUS : '')+'</td>'); 
            tr.append('<td>'+((child.STATE !== null) ? child.STATE : '')+'</td>'); 
            tr.append('<td>'+((child.FREIGHT_NAME !== null) ? child.FREIGHT_NAME : '')+'</td>');
            tr.append('<td>'+((child.WEIGHT_NET !== null) ? child.WEIGHT_NET.replace(',','.') : '')+'</td>');
            tr.append('<td>'+((child.WEIGHT_DEP !== null) ? child.WEIGHT_DEP.replace(',','.') : '')+'</td>');
            tr.append('<td>'+((child.WEIGHT_GROSS !== null) ? child.WEIGHT_GROSS.replace(',','.') : '')+'</td>');
            tr.append('<td><div>'+((child.SCALE_WEIGHT_DEP !== null) ? child.SCALE_WEIGHT_DEP.replace(',','.') : '')+'</div>\
                           <div>'+((child.SCALE_WEIGHT_GROSS !== null) ? child.SCALE_WEIGHT_GROSS.replace(',','.') : '')+'</div></td>');
            tr.append('<td class ="'+ClassFromUgl+'">'+((child.INV_NUMBER !== null) ? child.INV_NUMBER : '')+'</td>');
            tr.append('<td>'+((child.CONT_WITH_INS !== null) ? child.CONT_WITH_INS : '')+'</td>'); 
            tr.append('<td>'+((child.OWNER !== null) ? child.OWNER : '')+'</td>'); 
            tr.append('<td>'+((child.DATE_ARRIVE !== null) ? child.DATE_ARRIVE : '') +'</td>');
            tr.append('<td>'+((child.DATE_LAST_OPER !== null) ? child.DATE_LAST_OPER : '') +'</td>');
            tr.append('<td>'+((child.DATE_LOADING !== null) ? child.DATE_LOADING : '') +'</td>');
            tr.append('<td style="display: none;">'+((child.CAR_LENGTH !== null) ? child.CAR_LENGTH.replace(',','.') : '') +'</td>');
            tr.append('<td style="display: none;">'+((child.ARRIVE_WEIGHT_NET !== null) ? child.ARRIVE_WEIGHT_NET.replace(',','.') : '') +'</td>');
            tr.append('<td style="display: none;">'+((child.EXISTS_POST !== null) ? child.EXISTS_POST : 'N') +'</td>');
            tr.append('<td style="display: none;">'+((child.CONT !== null) ? child.CONT : '')+'</td>'); 
            tr.append('<td style="display: none;">'+((child.OBJ_TYPE !== null) ? child.OBJ_TYPE : '')+'</td>'); 
            tr.append('<td style="display: none;">'+((child.CAN_CREATE_RETURN_INVOICE !== null) ? child.CAN_CREATE_RETURN_INVOICE : '')+'</td>');
            tr.append('<td style="display: none;">'+((child.RAILCAR_TYPE !== null) ? child.RAILCAR_TYPE : '')+'</td>');
			tr.append('<td style="display: none;">'+((child.UN_LOADING_SUBS !== null) ? child.UN_LOADING_SUBS : '')+'</td>');
			tr.append('<td style="display: none;">'+((child.COND_LENGTH_TRAIN !== null) ? child.COND_LENGTH_TRAIN : '')+'</td>');
            
            if (child.SCALE_WEIGHT_DEP !== null && child.SCALE_WEIGHT_DEP_ADD == 'Y'){
                tr.find('td:nth-child(9) div:nth-child(1)').addClass('yellow_row');
            }
            /*
			if (child.SCALE_TYPE_ID == '2'){
				tr.addClass('blue_row');
			}*/
			tr.un_loading_subs = child.UN_LOADING_SUBS;
            tr.appendTo(table);
        }
    }
    changeTotalTr();
    stop_loading_animation();
}

function remAddInfo(clickedElem){
    if (clickedElem.attr('data-type') === 'railcar'||clickedElem.attr('data-type') === 'cont') {
        $('table.addInfoTable tbody tr td:contains("'+clickedElem.attr('data-id')+'")').parent('tr').remove();
    }
    
    clickedElem.find('li.tree_Node').each(function(){
        $('table.addInfoTable tbody tr td:contains("'+$(this).attr('data-id')+'")').parent('tr').remove();
        
    });
    changeTotalTr();
}

function clear_add_info(){
    $('table.addInfoTable tbody').empty();
     changeTotalTr();
}

function changeTotalTr(){
    var table = $('table.addInfoTable');
    $('table.addInfoTable tbody tr#addInfoTableTotalTr').remove();
    if ($('table.addInfoTable tbody tr').length!==0) {
        var sum_weight_net = 0;
        var t = (($(this).text() !== '') ? $(this).text() : '0');
        $('table.addInfoTable tbody tr td:nth-child(6)').each(function(){
            sum_weight_net+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        var sum_weight_dep = 0;
        $('table.addInfoTable tbody tr td:nth-child(7)').each(function(){
            sum_weight_dep+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        var sum_weight_gross = 0;
        $('table.addInfoTable tbody tr td:nth-child(8)').each(function(){
            sum_weight_gross+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        
        var tr = $('<tr/>',{id: 'addInfoTableTotalTr'});
        tr.append('<td>Кол-во: '+ $('table.addInfoTable tbody tr').length+'</td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td>'+Math.round(sum_weight_net * 100)/100+'</td>');
        tr.append('<td>'+Math.round(sum_weight_dep * 100)/100+'</td>');
        tr.append('<td>'+ Math.round(sum_weight_gross * 100)/100 +'</td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.appendTo(table);
    }
}

function create_md_send_from_ugl(){
	
	
	function checkRequired () {
		if (getIsEmpty($('#modalDialogDateFact').val())) {
			create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время операции (мск)"!');
			return false;
		}
		
		if (getIsEmpty($('#modalDialogComment').val())) {
			create_info_modal_dialog_new('Оповещение','Не заполнено поле "Комментарий (указать накладную)"!');
			return false;
		}
		return true;
	}
	
    function sendFromUglAjax(elem) {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { id_type: elem
                   ,dateFact: $('#modalDialogDateFact').val()
                   ,comment: $('#modalDialogComment').val()
                   ,ajax_action: 'send_cars_from_ugl'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    var param = returnSelectedElem(); //сохраняем выбранные элементы
    var params = param.split('$'); //создаем массив
    params.pop(); //убираем последний элемент массива, т.к. он пустой
    
    $('#modalDialog').remove();
    $('.context-menu').remove();
    
    // создаем div для отображения модального окна
    var md_content = $('<div/>')
        .attr('id','modalDialog')
        .attr('title','Вывод вагонов из системы')
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append('<label for="modalDialogDateFact">Дата и время операции (мск)</label><br>'+ 
                '<input id="modalDialogDateFact" type="text" size="15" class="required text ui-widget-content ui-corner-all"><br>' +
                '<label for="modalDialogComment">Комментарий (указать накладную)</label><br>'+
                '<input id="modalDialogComment" type="text" size="60" class="required text ui-widget-content ui-corner-all">'
               );
    // инициализируем input с датой
    init_date_time_input($('#modalDialogDateFact'));
    
    // вызываем модальное окно 
    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        buttons:{
            'Отправить': function(){
				if (!checkRequired()) {
					return;
				}
				else {
					if (sendFromUglAjax(param)==='done') {
						params.forEach(function(item, i, arr) {
							var items = item.split('|');
							$('li[data-id="'+items[0]+'"][data-type="'+items[1]+'"]').remove();
						});
						changeRailcarCount();
						
						md_content.dialog("close");
						create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
					}else{
						md_content.dialog("close");
						create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
					}
					clear_add_info();
					
					md_content.dialog( "close" ); 
				}
            },
            'Закрыть': function(){
                md_content.dialog( "close" );
            }
        },
        close: function() {
            md_content.remove();
        }
    }); 
}

function entry_foreign_railcar(){
    function return_foreign_elem(){
        var param = '';
        $('.entryRailcarTable > tbody > tr').each(function(){
            $(this).children('td').each(function (){
                param+=($(this).text()!==''?$(this).text():'_')+'|';
            });
            param+= '$';
        });
        return param;
    }
    function get_select_freight_list(){
        var result = '<select id="modalDialogFreightName">';

        $.each(g_freight_list, function( i, item ) {
            result += '<option value="'+item.FREIGHT_NAME+'">'+item.FREIGHT_NAME+'</option>';
        });
        result += '</select>';
        return result; 
    }
    function get_select_car_type_list(){        
        var result = '<select id="modalDialogCarType">';
        
        $.each(g_car_type_list, function( i, item ) {
            result += '<option value="'+item.CAR_TYPE+'">'+item.CAR_TYPE+'</option>';
        });

        result += '</select>'; 

        return result; 
    }
    function get_select_car_status_list(){        
        var result = '<select id="modalDialogStatus">';
        
        $.each(g_inspection_results, function( i, item ) {
            result += '<option value="'+item.CODE+'">'+item.CODE+'</option>';
        });

        result += '</select>'; 

        return result; 
    }

    function entry_foreign_railcar_ajax(p_railcars) {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { railcars: p_railcars
                   ,date_fact: $('#modalDialogDateFact').val()
                   ,ajax_action: 'entry_foreign_railcar'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    $('.context-menu').remove();
    
    var server_current_time; 
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { ajax_action: 'get_current_time'
        },
        success: function (data) {
            server_current_time = data;
        },
        error: function (data) {
            server_current_time = 'fail';
        }
    });
    
    // создаем div для отображения модального окна
    $('<div/>')
    .attr('id','modalDialog')
    .attr('title','Ввод чужих вагонов')
    .appendTo('body') // Присоединяем наше меню к body документа: 
    .append(
        '<div class="attr">'+
            '<div>' +
                '<label for="modalDialogDateFact">Дата и время операции</label>'+
                '<input id="modalDialogDateFact" type="text" size="14" class="text ui-widget-content ui-corner-all">' +
            '</div>'+
        '</div>'+
        '<div style="clear: both;"></div>'+    
        '<div class="attr">'+
            '<div>'+
                '<label for="modalDialogCarNumber">Номер вагона</label>'+
                '<input id="modalDialogCarNumber" type="text" maxlength="8" class="required text ui-widget-content ui-corner-all" style="width: 6em;">' +
            '</div>'+

            '<div>'+
                '<label for="modalDialogCarType">Тип</label>'+
                get_select_car_type_list()+
            '</div>'+

            '<div>'+
                '<label for="modalDialogStatus">Статус</label>'+
                get_select_car_status_list()+
            '</div>'+

            '<div>'+
                '<label for="modalDialogState">Состояние</label>'+
                '<select id="modalDialogState" disabled>'+
                    '<option value=""></option>'+
                    '<option value="пор.">пор.</option>'+
                    '<option value="гр.">гр.</option>'+
                '</select>'+
            '</div>'+

            '<div>'+
                '<label for="modalDialogFreightName">Наименование груза</label>'+
                get_select_freight_list()+
            '</div>'+

            '<div>'+
                '<label for="modalDialogWeightNet">Вес груза, кг</label>'+
                '<input id="modalDialogWeightNet" type="text" maxlength="5" size="5" class="text ui-widget-content ui-corner-all">' +
            '</div>'+

            '<div>'+
                '<label for="modalDialogWeightDep">Тара, кг</label>'+
                '<input id="modalDialogWeightDep" type="text" maxlength="5" size="5" class="text ui-widget-content ui-corner-all">'+
            '</div>'+

            '<div>'+
                '<label for="modalDialogWeightGross">Вес брутто, кг</label>'+
                '<input disabled id="modalDialogWeightGross" type="text" maxlength="5" size="5" class="text ui-widget-content ui-corner-all">'+
            '</div>'+

            '<div>'+
                '<label for="modalDialogInvNumber">№ накладной</label>'+
                '<input id="modalDialogInvNumber" type="text" maxlength="8" size="8" class="required text ui-widget-content ui-corner-all">'+
            '</div>'+

            '<div>'+
                '<label for="modalDialogCont">№ контейнера</label>'+
                '<input id="modalDialogCont" type="text" maxlength="30" size="30" class="text ui-widget-content ui-corner-all">'+
            '</div>'+

            '<div>'+
                '<label for="modalDialogOwner">Предприятие</label>'+
                '<input id="modalDialogOwner" type="text" maxlength="25" size="20" class="required text ui-widget-content ui-corner-all">'+
            '</div>'+

            '<div>'+
                '<label for="modalDialogDateArrive">Дата прибытия,Угл (мск,  по натурному листу)</label>'+
                '<input id="modalDialogDateArrive" type="text" maxlength="50" size="14" class="required text ui-widget-content ui-corner-all">'+
            '</div>'+

            '<input disabled id="btn_add_foreign_railcar_to_table" type="button" value="Добавить" onclick="entry_enemy_railcar_add_tr();" style="vertical-align: bottom;" class="btnAdd">'+
            '<input disabled id="btn_chg_foreign_railcar_to_table" type="button" value="Изменить" onclick="entry_enemy_railcar_chg_tr();" style="vertical-align: bottom; margin-left: 4px;" class="btnAdd">'+
            '<input disabled id="btn_del_foreign_railcar_to_table" type="button" value="Удалить" onclick="entry_enemy_railcar_del_tr();" style="vertical-align: bottom; margin-left: 4px;" class="btnAdd">'+

        '</div>'+

        '<table class="entryRailcarTable">'+
            '<thead>'+
                '<tr>'+
                    '<th>Вагон</th>'+
                    '<th>Тип</th>'+
                    '<th>Статус</th>'+
                    '<th>Состояние</th>'+
                    '<th>Наим. груза</th>'+
                    '<th>Вес <br>груза</th>'+
                    '<th>Тара</th>'+
                    '<th>Вес <br>брутто</th>'+
                    '<th>№ <br>накладной</th>'+
                    '<th>№ <br>контейнера</th>'+
                    '<th>Предприятие</th>'+
                    '<th>Дата <br>прибытия <br>(Угл-ая)</th>'+
                '</tr>'+
            '</thead>'+
        '</table>'+
        '<div class="modalDialogContainer">'+
        '<table class="entryRailcarTable">'+
            '<tbody>'+
            '</tbody>'+
        '</table>'+
        '</div>'
    );
    
    $('#modalDialogWeightNet,#modalDialogWeightDep').on('keypress',function (e){
        // Разрешаем: backspace, delete, влево, вправо
        if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
            return;
        }
        
        var chr = String.fromCharCode(e.charCode);
        
        if (chr == null) return;
        
        if (chr === '.') {
            return;
        }
        
        if (chr < '0' || chr > '9') {
            return false;
        }
    });
    
    var md_car_number = $('#modalDialogCarNumber');
    md_car_number.on('keypress', function (e){
        // Разрешаем: backspace, delete, влево, вправо
        if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
            return;
        }

        var chr = String.fromCharCode(e.charCode);

        if (chr == null) return;

        if (chr < '0' || chr > '9') {
            return false;
        }
    }); 

    md_car_number.on('keyup', function (e){        
        if (check_car_number($(this).val())||user_id==1){ 
            $(this).addClass('true-car-number');
            $(this).removeClass('wrong-car-number');
        } else{
            $(this).addClass('wrong-car-number');
            $(this).removeClass('true-car-number'); 
            $(this).attr('title','Неправильный номер вагона/платформы!')
        }

        md_entry_foreign_railcar_disable_add_btn();
        md_entry_foreign_railcar_disable_change_btn();
    });
    
    $('#modalDialogInvNumber').on('keyup', function (){
        md_entry_foreign_railcar_disable_add_btn();
        md_entry_foreign_railcar_disable_change_btn();
    });
    
    $('#modalDialogOwner').on('keyup', function (){
        md_entry_foreign_railcar_disable_add_btn();
        md_entry_foreign_railcar_disable_change_btn();
    });
    
    var md_date_arrive = $('#modalDialogDateArrive').on('blur',function(){
         md_entry_foreign_railcar_disable_add_btn();
         md_entry_foreign_railcar_disable_change_btn()
    });

    $('#modalDialogWeightNet').on('keyup',function (e){
        if (!isNaN(+$(this).val()) && $(this).val()==='') {
            $('#modalDialogState option:nth-child(1)').prop('selected', true);
        } else if ((!isNaN(+$(this).val()) && +$(this).val() === 0)) {
            $('#modalDialogState option:nth-child(2)').prop('selected', true);
            return;
        } else if ((!isNaN(+$(this).val()) && +$(this).val()>0)) {
            $('#modalDialogState option:nth-child(3)').prop('selected', true);
        }
    });
    
    $('#modalDialogWeightNet,#modalDialogWeightDep').on('keyup',function (e){
        if (!isNaN(+$('#modalDialogWeightNet').val())&&!isNaN(+$('#modalDialogWeightDep').val())){
            $('#modalDialogWeightGross').val(parseFloat(+$('#modalDialogWeightNet').val()) + parseFloat(+$('#modalDialogWeightDep').val()));
        }
    });
    
    $('.entryRailcarTable tbody').on('click','tr',function(e){
        $('.entryRailcarTable tbody tr.selected').removeClass('selected');
        $(this).addClass('selected');
        
        $('#modalDialogCarNumber').val($('.entryRailcarTable tbody tr.selected td:nth-child(1)').text());
        $('#modalDialogCarType').val($('.entryRailcarTable tbody tr.selected td:nth-child(2)').text());
        $('#modalDialogStatus').val($('.entryRailcarTable tbody tr.selected td:nth-child(3)').text());
        $('#modalDialogState').val($('.entryRailcarTable tbody tr.selected td:nth-child(4)').text());
        $('#modalDialogFreightName').val($('.entryRailcarTable tbody tr.selected td:nth-child(5)').text());
        $('#modalDialogWeightNet').val($('.entryRailcarTable tbody tr.selected td:nth-child(6)').text());
        $('#modalDialogWeightDep').val($('.entryRailcarTable tbody tr.selected td:nth-child(7)').text());
        $('#modalDialogWeightGross').val($('.entryRailcarTable tbody tr.selected td:nth-child(8)').text());
        $('#modalDialogInvNumber').val($('.entryRailcarTable tbody tr.selected td:nth-child(9)').text());
        $('#modalDialogCont').val($('.entryRailcarTable tbody tr.selected td:nth-child(10)').text());
        $('#modalDialogOwner').val($('.entryRailcarTable tbody tr.selected td:nth-child(11)').text());
        $('#modalDialogDateArrive').val($('.entryRailcarTable tbody tr.selected td:nth-child(12)').text());
        
        $('#btn_add_foreign_railcar_to_table').prop('disabled', true);
        $('#btn_chg_foreign_railcar_to_table').prop('disabled', false);
        $('#btn_del_foreign_railcar_to_table').prop('disabled', false);
    });
    
    $('#modalDialogDateFact').val(server_current_time);
    
    init_date_time_input(md_date_arrive);
    init_date_time_input($('#modalDialogDateFact'));
    
    // вызываем модальное окно 
    $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Сохранить': {
                text:'Сохранить',
                id:'md_entry_foreign_railcar_save_btn',
                click: function(){
                    var entry_elem = return_foreign_elem(); //сохраняем выбранные элементы
                    var entry_elem_mas = entry_elem.split('$'); //создаем массив
                    entry_elem_mas.pop(); //убираем последний элемент массива, т.к. он пустой

                    var f_res = entry_foreign_railcar_ajax(entry_elem);
                    var f_res_mas = f_res.split('$');

                    if (f_res_mas[0]==='done'){
                        var exists_railcars_mas = f_res_mas[1].split('|');
                        exists_railcars_mas.pop();

                        $('#refreshRailcar').triggerHandler('click');
                        /*entry_elem_mas.forEach(function(elem, i, arr) {
                            var elem_mas = elem.split('|');
                            if (exists_railcars_mas.indexOf(elem_mas[0])===-1){
                                $('<li/>')
                                .addClass('tree_Node tree_ExpandLeaf')
                                .attr('data-id',elem_mas[0])
                                .attr('data-type','railcar')
                                .append('<div class="tree_Expand"></div>\n\
                                         <div class="tree_Content">'+elem_mas[0]+'</div>')
                                .appendTo(p_clicked_li.children('ul'));
                            }
                        });

                        changeRailcarCount();*/

                        $(this).dialog( "close" );

                        if (exists_railcars_mas.length!==0){
                            create_info_modal_dialog_new('Предупреждение','Вагоны с номерами '+exists_railcars_mas.join(',')+' уже стоят на путях!');
                        } else{
                            create_info_modal_dialog_new('Оповещение','Операция завершилась успешно!');
                        }
                    } else{
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    }

                    $(this).dialog( "close" );
            }},
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
   
    $('#md_entry_foreign_railcar_save_btn').hide();
}
function entry_enemy_railcar_add_tr() {
    $('.entryRailcarTable tbody').append(
    '<tr>'+
        '<td>'+$('#modalDialogCarNumber').val()+'</td>'+
        '<td>'+$('#modalDialogCarType').val()+'</td>'+
        '<td>'+$('#modalDialogStatus').val()+'</td>'+
        '<td>'+$('#modalDialogState').val()+'</td>'+
        '<td>'+$('#modalDialogFreightName').val()+'</td>'+
        '<td>'+$('#modalDialogWeightNet').val()+'</td>'+
        '<td>'+$('#modalDialogWeightDep').val()+'</td>'+
        '<td>'+$('#modalDialogWeightGross').val()+'</td>'+
        '<td>'+$('#modalDialogInvNumber').val()+'</td>'+
        '<td>'+$('#modalDialogCont').val()+'</td>'+
        '<td>'+$('#modalDialogOwner').val()+'</td>'+
        '<td>'+$('#modalDialogDateArrive').val()+'</td>'+
    '</tr>'
    );

    $('#modalDialogCarNumber').val('').removeClass('true-car-number');
    $('#btn_add_foreign_railcar_to_table').prop('disabled', true);
    $('#btn_chg_foreign_railcar_to_table').prop('disabled', true);
    $('#btn_del_foreign_railcar_to_table').prop('disabled', true);
    $('.entryRailcarTable tbody tr.selected').removeClass('selected');
    $('#md_entry_foreign_railcar_save_btn').show();
}
function entry_enemy_railcar_chg_tr() {
    var l_car_number = $('#modalDialogCarNumber').val();
    var l_exists = md_entry_foreign_railcar_exists_carnumber_in_table(l_car_number,true);
    
    if (l_exists) {
        alert('Вагон с номером '+l_car_number+' уже существует в таблице!');
    }else{
        $('.entryRailcarTable tbody tr.selected td:nth-child(1)').text($('#modalDialogCarNumber').val());
        $('.entryRailcarTable tbody tr.selected td:nth-child(2)').text($('#modalDialogCarType').val());
        $('.entryRailcarTable tbody tr.selected td:nth-child(3)').text($('#modalDialogStatus').val());
        $('.entryRailcarTable tbody tr.selected td:nth-child(4)').text($('#modalDialogState').val());
        $('.entryRailcarTable tbody tr.selected td:nth-child(5)').text($('#modalDialogFreightName').val());
        $('.entryRailcarTable tbody tr.selected td:nth-child(6)').text($('#modalDialogWeightNet').val());
        $('.entryRailcarTable tbody tr.selected td:nth-child(7)').text($('#modalDialogWeightDep').val());
        $('.entryRailcarTable tbody tr.selected td:nth-child(8)').text($('#modalDialogWeightGross').val());
        $('.entryRailcarTable tbody tr.selected td:nth-child(9)').text($('#modalDialogInvNumber').val());
        $('.entryRailcarTable tbody tr.selected td:nth-child(10)').text($('#modalDialogCont').val());
        $('.entryRailcarTable tbody tr.selected td:nth-child(11)').text($('#modalDialogOwner').val());
        $('.entryRailcarTable tbody tr.selected td:nth-child(12)').text($('#modalDialogDateArrive').val());

        $('#btn_add_foreign_railcar_to_table').prop('disabled', true);
    }
}
function entry_enemy_railcar_del_tr() {
    $('.entryRailcarTable tbody tr.selected').remove();
    
    $('#modalDialogCarNumber').val('').removeClass('true-car-number');
    $('#modalDialogCarType').val('');
    $('#modalDialogStatus').val('');
    $('#modalDialogState').val('');
    $('#modalDialogFreightName').val('');
    $('#modalDialogWeightNet').val('');
    $('#modalDialogWeightDep').val('');
    $('#modalDialogWeightGross').val('');
    $('#modalDialogInvNumber').val('');
    $('#modalDialogCont').val('');
    $('#modalDialogOwner').val('');

    $('#btn_add_foreign_railcar_to_table').prop('disabled', true);
    $('#btn_chg_foreign_railcar_to_table').prop('disabled', true);
    $('#btn_del_foreign_railcar_to_table').prop('disabled', true);
    
    if ($('.entryRailcarTable tbody tr').length == 0) {
        $('#md_entry_foreign_railcar_save_btn').hide();
    }
}
function md_entry_foreign_railcar_exists_carnumber_in_table(p_car_number,p_not_selected){
    var exists = false;
    if (p_car_number!==''){
        $('.entryRailcarTable tbody tr:not('+(p_not_selected?'.selected':'')+') td:nth-child(1)').each(function(){
            if ($(this).text() == p_car_number) exists=true; 
        }); 
    }  
    return exists;
}
function md_entry_foreign_railcar_disable_add_btn(){
    var l_exists = md_entry_foreign_railcar_exists_carnumber_in_table($('#modalDialogCarNumber').val());
    
    if (!$('#modalDialogCarNumber').hasClass('true-car-number')||$('#modalDialogInvNumber').val()==''
       ||$('#modalDialogDateArrive').hasClass('red_bckg_color')||$('#modalDialogDateArrive').val()==''
       ||$('#modalDialogOwner').val()==''
       ||l_exists)
    {
        $('#btn_add_foreign_railcar_to_table').prop('disabled', true);
    }else {
        $('#btn_add_foreign_railcar_to_table').prop('disabled', false);
    }
}
function md_entry_foreign_railcar_disable_change_btn(){
    var l_exists = md_entry_foreign_railcar_exists_carnumber_in_table($('#modalDialogCarNumber').val());
    
    if (!$('#modalDialogCarNumber').hasClass('true-car-number') || $('#modalDialogInvNumber').val()==''
       ||$('#modalDialogDateArrive').hasClass('red_bckg_color') || $('#modalDialogDateArrive').val()==''
       ||$('#modalDialogOwner').val()==''
       ||$('.entryRailcarTable tbody tr.selected').length!=1 
       )
    {
        $('#btn_chg_foreign_railcar_to_table').prop('disabled', true);
    }else {
        $('#btn_chg_foreign_railcar_to_table').prop('disabled', false);
    }
}

/*Создание модального окна "Принять"*/
function get_select_with_station_child(p_station_id){
    var result = $('<select>',{class:'required',css:{'width':'200px'}});
    result.append('<option val=""></option>');
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {station_id: p_station_id 
                ,ajax_action: 'get_all_station_child'
                },
        success: function (data) {
                var records = JSON.parse(data);
                $.each(records, function( i, item ) {
                    result.append('<option '+((item.DISABLED=='Y')?'disabled':'')+' style="'+('margin-left: '+(item.LVL-1)*10 + 'px')+'" data-id="'+item.ID
                             +'" data-type="'+item.TYPE+'" value="'+item.ID+'" data-cars_count="'+item.COUNT_RAILCARS+'" data-free_length="'+item.FREE_LENGTH+'">'+item.NAME+'</option>');
                }); 
            }
    });
    return result;
} 
function create_md_received_into_station_new(){
    function md_received_into_station_constr(){
        var self = this;
        
        /*заполняем select вагонами которые находятся на выбранном пути*/
        function fill_railcars_for_railway(p_select,p_parent_id,p_parent_type){
            p_select.children('option').remove();
            if ($('li[data-id="'+p_parent_id+'"][data-type="'+p_parent_type+'"] > ul > li').length!==0){
                $('li[data-id="'+p_parent_id+'"][data-type="'+p_parent_type+'"] > ul > li').each(function(){
                    p_select.append('<option selected data-id="'+$(this).attr('data-id')+'" data-type="'+$(this).attr('data-type')+'" value="'+$(this).attr('data-id')+'">'+$(this).children('.tree_Content').text()+'</option>');
                });
            }
        }
        
        this.show_window = function(){
            $('.context-menu').remove();
            
            var md_div = $('<div/>')
                .attr('title','Принятие вагонов')
                .appendTo('body') // Присоединяем наше меню к body документа: 
                .append('<div style="display: table;">'+
                        '<div class="attr" style="width:285px;">'+
                            '<div>'+
                                '<label>Станция отправления:</label>'+
                                '<input disabled type="text" size="13" class="text ui-widget-content ui-corner-all" value=""></input>'+
                            '</div>'+
                            '<div>'+
                                '<label>Станция назначения:</label>'+
                                '<input disabled type="text" size="13" class="text ui-widget-content ui-corner-all" value="'+user_station_name+'"></input>'+
                            '</div>'+
                        '</div>'+
                        '<div class="attr" style="margin-left:14px; text-align:right; float:right">'+
                            '<input disabled type="text" size="14" class="text ui-widget-content ui-corner-all" value="'+get_server_current_time()+'"></input><br>'+
                            '<input disabled type="text" size="20" class="text ui-widget-content ui-corner-all" style="margin-top:5px;" value="'+user_name+'"></input>'+
                        '</div>'+
                    '</div>'
                );
            
            md_div.operation_date = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
            md_div.comment = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'350px'}});
            
            md_div.append(
                $('<div>',{css:{'display':'table'}}).append(
                    $('<div>',{class:'attr',css:{'border':'none','width':'484px'}})
                        .append(
                            $('<div>')
                                .append($('<label>').text('Дата и время операции (Мск)'))
                                .append(md_div.operation_date)
                        )
                        .append(
                            $('<div>')
                            .append($('<label>').text('Комментарий'))
                            .append(md_div.comment)
                        )
                )    
            );   
            
            md_div.railway = get_select_with_station_child($('#currentCarstree li[data-type="station"]').attr('data-id'));
            md_div.bef_after = $('<select>')
                .append('<option value="before">перед</option>'+
                        '<option value="after" selected>после</option>');
            md_div.bef_after_railcar = $('<select>');
            md_div.append(
                $('<div>',{css:{'display':'table'}}).append(
                    $('<div>',{class:'border',css:{'clear':'both'}})
                    .append($('<div>',{class:'header',css:{'width':'180px'}}).text('Cтанция назначения'))
                    .append(
                        $('<div>',{css:{'display':'inline-table'}}).append(
                            $('<div>',{class:'attr',css:{'border':'none','width':'470px'}})
                            .append(
                                $('<div>')
                                .append($('<label>').text('Куда принимаем'))
                                .append(md_div.railway)
                            )
                            .append(
                                $('<div>')
                                .append($('<label>').text('Принять'))
                                .append(md_div.bef_after)
                            )
                            .append(
                                $('<div>')
                                .append($('<label>').text('Вагон'))
                                .append(md_div.bef_after_railcar)
                            )
                        )
                    )
                )
            );    

            var railcar_table = new railcar_table_const();
            md_div.append(railcar_table.get_table());
            
            md_div.wagon_list_div = $('<div>',{class:'border',css:{'clear':'both'}});
            md_div.train_num = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required'}).attr('size', '4');
            md_div.loco1_num = get_select_locomotives_obj();
            md_div.loco1_driver1 = get_select_train_drivers_obj();
            md_div.loco1_driver2 = get_select_train_drivers_obj();
            md_div.loco1_conductor = get_select_conductors_obj();
            md_div.loco2_num = get_select_locomotives_obj();
            md_div.loco2_driver1 = get_select_train_drivers_obj();
            md_div.loco2_driver2 = get_select_train_drivers_obj();
            md_div.loco2_conductor = get_select_conductors_obj();
            md_div.sending_time = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
            md_div.append(
                md_div.wagon_list_div
                .append($('<div>',{class:'header',css:{'width':'130px'}}).text('Натурный лист'))
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','margin-top':'0px','margin-bottom:':'0px'}})
                        .append(
                            $('<div>')
                            .append($('<label>').text('Дата и время отправления (Мск)'))
                            .append(md_div.sending_time)
                        )
                        .append(
                            $('<div>')
                            .append($('<label>').text('Номер поезда'))
                            .append(md_div.train_num)
                        )
                    )
                )
                .append(
                    $('<div>',{css:{'display':'table'}})
                    .append(
                        $('<div>',{class:'border',css:{'float':'left'}})
                        .append($('<div>',{class:'header',css:{'width':'110px'}}).text('Локомотив 1'))
                        .append(
                            $('<div>',{css:{'display':'inline-table'}}).append(
                                $('<div>',{class:'attr',css:{'border':'none','margin-top':'0px','margin-bottom:':'0px'}})
                                .append(
                                    $('<div>')
                                    .append($('<label>').text('№ локомотива'))
                                    .append(md_div.loco1_num)
                                )
                                .append(
                                    $('<div>')
                                    .append($('<label>').text('Машинист'))
                                    .append(md_div.loco1_driver1)
                                )
                                .append(
                                    $('<div>')
                                    .append($('<label>').text('Пом. машиниста'))
                                    .append(md_div.loco1_driver2)
                                )
                                .append(
                                    $('<div>')
                                    .append($('<label>').text('Кондуктор'))
                                    .append(md_div.loco1_conductor)
                                )
                            )
                        )
                    )
                    .append(
                        $('<div>',{class:'border',css:{'float':'left'}})
                        .append($('<div>',{class:'header',css:{'width':'110px'}}).text('Локомотив 2'))
                        .append(
                            $('<div>',{css:{'display':'inline-table'}}).append(
                                $('<div>',{class:'attr',css:{'border':'none','margin-top':'0px','margin-bottom:':'0px'}})
                                .append(
                                    $('<div>')
                                    .append($('<label>').text('№ локомотива'))
                                    .append(md_div.loco2_num)
                                )
                                .append(
                                    $('<div>')
                                    .append($('<label>').text('Машинист'))
                                    .append(md_div.loco2_driver1)
                                )
                                .append(
                                    $('<div>')
                                    .append($('<label>').text('Пом. машиниста'))
                                    .append(md_div.loco2_driver2)
                                )
                                .append(
                                    $('<div>')
                                    .append($('<label>').text('Кондуктор'))
                                    .append(md_div.loco2_conductor)
                                )
                            )
                        )
                    )
                )
            );

            railcar_table.add_cars_in_table(return_selected_cars(),false);
            
            var check_need_wagon_list = function (p_car_number){
                if ($('#currentCarstree > li').attr('data-id')!='2'){
                    md_div.wagon_list_div.hide();
                }else if($('li[data-id="'+p_car_number+'"][data-type="railcar"][data-from_station_id="1"][data-notification="Y"]').length==0){
                    md_div.wagon_list_div.hide();
                }
            };
            
            var return_selected_cars_mas = return_selected_cars().split('|');
            return_selected_cars_mas.pop();
            return_selected_cars_mas.forEach(function(car_number) {
                check_need_wagon_list(car_number);
            });

            md_div.railway.combobox({menuMaxHeight: '35em'});
            
            md_div.railway.on("select", function() { 
                fill_railcars_for_railway(md_div.bef_after_railcar,md_div.railway.children('option:selected').attr('data-id'),md_div.railway.children('option:selected').attr('data-type'));
            });
            
            /*beg заполняем input с автозаполнением вагонов*/
            var l_coming_cars;
            $.ajax({
                url: 'data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data: { station_id: user_station_id
                       ,ajax_action: 'get_coming_cars'
                      },
                success: function (data) {
                    l_coming_cars = JSON.parse(data);
                },
                error: function (m1,m2) {window.alert('Ошибка! Обратитесь к разработчику!');}
            });

            var coming_cars_mas = [];
            l_coming_cars.forEach(function (item){
                coming_cars_mas.push(item.COLUMN_VALUE);
            });

            railcar_table.car_number_input.autocomplete({source: coming_cars_mas,minLength: 2});
            
            railcar_table.spec_check_car_number = function(p_car_number){
                if (coming_cars_mas.indexOf(p_car_number)===-1){
                    return false;
                }
                check_need_wagon_list(p_car_number);
                return true;
            };
            
            md_div.disable_ok_btn = function (){
                if (md_div.operation_date.hasClass('red_bckg_color')||md_div.operation_date.val()==''||md_div.railway.val()==''||railcar_table.cars_count==0
                 ||(md_div.wagon_list_div.is(':visible')&&(md_div.sending_time.hasClass('red_bckg_color')||md_div.sending_time.val()==''||md_div.train_num.val()==''))
                ){
                    $('#md_ok_btn').prop( "disabled", true );
                }else{
                    $('#md_ok_btn').prop( "disabled", false );
                }
            };
            
            init_date_time_input(md_div.operation_date);
            init_date_time_input(md_div.sending_time);
            
            md_div.operation_date.on('blur',function(){
                md_div.disable_ok_btn();
            });
            md_div.sending_time.on('blur',function(){
                md_div.disable_ok_btn();
            });
            md_div.train_num.on('blur',function(){
                md_div.disable_ok_btn();
            });
            
            md_div.check_total_tr = function (){
                if (md_div.railway.val()==''||md_div.railway.val()=='-1') {

                }else {
                    var free_cars_count = parseInt(md_div.railway.children('option:selected').attr('data-cars_count'));
                    var free_cars_length = parseInt(md_div.railway.children('option:selected').attr('data-free_length'));

                    var cars_count = railcar_table.cars_count;//parseInt($('#received_cars_table_total_tr td:nth-child(4)').text().match(/[^ ]+/g)[1]);

                    var cars_length = railcar_table.cars_lenght;//parseFloat($('#received_cars_table_total_tr td:nth-child(9)').text());

                    if (cars_count > free_cars_count){
                        var td_count = railcar_table.cars_table_total_row.children('td:nth-child(4)');//$('#received_cars_table_total_tr td:nth-child(4)');
                        td_count
                            .addClass('red_bckg_color')
                            .attr('title','Кол-во вагонов превысило допустимое значение: ' + cars_count + ' > '+ free_cars_count)
                            .tooltip({
                                tooltipClass: "ui-red-border",
                                position: {
                                    my: "left top",
                                    at: "left bottom+11",
                                    using: function( position, feedback ) {
                                      $( this ).css( position );
                                      $( "<div>" )
                                        .addClass( "arrow" )
                                        .addClass( feedback.vertical )
                                        .addClass( feedback.horizontal )
                                        .appendTo( this );
                                    }
                                  }
                            })
                            .tooltip( "open" );
                        setTimeout(function() { 
                            td_count.tooltip('close') 
                        }, 2500);
                    } else {
                        var td_count = railcar_table.cars_table_total_row.children('td:nth-child(4)');//$('#received_cars_table_total_tr td:nth-child(4)');
                        td_count
                            .removeClass('red_bckg_color')
                            .attr('title','');
                        if (td_count.tooltip("instance")!=null){td_count.tooltip( "disable" );}
                    }

                    if (cars_length > free_cars_length){
                        var td_length = railcar_table.cars_table_total_row.children('td:nth-child(9)');//$('#received_cars_table_total_tr td:nth-child(9)');
                        td_length
                            .addClass('red_bckg_color')
                            .attr('title','Длина состава превысила допустимое значение: ' + cars_length + ' > '+ free_cars_length)
                            .tooltip({
                                tooltipClass: "ui-red-border",
                                position: {
                                    my: "left top",
                                    at: "left bottom+11",
                                    using: function( position, feedback ) {
                                      $( this ).css( position );
                                      $( "<div>" )
                                        .addClass( "arrow" )
                                        .addClass( feedback.vertical )
                                        .addClass( feedback.horizontal )
                                        .appendTo( this );
                                    }
                                  }
                            })
                            .tooltip( "open" );
                        setTimeout(function() { td_length.tooltip( 'close' ) }, 2500);
                    } else {
                        var td_length = railcar_table.cars_table_total_row.children('td:nth-child(9)');//$('#received_cars_table_total_tr td:nth-child(9)');
                        td_length
                            .removeClass('red_bckg_color')
                            .attr('title','');
                        if (td_length.tooltip("instance")!=null){td_length.tooltip( "disable" );}
                    }
                }
            };
            
            md_div.railway.select(function(){
                md_div.disable_ok_btn();
                md_div.check_total_tr();
            });
            
            railcar_table.action_change_table = function(){
                md_div.disable_ok_btn();
                md_div.check_total_tr();
            };

            md_div.dialog({
                resizable:false,
                modal:true,
                width: 'auto',
                draggable: false,
                buttons:{
                    'Принять':{
                        text: "Принять",
                          id: "md_ok_btn",
                       click: function(){
                            if (check_open_period('2',md_div.operation_date.val())=='0') {
                                create_info_modal_dialog_new('Оповещение','Для даты '+md_div.operation_date.val()+' нет открытого периода! Принять вагоны не возможно!');
                            }else{
                                received_into_station_OK(railcar_table.get_cars_in_table(),md_div.railway.children('option:selected').attr('data-id'),md_div.railway.children('option:selected').attr('data-type')
                                                        ,md_div.bef_after.children('option:selected').val(),md_div.bef_after_railcar.children('option:selected').attr('data-id'),md_div.bef_after_railcar.children('option:selected').attr('data-type')
                                                        ,md_div.operation_date.val(),md_div.comment.val()
                                                        ,md_div.sending_time.val(),md_div.train_num.val()
                                                        ,md_div.loco1_num.val(),md_div.loco1_driver1.val(),md_div.loco1_driver2.val(),md_div.loco1_conductor.val()
                                                        ,md_div.loco2_num.val(),md_div.loco2_driver1.val(),md_div.loco2_driver2.val(),md_div.loco2_conductor.val()        
                                                        );
                                $(this).dialog( "close" );  
                            }
                        }   
                    }, 
                    'Закрыть': function(){
                        $(this).dialog( "close" );
                    }
                },
                close: function() {
                    $(this).remove();
                }
            });
            $('#md_ok_btn').prop( "disabled", true );
        };
    }
    
    start_loading_animation();
    var md_received_into_station = new md_received_into_station_constr;
    md_received_into_station.show_window();
    stop_loading_animation();
}
function received_into_station_OK(p_cars,p_new_parent_id,p_new_parent_type,p_bef_aft,p_after_elem_id,p_after_elem_type,p_operation_date,p_comment
                                 ,p_sending_time,p_train_num
                                 ,p_loco1_num,p_loco1_driver1,p_loco1_driver2,p_loco1_conductor
                                 ,p_loco2_num,p_loco2_driver1,p_loco2_driver2,p_loco2_conductor){
    function ReceivedIntoStationAjax(p_elem,p_new_parent_id,p_new_parent_type,p_after_elem_id,p_after_elem_type,p_operation_date,p_comment
                                    ,p_sending_time,p_train_num
                                    ,p_loco1_num,p_loco1_driver1,p_loco1_driver2,p_loco1_conductor
                                    ,p_loco2_num,p_loco2_driver1,p_loco2_driver2,p_loco2_conductor){
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { cars: p_elem
                   ,parent_id: p_new_parent_id
                   ,parent_type: p_new_parent_type
                   ,bef_aft: p_bef_aft
                   ,bef_aft_elem_id: p_after_elem_id
                   ,bef_aft_elem_type: p_after_elem_type
                   ,operation_date: p_operation_date
                   ,comment: p_comment
                   ,sending_time:p_sending_time 
                   ,train_num:p_train_num 
                   ,loco1_num:p_loco1_num 
                   ,loco1_driver1:p_loco1_driver1 
                   ,loco1_driver2:p_loco1_driver2 
                   ,loco1_conductor:p_loco1_conductor 
                   ,loco2_num:p_loco2_num 
                   ,loco2_driver1:p_loco2_driver1 
                   ,loco2_driver2:p_loco2_driver2 
                   ,loco2_conductor:p_loco2_conductor 
                   ,ajax_action: 'receive_into_station_few_child'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    var after_elem_next;
    /*ищем элемент после которого надо вставить элементы*/
    var after_elem = $('li[data-id="'+p_after_elem_id+'"][data-type="'+p_after_elem_type+'"]');
    /*проверяем не последний ли он либо такого элемента вообще нет*/
    var after_elem_is_last = p_after_elem_id === undefined || p_after_elem_type === undefined || after_elem.is(':last-child');
    if (p_bef_aft==='after') {
        /*ищем следующий элемент после которого надо вставить элементы*/
        after_elem_next = after_elem.next();
    } else{
        after_elem_next = after_elem;
    }
    
    var params = p_cars.split('|');
    params.pop();
    if (ReceivedIntoStationAjax(p_cars,p_new_parent_id,p_new_parent_type,p_after_elem_id,p_after_elem_type,p_operation_date,p_comment
                               ,p_sending_time,p_train_num
                               ,p_loco1_num,p_loco1_driver1,p_loco1_driver2,p_loco1_conductor
                               ,p_loco2_num,p_loco2_driver1,p_loco2_driver2,p_loco2_conductor)==='done') {
        //Выбираем все элементы li с заданными аттрибутами внутри ul с заданным id и берем потомок ul
        var newParent = $('ul#cur_station li[data-id='+p_new_parent_id+'][data-type='+p_new_parent_type+']');
        var newParentCont = newParent.children('ul');
        if (newParent.hasClass('tree_ExpandLeaf')) {
                newParent.removeClass('tree_ExpandLeaf');
                newParent.addClass('tree_ExpandOpen');
        }
        params.forEach(function(car_number, i, arr) {
            var item = $('li[data-id="'+car_number+'"][data-type="railcar"]');
            if (after_elem_is_last&&p_bef_aft=='after'){
                item.detach().appendTo(newParentCont);
            }else{
                item.detach().insertBefore(after_elem_next);
            }
            item.find('span').remove();
        });
        changeRailcarCount();
        clear_add_info();
        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
    } else {
        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
    }
}

function getSelectWithChild(p_select_elem_id,p_parent_id,p_parent_type){
    if ($('li[data-id="'+p_parent_id+'"][data-type="'+p_parent_type+'"] > ul > li').length!==0){
        var result = '<label for="'+p_select_elem_id+'">Принять</label>'
                    +'<select id="modalDialogBefAft">'
                    +'<option value="before">перед</option>'
                    +'<option value="after" selected>после</option>'
                    +'</select><br>'
                    +'<select id="'+p_select_elem_id+'">';
        $('li[data-id="'+p_parent_id+'"][data-type="'+p_parent_type+'"] > ul > li').each(function(){
            result += '<option selected data-id="'+$(this).attr('data-id')+'" data-type="'+$(this).attr('data-type')+'" value="'+$(this).attr('data-id')+'">'+$(this).children('.tree_Content').text()+'</option>';
        });
        result += '</select><br>';
        return result;
    }else{
        return '';
    }
}

function changeSelectWithChild(p_select_id,p_parent_id,p_parent_type){
    $('#'+p_select_id+' option').remove();
    if ($('li[data-id="'+p_parent_id+'"][data-type="'+p_parent_type+'"] > ul > li').length!==0){
        $('li[data-id="'+p_parent_id+'"][data-type="'+p_parent_type+'"] > ul > li').each(function(){
            $('#'+p_select_id).append('<option selected data-id="'+$(this).attr('data-id')+'" data-type="'+$(this).attr('data-type')+'" value="'+$(this).attr('data-id')+'">'+$(this).children('.tree_Content').text()+'</option>');
        });
    }
}
/*Добавить груз/тип*/
function create_modal_dialog_fill_railcar_attr(p_clicked_li){
    function fill_railcar_attr_ajax(p_car_number,p_car_type,p_freight_name) {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { car_number: p_car_number
                   ,car_type: p_car_type
                   ,freight_name: p_freight_name
                   ,ajax_action: 'fill_railcar_attr'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    function get_select_freight_list(){
        var l_freight_name = $('table.addInfoTable > tbody > tr:first-child > td:nth-child(5)').text();
        
        var result = '<select id="modalDialogFreightName" '+((l_freight_name==='')?'':'disabled')+'>';
        
        if (l_freight_name===''){
            $.each(g_freight_list, function( i, item ) {
                result += '<option value="'+item.FREIGHT_NAME+'">'+item.FREIGHT_NAME+'</option>';
            });
        }else{
            result += '<option selected value="'+l_freight_name+'">'+l_freight_name+'</option>';
        }
        result += '</select>'; 

        return result; 
    }
    
    function get_select_car_type_list(){
        var l_car_type = $('table.addInfoTable > tbody > tr:first-child > td:nth-child(2)').text();
        
        var result = '<select id="modalDialogCarType" '+((l_car_type==='')?'':'disabled')+'>';
        
        if (l_car_type===''){
            $.each(g_car_type_list, function( i, item ) {
                result += '<option value="'+item.CAR_TYPE+'">'+item.CAR_TYPE+'</option>';
            });
        }else{
            result += '<option selected value="'+l_car_type+'">'+l_car_type+'</option>';
        }
        result += '</select>'; 

        return result; 
    }
    
    $('.context-menu').remove();
    
    // создаем div для отображения модального окна
    $('<div/>')
    .attr('id','modalDialog')
    .attr('title','Вагона '+p_clicked_li.attr('data-id'))
    .appendTo('body') // Присоединяем наше меню к body документа: 
    .append('<div class="attr">'+
                '<div>'+
                    '<label for="modalDialogCarType">Тип</label>'+
                    get_select_car_type_list()+
                '</div>'+
                '<div>'+
                    '<label for="modalDialogFreightName">Наименование груза</label>'+
                    get_select_freight_list()+
                '</div>'+
            '</div>'
           );

    // вызываем модальное окно 
    $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Добавить': function(){
                if (fill_railcar_attr_ajax(p_clicked_li.attr('data-id'),$('#modalDialogCarType').val(),$('#modalDialogFreightName').val())==='done') {
                    $('table.addInfoTable > tbody > tr:first-child > td:nth-child(2)').text($('#modalDialogCarType').val());
                    $('table.addInfoTable > tbody > tr:first-child > td:nth-child(5)').text($('#modalDialogFreightName').val());
                    
                    if ($('#modalDialogCarType').val()!==''&&$('#modalDialogFreightName').val()!==''){
                        p_clicked_li.removeClass('need_fill_attr');
                    }
                } else {
                    create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                }
                $('.tree_selected').removeClass('tree_selected');
                $(this).dialog( "close" );
            },
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });  
}

function fill_railcar_for_invoice(){
    function createSelectBadInvoices(p_id){
        var result = '<select id="'+p_id+'">';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   { ajax_action: 'returnBadInvoices'
                    },
            success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        result += '<option data-cont="'+item.CONT_NUMBER+'" data-owner="'+item.OWNER+'" value="'+item.INVOICE_ID+'">'+item.INV_NUMBER+'</option>';
                    }); 
                }
        });
        result += '</select>';
        return result;
    }
    
    function fill_railcar_for_invoice_ajax(p_inv_id,p_car_number) {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { inv_id: p_inv_id
                   ,carnumber: p_car_number
                   ,ajax_action: 'fill_railcar_for_invoice'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    $('#modalDialog').remove();
    $('.context-menu').remove();
    
    if (user_station_id==='1') {
        // создаем div для отображения модального окна
        var md = $('<div/>')
            .addClass('md-lvl-1')
            .attr('title','Ввод вагона для накладной')
            .appendTo('body') // Присоединяем наше меню к body документа: 
            .append('<div>' +
                    '<label for="md_invoice">Накладная</label><br>'+
                    createSelectBadInvoices('md_invoice') + '<br>'+
                    '<label>Контейнеры</label><br>'+
                    '<input disabled id="md_cont_number" type="text" style="width:150px;" class="text ui-widget-content ui-corner-all"><br>'+
                    '<label>Предприятие</label><br>'+
                    '<input disabled id="md_owner" type="text" style="width:50px;" class="text ui-widget-content ui-corner-all"><br>'+
                    '<label for="md_invoice_car_number">Номер вагона</label><br>'+
                    '<input id="md_invoice_car_number" type="text" maxlength="8" class="text ui-widget-content ui-corner-all" style="width: 5em">'
                   );
        
        $('#md_invoice').on('change', function(){
            md_change_cont_number();
            md_invoice_car_number.triggerHandler('keyup');
        });
        
        md_change_cont_number();
        
        var md_invoice_car_number = $('#md_invoice_car_number');
        
        md_invoice_car_number.on('keypress', function (e){
            // Разрешаем: backspace, delete, влево, вправо
            if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
                return;
            }

            var chr = String.fromCharCode(e.charCode);

            if (chr == null) return;

            if (chr < '0' || chr > '9') {
                return false;
            }
        }); 
    
        md_invoice_car_number.on('keyup', function (e){
            if (check_car_number($(this).val())){                
                $(this).addClass('true-car-number');
            } else{
                $(this).removeClass('true-car-number'); 
            }
            
            if ($(this).hasClass('true-car-number')){
                $('#md_invoice_save').prop("disabled",false);
            }else {
                $('#md_invoice_save').prop("disabled",true);
            }
        });
        
        md.dialog({
            resizable:false,
            modal:true,
            width: '390px',
            draggable: false,
            buttons:{
                'Добавить':{
                    text:'Добавить',
                    id:'md_invoice_save',
                    click: function(){
                        if (fill_railcar_for_invoice_ajax($('#md_invoice option:selected').val(),$('#md_invoice_car_number').val())==='done') {
                            changeBackground();
                            create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                        } else {
                            create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
                        }
                        $(this).dialog( "close" );  
                    }
                },
                'Закрыть': function(){
                    $(this).dialog( "close" );
                }
            },
            close: function() {
                $(this).remove();
            }
        });
        
        md_invoice_car_number.triggerHandler('keyup');
    }
}
function md_change_cont_number(){
    $('#md_cont_number').val($('#md_invoice > option:selected').attr('data-cont'));
    $('#md_owner').val($('#md_invoice > option:selected').attr('data-owner'));
}
/*для кнопки "Добавить номер вагона" меняем цвет фона*/
function changeBackground (){
    var res;
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { ajax_action: 'returnCountBadInvoices'
        },
        success: function (data) {
            res = data;
        },
        error: function (data) {
            res = 'fail';
        }
    });
    
    if (res!=='0') {
        $('#fillRailcarForInvoice').addClass('redBackground');
        $('#fillRailcarForInvoice').show();
    } else {
        $('#fillRailcarForInvoice').removeClass('redBackground');
        $('#fillRailcarForInvoice').hide();
    }
}

/* Имзение атрибутов на контейнере */
function create_md_change_cont_attr(p_clicked_li,p_cont_number){
    function get_freight_select(p_selected_elem){
        var select = $('<select>');
        $.each(g_freight_list, function( i, item ) {
            $('<option>')
                    .val(item.FREIGHT_NAME)
                    .text(item.FREIGHT_NAME)
                    .appendTo(select);
        });
        $('<option>')
            .val(p_selected_elem)
            .text(p_selected_elem)
            .appendTo(select);
        
        select.val(p_selected_elem);
        return select; 
    };
    
    function change_cont_attr_ajax(){
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { 
                 cont_number:p_cont_number
                ,freight_name:md_content.freight.val()
                ,weight_dep:md_content.weight_dep.val()
                ,owner:md_content.owner.val()
                ,ajax_action: 'change_cont_add_info'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    $('.context-menu').remove();
  
    var l_cont_info = {};
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { car_number: p_cont_number
               ,ajax_action: 'get_add_info_for_cont'
              },
        success: function (data) {
            var records = JSON.parse(data);
            var child = records[0];
            l_cont_info.freight = (child.FREIGHT_NAME !== null) ? child.FREIGHT_NAME : '';
            l_cont_info.owner = (child.OWNER !== null) ? child.OWNER : '';
            l_cont_info.weight_dep = (child.WEIGHT_DEP !== null) ? child.WEIGHT_DEP.replace(',','.') : '';
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
    
   var md_content = $('<div>')
        .addClass('')
        .attr('title','Контейнер '+p_cont_number)
        .appendTo('body');

    var l_attr_div = $('<div>')
        .addClass('attr')
        .appendTo(md_content);
    
    md_content.freight = get_freight_select(l_cont_info.freight);
    md_content.weight_dep = $('<input>').addClass('text ui-widget-content ui-corner-all').attr({'maxlength':'5','size':'5'}).val(l_cont_info.weight_dep);
    md_content.owner = $('<input>').addClass('text ui-widget-content ui-corner-all').attr({'maxlength':'20','size':'5'}).val(l_cont_info.owner);
    
    $('<div>')
        .append($('<label>',{text:'Груз'}))
        .append(md_content.freight)
        .appendTo(l_attr_div);

    $('<div>')
        .append($('<label>',{text:'Тара'}))
        .append(md_content.weight_dep)
        .appendTo(l_attr_div);
    
    $('<div>')
        .append($('<label>',{text:'Предприятие'}))
        .append(md_content.owner)
        .appendTo(l_attr_div);  

    limit_input_only_numbers(md_content.weight_dep);
    
    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Изменить':{
                text: "Изменить",
                id: "change_btn",
                click: function(){
                    var res = change_cont_attr_ajax();
                    if (res === 'done') {
                        addInfoAjax(p_clicked_li,false,$('#selectStation > option:selected').val());
                    } else if (res === 'cant change') {
                        create_info_modal_dialog_new('Предупреждение','Изменить данные не возможно, т.к. есть уже накладная на отправку!');
                    } else {
                       create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    }
                    //$('.tree_selected').removeClass('tree_selected');
                    $(this).dialog( "close" );
                }   
            }, 
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
}
/* Изменение атрибутов на вагоне*/
function create_md_change_attr(p_clicked_li){
    var l_car_number = p_clicked_li.attr('data-id');
    
    function get_car_type_select(p_selected_elem){
        var select = $('<select>');
        $.each(g_car_type_list, function( i, item ) {
            $('<option>')
                    .val(item.CAR_TYPE)
                    .text(item.CAR_TYPE)
                    .appendTo(select);
        });
        $('<option>')
            .val(p_selected_elem)
            .text(p_selected_elem)
            .appendTo(select);
            
        select.val(p_selected_elem);
        return select; 
    };
    
    function get_freight_select(p_selected_elem){
        var select = $('<select>');
        $.each(g_freight_list, function( i, item ) {
            $('<option>')
                    .val(item.FREIGHT_NAME)
                    .text(item.FREIGHT_NAME)
                    .appendTo(select);
        });
        $('<option>')
            .val(p_selected_elem)
            .text(p_selected_elem)
            .appendTo(select);
        
        select.val(p_selected_elem);
        return select; 
    };
    
    function change_attr_ajax(){
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { 
                 car_number:l_car_number
                ,car_type: md_content.car_type.val()
                ,freight_name:md_content.freight.val()
                ,weight_dep:md_content.weight_dep.val()
                ,owner:md_content.owner.val()
                ,ajax_action: 'change_railcar_add_info'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    $('.context-menu').remove();
    
    
    var selected_car = get_selected_cars();
    var cur_car_type = selected_car[0].type;
    var cur_freight = selected_car[0].freight;
    var cur_weight_dep = selected_car[0].weight_dep;
    var cur_owner = selected_car[0].owner;
    
    
    var md_content = $('<div>')
        .addClass('')
        .attr('title','Вагон '+l_car_number)
        .appendTo('body');

    var l_attr_div = $('<div>')
        .addClass('attr')
        .appendTo(md_content);
    
    md_content.car_type = get_car_type_select(cur_car_type);
    
    $('<div>')
        .append($('<label>',{text:'Тип'}))
        .append(md_content.car_type)
        .appendTo(l_attr_div);
    
    md_content.freight = get_freight_select(cur_freight);
    
    $('<div>')
        .append($('<label>',{text:'Груз'}))
        .append(md_content.freight)
        .appendTo(l_attr_div);
    
    md_content.weight_dep = $('<input>')
                                .addClass('text ui-widget-content ui-corner-all')
                                .attr({'maxlength':'5','size':'5'})
                                .val(cur_weight_dep);
    
    
    $('<div>')
        .append($('<label>',{text:'Тара'}))
        .append(md_content.weight_dep)
        .appendTo(l_attr_div);

    md_content.owner = $('<input>')
                        .addClass('text ui-widget-content ui-corner-all')
                        .attr({'maxlength':'20','size':'5'})
                        .val(cur_owner);
    
    
    $('<div>')
        .append($('<label>',{text:'Предприятие'}))
        .append(md_content.owner)
        .appendTo(l_attr_div);

    md_content.weight_dep.on('keypress',function (e){
        // Разрешаем: backspace, delete, влево, вправо
        if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
            return;
        }
        
        var chr = String.fromCharCode(e.charCode);
        
        if (chr == null) return;
        
        if (chr === '.') {
            return;
        }
        
        if (chr < '0' || chr > '9') {
            return false;
        }
    });

    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Изменить':{
                text: "Изменить",
                id: "md_change_attr",
                click: function(){
                    var res = change_attr_ajax();
                    if (res === 'done') {
                        addInfoAjax(p_clicked_li,false,$('#selectStation > option:selected').val());
                    } else if (res === 'cant change') {
                        create_info_modal_dialog_new('Предупреждение','Изменить данные не возможно, т.к. есть уже накладная на отправку!');
                    } else {
                       create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    }
                    //$('.tree_selected').removeClass('tree_selected');
                    $(this).dialog( "close" );
                }   
            }, 
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
}
/* Не используется */
function create_md_change_attr_old(p_clicked_li) {
    function change_attr_ajax(p_car_number,p_car_type,p_freight_name,p_weight_dep,p_cont){
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { car_number:p_car_number
                   ,car_type: p_car_type
                   ,freight_name:p_freight_name
                   ,weight_dep:p_weight_dep
                   ,cont:p_cont
                   ,ajax_action: 'change_railcar_add_info'
            },
            success: function (data) {
                //alert(data);
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    function get_select_freight_list(){
        var result = '<select id="md_chg_attr_freight" disabled>';

        $.each(g_freight_list, function( i, item ) {
            result += '<option value="'+item.FREIGHT_NAME+'">'+item.FREIGHT_NAME+'</option>';
        });
        var attr = $('table.addInfoTable > tbody > tr:first-child > td:nth-child(5)').text();
        result += '<option selected value="'+attr+'">'+attr+'</option>';;
        result += '</select>';
        return result; 
    }
    
    function get_select_car_type_list(){
        var result = '<select id="md_chg_attr_car_type" disabled>';

        $.each(g_car_type_list, function( i, item ) {
            result += '<option value="'+item.CAR_TYPE+'">'+item.CAR_TYPE+'</option>';
        });
        var attr = $('table.addInfoTable > tbody > tr:first-child > td:nth-child(2)').text();
        result += '<option selected value="'+attr+'">'+attr+'</option>';;
        result += '</select>';
        return result; 
    }

    var l_car_number;
    var l_clicked_li;
    
    $('.context-menu').remove();
    
    l_car_number= p_clicked_li.attr('data-id');
    l_clicked_li = p_clicked_li;
    
    $('<div/>')
        .attr('id','modalDialog')
        .attr('title','Вагон '+l_car_number)
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append('<div class="attr">'+
                    '<div>'+
                    '<label for="modalDialogCarType">Тип</label>'+
                    '<input disabled id="modalDialogCarType" type="text" maxlength="20" size="6" class="text ui-widget-content ui-corner-all" value="'+$('table.addInfoTable > tbody > tr:first-child > td:nth-child(2)').text()+'"><br>' +
                    '</div>'+

                    '<div>'+
                    '<label for="modalDialogFreightName">Наименование груза</label>'+
                    get_select_freight_list() +
                    '</div>'+

                    '<div>'+
                    '<label for="modalDialogWeightDep">Тара</label>'+
                    '<input disabled id="modalDialogWeightDep" type="text" maxlength="50" size="5" class="text ui-widget-content ui-corner-all" value="'+$('table.addInfoTable > tbody > tr:first-child > td:nth-child(7)').text()+'"><br>'+
                    '</div>'+

                    '<div>'+
                    '<label for="modalDialogCont">№ контейнера</label>'+
                    '<input disabled id="modalDialogCont" type="text" maxlength="50" size="25" class="text ui-widget-content ui-corner-all" value="'+$('table.addInfoTable > tbody > tr:first-child > td:nth-child(10)').text()+'"><br>'+
                    '</div>'+

                    '<div>'+
                    '<label for="modalDialogOwner">Предприятие</label>'+
                    '<input disabled id="modalDialogOwner" type="text" maxlength="3" size="3" class="text ui-widget-content ui-corner-all" value="'+$('table.addInfoTable > tbody > tr:first-child > td:nth-child(11)').text()+'"><br>'+
                    '</div>'+
                
                '</div>'
            );
    
    // инициализируем input с датой
    init_date_time_input($('#modalDialogDateLoading'));
    $('#modalDialogDateLoading').on('blur',function(){md_disable_change_attr_btn();});
    
    $('#modalDialogWeightNet,#modalDialogWeightDep').on('keypress',function (e){
        // Разрешаем: backspace, delete, влево, вправо
        if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
            return;
        }
        
        var chr = String.fromCharCode(e.charCode);
        
        if (chr == null) return;
        
        if (chr === '.') {
            return;
        }
        
        if (chr < '0' || chr > '9') {
            return false;
        }
    });
    
    $('#modalDialogWeightNet').on('keyup',function (e){
        if (!isNaN(+$(this).val()) && +$(this).val()>0) {
            $('#modalDialogFreightName').prop('disabled', false);
        } else {
            $('#modalDialogFreightName').prop('disabled', true);
        }
    });
    
    $('#modalDialogWeightNet,#modalDialogWeightDep').on('keyup',function (e){
        md_disable_change_attr_btn();
        
        if (!isNaN(+$('#modalDialogWeightNet').val())&&!isNaN(+$('#modalDialogWeightDep').val())){
            $('#modalDialogWeightGross').val(parseFloat(+$('#modalDialogWeightNet').val()) + parseFloat(+$('#modalDialogWeightDep').val()));
        }
    });
    
    $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Изменить':{text: "Изменить",
                        id: "md_change_attr",
                        click: function(){
                            var res = change_attr_ajax(l_car_number
                                                      ,$('#modalDialogFreightName').val()
                                                      ,$('#modalDialogWeightNet').val()
                                                      ,$('#modalDialogWeightDep').val()
                                                      ,$('#modalDialogCont').val()
                                                      ,$('#modalDialogDateLoading').val()
                                                      );
                            if (res === 'done') {
                                addInfoAjax(p_clicked_li,false,$('#selectStation > option:selected').val());
                            } else if (res === 'cant change') {
                                create_info_modal_dialog_new('Предупреждение','Изменить данные не возможно, т.к. есть уже накладная на отправку!');
                            } else {
                                create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                            }
                            $('.tree_selected').removeClass('tree_selected');
                            $(this).dialog( "close" );
                        }   
                       }, 
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
    md_disable_change_attr_btn();
}
function md_disable_change_attr_btn(){
    if ($('#modalDialogDateLoading').hasClass('red_bckg_color')||$('#modalDialogDateLoading').val()==''||
        isNaN(+$('#modalDialogWeightNet').val())||isNaN(+$('#modalDialogWeightDep').val())
       )
    {
        $('#md_change_attr').prop( "disabled", true );;
    }else{
        $('#md_change_attr').prop( "disabled", false );;
    }
}
/* Фунция возвращает список пользователей для формы "Регистрация уведомлений" */
function get_select_users(p_id,p_credential_id,p_class){
    var result;
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { credential_id: p_credential_id
               ,ajax_action: 'get_users_for_notification'
              },
        success: function (data) {
            var l_users = JSON.parse(data);

            result = '<select id="'+p_id+'" class="'+p_class+'">';
            result += '<option value=""></option>';
            $.each(l_users, function( i, item ) {
                result += '<option value="'+item.ID+'">'+item.NAME+'</option>';
            });
            result += '</select>';
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
    
    return result; 
}
/*Регистрация уведомлений*/
function create_modal_dialog_notification(){
    /*Изменяем предка на сервере*/
    function notification_ajax(p_cars,p_notification_time_from,p_notification_person_from,p_notification_railway_number,p_notification_time_to,p_notification_person_to,p_notification_name) 
    {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { cars: p_cars
                   ,notification_time_from:p_notification_time_from
                   ,notification_person_from:p_notification_person_from
                   ,notification_railway_number:p_notification_railway_number
                   ,notification_time_to:p_notification_time_to
                   ,notification_person_to:p_notification_person_to
                   ,notification_name:p_notification_name
                   ,ajax_action: 'register_notification'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    function get_selected_cars_rows_for_notification_table(){
        var res = '';
        var j=1;
        $('table.addInfoTable tbody tr:not(:last)').each(function(){
            res+='<tr>';
            res+='<td><div class="up_image" onclick="up_down_notifications_cars_table_tr(\'up\',$(this).parent().parent());"></div></td>';
            res+='<td><div class="down_image" onclick="up_down_notifications_cars_table_tr(\'down\',$(this).parent().parent());"></div></td>';
            res+='<td>'+(j++)+'</td>';
            res+='<td>'+$(this).children('td:nth-child(1)').text()+'</td>';
            res+='<td>'+$(this).children('td:nth-child(5)').text()+'</td>';
            res+='<td>'+$(this).children('td:nth-child(6)').text()+'</td>';
            res+='<td>'+$(this).children('td:nth-child(7)').text()+'</td>';
            res+='<td>'+$(this).children('td:nth-child(8)').text()+'</td>';
            res+='<td>'+'<div class="deleteImage deleteImage13px" title="Удалить" onclick="$(this).parent().parent().remove(); change_notification_cars_table_total_tr();md_disable_notification_btn();"></div>'+'</td>';
            res+='</tr>';
            //res+= $(this).children('td:nth-child(1)').text() + '|' + 'railcar' + '$';
        });
        return res;
    }

    $('#modalDialog').remove();
    $('.context-menu').remove();
    $('.xdsoft_datetimepicker').remove();
    
    var server_current_time; 
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { ajax_action: 'get_current_time'
        },
        success: function (data) {
            server_current_time = data;
        },
        error: function (data) {
            server_current_time = 'fail';
        }
    });
    
    // создаем div для отображения модального окна
    $('<div/>')
    .attr('id','modalDialog')
    .attr('title','Регистрация уведомлений от ПСП')
    .appendTo('body') // Присоединяем наше меню к body документа: 
    .append('<div style="display: table;">'+
                '<div class="attr" style="width:285px;">'+
                    '<div>'+
                        '<label>Станция отправления:</label>'+
                        '<input disabled type="text" size="13" class="text ui-widget-content ui-corner-all" value="Углеуральская"></input>'+
                    '</div>'+
                    '<div>'+
                        '<label>Станция назначения:</label>'+
                        '<input disabled type="text" size="13" class="text ui-widget-content ui-corner-all" value="ПСП"></input>'+
                    '</div>'+
                '</div>'+
                '<div class="attr" style="margin-left:14px; text-align:right; float:right">'+
                    '<input disabled type="text" size="14" class="text ui-widget-content ui-corner-all" value="'+server_current_time+'"></input><br>'+
                    '<input disabled type="text" size="20" class="text ui-widget-content ui-corner-all" style="margin-top:10px;" value="'+user_name+'"></input>'+
                '</div>'+
            '</div>'+
            '<div style="display: table; margin-top: 5px;">'+
                '<div class="border" style="clear:both; margin-top: 0px !important;">'+
                    '<div style="display: inline-table;">'+
                        '<div style="float: left;">'+
                            '<input id="md_save_notification_btn" class="md_save_load" type="button" value="Сохранить" onclick="md_save_notification_btn_action();"></br>'+
                            '<input id="md_save_notification_inp" class="md_save_load" type="text" value="'+user_name.slice(0, user_name.indexOf(' '))+'_'+server_current_time+'" maxlength="30">'+
                        '</div>'+
                        '<div style="float: left; margin-left: 15px;">'+
                            '<input id="md_load_notification_btn" class="md_save_load" type="button" value="Загрузить" onclick="md_load_notification_btn_action()"></br>'+
                            '<select id="md_load_notification_sel" class="md_save_load">'+
                                get_select_options_with_saved_notifications()+
                            '</select>'+
                        '</div>'+
                        '<div style="float: left; margin-left: 15px;">'+
                            '<input id="md_del_notification_btn" class="md_save_load" type="button" value="Очистить" onclick="md_del_notification_btn_action()"></br>'+
                            '<select id="md_del_notification_sel" class="md_save_load">'+
                                get_select_options_with_saved_notifications()+
                            '</select>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '</div>'+
            '<div style="display: table;">'+
                '<div class="border" style="clear:both">'+
                    '<div class="header" style="width:180px;">Cтанция отправления</div>'+
                    '<div style="display: inline-table;">'+
                        '<div class="attr" style="border:none; width: 470px;">'+
                            '<div>'+
                                '<label for="md_notification_time_from">Дата и время уведомления (Мск)</label>'+
                                '<input id="md_notification_time_from" type="text" size="15" class="text ui-widget-content ui-corner-all required">' +
                            '</div>'+
                            '<div>'+
                                '<label for="md_notification_person_from">Фамилия передавшего уведомление</label>'+
                                '<input id="md_notification_person_from" type="text" size="15" class="text ui-widget-content ui-corner-all required">'+
                            '</div>'+
                            '<div>'+
                                '<label for="md_notification_railway_number">Номер пути</label>'+
                                '<input id="md_notification_railway_number" type="text" size="15" class="text ui-widget-content ui-corner-all">'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<div style="display: table;">'+
                '<div class="border" style="clear:both">'+
                    '<div class="header" style="width:180px;">Cтанция назначения</div>'+
                    '<div style="display: inline-table;">'+
                        '<div class="attr" style="border:none; width: 470px;">'+
                            '<div>'+
                                '<label for="md_notification_time_to">Дата и время получения уведомления (Мск)</label>'+
                                '<input id="md_notification_time_to" type="text" size="15" class="text ui-widget-content ui-corner-all required">' +
                            '</div>'+
                            '<div>'+
                                '<label for="md_notification_person_to">Кто принял</label>'+
                                get_select_users('md_notification_person_to',1,'required')+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<table class="notification_cars_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th></th>'+
                        '<th></th>'+
                        '<th>№</th>'+
                        '<th>Вагон</th>'+
                        '<th>Наим. груза</th>'+
                        '<th>Вес <br>груза</th>'+
                        '<th>Тара</th>'+
                        '<th>Вес <br>брутто</th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'+
            '<div style="margin-left:61px;">'+
                '<input id="md_notification_add_car" style="font-size: 11px;" type="text" maxlength="8" size="8" class="text ui-widget-content ui-corner-all">' +
                '<input type="button" style="font-size: 11px; height: 17px;" value="Добавить" onclick="add_car_in_notification_table();" class="btnAdd">'+
            '</div>'+
            '<div class="modalDialogContainer" style="display: inline-block;">'+
                '<table id="notification_cars_table" class="notification_cars_table">'+
                    '<tbody>'+
                        get_selected_cars_rows_for_notification_table()+
                    '</tbody>'+
                '</table>'+
            '</div>'+
            '<table class="notification_cars_table" style="margin-top: -4px;">'+
                '<tbody>'+
                    '<tr id=notification_cars_table_total_tr style="background: #EBEBEB; font-weight: bold;"></tr>'+
                '</tbody>'+
            '</table>'
           );
    $('#md_notification_add_car').on('keypress', function(e){
        if(e.keyCode===13){
            add_car_in_notification_table();
        }
    });
    
    change_notification_cars_table_total_tr();
    
    /*beg заполняем input с автозаполнением вагонов*/
    var cars_in_ugl;
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { ajax_action: 'get_cars_in_ugl'
              },
        success: function (data) {
            //alert(data);
            cars_in_ugl = JSON.parse(data);
        },
        error: function (m1,m2) {window.alert('Ошибка! Обратитесь к разработчику!');}
    });
    
    g_cars_in_ugl_mas = [];
    cars_in_ugl.forEach(function (item){
        g_cars_in_ugl_mas.push(item.COLUMN_VALUE);
    });
    
    $( "#md_notification_add_car" ).autocomplete({source: g_cars_in_ugl_mas,minLength: 2});
    /*end заполняем input с автозаполнением вагонов*/
    
    // инициализируем input с датой
    init_date_time_input($('#md_notification_time_from'));
    init_date_time_input($('#md_notification_time_to'));
    
    $('#md_notification_time_from,#md_notification_person_from,#md_notification_time_to').on('blur',function(){md_disable_notification_btn();});
    $('#md_notification_person_to').on('change', function(){md_disable_notification_btn();});
    
    // вызываем модальное окно 
    $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        buttons:{
            'Отправить':{
                text: "Отправить",
                  id: "md_notification_btn",
               click: function(){
                    if (check_open_period('2',$('#md_notification_time_from').val())=='0') {
                        create_info_modal_dialog_new('Оповещение','Для даты '+$('#md_notification_time_from').val()+' нет открытого периода! Сохранить уведомление не возможно!');
                    }else{
                        var l_cars = get_cars_for_notification(); //сохраняем выбранные элементы
                        var l_cars_mas = l_cars.split('$'); //создаем массив
                        l_cars_mas.pop();
                        if (notification_ajax(l_cars,$('#md_notification_time_from').val(),$('#md_notification_person_from').val(),$('#md_notification_railway_number').val()
                                             ,$('#md_notification_time_to').val(),$('#md_notification_person_to').val(),$('#md_save_notification_inp').val())==='done'){           

                            l_cars_mas.forEach(function(item, i, arr) {
                                var items = item.split('|');
                                var car_li = $('li[data-id="'+items[0]+'"][data-type="'+items[1]+'"]');
                                if (car_li.parents('ul#currentCarstree').length === 1){  
                                    car_li.remove();
                                }
                            });
                            clear_add_info();
                            changeRailcarCount();

                            create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');

                            $('.tree_selected').removeClass('tree_selected');
                            $(this).dialog( "close" );

                            l_request_this.refresh_requests();
                        }else{
                            create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
                        }
                    }
                }   
            }, 
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
    md_disable_notification_btn();
}
/* Выбранные элементы для формы Регистрация уведомл. */
function get_cars_for_notification(){
    var param = '';
    $('table#notification_cars_table tbody tr').each(function(){
        param+= $(this).children('td:nth-child(4)').text() + '|' + 'railcar' + '$';
    });

    return param;
}
function get_select_options_with_saved_notifications(){
var result = '';
$.ajax({
    url: 'data.php',
    type: 'POST',
    dataType: "text",
    async: false,
    data: { ajax_action: 'get_saved_notifications'
          },
    success: function (data) {
        var saved_notifications = JSON.parse(data);
        var options = '<option value="-1"></option>';
        $.each(saved_notifications, function( i, item ) {
            options += '<option value="'+item.NAME+'">'+item.NAME+'</option>';
        });
        result = options; 
    },
    error: function (m1,m2) {window.alert(m1+m2);}
});
return result;
}
function md_save_notification_btn_action(){
    function save_notification_ajax(p_notification_name,p_cars,p_notification_time_from,p_notification_person_from,p_notification_railway_number,p_notification_time_to,p_notification_person_to) 
    {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { notification_name:p_notification_name
                   ,cars: p_cars
                   ,notification_time_from:p_notification_time_from
                   ,notification_person_from:p_notification_person_from
                   ,notification_railway_number:p_notification_railway_number
                   ,notification_time_to:p_notification_time_to
                   ,notification_person_to:p_notification_person_to
                   ,ajax_action: 'save_notification'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    $('#md_save_notification_btn,#md_load_notification_btn,#md_del_notification_btn').removeClass('md_save_load_btn_done md_save_load_btn_fail');
    var l_cars = get_cars_for_notification(); //сохраняем выбранные элементы
    if (save_notification_ajax($('#md_save_notification_inp').val(),l_cars,$('#md_notification_time_from').val(),$('#md_notification_person_from').val(),$('#md_notification_railway_number').val()
                              ,$('#md_notification_time_to').val(),$('#md_notification_person_to').val())==='done')
    {
        $('#md_save_notification_btn').addClass('md_save_load_btn_done');
        $('#md_load_notification_sel,#md_del_notification_sel').empty();
        $('#md_load_notification_sel,#md_del_notification_sel').append(get_select_options_with_saved_notifications());
    }else{
        $('#md_save_notification_btn').addClass('md_save_load_btn_fail');
    }
}
function md_load_notification_btn_action(){
    $('#md_save_notification_btn,#md_load_notification_btn,#md_del_notification_btn').removeClass('md_save_load_btn_done md_save_load_btn_fail');
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: {notification_name: $('#md_load_notification_sel').val() 
              ,ajax_action: 'load_notification'
              },
        success: function (data) {
            try {
                var l_notification = JSON.parse(data);

                if (l_notification[0].CARS !== null){
                    var l_cars = l_notification[0].CARS.split('$');
                    l_cars.pop();

                    $('table#notification_cars_table > tbody > tr').remove();
                    $.each(l_cars, function( i, item ) {
                        var car = item.split('|');
                        add_car_in_notification_table(car[0]);
                    });
                }
                $('#md_notification_time_from').val(l_notification[0].NOTIFICATION_TIME_FROM);
                $('#md_notification_person_from').val(l_notification[0].NOTIFICATION_PERSON_FROM);
                $('#md_notification_railway_number').val(l_notification[0].NOTIFICATION_RAILWAY_NUMBER);
                $('#md_notification_time_to').val(l_notification[0].NOTIFICATION_TIME_TO);
                $('#md_notification_person_to').val(l_notification[0].NOTIFICATION_PERSON_TO);

                $('#md_save_notification_inp').val($('#md_load_notification_sel').val());
                $('#md_load_notification_sel').val('-1');

                $('#md_load_notification_btn').addClass('md_save_load_btn_done');
                md_disable_notification_btn();
            } catch(e){
                $('#md_load_notification_btn').addClass('md_save_load_btn_fail');
            }
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
}
/* Удаление записи из системы (Форма Уведомление ГУ) */
function md_del_notification_btn_action(){
    function save_notification_ajax(p_notification_name) 
    {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { notification_name:p_notification_name
                   ,ajax_action: 'del_notification'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    $('#md_save_notification_btn,#md_load_notification_btn,#md_del_notification_btn').removeClass('md_save_load_btn_done md_save_load_btn_fail');
    if (save_notification_ajax($('#md_del_notification_sel').val())==='done')
    {
        $('#md_del_notification_btn').addClass('md_save_load_btn_done');
        $('#md_load_notification_sel,#md_del_notification_sel').empty();
        $('#md_load_notification_sel,#md_del_notification_sel').append(get_select_options_with_saved_notifications());
        md_disable_notification_btn();
    }else{
        $('#md_del_notification_btn').addClass('md_save_load_btn_fail');
    }
}
/* Добавление вагонов в таблицу на форме Уведомление ГУ */
function add_car_in_notification_table(p_railcar){
    var notification_table = $('table#notification_cars_table > tbody');
    var add_car;
    if (p_railcar === undefined) {
        add_car = $('#md_notification_add_car').val();
    } else{
        add_car = p_railcar;
    }
    
    var count = notification_table.children('tr').length + 1;
    
    if (g_cars_in_ugl_mas.indexOf(add_car)===-1){
        $('#md_notification_add_car').addClass('red_bckg_color');
        alert('На путях нет вагона с номером '+add_car+' или у него есть уже уведомление!'); 
    } else if(notification_table.find('tr td:contains("'+add_car+'")').length!==0) {
        $('#md_notification_add_car').addClass('red_bckg_color');
        alert('Вагон '+add_car+' уже добавлен!');
    } else{
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { id: add_car
                   ,type: 'railcar'
                   ,station_id: $('#selectStation').val()
                   ,ajax_action: 'addInfo'
                  },
            success: function (data) {
				
                var records = JSON.parse(data);

                for(var i=0; i<records.length; i++) {
                    var child = records[i];
                    
                    var tr = $('<tr/>');
                    tr.append('<td><div class="up_image" onclick="up_down_notifications_cars_table_tr(\'up\',$(this).parent().parent());"></div></td>');
                    tr.append('<td><div class="down_image" onclick="up_down_notifications_cars_table_tr(\'down\',$(this).parent().parent());"></div></td>');
                    tr.append('<td>'+count+'</td>');
                    tr.append('<td>'+child.ID+'</td>');
                    tr.append('<td>'+((child.FREIGHT_NAME !== null) ? child.FREIGHT_NAME : '')+'</td>');
                    tr.append('<td>'+((child.WEIGHT_NET !== null) ? child.WEIGHT_NET.replace(',','.') : '')+'</td>');
                    tr.append('<td>'+((child.WEIGHT_DEP !== null) ? child.WEIGHT_DEP.replace(',','.') : '')+'</td>');
                    tr.append('<td>'+((child.WEIGHT_GROSS !== null) ? child.WEIGHT_GROSS.replace(',','.') : '')+'</td>');
                    tr.append('<td>'+'<div class="deleteImage deleteImage13px" title="Удалить" onclick="$(this).parent().parent().remove(); change_notification_cars_table_total_tr();md_disable_notification_btn();"></div>'+'</td>');
                    tr.appendTo(notification_table);
                }
                
                md_disable_notification_btn();
                change_notification_cars_table_total_tr();
                $('#md_notification_add_car').removeClass('red_bckg_color');
                $('#md_notification_add_car').val('');
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
    } 
}

function up_down_notifications_cars_table_tr(p_action,p_tr){
    //var p = p_tr;
    //var d = 1;
    if (p_action==='up' && p_tr.prev().length!==0){
        var td = p_tr.children('td:nth-child(3)');
        td.text(parseInt(td.text())-1);
        var td_prev = p_tr.prev().children('td:nth-child(3)');
        td_prev.text(parseInt(td_prev.text())+1);
        
        p_tr.insertBefore(p_tr.prev());

    } else if (p_action==='down' && p_tr.next().length!==0){
        var td = p_tr.children('td:nth-child(3)');
        td.text(parseInt(td.text())+1);
        var td_next = p_tr.next().children('td:nth-child(3)');
        td_next.text(parseInt(td_next.text())-1);
        
        p_tr.insertAfter(p_tr.next());
    }
}
/* Изменение итогового кол-ва на форма уведомления */
function change_notification_cars_table_total_tr(){
    $('#notification_cars_table_total_tr td').remove();
    if ($('#notification_cars_table tbody tr').length!==0) {
        var sum_weight_net = 0;
        $('#notification_cars_table tbody tr td:nth-child(6)').each(function(){
            sum_weight_net+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        var sum_weight_dep = 0;
        $('#notification_cars_table tbody tr td:nth-child(7)').each(function(){
            sum_weight_dep+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        var sum_weight_gross = 0;
        $('#notification_cars_table tbody tr td:nth-child(8)').each(function(){
            sum_weight_gross+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
        });
        
        var tr = $('#notification_cars_table_total_tr');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td>Кол-во: '+ $('#notification_cars_table tbody tr').length+'</td>');
        tr.append('<td></td>');
        tr.append('<td>'+Math.round(sum_weight_net * 100)/100+'</td>');
        tr.append('<td>'+Math.round(sum_weight_dep * 100)/100+'</td>');
        tr.append('<td>'+ Math.round(sum_weight_gross * 100)/100 +'</td>');
    }else{
        var tr = $('#notification_cars_table_total_tr');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td></td>');
        tr.append('<td>Кол-во: 0</td>');
        tr.append('<td></td>');
        tr.append('<td>0</td>');
        tr.append('<td>0</td>');
        tr.append('<td>0</td>'); 
    }
}
/* Скрытие кнопки на форме уведоплмения */
function md_disable_notification_btn(){
    if ($('#md_notification_time_from').hasClass('red_bckg_color')||$('#md_notification_time_from').val()==''||$('#md_notification_person_from').val()==''||   
        $('#md_notification_time_to').hasClass('red_bckg_color')||$('#md_notification_time_to').val()==''||$('#md_notification_person_to').val()==''||
        $('#notification_cars_table tbody tr').length===0
       )
    {
        $('#md_notification_btn').prop( "disabled", true );
    }else{
        $('#md_notification_btn').prop( "disabled", false );
    }
}
/*Ввод осмотра*/
function create_md_inspections(p_clicked_li){ 
    function get_defects_string(){
        var param = '';
        $('#tbl_list_of_defects > tbody > tr').each(function(){
            var defect_id = $(this).find('td:nth-child(6)').text();
            var defect_code = $(this).find('td:nth-child(1) > select').val();
            var defect_descr = $(this).find('td:nth-child(2)').text();
            var doc_type = $(this).find('td:nth-child(3) > select').val();
            var doc_num = $(this).find('td:nth-child(4) > input').val();
            var date = $(this).find('td:nth-child(5) > input').val();
            
            param+=(defect_id!==''?defect_id:'_')+'|';
            param+=(defect_code!==''?defect_code:'_')+'|';
            param+=(defect_descr!==''?defect_descr:'_')+'|';
            param+=(doc_type!==''?doc_type:'_')+'|';
            param+=(doc_num!==''?doc_num:'_')+'|';
            param+=(date!==''?date:'_')+'|';

            param+= '$';
        });
        return param;
    }
    
    function md_enter_inspection_ajax(p_car_number,p_cont,p_inspection_id,p_inspection_date,p_inspection_place,p_inspection_person,p_inspection_person_appoint,p_master,p_priority,p_result,p_status_kurs,p_comment,p_defects){
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { car_number: p_car_number
                   ,cont: p_cont
                   ,inspection_id:p_inspection_id
                   ,inspection_date:p_inspection_date
                   ,inspection_place:p_inspection_place
                   ,inspection_person:p_inspection_person
                   ,inspection_person_appoint:p_inspection_person_appoint
                   ,master:p_master
                   ,priority:p_priority
                   ,result:p_result
                   ,status_kurs:p_status_kurs
                   ,comment:p_comment
                   ,defects:p_defects
                   ,ajax_action: 'enter_inspection'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    function md_delete_inspection_ajax(p_inspection_id) {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { inspection_id:p_inspection_id
                   ,ajax_action: 'delete_inspection'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    function create_request_ajax(p_inspection_id){
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { inspection_id:p_inspection_id
                   ,ajax_action: 'create_work_request'
            },
            success: function (data) {
                res = JSON.parse(data);
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    function refusal_to_repair_ajax(p_inspection_id,p_person){
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { inspection_id:p_inspection_id
                   ,person:p_person
                   ,ajax_action: 'refusal_to_repair'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    function run_report(p_car_number,p_inspection_id,p_user_name){
        var win = window.open('xxeam013_1/xxeam013_1.php?'+
                              'car_number='+p_car_number+'&'+
                              'inspection_id='+p_inspection_id+'&'+
                              'user_name='+p_user_name
                             ,'_blank');
    }
    //console.log(p_clicked_li);
    start_loading_animation();
    
    $('.context-menu').remove();
    
    var md_ins_div = $('<div/>')
        .attr('id','modalDialog')
        .attr('title','Осмотры')
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append(
            '<div id="md_ins_refresh_railcar_div" class="border" style="display: table;">'+
                '<div style="float: left;">'+
                    '<span>Установить вагон: </span>'+
                    '<input id="md_ins_refresh_car_number" type="text" class="text ui-widget-content ui-corner-all" style="width: 5em;">'+
                    '<button id="md_ins_refresh_railcar_btn" class="button" style="margin-left: 1em">'+
                        '<span class="button-text button-text-size-2">Обновить</span>'+
                    '</button>'+
                '</div>'+
            '</div>'+
            '<div class="border" style="display: table;">'+
                '<div style="float: left;">'+
                    '<span>Вагон: </span>'+
                    '<input disabled id="md_ins_enter_car_number" type="text" class="text ui-widget-content ui-corner-all" style="width: 5em;">'+
                '</div>'+
            '</div>'+
            '<div class="border" style="display: table;">'+
                '<div style="float: left;">'+
                    'Осмотры: '+
                    '<select id="md_ins_history" style="width: 400px;">'+
                    '</select>'+
                '</div>'+
            '</div>'+
            '<div id="md_div_ins_cont" class="border" style="display: table;">'+
                '<span>Выберете платформу и контейнера:</span><br>'+
            '</div>'+
            /*get_block_with_conts(l_car_number,l_car_conts)+*/
            '<div style="display: table;">'+
                '<div class="attr" style="width: 500px;">'+
                    '<div>'+
                        '<label for="md_ins_inspection_date">Дата и время осмотра (местное)</label>'+
                        '<input id="md_ins_inspection_date" type="text" maxlength="16" class="text ui-widget-content ui-corner-all required" style="width: 9em;">' +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_inspection_place">Место осмотра вагона</label>'+
                        get_select_places('md_ins_inspection_place')+
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_inspection_person">Осмотр произвел ФИО</label>'+
                        get_inspection_persons('md_ins_inspection_person')+
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_inspection_person_appoint">Осмотр произвел должность</label>'+
                        '<input disabled id="md_ins_inspection_person_appoint" type="text" class="text ui-widget-content ui-corner-all" style="width: 16em;">' +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_master">Мастер смены ФИО</label>'+
                        get_masters('md_ins_master')+
                    '</div>'+

                    '<div>'+
                        '<label for="">Сер.номер актива</label>'+
                        '<input disabled id="md_ins_asset_number" type="text" maxlength="20" class="text ui-widget-content ui-corner-all" value=""><br>' +
                    '</div>'+

                    '<div>'+
                        '<label for="">Группа активов</label>'+
                        '<input disabled id="md_ins_asset_group" type="text" maxlength="20" class="text ui-widget-content ui-corner-all" value=""><br>' +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_priority">Приоритет</label>'+
                        get_priority('md_ins_priority') +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_result">Результат осмотра</label>'+
                        get_ins_results('md_ins_result') +
                        '<input id="md_ins_old_result" style="display: none;"></input>'+
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_status_kurs">Статус курсирования</label>'+
                        get_status_kurs('md_ins_status_kurs') +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_comment">Примечание</label>'+
                        '<input id="md_ins_comment" type="text" maxlength="400" style="width: 30em;" class="text ui-widget-content ui-corner-all"><br>' +
                    '</div>'+
                    
                    '<div>'+
                        '<label for="md_ins_created_request_status">Запрос на выполнение работ</label>'+
                        '<input disabled id="md_ins_created_request_status" type="text" maxlength="400" style="width: 15em;" class="text ui-widget-content ui-corner-all"><br>' +
                    '</div>'+
                    
                    '<div>'+
                        '<label for="md_ins_refusal_to_repair">Отказ от ремонта</label>'+
                        '<input disabled id="md_ins_refusal_to_repair" type="text" maxlength="400" style="width: 15em;" class="text ui-widget-content ui-corner-all"><br>' +
                    '</div>'+
                    '<div style="display: none;">'+
                        '<input id="md_ins_created_by" style="display: none;"></input>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<div id="div_list_of_defects" style="display: table; margin-top: 10px;">'+
                '<table class="tbl_list_of_defects">'+
                    '<thead>'+
                        '<tr>'+
                            '<th>Неисправность</th>'+
                            '<th>Описание кода</th>'+
                            '<th>Документ</th>'+
                            '<th>№ документа</th>'+
                            '<th>Дата вывода из нераб. парка</th>'+
                        '</tr>'+
                    '</thead>'+
                '</table>'+
                '<div class="modalDialogContainer" style="height: 100px;">'+
                    '<table id="tbl_list_of_defects" class="tbl_list_of_defects">'+
                        '<tbody>'+
                        '</tbody>'+
                    '</table>'+
                '</div>'+
                '<input id="btn_add_defect" type="button" value="Добавить" onclick="add_defect_tr();" style="" class="btnAdd">'+
            '</div>'
                
            );

    var md_ins_refresh_car_number = $('input#md_ins_refresh_car_number');
    var md_ins_refresh_railcar_btn = $('button#md_ins_refresh_railcar_btn');
    var md_ins_enter_car_number = $('input#md_ins_enter_car_number');
    var md_ins_history = $('select#md_ins_history');
    var md_div_ins_cont = $('div#md_div_ins_cont').hide();
    
    md_div_ins_cont.on('change','input[type=checkbox]',function(){
        md_disable_btn_save_inspection();
    });
    
    var l_car_inspections=[];
    var l_car_inspections_mas = [];
    md_ins_refresh_railcar_btn.on('click', function(e,p_obj_type){
        p_obj_type = (p_obj_type==undefined?'railcar':p_obj_type);
        
        md_ins_refresh_car_number.removeClass('true-car-number');
        md_ins_refresh_railcar_btn.prop('disabled', true);
        
        //var l_car_number = md_ins_refresh_car_number.val();
        var l_obj_number = md_ins_refresh_car_number.val();
        
        md_ins_refresh_car_number.val('');
        
        if (p_obj_type=='railcar'){
            md_ins_enter_car_number.val(l_obj_number);
        }
        
        var l_asset_info = get_asset_info(l_obj_number);
        $('input#md_ins_asset_number').val(l_asset_info.instance_id!=-1?l_asset_info.asset_number:'');
        $('input#md_ins_asset_group').val(l_asset_info.instance_id!=-1?l_asset_info.asset_group:'');

        /*формируем историю по осмотрам*/
        l_car_inspections=[];
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { obj_number: l_obj_number
                   ,obj_type: p_obj_type
                   ,ajax_action: 'get_car_inspections'
                  },
            success: function (data) {
                l_car_inspections = JSON.parse(data);
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        l_car_inspections_mas = [];
        var l_prev_inspection_id = 0;
        l_car_inspections.forEach(function(item) {
            var l_defect = {defect_id:item.DEFECT_ID,defect_code:item.DEFECT_CODE
                           ,defect_descr:item.DEFECT_DESCR,doc_type:item.DOC_TYPE
                           ,doc_num:item.DOC_NUM,defect_date:item.DEFECT_DATE
                           };              
            if (l_prev_inspection_id!=item.INSPECTION_ID){
                l_car_inspections_mas[l_car_inspections_mas.length==0?1:l_car_inspections_mas.length] = 
                                                            {inspection_id:item.INSPECTION_ID
                                                            ,asset_instance_number:item.ASSET_INSTANCE_NUMBER
                                                            ,asset_instance_id:item.ASSET_INSTANCE_ID
                                                            ,asset_group_id:item.ASSET_GROUP_ID
                                                            ,asset_number:item.ASSET_NUMBER
                                                            ,inspection_date:item.INSPECTION_DATE
                                                            ,inspection_place:item.INSPECTION_PLACE
                                                            ,inspection_person:item.INSPECTION_PERSON
                                                            ,inspection_person_appoint:item.INSPECTION_PERSON_APPOINT
                                                            ,master:item.MASTER
                                                            ,priority:item.PRIORITY
                                                            ,result:item.RESULT
                                                            ,status_kurs:item.STATUS_KURS
                                                            ,description:item.DESCRIPTION
                                                            ,created_request_status:item.CREATED_REQUEST_STATUS
                                                            ,refusal_to_repair:item.REFUSAL_TO_REPAIR
                                                            ,created_by:item.CREATED_BY
                                                            ,defects:[l_defect]};
            } else{
                l_car_inspections_mas[l_car_inspections_mas.length-1].defects.push(l_defect);
            }
            l_prev_inspection_id=item.INSPECTION_ID;
        });
        l_car_inspections_mas[0] =  {inspection_id:''
                                    ,asset_instance_number:(p_obj_type=='railcar'?l_obj_number:'')
                                    ,asset_instance_id:l_asset_info.instance_id
                                    ,asset_group_id:l_asset_info.asset_group_id
                                    ,asset_number:l_asset_info.asset_number
                                    ,inspection_date:''
                                    ,inspection_place:''
                                    ,inspection_person:''
                                    ,inspection_person_appoint:''
                                    ,master:''
                                    ,priority:''
                                    ,result:''
                                    ,status_kurs:''
                                    ,description:''
                                    ,created_request_status:''
                                    ,refusal_to_repair:''
                                    ,created_by:''
                                    ,defects:[]
                                    /*,defects:[{defect_id:''
                                             ,defect_code:''
                                             ,defect_descr:''
                                             ,doc_type:''
                                             ,doc_num:''
                                             ,defect_date:''
                                             }]*/
                                   };
        var options = '';
        
        l_car_inspections_mas.forEach(function(item,index) {
            options += '<option value="'+index+'">'+(item.inspection_id==''?'':item.asset_instance_number)+' '+item.inspection_date+' '+item.inspection_place+' '+item.result+'</option>';
        });
        md_ins_history.empty().append(options);
        
        /*формируем список из платформы и контейнеров на ней*/
        var l_car_conts=get_car_containers(l_obj_number);
        
        md_div_ins_cont.find('input[name="md_ins_cont"]').parent().remove();
        
        if (l_car_conts.length != 0){
            md_div_ins_cont.append('<label><input style="vertical-align: middle; margin-top: -0.5px;" name="md_ins_cont" checked type="checkbox" val="'+l_obj_number+'">'+l_obj_number+'</label>');
            l_car_conts.forEach(function(item){
                md_div_ins_cont.append('<label><input style="vertical-align: middle; margin-top: -0.5px;" name="md_ins_cont" checked type="checkbox" val="'+item.CONT_NUMBER+'">'+item.CONT_NUMBER+'</label>');
            });
            md_div_ins_cont.show();
        }else if(p_obj_type == 'cont'){
            md_div_ins_cont.append('<label><input style="vertical-align: middle; margin-top: -0.5px;" name="md_ins_cont" checked type="checkbox" val="'+l_obj_number+'">'+l_obj_number+'</label>');
            md_div_ins_cont.show();
        }else{
            md_div_ins_cont.hide();
        }
        
        if (p_clicked_li == undefined) {
            md_ins_history.triggerHandler('change');
        }
    });
    
    init_date_time_input($('#md_ins_inspection_date'));
    
    var l_compare_date = get_server_current_time();
    l_compare_date = add_day_to_date_trunc(l_compare_date,1);
    
    init_date_time_input_add($('#md_ins_inspection_date'),l_compare_date);
    
    $('#md_ins_inspection_place').combobox({menuMaxHeight: '50em',menuWidth:'250'});
    $('#md_ins_inspection_person').combobox({menuMaxHeight: '50em',menuWidth:'250'});
    $('#md_ins_master').combobox({menuMaxHeight: '50em',menuWidth:'250'});
    $('#md_ins_priority').combobox();
    $('#md_ins_result').combobox();
    $('#md_ins_status_kurs').combobox();
    
    $('#md_ins_inspection_person').on('select',function(){
        var l_appoint = $('#md_ins_inspection_person > option:selected').attr('data-appoint');
        $('#md_ins_inspection_person_appoint').val(l_appoint=='null'?'':l_appoint);
        //alert($('#md_ins_inspection_person > option:selected').val());
    });
    
    $('#md_ins_result').on('select',function(){
        if ($(this).children('option:selected').val()=='Не годен' || $(this).children('option:selected').val()=='Ограничение'){
            $('#div_list_of_defects').show();
        } else{
            $('#div_list_of_defects').hide(); 
        }
        if ($(this).children('option:selected').val()=='Ограничение'){
            $('#md_ins_status_kurs').parent().find('input').addClass('required');
        } else{
            $('#md_ins_status_kurs').parent().find('input').removeClass('required');
        }
    });
    
    $('#tbl_list_of_defects').on ('select','tr > td:nth-child(1) > select',function(){
        var tr = $(this).parent().parent();
        tr.find('td:nth-child(2)').text($(this).children('option:selected').attr('title'));
        md_disable_btn_save_inspection();
    });
    
    $('#md_ins_inspection_date').on('blur',function(){
        md_disable_btn_save_inspection();
    });
    $('#md_ins_inspection_place,#md_ins_result,#md_ins_master,#md_ins_inspection_person,#md_ins_status_kurs').on('select',function(){
        md_disable_btn_save_inspection();
    });
    $('input[name="md_ins_cont"]').on('change', function(){
        md_disable_btn_save_inspection();
    });
    
    
    md_ins_history.on('change'/*,{p_inspections:l_car_inspections_mas}*/,function(e){
        //var l_inspection = e.data.p_inspections[$(e.target).val()];
        var l_inspection = l_car_inspections_mas[$(e.target).val()];
        
        $('#md_ins_inspection_date').val(l_inspection.inspection_date);
        $('#md_ins_inspection_place').val(l_inspection.inspection_place).parent().find('input').val(l_inspection.inspection_place);
        $('#md_ins_inspection_person').val(l_inspection.inspection_person).parent().find('input').val(l_inspection.inspection_person);
        $('#md_ins_inspection_person_appoint').val(l_inspection.inspection_person_appoint);
        $('#md_ins_master').val(l_inspection.master).parent().find('input').val(l_inspection.master);
        $('#md_ins_priority').val(l_inspection.priority).parent().find('input').val(l_inspection.priority);
        $('#md_ins_result').val(l_inspection.result).parent().find('input').val(l_inspection.result);
        $('#md_ins_status_kurs').val(l_inspection.status_kurs).parent().find('input').val(l_inspection.status_kurs);
        $('#md_ins_comment').val(l_inspection.description);
        $('#md_ins_created_request_status').val(l_inspection.created_request_status);
        $('#md_ins_refusal_to_repair').val(l_inspection.refusal_to_repair);
        $('#md_ins_created_by').val(l_inspection.created_by);
        
        $('#md_ins_old_result').val(l_inspection.result);
        
        $('#md_ins_result').triggerHandler('select');
        $('#tbl_list_of_defects tbody').empty();
        l_inspection.defects.forEach(function(item,i){
            if (item.defect_id!=null) {
                add_defect_tr(item.defect_id
                             ,item.defect_code
                             ,item.defect_descr
                             ,item.doc_type
                             ,item.doc_num
                             ,item.defect_date);
            }
        });
        
        $('input[name="md_ins_cont"]').prop( "checked", false );
        $('input[name="md_ins_cont"][val="'+l_inspection.asset_instance_number+'"]').prop( "checked", true );
        
        if (l_inspection.inspection_id == '') {
            $('input[name="md_ins_cont"]').prop( "disabled", false );
            $('input[name="md_ins_cont"]').prop( "checked", true );
        } else{
            $('input[name="md_ins_cont"]').prop( "disabled", true );
        }
        
        md_disable_btn_save_inspection();
        md_disable_inspection_add_btns();
    });
    
    /*Если вызываем с параметром, значит вызываем по клику из дерева*/
    if (p_clicked_li !== undefined) {
        md_ins_refresh_car_number.val(p_clicked_li.attr('data-id'));
        md_ins_refresh_railcar_btn.triggerHandler('click',p_clicked_li.attr('data-type'));
        $('div#md_ins_refresh_railcar_div').hide();
    } else {
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { ajax_action: 'get_all_cars'},
            success: function (data) {
                var l_cars_json = JSON.parse(data);
                var l_cars = [];
                l_cars_json.forEach(function (item){
                    l_cars.push(item.ID);
                });
                l_cars.push('ВЕСЫ-МОД-ЖД-7260SM');
                md_ins_refresh_car_number.autocomplete({source: l_cars,minLength: 2,menuMaxHeight: '50em',menuWidth: 80});
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        
        md_ins_refresh_car_number.on('keyup', function (e){        
            if (check_car_number($(this).val())||$(this).val()==='ВЕСЫ-МОД-ЖД-7260SM'){                
                $(this).addClass('true-car-number');
                md_ins_refresh_railcar_btn.prop('disabled', false);
            } else{
                $(this).removeClass('true-car-number');
                md_ins_refresh_railcar_btn.prop('disabled', true);
            }
        });
        md_ins_refresh_railcar_btn.prop('disabled', true);
        /*
        var in_station_cars_mas = [];
        var in_station_cars = $('#currentCarstree > li[data-type="station"][data-id="'+user_station_id+'"] li[data-type="railcar"]');
        in_station_cars.sort(function(a, b) {
            var compA = $(a).attr('data-id');
            var compB = $(b).attr('data-id');
            return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
        });

        in_station_cars.each(function (){
            in_station_cars_mas.push($(this).attr('data-id'));
        });

        $( "#md_send_to_station_add_car" ).autocomplete({source: in_station_cars_mas,minLength: 2});
        */
    }
	// 19.05.2025 по наряду 0000085955
	
	function validation_save_inspection (){
		
		var l_inspections = l_car_inspections_mas[md_ins_history.val()].inspection_id;
		var l_place = $('#md_ins_inspection_place').val();
		var l_date = $('#md_ins_inspection_date').val();
		
		var l_inspections_d = get_server_current_time();
		var l_inspections_d_7 = add_day_to_date(l_inspections_d,-7);
		var l_compare_date_to = add_day_to_date(l_compare_date,1);
		
		if (l_inspections == ''){
			if (l_place === 'ПСП ст. Углеуральская'){
				// Условие: на "ПСП ст.Углеуральская" не допускать регистрацию Дат осмотра от текущей при значении (- 7 дней) 
				if (date_comparison(l_inspections_d_7,l_date,'>')){
					create_info_modal_dialog_new('Ошибка','Допустимая дата регистрации данных должна быть больше или равна '+l_inspections_d_7);
					return false;
				}
			}
		}
		
		return true;
		
	}

    md_ins_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Сохранить':{ 
                text: "Сохранить",
                id: "md_btn_save_inspection",
                click: function(){
                    
                    var l_defects = get_defects_string();
                    var l_cont = '';
                    $('input[name="md_ins_cont"]:checked').each(function(){
                        l_cont += $(this).attr('val')+'|';
                    });
                    //var cont = $('input[name="md_ins_cont"]:checked').attr('val');
					
					if (!validation_save_inspection()){
						return;
					}
					
                    $('#md_btn_save_inspection').prop( "disabled", true );
					var res = md_enter_inspection_ajax(md_ins_enter_car_number.val(),l_cont,l_car_inspections_mas[md_ins_history.val()].inspection_id,$('#md_ins_inspection_date').val(),$('#md_ins_inspection_place').val(),$('#md_ins_inspection_person').val()
                                                      ,$('#md_ins_inspection_person_appoint').val(),$('#md_ins_master').val(),$('#md_ins_priority').val(),$('#md_ins_result').val()
                                                      ,$('#md_ins_status_kurs').val(),$('#md_ins_comment').val(),l_defects
                                                      );

                    if (res === 'done') {
                        clear_add_info();
                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                    } else {
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    }
                    $(this).dialog( "close" );
                }   
            },
            'Удалить':{
                text: "Удалить",
                id: "md_btn_delete_inspection",
                click: function(){
                    var res = md_delete_inspection_ajax(l_car_inspections_mas[md_ins_history.val()].inspection_id);

                    if (res === 'done') {
                        clear_add_info();
                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                    } else {
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    }
                    $('.tree_selected').removeClass('tree_selected');
                    $(this).dialog( "close" );
                }
            },
            'Создать заявку':{
                text: "Создать заявку",
                id: "md_btn_create_request",
                click: function(){
                    var res = create_request_ajax(l_car_inspections_mas[md_ins_history.val()].inspection_id);

                    if (res[0] == 'S') {
                        clear_add_info();
                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                    } else {
                        create_info_modal_dialog_new('Ошибка',res[1]);
                    }
                    $(this).dialog( "close" );
                }
            },
            'Отказ от ремонта':{
                text: "Отказ от ремонта",
                id: "md_btn_refusal_to_repair",
                click: function(){
                    
                    var md_div = $('<div/>')
                                    .attr('id','md_lvl_2')
                                    .attr('title','Отказ от ремонта')
                                    .appendTo('body')
                                    .append('<div class="attr">'+
                                                '<div>'+
                                                    '<label for="md_ins_refusal_to_repair_person">Фамилия И.О.</label>'+
                                                    '<input id="md_ins_refusal_to_repair_person" type="text" maxlength="50" style="width: 15em;" class="text ui-widget-content ui-corner-all">' +
                                                '</div>'+
                                            '</div>');
                            
                    md_div.dialog({
                        resizable:false,
                        modal:true,
                        width: 'auto',
                        draggable: false,
                        buttons:{
                            'Сохранить': function(){
                                var res = refusal_to_repair_ajax(l_car_inspections_mas[md_ins_history.val()].inspection_id,$('#md_ins_refusal_to_repair_person').val());
                                
                                if (res === 'done') {
                                    clear_add_info();
                                    create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                                } else {
                                    create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                                }
                                $(this).dialog( "close" );
                            },
                            'Закрыть': function(){
                                $(this).dialog( "close" );
                            }
                        },
                        close: function() {
                            $(this).remove();
                        }
                    });
                    //var res = refusal_to_repair_ajax(l_car_inspections_mas[md_ins_history.val()].inspection_id);


                }
            },
            'Отчет':{
                text: "Отчет",
                id: "md_btn_create_ins_report1",
                click: function(){
					//console.log('par1='+$('#md_ins_enter_car_number').val()+' par2-='+l_car_inspections_mas[md_ins_history.val()].inspection_id+' par3-='+user_name);
                    run_report($('#md_ins_enter_car_number').val()
                                ,l_car_inspections_mas[md_ins_history.val()].inspection_id
                                ,user_name);
                    
                    
                }
            },
            
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
    
    if (!r_enter_inspection_add) {
        $('#md_btn_delete_inspection').hide();
        $('#md_btn_create_request').hide();
        $('#md_btn_refusal_to_repair').hide();
    }
    
    $('#md_ins_result').triggerHandler('select');
    md_disable_btn_save_inspection();
    md_disable_inspection_add_btns();
    stop_loading_animation();
}
/* Установить ЗУ */
function create_md_fix_device(p_clicked_li){  
    function get_defects_string(){
        var param = '';
        $('#tbl_list_of_defects > tbody > tr').each(function(){
            var defect_id = $(this).find('td:nth-child(6)').text();
            var defect_code = $(this).find('td:nth-child(1) > select').val();
            var defect_descr = $(this).find('td:nth-child(2)').text();
            var doc_type = $(this).find('td:nth-child(3) > select').val();
            var doc_num = $(this).find('td:nth-child(4) > input').val();
            var date = $(this).find('td:nth-child(5) > input').val();
            
            param+=(defect_id!==''?defect_id:'_')+'|';
            param+=(defect_code!==''?defect_code:'_')+'|';
            param+=(defect_descr!==''?defect_descr:'_')+'|';
            param+=(doc_type!==''?doc_type:'_')+'|';
            param+=(doc_num!==''?doc_num:'_')+'|';
            param+=(date!==''?date:'_')+'|';

            param+= '$';
        });
        return param;
    }
    
    function md_enter_inspection_dev_ajax(p_param){
		//console.log(JSON.stringify(p_param));
        var res;
		$.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { params: JSON.stringify(p_param)
                   ,ajax_action: 'enter_dev_inspection'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    function get_device_id (p_param){
		
		var l_param = p_param;
		console.log(JSON.stringify(l_param));
		var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { params: JSON.stringify(l_param)
                   ,ajax_action: 'get_device_id'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
	}
	function md_delete_dev_inspection_ajax(p_inspection_id) {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { inspection_id:p_inspection_id
                   ,ajax_action: 'delete_dev_inspection'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    function refusal_dev_to_repair_ajax(p_inspection_id,p_person){
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { inspection_id:p_inspection_id
                   ,person:p_person
                   ,ajax_action: 'refusal_dev_to_repair'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    function run_report(p_car_number,p_inspection_id,p_user_name){
        var win = window.open('xxeam013_2/xxeam013_2.php?'+
                              'car_number='+p_car_number+'&'+
                              'inspection_id='+p_inspection_id+'&'+
                              'user_name='+p_user_name
                             ,'_blank');
    }
    
    start_loading_animation();
    
    $('.context-menu').remove();
    
    var md_ins_div = $('<div/>')
        .attr('id','modalDialog')
        .attr('title','Осмотры ЗУ')
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append(
            '<div id="md_ins_refresh_railcar_div" class="border" style="display: table;">'+
                '<div style="float: left;">'+
                    '<span>Установить ЗУ: </span>'+
                    '<input id="md_ins_refresh_car_number" type="text" class="text ui-widget-content ui-corner-all" style="width: 12em;">'+
                    '<button id="md_ins_refresh_railcar_btn" class="button" style="margin-left: 1em">'+
                        '<span class="button-text button-text-size-2">Обновить</span>'+
                    '</button>'+
                '</div>'+
            '</div>'+
            '<div class="border" style="display: table;">'+
                '<div style="float: left;">'+
                    '<span>ЗУ: </span>'+
                    '<input disabled id="md_ins_enter_car_number" type="text" instance_id="0" class="text ui-widget-content ui-corner-all" style="width: 12em;">'+
                '</div>'+
            '</div>'+
            '<div class="border" style="display: table;">'+
                '<div style="float: left;">'+
                    'Осмотры ЗУ: '+
                    '<select id="md_ins_history" style="width: 400px;">'+
                    '</select>'+
                '</div>'+
            '</div>'+
            '<div id="md_div_ins_cont" class="border" style="display: table;">'+
                '<span>Выберете платформу и контейнера:</span><br>'+
            '</div>'+
            /*get_block_with_conts(l_car_number,l_car_conts)+*/
            '<div style="display: table;">'+
                '<div class="attr" style="width: 500px;">'+
                    '<div>'+
                        '<label for="md_ins_inspection_date">Дата и время осмотра (местное)</label>'+
                        '<input id="md_ins_inspection_date" type="text" maxlength="16" class="text ui-widget-content ui-corner-all required" style="width: 9em;">' +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_inspection_place">Место осмотра ЗУ</label>'+
                        get_select_places('md_ins_inspection_place')+
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_inspection_person">Осмотр произвел ФИО</label>'+
                        get_inspection_persons('md_ins_inspection_person')+
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_inspection_person_appoint">Осмотр произвел должность</label>'+
                        '<input disabled id="md_ins_inspection_person_appoint" type="text" class="text ui-widget-content ui-corner-all" style="width: 16em;">' +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_master">Мастер смены ФИО</label>'+
                        get_masters('md_ins_master')+
                    '</div>'+

                    '<div>'+
                        '<label for="">Сер.номер актива</label>'+
                        '<input disabled id="md_ins_asset_number" type="text" maxlength="20" class="text ui-widget-content ui-corner-all" value=""><br>' +
                    '</div>'+

                    '<div>'+
                        '<label for="">Группа активов</label>'+
                        '<input disabled id="md_ins_asset_group" type="text" maxlength="20" class="text ui-widget-content ui-corner-all" value=""><br>' +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_priority">Приоритет</label>'+
                        get_priority('md_ins_priority') +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_result">Результат осмотра</label>'+
                        get_ins_results('md_ins_result') +
                        '<input id="md_ins_old_result" style="display: none;"></input>'+
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_status_kurs">Статус курсирования</label>'+
                        get_status_kurs('md_ins_status_kurs') +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_comment">Примечание</label>'+
                        '<input id="md_ins_comment" type="text" maxlength="400" style="width: 30em;" class="text ui-widget-content ui-corner-all"><br>' +
                    '</div>'+
                    
                    '<div>'+
                        '<label for="md_ins_created_request_status">Запрос на выполнение работ</label>'+
                        '<input disabled id="md_ins_created_request_status" type="text" maxlength="400" style="width: 15em;" class="text ui-widget-content ui-corner-all"><br>' +
                    '</div>'+
                    
                    '<div>'+
                        '<label for="md_ins_refusal_to_repair">Отказ от ремонта</label>'+
                        '<input disabled id="md_ins_refusal_to_repair" type="text" maxlength="400" style="width: 15em;" class="text ui-widget-content ui-corner-all"><br>' +
                    '</div>'+
                    '<div style="display: none;">'+
                        '<input id="md_ins_created_by" style="display: none;"></input>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<div id="div_list_of_defects" style="display: table; margin-top: 10px;">'+
                '<table class="tbl_list_of_defects">'+
                    '<thead>'+
                        '<tr>'+
                            '<th>Неисправность</th>'+
                            '<th>Описание кода</th>'+
                            '<th>Документ</th>'+
                            '<th>№ документа</th>'+
                            '<th>Дата вывода из нераб. парка</th>'+
                        '</tr>'+
                    '</thead>'+
                '</table>'+
                '<div class="modalDialogContainer" style="height: 100px;">'+
                    '<table id="tbl_list_of_defects" class="tbl_list_of_defects">'+
                        '<tbody>'+
                        '</tbody>'+
                    '</table>'+
                '</div>'+
                '<input id="btn_add_defect" type="button" value="Добавить" onclick="add_defect_dev_tr();" style="" class="btnAdd">'+
            '</div>'
                
            );

    var md_ins_refresh_car_number = $('input#md_ins_refresh_car_number');
    var md_ins_refresh_railcar_btn = $('button#md_ins_refresh_railcar_btn');
    var md_ins_enter_car_number = $('input#md_ins_enter_car_number');
    var md_ins_history = $('select#md_ins_history');
    var md_div_ins_cont = $('div#md_div_ins_cont').hide();
    
    md_div_ins_cont.on('change','input[type=checkbox]',function(){
        md_disable_btn_save_inspection();
    });
    
    var l_car_inspections=[];
    var l_car_inspections_mas = [];
    md_ins_refresh_railcar_btn.on('click', function(e,p_obj_type){
		var l_obj_number = md_ins_refresh_car_number.val();
        p_obj_type = (p_obj_type==undefined?'railcar':p_obj_type);
        
        md_ins_refresh_car_number.removeClass('true-car-number');
        md_ins_refresh_railcar_btn.prop('disabled', true);
        
        //var l_car_number = md_ins_refresh_car_number.val();
       
        
        md_ins_refresh_car_number.val('');
        
        if (p_obj_type=='railcar'){
            md_ins_enter_car_number.val(l_obj_number);
        }
        
        var l_asset_info = get_device_info(l_obj_number);
		//console.log(l_asset_info);
		md_ins_enter_car_number.attr('instance_id',l_asset_info.instance_id);
        $('input#md_ins_asset_number').val(l_asset_info.instance_id!=-1?l_asset_info.asset_number:'');
        $('input#md_ins_asset_group').val(l_asset_info.instance_id!=-1?l_asset_info.asset_group:'');

        /*формируем историю по осмотрам*/
        l_car_inspections=[];
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { obj_number: l_obj_number
                   ,obj_type: p_obj_type
                   ,ajax_action: 'get_car_dev_inspections'
                  },
            success: function (data) {
                l_car_inspections = JSON.parse(data);
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        l_car_inspections_mas = [];
        var l_prev_inspection_id = 0;
        l_car_inspections.forEach(function(item) {
            var l_defect = {defect_id:item.DEFECT_ID,defect_code:item.DEFECT_CODE
                           ,defect_descr:item.DEFECT_DESCR,doc_type:item.DOC_TYPE
                           ,doc_num:item.DOC_NUM,defect_date:item.DEFECT_DATE
                           };              
            if (l_prev_inspection_id!=item.INSPECTION_ID){
                l_car_inspections_mas[l_car_inspections_mas.length==0?1:l_car_inspections_mas.length] = 
                                                            {inspection_id:item.INSPECTION_ID
                                                            ,asset_instance_number:item.ASSET_INSTANCE_NUMBER
                                                            ,asset_instance_id:item.ASSET_INSTANCE_ID
                                                            ,asset_group_id:item.ASSET_GROUP_ID
                                                            ,asset_number:item.ASSET_NUMBER
                                                            ,inspection_date:item.INSPECTION_DATE
                                                            ,inspection_place:item.INSPECTION_PLACE
                                                            ,inspection_person:item.INSPECTION_PERSON
                                                            ,inspection_person_appoint:item.INSPECTION_PERSON_APPOINT
                                                            ,master:item.MASTER
                                                            ,priority:item.PRIORITY
                                                            ,result:item.RESULT
                                                            ,status_kurs:item.STATUS_KURS
                                                            ,description:item.DESCRIPTION
                                                            ,created_request_status:item.CREATED_REQUEST_STATUS
                                                            ,refusal_to_repair:item.REFUSAL_TO_REPAIR
                                                            ,created_by:item.CREATED_BY
                                                            ,defects:[l_defect]};
            } else{
                l_car_inspections_mas[l_car_inspections_mas.length-1].defects.push(l_defect);
            }
            l_prev_inspection_id=item.INSPECTION_ID;
        });
        l_car_inspections_mas[0] =  {inspection_id:''
                                    ,asset_instance_number:(p_obj_type=='railcar'?l_obj_number:'')
                                    ,asset_instance_id:l_asset_info.instance_id
                                    ,asset_group_id:l_asset_info.asset_group_id
                                    ,asset_number:l_asset_info.asset_number
                                    ,inspection_date:''
                                    ,inspection_place:''
                                    ,inspection_person:''
                                    ,inspection_person_appoint:''
                                    ,master:''
                                    ,priority:''
                                    ,result:''
                                    ,status_kurs:''
                                    ,description:''
                                    ,created_request_status:''
                                    ,refusal_to_repair:''
                                    ,created_by:''
                                    ,defects:[]
                                    /*,defects:[{defect_id:''
                                             ,defect_code:''
                                             ,defect_descr:''
                                             ,doc_type:''
                                             ,doc_num:''
                                             ,defect_date:''
                                             }]*/
                                   };
        var options = '';
        
        l_car_inspections_mas.forEach(function(item,index) {
            options += '<option value="'+index+'">'+(item.inspection_id==''?'':item.asset_instance_number)+' '+item.inspection_date+' '+item.inspection_place+' '+item.result+'</option>';
        });
        md_ins_history.empty().append(options);
        
        /*формируем список из платформы и контейнеров на ней*/
        var l_car_conts=get_car_containers(l_obj_number);
        
        md_div_ins_cont.find('input[name="md_ins_cont"]').parent().remove();
        
        if (l_car_conts.length != 0){
            md_div_ins_cont.append('<label><input style="vertical-align: middle; margin-top: -0.5px;" name="md_ins_cont" checked type="checkbox" val="'+l_obj_number+'">'+l_obj_number+'</label>');
            l_car_conts.forEach(function(item){
                md_div_ins_cont.append('<label><input style="vertical-align: middle; margin-top: -0.5px;" name="md_ins_cont" checked type="checkbox" val="'+item.CONT_NUMBER+'">'+item.CONT_NUMBER+'</label>');
            });
            md_div_ins_cont.show();
        }else if(p_obj_type == 'cont'){
            md_div_ins_cont.append('<label><input style="vertical-align: middle; margin-top: -0.5px;" name="md_ins_cont" checked type="checkbox" val="'+l_obj_number+'">'+l_obj_number+'</label>');
            md_div_ins_cont.show();
        }else{
            md_div_ins_cont.hide();
        }
        
        if (p_clicked_li == undefined) {
            md_ins_history.triggerHandler('change');
        }
    });
    
    init_date_time_input($('#md_ins_inspection_date'));
    
    var l_compare_date = get_server_current_time();
    l_compare_date = add_day_to_date_trunc(l_compare_date,1);
    
    init_date_time_input_add($('#md_ins_inspection_date'),l_compare_date);
    
    $('#md_ins_inspection_place').combobox({menuMaxHeight: '50em',menuWidth:'250'});
    $('#md_ins_inspection_person').combobox({menuMaxHeight: '50em',menuWidth:'250'});
    $('#md_ins_master').combobox({menuMaxHeight: '50em',menuWidth:'250'});
    $('#md_ins_priority').combobox();
    $('#md_ins_result').combobox();
    $('#md_ins_status_kurs').combobox();
    
    $('#md_ins_inspection_person').on('select',function(){
        var l_appoint = $('#md_ins_inspection_person > option:selected').attr('data-appoint');
        $('#md_ins_inspection_person_appoint').val(l_appoint=='null'?'':l_appoint);
        //alert($('#md_ins_inspection_person > option:selected').val());
    });
    
    $('#md_ins_result').on('select',function(){
        if ($(this).children('option:selected').val()=='Не годен' || $(this).children('option:selected').val()=='Ограничение'){
            $('#div_list_of_defects').show();
        } else{
            $('#div_list_of_defects').hide(); 
        }
        if ($(this).children('option:selected').val()=='Ограничение'){
            $('#md_ins_status_kurs').parent().find('input').addClass('required');
        } else{
            $('#md_ins_status_kurs').parent().find('input').removeClass('required');
        }
    });
    
    $('#tbl_list_of_defects').on ('select','tr > td:nth-child(1) > select',function(){
        var tr = $(this).parent().parent();
        tr.find('td:nth-child(2)').text($(this).children('option:selected').attr('title'));
        md_disable_btn_save_dev_inspection();
    });
    
    $('#md_ins_inspection_date').on('blur',function(){
        md_disable_btn_save_dev_inspection();
    });
    $('#md_ins_inspection_place,#md_ins_result,#md_ins_master,#md_ins_inspection_person,#md_ins_status_kurs').on('select',function(){
        md_disable_btn_save_dev_inspection();
    });
    $('input[name="md_ins_cont"]').on('change', function(){
        md_disable_btn_save_dev_inspection();
    });
    
    
    md_ins_history.on('change'/*,{p_inspections:l_car_inspections_mas}*/,function(e){
        //var l_inspection = e.data.p_inspections[$(e.target).val()];
        var l_inspection = l_car_inspections_mas[$(e.target).val()];
        
        $('#md_ins_inspection_date').val(l_inspection.inspection_date);
        $('#md_ins_inspection_place').val(l_inspection.inspection_place).parent().find('input').val(l_inspection.inspection_place);
        $('#md_ins_inspection_person').val(l_inspection.inspection_person).parent().find('input').val(l_inspection.inspection_person);
        $('#md_ins_inspection_person_appoint').val(l_inspection.inspection_person_appoint);
        $('#md_ins_master').val(l_inspection.master).parent().find('input').val(l_inspection.master);
        $('#md_ins_priority').val(l_inspection.priority).parent().find('input').val(l_inspection.priority);
        $('#md_ins_result').val(l_inspection.result).parent().find('input').val(l_inspection.result);
        $('#md_ins_status_kurs').val(l_inspection.status_kurs).parent().find('input').val(l_inspection.status_kurs);
        $('#md_ins_comment').val(l_inspection.description);
        $('#md_ins_created_request_status').val(l_inspection.created_request_status);
        $('#md_ins_refusal_to_repair').val(l_inspection.refusal_to_repair);
        $('#md_ins_created_by').val(l_inspection.created_by);
        
        $('#md_ins_old_result').val(l_inspection.result);
        
        $('#md_ins_result').triggerHandler('select');
        $('#tbl_list_of_defects tbody').empty();
        l_inspection.defects.forEach(function(item,i){
            if (item.defect_id!=null) {
                add_defect_dev_tr(item.defect_id
                             ,item.defect_code
                             ,item.defect_descr
                             ,item.doc_type
                             ,item.doc_num
                             ,item.defect_date);
            }
        });
        
        $('input[name="md_ins_cont"]').prop( "checked", false );
        $('input[name="md_ins_cont"][val="'+l_inspection.asset_instance_number+'"]').prop( "checked", true );
        
        if (l_inspection.inspection_id == '') {
            $('input[name="md_ins_cont"]').prop( "disabled", false );
            $('input[name="md_ins_cont"]').prop( "checked", true );
        } else{
            $('input[name="md_ins_cont"]').prop( "disabled", true );
        }
        
        md_disable_btn_save_inspection();
        md_disable_inspection_add_btns();
    });
    
    /*Если вызываем с параметром, значит вызываем по клику из дерева*/
    if (p_clicked_li !== undefined) {
        md_ins_refresh_car_number.val(p_clicked_li.attr('data-id'));
        md_ins_refresh_railcar_btn.triggerHandler('click',p_clicked_li.attr('data-type'));
        $('div#md_ins_refresh_railcar_div').hide();
    } else {
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { ajax_action: /*'get_all_cars'*/'get_all_fix_dev'},
            success: function (data) {
                var l_cars_json = JSON.parse(data);
                var l_cars = [];
                l_cars_json.forEach(function (item){
                    l_cars.push(item.NAME);
                });
				//console.log(l_cars)
                //l_cars.push('ВЕСЫ-МОД-ЖД-7260SM');
                md_ins_refresh_car_number.autocomplete({source: l_cars,minLength: 2,menuMaxHeight: '50em',menuWidth: 80});
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        
        md_ins_refresh_car_number.on('keyup', function (e){
            /*if (check_car_number($(this).val())||$(this).val()==='ВЕСЫ-МОД-ЖД-7260SM'){                
                $(this).addClass('true-car-number');
                md_ins_refresh_railcar_btn.prop('disabled', false);
            } else{
                $(this).removeClass('true-car-number');
                md_ins_refresh_railcar_btn.prop('disabled', true);
            }*/
			$(this).addClass('true-car-number');
			md_ins_refresh_railcar_btn.prop('disabled', false);
			 
        });
        md_ins_refresh_railcar_btn.prop('disabled', true);
    }

    md_ins_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Сохранить':{ 
                text: "Сохранить",
                id: "md_btn_save_inspection",
                click: function(){
                    $('#md_btn_save_inspection').prop( "disabled", true );
                    var l_defects = get_defects_string();
                    var l_cont = '';
                    $('input[name="md_ins_cont"]:checked').each(function(){
                        l_cont += $(this).attr('val')+'|';
                    });
					var v_param = {};
						v_param.car_number = md_ins_enter_car_number.val();//md_ins_enter_car_number.attr('instance_id');
						v_param.cont = l_cont;
						v_param.inspection_id = l_car_inspections_mas[md_ins_history.val()].inspection_id;
						v_param.inspection_date=$('#md_ins_inspection_date').val();
						v_param.inspection_place=$('#md_ins_inspection_place').val();
						v_param.inspection_person=$('#md_ins_inspection_person').val();
						v_param.inspection_person_appoint=$('#md_ins_inspection_person_appoint').val();
						v_param.master=$('#md_ins_master').val();
						v_param.priority=$('#md_ins_priority').val();
						v_param.result=$('#md_ins_result').val();
						v_param.status_kurs=$('#md_ins_status_kurs').val();
						v_param.comment=$('#md_ins_comment').val();
						v_param.defects=l_defects;
						//console.log(JSON.stringify(v_param));
						//return;
                    //var cont = $('input[name="md_ins_cont"]:checked').attr('val');
                    var res = md_enter_inspection_dev_ajax(v_param);

                    if (res === 'done') {
                        clear_add_info();
                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                    } else {
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    }
                    $(this).dialog( "close" );
                }   
            },
            'Удалить':{
                text: "Удалить",
                id: "md_btn_delete_inspection",
                click: function(){
                    var res = md_delete_dev_inspection_ajax(l_car_inspections_mas[md_ins_history.val()].inspection_id);

                    if (res === 'done') {
                        clear_add_info();
                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                    } else {
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    }
                    $('.tree_selected').removeClass('tree_selected');
                    $(this).dialog( "close" );
                }
            },
            /*'Создать заявку':{
                text: "Создать заявку",
                id: "md_btn_create_request",
                click: function(){
                    var res = create_request_ajax(l_car_inspections_mas[md_ins_history.val()].inspection_id);

                    if (res[0] == 'S') {
                        clear_add_info();
                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                    } else {
                        create_info_modal_dialog_new('Ошибка',res[1]);
                    }
                    $(this).dialog( "close" );
                }
            },*/
            'Отказ от ремонта':{
                text: "Отказ от ремонта",
                id: "md_btn_refusal_to_repair",
                click: function(){
                    
                    var md_div = $('<div/>')
                                    .attr('id','md_lvl_2')
                                    .attr('title','Отказ от ремонта')
                                    .appendTo('body')
                                    .append('<div class="attr">'+
                                                '<div>'+
                                                    '<label for="md_ins_refusal_to_repair_person">Фамилия И.О.</label>'+
                                                    '<input id="md_ins_refusal_to_repair_person" type="text" maxlength="50" style="width: 15em;" class="text ui-widget-content ui-corner-all">' +
                                                '</div>'+
                                            '</div>');
                            
                    md_div.dialog({
                        resizable:false,
                        modal:true,
                        width: 'auto',
                        draggable: false,
                        buttons:{
                            'Сохранить': function(){
                                var res = refusal_dev_to_repair_ajax(l_car_inspections_mas[md_ins_history.val()].inspection_id,$('#md_ins_refusal_to_repair_person').val());
                                
                                if (res === 'done') {
                                    clear_add_info();
                                    create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                                } else {
                                    create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                                }
                                $(this).dialog( "close" );
                            },
                            'Закрыть': function(){
                                $(this).dialog( "close" );
                            }
                        },
                        close: function() {
                            $(this).remove();
                        }
                    });
                    //var res = refusal_to_repair_ajax(l_car_inspections_mas[md_ins_history.val()].inspection_id);


                }
            },
            'Отчет':{
                text: "Отчет",
                id: "md_btn_create_ins_report1",
                click: function(){
					//console.log('par1='+$('#md_ins_enter_car_number').val()+' par2-='+l_car_inspections_mas[md_ins_history.val()].inspection_id+' par3-='+user_name);
                    run_report($('#md_ins_enter_car_number').val()
                                ,l_car_inspections_mas[md_ins_history.val()].inspection_id
                                ,user_name);
                }
            },
            
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
    
    if (!r_enter_inspection_add) {
        $('#md_btn_delete_inspection').hide();
        $('#md_btn_create_request').hide();
        $('#md_btn_refusal_to_repair').hide();
    }
    
    $('#md_ins_result').triggerHandler('select');
    md_disable_btn_save_inspection();
    md_disable_inspection_add_btns();
    stop_loading_animation();
}

function md_disable_inspection_add_btns(){
    var md_btn_delete_inspection = $('#md_btn_delete_inspection');
    var md_btn_create_request = $('#md_btn_create_request');
    var md_btn_refusal_to_repair = $('#md_btn_refusal_to_repair');
    var md_btn_create_ins_report1 = $('#md_btn_create_ins_report1');
    var md_btn_ins_docs = $('#md_btn_ins_docs');
    var md_ins_old_result = $('#md_ins_old_result').val();// =='Не годен'
    
    var md_ins_history = $('select#md_ins_history');
    
    if (md_ins_history.val()==0||md_ins_history.val()==null) {
        md_btn_delete_inspection.prop("disabled",true);
        md_btn_ins_docs.prop("disabled",true);
    } else {
        md_btn_delete_inspection.prop("disabled",false);
        md_btn_ins_docs.prop("disabled",false);
    }
    
    if (md_ins_history.val()==0||md_ins_history.val()==null||md_ins_old_result!='Не годен') {
        md_btn_create_request.prop("disabled",true);
        md_btn_create_ins_report1.prop("disabled",true);
    } else {
        md_btn_create_request.prop("disabled",false);
        md_btn_create_ins_report1.prop("disabled",false);
    }
    
    if (md_ins_history.val()==0||md_ins_history.val()==null||md_ins_old_result!='Не годен') {
        md_btn_refusal_to_repair.prop("disabled",true);
    } else {
        md_btn_refusal_to_repair.prop("disabled",false);
    }
}
function add_defect_tr(p_defect_id,p_defect_code,p_defect_descr,p_doc_type,p_doc_num,p_defect_date){
    /*beg "Статус курсирования"*/
    function get_defects(){
        var l_places;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { ajax_action: 'get_defects'
                  },
            success: function (data) {
                //alert(data);
                l_places = JSON.parse(data);
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        
        var l_select = $('<select>')
                       .addClass('md-select required')
                       .css({'width':'10em'});
        l_select.append($('<option>'));       
        $.each(l_places, function( i, item ) {
            l_select.append($('<option>')
                            .val(item.CODE)
                            .prop('title',item.DESCR)
                            .text(item.CODE+' '+item.DESCR)
                           );
        });
        return l_select;
    }
    /*end "Статус курсирования"*/   
    /*beg "Документ"*/
    function get_document_types(){
        var l_places;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { ajax_action: 'get_document_types'
                  },
            success: function (data) {
                //alert(data);
                l_places = JSON.parse(data);
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        
        var l_select = $('<select>')
                       .addClass('md-select')
                       .css({'width':'14em'});
        l_select.append($('<option>'));       
        $.each(l_places, function( i, item ) {
            l_select.append($('<option>')
                            .val(item.CODE)
                            .prop('title',item.DESCR)
                            .text(item.CODE)
                           );
        });           
        return l_select; 
    }
    /*end "Документ"*/ 
  
    if (   ($('input#md_ins_enter_car_number').val()==='ВЕСЫ-МОД-ЖД-7260SM' && $('#tbl_list_of_defects').find('tr').length === 0) 
         || $('input#md_ins_enter_car_number').val()!=='ВЕСЫ-МОД-ЖД-7260SM'){
        var tr = $('<tr>');
        var l_defect_select = get_defects();
        var l_document_types_select = get_document_types();
        var l_defect_date_input = $('<input>')
                                   .attr({type:'text'})
                                   .addClass('text ui-widget-content ui-corner-all')
                                   .css({'width':'9.5em'});
        tr.append($('<td>').append(l_defect_select.val(p_defect_code)));
        tr.append($('<td>').text(p_defect_descr));
        tr.append($('<td>').append(l_document_types_select.val(p_doc_type)));
        tr.append($('<td>').append($('<input>')
                                   .attr({type:'text'})
                                   .addClass('text ui-widget-content ui-corner-all')
                                   .css({'width':'8em'})
                                   .val(p_doc_num)
                                  ));
        tr.append($('<td>').append(l_defect_date_input.val(p_defect_date)));
        tr.append($('<td>').text((p_defect_id==null?'':p_defect_id)).hide());
        tr.append('<td><div class="deleteImage deleteImage13px" title="Удалить" onclick="$(this).parent().parent().remove(); md_disable_btn_save_inspection();"></div></td>');


        tr.appendTo($('#tbl_list_of_defects'));

        l_defect_select.combobox({menuMaxHeight: '20em',use_val:true});
        l_document_types_select.combobox({menuMaxHeight: '20em'});
        init_date_time_input(l_defect_date_input);
        md_disable_btn_save_inspection();
    } else {
        create_info_modal_dialog_new('Предупреждение','По активу "ВЕСЫ-МОД-ЖД-7260SM" можно добавлять только ОДНУ неисправность для осмотра!');
    }
}

function add_defect_dev_tr(p_defect_id,p_defect_code,p_defect_descr,p_doc_type,p_doc_num,p_defect_date){
    /*beg "Статус курсирования"*/
    function get_defects(){
        var l_places;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { ajax_action: 'get_device_defects'
                  },
            success: function (data) {
                //alert(data);
                l_places = JSON.parse(data);
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        
        var l_select = $('<select>')
                       .addClass('md-select required')
                       .css({'width':'10em'});
        l_select.append($('<option>'));       
        $.each(l_places, function( i, item ) {
            l_select.append($('<option>')
                            .val(item.CODE)
                            .prop('title',item.DESCR)
                            .text(item.CODE+' '+item.DESCR)
                           );
        });
        return l_select;
    }
    /*end "Статус курсирования"*/   
    /*beg "Документ"*/
    function get_document_types(){
        var l_places;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { ajax_action: 'get_document_types'
                  },
            success: function (data) {
                //alert(data);
                l_places = JSON.parse(data);
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        
        var l_select = $('<select>')
                       .addClass('md-select')
                       .css({'width':'14em'});
        l_select.append($('<option>'));       
        $.each(l_places, function( i, item ) {
            l_select.append($('<option>')
                            .val(item.CODE)
                            .prop('title',item.DESCR)
                            .text(item.CODE)
                           );
        });           
        return l_select; 
    }
    /*end "Документ"*/ 
  
    if (   ($('input#md_ins_enter_car_number').val()==='ВЕСЫ-МОД-ЖД-7260SM' && $('#tbl_list_of_defects').find('tr').length === 0) 
         || $('input#md_ins_enter_car_number').val()!=='ВЕСЫ-МОД-ЖД-7260SM'){
        var tr = $('<tr>');
        var l_defect_select = get_defects();
        var l_document_types_select = get_document_types();
        var l_defect_date_input = $('<input>')
                                   .attr({type:'text'})
                                   .addClass('text ui-widget-content ui-corner-all')
                                   .css({'width':'9.5em'});
        tr.append($('<td>').append(l_defect_select.val(p_defect_code)));
        tr.append($('<td>').text(p_defect_descr));
        tr.append($('<td>').append(l_document_types_select.val(p_doc_type)));
        tr.append($('<td>').append($('<input>')
                                   .attr({type:'text'})
                                   .addClass('text ui-widget-content ui-corner-all')
                                   .css({'width':'8em'})
                                   .val(p_doc_num)
                                  ));
        tr.append($('<td>').append(l_defect_date_input.val(p_defect_date)));
        tr.append($('<td>').text((p_defect_id==null?'':p_defect_id)).hide());
        tr.append('<td><div class="deleteImage deleteImage13px" title="Удалить" onclick="$(this).parent().parent().remove(); md_disable_btn_save_inspection();"></div></td>');


        tr.appendTo($('#tbl_list_of_defects'));

        l_defect_select.combobox({menuMaxHeight: '20em',use_val:true});
        l_document_types_select.combobox({menuMaxHeight: '20em'});
        init_date_time_input(l_defect_date_input);
        md_disable_btn_save_inspection();
    } else {
        create_info_modal_dialog_new('Предупреждение','По активу "ВЕСЫ-МОД-ЖД-7260SM" можно добавлять только ОДНУ неисправность для осмотра!');
    }
}

function md_disable_btn_save_inspection(){
    var l_flag_fill_defects = true;
    var l_defects_count = $('#tbl_list_of_defects tr').length;
    $('#tbl_list_of_defects tr > td:nth-child(1) > select').each(function(){
        if ($(this).val()==''){
            l_flag_fill_defects= false;
        }
    });
    
    var l_result = $('#md_ins_result').val();
    var l_stat_kurs = $('#md_ins_status_kurs').val();
    
    if ( $('#md_ins_inspection_date').hasClass('red_bckg_color')||$('#md_ins_inspection_date').val()==''||$('#md_ins_inspection_place').val()==''||l_result==''
       ||$('#md_ins_master').val()==''
       ||$('#md_ins_inspection_person').val()==''
       ||(l_result=='Ограничение'&&l_stat_kurs=='')
       ||((l_result=='Не годен'||l_result=='Ограничение') && (!l_flag_fill_defects||l_defects_count==0))
       ||($('input[name="md_ins_cont"]').length>0&&$('input[name="md_ins_cont"]:checked').length==0)
       ||$('#md_ins_old_result').val()=='Не годен'||($('#md_ins_enter_car_number').val()==''&&$('input[name="md_ins_cont"]').length!=1)
       ||(user_id != $('#md_ins_created_by').val() && r_enter_inspection_add==false && $('#md_ins_created_by').val()!='')
       )
    {
        $('#md_btn_save_inspection').prop( "disabled", true );
    }else{
        $('#md_btn_save_inspection').prop( "disabled", false );
    }
}

function md_disable_btn_save_dev_inspection(){
    var l_flag_fill_defects = true;
    var l_defects_count = $('#tbl_list_of_defects tr').length;
    $('#tbl_list_of_defects tr > td:nth-child(1) > select').each(function(){
        if ($(this).val()==''){
            l_flag_fill_defects= false;
        }
    });
    
    var l_result = $('#md_ins_result').val();
    var l_stat_kurs = $('#md_ins_status_kurs').val();
    
    if ( $('#md_ins_inspection_date').hasClass('red_bckg_color')||$('#md_ins_inspection_date').val()==''||$('#md_ins_inspection_place').val()==''||l_result==''
       ||$('#md_ins_master').val()==''
       ||$('#md_ins_inspection_person').val()==''
       ||(l_result=='Ограничение'&&l_stat_kurs=='')
       ||((l_result=='Не годен'||l_result=='Ограничение') && (!l_flag_fill_defects||l_defects_count==0))
       ||($('input[name="md_ins_cont"]').length>0&&$('input[name="md_ins_cont"]:checked').length==0)
       ||$('#md_ins_old_result').val()=='Не годен'||($('#md_ins_enter_car_number').val()==''&&$('input[name="md_ins_cont"]').length!=1)
       ||(user_id != $('#md_ins_created_by').val() && r_enter_inspection_add==false && $('#md_ins_created_by').val()!='')
       )
    {
        $('#md_btn_save_inspection').prop( "disabled", true );
    }else{
        $('#md_btn_save_inspection').prop( "disabled", false );
    }
}

/*"Место осмотра вагона"*/
function get_select_places(p_id){
    var l_places;
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async:false,
        data: { ajax_action: 'get_place_inspection_cars'
              },
        success: function (data) {
            //alert(data);
            l_places = JSON.parse(data);
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });

    var result = '<select id="'+p_id+'" class="required md-select" style="width: 14em;">';
    result += '<option value=""></option>';
    $.each(l_places, function( i, item ) {
        result += '<option value="'+item.FLEX_VALUE+'">'+item.FLEX_VALUE_MEANING+'</option>';
    });
    result += '</select>';
    return result; 
}
/*"Осмотр произвел ФИО"*/
function get_inspection_persons(p_id){
    var l_inspection_persons;
    /*$.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async:false,
        data: { ajax_action: 'get_inspection_persons'
              },
        success: function (data) {
            //alert(data);
            l_inspection_persons = JSON.parse(data);
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });*/
    l_inspection_persons = g_inspection_persons;

    var result = '<select id="'+p_id+'" class="md-select required" style="width: 16em;">';
    result += '<option value=""></option>';
    $.each(l_inspection_persons, function( i, item ) {
        result += '<option data-appoint="'+item.APPOINT_NAME+'" title="'+item.DEPT_NAME+'" value="'+item.FULL_NAME+'">'+item.FULL_NAME+'</option>';
    });
    result += '</select>';
    return result; 
}
/*"Мастер смены ФИО"*/
function get_masters(p_id){
    var l_masters;
    /*$.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async:false,
        data: { ajax_action: 'get_masters'
              },
        success: function (data) {
            //alert(data);
            l_masters = JSON.parse(data);
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });*/
    l_masters = g_masters;

    var result = '<select id="'+p_id+'" class="md-select required" style="width: 16em;">';
    result += '<option value=""></option>';
    $.each(l_masters, function( i, item ) {
        result += '<option data-appoint="'+item.APPOINT_NAME+'" title="'+item.DEPT_NAME+'" value="'+item.FULL_NAME+'">'+item.FULL_NAME+'</option>';
    });
    result += '</select>';
    return result; 
}
/*"Инф-ия по вагону(группа актива, серийный номер)"*/
function get_asset_info(p_car_number){
    var l_asset_info;
    var l_asset_info_obj;
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async:false,
        data: { car_number:p_car_number
               ,ajax_action: 'get_asset_info'
              },
        success: function (data) {
            l_asset_info = JSON.parse(data);
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });

    if (l_asset_info.length!=1){
        l_asset_info_obj = {'instance_id':-1};
    } else {
        l_asset_info_obj = {'instance_id':l_asset_info[0].INSTANCE_ID
                           ,'asset_group_id':l_asset_info[0].ASSET_GROUP_ID
                           ,'asset_group':l_asset_info[0].ASSET_GROUP
                           ,'asset_number':l_asset_info[0].ASSET_NUMBER
                           };
    }

    return l_asset_info_obj; 
}
/* Информация по вагону(актив) (атрибуты из OeBS)*/
function get_device_info(p_car_number){
    var l_asset_info;
    var l_asset_info_obj;
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async:false,
        data: { car_number:p_car_number
               ,ajax_action: 'get_asset_info'
              },
        success: function (data) {
            l_asset_info = JSON.parse(data);
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });

    if (l_asset_info.length!=1){
        l_asset_info_obj = {'instance_id':-1};
    } else {
        l_asset_info_obj = {'instance_id':l_asset_info[0].INSTANCE_ID // id актива
                           ,'asset_group_id':l_asset_info[0].ASSET_GROUP_ID // ID группы актива
                           ,'asset_group':l_asset_info[0].ASSET_GROUP	// Группа актива
                           ,'asset_number':l_asset_info[0].ASSET_NUMBER // Номер актива
                           };
    }

    return l_asset_info_obj; 
}
/*"Приоритет"*/
function get_priority(p_id){
    var l_places;
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async:false,
        data: { ajax_action: 'get_priority'
              },
        success: function (data) {
            //alert(data);
            l_places = JSON.parse(data);
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });

    var result = '<select id="'+p_id+'" class="md-select" style="width: 10em;">';
    result += '<option value=""></option>';
    $.each(l_places, function( i, item ) {
         result += '<option value="'+item.CODE+'">'+item.DESCR+'</option>';
    });
    result += '</select>';
    return result; 
}
/*"Результат осмотра"*/
function get_ins_results(p_id,p_few_cars_flag){
    var result = '<select id="'+p_id+'" class="md-select required" style="width: 8em;">';
    result += '<option value=""></option>';
    $.each(g_inspection_results, function( i, item ) {
        var disabled = '';
        if (p_few_cars_flag=='Y'&&(item.CODE=='Не годен'||item.CODE=='Ограничение')){
            disabled = 'disabled';
        }
        result += '<option '+disabled+' value="'+item.CODE+'" title="'+item.DESCR+'" >'+item.CODE+'</option>';
    });
    result += '</select>';
    return result; 
}
/*"Статус курсирования"*/
function get_status_kurs(p_id){
    var l_places;
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async:false,
        data: { ajax_action: 'get_status_kurs'
              },
        success: function (data) {
            //alert(data);
            l_places = JSON.parse(data);
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });

    var result = '<select id="'+p_id+'" class="md-select" style="width: 14em;">';
    result += '<option value=""></option>';
    $.each(l_places, function( i, item ) {
         result += '<option value="'+item.CODE+'" title="'+item.DESCR+'" >'+item.CODE+'</option>';
    });
    result += '</select>';
    return result; 
}
/* Ввод осмотра нескольких вагонов */
function create_md_enter_inspection_for_few_cars(p_obj_type){
	/* Заполнение таблицы с номером вагона, контейнером и грузом */
    function get_tr_for_inspection_table(p_obj_type,p_number,p_obj_number,p_freight,p_cont,p_status_nsi){
        var tr = $('<tr>');
        var div = $('<div>',{'class':'deleteImage deleteImage13px'});
		var checkbox_nsi = $('<input>').attr({'type':'checkbox'}); // add 26/10/2022
        div.on('click',function(){
            tr.nextAll().children('td:nth-child(1)').each(function(){
                $(this).text(parseInt($(this).text())-1);
            });
            tr.remove();
        });
		
        
        tr.append($('<td>',{'text':p_number}));
        tr.append($('<td>',{'text':p_obj_number}));
        tr.append($('<td>',{'text':p_freight}));
        if (p_obj_type == 'railcar'){
            tr.append($('<td>',{'text':p_cont}));
			tr.append($('<td>',{'text':p_status_nsi}));
        }
		if (r_update_of_nsi){
			tr.append($('<td>').append(checkbox_nsi));
		}
		else {
			tr.append($('<td>').append(''));
		}
        
		tr.append($('<td>').append(div));
		
        
        return tr;
    }
	/* Добавление новой строки в таблицу 
		p_table - объект таблицы
		p_obj_type - тип railcar/cont
	*/
    function add_rows_in_inspection_table(p_table,p_obj_type){
        var l_cars = get_selected_objects();
        
        l_cars.forEach(function(p_car,index){
            if (p_obj_type == 'railcar'){
                p_table.append(get_tr_for_inspection_table(p_obj_type,index+1,p_car.obj_number,p_car.freight,p_car.cont,p_car.status_nsi));
            }else{
                p_table.append(get_tr_for_inspection_table(p_obj_type,index+1,p_car.obj_number,p_car.freight,null,null));
            }
        });
    }
	/* 
		Добавляем введен вагон в таблицу
	*/
    function add_car_in_inspection_table(p_type_obj){
        var ins_tbl = $('table#inspection_cars_table');
        var car_number_input = $('#md_inspection_add_car');
        
        var obj_number = car_number_input.val();
        var count = ins_tbl.find('tr').length;

        if (obj_number.length<8 && p_type_obj=='railcar') {
            car_number_input.addClass('red_bckg_color');
            alert('Не верный номер вагона: ' + obj_number);
        } else if (ins_tbl.find('tr td:contains("'+obj_number+'")').length!==0) {
            car_number_input.addClass('red_bckg_color');
            alert((p_type_obj=='railcar'?'Вагон ':'Контейнер ') + obj_number + ' уже добавлен!');
        } else{
            $.ajax({
                url: 'data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data: { car_number: obj_number
                       ,ajax_action: (p_type_obj=='railcar'?'get_add_info_for_car':'get_add_info_for_cont')
                      },
                success: function (data) {
                    var records = JSON.parse(data);

                    for(var i=0; i<records.length; i++) {
                        var child = records[i];
                        
                        var freight = (child.FREIGHT_NAME !== null) ? child.FREIGHT_NAME : '';
                        var cont = null;
						var status_nsi = (child.STATUS !== null) ? child.STATUS : '';
                        if (p_type_obj == 'railcar'){
                            cont = (child.CONT !== null) ? child.CONT : '';
                        }
                        
                        ins_tbl.append(get_tr_for_inspection_table(p_obj_type,count+1,obj_number,freight,cont,status_nsi));
                    }

                    md_disable_notification_btn();
                    car_number_input.removeClass('red_bckg_color');
                    car_number_input.val('');
                },
                error: function (m1,m2) {window.alert(m1+m2);}
            });
        } 
    }
	/* Сохраняем данные */
    function md_enter_inspection_for_few_cars_ajax(p_obj_type,p_obj_numbers,p_cars_nsi,p_inspection_date,p_inspection_place,p_inspection_person,p_inspection_person_appoint,p_master,p_priority,p_result,p_status_kurs,p_comment){
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { obj_numbers: p_obj_numbers
                   ,obj_type:p_obj_type
                   ,inspection_date:p_inspection_date
                   ,inspection_place:p_inspection_place
                   ,inspection_person:p_inspection_person
                   ,inspection_person_appoint:p_inspection_person_appoint
                   ,master:p_master
                   ,priority:p_priority
                   ,result:p_result
                   ,status_kurs:p_status_kurs
                   ,comment:p_comment
				   ,cars_nsi:p_cars_nsi //add 26/10/2022 BekmansurovRR
                   ,ajax_action: 'enter_inspection_for_few_cars'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    function get_cars_from_inspection_tbl(){
        var param = '';
        $('table#inspection_cars_table > tbody > tr').each(function(){
            param+= $(this).children('td:nth-child(2)').text() + '|';
        });

        return param;
    }
	function get_cars_nsi_inspection_tbl(){
        var param = '';
		var nsi_input;
        $('table#inspection_cars_table > tbody > tr').each(function(){
			nsi_input = $(this).find('td:nth-child(6) input').prop('checked');
			if (nsi_input){
				param+= $(this).children('td:nth-child(2)').text() + '|';
				//console.log('card ='+$(this).children('td:nth-child(2)').text()+' nsi_input = '+nsi_input);
			}
			
            
        });

        return param;
    }
    
    start_loading_animation();
    
    $('#modalDialog').remove();
    $('.context-menu').remove();
	
	/* Формируем модальное окно */
    var l_md_div = $('<div/>')
        .attr('id','modalDialog')
        .attr('title',(p_obj_type=='railcar'?'Осмотр вагонов':'Осмотр контейнеров'))
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append(
            '<div style="display: table;">'+
                '<div class="attr" style="width: 500px;">'+
                    '<div>'+
                        '<label for="md_ins_inspection_date">Дата и время осмотра</label>'+
                        '<input id="md_ins_inspection_date" type="text" maxlength="16" class="text ui-widget-content ui-corner-all required" style="width: 9em;">' +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_inspection_place">Место осмотра вагона</label>'+
                        get_select_places('md_ins_inspection_place')+
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_inspection_person">Осмотр произвел ФИО</label>'+
                        get_inspection_persons('md_ins_inspection_person')+
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_inspection_person_appoint">Осмотр произвел должность</label>'+
                        '<input disabled id="md_ins_inspection_person_appoint" type="text" class="text ui-widget-content ui-corner-all" style="width: 16em;">' +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_master">Мастер смены ФИО</label>'+
                        get_masters('md_ins_master')+
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_priority">Приоритет</label>'+
                        get_priority('md_ins_priority') +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_result">Результат осмотра</label>'+
                        get_ins_results('md_ins_result','Y') +
                        '<input id="md_ins_old_result" style="display: none;"></input>'+
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_status_kurs">Статус курсирования</label>'+
                        get_status_kurs('md_ins_status_kurs') +
                    '</div>'+

                    '<div>'+
                        '<label for="md_ins_comment">Примечание</label>'+
                        '<input id="md_ins_comment" type="text" maxlength="400" style="width: 30em;" class="text ui-widget-content ui-corner-all"><br>' +
                    '</div>'+
                '</div>'+
            '</div>'
            
        );
    if (p_obj_type == 'railcar'){
        l_md_div.append(
            '<table class="inspection_cars_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th>№</th>'+
                        '<th>Вагон</th>'+
                        '<th>Наим. груза</th>'+
                        '<th>№ контейнера</th>'+
						'<th>Статус</th>'+
						'<th>Обнов.<br>НСИ</th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'
        );
    }else{
        l_md_div.append(
            '<table class="inspection_cars_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th>№</th>'+
                        '<th>Контейнер</th>'+
                        '<th>Наим. груза</th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'
        );
    }
    
    
    
    l_md_div.append(
        '<div style="margin-left:29px;">'+
            '<input id="md_inspection_add_car" style="font-size: 11px;" type="text" maxlength="8" size="8" class="text ui-widget-content ui-corner-all">' +
            '<input id="md_inspection_add_car_btn" type="button" style="font-size: 11px; height: 17px;" value="Добавить" class="btnAdd">'+
        '</div>'+
        '<div class="modalDialogContainer" style="display: inline-block;">'+
            '<table id="inspection_cars_table" class="inspection_cars_table">'+
                '<tbody>'+
                '</tbody>'+
            '</table>'+
        '</div>'
    );
    
    if (p_obj_type == 'cont'){
        $('table.inspection_cars_table').addClass('inspection_conts_table');
        $('#md_inspection_add_car').attr('maxlength','11').attr('size','11');
    }
    

    add_rows_in_inspection_table($('table#inspection_cars_table'),p_obj_type);

    init_date_time_input($('#md_ins_inspection_date'));
    
    $('#md_ins_inspection_place').combobox({menuMaxHeight: '50em',menuWidth:'250'});
    $('#md_ins_inspection_person').combobox({menuMaxHeight: '50em',menuWidth:'250'});
    $('#md_ins_master').combobox({menuMaxHeight: '50em',menuWidth:'250'});
    $('#md_ins_priority').combobox();
    $('#md_ins_result').combobox();
    $('#md_ins_status_kurs').combobox();
    
    $('#md_inspection_add_car_btn').on('click',function(){
        add_car_in_inspection_table(p_obj_type);
    });
    
    $('#md_ins_inspection_person').on('select',function(){
        $('#md_ins_inspection_person_appoint').val($('#md_ins_inspection_person > option:selected').attr('data-appoint'));
        //alert($('#md_ins_inspection_person > option:selected').val());
    });
    
    $('#md_ins_inspection_date').on('blur',function(){
        md_disable_btn_save_inspection_few_cars();
    });
    $('#md_ins_inspection_place').on('select',function(){
        md_disable_btn_save_inspection_few_cars();
    });
    
    $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Сохранить':{text: "Сохранить",
                           id: "md_btn_save_inspection",
                        click: function(){
                            $('#md_btn_save_inspection').prop( "disabled", true );
                            var l_car_numbers = get_cars_from_inspection_tbl();
							var l_car_nsi = get_cars_nsi_inspection_tbl(); // add 26/10/2022 BekmansurovRR

                            var res = md_enter_inspection_for_few_cars_ajax(
                                         p_obj_type,l_car_numbers,l_car_nsi,$('#md_ins_inspection_date').val(),$('#md_ins_inspection_place').val(),$('#md_ins_inspection_person').val()
                                        ,$('#md_ins_inspection_person_appoint').val(),$('#md_ins_master').val(),$('#md_ins_priority').val(),$('#md_ins_result').val()
                                        ,$('#md_ins_status_kurs').val(),$('#md_ins_comment').val()
                                        );
                            
                            if (res === 'done') {
                                create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                            } else {
                                create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                            }

                            $(this).dialog( "close" );
                        }   
                       }, 
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
    md_disable_btn_save_inspection_few_cars();
    stop_loading_animation();
}
function md_disable_btn_save_inspection_few_cars(){    
    if ( $('#md_ins_inspection_date').hasClass('red_bckg_color')||$('#md_ins_inspection_date').val()==''||$('#md_ins_inspection_place').val()==''   
       )
    {
        $('#md_btn_save_inspection').prop( "disabled", true );
    }else{
        $('#md_btn_save_inspection').prop( "disabled", false );
    }
}
/*Возврат вагонов с ПСП*/
function create_md_return_from_PSP(){
    function md_return_from_PSP(){
          
        var self = this;
        
        function return_from_PSP_ajax(p_car_numbers,p_return_time,p_return_reason,p_return_comment,p_return_correction_reason,p_station_operator) {
            var res;
            $.ajax({
                url: 'data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data: { car_numbers: p_car_numbers
                       ,return_time: p_return_time
                       ,return_reason: p_return_reason
                       ,return_comment: p_return_comment
                       ,return_correction_reason: p_return_correction_reason
                       ,station_operator: p_station_operator
                       ,ajax_action: 'return_from_psp'
                },
                success: function (data) {
                    res = data;
                },
                error: function (data) {
                    res = 'fail';
                }
            });
            return res;
        }
        
        this.show_window = function(){
            $('.context-menu').remove();
            
            var md_div = $('<div/>')
                .attr('title','Возврат вагонов с ПСП')
                .appendTo('body') // Присоединяем наше меню к body документа: 
                .append('<div style="display: table;">'+
                            '<div class="attr" style="width:285px;">'+
                                '<div>'+
                                    '<label>Станция отправления:</label>'+
                                    '<input disabled type="text" size="13" class="text ui-widget-content ui-corner-all" value="ПСП"></input>'+
                                '</div>'+
                                '<div>'+
                                    '<label>Станция назначения:</label>'+
                                    '<input disabled type="text" size="13" class="text ui-widget-content ui-corner-all" value="Водораздельная"></input>'+
                                '</div>'+
                            '</div>'+
                            '<div class="attr" style="margin-left:14px; text-align:right; float:right">'+
                                '<input disabled type="text" size="14" class="text ui-widget-content ui-corner-all" value="'+get_server_current_time()+'"></input><br>'+
                                '<input disabled type="text" size="20" class="text ui-widget-content ui-corner-all" style="margin-top:5px;" value="'+user_name+'"></input>'+
                            '</div>'+
                        '</div>'
            );
            /*Дата и время возврата*/
            md_div.return_time = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
            /*Причина возврата*/
            md_div.return_reason = $('<select>')
                .css({'width':'130px'})
                .addClass('required')
                .append('<option value=""></option>')
                .append('<option value="mistake">Ошибка</option>')
                .append('<option value="return">Возврат</option>');
            md_div.return_comment = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'300px'}});
            md_div.append(
                $('<div>',{css:{'display':'table'}}).append(
                    $('<div>',{class:'attr',css:{'border':'none','width':'484px'}})
                        .append(
                            $('<div>')
                                .append($('<label>').text('Дата и время возврата (Мск)'))
                                .append(md_div.return_time)
                        )
                        .append(
                            $('<div>')
                            .append($('<label>').text('Причина'))
                            .append(md_div.return_reason)
                        )
                        .append(
                            $('<div>')
                            .append($('<label>').text('Комментарий'))
                            .append(md_div.return_comment)
                        )
                )    
            );
            
            md_div.error_correction_blok = $('<div>',{css:{'display':'table'}}).appendTo(md_div);
            md_div.return_correction_reason = $('<select>').css({'width':'250px'})
                .append('<option value=""></option>');;
            md_div.station_operator = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'200px'}});
            
            md_div.error_correction_blok.append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{class:'header',css:{'width':'72px'}}).text('Возврат')
                )
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'465px'}})
                        .append(
                            $('<div>')
                                .append($('<label>').text('Причина возврата'))
                                .append(md_div.return_correction_reason)
                        )
                        .append(
                            $('<div>')
                                .append($('<label>').text('ФИО дежурного ПСП'))
                                .append(md_div.station_operator)
                        )
                    )
                )
            );
    
            $.ajax({
                url: 'data.php',
                type: 'POST',
                dataType: "text",
                data: { ajax_action: 'get_reasons_for_return'
                      },
                success: function (data) {
                    var result = JSON.parse(data);
                    result.forEach(function(item){
                        md_div.return_correction_reason.append('<option value="'+item.ID+'">'+item.NAME+'</option>');
                    });
                },
                error: function (m1,m2) {window.alert(m1+m2);}
            });
 
            var railcar_table = new railcar_table_const();
            md_div.append(railcar_table.get_table());
            railcar_table.add_cars_in_table(return_selected_cars(),false);
            
            railcar_table.spec_check_car_number = function(p_car_number){
                var find_result = $('#comingCarsTree').find('li[data-id='+p_car_number+'][data-from_station_id=2]');
                if (find_result.length == 0){
                    return false;
                }
                return true;
            };
            
            md_div.disable_ok_btn = function (){
                if (md_div.return_time.hasClass('red_bckg_color')||md_div.return_time.val()==''||md_div.return_reason.val()==''||railcar_table.cars_count==0){
                    $('#md_ok_btn').prop( "disabled", true );
                }else{
                    $('#md_ok_btn').prop( "disabled", false );
                }
            };
            md_div.check_cars_train = function (){
                $.ajax({
                    url: 'data.php',
                    type: 'POST',
                    dataType: "text",
                    async:false,
                    data: { cars_number: railcar_table.get_cars_in_table()
                           ,reason: md_div.return_reason.val()
                           ,ajax_action: 'get_last_cars_train_time'
                          },
                    success: function (result) {
                        if (result!=''){
                            md_div.return_time.val(result);
                            if (md_div.return_reason.val()=='return'){
                                md_div.return_time_last = result;
                            }
                        }else if (result==''&&md_div.return_reason.val()=='mistake'){
                            alert('Ошибка! Вагоны в разных поездах!');
                        }
                    },
                    error: function (m1,m2) {window.alert(m1+m2);}
                });
            };
            
            railcar_table.action_change_table = function(){
                md_div.disable_ok_btn();
            };
            
            md_div.return_time.on('blur',function(){
                md_div.disable_ok_btn();
                if (md_div.return_reason.val()=='mistake'&&!md_div.return_time.hasClass('red_bckg_color')){
                    var l_return_time = md_div.return_time.val();
                    var l_return_time_last = md_div.return_time_last;

                    var pattern = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2})\:(\d{2})/;
                    var l_return_time_d = new Date(l_return_time.replace(pattern,'$3-$2-$1T$4:$5:00'));
                    var l_return_time_last_d = new Date(l_return_time_last.replace(pattern,'$3-$2-$1T$4:$5:00'));
                    
                    var diff_ss = (l_return_time_d - l_return_time_last_d)/1000;
                    if (diff_ss<0){
                        alert('Дата возврата меньше чем дата отправления с Угл + 2 часа!!!');
                    }
                }
            });
            md_div.return_reason.on('change', function(){
                md_div.check_cars_train();
                md_div.disable_ok_btn();
            });
    
            init_date_time_input(md_div.return_time);
            md_div.error_correction_blok.hide();
            md_div.return_reason.on('change', function(){
                if ($(this).val()=='return'){
                    md_div.error_correction_blok.show();
                }else{
                    md_div.error_correction_blok.hide();
                };
            });

            md_div.dialog({
                resizable:false,
                modal:true,
                width: 'auto',
                position: { my: 'top', at: 'top+150' },
                draggable: false,
                buttons:{
                    'Вернуть':{
                        text: "Вернуть",
                          id: "md_ok_btn",
                       click: function(){
                            var cars_in_table = railcar_table.get_cars_in_table();
                            
                            if (return_from_PSP_ajax(cars_in_table,md_div.return_time.val(),md_div.return_reason.val(),md_div.return_comment.val(),
                                                                   md_div.return_correction_reason.val(),md_div.station_operator.val())==='done') {
                                
                                var cars_in_table_mas = cars_in_table.split('|');
                                cars_in_table_mas.pop();
                                cars_in_table_mas.forEach(function(item) {
                                    $('li[data-id="'+item+'"][data-type="railcar"]').remove();
                                });

                                md_div.dialog("close");
                                create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                            }else{
                                md_div.dialog("close");
                                create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
                            }
                            
                            $('.tree_selected').removeClass('tree_selected');
                            clear_add_info();
                        }   
                    }, 
                    'Закрыть': function(){
                        $(this).dialog( "close" );
                    }
                },
                close: function() {
                    $(this).remove();
                }
            });
            $('#md_ok_btn').prop( "disabled", true );
        };
    }
    
    var md_return_from_PSP = new md_return_from_PSP;
    md_return_from_PSP.show_window();
}

function create_md_weigh_import(){
    function railcar_table_for_weigh(){
        var self = this;
        this.cars_table_total_row;
        this.cars_count = 0;
        this.cars_lenght= 0;
        
        var tr_mas = [];
        
        var return_table = $('<div>');
        return_table.append(
            '<table class="weigh_import_table cars_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th>Целевой вагон</th>'+
                        '<th>№</th>'+
                        '<th>Вагон</th>'+
                        '<th>Вес груза</th>'+
                        '<th>Дата взвешивания</th>'+
                        '<th>Тип взвешивания</th>'+
                        '<th>Скорость взв-ия</th>'+
						'<th>Для акта</th>'+
                        '<th>Комментарий взвешивания</th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'
        );

        return_table.cars_table = $('<table>',{class:'weigh_import_table cars_table'}).append($('<tbody>'));
        return_table.append(
            $('<div>',{class:'modalDialogContainer',css:{'display':'inline-block'}})  
            .append(return_table.cars_table)
        );
        return_table.cars_table_total_row = $('<tr>',{css:{'background':'#EBEBEB','font-weight':'bold'}});
        self.cars_table_total_row = return_table.cars_table_total_row;
        return_table.append(
            $('<table>',{class:'received_cars_table',css:{'margin-top':'-4px'}})
            .append(
                $('<tbody>').append(return_table.cars_table_total_row)
            )
        );

        function change_cars_table_total_tr(){
            
            /*return_table.cars_table_total_row.find('td').remove();
            if (self.cars_count!==0) {
                var sum_weight_net = 0;
                return_table.cars_table.find('tr td:nth-child(6)').each(function(){
                    sum_weight_net+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });
                var sum_weight_dep = 0;
                return_table.cars_table.find('tr td:nth-child(7)').each(function(){
                    sum_weight_dep+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });
                var sum_weight_gross = 0;
                return_table.cars_table.find('tr td:nth-child(8)').each(function(){
                    sum_weight_gross+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });
                var sum_car_length = 0;
                return_table.cars_table.find('tr td:nth-child(9)').each(function(){
                    sum_car_length+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });

                self.cars_lenght = Math.round(sum_car_length * 100)/100;

                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>Кол-во: '+ self.cars_count +'</td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>'+Math.round(sum_weight_net * 100)/100+'</td>');
                return_table.cars_table_total_row.append('<td>'+Math.round(sum_weight_dep * 100)/100+'</td>');
                return_table.cars_table_total_row.append('<td>'+ Math.round(sum_weight_gross * 100)/100 +'</td>');
                return_table.cars_table_total_row.append('<td>'+ Math.round(sum_car_length * 100)/100 +'</td>');
            }else{
                self.cars_lenght = 0;

                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>Кол-во: 0</td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>0</td>');
                return_table.cars_table_total_row.append('<td>0</td>');
                return_table.cars_table_total_row.append('<td>0</td>'); 
                return_table.cars_table_total_row.append('<td>0</td>'); 
            }*/
        }
            
        function del_cars_table_tr(p_tr){
            p_tr.nextAll().children('td:nth-child(2)').each(function(){
                $(this).text(parseInt($(this).text())-1);
            });
            p_tr.remove();
            self.cars_count--;
        }    
            
        this.spec_check_car_number = function(p_car_number){
            return true;
        };
        this.check_car_number = function(p_car_number){
            /*var find_result = self.spec_check_car_number(p_car_number);
            if (!find_result){
                return_table.add_carnumber_input.addClass('red_bckg_color');
                alert('На путях нет вагона с номером '+p_car_number+'!');
                return false;
            } else if(return_table.cars_table.find('tr td:contains("'+p_car_number+'")').length!==0) {
                return_table.add_carnumber_input.addClass('red_bckg_color');
                alert('Вагон '+p_car_number+' уже добавлен!');
                return false;
            } else{
                return_table.add_carnumber_input.removeClass('red_bckg_color').val('');
            }*/
            return true;
        };
        
        this.empty_table = function(){
            return_table.find('tbody').empty();
            tr_mas = [];
            self.cars_count = 0;
        };

        this.add_cars_in_table = function(p_id,p_car_number,p_weight,p_weight_date,p_weight_type,p_weight_speed,p_manual_input){
            self.cars_count++;
            
            var tr = $('<tr/>');
            
            tr.id = p_id;
            tr.car_number_input = $('<input>')
                .attr({'type':'text','maxlength':'8'})
                .addClass('text ui-widget-content ui-corner-all')
                .prop('disabled',true)
                .val(p_car_number);
        
            tr.car_number_input.on('keypress', function (e){
                // Разрешаем: backspace, delete, влево, вправо
                if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
                    return;
                }

                var chr = String.fromCharCode(e.charCode);

                if (chr == null) return;

                if (chr < '0' || chr > '9') {
                    return false;
                }
            }); 
            tr.car_number_input.on('keyup', function (e){
                if (check_car_number($(this).val()) && $(this).val() != '11111119'){                
                    $(this).addClass('true-car-number');
                    $(this).removeClass('red_bckg_color');
                } else{
                    $(this).removeClass('true-car-number');
                    $(this).addClass('red_bckg_color');
                }
                var l_car_number = $(this).val();
                
                if ($(this).hasClass('true-car-number')){
                    var l_count = 0;
                    tr_mas.forEach(function(item){
                        if (item.car_number_input.val()===l_car_number){
                            l_count++;
                        }
                    });
                    if (l_count>1){                
                        $(this).removeClass('true-car-number');
                        $(this).addClass('red_bckg_color');  
                    } else{
                        $(this).addClass('true-car-number');
                        $(this).removeClass('red_bckg_color');
                    }
                }
            });
            tr.car_number_input.triggerHandler('keyup');
            
        
            tr.weight_input = $('<input>')
                .attr({'type':'text','maxlength':'6'})
                .addClass('text ui-widget-content ui-corner-all')
                .prop('disabled',true)
                .val(p_weight)
                .on('keyup', function(){
                    $(this).val($(this).val().replace (/[^0-9,]/, ''));

                    var l_weight = parseFloat($(this).val().replace (/[,]/, '.'));
                    if ((l_weight>100 || l_weight<17)&&p_manual_input){
                        $(this).addClass('red_bckg_color');
                    } else {
                        $(this).removeClass('red_bckg_color');
                    }
                });
                                
            tr.comment_input = $('<input>')
                .attr({'type':'text','maxlength':'200'})
                .addClass('text ui-widget-content ui-corner-all');
            tr.check_input = $('<input>')
                .attr({'type':'checkbox','checked':'checked'});
            
			// add 14.01.2021 Checkbox для акта взвешивания
			tr.for_akt = $('<input>')
                .attr({'type':'checkbox'});
				
            tr.date_input = $('<input>')
                .attr({'type':'text','maxlength':'16'})
                .addClass('text ui-widget-content ui-corner-all')
                .css({'width':'11em'})
                .prop('disabled',true)
                .val(p_weight_date);
            init_date_time_input(tr.date_input);
            
            tr.speed_input = $('<input>')
                .attr({'type':'text','maxlength':'6'})
                .addClass('text ui-widget-content ui-corner-all')
                .css({'width':'4.5em'})
                .prop('disabled',true)
                .val(p_weight_speed)
                .on('keyup', function(){
                    $(this).val($(this).val().replace (/[^0-9,]/, ''));
                });
                
            tr.weight_type = $('<select>')
                .append('<option val="Динамика">Динамика</option>')
                .append('<option val="Статика">Статика</option>');
            tr.weight_type.val(p_weight_type);
            
            if (!p_manual_input) {
                tr.weight_type.prop('disabled',true);
            }
            
            tr.weight_type.on('change', function(){
                if ($(this).val()==='Статика'){
                    tr.speed_input.val('0');
                } 
            });
            
            if (p_manual_input) {
                tr.weight_input.addClass('required');
                tr.date_input.addClass('required');
                tr.speed_input.addClass('required');
            }    
                
            if (r_weigh_import_corr || p_manual_input){
                tr.car_number_input.prop('disabled',false);
                tr.weight_input.prop('disabled',false);
            }
            if (p_manual_input){
                tr.date_input.prop('disabled',false);
                tr.speed_input.prop('disabled',false);
            }

            tr.append($('<td>').append(tr.check_input));
            tr.append('<td>'+self.cars_count+'</td>');
            tr.append($('<td>').append(tr.car_number_input));
            tr.append($('<td>').append(tr.weight_input));
            tr.append($('<td>').append(tr.date_input));
            tr.append($('<td>').append(tr.weight_type));
            tr.append($('<td>').append(tr.speed_input));
			tr.append($('<td>').append(tr.for_akt)); // add 14.01.2021
            tr.append($('<td>').append(tr.comment_input));
            
            if (p_manual_input){
                tr.append(
                    $('<td>').append(
                        $('<div>',{class:'deleteImage deleteImage13px'}).on('click', function(){
                            del_cars_table_tr(tr/*$(this).parent().parent()*/);
                        })
                    )
                );
            } 


            tr.appendTo(return_table.cars_table);
            
            tr_mas.push(tr);
        };

        this.get_cars_in_table = function(){
            var l_result = '';
            tr_mas.forEach(function(item){
                if (item.car_number_input.hasClass('true-car-number')) {
                    var l_com = item.comment_input.val()==''?'_':item.comment_input.val();
                    var l_check = item.check_input.prop('checked')==true?'1':'0';
                    var l_car_number = item.car_number_input.val()==''?'_':item.car_number_input.val();
                    var l_weight = item.weight_input.val()==''?'_':item.weight_input.val();
                    var l_date = item.date_input.val()==''?'_':item.date_input.val();
                    var l_speed = item.speed_input.val()==''?'_':item.speed_input.val();
                    var l_weight_type = item.weight_type.val()==''?'_':item.weight_type.val();
					var l_for_akt = item.for_akt.prop('checked')==true?'1':'0'; // add 14.01.2021
					
                    l_result+=item.id+'|'+l_check+'|'+l_car_number+'|'+l_weight+'|'+l_com+'|'+l_date+'|'+l_speed+'|'+l_weight_type+'|'+l_for_akt+'$';
                }
            });
            return l_result;
        };
        
        this.get_cars_date_in_table = function(){
            var l_result = [];
            tr_mas.forEach(function(item){
                l_result.push(item.date_input.val()==''?'_':item.date_input.val());
            });
            return l_result;
        };
        
        this.check_open_period = function(){
            var l_result = '1';
            tr_mas.forEach(function(item){
                var l_tmp = check_open_period('2',item.date_input.val());
                if (l_tmp == '0'){
                    l_result = 0;
                }
            });
            return l_result;
        };
        
        this.get_flag_exist_empty_fields = function(p_manual_input){
            var l_result = true;
            tr_mas.forEach(function(item){
                if (item.weight_input.val()==''||(p_manual_input && (!item.car_number_input.hasClass('true-car-number')
                                                                    ||item.speed_input.val()==''
                                                                    ||item.date_input.val()==''
                                                                    ||item.date_input.hasClass('red_bckg_color')
                                                                    ||item.weight_input.hasClass('red_bckg_color')
                                                                    )
                                                 )
                    ) {
                    l_result = false;
                }
            }); 
            return l_result;
        };

        this.get_table = function(){
            return return_table;
        };
    };
    
    function load_weigh_import_ajax(p_train_id,p_general_com,p_cars){
        var res = 'done';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { train_id: p_train_id
                   ,general_com: p_general_com
                   ,cars: p_cars
                   ,ajax_action: 'load_car_scale_weights'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    start_loading_animation();
    
    var md_div = $('<div/>')
        .attr('title','Импорт взвешиваний')
        .appendTo('body'); // Присоединяем наше меню к body документа: 
      
        md_div.general_comment = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'300px'}});
        md_div.train = $('<select>',{css:{'width':'170px','text-align':'right'}});
        md_div.manual_input = $('<input>',{type:'checkbox'});
        md_div.train_date = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'9em'}}).attr('maxlength','16');
        md_div.train_speed = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'50px'}}).attr('maxlength','6');
        md_div.add_car_btn = $('<input>',{type:'button', class:'btnFind'}).val('Добавить вагон');
        
        md_div.train_date_div = $('<div>')
            .append($('<label>').text('Дата поезда'))
            .append(md_div.train_date);
        md_div.train_speed_div = $('<div>')
            .append($('<label>').text('Скорость поезда'))
            .append(md_div.train_speed); 
        md_div.add_car_div = $('<div>',{css:{'text-align':'left'}})
            .append(md_div.add_car_btn); 
    
        md_div.append(
            $('<div>',{css:{'display':'table'}}).append(
                $('<div>',{class:'attr',css:{'border':'none','width':'484px'}})
                    .append(
                        $('<div>')
                        .append($('<label>').text('Общий комментарий'))
                        .append(md_div.general_comment)
                    )
                    .append(
                        $('<div>')
                        .append($('<label>').text('Поезд'))
                        .append(md_div.train)
                    )
                    .append(
                        $('<div>',{css:{'text-align':'left'}})
                        .append($('<label>').text('Ручной ввод'))
                        .append(md_div.manual_input)
                    )
                    .append(
                        md_div.train_date_div
                    )
                    .append(
                        md_div.train_speed_div
                    )
                    .append(
                        md_div.add_car_div
                    )
            )    
        );
    
    init_date_time_input(md_div.train_date);
    md_div.train_speed.on('keyup', function(){
        $(this).val($(this).val().replace (/[^0-9,]/, ''));
    });
  
    var railcar_table = new railcar_table_for_weigh();
    md_div.append(railcar_table.get_table());
    
    md_div.manual_input.on('change', function(){
        if ($(this).prop('checked')) {
            md_div.train_date_div.show();
            md_div.train_speed_div.show(); 
            md_div.add_car_div.show();
            md_div.train.prop( "disabled", true );
            railcar_table.empty_table();
        }else{
            md_div.train_date_div.hide();
            md_div.train_speed_div.hide();
            md_div.add_car_div.hide();
            md_div.train.prop( "disabled", false );
            md_div.train.triggerHandler('change');
        }
    });
    
    var l_cars_from_scale=[];
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async:false,
        data: {ajax_action: 'get_car_scale_weights'},
        success: function (data) {
			//console.log(data);
            l_cars_from_scale = JSON.parse(data);
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
    
    var l_cars_from_scale_mas =[];
    var l_prev_id = 0;
    l_cars_from_scale.forEach(function(item) {
        var l_car = {id:item.ID,car_number:item.CAR_NUMBER
                    ,wag_number:item.WAG_NUMBER,date_w:item.DATE_W
                    ,weight:item.WEIGHT,speed:item.SPEED
                    ,napr_sys:item.NAPR_SYS
                    };
        
        if (l_prev_id!=item.TRAIN_ID){
            l_cars_from_scale_mas[item.TRAIN_ID] = {train_date:item.TRAIN_DATE,cars:[l_car]};
        } else{
			if (l_cars_from_scale_mas[item.TRAIN_ID] != undefined) { // add 30.09.2022
				l_cars_from_scale_mas[item.TRAIN_ID].cars.push(l_car);
			}
        }
        l_prev_id=item.TRAIN_ID;
    });
    
    l_cars_from_scale_mas.forEach(function(item,item_id){
        md_div.train.append('<option value="'+item_id+'">'+item.train_date+'</option>');
    });
    
    md_div.train.on('change',{p_cars:l_cars_from_scale_mas},function(e){
        var l_scale = e.data.p_cars[$(e.target).val()];
        
        /*$('#md_date_post').val(l_history.date_post);*/
        railcar_table.empty_table();
        if (l_scale != undefined) {
            l_scale.cars.forEach(function(item,i){
                railcar_table.add_cars_in_table(item.id,item.car_number,item.weight,item.date_w,'Динамика',item.speed,false);
            });
        }
    });
    
    md_div.add_car_btn.on('click', function(){
        railcar_table.add_cars_in_table(0,null,null,md_div.train_date.val(),'Динамика',md_div.train_speed.val(),true);
    });

    md_div.manual_input.triggerHandler('change');
    
    md_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        draggable: false,
        buttons:{
            'Загрузить':{
                text: "Загрузить",
                  id: "md_ok_btn",
               click: function(){
                    start_loading_animation();
                    var l_check_period = '1';
                    var l_dates = railcar_table.get_cars_date_in_table();
                    
                    l_dates.forEach(function(item){
                        var l_res = check_open_period('2',item);
                        if (l_res == '0') {
                            l_check_period = '0';
                        }
                    });
                   
                    if (l_check_period=='0') {
                        create_info_modal_dialog_new('Оповещение','Для даты взвешивания нет открытого периода! Загрузить взвешивания не возможно!');
                    }else{
                        if (railcar_table.get_flag_exist_empty_fields(md_div.manual_input.prop('checked'))){
                            var l_train_id = md_div.train.val(); 
                            if (md_div.manual_input.prop('checked')){l_train_id = null;}

                            var l_general_com = md_div.general_comment.val();
                            var l_cars = railcar_table.get_cars_in_table();
							
                            var l_ajax_result = load_weigh_import_ajax(l_train_id,l_general_com,l_cars);

                            if (l_ajax_result === 'done') {
                                md_div.train.children('option:selected').remove();
                                md_div.train.triggerHandler('change');

                                create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                            } else {
                                create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                            }
                        } else {
                            create_info_modal_dialog_new('Ошибка','Заполните все обязательные поля в таблице!');
                        }
                    }
                    stop_loading_animation();
                }   
            }, 
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
    
    stop_loading_animation();
}
function trallert(p_al) { alert(p_al); }
/*Результаты взвешиваний*/
function create_md_weight_result(p_clicked_li){
    function railcar_table_for_weigh(){
        var self = this;
        this.cars_table_total_row;
        this.cars_count = 0;
        this.cars_lenght= 0;
        
        var tr_mas = [];
        
        var return_table = $('<div>');
        return_table.append(
            '<table class="weigh_import_table_add cars_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th>Дата взвешивания</th>'+
                        '<th>Тип взвешивания</th>'+
                        '<th>Скорость взв-ия</th>'+
                        '<th>Вес с весов</th>'+
                        '<th>Вес</th>'+
						'<th>Для акта</th>'+
                        '<th>Комментарий взвешивания</th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'
        );

        return_table.cars_table = $('<table>',{class:'weigh_import_table_add cars_table'}).append($('<tbody>'));
        return_table.append(
            $('<div>',{class:'modalDialogContainer',css:{'display':'inline-block'}})  
            .append(return_table.cars_table)
        );
        return_table.cars_table_total_row = $('<tr>',{css:{'background':'#EBEBEB','font-weight':'bold'}});
        self.cars_table_total_row = return_table.cars_table_total_row;
        return_table.append(
            $('<table>',{class:'received_cars_table',css:{'margin-top':'-4px'}})
            .append(
                $('<tbody>').append(return_table.cars_table_total_row)
            )
        );

        function change_cars_table_total_tr(){
            
            /*return_table.cars_table_total_row.find('td').remove();
            if (self.cars_count!==0) {
                var sum_weight_net = 0;
                return_table.cars_table.find('tr td:nth-child(6)').each(function(){
                    sum_weight_net+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });
                var sum_weight_dep = 0;
                return_table.cars_table.find('tr td:nth-child(7)').each(function(){
                    sum_weight_dep+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });
                var sum_weight_gross = 0;
                return_table.cars_table.find('tr td:nth-child(8)').each(function(){
                    sum_weight_gross+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });
                var sum_car_length = 0;
                return_table.cars_table.find('tr td:nth-child(9)').each(function(){
                    sum_car_length+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });

                self.cars_lenght = Math.round(sum_car_length * 100)/100;

                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>Кол-во: '+ self.cars_count +'</td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>'+Math.round(sum_weight_net * 100)/100+'</td>');
                return_table.cars_table_total_row.append('<td>'+Math.round(sum_weight_dep * 100)/100+'</td>');
                return_table.cars_table_total_row.append('<td>'+ Math.round(sum_weight_gross * 100)/100 +'</td>');
                return_table.cars_table_total_row.append('<td>'+ Math.round(sum_car_length * 100)/100 +'</td>');
            }else{
                self.cars_lenght = 0;

                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>Кол-во: 0</td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>0</td>');
                return_table.cars_table_total_row.append('<td>0</td>');
                return_table.cars_table_total_row.append('<td>0</td>'); 
                return_table.cars_table_total_row.append('<td>0</td>'); 
            }*/
        }

        this.spec_check_car_number = function(p_car_number){
            return true;
        };
        this.check_car_number = function(p_car_number){
            /*var find_result = self.spec_check_car_number(p_car_number);
            if (!find_result){
                return_table.add_carnumber_input.addClass('red_bckg_color');
                alert('На путях нет вагона с номером '+p_car_number+'!');
                return false;
            } else if(return_table.cars_table.find('tr td:contains("'+p_car_number+'")').length!==0) {
                return_table.add_carnumber_input.addClass('red_bckg_color');
                alert('Вагон '+p_car_number+' уже добавлен!');
                return false;
            } else{
                return_table.add_carnumber_input.removeClass('red_bckg_color').val('');
            }*/
            return true;
        };
        
        this.empty_table = function(){
            return_table.find('tbody').empty();
            tr_mas = [];
            self.cars_count = 0;
        };
        /*p_carnumber может быть просто номер вагона: когда добавляем вагон на форме по кнопке
          или же список номеров вагонов разделенных "|": вызывается при открытии формы*/
		
        this.add_cars_in_table = function(p_id,p_train_id,p_weight_date,p_weight_type,p_weight_speed,p_weight,p_weight_cor,p_comment,p_prev_max_date_w,p_for_akt,p_pk_id,p_scale_type){
			//console.log('p_id='+p_id+' p_scale_type='+p_scale_type);
            self.cars_count++;
            var l_weight_car = $('<tr>').appendTo(return_table.cars_table);
            var tr = $('<tr/>');
            
            
			if(p_scale_type=='КОРП_1831'){
				l_weight_car.addClass('blue_row');
			}
            else{
				if(p_prev_max_date_w=='Y'){
					l_weight_car.addClass('yellow_row');
				}
			}
			if(p_scale_type=='КОРП_1881'){
                tr.addClass('blue_row');
			}
            else{
				if(p_prev_max_date_w=='Y'){
					tr.addClass('yellow_row');
				}
			}
			
            tr.id = p_id;
            tr.train_id = p_train_id;
            var l_for_akt_id;
			if (p_for_akt == 'Да'){
				l_for_akt_id = '1';
			}else if(p_for_akt == 'Нет'){
				l_for_akt_id = '0';
			}
            var l_comment = p_comment == null?'':p_comment
			l_weight_car.p_id = p_id;
			l_weight_car.p_train_id = p_train_id;
			l_weight_car.p_weight_date = p_weight_date;
			l_weight_car.p_weight_type = p_weight_type;
			l_weight_car.p_weight_speed = p_weight_speed;
			l_weight_car.p_weight = p_weight;
			l_weight_car.p_weight_cor = p_weight_cor;
			l_weight_car.p_comment = l_comment;
			l_weight_car.p_prev_max_date_w = p_prev_max_date_w;
			l_weight_car.p_for_akt = p_for_akt;
			l_weight_car.p_for_akt_id = l_for_akt_id;
			l_weight_car.p_pk_id = p_pk_id;
			l_weight_car.p_scale_type = p_scale_type;
			
			
			l_weight_car.weight_date = $('<td>').appendTo(l_weight_car).text(p_weight_date);
			l_weight_car.weight_type = $('<td>').appendTo(l_weight_car).text(p_weight_type);
			l_weight_car.weight_speed = $('<td>').appendTo(l_weight_car).text(p_weight_speed);
			l_weight_car.weight = $('<td>').appendTo(l_weight_car).text(p_weight);
			l_weight_car.weight_cor = $('<td>').appendTo(l_weight_car).text(p_weight_cor);
			l_weight_car.for_akt = $('<td>').appendTo(l_weight_car).text(p_for_akt);
			l_weight_car.comment = $('<td>').appendTo(l_weight_car).text(l_comment);
			if (r_weighing_dispatcher) {
				l_weight_car.weight_date.addClass('reference-text');
				l_weight_car.weight_date.on('click', function(){change_weight_car(l_weight_car)});
			}
			
            //tr.append('<td>'+p_weight_date+'</td>');
            //tr.append('<td>'+p_weight_type+'</td>');
            //tr.append('<td>'+p_weight_speed+'</td>');
            //tr.append('<td>'+p_weight+'</td>');
            //tr.append('<td>'+p_weight_cor+'</td>');
			//tr.append('<td>'+p_for_akt+'</td>');
            //tr.append('<td>'+l_comment+'</td>');
			
            //tr.appendTo(return_table.cars_table);
            //tr_mas.push(tr);
        };
		// add 01.02.2021 Редактирование "Результаты взвешивания"
		function change_weight_car(p_weight_car){
			
			function save_change_weight_car (){
				var l_param = {};
					var x_id = md_rep_div.weight_date.attr('id_weight_car');
					if (typeof x_id !== typeof undefined && x_id !== false) {
						l_param.id =x_id;
					}
					else {
						l_param.id = '0';
					}
					
					l_param.p_pk_id = md_rep_div.weight_date.attr('p_pk_id');
					l_param.weight_date = md_rep_div.weight_date.val();
					l_param.for_akt = md_rep_div.for_akt.val();
					l_param.train_id = md_rep_div.train_id;
					l_param.comment = md_rep_div.comment.val();
					
					//console.log(JSON.stringify(l_param));
					var res = null;
					$.ajax({
						url: '../data.php',
						type: 'POST',
						dataType: "text",
						async:false,
						data: { add_data: JSON.stringify(l_param)
							   ,ajax_action: 'save_change_weight_car'},
						success: function (data) {
							res = data;
							//console.log(res);
						},
						error: function (m1,m2) {window.alert(m1+m2);}
					});
					return res; 
			}
			
			var l_weight_car = p_weight_car;
			//console.log(l_weight_car);
			
			var md_rep_div = $('<div/>')
				.attr('title','Редактирование "Результаты взвешивания"')
				.addClass('md-lvl-1')
				.appendTo('body'); // Присоединяем наше меню к body документа: 
			
			md_rep_div.train_id = l_weight_car.p_train_id;
			md_rep_div.weight_date = $('<input>',{type:'text',class:'text ui-widget-content ui-corner-all',css:{'width':'12em'}}).val(l_weight_car.p_weight_date);
			md_rep_div.weight_date.attr('id_weight_car',l_weight_car.p_id);
			md_rep_div.weight_date.attr('p_pk_id',l_weight_car.p_pk_id);
			md_rep_div.weight_date.prop('disabled', true);
			
			md_rep_div.weight_type = $('<input>',{type:'text',class:'text ui-widget-content ui-corner-all',css:{'width':'12em'}}).val(l_weight_car.p_weight_type);
			md_rep_div.weight_type.prop('disabled', true);
			
			md_rep_div.weight_speed = $('<input>',{type:'text',class:'text ui-widget-content ui-corner-all',css:{'width':'12em'}}).val(l_weight_car.p_weight_speed);
			md_rep_div.weight_speed.prop('disabled', true);
			
			md_rep_div.weight = $('<input>',{type:'text',class:'text ui-widget-content ui-corner-all',css:{'width':'12em'}}).val(l_weight_car.p_weight);
			md_rep_div.weight.prop('disabled', true);
			
			md_rep_div.weight_cor = $('<input>',{type:'text',class:'text ui-widget-content ui-corner-all',css:{'width':'12em'}}).val(l_weight_car.p_weight_cor);
			md_rep_div.weight_cor.prop('disabled', true);
			
			md_rep_div.for_akt = $('<select>',{'requir':'N'});
			var l_option = $('<option>').text('Да').val('1');
				md_rep_div.for_akt.append(l_option);
				l_option = $('<option>').text('Нет').val('0');
				md_rep_div.for_akt.append(l_option);
			
			md_rep_div.for_akt.val(l_weight_car.p_for_akt_id);
			//md_rep_div.for_akt.prop('disabled', true);
			
			md_rep_div.comment = $('<input>',{type:'text',class:'text ui-widget-content ui-corner-all',css:{'width':'12em'}}).val(l_weight_car.p_comment);
			//md_rep_div.comment.prop('disabled', true);
			
			var l_div_weight_date = $('<div>')
				.addClass('car_scale-window-attr-item helper-clearfix')
				.append($('<label>',{text:'Дата взвешивания ',class:'car_scale-window-attr-item-text car_scale-window-attr-item-text-left'}))
				.append(md_rep_div.weight_date); 
			md_rep_div.append(l_div_weight_date);
			var l_div_weight_type = $('<div>')
				.addClass('car_scale-window-attr-item helper-clearfix')
				.append($('<label>',{text:'Тип взвешивания ',class:'car_scale-window-attr-item-text car_scale-window-attr-item-text-left'}))
				.append(md_rep_div.weight_type); 
			md_rep_div.append(l_div_weight_type);
			var l_div_weight_speed = $('<div>')
				.addClass('car_scale-window-attr-item helper-clearfix')
				.append($('<label>',{text:'Скорость взвешивания ',class:'car_scale-window-attr-item-text car_scale-window-attr-item-text-left'}))
				.append(md_rep_div.weight_speed); 
			md_rep_div.append(l_div_weight_speed);
			//
			var l_div_weight = $('<div>')
				.addClass('car_scale-window-attr-item helper-clearfix')
				.append($('<label>',{text:'Вес с весов ',class:'car_scale-window-attr-item-text car_scale-window-attr-item-text-left'}))
				.append(md_rep_div.weight); 
			md_rep_div.append(l_div_weight);
			
			var l_div_weight_cor = $('<div>')
				.addClass('car_scale-window-attr-item helper-clearfix')
				.append($('<label>',{text:'Вес ',class:'car_scale-window-attr-item-text car_scale-window-attr-item-text-left'}))
				.append(md_rep_div.weight_cor); 
			md_rep_div.append(l_div_weight_cor);
			var l_div_for_akt = $('<div>')
				.addClass('car_scale-window-attr-item helper-clearfix')
				.append($('<label>',{text:'Для акта ',class:'car_scale-window-attr-item-text car_scale-window-attr-item-text-left'}))
				.append(md_rep_div.for_akt); 
			md_rep_div.append(l_div_for_akt);
			var l_div_comment = $('<div>')
				.addClass('car_scale-window-attr-item helper-clearfix')
				.append($('<label>',{text:'Комментарий ',class:'car_scale-window-attr-item-text car_scale-window-attr-item-text-left'}))
				.append(md_rep_div.comment); 
			md_rep_div.append(l_div_comment);
			
			
			md_rep_div.dialog({
				resizable:false,
				modal:true,
				width: 'auto',
				position: { my: 'top', at: 'top+150' },
				draggable: false,
				buttons:{
					'Сохранить': function(){
						var f_res = save_change_weight_car();
						//console.log(f_res);
						//return;
						var f_res_mas = f_res.split('$');
						if (f_res_mas[0]=='done') {
							var l_mes = '';
							l_mes = 'Результаты обновлены!';
							$(this).dialog( "close" );
							create_info_modal_dialog_new('Оповещение',l_mes);
							
							l_refresh_btn.triggerHandler('click');
						}else {
							create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой! Причина:'+f_res_mas[1]);
							$(this).dialog( "close" );
						}
					},
					'Закрыть': function(){
						$(this).dialog( "close" );
					}
				},
				close: function() {
					$(this).remove();
				}
			});
		};
		
        this.get_cars_in_table = function(){
            var l_result = '';
            tr_mas.forEach(function(item){
                var l_com = item.comment_input.val()==''?'_':item.comment_input.val();
                var l_check = item.check_input.prop('checked')==true?'1':'0';
                var l_car_number = item.car_number_input.val()==''?'_':item.car_number_input.val();
                var l_weight = item.weight_input.val()==''?'_':item.weight_input.val();
                
                l_result+=item.id+'|'+l_check+'|'+l_car_number+'|'+l_weight+'|'+l_com+'$';
            });
            return l_result;
        };

        this.get_table = function(){
            return return_table;
        };
    };
	
    function add_report_window (){
		function run_report_disl_007(p_from_date,p_to_date,p_owner){
			var win = window.open('xx_etw_disl_007/xx_etw_disl_007.php?'+
								  'p_from_date='+p_from_date+'&'+
								  'p_to_date='+p_to_date+'&'+
								  'p_owner='+p_owner
								 ,'_blank');
		}
		function create_array_from_save (){
			var p_from_date=md_rep_div.start_date_from.val();
			var p_to_date=md_rep_div.start_date_to.val();
			var p_owner=md_rep_div.org_name.val();
			//console.log(p_from_date+" "+p_to_date+" "+p_owner);
			run_report_disl_007(p_from_date,p_to_date,p_owner);
		}
		var md_rep_div = $('<div/>')
        .attr('title','Отчет')
		.addClass('md-lvl-1')
        .appendTo('body'); // Присоединяем наше меню к body документа: 
		// Организация
		md_rep_div.org_name = $('<select>',{'requir':'N'});
		var l_div_org_name = $('<div>')
        //.addClass('car_scale-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Организация:'
			//,class:'car_scale-window-attr-item-text car_scale-window-attr-item-text-left'
			}))
        .append(md_rep_div.org_name);
		md_rep_div.append(l_div_org_name);
		
		var l_option = $('<option>').text('-Выберите значение-').val('none');
            md_rep_div.org_name.append(l_option);
			l_option = $('<option>').text('МТФ').val('МТФ');
            md_rep_div.org_name.append(l_option);
			l_option = $('<option>').text('МД').val('МД');
            md_rep_div.org_name.append(l_option);
			l_option = $('<option>').text('ЖДЦ').val('ЖДЦ');
            md_rep_div.org_name.append(l_option);
			l_option = $('<option>').text('Вторчермет').val('Вторчермет');
            md_rep_div.org_name.append(l_option);
			l_option = $('<option>').text('Регионсбыт').val('Регионсбыт');
            md_rep_div.org_name.append(l_option);
			l_option = $('<option>').text('ООО Техногрупп').val('ООО Техногрупп');
            md_rep_div.org_name.append(l_option);
			l_option = $('<option>').text('СУ 2').val('СУ 2');
            md_rep_div.org_name.append(l_option);
			l_option = $('<option>').text('Уралкалий').val('Уралкалий');
            md_rep_div.org_name.append(l_option);
			l_option = $('<option>').text('УВМ Пермь').val('УВМ Пермь'); // add 30.11.2023 BekmansurovRR
            md_rep_div.org_name.append(l_option);
			

		//md_rep_div.org_name.val('none');
		// Период
		var l_date = get_server_current_time();
		var l_date_from = add_day_to_date_trunc(l_date,-1);
		var l_date_to = add_date_set_hh_mm(l_date,1,23,59);
		
		md_rep_div.start_date_from = $('<input>',{type:'text','requir':'Y',class:'text ui-widget-content ui-corner-all required'}).attr('size', '15').val(l_date_from);
		var l_div_start_date = $('<div>')
			.addClass('car_scale-window-attr-item helper-clearfix')
			.append($('<label>',{text:'Период с ',class:'car_scale-window-attr-item-text car_scale-window-attr-item-text-left'}))
			.append(md_rep_div.start_date_from); 
		md_rep_div.append(l_div_start_date);
		init_date_time_input(md_rep_div.start_date_from);
		md_rep_div.start_date_to = $('<input>',{type:'text','requir':'Y',class:'text ui-widget-content ui-corner-all required'}).attr('size', '15').val(l_date_to);
		var l_div_end_date = $('<div>')
			.addClass('car_scale-window-attr-item helper-clearfix')
			.append($('<label>',{text:'Период по ',class:'car_scale-window-attr-item-text car_scale-window-attr-item-text-left'}))
			.append(md_rep_div.start_date_to); 
		md_rep_div.append(l_div_end_date);
		init_date_time_input(md_rep_div.start_date_to);
		
		
		md_rep_div.dialog({
			resizable:false,
			modal:true,
			width: 'auto',
			position: { my: 'top', at: 'top+150' },
			draggable: false,
			buttons:{
				'Сформировать': function(){
					if (md_rep_div.start_date_from.val() == ''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Период с"');
						return false;
					}
					if (md_rep_div.start_date_to.val() == ''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Период по"');
						return false;
					}
					var l_params_json = create_array_from_save();
					//console.log(JSON.stringify(l_params_json));
					$(this).dialog( "close" );
					return;
				},
				'Закрыть': function(){
					$(this).dialog( "close" );
				}
			},
			close: function() {
				$(this).remove();
			}
		});
	}
    $('.context-menu').remove();
    
    //var l_car_number = p_clicked_li.attr('data-id');
    
    var md_div = $('<div/>')
        .attr('title','Результаты взвешиваний вагона')
        .appendTo('body'); // Присоединяем наше меню к body документа: 
    
    var l_car_input = $('<input>',{type:'text',class:'text ui-widget-content ui-corner-all',css:{'width':'5em'}});
    var l_refresh_btn = $('<button>',{class:'button',css:{'margin-left':'1em'}}).append($('<span>',{class:'button-text button-text-size-2'}).text('Обновить'));
    var l_refresh_railcar_div = $('<div>',{class:'border',css:{'display':'table'}})
            .append(
                $('<div>',{css:{'float':'left'}})
                    .append($('<span>').text('Установить вагон: '))
                    .append(l_car_input)
                    .append(l_refresh_btn)
            );
    
    md_div.append(l_refresh_railcar_div);
    
    var railcar_table = new railcar_table_for_weigh();
    md_div.append(railcar_table.get_table());
    
    l_refresh_btn.on('click', function(){
        railcar_table.empty_table();
        
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: {car_number:l_car_input.val()
                  ,ajax_action: 'get_car_scale_weights_add'},
            success: function (data) {
                var l_cars_from_scale = JSON.parse(data);
                l_cars_from_scale.forEach(function(item){
                    railcar_table.add_cars_in_table(item.ID,item.TRAIN_ID,item.DATE_W,/*'Динамика'*/item.WEIGHING_TYPE,item.SPEED,item.WEIGHT,item.WEIGHT_COR,item.DESCR,item.PREV_MAX_DATE_W,item.FOR_AKT,item.PK_ID,item.SCALE_TYPE);
                });
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        }); 
    });
    
    /*Если вызываем с параметром, значит вызываем по клику из дерева*/
    if (p_clicked_li !== undefined) {
        l_car_input.val(p_clicked_li.attr('data-id'));
        l_refresh_btn.triggerHandler('click');
        //l_refresh_railcar_div.hide();
        l_car_input.prop('disabled', true);
        l_refresh_btn.hide();
    } else {
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { ajax_action: 'get_all_cars'},
            success: function (data) {
                var l_cars_json = JSON.parse(data);
                var l_cars = [];
                l_cars_json.forEach(function (item){
                    l_cars.push(item.ID);
                });
                l_car_input.autocomplete({source: l_cars,minLength: 2,menuMaxHeight: '50em',menuWidth: 80});
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        
        l_car_input.on('keyup', function (e){        
            if (check_car_number($(this).val())){                
                $(this).addClass('true-car-number');
                l_refresh_btn.prop('disabled', false);
            } else{
                $(this).removeClass('true-car-number');
                l_refresh_btn.prop('disabled', true);
            }
        });
        l_refresh_btn.prop('disabled', true);
    }
    
    md_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        draggable: false,
        buttons:{
           /* 'Загрузить':{
                text: "Загрузить",
                  id: "md_ok_btn",
               click: function(){
                    
                }   
            }, */
			'Отчет в Excel': function(){
                add_report_window();
            },
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
}
/*Переместить контейнера*/
function create_md_move_cont(p_clicked_li) {
    $('.context-menu').remove();
    function create_md_move_cont_ajax(p_conts,p_place_type,p_place_id,p_oper_date,p_comment){
        var res='';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { conts: p_conts
                   ,place_type: p_place_type
                   ,place_id: p_place_id
                   ,oper_date: p_oper_date
                   ,comment: p_comment
                   ,ajax_action: 'move_conts'},
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    function fill_select_with_places(p_select,p_station_id,p_area_type){
        p_select.empty();
        
        p_select.append($('<option>'));
        
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {station_id: p_station_id 
                    ,area_type: p_area_type
                    ,ajax_action: 'get_places_for_cont'
                    },
            success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').attr('data-id',item.ID).attr('data-type',item.TYPE).text(item.NAME).val(item.ID);
                        p_select.append(l_option);
                    }); 
                }
        });
    }
    function disable_save_btn(){
        if (md_div.operation_date.hasClass('red_bckg_color')||md_div.operation_date.val()==''||md_div.new_place.val()==''){
            $('#md_ok_btn').prop( "disabled", true );
        }else{
            $('#md_ok_btn').prop( "disabled", false );
        }
    }   
    
    var l_clicked_elem_type = p_clicked_li.attr('data-type');
    
    var md_div = $('<div/>')
        .attr('title','Перемещение контейнеров')
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append('<div style="display: table;">'+
                '<div class="attr" style="width:285px; height: 45px;">'+
                    '<div>'+
                        '<label>Станция операции:</label>'+
                        '<input disabled type="text" size="13" class="text ui-widget-content ui-corner-all" value="'+user_station_name+'"></input>'+
                    '</div>'+
                '</div>'+
                '<div class="attr" style="margin-left:14px; text-align:right; float:right">'+
                    '<input disabled type="text" size="14" class="text ui-widget-content ui-corner-all" value="'+get_server_current_time()+'"></input><br>'+
                    '<input disabled type="text" size="20" class="text ui-widget-content ui-corner-all" style="margin-top:5px;" value="'+user_name+'"></input>'+
                '</div>'+
            '</div>'
        );

    md_div.operation_date = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
    md_div.comment = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'350px'}});
    md_div.new_place_type = $('<select>');
    md_div.new_place_station = $('<select>');
    md_div.new_place = $('<select>',{class:'required'}); //get_select_with_places($('#currentCarstree li[data-type="station"]').attr('data-id'));
    
    md_div.new_place_station.append($('<option>').val('2').text('Водораздельная'));
    md_div.new_place_station.append($('<option>').val('3').text('Новая'));
    
    md_div.new_place_station.val($('#currentCarstree li[data-type="station"]').attr('data-id'));
    
    md_div.new_place_type.append($('<option>').val('area').text('Площадка'));
    md_div.new_place_type.append($('<option>').val('railcar').text('Вагон'));
    
    md_div
        .append(
            $('<div>',{css:{'display':'table'}}).append(
                $('<div>',{class:'attr',css:{'border':'none','width':'484px'}})
                    .append(
                        $('<div>')
                            .append($('<label>').text('Дата и время операции (местное)'))
                            .append(md_div.operation_date)
                    )
                    .append(
                        $('<div>')
                        .append($('<label>').text('Комментарий'))
                        .append(md_div.comment)
                    )
            )    
        )
        .append(
            $('<div>',{css:{'display':'table'}}).append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                    .append($('<div>',{class:'header',css:{'width':'180px'}}).text('Место назначения'))
                    .append(
                        $('<div>',{css:{'display':'inline-table'}}).append(
                            $('<div>',{class:'attr',css:{'border':'none','width':'470px','text-align':'left'}}).append(
                                $('<div>')
                                .append($('<div>',{css:{'text-align':'left'}}).append(md_div.new_place_type))
                                .append($('<div>',{css:{'text-align':'left','margin-top':'5px'}}).append(md_div.new_place_station))
                                .append($('<div>',{css:{'text-align':'left','margin-top':'5px'}}).append(md_div.new_place))
                            )
                        )
                    )
            )
        );
    
    md_div.new_place_type.select(function(){
        fill_select_with_places(md_div.new_place,md_div.new_place_station.val(),md_div.new_place_type.val());
        md_div.new_place.combobox('clear');
        disable_save_btn();
        
        if (md_div.new_place_type.val()=='area'){
            md_div.new_place_station.parent().show();
        }else{
            md_div.new_place_station.parent().hide();
        }
    });
    md_div.new_place_station.select(function(){
        fill_select_with_places(md_div.new_place,md_div.new_place_station.val(),md_div.new_place_type.val());
        md_div.new_place.combobox('clear');
    });
    
    fill_select_with_places(md_div.new_place,md_div.new_place_station.val(),md_div.new_place_type.val());
    
    var l_compare_date = get_server_current_time();
    var l_compare_date_from = add_day_to_date(l_compare_date,-30);
    var l_compare_date_to = add_day_to_date(l_compare_date,1);
    
    init_date_time_input_btw(md_div.operation_date,l_compare_date_from,l_compare_date_to);
    
    //init_date_time_input(md_div.operation_date);
    md_div.new_place_type.combobox();
    md_div.new_place_station.combobox();
    md_div.new_place.combobox({menuMaxHeight: '30em',menuWidth:'210'});
    
    
    var cont_table = new cont_table_const();
    md_div.append(cont_table.get_table());
    
    var l_conts = '';
    var l_conts_mas = [];
    if (l_clicked_elem_type === 'railcar'){
        var l_car_number = p_clicked_li.attr('data-id');
        l_conts_mas = get_car_containers(l_car_number);
        
        
        l_conts_mas.forEach(function(cont){
            l_conts += cont.CONT_NUMBER+'|';
        });
    } else if (l_clicked_elem_type === 'cont'){
        l_conts_mas = get_selected_objects();
        l_conts_mas.forEach(function(cont){
            l_conts += cont.obj_number+'|';
        });
    };
    cont_table.add_in_table(l_conts,false);
    
    md_div.operation_date.on('blur',function(){disable_save_btn();});
    md_div.new_place.select(function(){
        disable_save_btn();
    });
    
    md_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Принять':{
                text: "Переместить",
                  id: "md_ok_btn",
               click: function(){
                    var l_conts_in_table = cont_table.get_cont_in_table();
                    var l_conts_in_table_str = l_conts_in_table.join('|');
                    var l_res = create_md_move_cont_ajax(l_conts_in_table_str,md_div.new_place_type.val(),md_div.new_place.val(),md_div.operation_date.val(),md_div.comment.val());
                    if (l_res=='done'){
                        if (md_div.new_place_type.val()==='area'){
                            if (l_clicked_elem_type === 'railcar' && md_div.new_place_station.val()==$('#currentCarstree li[data-type="station"]').attr('data-id')){
                                //Выбираем все элементы li с заданными аттрибутами внутри ul с заданным id и берем потомок ul
                                var newParent = $('ul#cur_station li[data-id='+md_div.new_place.val()+'][data-type='+md_div.new_place_type.val()+']');
                                var newParentCont = newParent.children('ul');
                                if (newParent.hasClass('tree_ExpandLeaf')) {
                                        newParent.removeClass('tree_ExpandLeaf');
                                        newParent.addClass('tree_ExpandOpen');
                                }
                                l_conts_in_table.forEach(function(cont_number) {
                                    var li = $('<li/>');
                                    li.attr('data-id',cont_number);
                                    li.attr('data-type','cont');
                                    li.addClass('tree_Node tree_ExpandLeaf');

                                    li.append('<div class="tree_Expand"></div><div class="tree_Content">'+cont_number+'</div>');
                                    li.appendTo(newParentCont);
                                });
                            }else if (l_clicked_elem_type === 'cont'){
                                if (md_div.new_place_station.val()==$('#currentCarstree li[data-type="station"]').attr('data-id')){
                                    var newParent = $('ul#cur_station li[data-id='+md_div.new_place.val()+'][data-type=area]');
                                    var newParentCont = newParent.children('ul');
                                    if (newParent.hasClass('tree_ExpandLeaf')) {
                                            newParent.removeClass('tree_ExpandLeaf');
                                            newParent.addClass('tree_ExpandOpen');
                                    }
                                    l_conts_in_table.forEach(function(cont_number) {
                                        $('li[data-id="'+cont_number+'"][data-type="cont"]').detach().appendTo(newParentCont);
                                    });
                                }else{
                                    l_conts_in_table.forEach(function(cont_number) {
                                        $('li[data-id="'+cont_number+'"][data-type="cont"]').remove();
                                    });
                                }  
                            }
                        }else if (md_div.new_place_type.val()==='railcar'){
                            if (l_clicked_elem_type === 'cont'){
                                l_conts_in_table.forEach(function(cont_number) {
                                    $('li[data-id="'+cont_number+'"][data-type="cont"]').remove();
                                }); 
                            }
                        }
                        change_cont_count();
                        $('.tree_selected').removeClass('tree_selected');
                        clear_add_info();
                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                    }else{
                        create_info_modal_dialog_new('Предупреждение','Процедура завершилась с ошибкой!!!')
                    }
                    $(this).dialog( "close" );  
                }   
            }, 
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
    
    $('#md_ok_btn').prop( "disabled", true );
}
/*
	Создание пробы и результата в OeBS
*/
function create_md_export_samples(){
	//alert('create_md_export_samples');
	
	function fill_loadind_type_for_select (p_select){
		p_select.empty();
		var l_option = $('<option>').text('').val('');
		p_select.append(l_option);
		$.ajax({
			url: 'data.php',
			type: 'POST',
			dataType: "text",
			async:false,
			data: { ajax_action: 'get_loadind_type_oebs_list'
				  },
			success: function (data) {
				//console.log(data);
				var records = JSON.parse(data);
					$.each(records, function( i, item ) {
                    var l_option = $('<option>').text(item.TYPE_NAME).val(item.TYPE_CODE);
						p_select.append(l_option);
                    }); 
				},
				error: function (m1,m2) {window.alert(m1+m2);}
			});
	}
	 
	function fill_loadind_status_for_select (p_select){
		p_select.empty();
		
		$.ajax({
			url: 'data.php',
			type: 'POST',
			dataType: "text",
			async:false,
			data: { ajax_action: 'get_loadind_status_oebs_list'
				  },
			success: function (data) {
				//console.log(data);
				var records = JSON.parse(data);
					$.each(records, function( i, item ) {
                    var l_option = $('<option>').text(item.STATUS_NAME).val(item.ID);
						p_select.append(l_option);
                    }); 
				},
				error: function (m1,m2) {window.alert(m1+m2);}
			});
	}
	function fill_product_for_freight (p_select, p_freight){
			p_select.empty();
			var v_params = {};
					v_params.freight = p_freight;
			//console.log(JSON.stringify(v_params));
			
			var l_data=[];
			$.ajax({
				url: 'data.php',
				type: 'POST',
				dataType: "text",
				async:false,
				data: { add_data: JSON.stringify(v_params)
					   ,ajax_action: 'get_product_for_freight'
					  },
				success: function (data) {
					//console.log(data);
					var records = JSON.parse(data);
					$.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.NAME).val(item.CODE);
                        p_select.append(l_option);
                    }); 
				},
				error: function (m1,m2) {window.alert(m1+m2);}
			});
		}
	function table_for_weigh_from_shop_samples(){
        var self = this;
        var ms_main = [];
		var consCollumn = 9;
        
        var return_table = $('<div>');
		var tr = $('<tr>');
		var table_samples = $('<table>');
			table_samples.addClass('table_for_weigh_from_shop_samples cars_table');
			table_samples.tsbody = $('<tbody>').appendTo(table_samples);
			
			
		return_table.append(table_samples);
        return_table.cars_table = $('<table>',{class:'table_for_weigh_from_shop_samples cars_table'}).append($('<tbody>'));
        function get_sample_tbl_header (p_params){
			//console.log(JSON.stringify(p_params));
			var l_data=[];
			$.ajax({
				url: 'data.php',
				type: 'POST',
				dataType: "text",
				async:false,
				data: { add_data: JSON.stringify(p_params)
					   ,ajax_action: 'get_sample_tbl_header'
					  },
				success: function (data) {
					//console.log(data);
					l_data = JSON.parse(data);
				},
				error: function (m1,m2) {window.alert(m1+m2);}
			});
			return l_data;
		}
		
		function get_disl_samples_info (p_params){
			var l_data=[];
			
			$.ajax({
				url: 'data.php',
				type: 'POST',
				dataType: "text",
				async:false,
				data: { add_data: JSON.stringify(p_params)
					   ,ajax_action: 'get_disl_samples_info'
					  },
				success: function (data) {
					//console.log(data);
					l_data = JSON.parse(data);
				},
				error: function (m1,m2) {window.alert(m1+m2);}
			});
			return l_data;
		}
		// Загружаем таблицу
		this.load_table = function(p_product, p_item_code_oebs){
			function getObjForHeader (p_array, p_value,p_car_overload){
				//console.log(p_array);
				var objHeader;
					
				$.each(p_array, function( i, item ) {
					
					//console.log('item ='+item.DATA_TYPE);
					var dataType = item.DATA_TYPE;
					
					objHeader = $('<input>',{'type':'input',css:{'width':'80px'},class:item.REQUIRED_T==='Y'?'required':''});
					if (p_car_overload === 'Y'){
						$(objHeader).addClass('CarOverload');
						$(objHeader).attr ("title","Вагон перегружен");
						
					}
					
					objHeader.val(p_value);
					if (dataType === 'NUMBER'){
						if (item.DISABLED ==='Y'){
							objHeader.prop( "disabled", true );
						}
						objHeader.attr ("placeholder",item.MIN_VALUE_NUM+' - '+item.MAX_VALUE_NUM);
						objHeader.on('input', function() {
							if (this.value !=='' && this.value!== null){
								const value = parseInt(this.value);
								if (!isNumber(value) || !(value >= parseInt(item.MIN_VALUE_NUM) && value <= parseInt(item.MAX_VALUE_NUM))) {
									this.value = '';
									create_info_modal_dialog_new('Ошибка','Недопустимое значение! Разрешен ввод чисел в диапазоне от '+item.MIN_VALUE_NUM+' до '+item.MAX_VALUE_NUM);
								}
							}
								
						});
					}
					else if (dataType === 'SET_VALUES'){
						objHeader = $('<select>');
						var samplesMS = JSON.parse(item.QC_TEST_VALUES);
							//console.log('obj.length =' + Object.keys(samplesMS).length);
							//console.log(samplesMS);
							
							if (Object.keys(samplesMS).length >0){
								var entryValues = 0;
								$.each(samplesMS, function( j, jItem ) {
									if (jItem.value_char === p_value) {
										entryValues ++;
									}
								});
								objHeader = $('<select>',{class:item.REQUIRED_T==='Y'?'required':'nop'});
								var options = $('<option>').attr("value", "").text("");
								objHeader.append(options);
								if (entryValues ===0 && p_value !==''){
									options = $('<option>').attr("value", "").text(p_value);
									options.attr('selected', 'selected');
									objHeader.append(options);
								}
								$.each(samplesMS, function( j, jItem ) {
									//options = $('<option>').attr("value", jItem.test_value_id.toString());
									options = $('<option>').attr("value", jItem.value_char);
									options.text(jItem.value_char);
									if (jItem.value_char === p_value){
										options.attr('selected', 'selected');
									}
									objHeader.append(options);
								});
								
							}
					}
					
				});
				
				return objHeader;
			}
			var table_h=[]; var dataInfo=[]; var samplesMS=[];
				return_table.find('tbody').empty();
				ms_main = [];
				var v_params = {};
					v_params.product = p_product;
					v_params.item_code_oebs = p_item_code_oebs;
					v_params.p_date_from = md_div.date_from.val();
					v_params.p_date_to = md_div.date_to.val();
					v_params.p_type = md_div.type.val();
					v_params.p_batch_num = md_div.batch_num.val();
					v_params.p_status = md_div.status.val();
					
				//console.log('v_params='+JSON.stringify(v_params));
				// Возвращаем шапку таблицы
				table_h = get_sample_tbl_header(v_params);
				dataInfo = get_disl_samples_info(v_params);
				
				
				for (var ii = 0; ii < 2; ii++) {
					// Первая строка шапки таблицы
					if (ii == 0){
						table_samples.tr = $('<tr>').appendTo(table_samples.tsbody);
							table_samples.tr.append($('<td>').text(''));
							table_samples.tr.append($('<td>').text('№'));
							table_samples.tr.append($('<td>').text('Груз'));
							table_samples.tr.append($('<td>').text('Груз в OEBS'));
							table_samples.tr.append($('<td>').text('Номер задания в OEBS'));
							table_samples.tr.append($('<td>').text('Постановка (местное)'));
							table_samples.tr.append($('<td>').text('Вагон / платформа'));
							table_samples.tr.append($('<td>').text('Контейнер'));
							table_samples.tr.append($('<td>').text('Партия'));
							table_samples.tr.append($('<td>').text('Номер пробы'));
					} else{
						// Вторая строка шапки таблицы
						table_samples.tr = $('<tr>').appendTo(table_samples.tsbody);
							table_samples.tr.append($('<td>').text(''));
							table_samples.tr.append($('<td>').text(''));
							table_samples.tr.append($('<td>').text(''));
							table_samples.tr.append($('<td>').text(''));
							table_samples.tr.append($('<td>').text(''));
							table_samples.tr.append($('<td>').text(''));
							table_samples.tr.append($('<td>').text(''));
							table_samples.tr.append($('<td>').text(''));
							table_samples.tr.append($('<td>').text(''));
							table_samples.tr.append($('<td>').text(''));
					}
						$.each(table_h, function( i, item ) {
							var sampleTitle = {}
							sampleTitle.index = i;
							sampleTitle.SAMPLE_CODE = item.SAMPLE_CODE;
							sampleTitle.VALUE = '';
							if (ii == 0){
								// Выводим столбцы спецификации (Название)
								table_samples.tr.append($('<td>').text(item.TITLE));
								// Формируем массив набора значений для каждого ОГП
								
							}
							else {
								// Выводим столбцы спецификации (Код)
								table_samples.tr.append($('<td>').text(item.SAMPLE_CODE));
							}
							
						});
				}
				
				$.each(dataInfo, function( i, item ) {
					
					table_samples.tr = $('<tr>').appendTo(table_samples.tsbody);
					table_samples.tr.samplesOGP = [];
					
					table_samples.tr.checkbox = $('<input>',{'type':'checkbox'});
					
					table_samples.tr.NUM =(i+1);
					table_samples.tr.SHOP_INFO_ID = item.SHOP_INFO_ID;
					table_samples.tr.LOT_NUMBER = item.LOT_NUMBER;
					table_samples.tr.CAR_NUMBER = item.CAR_NUMBER;
					table_samples.tr.CONT_NUMBER = item.CONT_NUMBER;
					table_samples.tr.BATCH_ID = item.BATCH_ID;
					table_samples.tr.BATCH_NO = item.BATCH_NO;
					table_samples.tr.FREIGHT_NAME = item.FREIGHT_NAME; 
					table_samples.tr.PRODUCT = item.PRODUCT; 
					table_samples.tr.LOCATOR_ID = item.LOCATOR_ID; 
					table_samples.tr.SPEC_ID = item.SPEC_ID;
					table_samples.tr.OWNER = item.OWNER; 
					table_samples.tr.WEIGHT_NET_TONN = item.WEIGHT_NET_TONN; 
					table_samples.tr.SAMPLE_NO = item.SAMPLE_NO; 
					
					
					table_samples.tr.append($('<td>').append(table_samples.tr.checkbox)); 
					table_samples.tr.append($('<td>').text((i+1)));
					table_samples.tr.append($('<td>').text(item.FREIGHT_NAME));
					table_samples.tr.append($('<td>').text(item.PRODUCT));
					table_samples.tr.append($('<td>').text(item.BATCH_NO));
					table_samples.tr.append($('<td>').text(item.DATE_POST));
					table_samples.tr.append($('<td>').text(item.CAR_NUMBER));
					table_samples.tr.append($('<td>').text(item.CONT_NUMBER===null?'':item.CONT_NUMBER)); 
					table_samples.tr.append($('<td>').text(item.LOT_NUMBER===null?'':item.LOT_NUMBER));
					table_samples.tr.append($('<td>').text(item.SAMPLE_NO===null?'':item.SAMPLE_NO));
					
					samplesMS = JSON.parse(item.SAMPLES);
					
					
					$.each(samplesMS, function( j, jItem ) {
						var sampleData = {}
							sampleData.OGPTestID = jItem.test_id.toString();
							sampleData.OGPCode = jItem.sample_code;
							sampleData.Required = jItem.required;
							sampleData.CarOverload = jItem.car_overload;
							
							
							var arrayForHeader = [];
								arrayForHeader.push(table_h.find(itemH => itemH.TEST_ID === sampleData.OGPTestID));
								
								sampleData.headerArray = arrayForHeader;
								sampleData.OGPInput = getObjForHeader(arrayForHeader,jItem.value,jItem.car_overload);
								
								
						table_samples.tr.append($('<td>').append(sampleData.OGPInput)); 
						
						table_samples.tr.samplesOGP.push(sampleData);
					});
					ms_main.push(table_samples.tr);
                });	
			
			//console.log(ms_main);
			
			return return_table;
		}
		
		this.verify_check_elements = function(){
            var countChecked = 0;
			var l_result = {};
				l_result.done = true;
				l_result.mistakes = [];
            ms_main.forEach(function(item){
                if (item.checkbox.prop('checked')===true){
					countChecked ++;
                    var sOGPLine = '';  // Обязательные поля
					var sOGPErrorVal = ''; // Неверно введено значение
					var sOGPSelect = ''; // Проверка для списка (select)
					/* Проверка перегруза:  в паре ОГП/6 и ОГП/13	*/
					var sControlWeight = '';
					var valueOGP_8 = 0;
					var valueOGP_13 = 0;
					var sControlResult = 0;
					/* ******* */
					
					item.samplesOGP.forEach(function(samOGP){
						var OGPValues = samOGP.OGPInput.val();
						
						//console.log(samOGP);
						// Проверка для числовых полей
						if (samOGP.headerArray[0].DATA_TYPE === 'NUMBER'){
							if (OGPValues !=='' && OGPValues!== null){
								if (!isNumber(OGPValues) || !(OGPValues >= parseInt(samOGP.headerArray[0].MIN_VALUE_NUM) && OGPValues <= parseInt(samOGP.headerArray[0].MAX_VALUE_NUM))) {
									l_result.done = false;
									sOGPErrorVal = sOGPErrorVal+samOGP.OGPCode+';';
								}
							}
						}
						// Проверка для выпадающего списка
						if (samOGP.headerArray[0].DATA_TYPE === 'SET_VALUES'){
							var selectedOption = samOGP.OGPInput.find('option:selected');
							var OGPText = selectedOption.text();
							//console.log('OGPValues='+OGPValues+' OGPText = '+OGPText);
							if ((OGPValues ==='' || OGPValues=== null) && OGPText !==''){
								l_result.done = false;
								sOGPSelect = sOGPSelect+samOGP.OGPCode+';';
							}
						}
						if (samOGP.Required ==='Y' && samOGP.OGPInput.val() == '') {
							l_result.done = false;
							sOGPLine = sOGPLine+samOGP.OGPCode+';';
						}
						// нетто, кг
						if (samOGP.OGPCode === 'ОГП/8'){
							valueOGP_8 = OGPValues/1000;
						}
						// Грузоподъемность, т
						if (samOGP.OGPCode === 'ОГП/13'){
							valueOGP_13 = OGPValues;
						}
						
						
					});
					
					sControlResult = (valueOGP_13-(valueOGP_8)).toFixed(2);
					//console.log('sControlResult='+sControlResult+' valueOGP_13 = '+valueOGP_13+' valueOGP_8 = '+valueOGP_8);
					// rem 30.11.2024 BekmansurovRR
					// По просьбе Кулиняк Л.Я. : отлючить перегруз.
					/*if (sControlResult<=0.15 && item.FREIGHT_NAME == 'Карбамид'){
						l_result.done = false;
						sControlWeight = 'Вагон перегружен. Действие: Отменить вагон из таблицы и не включать его для внешней отправки, запросить решение кому на ВЗП он будет отнесен.'
					}*/
					
					if (sOGPLine !==''){
						l_result.mistakes.push('Для строки '+item.NUM+' не заполнено обязательное поле: ('+sOGPLine+')');
					}
					if (sOGPErrorVal !==''){
						l_result.mistakes.push('Для строки '+item.NUM+' введено неверное значение для полей: ('+sOGPErrorVal+')');
					}
					if (sOGPSelect !==''){
						l_result.mistakes.push('Для строки '+item.NUM+' выбрано значение,которое отсутствует в справочнике. Дополнить справоник для ('+sOGPSelect+')');
					}
					if (sControlWeight !==''){
						l_result.mistakes.push('Для строки '+item.NUM+' '+sControlWeight);
					}
                }
            });
			if (countChecked === 0){
				l_result.done = false;
				l_result.mistakes.push('Не выбраны строки для экспорта в OeBS!');
			}
            return l_result;
        };
		// Возвращаем массив данных для OeBS
		this.export_data = function(){
			var oebsMS = [];
            ms_main.forEach(function(item){
                if (item.checkbox.prop('checked')===true){
                    //console.log(item);
					var samplesMS = [];
					var samplesLine = {};
						samplesLine.shop_info_id = item.SHOP_INFO_ID;
						samplesLine.freight_name = item.FREIGHT_NAME;
						samplesLine.lot_number = item.LOT_NUMBER;
						samplesLine.batch_id = item.BATCH_ID;
						samplesLine.batch_no = item.BATCH_NO;
						samplesLine.car_number = item.CAR_NUMBER;
						samplesLine.cont_number = item.CONT_NUMBER;
						samplesLine.product = item.PRODUCT;
						samplesLine.locator_id = item.LOCATOR_ID;
						samplesLine.spec_id = item.SPEC_ID;
						samplesLine.owner = item.OWNER;
						samplesLine.weight_net_tonn = item.WEIGHT_NET_TONN;
						
					
					item.samplesOGP.forEach(function(samOGP){
						var l_item = {};
							l_item.test_id = samOGP.OGPTestID;
							l_item.required = samOGP.Required;
							l_item.caroverload = samOGP.CarOverload;
							l_item.value = samOGP.OGPInput.val();
							samplesMS.push(l_item);
					});
					samplesLine.samplesMS = samplesMS;
					oebsMS.push(samplesLine);
                }
            });
			return oebsMS;
        };
		
        this.empty_table = function(){
            return_table.find('tbody').empty();
            ms_main = [];
        };

        this.get_table = function(){
            return return_table;
        };
    };
    
	function export_table(){
		export_table.export_samples();
	};
	function export_samples_info(p_add_data){
			var res='';
			$.ajax({
				url: 'data.php',
				type: 'POST',
				dataType: "text",
				async: false,
				data: { add_data: p_add_data
					   ,ajax_action: 'export_samples_info'
				},
				success: function (data) {
					res = data;
				},
				error: function (data) {
					res = 'fail';
				}
			});
			return res;
	}
	
	
	var md_div = $('<div/>')
        .attr('title','Экспорт пробы в OEBS')
        .appendTo('body');
    
    var l_date_to_str = get_server_current_time();
    
    var l_date_from_str = add_day_to_date(l_date_to_str,-3);
	
	md_div.freight = $('<select>',{class:'required', css:{'width':'170px','text-align':'right'}});
	md_div.product = $('<select>',{class:'required', css:{'width':'170px','text-align':'right'}});
    md_div.date_from = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required',css:{'width':'130px'}}).val(l_date_from_str);
    md_div.date_to = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required',css:{'margin-left':'5px','width':'130px'}}).val(l_date_to_str);
    md_div.status = $('<select>',{css:{'width':'170px','text-align':'right'}});
    md_div.type = $('<select>',{css:{'width':'170px','text-align':'right'}});
	md_div.batch_num = $('<input>',{css:{'width':'100px','text-align':'right'}});
    md_div.refresh_btn = $('<input>',{type:'button', class:'btnFind'}).val('Обновить');
	
	md_div.refresh_div = $('<div>',{css:{'text-align':'left'}}).append(md_div.refresh_btn);       
    
    md_div.freight.append('<option value="'+''+'">'+''+'</option>');
    /*
		md_div.freight.append('<option value="'+'КФК'+'">'+'КФК'+'</option>');
		md_div.freight.append('<option value="'+'Формалин'+'">'+'Формалин'+'</option>');
		md_div.freight.append('<option value="'+'Метанол'+'">'+'Метанол'+'</option>');
		md_div.freight.append('<option value="'+'ФТП'+'">'+'ФТП'+'</option>');
	*/
	
	md_div.freight.append('<option value="'+'Карбамид'+'">'+'Карбамид'+'</option>');
	md_div.freight.append('<option value="'+'Метанол'+'">'+'Метанол'+'</option>');
    
    //md_div.status.append('<option value="'+''+'">'+''+'</option>');
    /*
	md_div.status.append('<option selected value="'+'0'+'">'+'Не отражен в OEBS'+'</option>');
    md_div.status.append('<option value="'+'1'+'">'+'Отражен в OEBS'+'</option>');
    */
	/*
    md_div.type.append('<option value="'+''+'">'+''+'</option>');
    md_div.type.append('<option value="'+'cont'+'">'+'Контейнерная'+'</option>');
    md_div.type.append('<option value="'+'railcar'+'">'+'Повагонно'+'</option>');
	*/
	md_div.freight.on('change', function (e) {
		//console.log('md_div.freight'+md_div.freight.val());
		fill_product_for_freight(md_div.product, md_div.freight.val());
	});
	
	fill_loadind_status_for_select(md_div.status);
	fill_loadind_type_for_select(md_div.type);
	init_date_time_input(md_div.date_from);
    init_date_time_input(md_div.date_to);
	
	md_div.append(
        $('<div>',{css:{'display':'table'}}).append(
            $('<div>',{class:'attr',css:{'border':'none','width':'470px'}})
                .append(
                    $('<div>')
                    .append($('<label>').text('Груз'))
                    .append(md_div.freight)
                )
				.append(
                    $('<div>')
                    .append($('<label>').text('Продукт'))
                    .append(md_div.product)
                )
                .append(
                    $('<div>')
                    .append($('<label>').text('Даты постановки (с..по) '))
                    .append(md_div.date_from)
                    .append(md_div.date_to)
                )
                .append(
                    $('<div>')
                    .append($('<label>').text('По виду загрузки'))
                    .append(md_div.type)
                )
				.append(
                    $('<div>')
                    .append($('<label>').text('Статус загрузки в OeBS'))
                    .append(md_div.status)
                )
				.append(
                    $('<div>')
                    .append($('<label>').text('Номер задания'))
                    .append(md_div.batch_num)
                )
                .append(
                    md_div.refresh_div
                )
        )    
    );
	
	var export_table = new table_for_weigh_from_shop_samples();
		md_div.refresh_btn.on('click', function(){
			var l_product = md_div.freight.val();
			var l_item_code_oebs = md_div.product.val();
			
			
			var l_status = md_div.status.val();
			
			if (l_product === null || l_product ===''){
				create_info_modal_dialog_new('Ошибка','Не выбран груз!');
				return;
			}
			if (l_item_code_oebs === null || l_item_code_oebs ===''){
				create_info_modal_dialog_new('Ошибка','Не выбран продукт!');
				return;
			}
			else{
				start_loading_animation();
				if (l_status === '1'){
					$('#md_export_samples_btn').prop('disabled',true);
				} else{
					$('#md_export_samples_btn').prop('disabled',false);
				} 
				md_div.append(export_table.load_table(l_product,l_item_code_oebs)); 
				stop_loading_animation();
			}
				
		});
		
	
	md_div.dialog({
        resizable:true,
        modal:true,
        width: '900px',
        position: { my: 'top', at: 'top+150' },
        draggable: true,
        buttons:{
            'Экспортировать в OEBS':{
                text: "Экспортировать в OEBS",
                  id: "md_export_samples_btn",
               click: function(){
				   
					var l_result = export_table.verify_check_elements();
					if (l_result.done == false){
                        var l_msg_mistake = '';
                        l_result.mistakes.forEach(function(l_mistake){
                            l_msg_mistake += l_mistake + '<br>';
                        });
                        create_info_modal_dialog_new('Ошибка проверки данных! ',l_msg_mistake);
					}else {
						$('#md_export_samples_btn').prop('disabled',true);
						var l_oebs_json = JSON.stringify(export_table.export_data());
						//console.log(l_oebs_json);
						//return;
						var result = export_samples_info (l_oebs_json).split('$');
						if (result[0]=='done') {
							create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!'+'<br>'+result[1]);
							$('#md_export_samples_btn').prop('disabled',false);
							$(this).dialog( "close" );
						}else{
                            create_info_modal_dialog_new('Предупреждение','Процедура завершилась с ошибкой!!!'+'<br>'+result[1]);
							$('#md_export_samples_btn').prop('disabled',false);
                        }
						//console.log(l_oebs_json);
					}
				   
                    //$(this).dialog( "close" );
                }   
            },
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
	if (!r_export_samples){
		$('#md_export_samples_btn').prop('disabled',true);
	}
    $('.ui-dialog-buttonset').css({'float':'left'});
	$('#ui-id-1').css("height","200px");
	$('#ui-id-1').css("max-height","500px");
	$('#ui-id-1').css("height","auto");
    
} 


/* Экспорт в OEBS */
function create_md_export_shop_info(){
    
	function run_report(){
		var l_freight = md_div.freight.val();
		var l_date_from = md_div.date_from.val();
		var l_date_to = md_div.date_to.val();
		var l_status = md_div.status.val();
		var l_type = md_div.type.val();
		
		//console.log('l_freight='+l_freight+' l_date_from='+l_date_from+' l_date_to='+l_date_to+' l_status='+l_status+' l_type='+l_type);
		
        var win = window.open('xx_etw_disl_009/xx_etw_disl_009.php?'+
                              'freight='+l_freight+'&'+
							  'date_from='+l_date_from+'&'+
							  'date_to='+l_date_to+'&'+
							  'status='+l_status+'&'+
							  'type='+l_type
                             ,'_blank');
    }
	function fill_product_for_select (p_select){
		p_select.empty();
		var l_option = $('<option>').text('').val('');
		p_select.append(l_option);
		$.ajax({
			url: 'data.php',
			type: 'POST',
			dataType: "text",
			async:false,
			data: { ajax_action: 'get_product_name_list'
				  },
			success: function (data) {
				//console.log(data);
				var records = JSON.parse(data);
					$.each(records, function( i, item ) {
                    var l_option = $('<option>').text(item.ITEM_NAME).val(item.ITEM_NAME);
						p_select.append(l_option);
                    }); 
				},
				error: function (m1,m2) {window.alert(m1+m2);}
			});
	}
	
	function fill_loadind_status_for_select (p_select){
		p_select.empty();
		var l_option = $('<option>').text('').val('');
		p_select.append(l_option);
		$.ajax({
			url: 'data.php',
			type: 'POST',
			dataType: "text",
			async:false,
			data: { ajax_action: 'get_loadind_status_oebs_list'
				  },
			success: function (data) {
				//console.log(data);
				var records = JSON.parse(data);
					$.each(records, function( i, item ) {
                    var l_option = $('<option>').text(item.STATUS_NAME).val(item.ID);
						p_select.append(l_option);
                    }); 
				},
				error: function (m1,m2) {window.alert(m1+m2);}
			});
	}
	
	function fill_loadind_type_for_select (p_select){
		p_select.empty();
		var l_option = $('<option>').text('').val('');
		p_select.append(l_option);
		$.ajax({
			url: 'data.php',
			type: 'POST',
			dataType: "text",
			async:false,
			data: { ajax_action: 'get_loadind_type_oebs_list'
				  },
			success: function (data) {
				//console.log(data);
				var records = JSON.parse(data);
					$.each(records, function( i, item ) {
                    var l_option = $('<option>').text(item.TYPE_NAME).val(item.TYPE_CODE);
						p_select.append(l_option);
                    }); 
				},
				error: function (m1,m2) {window.alert(m1+m2);}
			});
	}
	
	
	function get_select_freight_list(p_freight){        
        var result_select = $('<select>',{css:{'width':'9em'}});

        result_select.append('<option selected value="'+p_freight+'">'+p_freight+'</option>');

        $.each(g_freight_list, function( i, item ) {
            result_select.append('<option value="'+item.FREIGHT_NAME+'">'+item.FREIGHT_NAME+'</option>');
        });

        return result_select; 
    }
    function get_select_freight_oebs(p_freight,p_product, p_cont_number){
		//console.log('p_product='+p_product+' p_cont_number='+p_cont_number);
        
		var result_select = $('<select>',{css:{'width':'75px'}});
        
        if (p_freight.toUpperCase()==='КФК'){
            result_select.append('<option selected value="'+'ГП0043'+'">'+'ГП0043'+'</option>');
        } else if (p_freight.toUpperCase()==='ФОРМАЛИН'){
            result_select.append('<option value="'+'0'+'" selected>'+'-Выберите позицию-'+'</option>');
			result_select.append('<option value="'+'ГП0511'+'">'+'ГП0511'+'</option>');
			result_select.append('<option value="'+'ГП0515'+'">'+'ГП0515'+'</option>'); // add 20.06.2020
			result_select.append('<option value="'+'ГП0522'+'">'+'ГП0522'+'</option>'); // add 20.06.2020
        }
		else if (p_freight.toUpperCase()==='КАРБАМИД'){
			result_select.append('<option value="'+'ГП0098'+'">'+'ГП0098'+'</option>'); // add 13.12.2022
		}
		else if (p_freight.toUpperCase()==='МЕТАНОЛ'){
			result_select.append('<option value="'+'ГП0011'+'">'+'ГП0011'+'</option>'); // add 19.03.2024 по наряду 0000048724
			//result_select.append('<option value="'+'ДС5001'+'">'+'ДС5001'+'</option>'); // add 09.07.2024 по наряду 0000057911 
		}
		if (p_product !== null && p_product !== undefined){
			result_select.val(p_product);
		}else {
			if (p_freight.toUpperCase()==='МЕТАНОЛ'){
				if (p_cont_number !== null && p_cont_number !== undefined && p_cont_number !==''){					
					result_select.val('ГП0011');
				}
			}
		}
		
        return result_select;
    };
    function export_shop_info_ajax(p_shop_info){
        var res='';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { shop_info: p_shop_info
                   ,ajax_action: 'export_shop_info'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    function table_for_weigh_from_shop_info(){
        var self = this;
        var tr_mas = [];
        
        var return_table = $('<div>');
        return_table.append(
            '<table class="table_for_weigh_from_shop_info cars_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th></th>'+
                        '<th>№</th>'+
                        '<th>Груз</th>'+
                        '<th>Груз в OEBS</th>'+
                        '<th>Номер задания в OEBS</th>'+
                        '<th>Постановка (местное)</th>'+
                        '<th>Нач. операции (местное)</th>'+
                        '<th>Кон. операции (местное)</th>'+
                        '<th>Заявка на увод (местное)</th>'+
                        '<th>Увод (местное)</th>'+
                        '<th>Вагон / платформа</th>'+
                        '<th>Контейнер</th>'+
                        '<th>Вес груза</th>'+
                        '<th>Отказ от налива</th>'+
                        '<th>Осмотрел</th>'+
                        '<th>Операцию начал</th>'+
                        '<th>Операцию закончил</th>'+
                        '<th>Заявил</th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'
        );

        return_table.cars_table = $('<table>',{class:'table_for_weigh_from_shop_info cars_table'}).append($('<tbody>'));
        return_table.append(
            $('<div>',{class:'modalDialogContainer',css:{'display':'inline-block','width':'1715px','max-height':'400px','height':'400px'}})  
            .append(return_table.cars_table)
        );

        this.add_cars_in_table = function(p_cars_from_shop_mas){
            
            p_cars_from_shop_mas.forEach(function(item,index) {
                var tr = $('<tr/>');
                tr.num_index = index;
                
                tr.checkbox = $('<input>',{'type':'checkbox'/*,'checked':'checked'*/});
                
                tr.batch_no = item.batch_no;
                
                tr.freight_name = get_select_freight_list(item.freight_name);
                tr.freight_name.prop('disabled',true);
                
                tr.freight_name_oebs = get_select_freight_oebs(item.freight_name,item.product, item.cars[0].cont_number);
                
                tr.date_post = $('<input>')
                    .attr({'type':'text','maxlength':'16'})
                    .addClass('text ui-widget-content ui-corner-all')
                    .css({'width':'100px'})
                    .prop('disabled',true)
                    .val(item.date_post);
                init_date_time_input_short(tr.date_post);
                
                tr.date_start = $('<input>')
                    .attr({'type':'text','maxlength':'16'})
                    .addClass('text ui-widget-content ui-corner-all')
                    .css({'width':'100px'})
                    .prop('disabled',true)
                    .val(item.date_start);
                init_date_time_input_short(tr.date_start);
                
                tr.date_end = $('<input>')
                    .attr({'type':'text','maxlength':'16'})
                    .addClass('text ui-widget-content ui-corner-all')
                    .css({'width':'100px'})
                    .prop('disabled',true)
                    .val(item.date_end);
                init_date_time_input_short(tr.date_end);
                
                tr.date_zayavka_uvod = $('<input>')
                    .attr({'type':'text','maxlength':'16'})
                    .addClass('text ui-widget-content ui-corner-all')
                    .css({'width':'100px'})
                    .prop('disabled',true)
                    .val(item.date_zayavka_uvod);
                init_date_time_input_short(tr.date_zayavka_uvod);
                
                tr.date_uvod = $('<input>')
                    .attr({'type':'text','maxlength':'16'})
                    .addClass('text ui-widget-content ui-corner-all')
                    .css({'width':'100px'})
                    .prop('disabled',true)
                    .val(item.date_uvod);
                init_date_time_input_short(tr.date_uvod);
                        
                tr.who_looked = get_select_users_for_naliv_new();
                tr.who_looked.css({'width':'10em'}).prop('disabled',true).val(item.who_looked);
                if (item.who_looked === null && item.who_looked_add !== null){
                    tr.who_looked.append('<option selected value="'+''+'">'+item.who_looked_add+'</option>');
                }
                tr.who_start = get_select_users_for_naliv_new();
                tr.who_start.css({'width':'10em'}).prop('disabled',true).val(item.who_start);
                if (item.who_start === null && item.who_start_add !== null){
                    tr.who_start.append('<option selected value="'+item.who_start_add+'">'+item.who_start_add+'</option>');
                }
                tr.who_end = get_select_users_for_naliv_new();
                tr.who_end.css({'width':'10em'}).prop('disabled',true).val(item.who_end);
                if (item.who_end === null && item.who_end_add !== null){
                    tr.who_end.append('<option selected value="'+item.who_end_add+'">'+item.who_end_add+'</option>');
                }
                tr.who_zayavka = get_select_users_for_naliv_new();
                tr.who_zayavka.css({'width':'10em'}).prop('disabled',true).val(item.who_zayavka);
                if (item.who_zayavka === null && item.who_zayavka_add !== null){
                    tr.who_zayavka.append('<option selected value="'+item.who_zayavka_add+'">'+item.who_zayavka_add+'</option>');
                }
                
                tr.append($('<td>').attr('rowspan',item.cars.length).append(tr.checkbox));
                tr.append($('<td>').attr('rowspan',item.cars.length).append(index));
                tr.append($('<td>').attr('rowspan',item.cars.length).append(tr.freight_name));
                tr.append($('<td>').attr('rowspan',item.cars.length).append(tr.freight_name_oebs));
                tr.append($('<td>').attr('rowspan',item.cars.length).append(tr.batch_no));
                tr.append($('<td>').attr('rowspan',item.cars.length).append(tr.date_post));
                tr.append($('<td>').attr('rowspan',item.cars.length).append(tr.date_start));
                tr.append($('<td>').attr('rowspan',item.cars.length).append(tr.date_end));
                tr.append($('<td>').attr('rowspan',item.cars.length).append(tr.date_zayavka_uvod));
                tr.append($('<td>').attr('rowspan',item.cars.length).append(tr.date_uvod));
                
                
                
                tr.shops = [];
                
                var l_car = {};
                l_car.shop_info_id = item.cars[0].shop_info_id;
                l_car.car_number = item.cars[0].car_number;
                l_car.cont_count = item.cars[0].cont_count;
                l_car.cont_number = item.cars[0].cont_number;
                l_car.weight_net = $('<input>',{class:'text ui-widget-content ui-corner-all','type':'text','maxlength':'6',css:{'width':'4em'}}).prop('disabled',true).val(item.cars[0].weight_net.replace(',','.'));
                l_car.refusal = $('<input>',{class:'text ui-widget-content ui-corner-all','type':'text','maxlength':'200',css:{'width':'10em'}}).prop('disabled',true).val(item.cars[0].refusal);
                
                tr.shops.push(l_car);  
                
                tr.append($('<td>',{css:{'width':'80px','font-weight':'700'}}).append(l_car.car_number));
                tr.append($('<td>',{css:{'width':'100px','font-weight':'700'}}).append(l_car.cont_number));
                tr.append($('<td>',{css:{'width':'55px'}}).append(l_car.weight_net));
                tr.append($('<td>',{css:{'width':'120px'}}).append(l_car.refusal));
                
                tr.append($('<td>').attr('rowspan',item.cars.length).append(tr.who_looked));
                tr.append($('<td>').attr('rowspan',item.cars.length).append(tr.who_start));
                tr.append($('<td>').attr('rowspan',item.cars.length).append(tr.who_end));
                tr.append($('<td>').attr('rowspan',item.cars.length).append(tr.who_zayavka));
                
                tr.appendTo(return_table.cars_table);
                tr_mas.push(tr);
                
                item.cars.forEach(function(item,index) {

                    if (index!=0) {
                        var l_car = {};
                        l_car.shop_info_id = item.shop_info_id;
                        l_car.car_number = item.car_number;
                        l_car.cont_count = item.cont_count;
                        l_car.cont_number = item.cont_number;
                        l_car.weight_net = $('<input>',{class:'text ui-widget-content ui-corner-all','type':'text','maxlength':'6',css:{'width':'4em'}}).prop('disabled',true).val(item.weight_net.replace(',','.'));
                        l_car.refusal = $('<input>',{class:'text ui-widget-content ui-corner-all','type':'text','maxlength':'200',css:{'width':'10em'}}).prop('disabled',true).val(item.refusal);
                        
                        tr.shops.push(l_car);
                        
                        var tr_child = $('<tr/>');
                        
                        tr_child.append($('<td>',{css:{'width':'80px','font-weight':'700'}}).append(l_car.car_number));
                        tr_child.append($('<td>',{css:{'width':'100px','font-weight':'700'}}).append(l_car.cont_number));
                        tr_child.append($('<td>',{css:{'width':'55px'}}).append(l_car.weight_net));
                        tr_child.append($('<td>',{css:{'width':'120px'}}).append(l_car.refusal));
                        
                        tr_child.appendTo(return_table.cars_table);
                    }
                });
                
            });
        };

        this.get_check_elements = function(){
            var l_result = '';
            tr_mas.forEach(function(item){
                if (item.checkbox.prop('checked')===true){
                    item.shops.forEach(function(shop){
						if (shop.weight_net.val() !== '0'){
							l_result+=shop.shop_info_id+':'+item.freight_name_oebs.val()+'|';
						}
                    });
                }
            });
            return l_result;
        };
        
        this.verify_check_elements = function(){
            var l_result = {};
            l_result.done = true;
                
            l_result.mistakes = [];
            tr_mas.forEach(function(item){
                if (item.checkbox.prop('checked')===true){
                    if (item.batch_no != null) {
                        l_result.done = false;
                        l_result.mistakes.push('Погрузка с номером '+item.num_index+' уже отражена в OEBS!');
                        //alert('Погрузка с номером '+item.num_index+' уже отражена в OEBS!');
                    }
                    if (item.freight_name_oebs.val() == '' || item.freight_name_oebs.val() == '0'){
                        l_result.done = false;
                        l_result.mistakes.push('В погрузке с номером '+item.num_index+' не указан груз для OEBS!');
                        //alert('В погрузке с номером '+item.num_index+' не указан груз для OEBS!');
                    }
                    
                    if (!(item.freight_name.val() == 'КФК' || item.freight_name.val() == 'Формалин'|| item.freight_name.val() == 'Карбамид' || item.freight_name.val() == 'Метанол')){
                        l_result.done = false;
                        l_result.mistakes.push('В погрузке с номером '+item.num_index+' указан груз для которого отражение в OEBS не предусмотрено!');
                        //alert('В погрузке с номером '+item.num_index+' указан груз для которого отражение в OEBS не предусмотрено!');
                    }
					if ((item.freight_name.val() == 'Карбамид')){
						if (item.date_post.val() == '' || item.date_start.val() == '' || item.date_end.val() == '' ){
							l_result.done = false;
							l_result.mistakes.push('В погрузке с номером '+item.num_index+' не указаны обязательные поля!');
							//alert('В погрузке с номером '+item.num_index+' не указаны обязательные поля!');
						}
					}
					else {
						if (item.date_post.val() == '' || item.date_start.val() == '' || item.date_end.val() == '' || 
							item.who_looked.val() == '' || item.who_start.val() == '' || item.who_end.val() == ''){
							l_result.done = false;
							l_result.mistakes.push('В погрузке с номером '+item.num_index+' не указаны обязательные поля!');
							//alert('В погрузке с номером '+item.num_index+' не указаны обязательные поля!');
						}
					}
                    
                    item.shops.forEach(function(child_item){
						if (!(item.freight_name.val() == 'Карбамид')){
							if (child_item.cont_number == null){
								l_result.done = false;
								l_result.mistakes.push('В погрузке с номером '+item.num_index+' не указан номер контейнера!');
								//alert('В погрузке с номером '+item.num_index+' не указан номер контейнера!');
							}
							if (child_item.cont_number != null && child_item.car_number == null){
								l_result.done = false;
								l_result.mistakes.push('В погрузке с номером '+item.num_index+' не указана платформа для контейнера!');
								//alert('В погрузке с номером '+item.num_index+' не указан номер контейнера!');
							}
							if (child_item.cont_number != null && child_item.cont_count == 1){
								l_result.done = false;
								l_result.mistakes.push('В погрузке с номером '+item.num_index+' на платформе находится только один контейнер!');
								//alert('В погрузке с номером '+item.num_index+' не указан номер контейнера!');
							}
						}
                        if (child_item.weight_net.val() == '0' && (child_item.refusal.val()== '' || child_item.refusal.val()== null)){
                            l_result.done = false;
                            l_result.mistakes.push('В погрузке с номером '+item.num_index+' указан нулевой вес груза!');
                            //alert('В погрузке с номером '+item.num_index+' указан нулевой вес груза!');
                        }
                    });
                }
            });
            return l_result;
        };
        
        this.empty_table = function(){
            return_table.find('tbody').empty();
            tr_mas = [];
        };

        this.get_table = function(){
            return return_table;
        };
    };
    
    var md_div = $('<div/>')
        .attr('title','Экспорт в OEBS')
        .appendTo('body');
    
    var l_date_to_str = get_server_current_time();
    
    var l_date_from_str = add_day_to_date(l_date_to_str,-3);

    md_div.freight = $('<select>',{css:{'width':'170px','text-align':'right'}});
    md_div.date_from = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required',css:{'width':'130px'}}).val(l_date_from_str);
    md_div.date_to = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required',css:{'margin-left':'5px','width':'130px'}}).val(l_date_to_str);
    md_div.status = $('<select>',{css:{'width':'170px','text-align':'right'}});
    md_div.type = $('<select>',{css:{'width':'170px','text-align':'right'}});
    md_div.refresh_btn = $('<input>',{type:'button', class:'btnFind'}).val('Обновить');
    
    md_div.refresh_div = $('<div>',{css:{'text-align':'left'}}).append(md_div.refresh_btn);       
    
	/*
    md_div.freight.append('<option value="'+''+'">'+''+'</option>');
    md_div.freight.append('<option value="'+'КФК'+'">'+'КФК'+'</option>');
    md_div.freight.append('<option value="'+'Формалин'+'">'+'Формалин'+'</option>');
    md_div.freight.append('<option value="'+'Метанол'+'">'+'Метанол'+'</option>');
    md_div.freight.append('<option value="'+'ФТП'+'">'+'ФТП'+'</option>');
	md_div.freight.append('<option value="'+'Карбамид'+'">'+'Карбамид'+'</option>');
	md_div.freight.append('<option value="'+'Меламин'+'">'+'Меламин'+'</option>');
    */
	
    /*md_div.status.append('<option value="'+''+'">'+''+'</option>');
    md_div.status.append('<option value="'+'0'+'">'+'Не отражен в OEBS'+'</option>');
    md_div.status.append('<option value="'+'1'+'">'+'Отражен в OEBS'+'</option>');
    
    md_div.type.append('<option value="'+''+'">'+''+'</option>');
    md_div.type.append('<option value="'+'cont'+'">'+'Контейнерная'+'</option>');
    md_div.type.append('<option value="'+'railcar'+'">'+'Повагонно'+'</option>');
    */
	
	fill_loadind_status_for_select(md_div.status);
	fill_loadind_type_for_select(md_div.type);
	fill_product_for_select(md_div.freight);
    init_date_time_input(md_div.date_from);
    init_date_time_input(md_div.date_to);
   
    md_div.append(
        $('<div>',{css:{'display':'table'}}).append(
            $('<div>',{class:'attr',css:{'border':'none','width':'470px'}})
                .append(
                    $('<div>')
                    .append($('<label>').text('Груз'))
                    .append(md_div.freight)
                )
                .append(
                    $('<div>')
                    .append($('<label>').text('Даты постановки (с..по) '))
                    .append(md_div.date_from)
                    .append(md_div.date_to)
                )
                .append(
                    $('<div>')
                    .append($('<label>').text('Статус загрузки в OEBS'))
                    .append(md_div.status)
                )
                .append(
                    $('<div>')
                    .append($('<label>').text('По виду загрузки'))
                    .append(md_div.type)
                )
                .append(
                    md_div.refresh_div
                )
        )    
    );
    
    var export_table = new table_for_weigh_from_shop_info();
    md_div.append(export_table.get_table());    
    
    md_div.refresh_btn.on('click', function(){
        if (md_div.date_from.hasClass('red_bckg_color')||md_div.date_from.val()==''||md_div.date_to.hasClass('red_bckg_color')||md_div.date_to.val()==''){
            create_info_modal_dialog_new('Предупреждение','Заполните все обязательные поля!');
        }else{
            start_loading_animation();

            var l_cars_from_shop=[];
            $.ajax({
                url: 'data.php',
                type: 'POST',
                dataType: "text",
                async:false,
                data: { freight: md_div.freight.val()
                       ,date_from: md_div.date_from.val()
                       ,date_to: md_div.date_to.val()
                       ,status: md_div.status.val()
                       ,type: md_div.type.val()
                       ,ajax_action: 'get_cars_from_shop_for_oebs'},
                success: function (data) {
                    l_cars_from_shop = JSON.parse(data);
                },
                error: function (m1,m2) {window.alert(m1+m2);}
            });

            var l_cars_from_shop_mas =[];
            var l_prev_id = 0;
            l_cars_from_shop.forEach(function(item) {
                var l_car = {car_number:item.CAR_NUMBER
                            ,cont_count:item.CONT_COUNT
                            ,cont_number:item.CONT_NUMBER
                            ,weight_net:item.WEIGHT_NET
                            ,refusal:item.REFUSAL
                            ,shop_info_id:item.SHOP_INFO_ID
                            };

                if (l_prev_id!=item.ID){
                    l_cars_from_shop_mas[item.ID] = {freight_name:item.FREIGHT_NAME,date_post:item.DATE_POST,date_start:item.DATE_START,date_end:item.DATE_END
                                                    ,date_zayavka_uvod:item.DATE_ZAYAVKA_UVOD,date_uvod:item.DATE_UVOD
                                                    ,who_looked:item.WHO_LOOKED,who_start:item.WHO_START,who_end:item.WHO_END,who_zayavka:item.WHO_ZAYAVKA
                                                    ,who_looked_add:item.WHO_LOOKED_ADD,who_start_add:item.WHO_START_ADD,who_end_add:item.WHO_END_ADD,who_zayavka_add:item.WHO_ZAYAVKA_ADD
                                                    ,batch_no:item.BATCH_NO
													,product:item.PRODUCT
                                                    ,cars:[l_car]};

                } else{
                    l_cars_from_shop_mas[item.ID].cars.push(l_car);
                }

                l_prev_id=item.ID;
            });  
            export_table.empty_table();
            export_table.add_cars_in_table(l_cars_from_shop_mas);

            stop_loading_animation();
        }
    });
    
    md_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        draggable: false,
        buttons:{
            'Экспортировать в OEBS':{
                text: "Экспортировать в OEBS",
                  id: "md_export_btn",
               click: function(){
                   $('#md_export_btn').prop('disabled',true);
                   var l_result = export_table.verify_check_elements();
                    if (l_result.done == false){
                        var l_msg_mistake = '';
                        l_result.mistakes.forEach(function(l_mistake){
                            l_msg_mistake += l_mistake + '<br>';
                        });
                        create_info_modal_dialog_new('Ошибка проверки данных',l_msg_mistake);
                    }else{
						//console.log(export_table.get_check_elements());
						//return;
                        var l_result = export_shop_info_ajax(export_table.get_check_elements());
                        if(l_result.substr(0,4)=='done'){
                            create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!'+'<br>'+'Созданы задания: '+l_result.substr(5));
                        }else{
                            create_info_modal_dialog_new('Предупреждение','Процедура завершилась с ошибкой!!!'+'<br>'+l_result);
                        }
                    }    
                    $('#md_export_btn').prop('disabled',false);
                }   
            },
			/*'Отчет в Excel':{
                text: "Отчет в Excel",
                  id: "md_report_excel_btn",
               click: function(){
					run_report();
			    }
			},*/
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
    $('.ui-dialog-buttonset').css({'float':'left'});
    if (!r_export_shop_info){
        $('#md_export_btn').prop('disabled',true);
    } 
}
/*Форма Создать накладную на возврат*/
function create_return_invoice(p_clicked_li){
    $('.context-menu').remove();
    start_loading_animation();
    
    function table_for_cont_csl(){
        var self = this;
        var conts_obj = {};
        var l_seal_types_mas;
        var l_seal_owner_types;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_seal_types'
                    },
            success: function (data) {
                    l_seal_types_mas = JSON.parse(data);
                }
        });
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_seal_owner_types'
                    },
            success: function (data) {
                    l_seal_owner_types = JSON.parse(data);
                }
        });
        
        function fill_select_with_options(p_select,p_type){
            var l_mas = [];
            if (p_type == 'seal_types') {
                l_mas = l_seal_types_mas;
            }else if (p_type == 'seal_owner_types') {
                l_mas = l_seal_owner_types;
            }
            
            p_select.append($('<option>'));
            $.each(l_mas, function( i, item ) {
                var l_option = $('<option>').text(item.NAME).val(item.ID);
                p_select.append(l_option);
            }); 
        };
        
        var return_table = $('<div>');
        return_table.conts = $('<select>',{css:{'width':'130px'}});
        return_table.add_row = $('<input>',{type:'button', class:'btnFind',css:{'margin-left':'5px'}}).val('Добавить строку');
        return_table.add_row.on('click', function(){
            self.add_row_in_table();
        });
        
        return_table.append(return_table.conts);
        return_table.append(return_table.add_row);
        return_table.append(
            '<table class="table_for_cont_csl cars_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th>Тип ЗПУ</th>'+
                        '<th>Знаки</th>'+
                        '<th>Кол<br>-во</th>'+
                        '<th>Год изг.</th>'+
                        '<th>Принадлежность</th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'
        );

        return_table.cars_table = $('<table>',{class:'table_for_cont_csl cars_table'}).append($('<tbody>'));
        return_table.append(
            $('<div>',{class:'modalDialogContainer',css:{'display':'inline-block','width':'507px','max-height':'150px','height':'150px'}})  
            .append(return_table.cars_table)
        );
        
        return_table.conts.on('change', function(){
            self.empty_table();
   
            var cur_cont = $(this).val();
            
            conts_obj[cur_cont].forEach(function(item){
                item.appendTo(return_table.cars_table);
                
                item.delete_btn.on('click', function(){
                    delete conts_obj[return_table.conts.val()][item.pos];
                    item.remove();
                });
                
                limit_input_only_numbers(item.seal_quantity);
                limit_input_only_numbers(item.seal_year);
                limit_input_only_numbers(item.seal_marks_part3);
                limit_input_only_rus(item.seal_marks_part2);
            });
        });
        
        this.trigger_event_cont_change = function(){
            return_table.conts.trigger('change');
        };
        this.set_conts = function(p_conts){
            $.each(p_conts, function( i, item ) {
                var l_option = $('<option>').text(item.CONT_NUMBER).val(item.CONT_NUMBER);
                return_table.conts.append(l_option);
                
                conts_obj[item.CONT_NUMBER] = [];
            }); 
        };
        
        this.add_row_in_table = function(p_seal_type,p_seal_marks,p_seal_quantity,p_seal_year,p_seal_owner_type){
            var tr = $('<tr/>');
            tr.pos = conts_obj[return_table.conts.val()].length;
            
            tr.seal_type = $('<select>',{css:{'width':'120px'}});
            fill_select_with_options(tr.seal_type,'seal_types');
            tr.seal_type.val(p_seal_type);
            
            tr.seal_marks_part1 = $('<input>')
                    .attr({'type':'text','maxlength':'3'})
                    .addClass('text ui-widget-content ui-corner-all')
                    .css({'width':'35px'})
                    .val((p_seal_marks===undefined?'РЖД':p_seal_marks.substr(0,3)));
            tr.seal_marks_part2 = $('<input>')
                    .attr({'type':'text','maxlength':'1'})
                    .addClass('text ui-widget-content ui-corner-all')
                    .css({'width':'13px'})
                    .val((p_seal_marks===undefined?'':p_seal_marks.substr(3,1)));
            tr.seal_marks_part3 = $('<input>')
                    .attr({'type':'text','maxlength':'7'})
                    .addClass('text ui-widget-content ui-corner-all')
                    .css({'width':'60px'})
                    .val((p_seal_marks===undefined?'':p_seal_marks.substr(4)));
            
            tr.seal_quantity = $('<input>')
                    .attr({'type':'text','maxlength':'2'})
                    .addClass('text ui-widget-content ui-corner-all')
                    .css({'width':'30px'})
                    .attr( "disabled", true )
                    //.val((p_seal_quantity===undefined?'1':p_seal_quantity));
                    .val((p_seal_quantity===undefined?'':p_seal_quantity));
            tr.seal_year = $('<input>')
                    .attr({'type':'text','maxlength':'4'})
                    .addClass('text ui-widget-content ui-corner-all')
                    .css({'width':'40px'})
                    .val(p_seal_year);
            tr.seal_owner_type = $('<select>',{css:{'width':'110px'}});
            fill_select_with_options(tr.seal_owner_type,'seal_owner_types');
            tr.seal_owner_type.val((p_seal_owner_type===undefined?'2':p_seal_owner_type));
            
            tr.delete_btn = $('<div>',{class:'deleteImage deleteImage13px'});
            tr.delete_btn.on('click', function(){
                delete conts_obj[return_table.conts.val()][tr.pos];
                tr.remove();
            });
            
            limit_input_only_numbers(tr.seal_quantity);
            limit_input_only_numbers(tr.seal_year);
            limit_input_only_numbers(tr.seal_marks_part3);
            limit_input_only_rus(tr.seal_marks_part2);
            
            tr.append($('<td>').append(tr.seal_type));
            tr.append($('<td>').append(tr.seal_marks_part1).append(tr.seal_marks_part2).append(tr.seal_marks_part3));
            tr.append($('<td>').append(tr.seal_quantity));
            tr.append($('<td>').append(tr.seal_year));
            tr.append($('<td>').append(tr.seal_owner_type));
            tr.append($('<td>').append(tr.delete_btn));
            
            tr.appendTo(return_table.cars_table);
            
            
            
            if (p_seal_type == undefined && p_seal_marks == undefined) {
                var l_rows = conts_obj[return_table.conts.val()];
                // var prev_tr = l_tmp.slice(-1)[0];
                var prev_tr = undefined;
                l_rows.forEach(function(item){
                    prev_tr = item;
                });
                if (prev_tr != undefined) {
                    tr.seal_type.val(prev_tr.seal_type.val());
                    tr.seal_marks_part1.val(prev_tr.seal_marks_part1.val());
                    tr.seal_marks_part2.val(prev_tr.seal_marks_part2.val());
                    tr.seal_marks_part3.val(prev_tr.seal_marks_part3.val());
                    tr.seal_quantity.val(prev_tr.seal_quantity.val());
                    tr.seal_year.val(prev_tr.seal_year.val());
                    tr.seal_owner_type.val(prev_tr.seal_owner_type.val());
                }
            }
            
            conts_obj[return_table.conts.val()][tr.pos] = tr;
        };
        
        this.add_cars_in_table = function(p_cont_with_csl){
            p_cont_with_csl.forEach(function(item) {
                return_table.conts.val(item.CONT_NUMBER);
                self.add_row_in_table(item.SEAL_TYPE_ID,item.SEAL_MARKS,item.SEAL_QUANTITY,item.SEAL_YEAR,item.SEAL_OWNER_TYPE_ID);
            });
        };

        this.get_check_elements = function(){
            var l_result = '';
            tr_mas.forEach(function(item){
                if (item.checkbox.prop('checked')===true){
                    item.shops.forEach(function(shop){
                        l_result+=shop.shop_info_id+':'+item.freight_name_oebs.val()+'|';
                    });
                }
            });
            return l_result;
        };
        
        this.empty_table = function(){
            return_table.find('tbody').empty();
        };

        this.get_table = function(){
            return return_table;
        };
        
        this.get_rows = function(){
            var l_res = '';
            return_table.conts.children().each(function(){
                var cont_number = $(this).val();

                conts_obj[cont_number].forEach(function(item){
                    var seal_type = item.seal_type.val();
                    var seal_marks = item.seal_marks_part1.val()+item.seal_marks_part2.val()+item.seal_marks_part3.val();
                    var seal_quantity = item.seal_quantity.val();
                    var seal_year = item.seal_year.val();
                    var seal_owner_type = item.seal_owner_type.val();

                    l_res+=cont_number+'|';
                    l_res+=(seal_type!==''?seal_type:'_')+'|';
                    l_res+=(seal_marks!==''?seal_marks:'_')+'|';
                    l_res+=(seal_quantity!==''?seal_quantity:'_')+'|';
                    l_res+=(seal_year!==''?seal_year:'_')+'|';
                    l_res+=(seal_owner_type!==null?seal_owner_type:'_');

                    l_res+= '$';
                });
            });
            return l_res;
        };
        
        this.get_flag_same_elements = function(){
            var l_marks = '';
            return_table.conts.children().each(function(){
                var cont_number = $(this).val();

                conts_obj[cont_number].forEach(function(item){
                    var seal_marks = item.seal_marks_part1.val()+item.seal_marks_part2.val()+item.seal_marks_part3.val();

                    l_marks+=(seal_marks!==''?seal_marks:'_')+'|';

                });
            });
            
            var l_result = false;
            return_table.conts.children().each(function(){
                var cont_number = $(this).val();

                conts_obj[cont_number].forEach(function(item){
                    var seal_marks = item.seal_marks_part1.val()+item.seal_marks_part2.val()+item.seal_marks_part3.val();
                    if (l_marks.indexOf(seal_marks)!=l_marks.lastIndexOf(seal_marks)){
                        l_result = true;
                    }
                });
            });
            return l_result;
        };
        
        this.disable_table = function (p_value){
            return_table.conts.attr('disabled',p_value);
            return_table.add_row.attr('disabled',p_value);
        };
    };
    
    function enter_claim_ajax(p_car_number,p_claim_number){
        var res='';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { car_number: p_car_number
                   ,claim_number: p_claim_number
                   ,ajax_action: 'enter_claim'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;  
    }
    function get_car_conts(p_car_number){
        var res='';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {car_number: p_car_number 
                    ,ajax_action: 'get_car_containers'
                    },
            success: function (data) {
                    res = JSON.parse(data);
                }
        });
        return res;  
    }
    function get_claim_ajax(p_car_number){
        var res='';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { car_number: p_car_number
                   ,ajax_action: 'get_claim'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;  
    }
    function fill_select_with_graph(p_select,p_claim_number){
        p_select.empty();
        p_select.append($('<option>'));
        
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {claim_number: p_claim_number 
                    ,ajax_action: 'get_graph_pod'
                    },
            success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.DESCR).val(item.ROW_ID).attr('add_descr',item.ADD_DESCR);
                        if (records.length == 1){
                            l_option.attr('selected',true);
                        }
                        p_select.append(l_option);
                    }); 
                }
        });
    }
    function fill_select_with_otpr(p_select,p_claim_number){
        p_select.empty();
        p_select.append($('<option>'));
        
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {claim_number: p_claim_number 
                    ,ajax_action: 'get_claim_otpr'
                    },
            success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.DESCR+' своб. ваг = '+item.FREE_CAR_COUNT).val(item.OTPR_NOM).attr('telefon',item.TELEFON);
                        if (records.length == 1){
                            l_option.attr('selected',true);
                        }
                        p_select.append(l_option);
                    }); 
                }
        });
    }
    function fill_select_with_recip_address(p_select,p_claim_number){
        p_select.empty();
        p_select.append($('<option>'));
        
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {claim_number: p_claim_number 
                    ,ajax_action: 'get_recip_address'
                    },
            success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.ADDRESS).val(item.ADDRESS_ID);
                        if (records.length == 1){
                            l_option.attr('selected',true);
                        }
                        p_select.append(l_option);
                    }); 
                }
        });
    }
    function fill_select_with_depl_person(p_select){
        p_select.empty();
        p_select.append($('<option>'));
        
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_depl_person'
                    },
            success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.NAME).val(item.ID);
                        if (records.length == 1){
                            l_option.attr('selected',true);
                        }
                        p_select.append(l_option);
                    }); 
                }
        });
    }
    function get_front_end_id_ajax(p_car_number){
        var res='';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { car_number: p_car_number
                   ,ajax_action: 'get_front_end_id'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;  
    }
    function get_send_inv_number_ajax(p_car_number){
        var res='';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { car_number: p_car_number
                   ,ajax_action: 'get_send_inv_number'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;  
    }
    function get_claim_info_ajax(p_car_number){
        var res='';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { car_number: p_car_number
                   ,ajax_action: 'get_claim_info'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;  
    }
    function get_inv_cont_csl_ajax(p_front_end_id){
        var l_res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {front_end_id: p_front_end_id 
                    ,ajax_action: 'get_inv_cont_csl'
                    },
            success: function (data) {
                    l_res =  JSON.parse(data);
                }
        });
        return l_res;
    }
    function create_return_invoice_ajax(p_car_number,p_otpr,p_graph,p_recip_address,p_recip_telefon,p_depl_person,p_cont_csl){
        var res='';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { car_number: p_car_number
                   ,otpr: p_otpr
                   ,graph: p_graph
                   ,recip_address: p_recip_address
                   ,recip_telefon: p_recip_telefon
                   ,depl_person: p_depl_person
                   ,cont_csl: p_cont_csl
                   ,ajax_action: 'create_return_invoice_adapter'
            },
            success: function (data) {
                //alert(data);
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;  
    }
    function send_invoice_to_etran_ajax(p_car_number){
        var res='';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { car_number: p_car_number
                   ,ajax_action: 'send_invoice_to_etran'
            },
            success: function (data) {
                //alert(data);
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;  
    }
    function close_return_invoice_ajax(p_car_number){
        var res='';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { car_number: p_car_number
                   ,ajax_action: 'close_return_invoice'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;  
    }
    
    var l_car_number = p_clicked_li.attr('data-id');
    
    var md_div = $('<div/>')
        .attr('title','Возврат порожняка')
        .appendTo('body');
    
    md_div.disable_inputs = function(p_value){
        md_div.claim_otpr.attr('disabled',p_value);
        md_div.graph_pod.attr('disabled',p_value);
        md_div.recip_address.attr('disabled',p_value);
        md_div.recip_telefon.attr('disabled',p_value);
        md_div.depl_person.attr('disabled',p_value);
        if (l_car_conts.length != 0){
            cont_csl_table.disable_table(p_value);
        }
        
        if (p_value == false){
            md_div.claim_otpr.addClass('required');
            md_div.graph_pod.addClass('required');
            md_div.recip_address.addClass('required');
            md_div.recip_telefon.addClass('required');
            /*if (l_car_conts.length != 0){
                md_div.depl_person.addClass('required');
            }*/
        }
    };
    
    md_div.inv_number = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'100px'}}).prop( "disabled", true );
    md_div.client_inv_number = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'100px'}}).prop( "disabled", true );
    md_div.claim = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'100px'}}).attr({'maxlength':'10'});
    md_div.enter_claim_btn = $('<input>',{type:'button', class:'btnFind',css:{'margin-left':'5px'}}).val('Обновить');
    md_div.claim_otpr = $('<select>',{css:{'width':'300px'}});
    md_div.graph_pod = $('<select>',{css:{'width':'300px'}});
    md_div.recip_address = $('<select>',{css:{'width':'260px'}});
    md_div.recip_telefon = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'130px'}}).attr({'maxlength':'20'});
    md_div.depl_person = $('<select>',{css:{'width':'180px'}});
    
    md_div.claim.autocomplete({
        source: function(request, response){
          // организуем кроссдоменный запрос 
          $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            // параметры запроса, передаваемые на сервер (последний - подстрока для поиска):
            data:{
                enter_text: request.term,
                ajax_action: 'get_suitable_claims'

            },
            // обработка успешного выполнения запроса
            success: function(data){
              // приведем полученные данные к необходимому формату и передадим в предоставленную функцию response
                //alert(data);
                var l_res = JSON.parse(data);

                response($.map(l_res, function(item){
                return{
                  label: item.NAME,
                  value: item.NAME
                };
              }));
            }
          });
        },
        minLength: 6
    });
    
    md_div.client_inv_number.val(get_front_end_id_ajax(l_car_number));
    md_div.inv_number.val(get_send_inv_number_ajax(l_car_number));
    md_div.claim.val(get_claim_ajax(l_car_number));
    
    fill_select_with_depl_person(md_div.depl_person);
    
    if (md_div.claim.val() != ''){
        fill_select_with_otpr(md_div.claim_otpr,md_div.claim.val());
        fill_select_with_graph(md_div.graph_pod,md_div.claim.val());
        fill_select_with_recip_address(md_div.recip_address,md_div.claim.val());
    }
    
    var l_claim_info = JSON.parse(get_claim_info_ajax(l_car_number));
    if (l_claim_info.length == 1){
        md_div.graph_pod.val(l_claim_info[0].GRAPH);
        md_div.recip_address.val(l_claim_info[0].RECIP_ADDRESS_ID);
        md_div.recip_telefon.val(l_claim_info[0].RECIP_TELEFON);
        md_div.depl_person.val(l_claim_info[0].DEPL_PERSON);
        md_div.claim_otpr.val(l_claim_info[0].OTPR_NOM);

        if (md_div.graph_pod.val()==''||md_div.graph_pod.val()==null){
            md_div.graph_pod.children('option[add_descr = "'+l_claim_info[0].GRAPH_ADD+'"]').prop('selected', true);
        }
    }
    
    md_div.enter_claim_btn.on('click', function(){
        start_loading_animation();
        var l_res = enter_claim_ajax(l_car_number,md_div.claim.val());
        if(l_res.substr(0,4)=='done'){
            fill_select_with_otpr(md_div.claim_otpr,md_div.claim.val());
            md_div.claim_otpr.trigger('change');
            fill_select_with_graph(md_div.graph_pod,md_div.claim.val());
            fill_select_with_recip_address(md_div.recip_address,md_div.claim.val());
            create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
            
            md_div.disable_inputs(false);
            md_div.claim.removeClass('required');
        }else{
            create_info_modal_dialog_new('Предупреждение','Процедура завершилась с ошибкой!!!'+'<br>'+l_res.substr(5));
        }
        stop_loading_animation();
    });
    
    md_div.claim_otpr.on('change', function(){
        md_div.recip_telefon.val(md_div.claim_otpr.children('option:selected').attr('telefon'));
    }); 
    
    md_div.append(
        $('<div>',{css:{'display':'table'}}).append(
            $('<div>',{class:'attr',css:{'border':'none','width':'450px'}})
                .append(
                    $('<div>')
                    .append($('<label>').text('Номер накладной'))
                    .append(md_div.inv_number)
                )
                .append(
                    $('<div>')
                    .append($('<label>').text('Клиентский номер'))
                    .append(md_div.client_inv_number)
                )
                .append(
                    $('<div>')
                    .append($('<label>').text('Заявка'))
                    .append(md_div.claim)
                    .append(md_div.enter_claim_btn)
                )
                .append(
                    $('<div>')
                    .append($('<label>').text('Отправка'))
                    .append(md_div.claim_otpr)
                )
                .append(
                    $('<div>')
                    .append($('<label>').text('График подач'))
                    .append(md_div.graph_pod)
                )
                .append(
                    $('<div>')
                    .append($('<label>').text('Адрес грузополучателя'))
                    .append(md_div.recip_address)
                )
                .append(
                    $('<div>')
                    .append($('<label>').text('Телефон грузополучателя'))
                    .append(md_div.recip_telefon)
                )
                .append(
                    $('<div>')
                    .append($('<label>').text('Ответственный за размещение груза'))
                    .append(md_div.depl_person)
                )
        )    
    );
    
    var l_car_conts = get_car_conts(l_car_number);
    var cont_csl_table;
    if (l_car_conts.length != 0) {
        var cont_csl_table = new table_for_cont_csl();
        cont_csl_table.set_conts(l_car_conts);
        md_div.append(cont_csl_table.get_table()); 

        var l_cont_csl = get_inv_cont_csl_ajax(md_div.client_inv_number.val());
        cont_csl_table.add_cars_in_table(l_cont_csl);
        cont_csl_table.trigger_event_cont_change();
    }
    
    if (md_div.claim.val()==''){
        md_div.disable_inputs(true);
        md_div.claim.addClass('required');
    }else{
        md_div.disable_inputs(false);
    }
    
    md_div.disable_save_btn = function(){
        if (md_div.claim_otpr.val()==''||md_div.graph_pod.val()==''||md_div.recip_address.val()==''||md_div.recip_telefon.val()==''/*||(l_car_conts.length != 0&&md_div.depl_person.val()=='')*/){
            $('#md_create_invoice_btn').attr( "disabled", true );
        }else{
            $('#md_create_invoice_btn').attr( "disabled", false );
        }
    };
    
    md_div.disable_send_to_etran_btn = function(){
        if (!r_send_invoice_to_etran || md_div.client_inv_number.val()=='' || md_div.depl_person.val()==''){
            $('#md_send_to_etran_btn').attr( "disabled", true );
        }else{
            $('#md_send_to_etran_btn').attr( "disabled", false );
        }
    };
    
    
    md_div.claim_otpr.on('change', function(){
        md_div.disable_save_btn();
    });
    md_div.graph_pod.on('change', function(){
        md_div.disable_save_btn();
    });
    md_div.recip_address.on('change', function(){
        md_div.disable_save_btn();
    });
    md_div.recip_telefon.on('change', function(){
        md_div.disable_save_btn();
    });
    md_div.depl_person.on('change', function(){
        md_div.disable_save_btn();
        md_div.disable_send_to_etran_btn();
    });
    
    md_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        draggable: false,
        buttons:{
            'Создать накладную':{
                text: "Создать накладную",
                  id: "md_create_invoice_btn",
               click: function(){
                    var l_exists_same_elements;
					//l_exists_same_elements =  cont_csl_table.get_flag_same_elements(); // rem 16.01.2023 BekmansurovRR
					// add 16.01.2023 BekmansurovRR из-за TypeError: cont_csl_table is undefined
					if (check_undefined(cont_csl_table)===1){
						l_exists_same_elements = cont_csl_table.get_flag_same_elements(); 
					}
                    
                    if (!l_exists_same_elements) {
                   
						var l_cont_csl = l_car_conts.length!=0?cont_csl_table.get_rows():'';
						
						start_loading_animation();
		
						var l_car_number = p_clicked_li.attr('data-id');

						var l_result = create_return_invoice_ajax(l_car_number,md_div.claim_otpr.val(),md_div.graph_pod.val(),md_div.recip_address.val(),md_div.recip_telefon.val(),md_div.depl_person.val(),l_cont_csl);

						if(l_result.substr(0,4)=='done'){
							md_div.client_inv_number.val(l_result.substr(5));
							create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!'+'<br>'+'Создана накладная с клиентским идентификатором: '+l_result.substr(5));
							$('#md_close_invoice_btn').attr( "disabled", false );
							$('#md_create_invoice_btn span').text('Обновить накладную');
							md_div.disable_send_to_etran_btn();
						}else{
							create_info_modal_dialog_new('Предупреждение','Процедура завершилась с ошибкой!!! ' + l_result.substr(5));
						}
                    }else{
                        create_info_modal_dialog_new('Предупреждение','Накладная не сохранилась, т.к. существуют ЗПУ с одинаковыми номерами!');
                    }

                    stop_loading_animation();
                }   
            },
            'Отправить в ЭТРАН':{
                text: "Отправить в ЭТРАН",
                  id: "md_send_to_etran_btn",
               click: function(){                    
                    start_loading_animation();
                    
                    var l_car_number = p_clicked_li.attr('data-id');
                    var l_result = send_invoice_to_etran_ajax(l_car_number);
                    
                    if(l_result.substr(0,4)=='done'){
                        md_div.client_inv_number.val(l_result.substr(5));
                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!'+'<br>'+l_result.substr(5));
                    }else{
                        create_info_modal_dialog_new('Предупреждение','Процедура завершилась с ошибкой!!!'+'<br>'+l_result.substr(5));
                    }
                   
                    stop_loading_animation();
                }   
            },
            'Очистить клиентский номер':{
                text: "Очистить клиентский номер",
                  id: "md_close_invoice_btn",
               click: function(){                    
                    start_loading_animation();
    
                    var l_car_number = p_clicked_li.attr('data-id');

                    var l_result = close_return_invoice_ajax(l_car_number);

                    if(l_result.substr(0,4)=='done'){
                        $('#md_close_invoice_btn').attr( "disabled", true );
                        md_div.client_inv_number.val('');
                        $('#md_create_invoice_btn span').text('Создать накладную');
                        md_div.disable_send_to_etran_btn();
                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                    }else{
                        create_info_modal_dialog_new('Предупреждение','Процедура завершилась с ошибкой!!!');
                    }

                    stop_loading_animation();
                }   
            },
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function() {
            $(this).remove();
        }
    });
    
    if (md_div.client_inv_number.val()==''){
        $('#md_close_invoice_btn').attr( "disabled", true );
    }else{
        $('#md_create_invoice_btn span').text('Обновить накладную');
    }
    md_div.disable_save_btn();
    md_div.disable_send_to_etran_btn();
    
    stop_loading_animation();
}
/* Уведомление ГУ */
function create_modal_dialog_list_notification_gu(){
    $('.context-menu').remove();
    start_loading_animation();    
    
    function fill_select_notification(p_select){
        p_select.empty();
        
        p_select.append($('<option>'));
        
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_notifications_gu'},
            success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.NAME).val(item.ID);
                        p_select.append(l_option);
                    }); 
                }
        });
    }
    
    var md_div = $('<div/>')
        .attr('title','Открыть уведомление')
        .appendTo('body');

    md_div.notification = $('<select>',{class:'required'});
    fill_select_notification(md_div.notification);
    
    md_div
        .append(
            $('<div>',{css:{'display':'table'}}).append(
                $('<div>',{class:'attr',css:{'border':'none'/*,'width':'515px'*/}})
                    .append(
                        $('<div>')
                            .append($('<label>').text('Номер уведомления'))
                            .append(md_div.notification)
                    )
            ) 
        );
        
    md_div.notification.combobox({menuMaxHeight: '30em'});    
        
    md_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Открыть':{
                text: "Открыть",
                  id: "md_ok_btn",
               click: function(){
                    var l_not_id = md_div.notification.val();
                    if (l_not_id == '') {
                        create_info_modal_dialog_new('Предупреждение','Выберите уведомление!');
                    }else{
                        md_div.dialog("close");
                        create_modal_dialog_notification_gu(l_not_id);
                    }
               }   
            }, 
            'Закрыть': function(){
                $(this).dialog( "close" );
            }       
        },
        close: function() {
            $(this).remove();
        }
    });
        
    stop_loading_animation();
}
/* Регистрация уведомлений ГУ */
function create_modal_dialog_notification_gu(p_not_id){
    $('.context-menu').remove();
    start_loading_animation();
    
	
	
    function notification_gu_ajax(p_not_id,
							p_cars,
							p_num,
							p_notification_time,
							p_notification_person_from,
							p_comment,
							p_notification_time_fact,
							p_notification_person_to,
							p_crg_pcalid
							) {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { not_id: p_not_id
                   ,cars: p_cars
                   ,num:p_num
                   ,notification_time:p_notification_time
                   ,notification_person_from:p_notification_person_from
                   ,comment:p_comment
                   ,notification_time_fact:p_notification_time_fact
                   ,notification_person_to:p_notification_person_to
				   ,crg_pcalid:p_crg_pcalid
                   ,ajax_action: 'register_notification_gu'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    
    function export_notif_etran_ajax(p_not_id, p_pcalid) {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { not_id: p_not_id
				   ,pcalid: p_pcalid
                   ,ajax_action: 'export_notif_etran'
            },
            success: function (data) {
                res = data;
            },
            error: function () {
                res = 'fail';
            }
        });
        return res;
    }
    
    function fill_select_users(p_select){
        p_select.empty();
        
        p_select.append($('<option>'));
        
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_users_for_notification'},
            success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.NAME).val(item.ID);
                        p_select.append(l_option);
                    }); 
                }
        });
    }
	
	function fill_select_pcalid_num(p_select){
        p_select.empty();
        
        p_select.append($('<option>'));
        
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_contract_default_for_gu'},
            success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.NAME).val(item.ID);
							if (item.SELECTED === 'Y') {
                                l_option.attr('selected', true);
                            }
							p_select.append(l_option);
                    }); 
                }
        });
    }
    
    function disable_save_btn(){
        if (md_div.notification_time.hasClass('red_bckg_color')||md_div.notification_time.val()==''||md_div.notification_person_from.val()==''||
            md_div.notification_time_fact.hasClass('red_bckg_color')||md_div.notification_time_fact.val()==''||md_div.notification_person_to.val()==''||
            md_div.notification_num.val()==''){
            $('#md_ok_btn').prop( "disabled", true );
        }else{
            $('#md_ok_btn').prop( "disabled", false );
        }
    }  
    
    function railcar_table_const_for_not_gu(){
        var self = this;
        this.add_error_msg = null;
        this.cars_table_total_row;
        this.cars_count = 0;
        this.cars_lenght= 0;
        
        this.cars_mas = [];

        var return_table = $('<div>');
        return_table.append(
            '<table class="received_cars_table gu_received_cars_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th></th>'+
                        '<th></th>'+
                        '<th>№</th>'+
                        '<th>Вагон</th>'+
                        '<th>Наим. груза</th>'+
                        '<th>Вес <br>груза</th>'+
                        '<th>Тара</th>'+
                        '<th>Вес <br>брутто</th>'+
                        '<th>Длина</th>'+
						'<th>Усл.<br>ед.ваг</th>'+
                        '<th>Контейнер</th>'+
                        '<th>ЗПУ</th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'
        );


        return_table.add_carnumber_input = $('<input>',{type:'text',css:{'font-size':'11px'}, class:'text ui-widget-content ui-corner-all'}).attr('size', '8').attr('maxlength', '8');

        this.car_number_input = return_table.add_carnumber_input;

        return_table.add_carnumber_btn = $('<input>',{type:'button',css:{'font-size':'11px','height':'17px'}, class:'btnAdd'}).val('Добавить');
        return_table.add_carnumber_btn.on('click', function(){
            self.add_cars_in_table(null,true);
        });
        return_table.add_carnumber_input.on('keypress', function(e){
            if(e.keyCode===13){
                self.add_cars_in_table(null,true);
            }
        });
        
        return_table.add_carnumber_div = $('<div>',{css:{'margin-left':'61px'}});
        return_table.append(
            return_table.add_carnumber_div
                .append(return_table.add_carnumber_input)
                .append(return_table.add_carnumber_btn)
        );

        return_table.cars_table = $('<table>',{class:'received_cars_table gu_received_cars_table'}).append($('<tbody>'));
        return_table.append(
            $('<div>',{class:'modalDialogContainer',css:{'display':'inline-block'}})  
            .append(return_table.cars_table)
        );
        return_table.cars_table_total_row = $('<tr>',{css:{'background':'#EBEBEB','font-weight':'bold'}});
        self.cars_table_total_row = return_table.cars_table_total_row;
        return_table.append(
            $('<table>',{class:'received_cars_table',css:{'margin-top':'-4px'}})
            .append(
                $('<tbody>').append(return_table.cars_table_total_row)
            )
        );

        this.check_transport_restriction = function (){
            null;
        };
        this.action_change_table = function (){
            null;
        };

        function up_down_cars_table_tr(p_action,p_tr){
            if (p_action==='up' && p_tr.prev().length!==0){
                var td = p_tr.children('td:nth-child(3)');
                td.text(parseInt(td.text())-1);
                var td_prev = p_tr.prev().children('td:nth-child(3)');
                td_prev.text(parseInt(td_prev.text())+1);

                p_tr.insertBefore(p_tr.prev());

            } else if (p_action==='down' && p_tr.next().length!==0){
                var td = p_tr.children('td:nth-child(3)');
                td.text(parseInt(td.text())+1);
                var td_next = p_tr.next().children('td:nth-child(3)');
                td_next.text(parseInt(td_next.text())-1);

                p_tr.insertAfter(p_tr.next());
            }
        }
		function del_cars_table_tr(p_tr){
			p_tr.nextAll().children('td:nth-child(0)').each(function(){
				$(this).text(parseInt($(this).text())-1);
			});
			p_tr.remove();
		}
        function change_cars_table_total_tr(){
            return_table.cars_table_total_row.find('td').remove();
            if (self.cars_count!==0) {
                var sum_weight_net = 0;
                return_table.cars_table.find('tr td:nth-child(6)').each(function(){
                    sum_weight_net+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });
                var sum_weight_dep = 0;
                return_table.cars_table.find('tr td:nth-child(7)').each(function(){
                    sum_weight_dep+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });
                var sum_weight_gross = 0;
                return_table.cars_table.find('tr td:nth-child(8)').each(function(){
                    sum_weight_gross+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });
                var sum_car_length = 0;
                return_table.cars_table.find('tr td:nth-child(9)').each(function(){
                    sum_car_length+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });
				var sum_car_cond_length = 0;
                return_table.cars_table.find('tr td:nth-child(10)').each(function(){
                    sum_car_cond_length+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });

                self.cars_lenght = Math.round(sum_car_length * 100)/100;
				self.cond_length_train = Math.round(sum_car_cond_length * 100)/100;

                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>Кол-во: '+ self.cars_count +'</td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>'+Math.round(sum_weight_net * 100)/100+'</td>');
                return_table.cars_table_total_row.append('<td>'+Math.round(sum_weight_dep * 100)/100+'</td>');
                return_table.cars_table_total_row.append('<td>'+ Math.round(sum_weight_gross * 100)/100 +'</td>');
                return_table.cars_table_total_row.append('<td>'+ Math.round(sum_car_length * 100)/100 +'</td>');
				return_table.cars_table_total_row.append('<td>'+ Math.round(sum_car_cond_length * 100)/100 +'</td>');
            }else{
                self.cars_lenght = 0;
				self.cond_length_train = 0;

                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>Кол-во: 0</td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>0</td>');
                return_table.cars_table_total_row.append('<td>0</td>');
                return_table.cars_table_total_row.append('<td>0</td>'); 
                return_table.cars_table_total_row.append('<td>0</td>'); 
				return_table.cars_table_total_row.append('<td>0</td>'); 
            }
            self.check_transport_restriction();
            self.action_change_table();
        }

        this.spec_check_car_number = function(p_car_number){
            return true;
        };
        this.check_car_number = function(p_car_number){
            var find_result = self.spec_check_car_number(p_car_number);
			
			
            if(return_table.cars_table.find('tr td:contains("'+p_car_number+'")').length!==0) {
                return_table.add_carnumber_input.addClass('red_bckg_color');
                alert('Вагон '+p_car_number+' уже добавлен!');
                return false;
            } 
			else if (!find_result && !user_admin){
				return_table.add_carnumber_input.addClass('red_bckg_color');
				if (this.add_error_msg === null){
					alert('На путях нет вагона с номером '+p_car_number+'!');
				}else{
					alert(this.add_error_msg);
				}
				return false;
            }else{
                return_table.add_carnumber_input.removeClass('red_bckg_color').val('');
            }
            return true;
        };

        this.add_cars_in_table = function(p_car_number,p_need_check){
            var add_car_number;
            if (p_car_number === null || p_car_number === '') {
                add_car_number = return_table.add_carnumber_input.val();
            } else {
                add_car_number = p_car_number;
            }

            var check_car_number_result = true;
            if (p_need_check) {
                check_car_number_result = self.check_car_number(add_car_number);
            }

            if (check_car_number_result && add_car_number !== null && add_car_number !== '') {
                $.ajax({
                    url: 'data.php',
                    type: 'POST',
                    dataType: "text",
                    async: false,
                    data: { cars: add_car_number
                           ,ajax_action: 'get_add_info_for_cars_with_round'
                          },
                    success: function (data) {
                        var records = JSON.parse(data);

                        for(var i=0; i<records.length; i++) {
                            self.cars_count++;
                            var child = records[i];

                            var tr = $('<tr/>');
                            tr.pos = self.cars_mas.length;

                            tr.up_image_div = $('<div>',{class:'up_image'}).on('click', function(){up_down_cars_table_tr('up',$(this).parent().parent());});
                            $('<td>').append(tr.up_image_div).appendTo(tr);

                            tr.down_image_div = $('<div>',{class:'down_image'}).on('click', function(){up_down_cars_table_tr('down',$(this).parent().parent());});
                            $('<td>').append(tr.down_image_div).appendTo(tr);

                            tr.append('<td>'+self.cars_count+'</td>');
                            tr.append('<td>'+child.ID+'</td>');
                            tr.append('<td>'+((child.FREIGHT_NAME !== null) ? child.FREIGHT_NAME : '')+'</td>');
                            tr.append('<td>'+((child.WEIGHT_NET !== null) ? child.WEIGHT_NET.replace(',','.') : '')+'</td>');
                            tr.append('<td>'+((child.WEIGHT_DEP !== null) ? child.WEIGHT_DEP.replace(',','.') : '')+'</td>');
                            tr.append('<td>'+((child.WEIGHT_GROSS !== null) ? child.WEIGHT_GROSS.replace(',','.') : '')+'</td>');
                            tr.append('<td>'+((child.CAR_LENGTH !== null) ? child.CAR_LENGTH.replace(',','.') : '')+'</td>');
							tr.append('<td>'+((child.COND_LENGTH_TRAIN !== null) ? child.COND_LENGTH_TRAIN.replace(',','.') : '')+'</td>');
                            
                            tr.cont_td = $('<td>').appendTo(tr);
                            if (child.CONT_FROM_INV !== null) {
                                var l_conts = child.CONT_FROM_INV.split('|');
                                l_conts.forEach(function(cont_num){
                                    var l_cont_descr = $('<div>',{'class':'gu-item-cont-div'}).appendTo(tr.cont_td);
                                    $('<input>',{'class':'gu-item-cont-input text ui-widget-content ui-corner-all','readonly':'true','css':{'background':'#DCDCDC'}/*,'disabled':true*/}).val(cont_num).appendTo(l_cont_descr);
                                });
                            }
                            
                            tr.csl_td = $('<td>').appendTo(tr);
                            if (child.CSL !== null) {
                            var l_csl_td = child.CSL.split('|');
                                l_csl_td.forEach(function(csl){
                                    var l_csl = csl.split('#');
                                    var l_csl_descr = $('<div>',{'class':'gu-item-cont-div'}).appendTo(tr.csl_td);
                                    $('<input>',{'class':'gu-item-cont-input text ui-widget-content ui-corner-all','readonly':'true','css':{'background':'#DCDCDC'}/*,'disabled':true*/}).val(l_csl[0]).appendTo(l_csl_descr);
                                    $('<input>',{'class':'gu-item-csl-type-input text ui-widget-content ui-corner-all','readonly':'true','css':{'background':'#DCDCDC'}/*,'disabled':true*/}).val(l_csl[1]).appendTo(l_csl_descr);
                                    $('<input>',{'class':'gu-item-csl-mark-input text ui-widget-content ui-corner-all','readonly':'true','css':{'background':'#DCDCDC'}/*,'disabled':true*/}).val(l_csl[2]).appendTo(l_csl_descr);
                                });
                            }
                            
                            tr.del_image_div = $('<div>',{class:'deleteImage deleteImage13px'})
                                .on('click', function(){
									var l_tr = $(this).parent().parent();
									var l_pos = $(l_tr).index();
									del_cars_table_tr(l_tr);
									delete self.cars_mas.splice(l_pos,1);
									self.cars_count--;
                                    change_cars_table_total_tr();
                                });
                            $('<td>').append(tr.del_image_div).appendTo(tr);
                            tr.appendTo(return_table.cars_table); 
                            
                            self.cars_mas[tr.pos] = tr;
                        }
                    },
                    error: function (m1,m2) {window.alert(m1+m2);}
                });
            }
            change_cars_table_total_tr();
        };

        this.get_cars_in_table = function(){
            var result = '';
            return_table.cars_table.find('tr').each(function(){
                result+= $(this).children('td:nth-child(4)').text() + '|';
            });
            return result;
        };

        this.get_table = function(){
            return return_table;
        };
        
        this.edit_table = function (p_edit){
            self.cars_mas.forEach(function(tr){
                if (p_edit){
                    tr.del_image_div.show();
                    tr.up_image_div.show();
                    tr.down_image_div.show();
                }else{
                    tr.del_image_div.hide();
                    tr.up_image_div.hide();
                    tr.down_image_div.hide();
                }
            });
            
            if (p_edit){
                return_table.add_carnumber_div.show();
            }else{
                return_table.add_carnumber_div.hide();
            }
        };
    };
    
    function run_report(p_not_id,p_user_name){
        var win = window.open('xx_etw_disl_003/xx_etw_disl_003.php?'+
                              'not_id='+p_not_id+'&'+
                              'user_name='+p_user_name
                             ,'_blank');
    }
    
    var md_div = $('<div/>')
        .attr('title','Регистрация уведомлений ГУ 26-2б ВЦ')
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append('<div style="display: table;">'+
                    '<div class="attr" style="width:330px;">'+
                        '<div>'+
                            '<label>Станция отправления:</label>'+
                            '<input disabled type="text" size="13" class="text ui-widget-content ui-corner-all" value="Водораздельная"></input>'+
                        '</div>'+
                        '<div>'+
                            '<label>Станция назначения:</label>'+
                            '<input disabled type="text" size="13" class="text ui-widget-content ui-corner-all" value="ПСП"></input>'+
                        '</div>'+
                    '</div>'+
                    '<div class="attr" style="margin-left:14px; text-align:right; float:right">'+
                        '<input disabled type="text" size="14" class="text ui-widget-content ui-corner-all" value="'+get_server_current_time()+'"></input><br>'+
                        '<input disabled type="text" size="20" class="text ui-widget-content ui-corner-all" style="margin-top:5px;" value="'+user_name+'"></input>'+
                    '</div>'+
                '</div>'
        );
    
	/*md_div.crg_pcalid_num = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required'}).attr('size', '20').prop( "disabled", true ); // add 08.11.2024 BekmansurovRR по наряду 0000068904 
    
	if (user_admin){
		$(md_div.crg_pcalid_num).prop( "disabled", false );
	}
	*/
	md_div.crg_pcalid_num = $('<select>',{class:'required'});
	
	md_div.notification_num = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required'}).attr('size', '20');
    md_div.not_number_etran = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all'}).attr('size', '20').prop( "disabled", true );
    md_div.not_state_etran = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all'}).attr('size', '20').prop( "disabled", true );
    md_div.notification_time = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
    md_div.notification_person_from = $('<select>',{class:'required'});
	
    md_div.comment = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'300px'}});
    
    md_div.notification_time_fact = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
    md_div.notification_person_to = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required'}).attr('size', '20');
    
    md_div
        .append(
            $('<div>',{css:{'display':'table'}}).append(
                $('<div>',{class:'attr',css:{'border':'none','width':'515px'}})
                    .append(
                        $('<div>')
                            .append($('<label>').text('Договор на ЭП'))
                            .append(md_div.crg_pcalid_num)
							
                    )
					.append(
                        $('<div>')
                            .append($('<label>').text('Номер уведомления'))
                            .append(md_div.notification_num)
                    )
                    .append(
                        $('<div>')
                            .append($('<label>').text('Номер уведомления (ЭТРАН)'))
                            .append(md_div.not_number_etran)
                    )
                    .append(
                        $('<div>')
                            .append($('<label>').text('Статус (ЭТРАН)'))
                            .append(md_div.not_state_etran)
                    )
            ) 
        )
        .append(
            $('<div>',{css:{'display':'table'}}).append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{class:'header',css:{'width':'180px'}}).text('Cтанция отправления')
                )
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'515px'}})
                        .append(                            
                            $('<div>')
                                .append($('<label>').text('Дата и время уведомления (Мск)'))
                                .append(md_div.notification_time) 
                        )
                        .append(
                            $('<div>')
                                .append($('<label>').text('Фамилия передавшего уведомление'))
                                .append(md_div.notification_person_from)
                        )
                        .append(
                            $('<div>')
                                .append($('<label>').text('Комментарий'))
                                .append(md_div.comment)
                        )
                    )
                )
            )
        )
        .append(
            $('<div>',{css:{'display':'table'}}).append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{class:'header',css:{'width':'180px'}}).text('Cтанция назначения')
                )
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'515px'}})
                        .append(                            
                            $('<div>')
                                .append($('<label>',{css:{'width':'320px','text-align':'left'}}).text('Дата и время факта передачи уведомления (Мск)'))
                                .append(md_div.notification_time_fact) 
                        )
                        .append(
                            $('<div>')
                                .append($('<label>').text('Кто принял'))
                                .append(md_div.notification_person_to)
                        )
                    )
                )
            )
        )
    ;
    	
    init_date_time_input(md_div.notification_time);
    init_date_time_input(md_div.notification_time_fact);
    fill_select_users(md_div.notification_person_from);
	fill_select_pcalid_num(md_div.crg_pcalid_num);
    
    var railcar_table = new railcar_table_const_for_not_gu();
    md_div.append(railcar_table.get_table());
    if (return_selected_cars() !== '' && p_not_id == null){
        railcar_table.add_cars_in_table(return_selected_cars(),false);
    }
	railcar_table.add_error_msg = 'Регистрировать уведомление можно только для вагонов на станции Водороздельная!';
    // rem 31.01.2024 временно
	railcar_table.spec_check_car_number = function(p_car_number){
        var find_result = $('#currentCarstree').find('li[data-id='+p_car_number+'][data-type="railcar"]');
        if (find_result.length == 0){
            return false;
        }
        return true;
    };
    
    md_div.notification_num.on('blur',function(){disable_save_btn();});
    md_div.notification_person_from.on('change', function(){disable_save_btn();});
    md_div.notification_time.on('blur',function(){disable_save_btn();});
    md_div.notification_time_fact.on('blur',function(){disable_save_btn();});
    md_div.notification_person_to.on('blur',function(){disable_save_btn();});
  
    if (p_not_id != null){
        //md_content.request_id = p_request_item.request_id;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { not_id: p_not_id
                   ,ajax_action: 'get_notification_gu'},
            success: function (data) {
                var l_not = JSON.parse(data);
				md_div.crg_pcalid_num.val(l_not[0].CRG_PCALID);
                md_div.notification_num.val(l_not[0].NOT_NUMBER);
                md_div.not_number_etran.val(l_not[0].NOT_NUMBER_ETRAN);
                md_div.not_state_etran.val(l_not[0].NOT_STATE_ETRAN);
                md_div.notification_time.val(l_not[0].NOT_TIME);
                md_div.notification_person_from.val(l_not[0].NOT_PERSON_FROM);
                md_div.comment.val(l_not[0].NOT_COMMENT);
                md_div.notification_time_fact.val(l_not[0].NOT_TIME_FACT);
                md_div.notification_person_to.val(l_not[0].NOT_PERSON_TO);
                railcar_table.change_rows = false;
                railcar_table.add_cars_in_table(l_not[0].CARS,false);
                
                md_div.notification_num.prop( "disabled", true );
                md_div.notification_time.prop( "disabled", true );
                md_div.notification_person_from.prop( "disabled", true );
                md_div.comment.prop( "disabled", true );
                md_div.notification_time_fact.prop( "disabled", true );
                md_div.notification_person_to.prop( "disabled", true );
                railcar_table.edit_table(false);
                
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
    }
    
    md_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Отчет в Excel':{
                text: "Отчет в Excel",
                  id: "md_report_btn",
               click: function(){
                    run_report(p_not_id,user_name);
            }},
            'Экспорт в ЭТРАН':{
                text: "Экспорт в ЭТРАН",
                  id: "md_export_etran_btn",
               click: function(){
                    start_loading_animation();
                    var l_pcalid = md_div.crg_pcalid_num.val();
                    var l_result = export_notif_etran_ajax(p_not_id, l_pcalid);
					//console.log(l_result);
                    if(l_result.substr(0,4)=='done'){
                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                        $('#md_edit_btn').hide();
                    }else{
                        create_info_modal_dialog_new('Предупреждение','Процедура завершилась с ошибкой!!!'+'<br>'+l_result.substr(5));
                    }
                    
                    md_div.dialog("close");
                    
                    stop_loading_animation();       
               }   
            }, 
            'Редактировать':{
                text: "Редактировать",
                  id: "md_edit_btn",
               click: function(){
                    $('#md_save_btn').show();
                    $('#md_export_etran_btn').hide();
                    $('#md_edit_btn').hide();
                    $('#md_report_btn').hide();
                    railcar_table.edit_table(true);
               }   
            }, 
            'Сохранить':{
                text: "Сохранить",
                  id: "md_save_btn",
               click: function(){
                    start_loading_animation();
                    
                    if (check_open_period('1',md_div.notification_time.val())=='0') {
                        create_info_modal_dialog_new('Оповещение','Для даты '+md_div.notification_time.val()+' нет открытого периода! Сохранить уведомление не возможно!');
                    }else{
                        var cars_in_table = railcar_table.get_cars_in_table();
						//console.log(cars_in_table);
						
						//console.log(cars_in_table);
						//return;
                        var l_result = notification_gu_ajax(p_not_id,
															cars_in_table,
															md_div.notification_num.val(),
															md_div.notification_time.val(),
															md_div.notification_person_from.val(),
															md_div.comment.val(),
															md_div.notification_time_fact.val(),
															md_div.notification_person_to.val(),
															md_div.crg_pcalid_num.val()
															);

                        if(l_result.substr(0,4)=='done'){
                            var cars_in_table_mas = cars_in_table.split('|');
                            cars_in_table_mas.pop();
                            var l_time = md_div.notification_time.val();
                            var l_span_text = '(п/у '+l_time.substr(0,5)+' '+l_time.substr(11)+')';
                            cars_in_table_mas.forEach(function(car_num){
                                //alert(car_num);
                                var l_car_in_tree = $('#currentCarstree').find('li[data-id='+car_num+'][data-type="railcar"]');
                                if (l_car_in_tree.length == 1){
                                    l_car_in_tree.append($('<span>').text(l_span_text));
                                    l_car_in_tree.attr('data-notification-gu','Y');
                                }
                            });
                            create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                        }else{
                            create_info_modal_dialog_new('Предупреждение','Процедура завершилась с ошибкой!!!');
                        }
                        if (p_not_id != null){
                            $('#md_save_btn').hide();
                            $('#md_export_etran_btn').show();
                            $('#md_edit_btn').show();
                            $('#md_report_btn').show();
                        }else{
                            md_div.dialog("close");
                        }
                    }
                    
                    stop_loading_animation();       
               }   
            }, 
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        },
        close: function(){
            $(this).remove();
        }
    });
    
    if (p_not_id != null){
        $('#md_save_btn').hide();
    } else{
        $('#md_report_btn').hide();
    }
    if (p_not_id == null || md_div.not_number_etran.val()!=''){
        $('#md_export_etran_btn').hide();
        $('#md_edit_btn').hide();
    }
    
    disable_save_btn();
    stop_loading_animation();
}
/*Вывод. Вагон разобран*/
function create_md_output_cars(){
    function output_cars_ajax(p_cars,p_oper_date,p_comment) {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { cars: p_cars
                   ,oper_date: p_oper_date
                   ,comment: p_comment
                   ,ajax_action: 'output_cars'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    function disable_save_btn(){
        if (md_div.custom_time.hasClass('red_bckg_color')||md_div.custom_time.val()==''||md_div.comment.val()==''){
            $('#md_ok_btn').prop( "disabled", true );
        }else{
            $('#md_ok_btn').prop( "disabled", false );
        }
    }
    $('.context-menu').remove();
    start_loading_animation();
    
    var l_cars = returnSelectedElem(); //сохраняем выбранные элементы

    // создаем div для отображения модального окна
    var md_div = $('<div/>')
        .attr('id','modalDialog')
        .attr('title','Вывод. Вагон разобран.')
        .appendTo('body'); // Присоединяем наше меню к body документа: 
       
    md_div.custom_time = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
    md_div.comment = $('<input>',{type:'text', class:'text ui-widget-content ui-corner-all required',css:{'width':'300px'}});
       
    md_div
        .append($('<div>',{class:'attr',css:{'border':'none','width':'440px'}})
            .append(                            
                $('<div>')
                    .append($('<label>').text('Дата и время операции'))
                    .append(md_div.custom_time) 
            )
            .append(
                $('<div>')
                    .append($('<label>').text('Комментарий'))
                    .append(md_div.comment)
            )
        );
       
    // инициализируем input с датой
    init_date_time_input(md_div.custom_time);
    
    md_div.custom_time.on('blur',function(){disable_save_btn();});
    md_div.comment.on('blur',function(){disable_save_btn();});
    
    // вызываем модальное окно 
    md_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        buttons:{
            'Отправить':{
                text: "Сохранить",
                  id: "md_ok_btn",
               click: function(){
                if (output_cars_ajax(l_cars,md_div.custom_time.val(),md_div.comment.val())==='done') {
                    var l_cars_mas = l_cars.split('$'); //создаем массив
                    l_cars_mas.pop(); //убираем последний элемент массива, т.к. он пустой
                    l_cars_mas.forEach(function(item, i, arr) {
                        var items = item.split('|');
                        $('li[data-id="'+items[0]+'"][data-type="'+items[1]+'"]').remove();
                    });
                    //changeRailcarCount();
                    
                    md_div.dialog("close");
                    create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
                }else{
                    md_div.dialog("close");
                    create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
                }
                clear_add_info();
                
                md_div.dialog( "close" ); 
            }},
            'Закрыть': function(){
                md_div.dialog( "close" );
            }
        },
        close: function() {
            md_div.remove();
        }
    }); 
    
    disable_save_btn();
    stop_loading_animation();
}
/*Форма: Паспорт вагонов*/
function create_md_cars_passport(p_feel_table){
    function get_cars_passport_ajax(p_cars) {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { cars: p_cars
                   ,ajax_action: 'get_cars_passport'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
    function run_report(p_car_number,p_user_name){
        var win = window.open('xx_car_nsi_report/xx_car_nsi_report.php?'+
                              'car_number='+p_car_number+'&'+
                              'user_name='+p_user_name
                             ,'_blank');
    }
    
    
    $('.context-menu').remove();
    start_loading_animation();
    
    var l_cars = return_selected_cars();

    // создаем div для отображения модального окна
    var md_div = $('<div/>')
        .attr('id','modalDialog')
        .attr('title','Паспорт вагона')
        .appendTo('body'); // Присоединяем наше меню к body документа: 

    var l_car_input = $('<input>',{type:'text',class:'text ui-widget-content ui-corner-all',css:{'width':'5em'}});
    var l_add_btn = $('<button>',{class:'button',css:{'margin-left':'1em'}}).append($('<span>',{class:'button-text button-text-size-2'}).text('Добавить'));
    var l_refresh_railcar_div = $('<div>',{class:'border',css:{'display':'table'}})
            .append(
                $('<div>',{css:{'float':'left'}})
                    .append($('<span>').text('Вагон: '))
                    .append(l_car_input)
                    .append(l_add_btn)
            );
    
    md_div.append(l_refresh_railcar_div);
    
    l_car_input.on('keypress', function (e){
        // Разрешаем: backspace, delete, влево, вправо
        if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
            return;
        }

        var chr = String.fromCharCode(e.charCode);

        if (chr == null) return;

        if (chr < '0' || chr > '9') {
            return false;
        }
    }); 

    l_car_input.on('keyup', function (e){        
        if (check_car_number($(this).val())){                
            $(this).addClass('true-car-number');
            $(this).removeClass('wrong-car-number');
            l_add_btn.prop('disabled',false);
        } else{
            $(this).addClass('wrong-car-number');
            $(this).removeClass('true-car-number'); 
            $(this).attr('title','Неправильный номер вагона/платформы!');
            l_add_btn.prop('disabled',true);
        }
    });
        
    var l_div = $('<div/>').css({'float':'left'}).appendTo(md_div);
    var r_div = $('<div/>').css({'float':'left','overflow':'auto','max-width':'900px','width':'900px'}).appendTo(md_div);
    
    var l_table = $('<table>')
        .addClass('addInfoTable car_passport_table car_passport_table_l')
        .appendTo(l_div);

    l_table.tbody = $('<tbody>')
        .appendTo(l_table);

    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Номер вагона'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Статус вагона'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Дата след. планового ремонта'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Норма пробега'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Род вагона'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Модель вагона'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Год выпуска вагона'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Количество осей'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Страна собственник'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Тип собственности'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Собственник ОКПО'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Собственник Наименование'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Грузоподъемность(т)'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Масса тары(ц)'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Объем кузова'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Арендатор Код ОКПО'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Арендатор Наименование'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Дата окончание аренды'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Длина вагона(м)'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Дата исключения из ГВЦ'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Доп. информация'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Дата обновления НСИ'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Дата запроса(ЭТРАН)'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Пользователь'));
    $('<tr>').appendTo(l_table.tbody).append($('<td>').text('Последний подход на Углеуральскую'));
    
    var list_of_cars_mas = [];
    var r_table = $('<table>')
        .addClass('addInfoTable car_passport_table')
        .css({'float':'left'})
        .appendTo(r_div);

    r_table.tbody = $('<tbody>')
        .appendTo(r_table);
    r_table.add_car = function(p_car_info){
        function get_value(p_num,p_car_info){
            var l_text;
            switch(p_num) {
              case 0: 
                l_text = p_car_info.CAR_NUMBER; break;
              case 1: 
                l_text = p_car_info.STATUS; break;
              case 2: 
                l_text = p_car_info.CAR_LAST_REPAIR; break;
              case 3: 
                l_text = p_car_info.CAR_NORMA; break;
              case 4: 
                l_text = p_car_info.CAR_TYPE_NAME; break;
              case 5: 
                l_text = p_car_info.CAR_MODEL; break;
              case 6: 
                l_text = p_car_info.CAR_YEAR; break;
              case 7: 
                l_text = p_car_info.CAR_AXLES; break;
              case 8: 
                l_text = p_car_info.CAR_OWNER_COUNTRY_NAME; break;
              case 9: 
                l_text = p_car_info.CAR_OWNER_TYPE_NAME; break;
              case 10: 
                l_text = p_car_info.CAR_OWNER_OKPO; break;
              case 11: 
                l_text = p_car_info.CAR_OWNER_NAME; break;
              case 12: 
                l_text = p_car_info.CAR_TONNAGE; break;
              case 13: 
                l_text = p_car_info.CAR_WEIGHT_DEP; break;
              case 14: 
                l_text = p_car_info.CAR_VOLUME; break;
              case 15: 
                l_text = p_car_info.CAR_ARENDATOR_OKPO; break;
              case 16: 
                l_text = p_car_info.CAR_ARENDATOR_NAME; break;
              case 17: 
                l_text = p_car_info.CAR_END_ARENDA_DATE; break;
              case 18: 
                l_text = p_car_info.CAR_LENGTH; break;
              case 19: 
                l_text = p_car_info.GVC_DATE; break;
              case 20: 
                l_text = p_car_info.TEXT_TELEG; break;
              case 21: 
                l_text = p_car_info.CAR_NSI_DATE; break;
              case 22: 
                l_text = p_car_info.XX_LAST_UPDATE_DATE; break;
              case 23: 
                l_text = p_car_info.XX_LAST_UPDATED_BY; break;
              case 24: 
                l_text = p_car_info.UGL_DATE; break;
              default:
                l_text = null;
                break;
            }
            return l_text===null?'':l_text;
        } 
        function add_td(p_tr,p_num,p_car_info){
            var l_td = $('<td>');
            l_car_descr.mas_td.push(l_td);

            p_tr.append(l_td);

            if (p_num==0){
                l_td.car_number = get_value(p_num,p_car_info);
                var l_div = $('<div>').css({'position':'relative','width':'140px','height':'20px'}).appendTo(l_td).append(get_value(p_num,p_car_info));
                l_car_descr.remove_btn = $('<button>')
                    .addClass('request-button cars-item-car-span-delete-button')
                    .attr('title','Удалить вагон')
                    .append('<span class="request-button-icon delete-button-icon"></span>')
                    .appendTo(l_div)
                    .on('click', function(){
                        l_car_descr.mas_td.forEach(function(td){
                            td.remove();
                        });
                        delete list_of_cars_mas[l_car_descr.pos];
                    });  
            }else{
                l_td.append(get_value(p_num,p_car_info));
            }
        }
        
        var l_car_descr = {};
        l_car_descr.pos = list_of_cars_mas.length;
        list_of_cars_mas[l_car_descr.pos] = l_car_descr;
        
        l_car_descr.mas_td = [];
        
        var tr_s = r_table.tbody.children('tr');
        if (tr_s.length == 0) {     
            for (var i=0;i<=24;i++){
                var l_tr = $('<tr>').appendTo(r_table.tbody);
                add_td(l_tr,i,p_car_info);
            }
        } else {
            tr_s.each(function(indx,elem){
                add_td($(elem),indx,p_car_info);
            });
        }
        
        tr_s.each(function(indx,elem){
            var l_h = $(elem).outerHeight();
            var l_indx = indx+1;
            var l_tr = l_table.tbody.children('tr:nth-child('+l_indx+')');
            l_tr.css('height',l_h+'px');
        });
    };
    
    if (p_feel_table) {
        var l_cars_ajax = get_cars_passport_ajax(l_cars);
        var l_cars_mas = JSON.parse(l_cars_ajax); 
        l_cars_mas.forEach(function(item){
            r_table.add_car(item);
        });
    }
    l_add_btn.on('click', function(){
        start_loading_animation();
        var l_cars_ajax = get_cars_passport_ajax(l_car_input.val());
        var l_cars_mas = JSON.parse(l_cars_ajax); 
        l_cars_mas.forEach(function(item){
            r_table.add_car(item);
        });
        l_car_input.val('');
        l_car_input.trigger('keyup');
        stop_loading_animation();
    });
    md_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        buttons:{
            'Отчет в Excel':{
                text: "Отчет в Excel",
                  id: "md_report_btn",
               click: function(){
                    var l_car_list = '';
                    list_of_cars_mas.forEach(function(item){
                        l_car_list += item.mas_td[0].car_number+'|'
                    });
                    run_report(l_car_list,user_name);
            }},
            'Закрыть': function(){
                md_div.dialog( "close" );
            }
        },
        close: function() {
            md_div.remove();
        }
    }); 
    
    var tr_s = r_table.tbody.children('tr');
    tr_s.each(function(indx,elem){
        var l_h = $(elem).outerHeight();
        var l_indx = indx+1;
        var l_tr = l_table.tbody.children('tr:nth-child('+l_indx+')');
        l_tr.css('height',l_h+'px');
    });
    
    l_add_btn.prop('disabled',true);
    stop_loading_animation();
}
/* Назначить ЗУ */
function create_contect_menu_2lvl_add_fix_device(p_railway_id,p_x,p_y) {
    if ($('#context_menu_2lvl_send_to_station').length===0) {
        var l_params = {};
        l_params.railway_id = p_railway_id;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {params: JSON.stringify(l_params)
                    ,ajax_action: 'get_railway_parts'},
            success: function (data) {
                    var records = JSON.parse(data);
                    var ul = $('<ul/>');
                    $.each(records, function( i, item ) {
                        ul.append(
                            $('<li/>')
                            .css({'margin-left': (item.LVL-1)*10 + 'px'})
                            .text(item.NAME)
                            .attr('data-id',item.ID)
                        );
                    });
                    $('<div/>',{class: 'context-menu context-menu-2lvl'})  // Присваиваем блоку наш css класс контекстного меню:
                    .attr('id','context_menu_2lvl_send_to_station')
                    .css({                 
                            left: p_x+'px', // Задаем позицию меню на X                 
                            top: p_y+'px' // Задаем позицию меню по Y             
                    })
                    .appendTo('body') // Присоединяем наше меню к body документа: 
                    .append(ul)
                    .on('click',function(event){
                        $('.context-menu').remove();
                        create_window_add_fix_device(p_railway_id,$(event.target).attr('data-id'));
                    })
                    .show('fast'); // Показываем меню с небольшим стандартным эффектом jQuery. Как раз очень хорошо подходит для меню     
                }

        });
    }
}

/* Снятие ЗУ */
function create_contect_menu_2lvl_undock_fix_device(p_railway_id,p_x,p_y) {
    if ($('#context_menu_2lvl_send_to_station').length===0) {
        var l_params = {};
        l_params.railway_id = p_railway_id;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {params: JSON.stringify(l_params)
                    ,ajax_action: 'get_railway_parts'},
            success: function (data) {
                    var records = JSON.parse(data);
                    var ul = $('<ul/>');
                    $.each(records, function( i, item ) {
                        ul.append(
                            $('<li/>')
                            .css({'margin-left': (item.LVL-1)*10 + 'px'})
                            .text(item.NAME)
                            .attr('data-id',item.ID)
                        );
                    });
                    $('<div/>',{class: 'context-menu context-menu-2lvl'})  // Присваиваем блоку наш css класс контекстного меню:
                    .attr('id','context_menu_2lvl_send_to_station')
                    .css({                 
                            left: p_x+'px', // Задаем позицию меню на X                 
                            top: p_y+'px' // Задаем позицию меню по Y             
                    })
                    .appendTo('body') // Присоединяем наше меню к body документа: 
                    .append(ul)
                    .on('click',function(event){
                        $('.context-menu').remove();
						//alert('Форма в разработке');
						
                        create_window_undock_fix_device(p_railway_id,$(event.target).attr('data-id'));
                    })
                    .show('fast'); // Показываем меню с небольшим стандартным эффектом jQuery. Как раз очень хорошо подходит для меню     
                }

        });
    }
}

/* Корректировка ЗУ */
function create_contect_menu_2lvl_update_fix_device(p_railway_id,p_x,p_y) {
    if ($('#context_menu_2lvl_send_to_station').length===0) {
        var l_params = {};
        l_params.railway_id = p_railway_id;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {params: JSON.stringify(l_params)
                    ,ajax_action: 'get_railway_parts'},
            success: function (data) {
                    var records = JSON.parse(data);
                    var ul = $('<ul/>');
                    $.each(records, function( i, item ) {
                        ul.append(
                            $('<li/>')
                            .css({'margin-left': (item.LVL-1)*10 + 'px'})
                            .text(item.NAME)
                            .attr('data-id',item.ID)
                        );
                    });
                    $('<div/>',{class: 'context-menu context-menu-2lvl'})  // Присваиваем блоку наш css класс контекстного меню:
                    .attr('id','context_menu_2lvl_send_to_station')
                    .css({                 
                            left: p_x+'px', // Задаем позицию меню на X                 
                            top: p_y+'px' // Задаем позицию меню по Y             
                    })
                    .appendTo('body') // Присоединяем наше меню к body документа: 
                    .append(ul)
                    .on('click',function(event){
                        $('.context-menu').remove();
						//alert('Форма в разработке');
						
                        create_window_update_fix_device(p_railway_id,$(event.target).attr('data-id'));
                    })
                    .show('fast'); // Показываем меню с небольшим стандартным эффектом jQuery. Как раз очень хорошо подходит для меню     
                }

        });
    }
}
/* Назначить ЗУ */
function create_window_add_fix_device(p_railway_id,p_part_id){
	var l_params = {};
        l_params.station_id = user_station_id,
		l_params.railway_id = p_railway_id;
        l_params.part_id = p_part_id;
		l_params.transaction_type_fix = 'IN';
		l_params.transaction_type_undock = 'OUT';
		l_params.calculation_type = 'MANUAL';
		l_params.name_even = '';
		l_params.name_odd = '';
		l_params.even_side_id = '';
		l_params.odd_side_id = '';
		l_params.norma_even = '0';
		l_params.norma_odd = '0';
		
	
	// Часть пути
	var railway_parts = get_railway_parts(p_railway_id,p_part_id);
	var railway_parts_name;
	$.each(railway_parts, function( i, item ) {
		railway_parts_name = item.NAME;
	});
	/* Название пути */
	var disl_railway = get_railway_add_info(p_railway_id);
	var railway_name;
	$.each(disl_railway, function( i, item ) {
		railway_name = item.RAILWAY_NUMBER;
	});
	
    function railcar_table_for_fix_device(){
        var self = this;
        this.add_error_msg = null;
        this.cars_table_total_row;
        this.cars_count = 0;
        
        this.cars_mas = [];

        var return_table = $('<div>');
        return_table.append(
            '<table class="received_cars_table fix_device_cars_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th>№</th>'+
                        '<th>Вагон</th>'+
                        '<th>Вес <br>груза</th>'+
                        '<th>Кол-во осей</th>'+
						'<th></th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'
        );


        return_table.add_carnumber_input = $('<input>',{type:'text',css:{'font-size':'11px'}, class:'text ui-widget-content ui-corner-all'}).attr('size', '8').attr('maxlength', '8');

        this.car_number_input = return_table.add_carnumber_input;

        return_table.add_carnumber_btn = $('<input>',{type:'button',css:{'font-size':'11px','height':'17px'}, class:'btnAdd'}).val('Добавить'); // Назначение ЗУ (добавить)
        return_table.add_carnumber_btn.on('click', function(){
			//alert(1);
			l_car_number = return_table.add_carnumber_input.val();
			if (l_car_number.length==0 || l_car_number == null && l_car_number !== ''){
				return_table.add_carnumber_input.addClass('red_bckg_color');
                alert('Вагон не введен!');
                return false;
			}
			self.add_cars_in_table(null,null,true);
        });
        return_table.add_carnumber_input.on('keypress', function(e){
            if(e.keyCode===13){
                l_car_number = return_table.add_carnumber_input.val();
				if (l_car_number.length==0 || l_car_number == null && l_car_number !== ''){
					return_table.add_carnumber_input.addClass('red_bckg_color');
					alert('Вагон не введен!');
					return false;
				}
				self.add_cars_in_table(null,null,true);
            }
        });
        
        return_table.add_carnumber_div = $('<div>',{css:{'margin-left':'61px'}});
        return_table.append(
            return_table.add_carnumber_div
                .append(return_table.add_carnumber_input)
                .append(return_table.add_carnumber_btn)
        );

        return_table.cars_table = $('<table>',{class:'received_cars_table fix_device_cars_table'}).append($('<tbody>'));
        return_table.append(
            $('<div>',{class:'modalDialogContainer',css:{'display':'inline-block', 'height':'100px'}})  
            .append(return_table.cars_table)
        );
        return_table.cars_table_total_row = $('<tr>',{css:{'background':'#EBEBEB','font-weight':'bold'}});
        self.cars_table_total_row = return_table.cars_table_total_row;
        return_table.append(
            $('<table>',{class:'received_cars_table fix_device_cars_table',css:{'margin-top':'-4px'}})
            .append(
                $('<tbody>').append(return_table.cars_table_total_row)
            )
        );

        function change_cars_table_total_tr(){
            return_table.cars_table_total_row.find('td').remove();
            if (self.cars_count!==0) {
                var l_count_of_axles = 0;
                return_table.cars_table.find('tr td:nth-child(4)').each(function(){
                    l_count_of_axles+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });

                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>Кол-во: '+ self.cars_count +'</td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>'+Math.round(l_count_of_axles * 100)/100+'</td>');
            }else{
                self.cars_lenght = 0;

                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>Кол-во: 0</td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>0</td>');
            }
        }

        this.spec_check_car_number = function(p_car_number){
            return true;
        };
        this.check_car_number = function(p_car_number){
            var find_result = self.spec_check_car_number(p_car_number);
            if (!find_result){
                return_table.add_carnumber_input.addClass('red_bckg_color');
                if (this.add_error_msg === null){
                    alert('На путях нет вагона с номером '+p_car_number+'!');
                }else{
                    alert(this.add_error_msg);
                }
                return false;
            }  else if(return_table.cars_table.find('tr td:contains("'+p_car_number+'")').length!==0) {
                return_table.add_carnumber_input.addClass('red_bckg_color');
                alert('Вагон '+p_car_number+' уже добавлен!');
                return false;
            } /*else{
                return_table.add_carnumber_input.removeClass('red_bckg_color').val('');
				return false;
            }*/
            return true;
        };

        this.add_cars_in_table = function(p_railwai_id,p_car_number,p_need_check){
            var add_car_number;
            if (p_car_number === null || p_car_number === '') {
                add_car_number = return_table.add_carnumber_input.val();
            } else {
                add_car_number = p_car_number;
            }
            var check_car_number_result = true;
            if (p_need_check && add_car_number.length!=0) {
                check_car_number_result = self.check_car_number(add_car_number);
            }
			
            if (check_car_number_result && (add_car_number !== null && add_car_number !== '' || p_railwai_id !==null || p_railwai_id !== '')) {
            //if (1 === 1) {
                var params = {};
                params.railway_id = p_railwai_id;
				params.car_number = add_car_number;
				//console.log(JSON.stringify(params));
                $.ajax({
                    url: 'data.php',
                    type: 'POST',
                    dataType: "text",
                    async: false,
                    data: { params: JSON.stringify(params)
                           ,ajax_action: 'get_railway_cars'
                          },
                    success: function (data) {
                        var records = JSON.parse(data);

                        for(var i=0; i<records.length; i++) {
                            self.cars_count++;
                            var child = records[i];

                            var tr = $('<tr/>');
                            tr.pos = self.cars_mas.length;
                            
                            tr.round_id = child.ROUND_ID;
							tr.car_number = child.CAR_NUMBER;
                            tr.add_info_id = child.ADD_INFO_ID;
                            tr.weight_net = ((child.WEIGHT_NET !== null) ? child.WEIGHT_NET.replace(',','.') : '');
                            tr.count_of_axles = child.COUNT_OF_AXLES;

                            tr.append('<td>'+self.cars_count+'</td>');
                            tr.append('<td>'+child.CAR_NUMBER+'</td>');
                            tr.append('<td>'+((child.WEIGHT_NET !== null) ? child.WEIGHT_NET.replace(',','.') : '')+'</td>');
                            tr.append('<td>'+((child.COUNT_OF_AXLES !== null) ? child.COUNT_OF_AXLES.replace(',','.') : '')+'</td>');
                            
                            tr.del_image_div = $('<div>',{class:'deleteImage deleteImage13px'})
                                .on('click', function(){
									var l_tr = $(this).parent().parent();
									var l_pos = $(l_tr).index();
									del_cars_table_tr(l_tr);
									delete self.cars_mas.splice(l_pos,1);
									self.cars_count--;
                                    change_cars_table_total_tr(); 
                                });
                            $('<td>').append(tr.del_image_div).appendTo(tr);
                            tr.appendTo(return_table.cars_table); 
                            
                            self.cars_mas[tr.pos] = tr;
                        }
                    },
                    error: function (m1,m2) {window.alert(m1+m2);}
                });
            }
            change_cars_table_total_tr();
        };

        this.get_cars_in_table = function(){
            var l_cars_mas = [];
            self.cars_mas.forEach(function(tr){
                var l_car = {};
				l_car.car_number = tr.car_number;
                l_car.round_id = tr.round_id;
                l_car.add_info_id = tr.add_info_id;
                l_car.weight_net = tr.weight_net;
                l_car.count_of_axles = tr.count_of_axles;
                l_cars_mas.push(l_car);
            });
			//var l_params = l_cars_mas; console.log('l_result='+JSON.stringify(l_params));
            return l_cars_mas;
        };

        this.get_table = function(){
			
            return return_table;
        };
        
        this.edit_table = function (p_edit){
            self.cars_mas.forEach(function(tr){
                if (p_edit){
                    tr.del_image_div.show();
                    //tr.up_image_div.show();
                    //tr.down_image_div.show();
                }else{
                    tr.del_image_div.hide();
                    //tr.up_image_div.hide();
                    //tr.down_image_div.hide();
                }
            });
            
            if (p_edit){
                return_table.add_carnumber_div.show();
            }else{
                return_table.add_carnumber_div.hide();
            }
        };
    };
    
	var railcar_table = new railcar_table_for_fix_device();
	/* Список башмаков для станции */
	/* Список башмаков(chexbox) */
    function table_fixing_device_list(p_railway_id,p_side_mas,p_side_type){
        
		
		var self = this;
        
        var return_table = $('<div>');
        
        var l_ul = $('<ul>',{class:'ui-autocomplete ui-front ui-menu ui-widget ui-widget-content',css:{'max-height':'20em','height':'10em','display':'block','position':'static'}});
        
        var l_seg_2 = $('<select>',{class:'',css:{'width':'3.5em'}}); 
        var l_seg_4_f = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'2em'}});
        var l_seg_4_l = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'2em'}});
        var l_seg_5 = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'1em'}});
        var l_side_id='';
		
        l_seg_2.append($('<option>',{'val':'','text':''}));
        l_seg_2.append($('<option>',{'val':'БО','text':'БО'}));
        l_seg_2.append($('<option>',{'val':'СН','text':'СН'}));
        		
        var l_refresh_btn = $('<div>',{class:'refresh',title:'Обновить',css:{'position':'relative','float':'right','top':'1px','right':'2px'}});
        if (p_side_type == 'EVEN'){
			if (contains(p_side_mas,0) == true){
				l_side_id = p_side_mas[0]['SIDE_ID'];
			}
		}
		if (p_side_type == 'ODD'){
			if (contains(p_side_mas,1) == true){
				l_side_id = p_side_mas[1]['SIDE_ID'];
			}
		}
		
        l_refresh_btn.on('click',function(){
            l_ul.find('li > input:not(:checked)').parent().remove();
            
            var l_param = {};
            l_param.railway_id = p_railway_id;
            l_param.seg2 = l_seg_2.val();
            l_param.seg4f = l_seg_4_f.val();
            l_param.seg4l = l_seg_4_l.val();
            l_param.seg5 = l_seg_5.val();
            $.ajax({
                url: '/data.php',
                type: 'POST',
                dataType: "text",
                data:   {params: JSON.stringify(l_param)
                        ,ajax_action: 'get_device_for_assignment'},
                success: function (data) {
                        var l_fd = JSON.parse(data);
						
						var l_text_color='';
						var l_error='N';
						var l_railway_name='';
                        $.each(l_fd, function(i, item) {
							l_railway_name = item.RAILWAY_NAME;
							//console.log('='+l_railway_name.length);
							if (l_railway_name.length>1){
								l_text_color = 'red';
								l_error='Y';
								l_railway_name = item.RAILWAY_NAME;
							} else {
								l_error='N';
								l_text_color = '';
								l_railway_name='';
							}
                            if (l_ul.find('li > input[id="'+item.ID+'"]').length===0){
                                l_ul.append($('<li>',{'class':'ui-menu-item','css':{'color':l_text_color},'title':l_railway_name})
                                                .append($('<input>',{'id':item.ID,
																	 'side_id':l_side_id,
																	 'side_type':p_side_type,
																	 'item_name':item.NAME,
																	 error_value:l_error,
																	 'type':'checkbox','css':{'position':'relative','top':'2px'}}))
                                                .append(item.NAME));
                            }        
                        });  
                    }
            });  
        }); 
		
        return_table
            .appendTo(md_content)
            .css({'display':'inline-table','margin-left':'1em'})
            .append(
                $('<div>')
                    .addClass('border')
                    .css({'clear':'both'})
                    .append(
                        $('<div>')
                            .addClass('header')
                            .css({'width':'270px'}) 
                            .append($('<label>',{text:'2',class:'',css:{'margin-right':'3px'}}))
                            .append(l_seg_2) 
                            .append($('<label>',{text:'4_с',class:'',css:{'margin-left':'3px','margin-right':'3px'}}))
                            .append(l_seg_4_f) 
                            .append($('<label>',{text:'4_по',class:'',css:{'margin-left':'3px','margin-right':'3px'}}))
                            .append(l_seg_4_l) 
                            .append($('<label>',{text:'5',class:'',css:{'margin-left':'3px','margin-right':'3px'}}))
                            .append(l_seg_5) 
                            .append(l_refresh_btn)
                            
                    )
                    .append(
                        $('<div>')
                            .css({'display':'inline-table','width':'270px','text-align':'left'})
                            .append(l_ul)
                    )
            );

        this.get_fixing_device_in_list = function(){
            var l_result = [];
            l_ul.find('li > input:checked').each(function(index){
                var l_item = {};
                l_item.device_id = $(this).attr('id');
				l_item.side_id = $(this).attr('side_id');
				l_item.side_type = $(this).attr('side_type');
				l_item.item_name = $(this).attr('item_name');
                l_result.push(l_item);
            });
            return l_result;
        };
		
		this.get_fix_error_dev_in_list = function(){
            var l_result = [];
            l_ul.find('li > input:checked').each(function(index){
               
				if ($(this).attr('error_value') == 'Y'){
					 var l_item = {};
					l_item.device_id = $(this).attr('id');
					l_item.side_id = $(this).attr('side_id');
					l_item.side_type = $(this).attr('side_type');
					l_item.item_name = $(this).attr('item_name');
					l_result.push(l_item);
				}
                
            });
            return l_result;
        };
		
        this.get_list = function(){
            return return_table;
        };
		this.get_checked_length = function(){
            var l_result;
            l_result = l_ul.find('li > input:checked').length;
            return l_result;
        };
		
		function contains (p_array, p_index){
			if(typeof p_array[p_index] == 'undefined') {
				return false;
			}
			else {				
				return true;
			}
		}
		
    };
	/* Подобрать норму */
	function table_norma_list(p_params){
		var self = this;
		var return_table = $('<div id="div_select">');
			$(return_table).hide();
		var l_select;
		var l_css_even; 
        var v_params = {};
            v_params.railway_id = p_railway_id;
            v_params.part_id = p_part_id;
            v_params.cars = railcar_table.get_cars_in_table();;
            //console.log('l_result='+JSON.stringify(v_params));
            var l_result =  get_suitable_device_rules(JSON.stringify(v_params));
			//console.log('l_result='+l_result);
            var l_device_rules = JSON.parse(l_result);
                $(l_div_rules).empty();
                l_device_rules.side_mas.forEach(function (item,index){
						
						var id_select;
						if (index == 0){
							id_select ='select_even';
							l_css_even='10px';
						}
						if (index == 1){
							id_select ='select_odd';
							l_css_even='190px';
						}
						l_select = $('<select>',{id:id_select,class:'route-window-attr-item-elem',css:{'width':'15em'}}); 
                        l_select.side_id = item.side_id;
                        item.skid_mas.forEach(function (item){
                            var l_opt = $('<option>',{'val':item.rule_id,'norma':item.cnt_skid,'cnt_axis':item.cnt_axis,'text':'  норма:'+item.cnt_skid+' осей: '+item.cnt_axis});
                            if (item.selected === 'Y') {
                                l_opt.attr('selected', true);
                            }
                            l_select.append(l_opt);
                        });
						//$(l_select).hide();
                        return_table
							.addClass('route-window-attr-item helper-clearfix')
                            .append($('<label>',{text:item.side_descr, class:'route-window-attr-item-text route-window-attr-item-text-left',css:{'padding-right':'10px','padding-left':l_css_even}}))
                            .append(l_select)
                            .appendTo(l_div_rules);      
                });
        
		this.get_norma_in_list = function(){
            var l_result = [];
            return_table.find('select > option:checked').each(function(index){
                var l_item = {};
                l_item.rule_id = $(this).val();
				l_item.norma = $(this).attr('norma');
				l_item.cnt_axis = $(this).attr('cnt_axis');
                l_result.push(l_item);
            });
            return l_result;
        };
		
		function contains (p_array, p_index){
			if(typeof p_array[p_index] == 'undefined') {
				return false;
			}
			else {				
				return true;
			}
		}
		
		this.get_list = function(){
            return return_table;
        };
	}
	function del_cars_table_tr(p_tr){
        p_tr.nextAll().children('td:nth-child(1)').each(function(){
            $(this).text(parseInt($(this).text())-1);
        });
        p_tr.remove();
    }
	
    function get_suitable_device_rules(p_params){            
        var res = null;
		//console.log(p_params);
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { params: p_params
                   ,ajax_action: 'get_suitable_device_rules'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }
	function fill_users_for_cond_train(p_select,p_params,p_type){
		p_select.empty();
        p_select.append($('<option>'));
		
		var l_params = p_params;
			l_params.type = p_type;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   { params: JSON.stringify(l_params)
					 ,ajax_action: 'get_users_for_cond_train'},
            success: function (data) {
					var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.NAME).val(item.ID);
                        p_select.append(l_option);
                    }); 
                }
        });
    }
	// Список сторон закрепления
	function get_side_for_device(p_params){
        var result = [];
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   { params: JSON.stringify(l_params)
					 ,ajax_action: 'get_side_for_device'},
            success: function (data) {
				//console.log(data);
				result = data;
            }
        });
		return result;
    }

	/* Сохранить данные */
    function save_transaction_fix_ajax(p_add_data){
		//console.log('l_result='+(p_add_data));
		
        var res = null;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { add_data: p_add_data
                   ,ajax_action: 'save_transaction_fix_device'},
            success: function (data) {
				//console.log(data);
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }
	/* Проверка, чтобы на путях не были назначены ЗУ */
	function validation_fix (p_params){
		//console.log('p_params='+JSON.stringify(l_params));
		var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { params: JSON.stringify(l_params)
                   ,ajax_action: 'validation_fix'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
	}
	/* Проверка перед сохранением */
	function validation_save_fix (){
		var dev_even_count = fixing_device_even_list.get_checked_length();
		var dev_odd_count = fixing_device_odd_list.get_checked_length();
		
		var dev_even_ar = fixing_device_even_list.get_fix_error_dev_in_list();
		var dev_odd_ar  = fixing_device_odd_list.get_fix_error_dev_in_list();
		
		var v_params = l_params;
		//console.log(v_params);
		var norma_even = v_params.norma_even;
		var norma_odd = v_params.norma_odd;
		var calcul = v_params.calculation_type;
		var side_length = v_params.side_length;
		var l_time_fixing_even = md_content.time_fixing_even; // ЧетС.Дата
		var l_who_fixing_even = md_content.who_fixing_even; // ЧетС.Кто проводит
		var l_who_fixing_report_even = md_content.who_report_even; // ЧетС.Кому докладывает
		var l_who_fixing_odd = md_content.who_fixing_odd; // НечС.Кто проводит
		var l_who_fixing_report_odd = md_content.who_report_odd; // НечС.Кому докладывает
		var l_time_fixing_odd = md_content.time_fixing_odd; // НечС.Дата
		
		var even_array = fixing_device_even_list.get_fixing_device_in_list();
		var odd_array  = fixing_device_odd_list.get_fixing_device_in_list();
		
		var l_over_val = get_overall_array(even_array,odd_array);
			if (l_over_val.length > 5){
				create_info_modal_dialog_new('Оповещение','На сторонах назначены одинаковые ЗУ:'+l_over_val);
				return false;
			}
			//console.log('calcul='+calcul+' norma_even='+norma_even+' dev_even_count='+dev_even_count+' dev_odd_count='+dev_odd_count+' norma_odd='+norma_odd);
			if (dev_even_ar.length>0){
				create_info_modal_dialog_new('Оповещение','На стороне "'+l_params.name_even+'" выбраны ЗУ, которые используются на других путях');
				return false;
			}
			if (dev_odd_ar.length>0){
				create_info_modal_dialog_new('Оповещение','На стороне "'+l_params.name_odd+'" выбраны ЗУ, которые используются на других путях');
				return false;
			}
			if (calcul == 'AUTO'){
				if (norma_even > 0 && dev_even_count < norma_even){
					create_info_modal_dialog_new('Оповещение','На стороне "'+l_params.name_even+'" норма = '+norma_even+', выбрано '+dev_even_count+' ЗУ');
					return false;
				}  
				if (norma_odd > 0 && dev_odd_count < norma_odd){
					create_info_modal_dialog_new('Оповещение','На стороне "'+l_params.name_odd+'" норма = '+norma_odd+', выбрано '+dev_odd_count+' ЗУ');
					return false;
				}
				if ($(l_time_fixing_even).attr('requir') == 'Y' && $(l_time_fixing_even).val() ==''){
					create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+l_params.name_even+'"');
					return false;
				}
				if ($(l_who_fixing_even).attr('requir') == 'Y' && $(l_who_fixing_even).val() ==''){
					create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+l_params.name_even+'"');
					return false;
				}
				if ($(l_who_fixing_report_even).attr('requir') == 'Y' && $(l_who_fixing_report_even).val() ==''){
					create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+l_params.name_even+'"');
					return false;
				}
				
				if ($(l_time_fixing_odd).attr('requir') == 'Y' && $(l_time_fixing_odd).val() ==''){
					create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+l_params.name_odd+'"');
					return false;
				}
				if ($(l_who_fixing_odd).attr('requir') == 'Y' && $(l_who_fixing_odd).val() ==''){
					create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+l_params.name_odd+'"');
					return false;
				}
				if ($(l_who_fixing_report_odd).attr('requir') == 'Y' && $(l_who_fixing_report_odd).val() ==''){
					create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+l_params.name_odd+'"');
					return false;
				}
				
			}
			if (calcul == 'MANUAL'){
				if (side_length == 1) {
					if (dev_even_count < 1){
						create_info_modal_dialog_new('Оповещение','На стороне "'+l_params.name_even+'" не выбраны ЗУ!');
						return false;
					}
					if ($(l_time_fixing_even).attr('requir') == 'Y' && $(l_time_fixing_even).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+l_params.name_even+'"');
						return false;
					}
					if ($(l_who_fixing_even).attr('requir') == 'Y' && $(l_who_fixing_even).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+l_params.name_even+'"');
						return false;
					}
					if ($(l_who_fixing_report_even).attr('requir') == 'Y' && $(l_who_fixing_report_even).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+l_params.name_even+'"');
						return false;
					}
					
					if ($(l_time_fixing_odd).attr('requir') == 'Y' && $(l_time_fixing_odd).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+l_params.name_odd+'"');
						return false;
					}
					if ($(l_who_fixing_odd).attr('requir') == 'Y' && $(l_who_fixing_odd).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+l_params.name_odd+'"');
						return false;
					}
					if ($(l_who_fixing_report_odd).attr('requir') == 'Y' && $(l_who_fixing_report_odd).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+l_params.name_odd+'"');
						return false;
					}
				} else {
					if (dev_even_count < 1){
						create_info_modal_dialog_new('Оповещение','На стороне "'+l_params.name_even+'" не выбраны ЗУ!');
						return false;
					}
					if (dev_odd_count < 1){
						create_info_modal_dialog_new('Оповещение','На стороне "'+l_params.name_odd+'" не выбраны ЗУ!');
						return false;
					}
					
					if ($(l_time_fixing_even).attr('requir') == 'Y' && $(l_time_fixing_even).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+l_params.name_even+'"');
						return false;
					}
					if ($(l_who_fixing_even).attr('requir') == 'Y' && $(l_who_fixing_even).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+l_params.name_even+'"');
						return false;
					}
					if ($(l_who_fixing_report_even).attr('requir') == 'Y' && $(l_who_fixing_report_even).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+l_params.name_even+'"');
						return false;
					}
					
					if ($(l_time_fixing_odd).attr('requir') == 'Y' && $(l_time_fixing_odd).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+l_params.name_odd+'"');
						return false;
					}
					if ($(l_who_fixing_odd).attr('requir') == 'Y' && $(l_who_fixing_odd).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+l_params.name_odd+'"');
						return false;
					}
					if ($(l_who_fixing_report_odd).attr('requir') == 'Y' && $(l_who_fixing_report_odd).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+l_params.name_odd+'"');
						return false;
					}
				}
			}
		return true;
	}
	function contains (p_array, p_index){
		if(typeof p_array[p_index] == 'undefined') {
			return false;
		}
		else {				
			return true;
		}
	}
	function get_overall_array(p_array_first, p_array_second){
		var l_over_val;
		l_over_val='';
		$.each(p_array_first, function( key_1, value_1 ) {
			$.each(p_array_second, function( key_2, value_2 ) {
				if (p_array_first[key_1]['device_id'] == p_array_second[key_2]['device_id']){
					l_over_val = l_over_val+p_array_first[key_1]['item_name']+';';
				}
			});
		});
		//console.log(l_over_val); 
		return l_over_val;
	}
	function change_select(){
		var p_norma_list = norma_table.get_norma_in_list();
		if (contains(p_norma_list, 0) == true) {
			l_params.norma_even = p_norma_list[0]['norma'];
			if (p_norma_list[0]['norma'] == '0') {
				$(md_content.time_fixing_even).removeClass();
				$(md_content.who_fixing_even).removeClass();
				$(md_content.who_report_even).removeClass();

				$(md_content.time_fixing_even).attr('requir', 'N');
				$(md_content.who_fixing_even).attr('requir', 'N');
				$(md_content.who_report_even).attr('requir', 'N');
			}
		} else {
			l_params.norma_even = 0;
			$(md_content.time_fixing_even).removeClass();
			$(md_content.who_fixing_even).removeClass();
			$(md_content.who_report_even).removeClass();
			$(md_content.time_fixing_even).attr('requir', 'N');
			$(md_content.who_fixing_even).attr('requir', 'N');
			$(md_content.who_report_even).attr('requir', 'N');
		}
		if (contains(p_norma_list, 1) == true) {
			l_params.norma_odd = p_norma_list[1]['norma'];
			if (p_norma_list[1]['norma'] == '0') {
				$(md_content.time_fixing_odd).removeClass();
				$(md_content.who_fixing_odd).removeClass();
				$(md_content.who_report_odd).removeClass();

				$(md_content.time_fixing_odd).attr('requir', 'N');
				$(md_content.who_fixing_odd).attr('requir', 'N');
				$(md_content.who_report_odd).attr('requir', 'N');
			}
		} else {
			l_params.norma_odd = 0;
			$(md_content.time_fixing_odd).removeClass();
			$(md_content.who_fixing_odd).removeClass();
			$(md_content.who_report_odd).removeClass();
			$(md_content.time_fixing_odd).attr('requir', 'N');
			$(md_content.who_fixing_odd).attr('requir', 'N');
			$(md_content.who_report_odd).attr('requir', 'N');
		}
		//console.log(JSON.stringify(l_params));
	}
	var l_valid_fix; 
		l_valid_fix = validation_fix(l_params);
		//console.log(JSON.stringify(l_params)+' '+l_valid_ondock);
	var f_res_mas = l_valid_fix.split('$');
        if (f_res_mas[0]=='done') {
            if (f_res_mas[1] =='false'){
				var l_mes = '';
                    //l_mes = 'На данном пути уже назначены ЗУ! Для корректировки откройте форму "Корретировка ЗУ!"';
					l_mes = f_res_mas[2];
                   // md_content.dialog("close");
                    create_info_modal_dialog_new('Оповещение',l_mes);
					return;
			}
		}
		if (f_res_mas[0]=='fail'){
			//md_content.dialog("close");
            create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
			return;
        }
    start_loading_animation();
    
    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .appendTo('body');

    var l_title = 'Назначение ЗУ на путь';

    md_content.attr('title',l_title);
    md_content.railway_input = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(railway_name);
    md_content.part_input = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(railway_parts_name);
	md_content.users = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(user_name);
	md_content.server_time = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(get_server_current_time());
    
	md_content.choose_norm = $('<input>',{type:'button', id:'md_choose_norm_btn', value:'Подобрать норму', class:'md_save_load'});
	
	md_content.time_fixing_even = $('<input>',{type:'text','requir':'Y', class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
	md_content.who_fixing_even = $('<select>',{'requir':'Y',class:'required'});
	md_content.who_report_even = $('<select>',{'requir':'Y',class:'required'});
	md_content.time_fixing_odd = $('<input>',{type:'text','requir':'Y',class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
	md_content.who_fixing_odd = $('<select>',{'requir':'Y',class:'required'});
	md_content.who_report_odd = $('<select>',{'requir':'Y',class:'required'});
	
	md_content.note = $('<input>',{type:'text', 'requir':'N',class:'text ui-widget-content ui-corner-all',css:{'width':'300px'}});
	
	/*Список сторон закрепления*/
	l_side_mas = JSON.parse(get_side_for_device(l_params));
	l_side_length = l_side_mas.length;
	l_params.side_length = l_side_length;
	l_side_name_even = l_side_mas[0]['NAME'];
	l_params.even_side_id = l_side_mas[0]['SIDE_ID'];
	l_params.name_even = l_side_name_even;
	l_side_name_odd = 'Нечетная сторона'
	//console.log('l_side_length='+l_side_mas[0]['ID']);
	if (l_side_length == 2){
		l_side_name_odd = l_side_mas[1]['NAME'];
		l_params.name_odd = l_side_name_odd;
		l_params.odd_side_id = l_side_mas[1]['SIDE_ID'];
	} else {
		$(md_content.time_fixing_odd).removeClass();
		$(md_content.who_fixing_odd).removeClass();
		$(md_content.who_report_odd).removeClass();
		$(md_content.time_fixing_odd).attr('requir', 'N');
		$(md_content.who_fixing_odd).attr('requir', 'N');
		$(md_content.who_report_odd).attr('requir', 'N');
	}
	
	/**************************/
	
	var l_div_railway = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Наименование',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.railway_input);  

    var l_div_part = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Часть пути',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.part_input);  
	
	var l_div_users = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append(md_content.users); 
	var l_div_server_time = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append(md_content.server_time); 
	
	var l_div_choose_norm = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        //.append(md_content.choose_norm); 	

	var l_div_info = 
            $('<div>',{css:{'display':'table','float':'left','padding-right':'10px'}})
			.append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'400px'}})
                        .append(l_div_railway)
                        .append(l_div_part)
                    )
                )
            );
	var l_div_info2 = 
            $('<div>',{css:{'display':'table','float':'left','padding-right':'10px'}})
			.append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'auto'}})
                        .append(l_div_server_time)
						.append(l_div_users)
                    )
                )
            );	
	
	var l_div_norm = 
            $('<div>',{css:{'display':'table'}})
			.append(
                $('<div>',{class:'border',css:{'clear':'both', 'border':'none'}})
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'auto'}})
                        .append(l_div_choose_norm)
                    )
                )
            );	
	/* Четная сторона */
	var l_div_time_fixing = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата и время закрепления(Мск)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.time_fixing_even); 
    
	var l_div_who_fixing = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кто проводит',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.who_fixing_even);
	
	var l_div_who_report_even = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кому докладывает',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.who_report_even);	
	
	/* Нечетная сторона */
	var l_div_time_fixing_odd = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата и время закрепления(Мск)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.time_fixing_odd); 
	var l_div_who_fixing_odd = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кто проводит',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.who_fixing_odd);
	var l_div_who_report_odd = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кому докладывает',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.who_report_odd);
	var l_div_note = $('<div>',{css:{'display':'table'}}).append(
             $('<div>',{class:'attr',css:{'border':'none','width': '500px'}})
				.append(
					$('<div>')
							.append($('<label>',{text:'Примечание',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
							.append(md_content.note)
				)
            );
	var l_div_rules = $('<div>');
	
	
	var fixing_device_even_list = new table_fixing_device_list(p_railway_id,l_side_mas,'EVEN'); /* Башмаки с четной стороны */
	var fixing_device_odd_list = new table_fixing_device_list(p_railway_id,l_side_mas,'ODD'); /* Башмаки с нечетной стороны */
	
	/* Четная сторона */
	var l_div_even_side = 
            $('<div>',{css:{'display':'table','float': 'left','padding-right':'10px'}}).append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{class:'header',css:{'width':'380px'}}).text(l_side_name_even)
                )
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'400px'}})
                        .append(l_div_time_fixing)
                        .append(l_div_who_fixing)
						.append(l_div_who_report_even)
						.append(fixing_device_even_list.get_list)
						
                    )
                )
            );
	/* Нечетная сторона */
	var l_div_odd_side = 
            $('<div>',{css:{'display':'table'}}).append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{class:'header',css:{'width':'380px'}}).text(l_side_name_odd)
                )
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'400px'}})
                        .append(l_div_time_fixing_odd)
                        .append(l_div_who_fixing_odd)
						.append(l_div_who_report_odd)
						.append(fixing_device_odd_list.get_list)
						
                    )
                )
            );
	if (l_side_length == 1){
		$(l_div_odd_side).hide();
	}
	init_date_time_input(md_content.time_fixing_even);
	init_date_time_input(md_content.time_fixing_odd);
	fill_users_for_cond_train(md_content.who_fixing_even,l_params,'prc_fc');
	fill_users_for_cond_train(md_content.who_fixing_odd,l_params,'prc_fc');
	
	fill_users_for_cond_train(md_content.who_report_even,l_params,'prr_fc'); // Кому докладывает
	fill_users_for_cond_train(md_content.who_report_odd,l_params,'prr_fc'); // Кому докладывает
	
	var norma_table;
	
	$('<div>')
        .addClass('route-window-attr')
       /*  .append(l_div_railway)
		.append(l_div_part) */
		.append(l_div_info)
		.append(l_div_info2)
		.append(l_div_norm)
        .append(l_div_rules)
		.append(l_div_even_side)
		.append(l_div_odd_side)
		.append(l_div_note)		
        .appendTo(md_content);

    
    md_content.append(railcar_table.get_table());
    
    railcar_table.add_cars_in_table(p_railway_id,null,true);

    md_content.dialog({
        resizable:false,
        modal:true,
        width: '900px',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Подобрать норму':{
                text: "Подобрать норму",
                id: "md__btn",
                click: function(){ 
					norma_table = new table_norma_list(l_params,railcar_table)
					l_params.calculation_type = 'AUTO';
					$('#div_select').show();
                    //$('#select_even').show(); $('#select_odd').show();
					change_select();
					$("#select_even").on('change', '', function (e) {
						change_select();
					});
					$("#select_odd").on('change', '', function (e) {
						change_select();
					});
					
                }   
            },
            'Сохранить норму':{
                text: "Сохранить",
                id: "md_save_route_btn",
                click: function(){  
					
					
					var v_params = {};
						v_params.station_id = l_params.station_id; // Станция
						v_params.railway_id = p_railway_id; // Путь
						v_params.part_id = p_part_id; // Часть пути
						v_params.users = md_content.users.val(); // Пользователь
						v_params.server_time = md_content.server_time.val(); // Время
						v_params.transaction_type = 'IN'; // Тип транзикции
						v_params.calculation_type = l_params.calculation_type; // Тип подбора
						v_params.norma_even = l_params.norma_even;
						v_params.norma_odd = l_params.norma_odd;
						v_params.even_side_id = l_params.even_side_id;
						v_params.odd_side_id = l_params.odd_side_id;
						v_params.cars = railcar_table.get_cars_in_table(); // Список вагонов
						v_params.device_mas_even = fixing_device_even_list.get_fixing_device_in_list(); // ЧетС.Список башмаков
						v_params.device_mas_odd = fixing_device_odd_list.get_fixing_device_in_list(); // НеЧетС.Список башмаков
						v_params.time_fixing_even = md_content.time_fixing_even.val(); // ЧетС.Дата
						v_params.who_fixing_even = md_content.who_fixing_even.val(); // ЧетС.Кто проводит
						v_params.who_fixing_report_even = md_content.who_report_even.val(); // ЧетС.Кому докладывает
						v_params.who_fixing_odd = md_content.who_fixing_odd.val(); // НечС.Кто проводит
						v_params.who_fixing_report_odd = md_content.who_report_odd.val(); // НечС.Кому докладывает
						v_params.time_fixing_odd = md_content.time_fixing_odd.val(); // НечС.Дата
						
						v_params.note = md_content.note.val(); // Примечание
					 
					 var l_params_json = JSON.stringify(v_params);
					 if (!validation_save_fix()){
						 //alert(false);
						 return;
					 }
					 //console.log(l_params_json);
					 //return;
					 var f_res = save_transaction_fix_ajax(l_params_json);
					 var f_res_mas = f_res.split('$');
                     if (f_res_mas[0]=='done') {
                        var l_mes = '';
                            l_mes = 'Данные сохранены!';//.ID='+f_res_mas[1];
						$('#refreshRailcar').triggerHandler('click');
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение',l_mes);
                     }else{
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!'+f_res_mas[1]);
                     };
                }   
            },
            'Закрыть форму': {
                text:'Закрыть форму',
                id:'md_close_form_btn',
                click: function(){
                    md_content.dialog("close");
                }
            }
        },
        close: function() {
            md_content.remove();
        }
    });

    
    stop_loading_animation();
}

/* Убрать ЗУ */
function create_window_undock_fix_device(p_railway_id,p_part_id){
	//console.log('p_railway_id='+p_railway_id+' p_part_id='+p_part_id);
	// Часть пути
		var l_params = {};
        l_params.railway_id = p_railway_id;
        l_params.part_id = p_part_id;
		l_params.transaction_type_fix = 'IN';
		l_params.transaction_type_undock = 'OUT';
		l_params.calculation_type = 'MANUAL';
		l_params.name_even = '';
		l_params.name_odd = '';
		l_params.norma_even = '0';
		l_params.norma_odd = '0';
		l_params.date_fix_even = '';
		l_params.date_fix_odd = '';
	var railway_parts = get_railway_parts(p_railway_id,p_part_id);
	var railway_parts_name;
	$.each(railway_parts, function( i, item ) {
		railway_parts_name = item.NAME;
	});
	/* Название пути */
	var disl_railway = get_railway_add_info(p_railway_id);
	var railway_name;
	$.each(disl_railway, function( i, item ) {
		railway_name = item.RAILWAY_NUMBER;
	});
	
	/* Список башмаков(chexbox) */
    function table_fixing_device_list(p_railway_id,part_id,p_side_mas,p_side_type){
        
		
		var self = this;
        
        var return_table = $('<div>');
        
        var l_ul = $('<ul>',{class:'ui-autocomplete ui-front ui-menu ui-widget ui-widget-content',css:{'max-height':'20em','height':'10em','display':'block','position':'static'}});
        
        var l_seg_2 = $('<select>',{class:'',css:{'width':'3.5em'}}); 
        var l_seg_4_f = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'2em'}});
        var l_seg_4_l = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'2em'}});
        var l_seg_5 = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'1em'}});
        var l_side_id='';
		
        l_seg_2.append($('<option>',{'val':'','text':''}));
        l_seg_2.append($('<option>',{'val':'БО','text':'БО'}));
        l_seg_2.append($('<option>',{'val':'СН','text':'СН'}));
        		
        var l_refresh_btn = $('<div>',{class:'refresh',title:'Обновить',css:{'position':'relative','float':'right','top':'1px','right':'2px'}});
        if (p_side_type == 'EVEN'){
			if (contains(p_side_mas,0) == true){
				l_side_id = p_side_mas[0]['SIDE_ID'];
			}
		}
		if (p_side_type == 'ODD'){
			if (contains(p_side_mas,1) == true){
				l_side_id = p_side_mas[1]['SIDE_ID'];
			}
		}
		
        l_refresh_btn.on('click',function(){
            l_ul.find('li > input:not(:checked)').parent().remove();
            
            var l_param = {};
            l_param.railway_id = p_railway_id;
			l_param.part_id = p_part_id;
            l_param.seg2 = l_seg_2.val();
            l_param.seg4f = l_seg_4_f.val();
            l_param.seg4l = l_seg_4_l.val();
            l_param.seg5 = l_seg_5.val();
			l_param.side_id = l_side_id;
			l_param.side_type = p_side_type;
			//console.log( JSON.stringify(l_param));
            $.ajax({
                url: '/data.php',
                type: 'POST',
                dataType: "text",
                data:   {params: JSON.stringify(l_param)
                        ,ajax_action: 'get_device_for_ondock'},
                success: function (data) {
						//console.log(data);
                        var l_fd = JSON.parse(data);
						if (p_side_type =='ODD' && l_fd.length == '0'){
							$(md_content.time_fixing_odd).removeClass();
							$(md_content.who_fixing_odd).removeClass();
							$(md_content.who_report_odd).removeClass();
							$(md_content.time_fixing_odd).attr('requir', 'N');
							$(md_content.who_fixing_odd).attr('requir', 'N');
							$(md_content.who_report_odd).attr('requir', 'N');
						}
						if (p_side_type =='EVEN' && l_fd.length == '0'){
							$(md_content.time_fixing_even).removeClass();
							$(md_content.who_fixing_even).removeClass();
							$(md_content.who_report_even).removeClass();

							$(md_content.time_fixing_even).attr('requir', 'N');
							$(md_content.who_fixing_even).attr('requir', 'N');
							$(md_content.who_report_even).attr('requir', 'N');
						}
						//console.log('p_side_type='+p_side_type+' =l_fd='+l_fd.length);
                        $.each(l_fd, function(i, item) {
                            if (l_ul.find('li > input[id="'+item.ID+'"]').length===0){
                                l_ul.append($('<li>',{'class':'ui-menu-item'})
                                                .append($('<input>',{'id':item.ID,'side_id':l_side_id,'side_type':p_side_type,'transactions_id':item.TRANSACTIONS_ID,'type':'checkbox','css':{'position':'relative','top':'2px'}}))
                                                .append(item.NAME));
                            }        
                        });  
                    }
            });  
        });
		
		l_refresh_btn.triggerHandler('click');
        return_table
            .appendTo(md_content)
            .css({'display':'inline-table','margin-left':'1em'})
            .append(
                $('<div>')
                    .addClass('border')
                    .css({'clear':'both'})
                    .append(
                        $('<div>')
                            .addClass('header')
                            .css({'width':'270px'}) 
                            .append($('<label>',{text:'2',class:'',css:{'margin-right':'3px'}}))
                            .append(l_seg_2) 
                            .append($('<label>',{text:'4_с',class:'',css:{'margin-left':'3px','margin-right':'3px'}}))
                            .append(l_seg_4_f) 
                            .append($('<label>',{text:'4_по',class:'',css:{'margin-left':'3px','margin-right':'3px'}}))
                            .append(l_seg_4_l) 
                            .append($('<label>',{text:'5',class:'',css:{'margin-left':'3px','margin-right':'3px'}}))
                            .append(l_seg_5) 
                            .append(l_refresh_btn)
                            
                    )
                    .append(
                        $('<div>')
                            .css({'display':'inline-table','width':'270px','text-align':'left'})
                            .append(l_ul)
                    )
            );

        this.get_fixing_device_in_list = function(){
            var l_result = [];
            l_ul.find('li > input:checked').each(function(index){
                var l_item = {};
                l_item.device_id = $(this).attr('id');
				l_item.side_id = $(this).attr('side_id');
				l_item.side_type = p_side_type;
                l_result.push(l_item);
            });
            return l_result;
        };
		this.get_fixing_device_out_list = function(){
            var l_result = [];
            l_ul.find('li > input:not(:checked)').each(function(index){
                var l_item = {};
                l_item.device_id = $(this).attr('id');
				l_item.transactions_lines_id = $(this).attr('transactions_id');
				l_item.side_type = $(this).attr('side_type');
				l_item.side_id = $(this).attr('side_id');
                l_result.push(l_item);
            });
            return l_result;
        };
		this.get_checked_length = function(){
            var l_result;
            l_result = l_ul.find('li > input:checked').length;
            return l_result;
        };
		this.get_length = function(){
            var l_result;
			var count;
			l_result = l_ul.find('li > input:not(:checked)').length;
            return l_result;
        };
        this.get_list = function(){
            return return_table;
        };
		function contains (p_array, p_index){
			if(typeof p_array[p_index] == 'undefined') {
				return false;
			}
			else {				
				return true;
			}
		}
		
    };
	
	function del_cars_table_tr(p_tr){
        p_tr.nextAll().children('td:nth-child(1)').each(function(){
            $(this).text(parseInt($(this).text())-1);
        });
        p_tr.remove();
    }
	
    function get_suitable_device_rules(p_params){            
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { params: p_params
                   ,ajax_action: 'get_suitable_device_rules'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }
	function fill_users_for_cond_train(p_select,p_params,p_type){
		p_select.empty();
        p_select.append($('<option>'));
		
		var l_params = p_params;
			l_params.type = p_type;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   { params: JSON.stringify(l_params)
					 ,ajax_action: 'get_users_for_cond_train'},
            success: function (data) {
					var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.NAME).val(item.ID);
                        p_select.append(l_option);
                    }); 
                }
        });
    }
	// Список сторон закрепления
	function get_side_for_device(p_params){
        var result = [];
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   { params: JSON.stringify(l_params)
					 ,ajax_action: 'get_side_for_device'},
            success: function (data) {
				//console.log(data);
				result = data;
            }
        });
		return result;
    }

	/* Сохранить данные */
    function save_transaction_ondock(p_add_data){
		//console.log('l_result='+(p_add_data));
		
        var res = null;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { add_data: p_add_data
                   ,ajax_action: 'save_transaction_ondock'},
            success: function (data) {
				//console.log(data);
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }
	
	function validation_ondock (p_params){
		//console.log('p_params='+JSON.stringify(l_params));
		var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { params: JSON.stringify(l_params)
                   ,ajax_action: 'validation_ondock'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
	}
	function get_data_fix(p_params){
		//console.log('p_params='+JSON.stringify(l_params));
		var res = p_params;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { params: JSON.stringify(p_params)
                   ,ajax_action: 'set_header_value_fix'},
            success: function (data) {
                //res = data;
				var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                       res.date_fix_even = item.DATE_FIX_EVEN;
					   res.date_fix_odd = item.DATE_FIX_ODD;
                    }); 
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
	}
	// Сравнение двух дат
	function date_comparison (p_firstDate, p_secondDate,p_oper){
		console.log('p_firstDate='+p_firstDate);
		console.log('p_secondDate='+p_secondDate);
		console.log('p_oper='+p_oper);
		var datetime_regex = /(\d\d)\.(\d\d)\.(\d\d\d\d)\s(\d\d):(\d\d)/; // Формат даты
		var first_date_arr = datetime_regex.exec(p_firstDate);
		var first_datetime = new Date(first_date_arr[3], first_date_arr[2], first_date_arr[1], first_date_arr[4], first_date_arr[5]);

		var second_date_arr = datetime_regex.exec(p_secondDate);
		var second_datetime = new Date(second_date_arr[3], second_date_arr[2], second_date_arr[1], second_date_arr[4], second_date_arr[5]);
		
		console.log('first_datetime='+first_datetime.getTime());
		console.log('second_datetime='+second_datetime.getTime());
		if (p_oper == '<'){
			if(first_datetime.getTime() <= second_datetime.getTime()) {
				console.log('=  <');
				return true;
			} else {
				return false;
			}
		}
		if (p_oper == '>'){
			if(first_datetime.getTime() >= second_datetime.getTime()) {
				console.log('=   >');
				return true;
				
			} else {
				return false;
			}
		}
		//console.log('true');
		return true;
	}
	function validation_save_ondock (){
		var even_count = fixing_device_even_list.get_checked_length();
		var odd_count = fixing_device_odd_list.get_checked_length();
		var l_time_fixing_even = md_content.time_fixing_even; // ЧетС.Дата
		var l_who_fixing_even = md_content.who_fixing_even; // ЧетС.Кто проводит
		var l_who_fixing_report_even = md_content.who_report_even; // ЧетС.Кому докладывает
		var l_who_fixing_odd = md_content.who_fixing_odd; // НечС.Кто проводит
		var l_who_fixing_report_odd = md_content.who_report_odd; // НечС.Кому докладывает
		var l_time_fixing_odd = md_content.time_fixing_odd; // НечС.Дата
		var l_date_fix_even= l_params.date_fix_even; // ЧетС.Дата закрепления
		var l_date_fix_odd = l_params.date_fix_odd; // НечС.Дата закрепления
		
		
		// Все башмаки должны быть сняты
		if (even_count !==0 ||odd_count !==0){
			create_info_modal_dialog_new('Оповещение','Сняты не все ЗУ!');
			return false;
		}
		
		
		if ($(l_time_fixing_even).attr('requir') == 'Y' && $(l_time_fixing_even).val() ==''){
			create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+l_params.name_even+'"');
			return false;
		}
		if ($(l_who_fixing_even).attr('requir') == 'Y' && $(l_who_fixing_even).val() ==''){
			create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+l_params.name_even+'"');
			return false;
		}
		if ($(l_who_fixing_report_even).attr('requir') == 'Y' && $(l_who_fixing_report_even).val() ==''){
			create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+l_params.name_even+'"');
			return false;
		}
					
		if ($(l_time_fixing_odd).attr('requir') == 'Y' && $(l_time_fixing_odd).val() =='' ){
			create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+l_params.name_odd+'"');
			return false;
		} 
		
		if (l_date_fix_even !== '' && l_date_fix_even !== 'null' && l_date_fix_even !== null){
			//console.log('l_date_fix_even='+l_date_fix_even);
			if (!date_comparison(l_date_fix_even,l_time_fixing_even.val(),'<')){
				create_info_modal_dialog_new('Оповещение','"Дата и время закрепления(Мск)" больше "Дата и время снятия(Мск)"! "Дата и время закрепления(Мск) = '+l_date_fix_even);
				return false;
			}
		}
		if (l_date_fix_odd !== '' && l_date_fix_odd !== 'null' && l_date_fix_odd !== null){
			//console.log('l_date_fix_odd='+l_date_fix_odd);
			if (!date_comparison(l_date_fix_odd,l_time_fixing_odd.val(),'<')){
				create_info_modal_dialog_new('Оповещение','"Дата и время закрепления(Мск)" больше "Дата и время снятия(Мск)"! "Дата и время закрепления(Мск) = '+l_date_fix_odd);
				return false;
			}
		}
		
		if ($(l_who_fixing_odd).attr('requir') == 'Y' && $(l_who_fixing_odd).val() ==''){
			create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+l_params.name_odd+'"');
			return false;
		}
		if ($(l_who_fixing_report_odd).attr('requir') == 'Y' && $(l_who_fixing_report_odd).val() ==''){
			create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+l_params.name_odd+'"');
			return false;
		}
		return true;
	}
	var l_transactions_id = 0;
	var l_valid_ondock; 
		l_valid_ondock = validation_ondock(l_params);
	l_params = get_data_fix(l_params);	
	console.log('l_params='+JSON.stringify(l_params));
	var f_res_mas = l_valid_ondock.split('$');
        if (f_res_mas[0]=='done') {
            if (f_res_mas[1] =='false'){
				var l_mes = '';
                    l_mes = 'На данном пути не назначены ЗУ!';
                   // md_content.dialog("close");
                    create_info_modal_dialog_new('Оповещение',l_mes);
					return;
			}
			if (f_res_mas[1] =='true'){
				l_transactions_id = f_res_mas[2];
			}
		}
		if (f_res_mas[0]=='fail'){
			//md_content.dialog("close");
            create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
			return;
        }
	//console.log('l_valid_ondock='+l_valid_ondock);
	//alert(l_transactions_id);
    start_loading_animation();
    
    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .appendTo('body');

    var l_title = 'Снять закрепление ЗУ с пути';

    md_content.attr('title',l_title);
    md_content.railway_input = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(railway_name);
    md_content.part_input = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(railway_parts_name);
	md_content.users = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(user_name);
	md_content.server_time = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(get_server_current_time());
    
	md_content.choose_norm = $('<input>',{type:'button', id:'md_choose_norm_btn', value:'Подобрать норму', class:'md_save_load'});
	
	md_content.time_fixing_even = $('<input>',{type:'text','requir':'Y', class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
	md_content.who_fixing_even = $('<select>',{'requir':'Y',class:'required'});
	md_content.who_report_even = $('<select>',{'requir':'Y',class:'required'});
	md_content.time_fixing_odd = $('<input>',{type:'text','requir':'Y',class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
	md_content.who_fixing_odd = $('<select>',{'requir':'Y',class:'required'});
	md_content.who_report_odd = $('<select>',{'requir':'Y',class:'required'});
	
	md_content.note = $('<input>',{type:'text', 'requir':'N',class:'text ui-widget-content ui-corner-all',css:{'width':'300px'}});
    
	
	
	/*Список сторон закрепления*/
	l_side_mas = JSON.parse(get_side_for_device(l_params));
	l_side_length = l_side_mas.length;
	l_side_name_even = l_side_mas[0]['NAME'];
	l_side_name_odd = 'Нечетная сторона'
	l_params.name_even = l_side_name_even;
	//console.log('l_side_length='+l_side_length);
	if (l_side_length == 2){
		l_side_name_odd = l_side_mas[1]['NAME'];
		l_params.name_odd = l_side_name_odd;
	} else {
		$(md_content.time_fixing_odd).removeClass();
		$(md_content.who_fixing_odd).removeClass();
		$(md_content.who_report_odd).removeClass();
		$(md_content.time_fixing_odd).attr('requir', 'N');
		$(md_content.who_fixing_odd).attr('requir', 'N');
		$(md_content.who_report_odd).attr('requir', 'N');
	}
	
	var fixing_device_even_list = new table_fixing_device_list(p_railway_id,p_part_id,l_side_mas,'EVEN'); /* Башмаки с четной стороны */
	var fixing_device_odd_list = new table_fixing_device_list(p_railway_id,p_part_id,l_side_mas,'ODD'); /* Башмаки с нечетной стороны */
	
	/**************************/
	
	var l_div_railway = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Наименование',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.railway_input);  

    var l_div_part = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Часть пути',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.part_input);  
	
	var l_div_users = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append(md_content.users); 
	var l_div_server_time = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append(md_content.server_time); 
	
	var l_div_choose_norm = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        //.append(md_content.choose_norm); 	
	var l_div_info = 
            $('<div>',{css:{'display':'table','float':'left','padding-right':'10px'}})
			.append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'400px'}})
                        .append(l_div_railway)
                        .append(l_div_part)
                    )
                )
            );
	var l_div_info2 = 
            $('<div>',{css:{'display':'table','float':'left','padding-right':'10px'}})
			.append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'auto'}})
                        .append(l_div_server_time)
						.append(l_div_users)
                    )
                )
            );	
	
	var l_div_norm = 
            $('<div>',{css:{'display':'table'}})
			.append(
                $('<div>',{class:'border',css:{'clear':'both', 'border':'none'}})
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'auto'}})
                        .append(l_div_choose_norm)
                    )
                )
            );	
	/* Четная сторона */
	var l_div_time_fixing = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата и время снятия(Мск)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.time_fixing_even); 
    
	var l_div_who_fixing = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кто проводит',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.who_fixing_even);
	
	var l_div_who_report_even = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кому докладывает',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.who_report_even);	
	
	/* Нечетная сторона */
	var l_div_time_fixing_odd = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата и время снятия(Мск)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.time_fixing_odd); 
	var l_div_who_fixing_odd = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кто проводит',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.who_fixing_odd);
	var l_div_who_report_odd = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кому докладывает',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.who_report_odd);
	var l_div_note = $('<div>',{css:{'display':'table'}}).append(
             $('<div>',{class:'attr',css:{'border':'none'}})
				.append(
					$('<div>')
							.append($('<label>',{text:'Примечание',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
							.append(md_content.note)
				)
            );
	var l_div_rules = $('<div>');
    
	
	
	
	/* Четная сторона */
	var l_div_even_side = 
            $('<div>',{css:{'display':'table','float': 'left','padding-right':'10px'}}).append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{class:'header',css:{'width':'380px'}}).text(l_side_name_even)
                )
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'400px'}})
                        .append(l_div_time_fixing)
                        .append(l_div_who_fixing)
						.append(l_div_who_report_even)
						.append(fixing_device_even_list.get_list)
						
                    )
                )
            );
	/* Нечетная сторона */
	var l_div_odd_side = 
            $('<div>',{css:{'display':'table'}}).append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{class:'header',css:{'width':'380px'}}).text(l_side_name_odd)
                )
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'400px'}})
                        .append(l_div_time_fixing_odd)
                        .append(l_div_who_fixing_odd)
						.append(l_div_who_report_odd)
						.append(fixing_device_odd_list.get_list)
						
                    )
                )
            );
	
	if (l_side_length == 1){
		$(l_div_odd_side).hide();
	}
	init_date_time_input(md_content.time_fixing_even);
	init_date_time_input(md_content.time_fixing_odd);
	fill_users_for_cond_train(md_content.who_fixing_even,l_params,'prc_fc');
	fill_users_for_cond_train(md_content.who_fixing_odd,l_params,'prc_fc');
	
	fill_users_for_cond_train(md_content.who_report_even,l_params,'prr_fc'); // Кому докладывает
	fill_users_for_cond_train(md_content.who_report_odd,l_params,'prr_fc'); // Кому докладывает
	$('<div>')
        .addClass('route-window-attr')
       /*  .append(l_div_railway)
		.append(l_div_part) */
		.append(l_div_info)
		.append(l_div_info2)
		.append(l_div_norm)
        .append(l_div_rules)
		.append(l_div_even_side)
		.append(l_div_odd_side)
		.append(l_div_note)		
        .appendTo(md_content);

    md_content.dialog({
        resizable:false,
        modal:true,
        width: '900px',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Сохранить':{
                text: "Сохранить",
                id: "md_save_route_btn",
                click: function(){
					//fixing_device_even_list.get_checked_length();
					var v_params = {};
						v_params.transactions_id = l_transactions_id;
						v_params.railway_id = p_railway_id; // Путь
						v_params.part_id = p_part_id; // Часть пути
						v_params.users = md_content.users.val(); // Пользователь
						v_params.server_time = md_content.server_time.val(); // Время
						v_params.transaction_type = 'OUT'; // Тип транзикции
						v_params.device_mas_even = fixing_device_even_list.get_fixing_device_out_list(); // ЧетС.Список башмаков
						v_params.device_mas_odd = fixing_device_odd_list.get_fixing_device_out_list(); // НеЧетС.Список башмаков
						v_params.time_fixing_even = md_content.time_fixing_even.val(); // ЧетС.Дата
						v_params.who_fixing_even = md_content.who_fixing_even.val(); // ЧетС.Кто проводит
						v_params.who_fixing_report_even = md_content.who_report_even.val(); // ЧетС.Кому докладывает
						v_params.who_fixing_odd = md_content.who_fixing_odd.val(); // НечС.Кто проводит
						v_params.who_fixing_report_odd = md_content.who_report_odd.val(); // НечС.Кому докладывает
						v_params.time_fixing_odd = md_content.time_fixing_odd.val(); // НечС.Дата
						v_params.note = md_content.note.val(); // Примечание
						//console.log(JSON.stringify(l_params));
					 var l_params_json = JSON.stringify(v_params);
					 // Проверка перед сохранением
					 if (!validation_save_ondock()){
						 //alert(false);
						 return;
					 }
					 //alert('Форма в разработке');
					 //return;
					 var f_res = save_transaction_ondock(l_params_json);
					 var f_res_mas = f_res.split('$');
                     if (f_res_mas[0]=='done') {
                        var l_mes = '';
                            l_mes = 'Данные сохранены!';//.ID='+f_res_mas[1];
						$('#refreshRailcar').triggerHandler('click');
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение',l_mes);
                     }else{
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!'+f_res_mas[1]);
                     };
                }   
            },
            'Закрыть форму': {
                text:'Закрыть форму',
                id:'md_close_form_btn',
                click: function(){
                    md_content.dialog("close");
                }
            }
        },
        close: function() {
            md_content.remove();
        }
    });

    
    stop_loading_animation();
}

/* Корректировка ЗУ */
function create_window_update_fix_device(p_railway_id,p_part_id){
	var l_params = {};
        l_params.railway_id = p_railway_id;
        l_params.part_id = p_part_id;
		l_params.transaction_type_fix = 'IN';
		l_params.transaction_type_undock = 'OUT';
		l_params.calculation_type = 'MANUAL';
		l_params.name_even = '';
		l_params.name_odd = '';
		l_params.norma_even = '0';
		l_params.norma_odd = '0';
		
	
	// Часть пути
	var railway_parts = get_railway_parts(p_railway_id,p_part_id);
	var railway_parts_name;
	$.each(railway_parts, function( i, item ) {
		railway_parts_name = item.NAME;
	});
	/* Название пути */
	var disl_railway = get_railway_add_info(p_railway_id);
	var railway_name;
	$.each(disl_railway, function( i, item ) {
		railway_name = item.RAILWAY_NUMBER;
	});
	
    function railcar_table_for_fix_device(){
        var self = this;
        this.add_error_msg = null;
        this.cars_table_total_row;
        this.cars_count = 0;
        
        this.cars_mas = [];

        var return_table = $('<div>');
        return_table.append(
            '<table class="received_cars_table fix_device_cars_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th>№</th>'+
                        '<th>Вагон</th>'+
                        '<th>Вес <br>груза</th>'+
                        '<th>Кол-во осей</th>'+
						'<th></th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'
        );


        return_table.add_carnumber_input = $('<input>',{type:'text',css:{'font-size':'11px'}, class:'text ui-widget-content ui-corner-all'}).attr('size', '8').attr('maxlength', '8');

        this.car_number_input = return_table.add_carnumber_input;

        return_table.add_carnumber_btn = $('<input>',{type:'button',css:{'font-size':'11px','height':'17px'}, class:'btnAdd'}).val('Добавить'); // Назначение ЗУ (добавить)
        return_table.add_carnumber_btn.on('click', function(){
			//alert(1);
			l_car_number = return_table.add_carnumber_input.val();
			if (l_car_number.length==0 || l_car_number == null && l_car_number !== ''){
				return_table.add_carnumber_input.addClass('red_bckg_color');
                alert('Вагон не введен!');
                return false;
			}
			//console.log('==add_cars_in_table');
			self.add_cars_in_table(null,null,null,true);
        });
        return_table.add_carnumber_input.on('keypress', function(e){
            if(e.keyCode===13){
                l_car_number = return_table.add_carnumber_input.val();
				if (l_car_number.length==0 || l_car_number == null && l_car_number !== ''){
					return_table.add_carnumber_input.addClass('red_bckg_color');
					alert('Вагон не введен!');
					return false;
				}
				self.add_cars_in_table(null,null,null,true);
            }
        });
        
        return_table.add_carnumber_div = $('<div>',{css:{'margin-left':'61px'}});
        return_table.append(
            return_table.add_carnumber_div
                .append(return_table.add_carnumber_input)
                .append(return_table.add_carnumber_btn)
        );

        return_table.cars_table = $('<table>',{class:'received_cars_table fix_device_cars_table'}).append($('<tbody>'));
        return_table.append(
            $('<div>',{class:'modalDialogContainer',css:{'display':'inline-block', 'height':'100px'}})  
            .append(return_table.cars_table)
        );
        return_table.cars_table_total_row = $('<tr>',{css:{'background':'#EBEBEB','font-weight':'bold'}});
        self.cars_table_total_row = return_table.cars_table_total_row;
        return_table.append(
            $('<table>',{class:'received_cars_table fix_device_cars_table',css:{'margin-top':'-4px'}})
            .append(
                $('<tbody>').append(return_table.cars_table_total_row)
            )
        );

        function change_cars_table_total_tr(){
            return_table.cars_table_total_row.find('td').remove();
            if (self.cars_count!==0) {
                var l_count_of_axles = 0;
                return_table.cars_table.find('tr td:nth-child(4)').each(function(){
                    l_count_of_axles+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
                });

                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>Кол-во: '+ self.cars_count +'</td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>'+Math.round(l_count_of_axles * 100)/100+'</td>');
            }else{
                self.cars_lenght = 0;

                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>Кол-во: 0</td>');
                return_table.cars_table_total_row.append('<td></td>');
                return_table.cars_table_total_row.append('<td>0</td>');
            }
        }

        this.spec_check_car_number = function(p_car_number){
            return true;
        };
        this.check_car_number = function(p_car_number){
            var find_result = self.spec_check_car_number(p_car_number);
			//console.log('==find_result='+find_result);
            if (!find_result){
				//console.log('==1=');
                return_table.add_carnumber_input.addClass('red_bckg_color');
                if (this.add_error_msg === null){
                    alert('На путях нет вагона с номером '+p_car_number+'!');
                }else{
                    alert(this.add_error_msg);
                }
                return false;
            }  else if(return_table.cars_table.find('tr td:contains("'+p_car_number+'")').length!==0) {
				//console.log('==2=');
                return_table.add_carnumber_input.addClass('red_bckg_color');
                alert('Вагон '+p_car_number+' уже добавлен!');
                return false;
            } /*else{
				console.log('==3=');
                return_table.add_carnumber_input.removeClass('red_bckg_color').val('');
				return false;
            }*/
            return true;
        };

        this.add_cars_in_table = function(p_railwai_id,p_part_id,p_car_number,p_need_check){
			
            var add_car_number;
            if (p_car_number === null || p_car_number === '') {
                add_car_number = return_table.add_carnumber_input.val();
            } else {
                add_car_number = p_car_number;
            }
            var check_car_number_result = true;
            if (p_need_check && add_car_number.length!=0) {
                check_car_number_result = self.check_car_number(add_car_number);
            }
			//console.log('==check_car_number_result='+check_car_number_result+' add_car_number='+add_car_number+' p_railwai_id='+p_railwai_id);
            if (check_car_number_result && ((add_car_number !== null && add_car_number !== '') || (p_railwai_id !==null || p_railwai_id !== ''))) {
            //if (1 === 1) {

                var params = {};
                params.railway_id = p_railwai_id;
				params.part_id = p_part_id;
				params.car_number = add_car_number;
				//console.log(JSON.stringify(params));
                $.ajax({
                    url: 'data.php',
                    type: 'POST',
                    dataType: "text",
                    async: false,
                    data: { params: JSON.stringify(params)
                           ,ajax_action: 'get_railway_cars_for_upd'
                          },
                    success: function (data) {
						//console.log('data='+data);
                        var records = JSON.parse(data);

                        for(var i=0; i<records.length; i++) {
                            self.cars_count++;
                            var child = records[i];
							//console.log(child);
                            var tr = $('<tr/>');
                            tr.pos = self.cars_mas.length;
                            
                            tr.round_id = child.ROUND_ID;
							tr.car_number = child.CAR_NUMBER;
                            tr.add_info_id = child.ADD_INFO_ID;
                            tr.weight_net = ((child.WEIGHT_NET !== null) ? child.WEIGHT_NET.replace(',','.') : '');
                            tr.count_of_axles = child.COUNT_OF_AXLES;
							tr.transactions_cars_id = child.TRANSACTIONS_CARS_ID;
							tr.deleted = 'N';

                            tr.append('<td>'+self.cars_count+'</td>');
                            tr.append('<td>'+child.CAR_NUMBER+'</td>');
                            tr.append('<td>'+((child.WEIGHT_NET !== null) ? child.WEIGHT_NET.replace(',','.') : '')+'</td>');
                            tr.append('<td>'+((child.COUNT_OF_AXLES !== null) ? child.COUNT_OF_AXLES.replace(',','.') : '')+'</td>');
                            
                            tr.del_image_div = $('<div>',{class:'deleteImage deleteImage13px'})
                                .on('click', function(){
									var l_tr = $(this).parent().parent();
									var l_pos = $(l_tr).index();
									del_cars_table_tr(l_tr);
									self.cars_mas[l_pos]['deleted'] = 'Y';
									//console.log(self.cars_mas);
									self.cars_count--;
                                    change_cars_table_total_tr(); 
                                });
                            $('<td>').append(tr.del_image_div).appendTo(tr);
                            tr.appendTo(return_table.cars_table); 
                            
                            self.cars_mas[tr.pos] = tr;
                        }
                    },
                    error: function (m1,m2) {window.alert(m1+m2);}
                });
            }
            change_cars_table_total_tr();
        };

        this.get_cars_in_table = function(){
            var l_cars_mas = [];
            self.cars_mas.forEach(function(tr){
                var l_car = {};
				l_car.car_number = tr.car_number;
                l_car.round_id = tr.round_id;
                l_car.add_info_id = tr.add_info_id;
                l_car.weight_net = tr.weight_net;
                l_car.count_of_axles = tr.count_of_axles;
				l_car.transactions_cars_id = tr.transactions_cars_id;
				l_car.deleted = tr.deleted;
                l_cars_mas.push(l_car);
            });
			//var l_params = l_cars_mas; console.log('l_result='+JSON.stringify(l_params));
            return l_cars_mas;
        };

        this.get_table = function(){
			
            return return_table;
        };
        
        this.edit_table = function (p_edit){
            self.cars_mas.forEach(function(tr){
                if (p_edit){
                    tr.del_image_div.show();
                    //tr.up_image_div.show();
                    //tr.down_image_div.show();
                }else{
                    tr.del_image_div.hide();
                    //tr.up_image_div.hide();
                    //tr.down_image_div.hide();
                }
            });
            
            if (p_edit){
                return_table.add_carnumber_div.show();
            }else{
                return_table.add_carnumber_div.hide();
            }
        };
    };
	// Сравнение двух дат
	function date_comparison (p_firstDate, p_secondDate,p_oper){
		var datetime_regex = /(\d\d)\.(\d\d)\.(\d\d\d\d)\s(\d\d):(\d\d)/; // Формат даты
		var first_date_arr = datetime_regex.exec(p_firstDate);
		var first_datetime = new Date(first_date_arr[3], first_date_arr[2], first_date_arr[1], first_date_arr[4], first_date_arr[5]);

		var second_date_arr = datetime_regex.exec(p_secondDate);
		var second_datetime = new Date(second_date_arr[3], second_date_arr[2], second_date_arr[1], second_date_arr[4], second_date_arr[5]);
		if (p_oper == '<'){
			if(first_datetime.getTime() <= second_datetime.getTime()) {
				//console.log('<');
				return true;
			} else {
				return false;
			}
		}
		if (p_oper == '>'){
			if(first_datetime.getTime() >= second_datetime.getTime()) {
				//console.log('>');
				return true;
				
			} else {
				return false;
			}
		}
		//console.log('true');
		return true;
	}
    function get_overall_array(p_array_first, p_array_second){
		var l_over_val;
		l_over_val='';
		$.each(p_array_first, function( key_1, value_1 ) {
			$.each(p_array_second, function( key_2, value_2 ) {
				if (p_array_first[key_1]['device_id'] == p_array_second[key_2]['device_id']){
					l_over_val = l_over_val+p_array_first[key_1]['item_name']+';';
				}
			});
		});
		//console.log(l_over_val); 
		return l_over_val;
	}
	
	/* Список башмаков для станции */
	/* Список башмаков(chexbox) */
    function table_fixing_device_list(p_railway_id,p_part_id,p_side_mas,p_side_type){
        
		//console.log('p_trigger='+p_trigger);
		var self = this;
        
        var return_table = $('<div>');
        
        var l_ul = $('<ul>',{'trigger':'N',class:'ui-autocomplete ui-front ui-menu ui-widget ui-widget-content',css:{'max-height':'20em','height':'10em','display':'block','position':'static'}});
        
        var l_seg_2 = $('<select>',{class:'',css:{'width':'3.5em'}}); 
        var l_seg_4_f = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'2em'}});
        var l_seg_4_l = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'2em'}});
        var l_seg_5 = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'1em'}});
        var l_side_id='';
		
        l_seg_2.append($('<option>',{'val':'','text':''}));
        l_seg_2.append($('<option>',{'val':'БО','text':'БО'}));
        l_seg_2.append($('<option>',{'val':'СН','text':'СН'}));
        		
        var l_refresh_btn = $('<div>',{class:'refresh',title:'Обновить',css:{'position':'relative','float':'right','top':'1px','right':'2px'}});
        if (p_side_type == 'EVEN'){
			if (contains(p_side_mas,0) == true){
				l_side_id = p_side_mas[0]['SIDE_ID'];
			}
		}
		if (p_side_type == 'ODD'){
			if (contains(p_side_mas,1) == true){
				l_side_id = p_side_mas[1]['SIDE_ID'];
			}
		}
		
        l_refresh_btn.on('click',function(){
            l_ul.find('li > input:not(:checked)').parent().remove();
			var p_trigger='N';
			if(typeof $(l_ul).attr('trigger') == "undefined"){
				p_trigger='N';
			} else {
				//l_ul.find('li > input:not(:checked)').parent().remove();
				p_trigger = 'Y';
			}
            //console.log('p_trigger='+p_trigger);
            var v_param = {};
            v_param.railway_id = p_railway_id;
			v_param.side_type = p_side_type;
			v_param.part_id = p_part_id;
            v_param.seg2 = l_seg_2.val();
            v_param.seg4f = l_seg_4_f.val();
            v_param.seg4l = l_seg_4_l.val();
            v_param.seg5 = l_seg_5.val();
			v_param.trigger = p_trigger;
			//console.log(JSON.stringify(v_param));
            $.ajax({
                url: '/data.php',
                type: 'POST',
                dataType: "text",
                data:   {params: JSON.stringify(v_param)
                        ,ajax_action: 'get_device_for_update'},
                success: function (data) {
                        var l_fd = JSON.parse(data);
						
						var l_text_color='';
						var l_error='N';
						var l_railway_name='';
						var l_selected='false';
                        $.each(l_fd, function(i, item) {
							l_railway_name = item.RAILWAY_NAME;
							l_selected=item.SELECTED;
							//console.log('l_selected='+l_selected);
							
							if (l_railway_name.length>1){
								l_text_color = 'red';
								l_error='Y';
								l_railway_name = item.RAILWAY_NAME;
							} else {
								l_error='N';
								l_text_color = '';
								l_railway_name='';
							}
                            if (l_ul.find('li > input[id="'+item.ID+'"]').length===0){
                                l_ul.append($('<li>',{'class':'ui-menu-item','css':{'color':l_text_color},'title':l_railway_name})
                                                .append($('<input>',{'id':item.ID,'side_id':l_side_id,
																	 'side_type':p_side_type,
																	 'transactions_lines_id':item.TRANSACTIONS_LINES_ID,
																	 'item_name':item.NAME,
																	 error_value:l_error,
																	 'type':'checkbox','css':{'position':'relative','top':'2px'}}).attr('checked',l_selected))
                                                .append(item.NAME));
                            }        
                        });
						l_ul.attr('trigger','Y')						
                    }
            }); 
        }); 
		l_refresh_btn.triggerHandler('click');
        return_table
            .appendTo(md_content)
            .css({'display':'inline-table','margin-left':'1em'})
            .append(
                $('<div>')
                    .addClass('border')
                    .css({'clear':'both'})
                    .append(
                        $('<div>')
                            .addClass('header')
                            .css({'width':'270px'}) 
                            .append($('<label>',{text:'2',class:'',css:{'margin-right':'3px'}}))
                            .append(l_seg_2) 
                            .append($('<label>',{text:'4_с',class:'',css:{'margin-left':'3px','margin-right':'3px'}}))
                            .append(l_seg_4_f) 
                            .append($('<label>',{text:'4_по',class:'',css:{'margin-left':'3px','margin-right':'3px'}}))
                            .append(l_seg_4_l) 
                            .append($('<label>',{text:'5',class:'',css:{'margin-left':'3px','margin-right':'3px'}}))
                            .append(l_seg_5) 
                            .append(l_refresh_btn)
                            
                    )
                    .append(
                        $('<div>')
                            .css({'display':'inline-table','width':'270px','text-align':'left'})
                            .append(l_ul)
                    )
            );

        this.get_fixing_device_in_list = function(){
            var l_result = [];
            l_ul.find('li > input:checked').each(function(index){
                var l_item = {};
                l_item.device_id = $(this).attr('id');
				l_item.side_id = $(this).attr('side_id');
				l_item.side_type = $(this).attr('side_type');
				l_item.item_name = $(this).attr('item_name');
				l_item.transactions_lines_id = $(this).attr('transactions_lines_id');
				l_item.deleted = 'N';
				
                l_result.push(l_item);
            });
			l_ul.find('li > input:not(:checked)').each(function(index){
               
				if ($(this).attr('transactions_lines_id') !== '0'){
					 var l_item = {};
					l_item.device_id = $(this).attr('id');
					l_item.side_id = $(this).attr('side_id');
					l_item.side_type = $(this).attr('side_type');
					l_item.item_name = $(this).attr('item_name');
					
					l_item.transactions_lines_id = $(this).attr('transactions_lines_id');
					l_item.deleted = 'Y';
					l_result.push(l_item);
				}
                
            });
            return l_result;
        };
		
		this.get_fix_error_dev_in_list = function(){
            var l_result = [];
            l_ul.find('li > input:checked').each(function(index){
               
				if ($(this).attr('error_value') == 'Y'){
					 var l_item = {};
					l_item.device_id = $(this).attr('id');
					l_item.side_id = $(this).attr('side_id');
					l_item.side_type = $(this).attr('side_type');
					l_result.push(l_item);
				}
                
            });
            return l_result;
        };
		
        this.get_list = function(){
            return return_table;
        };
		this.get_checked_length = function(){
            var l_result;
            l_result = l_ul.find('li > input:checked').length;
            return l_result;
        };
		
		function contains (p_array, p_index){
			if(typeof p_array[p_index] == 'undefined') {
				return false;
			}
			else {				
				return true;
			}
		}
		
    };
	function table_norma_list(p_params,p_cars){
		var self = this;
		var return_table = $('<div id="div_select">');
			$(return_table).hide();
		var l_select;
		var l_css_even; 
        var v_params = {};
            v_params.railway_id = p_railway_id;
            v_params.part_id = p_part_id;
            v_params.cars = railcar_table.get_cars_in_table();
            //console.log('l_result='+JSON.stringify(l_params));
            var l_result =  get_suitable_device_rules(JSON.stringify(v_params));
            var l_device_rules = JSON.parse(l_result);
                $(l_div_rules).empty();
                l_device_rules.side_mas.forEach(function (item,index){
						
						var id_select;
						if (index == 0){
							id_select ='select_even';
							l_css_even='10px';
						}
						if (index == 1){
							id_select ='select_odd';
							l_css_even='190px';
						}
						l_select = $('<select>',{id:id_select,class:'route-window-attr-item-elem',css:{'width':'15em'}}); 
                        l_select.side_id = item.side_id;
                        item.skid_mas.forEach(function (item){
                            var l_opt = $('<option>',{'val':item.rule_id,'norma':item.cnt_skid,'cnt_axis':item.cnt_axis,'text':'  норма:'+item.cnt_skid+' осей: '+item.cnt_axis});
                            if (item.selected === 'Y') {
                                l_opt.attr('selected', true);
                            }
                            l_select.append(l_opt);
                        });
						//$(l_select).hide();
                        return_table
							.addClass('route-window-attr-item helper-clearfix')
                            .append($('<label>',{text:item.side_descr, class:'route-window-attr-item-text route-window-attr-item-text-left',css:{'padding-right':'10px','padding-left':l_css_even}}))
                            .append(l_select)
                            .appendTo(l_div_rules);      
                });
        
		this.get_norma_in_list = function(){
            var l_result = [];
            return_table.find('select > option:checked').each(function(index){
                var l_item = {};
                l_item.rule_id = $(this).val();
				l_item.norma = $(this).attr('norma');
				l_item.cnt_axis = $(this).attr('cnt_axis');
                l_result.push(l_item);
            });
            return l_result;
        };
		
		function contains (p_array, p_index){
			if(typeof p_array[p_index] == 'undefined') {
				return false;
			}
			else {				
				return true;
			}
		}
		
		this.get_list = function(){
            return return_table;
        };
	}
	function del_cars_table_tr(p_tr){
        p_tr.nextAll().children('td:nth-child(1)').each(function(){
            $(this).text(parseInt($(this).text())-1);
        });
        p_tr.remove();
    }
	
    function get_suitable_device_rules(p_params){            
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { params: p_params
                   ,ajax_action: 'get_suitable_device_rules'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }
	function set_users_for_cond_train(p_select,p_params,p_type,p_user_type){
		p_select.empty();
        p_select.append($('<option>'));
		
		var v_params = p_params;
			v_params.type = p_type;
			v_params.user_type = p_user_type;
			
			//console.log('l_result='+(JSON.stringify(v_params)));
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   { params: JSON.stringify(v_params)
					 ,ajax_action: 'set_users_for_cond_train'},
            success: function (data) {
					//console.log('data='+data);
					var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.NAME).val(item.ID).attr('selected',item.SELECTED);;
                        p_select.append(l_option);
                    }); 
                }
        });
    }
	// Список сторон закрепления
	function get_side_for_device(p_params){
        var result = [];
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   { params: JSON.stringify(l_params)
					 ,ajax_action: 'get_side_for_device'},
            success: function (data) {
				//console.log(data);
				result = data;
            }
        });
		return result;
    }

	/* Update данные */
    function update_transaction_fix_ajax(p_add_data){
		//console.log('l_result='+(p_add_data));
		
        var res = null;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { add_data: p_add_data
                   ,ajax_action: 'update_transaction_fix_device'},
            success: function (data) {
				//console.log(data);
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }
	/* Проверка, чтобы на путях не были назначены ЗУ */
	function validation_fix (p_params){
		//console.log('p_params='+JSON.stringify(l_params));
		var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { params: JSON.stringify(l_params)
                   ,ajax_action: 'validation_fix'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
	}
	/* Проверка перед сохранением */
	function validation_save_fix (){
		var dev_even_count = fixing_device_even_list.get_checked_length();
		var dev_odd_count = fixing_device_odd_list.get_checked_length();
		
		var dev_even_ar = fixing_device_even_list.get_fix_error_dev_in_list();
		var dev_odd_ar  = fixing_device_odd_list.get_fix_error_dev_in_list();
		
		var even_array = fixing_device_even_list.get_fixing_device_in_list();
		var odd_array  = fixing_device_odd_list.get_fixing_device_in_list();
		var l_over_val = get_overall_array(even_array,odd_array);

		var v_params = l_params;
		//console.log(v_params);
		var norma_even = v_params.norma_even;
		var norma_odd = v_params.norma_odd;
		var calcul = v_params.calculation_type;
		var side_length = v_params.side_length;
		var l_time_fixing_even = md_content.time_fixing_even; // ЧетС.Дата
		var l_who_fixing_even = md_content.who_fixing_even; // ЧетС.Кто проводит
		var l_who_fixing_report_even = md_content.who_report_even; // ЧетС.Кому докладывает
		var l_who_fixing_odd = md_content.who_fixing_odd; // НечС.Кто проводит
		var l_who_fixing_report_odd = md_content.who_report_odd; // НечС.Кому докладывает
		var l_time_fixing_odd = md_content.time_fixing_odd; // НечС.Дата
			
			
			if (l_over_val.length > 5){
				create_info_modal_dialog_new('Оповещение','На сторонах назначены одинаковые ЗУ:'+l_over_val);
				return false;
			}
			//console.log('calcul='+calcul+' norma_even='+norma_even+' dev_even_count='+dev_even_count+' dev_odd_count='+dev_odd_count+' norma_odd='+norma_odd+' dev_even_ar='+dev_even_ar.length+' dev_odd_ar='+dev_odd_ar.length);
			if (dev_even_ar.length>0){
				create_info_modal_dialog_new('Оповещение','На стороне "'+v_params.name_even+'" выбраны ЗУ, которые используются на других путях');
				return false;
			}
			if (dev_odd_ar.length>0){
				create_info_modal_dialog_new('Оповещение','На стороне "'+v_params.name_odd+'" выбраны ЗУ, которые используются на других путях');
				return false;
			}
			if($(l_time_fixing_even).val() !== null && $(l_time_fixing_even).val() !== '' && $(l_time_fixing_odd).val() !== null && $(l_time_fixing_odd).val() !== '') {
				console.log($(l_time_fixing_even).val());
				console.log($(l_time_fixing_odd).val());
			}
			if (calcul == 'AUTO'){
				if (norma_even > 0 && dev_even_count < norma_even){
					create_info_modal_dialog_new('Оповещение','На стороне "'+v_params.name_even+'" норма = '+norma_even+', выбрано '+dev_even_count+' ЗУ');
					return false;
				}  
				if (norma_odd > 0 && dev_odd_count < norma_odd){
					create_info_modal_dialog_new('Оповещение','На стороне "'+v_params.name_odd+'" норма = '+norma_odd+', выбрано '+dev_odd_count+' ЗУ');
					return false;
				}
				if ($(l_time_fixing_even).attr('requir') == 'Y' && $(l_time_fixing_even).val() ==''){
					create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+v_params.name_even+'"');
					return false;
				}
				if ($(l_who_fixing_even).attr('requir') == 'Y' && $(l_who_fixing_even).val() ==''){
					create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+v_params.name_even+'"');
					return false;
				}
				if ($(l_who_fixing_report_even).attr('requir') == 'Y' && $(l_who_fixing_report_even).val() ==''){
					create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+v_params.name_even+'"');
					return false;
				}
				
				if ($(l_time_fixing_odd).attr('requir') == 'Y' && $(l_time_fixing_odd).val() ==''){
					create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+v_params.name_odd+'"');
					return false;
				}
				if ($(l_who_fixing_odd).attr('requir') == 'Y' && $(l_who_fixing_odd).val() ==''){
					create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+v_params.name_odd+'"');
					return false;
				}
				if ($(l_who_fixing_report_odd).attr('requir') == 'Y' && $(l_who_fixing_report_odd).val() ==''){
					create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+v_params.name_odd+'"');
					return false;
				}
				
			}
			if (calcul == 'MANUAL'){
				if (side_length == 1) {
					if (dev_even_count < 1){
						create_info_modal_dialog_new('Оповещение','На стороне "'+v_params.name_even+'" не выбраны ЗУ!');
						return false;
					}
					if ($(l_time_fixing_even).attr('requir') == 'Y' && $(l_time_fixing_even).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+v_params.name_even+'"');
						return false;
					}
					if ($(l_who_fixing_even).attr('requir') == 'Y' && $(l_who_fixing_even).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+v_params.name_even+'"');
						return false;
					}
					if ($(l_who_fixing_report_even).attr('requir') == 'Y' && $(l_who_fixing_report_even).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+v_params.name_even+'"');
						return false;
					}
					
					if ($(l_time_fixing_odd).attr('requir') == 'Y' && $(l_time_fixing_odd).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+v_params.name_odd+'"');
						return false;
					}
					if ($(l_who_fixing_odd).attr('requir') == 'Y' && $(l_who_fixing_odd).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+v_params.name_odd+'"');
						return false;
					}
					if ($(l_who_fixing_report_odd).attr('requir') == 'Y' && $(l_who_fixing_report_odd).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+v_params.name_odd+'"');
						return false;
					}
				} else {
					if (dev_even_count < 1){
						create_info_modal_dialog_new('Оповещение','На стороне "'+v_params.name_even+'" не выбраны ЗУ!');
						return false;
					}
					if (dev_odd_count < 1){
						create_info_modal_dialog_new('Оповещение','На стороне "'+v_params.name_odd+'" не выбраны ЗУ!');
						return false;
					}
					
					if ($(l_time_fixing_even).attr('requir') == 'Y' && $(l_time_fixing_even).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+v_params.name_even+'"');
						return false;
					}
					if ($(l_who_fixing_even).attr('requir') == 'Y' && $(l_who_fixing_even).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+v_params.name_even+'"');
						return false;
					}
					if ($(l_who_fixing_report_even).attr('requir') == 'Y' && $(l_who_fixing_report_even).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+v_params.name_even+'"');
						return false;
					}
					
					if ($(l_time_fixing_odd).attr('requir') == 'Y' && $(l_time_fixing_odd).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата и время закрепления(Мск)" для стороны "'+v_params.name_odd+'"');
						return false;
					}
					if ($(l_who_fixing_odd).attr('requir') == 'Y' && $(l_who_fixing_odd).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кто проводит" для стороны "'+v_params.name_odd+'"');
						return false;
					}
					if ($(l_who_fixing_report_odd).attr('requir') == 'Y' && $(l_who_fixing_report_odd).val() ==''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Кому докладывает" для стороны "'+v_params.name_odd+'"');
						return false;
					}
				}
			}
		return true;
	}
	function contains (p_array, p_index){
		if(typeof p_array[p_index] == 'undefined') {
			return false;
		}
		else {				
			return true;
		}
	}
	function change_select(){
		if ($(norma_table).length == 0){
			null;
		} else {
			p_norma_list = norma_table.get_norma_in_list();
			l_params.norma_even = p_norma_list[0]['norma'];
			if (contains(p_norma_list, 1) == true) {
				l_params.norma_odd = p_norma_list[1]['norma'];
			}
		}
		if (l_params.norma_even == '0') {
				$(md_content.time_fixing_even).removeClass();
				$(md_content.who_fixing_even).removeClass();
				$(md_content.who_report_even).removeClass();

				$(md_content.time_fixing_even).attr('requir', 'N');
				$(md_content.who_fixing_even).attr('requir', 'N');
				$(md_content.who_report_even).attr('requir', 'N');
		}
		if (l_params.norma_odd == '0') {
				$(md_content.time_fixing_odd).removeClass();
				$(md_content.who_fixing_odd).removeClass();
				$(md_content.who_report_odd).removeClass();

				$(md_content.time_fixing_odd).attr('requir', 'N');
				$(md_content.who_fixing_odd).attr('requir', 'N');
				$(md_content.who_report_odd).attr('requir', 'N');
		}
		//console.log(JSON.stringify(l_params));
		//console.log(JSON.stringify(l_params));
	}
	
	function set_header_value_fix(p_params,p_obj,p_type){
		//var res = null;
		//console.log('p_params='+JSON.stringify(p_params));
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { params: JSON.stringify(p_params)
                   ,ajax_action: 'set_header_value_fix'},
            success: function (data) {
                var res = data;
				//console.log('res='+res);
				var records = JSON.parse(res);
                    $.each(records, function( i, item ) {
						l_params.calculation_type = item.CALCULATION_TYPE;
						l_params.norma_even = item.NORMA_EVEN;
						l_params.norma_odd = item.NORMA_ODD;
						//if (l_params.norma_even == '0' )
                        if (p_type =='time_fixing_even'){
							$(p_obj).val(item.DATE_FIX_EVEN);
							//console.log('res='+item.DATE_FIX_EVEN);
						}
						if (p_type =='time_fixing_odd'){
							$(p_obj).val(item.DATE_FIX_ODD);
						}
						if (p_type =='note'){
							$(p_obj).val(item.NOTE_FIX);
						}
                    }); 
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        //return res;
	}
	function delete_fix (p_params){
		var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { params: p_params
                   ,ajax_action: 'delete_fix'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
	}
	
	var l_valid_fix; 
		l_valid_fix = validation_fix(l_params);
	var f_res_mas = l_valid_fix.split('$');
			if (f_res_mas[0]=='done') {
				if (f_res_mas[1] =='true'){
					var l_mes = '';
						l_mes = 'На данном пути не назначены ЗУ!';
					   // md_content.dialog("close");
						create_info_modal_dialog_new('Оповещение',l_mes);
						return;
				}
			}
			if (f_res_mas[0]=='fail'){
				//md_content.dialog("close");
				create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
				return;
			}
    start_loading_animation();
    
    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .appendTo('body');

    var l_title = 'Корректировка ЗУ';

    md_content.attr('title',l_title);
    md_content.railway_input = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(railway_name);
    md_content.part_input = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(railway_parts_name);
	md_content.users = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(user_name);
	md_content.server_time = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(get_server_current_time());
    
	md_content.choose_norm = $('<input>',{type:'button', id:'md_choose_norm_btn', value:'Подобрать норму', class:'md_save_load'});
	
	md_content.time_fixing_even = $('<input>',{type:'text','requir':'Y', class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
	md_content.who_fixing_even = $('<select>',{'requir':'Y',class:'required'});
	md_content.who_report_even = $('<select>',{'requir':'Y',class:'required'});
	md_content.time_fixing_odd = $('<input>',{type:'text','requir':'Y',class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
	md_content.who_fixing_odd = $('<select>',{'requir':'Y',class:'required'});
	md_content.who_report_odd = $('<select>',{'requir':'Y',class:'required'});
	
	md_content.note = $('<input>',{type:'text', 'requir':'N',class:'text ui-widget-content ui-corner-all',css:{'width':'300px'}});
	
	/*Список сторон закрепления*/
	l_side_mas = JSON.parse(get_side_for_device(l_params));
	l_side_length = l_side_mas.length;
	l_params.side_length = l_side_length;
	l_side_name_even = l_side_mas[0]['NAME'];
	l_params.name_even = l_side_name_even;
	l_side_name_odd = 'Нечетная сторона'
	//console.log('l_side_length='+l_side_length);
	if (l_side_length == 2){
		l_side_name_odd = l_side_mas[1]['NAME'];
		l_params.name_odd = l_side_name_odd;
	} else {
		$(md_content.time_fixing_odd).removeClass();
		$(md_content.who_fixing_odd).removeClass();
		$(md_content.who_report_odd).removeClass();
		$(md_content.time_fixing_odd).attr('requir', 'N');
		$(md_content.who_fixing_odd).attr('requir', 'N');
		$(md_content.who_report_odd).attr('requir', 'N');
	}
	
	/**************************/
	
	var l_div_railway = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Наименование',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.railway_input);  

    var l_div_part = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Часть пути',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.part_input);  
	
	var l_div_users = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append(md_content.users); 
	var l_div_server_time = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append(md_content.server_time); 
	
	var l_div_choose_norm = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        //.append(md_content.choose_norm); 	

	var l_div_info = 
            $('<div>',{css:{'display':'table','float':'left','padding-right':'10px'}})
			.append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'400px'}})
                        .append(l_div_railway)
                        .append(l_div_part)
                    )
                )
            );
	var l_div_info2 = 
            $('<div>',{css:{'display':'table','float':'left','padding-right':'10px'}})
			.append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'auto'}})
                        .append(l_div_server_time)
						.append(l_div_users)
                    )
                )
            );	
	
	var l_div_norm = 
            $('<div>',{css:{'display':'table'}})
			.append(
                $('<div>',{class:'border',css:{'clear':'both', 'border':'none'}})
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'auto'}})
                        .append(l_div_choose_norm)
                    )
                )
            );	
	/* Четная сторона */
	var l_div_time_fixing = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата и время закрепления(Мск)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.time_fixing_even); 
    
	var l_div_who_fixing = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кто проводит',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.who_fixing_even);
	
	var l_div_who_report_even = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кому докладывает',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.who_report_even);	
	
	/* Нечетная сторона */
	var l_div_time_fixing_odd = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата и время закрепления(Мск)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.time_fixing_odd); 
	var l_div_who_fixing_odd = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кто проводит',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.who_fixing_odd);
	var l_div_who_report_odd = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кому докладывает',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.who_report_odd);
	var l_div_note = $('<div>',{css:{'display':'table'}}).append(
             $('<div>',{class:'attr',css:{'border':'none','width': '500px'}})
				.append(
					$('<div>')
							.append($('<label>',{text:'Примечание',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
							.append(md_content.note)
				)
            );
	var l_div_rules = $('<div>');
	var railcar_table = new railcar_table_for_fix_device();
	
	var fixing_device_even_list = new table_fixing_device_list(p_railway_id,p_part_id,l_side_mas,'EVEN'); /* Башмаки с четной стороны */
	var fixing_device_odd_list = new table_fixing_device_list(p_railway_id,p_part_id,l_side_mas,'ODD'); /* Башмаки с нечетной стороны */
	
	/* Четная сторона */
	var l_div_even_side = 
            $('<div>',{css:{'display':'table','float': 'left','padding-right':'10px'}}).append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{class:'header',css:{'width':'380px'}}).text(l_side_name_even)
                )
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'400px'}})
                        .append(l_div_time_fixing)
                        .append(l_div_who_fixing)
						.append(l_div_who_report_even)
						.append(fixing_device_even_list.get_list)
						
                    )
                )
            );
	/* Нечетная сторона */
	var l_div_odd_side = 
            $('<div>',{css:{'display':'table'}}).append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{class:'header',css:{'width':'380px'}}).text(l_side_name_odd)
                )
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'400px'}})
                        .append(l_div_time_fixing_odd)
                        .append(l_div_who_fixing_odd)
						.append(l_div_who_report_odd)
						.append(fixing_device_odd_list.get_list)
						
                    )
                )
            );
	if (l_side_length == 1){
		$(l_div_odd_side).hide();
	}
	
	init_date_time_input(md_content.time_fixing_even);
	set_header_value_fix(l_params,md_content.time_fixing_even,'time_fixing_even');
	init_date_time_input(md_content.time_fixing_odd);
	set_header_value_fix(l_params,md_content.time_fixing_odd,'time_fixing_odd');
	
	set_users_for_cond_train(md_content.who_fixing_even,l_params,'prc_fc','USER_FIX_EVEN');
	set_users_for_cond_train(md_content.who_fixing_odd,l_params,'prc_fc','USER_FIX_ODD');
	
	set_users_for_cond_train(md_content.who_report_even,l_params,'prr_fc','USER_FIX_REP_EVEN'); // Кому докладывает
	set_users_for_cond_train(md_content.who_report_odd,l_params,'prr_fc','USER_FIX_REP_ODD'); // Кому докладывает
	set_header_value_fix(l_params,md_content.note,'note');
	var norma_table;
	change_select();
	//var norma_table = new table_norma_list();
	
	$('<div>')
        .addClass('route-window-attr')
       /*  .append(l_div_railway)
		.append(l_div_part) */
		.append(l_div_info)
		.append(l_div_info2)
		.append(l_div_norm)
        .append(l_div_rules)
		.append(l_div_even_side)
		.append(l_div_odd_side)
		.append(l_div_note)		
        .appendTo(md_content);

    
    md_content.append(railcar_table.get_table());
    
    railcar_table.add_cars_in_table(p_railway_id,p_part_id,null,true);	
    md_content.dialog({
        resizable:false,
        modal:true,
        width: '900px',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Подобрать норму':{
                text: "Подобрать норму",
                id: "md__btn",
                click: function(){ 
					norma_table = new table_norma_list(l_params,railcar_table)
					l_params.calculation_type = 'AUTO';
					$('#div_select').show();
                    //$('#select_even').show(); $('#select_odd').show();
					change_select();
					$("#select_even").on('change', '', function (e) {
						change_select();
					});
					$("#select_odd").on('change', '', function (e) {
						change_select();
					});
					
                }   
            },
            'Обновить данные':{
                text: "Обновить данные",
                id: "md_save_route_btn",
                click: function(){
					
					var v_params = {};
						v_params.railway_id = p_railway_id; // Путь
						v_params.part_id = p_part_id; // Часть пути
						v_params.users = md_content.users.val(); // Пользователь
						v_params.server_time = md_content.server_time.val(); // Время
						v_params.transaction_type = 'UPDATE'; // Тип транзикции
						v_params.calculation_type = l_params.calculation_type; // Тип подбора
						v_params.norma_even = l_params.norma_even;
						v_params.norma_odd = l_params.norma_odd;
						v_params.cars = railcar_table.get_cars_in_table(); // Список вагонов
						v_params.device_mas_even = fixing_device_even_list.get_fixing_device_in_list(); // ЧетС.Список башмаков
						v_params.device_mas_odd = fixing_device_odd_list.get_fixing_device_in_list(); // НеЧетС.Список башмаков
						v_params.time_fixing_even = md_content.time_fixing_even.val(); // ЧетС.Дата
						v_params.who_fixing_even = md_content.who_fixing_even.val(); // ЧетС.Кто проводит
						v_params.who_fixing_report_even = md_content.who_report_even.val(); // ЧетС.Кому докладывает
						v_params.who_fixing_odd = md_content.who_fixing_odd.val(); // НечС.Кто проводит
						v_params.who_fixing_report_odd = md_content.who_report_odd.val(); // НечС.Кому докладывает
						v_params.time_fixing_odd = md_content.time_fixing_odd.val(); // НечС.Дата
						v_params.note = md_content.note.val(); // Примечание
					 
					 var l_params_json = JSON.stringify(v_params);
					 if (!validation_save_fix()){
						 //alert(false);
						 return;
					 }
					 //console.log(l_params_json);
					 //return;
					 var f_res = update_transaction_fix_ajax(l_params_json);
					 var f_res_mas = f_res.split('$');
                     if (f_res_mas[0]=='done') {
                        var l_mes = '';
                            l_mes = 'Данные сохранены!';//.ID='+f_res_mas[1];
						$('#refreshRailcar').triggerHandler('click');
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение',l_mes);
                     }else{
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!'+f_res_mas[1]);
                     };
                }   
            },
			'Удалить закрепление':{
                text: "Удалить закрепление",
                id: "md__btn",
                click: function(){
					var note_delete = $('<input>',{type:'text','requir':'Y', css:{'padding-left':'10px'},class:'text ui-widget-content ui-corner-all required'}).attr('size', 'auto');
					var l_div_delete = $('<div>',{css:{'display':'table'}}).append(
						 $('<div>',{class:'attr',css:{'border':'none','width': 'auto'}})
							.append(
								$('<div>')
										.append($('<label>',{text:'Примечание',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
										.append(note_delete)
							)
						);
					
					$('<div/>')
						.attr('title','Удаление')
						.appendTo('body') // Присоединяем наше меню к body документа: 
						.append(l_div_delete)
						//.append('<p>'+'Причина:'+'</p>')
						.dialog({
							resizable:false,
							modal:true,
							width: '400px',
							draggable: false,
							buttons:{
								'Удалить': function(){
									if (note_delete.val() ==''){
										create_info_modal_dialog_new('Ошибка','Не заполнено поле "Примечание"!');
										return;
									}
									var v_params = {};
										v_params.railway_id = p_railway_id; // Путь
										v_params.part_id = p_part_id; // Часть пути
										v_params.note_delete = note_delete.val();
									var l_params_json = JSON.stringify(v_params);
									
									
									var f_res = delete_fix(l_params_json);
									var f_res_mas = f_res.split('$');
									if (f_res_mas[0]=='done') {
										var l_mes = '';
											l_mes = 'Данные сохранены!';//.ID='+f_res_mas[1];
										$('#refreshRailcar').triggerHandler('click');
										create_info_modal_dialog_new('Оповещение',l_mes);
										$(this).dialog( "close" );
										md_content.dialog("close");
									 }else{
										$(this).dialog( "close" );
										md_content.dialog("close");
										create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!'+f_res_mas[1]);
									 };
									
								},
								'Отмена': function(){
									$(this).dialog( "close" );
								},
							},
							close: function() {
								$(this).remove();
							}
						});
					
                }   
            },
            'Закрыть форму': {
                text:'Закрыть форму',
                id:'md_close_form_btn',
                click: function(){
                    md_content.dialog("close");
                }
            }
        },
        close: function() {
            md_content.remove();
        }
    });

    
    stop_loading_animation();
}


/* Обработка вагонов */
function create_md_processing_of_wagons(){

    start_loading_animation();
    
    $('#modalDialog').remove();
    $('.context-menu').remove();
	
	function fill_for_freigth(p_select, p_freight_name){
		
		var l_params = {};
			l_params.freight_name = p_freight_name;
			
		p_select.empty();
		p_select.append($('<option value="0"></option>'));
			$.ajax({
				 url: 'data.php',
                type: 'POST',
                dataType: "text",
                async: false,
				data:   { params: JSON.stringify(l_params),
						  ajax_action: 'get_disl_freight_oebs'},
					success: function (data) {
					var records = JSON.parse(data);
					$.each(records, function( i, item ) {
						var l_option = $('<option>').text(item.ITEM_NAME).val(item.INVENTORY_ITEM_ID);
							// Если груз удалось сопоставить, то выбираем его.
							if (item.FREIGHT_SELECTED == 1){
								l_option.prop("selected", true);
							}
							p_select.append(l_option);
					}); 					
					},
					error: function (m1,m2) {window.alert(m1+m2);}
				});
	}
	
    /* Создание модального окна для обработки вагонов */
	var m_win_div = $('<div/>')
		.attr('id','modalDialog')
		.attr('title','Обработка вагонов')
        .appendTo('body');
	
	// Дата/время начала обработки
	m_win_div.begin_processing_date = $('<input>',{type:'text','requir':'Y',class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
	var l_div_begin_processing_date = $('<div>')
        .addClass('processing-wagons-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата/время начала обработки',class:'processing-wagons-window-attr-item-text processing-wagons-window-attr-item-text-left'}))
		.append(m_win_div.begin_processing_date);
		
	// Дата/время окончания обработки
	m_win_div.end_processing_date = $('<input>',{type:'text','requir':'Y',class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
	var l_div_end_processing_date = $('<div>')
        .addClass('processing-wagons-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата/время окончания обработки',class:'processing-wagons-window-attr-item-text processing-wagons-window-attr-item-text-left'}))
        .append(m_win_div.end_processing_date); 
		
	//Добавить вагон
	m_win_div.processing_add_wagon = $('<input>',{type:'text',css:{'font-size':'11px'}, class:'text ui-widget-content ui-corner-all'}).attr('size', '11').attr('maxlength', '11');
	m_win_div.processing_add_wagon_btn = $('<input>',{type:'button',css:{'font-size':'11px','height':'17px'}, class:'btnAdd'}).val('Добавить');
	m_win_div.processing_add_wagon_btn.on('click',function(){
        add_wagon_in_processing_table();
    });
	//Таблица с данными
	m_win_div.TableProcessingWagons = $('<table>')
		.addClass('processing_wagons_table')
		.attr('id','processing_wagons_table')
		.append($('<tbody>')); 
		
	var DivModalDialogContainer = $('<div>')
		.addClass('modalDialogContainer')
		.css({'display': 'inline-block'})
		.append(m_win_div.TableProcessingWagons);
	// Добавляем объекты на форму
	m_win_div.append(l_div_begin_processing_date)
			 .append(l_div_end_processing_date);
	
	
    m_win_div.append(
            '<table class="processing_wagons_table">'+
                '<tbody>'+
                    '<tr>'+
                        '<th></th>'+
                        '<th>№</th>'+
                        '<th>Вагон/<br>платформа</th>'+
                        '<th>Контейнер</th>'+
                        '<th>Груз</th>'+
                        '<th>Номер позиции</th>'+
						'<th>Номер задания</th>'+
						'<th>Дата<br>нач.обр.</th>'+
						'<th>Дата<br>оконч.обр.</th>'+
                    '</tr>'+
                '</tbody>'+
            '</table>'
        );
	
	m_win_div.append(
		$('<div>',{css:{'margin-left':'61px'}})
		.append(m_win_div.processing_add_wagon)
		.append(m_win_div.processing_add_wagon_btn)
		
	);
	
    m_win_div.append(DivModalDialogContainer);
	
    add_rows_in_processing_table(m_win_div.TableProcessingWagons);
	/* Получение номера позиции для определённого груза */
    /*function get_position_for_freight(freight, numPos){
        switch((String(freight).trim())) {
            case 'Метанол':
                return 'ГП5201';
            case 'Формалин':
                return 'ГП5202';
            case 'КФС':
                return 'ГП5203';
            case 'Ацетальдегид':
            case 'Ацет-д':
                return 'ГП5206';
            case 'КФК':
                return 'ГП5207';
            default:
                numPos.exsist = false;
                return '';
        }
    }*/
    /* Добавление выделенных вагонов в таблицу обработки */
    function add_rows_in_processing_table(p_table){
        var l_cars = get_selected_objects();
        var l_obj_car = {};
		var index = 1;
		l_cars.forEach(function(p_car){
			//console.log('='+p_car.obj_number);
			l_obj_car.car_number = p_car.obj_number;
			add_wagon_in_processing_table(l_obj_car);
		});
        /*l_cars.forEach(function(p_car){
            var conts = p_car.cont.split(' ');
            //Условие деления вагона на контейнеры:
            if (conts.length <= 1) {
				l_obj_car.count = index++;
				l_obj_car.car_number = p_car.obj_number;
				l_obj_car.cont_num = conts;
				l_obj_car.freight_name = p_car.freight;
                
				//p_table.append(get_tr_for_processing_table(index++,p_car.obj_number,p_car.freight,conts));
				p_table.append(get_tr_for_processing_table(l_obj_car));
            }
            else {
                for(var i=0; i<conts.length-1; i++) {
					
					l_obj_car.count = index++;
					l_obj_car.car_number = p_car.obj_number;
					l_obj_car.cont_num = conts[i];
					l_obj_car.freight_name = p_car.freight;
					
                    //p_table.append(get_tr_for_processing_table(index++,p_car.obj_number,p_car.freight,conts[i]));
					p_table.append(get_tr_for_processing_table(l_obj_car));
                }
            }
        });*/
    }
    /* Формирование конкретной позиции в таблице обработки */
    function get_tr_for_processing_table(/*p_number,p_obj_number,p_freight,p_cont*/p_obj_car){
		//console.log(p_obj_car.cont_num +' '+ p_obj_car.freight_name);
        var tr = $('<tr>');
        var div = $('<div>',{'class':'deleteImage deleteImage13px'});
        div.on('click',function(){
            tr.nextAll().children('td:nth-child(1)').each(function(){
                $(this).text(parseInt($(this).text())-1);
            });
            tr.remove();
        });
		// Select cо списком позиций
        var select_freight = jQuery('<select>');
			fill_for_freigth(select_freight,p_obj_car.freight_name);
		
		if (p_obj_car.inventory_item_id!==null){
			select_freight.val(p_obj_car.inventory_item_id);
		}
        //var numPos = { exsist: true }; //Использование в качестве ref param.
        //numPosValue = get_position_for_freight(p_obj_car.freight_name, numPos);
		
		// Checkbox - обработка записей в таблице
		var ProcessingRailway = $('<input>');
			$(ProcessingRailway).attr('type','checkbox')
								.attr('name','ProcessingRailway')
								.attr('value', p_obj_car.count);
		
		$(tr).attr('disl_lines_id',(p_obj_car.disl_lines_id===null?'0':p_obj_car.disl_lines_id))
		
		// Если по строке интерфейс отработал без ошибок, то чекбокс неактивный
		if (p_obj_car.interface_status !== 'Y'){
			tr.append($('<td>').append($(ProcessingRailway).attr('checked', 'checked')));
		} else {
			tr.append($('<td>').append($(ProcessingRailway).attr('disabled','true')));
		}
        tr.append($('<td>').text((p_obj_car.count===null?'':p_obj_car.count)));//,{'text':p_obj_car.count}));
        tr.append($('<td>').text((p_obj_car.car_number===null?'':p_obj_car.car_number)));//,{'text':p_obj_car.car_number}));
        tr.append($('<td>').text((p_obj_car.cont_num===null?'':p_obj_car.cont_num)));//,{'text':p_obj_car.cont_num}));
        tr.append($('<td>').text((p_obj_car.freight_name===null?'':p_obj_car.freight_name)));//,{'text':p_obj_car.freight_name}));
		
		tr.append($('<td>').append(select_freight));
		tr.append($('<td>').text((p_obj_car.batch_num===null?'':p_obj_car.batch_num)));
		tr.append($('<td>').text((p_obj_car.trx_date_begin_text===null?'':p_obj_car.trx_date_begin_text)));
		tr.append($('<td>').text((p_obj_car.trx_date_end_text===null?'':p_obj_car.trx_date_end_text)));
		//tr.append($('<td>').text((p_obj_car.interface_status===null?'':p_obj_car.interface_status)));
		
		
        
	   //Условие формирование списка с позициями при отсутсвии позиции по умолчанию:
		/*if (numPos.exsist) {
            tr.append($('<td>',{'text':numPosValue}));
        }
        else {
            tr.append($('<td>').append($('<select>')
            .append($('<option>').attr('label', 'Выбор').attr('value', ''))
            .append($('<option>').attr('label', 'ГП5204').attr('value', 'ГП5204'))
            .append($('<option>').attr('label', 'ГП5205').attr('value', 'ГП5205'))
            .append($('<option>').attr('label', 'ГП5208').attr('value', 'ГП5208'))));
        }
		*/
        //Кнопка удаления строки отсутствует, т.к. есть checkbox:
        //tr.append($('<td>').append(div));

        return tr;
    }
	
    init_date_time_input(m_win_div.begin_processing_date);
    init_date_time_input(m_win_div.end_processing_date);
	
    /* Добавление введённого вагона в таблицу обработки */
    function add_wagon_in_processing_table(p_type_obj){
		var l_obj_car = {};
        //var proc_tbl = $('table#processing_wagons_table');
		var proc_tbl = $(m_win_div.TableProcessingWagons);
        var wagon_number_input = m_win_div.processing_add_wagon;
        var obj_number; 
		
		if (check_undefined(p_type_obj)===1){
			obj_number = p_type_obj.car_number;
		} else {
			obj_number = wagon_number_input.val();
		}
		var l_check_car = check_carnumber_in_db (obj_number);
		//console.log('l_check_car='+l_check_car);
		if (l_check_car ==='0'){
			wagon_number_input.addClass('red_bckg_color');
			alert('Вагон/Контейнер ' + obj_number + ' не существует в системе!');
		}
		var count = proc_tbl.find('tr').length;
		/*
        if (obj_number.length<8) {
            wagon_number_input.addClass('red_bckg_color');
            alert('Неверный номер вагона: ' + obj_number);
        } else */
		if (proc_tbl.find('tr td:contains("'+obj_number+'")').length!==0) {
            wagon_number_input.addClass('red_bckg_color');
            alert('Вагон ' + obj_number + ' уже добавлен!');
        }
		else{
			
            $.ajax({
                url: 'data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data: { car_number: obj_number
                       ,ajax_action: 'add_car_for_process_of_wagons'
                      },
                success: function (data) {
					//console.log(data);
                    var records = JSON.parse(data);
					$.each(records, function( i, item ) {
						
						l_obj_car.count = ++count;
						l_obj_car.car_number = item.CAR_NUMBER;
						l_obj_car.cont_num = item.CONT_NUMBER;
						l_obj_car.freight_name = item.FREIGHT_NAME;
						l_obj_car.disl_lines_id = item.DISL_LINES_ID;
						l_obj_car.batch_num = item.BATCH_NUM;
						l_obj_car.inventory_item_id = item.INVENTORY_ITEM_ID;
						l_obj_car.interface_status = item.INTERFACE_STATUS;
						l_obj_car.trx_date_begin_text = item.TRX_DATE_BEGIN_TEXT;
						l_obj_car.trx_date_end_text = item.TRX_DATE_END_TEXT;
						
						proc_tbl.append(get_tr_for_processing_table(l_obj_car));
					});
	
                    /*for(var i=0; i<records.length; i++) {
                        var child = records[i];
                        
                        var freight = (child.FREIGHT_NAME !== null) ? child.FREIGHT_NAME : '';
                        var cont = null;
                        cont = (child.CONT !== null) ? child.CONT : '';
                        var conts = cont.split(' ');

                        if (conts.length <= 1) {
							l_obj_car.count = ++count;
							l_obj_car.car_number = obj_number;
							l_obj_car.cont_num = conts;
							l_obj_car.freight_name = freight;
							l_obj_car.disl_lines_id = 0;
							
                            //proc_tbl.append(get_tr_for_processing_table(++count,obj_number,freight,contsl_obj_car));
							proc_tbl.append(get_tr_for_processing_table(l_obj_car));
                        }
                        else {
                            for (var i = 0; i < conts.length - 1; i++) {
								l_obj_car.count = ++count;
								l_obj_car.car_number = obj_number;
								l_obj_car.cont_num = conts[i];
								l_obj_car.freight_name = freight;
								l_obj_car.disl_lines_id = 0;
                                //proc_tbl.append(get_tr_for_processing_table(++count,obj_number,freight,contsl_obj_car));
							proc_tbl.append(get_tr_for_processing_table(l_obj_car));
                            }
                        }
                    }*/

                    md_disable_notification_btn();
                    wagon_number_input.removeClass('red_bckg_color');
                    wagon_number_input.val('');
                },
                error: function (m1,m2) {window.alert(m1+m2);}
            });
        } 
    }
	// Кол-во выбранных чекбоксов
	function CheckCountCheckbox(){
		return $(m_win_div.TableProcessingWagons).find('input[name="ProcessingRailway"]:checked').length;
	};
	
    /* Формирование объекта, который будет сериализован (JSON) */
    function create_object_of_processing(){
        var obj = {};
		
        obj.header_id = 0;
        obj.trx_date_begin = m_win_div.begin_processing_date.val();
        obj.trx_date_end = m_win_div.end_processing_date.val();
        obj.opm_trx_lines = [];

        $('table#processing_wagons_table > tbody > tr').each(function(){
            var wagons = {
                line_id: $(this).attr('disl_lines_id'), // если строка новая, то значение = 0, иначе подгружается из базы
				numpos: $(this).children('td:nth-child(2)').text(),
                car_number: $(this).children('td:nth-child(3)').text(),
                cont_number: $(this).children('td:nth-child(4)').text(),
                freight_name: $(this).children('td:nth-child(5)').text().trim(),
                item_id: $(this).find('td:nth-child(6) select').val()
            };
            //Проверка состояния checkbox для определения состояния строки (on/off):
            //Не реализовано: не считывает данные с формы
            //var attr_value = $(this).children('td:nth-child(1)').attr('value');
			var attr_value = $(this).find('td:nth-child(1) input').prop('checked');
            if (attr_value === true) {
                obj.opm_trx_lines.push(wagons);
            }
        });

        return obj;
    }
    /* Сохранение данных */
    function md_enter_processing_ajax(data_obj){
        var res;
		//console.log(data_obj);
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { params: JSON.stringify(data_obj)
                   ,ajax_action: 'run_process_of_wagons' },
            success: function (data) {
				//console.log(data);
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
	function ValidatingRequiredValues (ObjArray){
		var ItemCount = 0;
		var ItemMeassge = "";
		// Позиция для груза должна быть выбрана
		for(var i=0; i < ObjArray.opm_trx_lines.length; i++){
			if (ObjArray.opm_trx_lines[i].item_id === '0' || ObjArray.opm_trx_lines[i].item_id === 0){
				ItemMeassge = ItemMeassge+ObjArray.opm_trx_lines[i].numpos+',';
				ItemCount++;
			}
		}
		if (ItemCount!==0){
			create_info_modal_dialog_new('Оповещение','Не выбрана позиция для строки:'+ItemMeassge.slice(0, -1));
			return false;
		}
		if (CheckCountCheckbox() === 0){
			create_info_modal_dialog_new('Оповещение','Не выбраны строки для обработки!');
			return false;
		}
		if (m_win_div.begin_processing_date.attr('requir') == 'Y' && m_win_div.begin_processing_date.val() ==''){
			create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата/время начала обработки"');
			return false;
		}
		if (m_win_div.begin_processing_date.attr('requir') == 'Y' && m_win_div.end_processing_date.val() ==''){
			create_info_modal_dialog_new('Оповещение','Не заполнено поле "Дата/время окончание обработки"');
			return false;
		}
		return true;
	}
		
    /* Формирование кнопок на форме */
    m_win_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            /*'Обработки': { text: "Обработки",
                    id: "btn_get_processing",
                    click: function(){
						
                    }
            },*/
            /*'Запустить интерфейс': { text: "Запустить интерфейс",
                    id: "btn_run_interface",
                    click: function(){
                        //
                    }
            },*/
            'Запустить интерфейс':{
				text: "Запустить интерфейс",
                id: "btn_save_processing",
                click: function(){			
                    //$('#btn_save_processing').prop( "disabled", true );
					//console.log(create_object_of_processing());
					var f_obj = create_object_of_processing();
					// Проверка полей
					if (!ValidatingRequiredValues(f_obj)){
						return;
					}
					start_loading_animation();
					//console.log(f_obj);
					//return;
                    var res = md_enter_processing_ajax(f_obj);
					var f_res_mas = res.split('$'); // add  20.06.2022 
						stop_loading_animation();
                    if (f_res_mas[0] === 'done') { // upd 20.06.2022 add f_res_mas[0]
                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!'+f_res_mas[1]);
						$(this).dialog( "close" );
                    } else {
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!'+f_res_mas[1]); // upd 20.06.2022 add res[1]
						
                    }        
                }   
            }, 
            'Закрыть': function(){
                if (CheckCountCheckbox() !== 0){
					create_info_modal_dialog_btn('Оповещение','Вы действительно хотите закрыть без сохранения?',$(this));
				} else{
					$(this).remove();
				}
				
            }
            
        }
    });
	
    stop_loading_animation();
}
/*ФОРМА: Ручное принятие вагонов*/
function create_md_manual_upd_wagon(){
	start_loading_animation();
	$('#modalDialog').remove();
    $('.context-menu').remove();
	
	/* Создание модального окна для обработки вагонов */
	var m_win_div = $('<div/>')
		.attr('id','modalDialog')
		.attr('title','Ручное принятие вагонов')
        .appendTo('body');
	
	//Таблица с данными
	m_win_div.TableManualUpdateWagon = $('<table>')
		.addClass('ManualUpdateWagon')
		.attr('id','ManualUpdateWagonTable')
		.append($('<tbody>')); 
		
	var DivModalDialogContainer = $('<div>')
		.addClass('modalDialogContainer')
		.css({'display': 'inline-block'})
		.append(m_win_div.TableManualUpdateWagon);
	m_win_div.append(
            '<table class="ManualUpdateWagon">'+
                '<tbody>'+
                    '<tr>'+
                        '<th></th>'+
                        '<th>№</th>'+
                        '<th>Вагон/<br>платформа</th>'+
                        '<th>Номер накладной</th>'+
                        '<th>Статус обработки</th>'+
                    '</tr>'+
                '</tbody>'+
            '</table>'
    );
	//Добавить вагон
	m_win_div.manual_upd_add_wagon = $('<input>',{type:'text',css:{'font-size':'11px'}, class:'text ui-widget-content ui-corner-all'}).attr('size', '8').attr('maxlength', '8');
	m_win_div.manual_upd_add_wagon_btn = $('<input>',{type:'button',css:{'font-size':'11px','height':'17px'}, class:'btnAdd'}).val('Добавить');
	m_win_div.manual_upd_add_wagon_btn.on('click',function(){
        add_wagon_in_table();
    });
	
	
	/* Добавление введённого вагона в таблицу обработки */
    function add_wagon_in_table(p_type_obj){
		var l_obj_car = {};
		var proc_tbl = $(m_win_div.TableManualUpdateWagon);
        var wagon_number_input = m_win_div.manual_upd_add_wagon;
        var obj_number; 
		
		if (check_undefined(p_type_obj)===1){
			obj_number = p_type_obj.car_number;
		} else {
			obj_number = wagon_number_input.val();
		}
		
		var count = proc_tbl.find('tr').length;
		
        if (obj_number.length<8) {
            wagon_number_input.addClass('red_bckg_color');
            alert('Неверный номер вагона: ' + obj_number);
        } else if (proc_tbl.find('tr td:contains("'+obj_number+'")').length!==0) {
            wagon_number_input.addClass('red_bckg_color');
            alert('Вагон ' + obj_number + ' уже добавлен!');
        } else{
			
		}
	}
	
	
	m_win_div.append(
		$('<div>',{css:{'margin-left':'61px'}})
		.append(m_win_div.manual_upd_add_wagon)
		.append(m_win_div.manual_upd_add_wagon_btn)
		
		
	).append(DivModalDialogContainer);
	
	m_win_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Сохранить':{
				text: "Сохранить",
                id: "btn_save_processing",
                click: function(){			
                    $(this).remove();       
                }   
            }, 
            'Закрыть': function(){
				$(this).remove();
            }
            
        }
    });
	
	stop_loading_animation();
}

/* Получение списка обработок */
function get_processings_of_wagons(){

    start_loading_animation();
    
    $('#modalDialog').remove();
    $('.context-menu').remove();
	
    // Создание модального окна для обработки вагонов */
	var m_win_div = $('<div/>')
		.attr('id','modalDialog')
		.attr('title','Обработка вагонов [историческая таблица]')
        .appendTo('body');
	
	// Дата/время начала интервала
	m_win_div.begin_processing_date = $('<input>',{type:'text','requir':'Y',class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
	var l_div_begin_processing_date = $('<div>')
        .addClass('processing-wagons-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата/время начала интервала',class:'processing-wagons-window-attr-item-text processing-wagons-window-attr-item-text-left'}))
		.append(m_win_div.begin_processing_date);
		
	// Дата/время окончания интервала
	m_win_div.end_processing_date = $('<input>',{type:'text','requir':'Y',class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
	var l_div_end_processing_date = $('<div>')
        .addClass('processing-wagons-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата/время окончания интервала',class:'processing-wagons-window-attr-item-text processing-wagons-window-attr-item-text-left'}))
        .append(m_win_div.end_processing_date);

    //Список позиций
	m_win_div.position = $('<select>');
    fill_for_freight(m_win_div.position, '');
    var position = $('<div>')
        .addClass('processing-wagons-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Позиция',class:'processing-wagons-window-attr-item-text processing-wagons-window-attr-item-text-left'}))
        .append(m_win_div.position);
		
	//Таблица с данными
	m_win_div.TableProcessingWagons = $('<table>')
		.addClass('processings_wagons_table')
		.attr('id','processings_wagons_table')
		.append($('<tbody>')); 
		
	var DivModalDialogContainer = $('<div>')
		.addClass('modalDialogContainer')
		.css({'display': 'inline-block'})
		.append(m_win_div.TableProcessingWagons);

	// Добавляем объекты на форму
	m_win_div.append(l_div_begin_processing_date)
			 .append(l_div_end_processing_date)
             .append(position);

    m_win_div.append(
            '<table class="processings_wagons_table">'+
                '<tbody>'+
                    '<tr>'+
                        '<th>№</th>'+
                        '<th>Позиция</th>'+
                        '<th>Вагон</th>'+
                        '<th>Контейнер</th>'+
                        '<th>Дата/время начала обр.</th>'+
                        '<th>Дата/время конца обр.</th>'+
						'<th>Кол-во выработка</th>'+
						'<th>Кол-во списание</th>'+
                    '</tr>'+
                '</tbody>'+
            '</table>'
        );
	
    m_win_div.append(DivModalDialogContainer);
	
    init_date_time_input(m_win_div.begin_processing_date);
    init_date_time_input(m_win_div.end_processing_date);
	
    // Формирование кнопок на форме
    m_win_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Загрузить': function(){
                get_processing_list();
            },
            'Закрыть': function(){
                $(this).remove();
            }
        }
    });

    /* Получаем данные для таблицы */
    function get_processing_list() {
        var processing_tbl = $(m_win_div.TableProcessingWagons);
        processing_tbl.find('tr').remove();

        var item_id = m_win_div.position.val();
        var date_begin = m_win_div.begin_processing_date.val();
        var date_end = m_win_div.end_processing_date.val();

        if (date_begin.length === 0 || date_end.length === 0) {
            alert('Введите даты!');
            return; }
        var obj_car = {};
        var count = 0;
        var data_obj = {};

        data_obj.inventory_item_id = item_id;
        data_obj.trx_date_begin = date_begin;
        data_obj.trx_date_end = date_end;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: {  params: JSON.stringify(data_obj)
                    ,ajax_action: 'get_process_of_wagons_history'
                  },
            success: function (data) {
                var records = JSON.parse(data);
                $.each(records, function( i, item ) {
                    
                    obj_car.count = ++count;
                    obj_car.product = item.PRODUCT;
                    obj_car.lot_number = item.LOT_NUMBER;
                    obj_car.begin_transaction_date = item.BEGIN_TRANSACTION_DATE;
                    obj_car.end_transaction_date = item.END_TRANSACTION_DATE;
                    obj_car.qty_production = item.QTY_PRODUCTION;
                    obj_car.qty_write_off = item.QTY_WRITE_OFF;
                    
                    processing_tbl.append(get_tr_processing(obj_car));
                });
            },
            error: function (m1,m2) {window.alert(m1+m2); }
        });
    }

    /* Формируем конкретную строчку для таблицы */
    function get_tr_processing(obj) {

        var tr = $('<tr>');

        tr.append($('<td>').text(obj.count===null?'':obj.count));
        tr.append($('<td>').text(obj.product===null?'':obj.product));

        var lot_number = obj.lot_number===null?'':obj.lot_number;
        var vag = '';
        var cont = '';
        //Проверяем, получили номер контейнера или номер вагона
        var reg = new RegExp("[a-zA-Z]+");
        if(reg.test(lot_number)) {
            cont = lot_number;
        } else { vag = lot_number }

        tr.append($('<td>').text(vag));
        tr.append($('<td>').text(cont));
        tr.append($('<td>').text(obj.begin_transaction_date===null?'':obj.begin_transaction_date));
        tr.append($('<td>').text(obj.end_transaction_date===null?'':obj.end_transaction_date));
        var qty_production = obj.qty_production===null?'':obj.qty_production;
        tr.append($('<td>').text(qty_production));
        var qty_write_off = obj.qty_write_off===null?'':Math.abs(obj.qty_write_off);
        tr.append($('<td>').text(qty_write_off));

        if(qty_production != qty_write_off) {
            tr.attr('style','background-color: #F08080'); }

        return tr;
    }
	
    /* Получаем список позиций */
    function fill_for_freight(p_select, p_freight_name){
		
        var l_params = {};
            l_params.freight_name = p_freight_name;
            
        p_select.empty();
        p_select.append($('<option value="0"></option>'));
            $.ajax({
                 url: 'data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data:   { params: JSON.stringify(l_params),
                          ajax_action: 'get_disl_freight_oebs'},
                    success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.ITEM_NAME).val(item.INVENTORY_ITEM_ID);
                            // Если груз удалось сопоставить, то выбираем его.
                            if (item.FREIGHT_SELECTED == 1){
                                l_option.prop("selected", true);
                            }
                            p_select.append(l_option);
                    }); 					
                    },
                    error: function (m1,m2) {window.alert(m1+m2);}
                });
    }
    stop_loading_animation();
}

/*
	add 22.09.2023 BekmansurovRR
	Ввод контйнеров
*/
function entry_foreign_container(){
    function return_container_elem(){
        var l_obj = {};
		l_obj.array_info = clEntryContainer.get_data_to_save();
		
		//console.log(l_obj);
        return l_obj;
    }
    function get_select_freight_list(){
        var result = '<select id="modalDialogFreightName">';

        $.each(g_freight_list, function( i, item ) {
            result += '<option value="'+item.FREIGHT_NAME+'">'+item.FREIGHT_NAME+'</option>';
        });
        result += '</select>';
        return result; 
    }
	function get_select_org_list(){        
        var result = '<select id="modalDialogOwner">';

        $.each(g_org_name_list, function( i, item ) {
            result += '<option value="'+item.NAME+'">'+item.NAME+'</option>';
        });
        result += '</select>';
        return result; 
    }
    function get_select_car_type_list(){        
        var result = '<select id="modalDialogCarType">';
        
        $.each(g_car_type_list, function( i, item ) {
            result += '<option value="'+item.CAR_TYPE+'">'+item.CAR_TYPE+'</option>';
        });

        result += '</select>'; 

        return result; 
    }
    function get_select_car_status_list(){        
        var result = '<select id="modalDialogStatus">';
        
        $.each(g_inspection_results, function( i, item ) {
            result += '<option value="'+item.CODE+'">'+item.CODE+'</option>';
        });

        result += '</select>'; 

        return result; 
    }
	function get_select_with_station_child(p_id,p_station_id){
        var result = '<select id="'+p_id+'" class="required">';
        result+='<option value=""></option>';
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {station_id: p_station_id 
                    ,ajax_action: 'get_all_station_child'
                    },
            success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        result += '<option '+((item.DISABLED=='Y')?'disabled':'')+' style="'+('margin-left: '+(item.LVL-1)*10 + 'px')+'" data-id="'+item.ID
                                 +'" data-type="'+item.TYPE+'" value="'+item.ID+'" '+'" data-cars_count="'+item.COUNT_RAILCARS+'" data-free_length="'+item.FREE_LENGTH+'">'+item.NAME+'</option>';
                    }); 
                }
        });
        result += '</select>';
        return result;
    }

    function entry_foreign_container_ajax(p_container) {
        var res;
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { container: p_container
                   ,date_fact: $('#modalDialogDateFact').val()
                   ,ajax_action: 'entry_foreign_container'
            },
            success: function (data) {
                res = data;
            },
            error: function (data) {
                res = 'fail';
            }
        });
        return res;
    }
	
	function fill_select_with_places(p_select,p_station_id,p_area_type){
        p_select.empty();
        
        p_select.append($('<option>'));
        
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {station_id: p_station_id 
                    ,area_type: p_area_type
                    ,ajax_action: 'get_places_for_cont'
                    },
            success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').attr('data-id',item.ID).attr('data-type',item.TYPE).text(item.NAME).val(item.ID);
                        p_select.append(l_option);
                    }); 
                }
        });
    }
	function disable_save_btn(){
        if (m_win_div.new_place.val()==''){
            $('#md_ok_btn').prop( "disabled", true );
        }else{
            $('#md_ok_btn').prop( "disabled", false );
        }
    }
	start_loading_animation();
    $('.context-menu').remove();
    
	function entryContainer (){
		var tr_mas = [];
		
		var return_table = $('<table>',{class:'entryRailcarContTable'});
		return_table.thead = $('<thead>');
			return_table.tr = $('<tr>');
				return_table.tr.append ('<th></th>');
				return_table.tr.append ('<th>№ <br>контейнера</th>');
				return_table.tr.append ('<th>Место назнач.</th>');
				return_table.tr.append ('<th>Статус</th>');
				return_table.tr.append ('<th>Наим. груза</th>');
				return_table.tr.append ('<th>Вес <br>груза</th>');
				return_table.tr.append ('<th>Тара</th>');
				return_table.tr.append ('<th>Вес <br>брутто</th>');
				return_table.tr.append ('<th>№ <br>накладной</th>');
				return_table.tr.append ('<th>Предприятие</th>');
		return_table.thead.append(return_table.tr);
		return_table.append (return_table.thead);
		
		this.add_in_table = function(){
			
			var tr = $('<tr/>');
			var v_place;
				if (m_win_div.new_place_type.val() === 'area') {
					v_place = m_win_div.new_place.text();
				}
				else {
					v_place = m_win_div.new_place.val();
				}
				
			tr.checkbox = $('<input>',{'type':'checkbox','checked':'checked'});
			
			tr.newPlaceType = m_win_div.new_place_type.val();
			tr.newPlaceStation = m_win_div.new_place_station.val();
			tr.newPlace = m_win_div.new_place.val();
			tr.place = v_place;
			
			tr.contNumber = $('#modalDialogCont').val();
			tr.status = $('#modalDialogStatus').val();
			tr.freightName = $('#modalDialogFreightName').val();
			
			tr.weightNet = $('#modalDialogWeightNet').val();
			tr.weightDep = $('#modalDialogWeightDep').val();
			tr.weightGross = $('#modalDialogWeightGross').val();
			tr.invNumber = $('#modalDialogInvNumber').val();
			tr.owner = $('#modalDialogOwner').val();
			
			tr.append($('<td>').append(tr.checkbox));
			tr.append($('<td>').text(tr.contNumber));
			tr.append($('<td>').text(tr.place));
			tr.append($('<td>').text(tr.status));
			tr.append($('<td>').text(tr.freightName));
			tr.append($('<td>').text(tr.weightNet));
			tr.append($('<td>').text(tr.weightDep));
			tr.append($('<td>').text(tr.weightGross));
			tr.append($('<td>').text(tr.invNumber));
			tr.append($('<td>').text(tr.owner));
			
			tr.appendTo(return_table.thead);
			
            tr_mas.push(tr);
			
		}
		
		this.get_table = function(){
			return return_table;
		}
		
		this.get_data_to_save = function(){
			var l_contSave = [];
			
			tr_mas.forEach(function(item){
				if (item.checkbox.prop('checked')){
					var l_obj_item = {};
					l_obj_item.newPlaceType = item.newPlaceType;
					
					l_obj_item.newPlaceStation = item.newPlaceStation;
					l_obj_item.newPlace = item.newPlace;
					l_obj_item.place = item.place;
			
					l_obj_item.contNumber = item.contNumber;
					l_obj_item.status = item.status;
					l_obj_item.freightName = item.freightName;
			
					l_obj_item.weightNet = item.weightNet;
					l_obj_item.weightDep = item.weightDep;
					l_obj_item.weightGross = item.weightGross;
					l_obj_item.invNumber = item.invNumber;
					l_obj_item.owner = item.owner;
					l_contSave.push (l_obj_item);
				}
			});
			return l_contSave;
		}
		
		this.delete_from_table = function (){
			return_table.find('input[type="checkbox"]').each(function(){
				//Удаляем все не отмеченные записи
				if (!$(this).is(':checked')){
					var row = $(this).closest('tr').remove();
				}
				
			});
		}
		this.check_container = function (){
			var p_cont_number = $('#modalDialogCont').val();
			if(return_table.find('tr td:contains("'+p_cont_number+'")').length!==0) {
				
				alert('Контейнер '+p_cont_number+' уже добавлен!');
				return 0;
			}
			
			return 1;
		}
		this.get_array = function(){
			return tr_mas;
		}
	}
	
    var server_current_time = get_server_current_time();
    
    // создаем div для отображения модального окна
    var m_win_div = $('<div/>')
		.attr('id','modalDialog')
		.attr('title','Ввод контейнеров')
		.appendTo('body'); // Присоединяем наше меню к body документа: 
 
	m_win_div.div_date_oper = $('<div/>')
		.append('<div>' +
					'<label for="modalDialogDateFact">Дата и время операции</label>'+
					'<input id="modalDialogDateFact" type="text" size="14" class="text ui-widget-content ui-corner-all">' +
				'</div>'
		);
	
	m_win_div.new_place_type = $('<select>');
    m_win_div.new_place_station = $('<select>');
    m_win_div.new_place = $('<select>',{class:'required'});
	
	m_win_div.new_place_station.append($('<option>').val('2').text('Водораздельная'));
    m_win_div.new_place_station.append($('<option>').val('3').text('Новая'));
    
    m_win_div.new_place_station.val($('#currentCarstree li[data-type="station"]').attr('data-id'));
    
    m_win_div.new_place_type.append($('<option>').val('area').text('Площадка'));
    m_win_div.new_place_type.append($('<option>').val('railcar').text('Вагон'));
	
	m_win_div.div_new_place = $('<div/>')
		.append (
			$('<div>',{css:{'display':'table'}}).append(
					$('<div>',{class:'border',css:{'clear':'both'}})
						.append($('<div>',{class:'header',css:{'width':'180px'}}).text('Место назначения'))
						.append(
							$('<div>',{css:{'display':'inline-table'}}).append(
								$('<div>',{class:'attr',css:{'border':'none','width':'470px','text-align':'left'}}).append(
									$('<div>')
									.append($('<div>',{css:{'text-align':'left'}}).append(m_win_div.new_place_type))
									.append($('<div>',{css:{'text-align':'left','margin-top':'5px'}}).append(m_win_div.new_place_station))
									.append($('<div>',{css:{'text-align':'left','margin-top':'5px'}}).append(m_win_div.new_place))
								)
							)
					)
				)
		);
	
	m_win_div.new_place_type.on('change', function (e) {
        fill_select_with_places(m_win_div.new_place,m_win_div.new_place_station.val(),m_win_div.new_place_type.val());
        if (m_win_div.new_place_type.val()=='area'){
            m_win_div.new_place_station.parent().show();
        }else{
            m_win_div.new_place_station.parent().hide();
        }
    });
    m_win_div.new_place_station.on('change', function (e) {
		fill_select_with_places(m_win_div.new_place,m_win_div.new_place_station.val(),m_win_div.new_place_type.val());    
    });
	fill_select_with_places(m_win_div.new_place,m_win_div.new_place_station.val(),m_win_div.new_place_type.val());
	
	//  Кнопка "Добавить"
	m_win_div.btn_add = $('<input>')
						.css({'vertical-align':'bottom'})
						.attr({'type':'button'})
						.addClass('btnAdd')
						.val('Добавить');
	m_win_div.btn_add.on('click', function(){
		
		if ($('#modalDialogCont').val() === ''){
			create_info_modal_dialog_new('Ошибка','Не заполнено поле "№ контейнера"!');
			return;
		}
		if ($('#modalDialogOwner').val() === ''){
			create_info_modal_dialog_new('Ошибка','Не заполнено поле "Предприятие"!');
			return;
		}
		if (m_win_div.new_place.val() === ''){
			create_info_modal_dialog_new('Ошибка','Не заполнено поле "Место назначение"!');
			return;
		}
		if (clEntryContainer.check_container() === 1 ){
			clEntryContainer.add_in_table();
		}
			
	});
	
	var clEntryContainer = new entryContainer();
		
	//  Кнопка "Удалить"
	m_win_div.btn_delete = $('<input>')
						.css({'vertical-align':'bottom'})
						.addClass('btnAdd')
						.attr({'type':'button'})
						.val('Удалить');
	m_win_div.btn_delete.on('click', function(){
		clEntryContainer.delete_from_table();
	})
	
	m_win_div
		.append(m_win_div.div_date_oper)
        .append(
			'<div style="clear: both;"></div>'+    
				'<div class="attr">'+
					'<div>'+
						'<label for="modalDialogCont">№ контейнера</label>'+
						'<input id="modalDialogCont" type="text" maxlength="30" size="30" class="required text ui-widget-content ui-corner-all">'+
					'</div>'+
					'<div>'+
						'<label for="modalDialogStatus">Статус</label>'+
						get_select_car_status_list()+
					'</div>'+

					'<div>'+
						'<label for="modalDialogFreightName">Наименование груза</label>'+
						get_select_freight_list()+ 
					'</div>'+

					'<div>'+
						'<label for="modalDialogWeightNet">Вес груза, кг</label>'+
						'<input id="modalDialogWeightNet" type="text" maxlength="5" size="5" class="text ui-widget-content ui-corner-all">' +
					'</div>'+

					'<div>'+
						'<label for="modalDialogWeightDep">Тара, кг</label>'+
						'<input id="modalDialogWeightDep" type="text" maxlength="5" size="5" class="text ui-widget-content ui-corner-all">'+
					'</div>'+

					'<div>'+
						'<label for="modalDialogWeightGross">Вес брутто, кг</label>'+
						'<input disabled id="modalDialogWeightGross" type="text" maxlength="5" size="5" class="text ui-widget-content ui-corner-all">'+
					'</div>'+

					'<div>'+
						'<label for="modalDialogInvNumber">№ накладной</label>'+
						'<input id="modalDialogInvNumber" type="text" maxlength="8" size="8" class="text ui-widget-content ui-corner-all">'+
					'</div>'+

					'<div>'+
						'<label for="modalDialogOwner">Предприятие</label>'+
						get_select_org_list()+
					'</div>'+
				'</div>'+
			
		'<div>'
		)
	   .append(m_win_div.div_new_place)
	   .append($('<div>')
				.append(m_win_div.btn_add)
				.append(m_win_div.btn_delete)
			  )
		.append(clEntryContainer.get_table());
		
    ;

    $('#modalDialogDateFact').val(server_current_time);
    
    init_date_time_input($('#modalDialogDateFact'));
    
	$('#modalDialogWeightNet,#modalDialogWeightDep').on('keypress',function (e){
        // Разрешаем: backspace, delete, влево, вправо
        if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
            return;
        }
        
        var chr = String.fromCharCode(e.charCode);
        
        if (chr == null) return;
        
        if (chr === '.') {
            return;
        }
        
        if (chr < '0' || chr > '9') {
            return false;
        }
    });
	
	$('#modalDialogWeightNet').on('keyup',function (e){
        if (!isNaN(+$(this).val()) && $(this).val()==='') {
            $('#modalDialogState option:nth-child(1)').prop('selected', true);
        } else if ((!isNaN(+$(this).val()) && +$(this).val() === 0)) {
            $('#modalDialogState option:nth-child(2)').prop('selected', true);
            return;
        } else if ((!isNaN(+$(this).val()) && +$(this).val()>0)) {
            $('#modalDialogState option:nth-child(3)').prop('selected', true);
        }
    });
	
	$('#modalDialogWeightNet,#modalDialogWeightDep').on('keyup',function (e){
        if (!isNaN(+$('#modalDialogWeightNet').val())&&!isNaN(+$('#modalDialogWeightDep').val())){
            $('#modalDialogWeightGross').val(parseFloat(+$('#modalDialogWeightNet').val()) + parseFloat(+$('#modalDialogWeightDep').val()));
        }
    });
	
    // вызываем модальное окно 
    m_win_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Сохранить': {
                text:'Сохранить',
                id:'md_entry_foreign_railcar_save_btn',
                click: function(){
                    var l_entry_json = JSON.stringify(return_container_elem()); //сохраняем выбранные элементы
					
                    var f_res = entry_foreign_container_ajax(l_entry_json);
					
                    var f_res_mas = f_res.split('$');
					//console.log(f_res_mas);
                    if (f_res_mas[0]==='done'){
						create_info_modal_dialog_new('Оповещение',f_res_mas[1]);
                    } else{
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!'+f_res_mas[1]);
                    }

                    m_win_div.dialog("close");
            }},
            'Закрыть': function(){
                m_win_div.dialog("close");
            }
        },
        close: function() {
            $(this).remove();
        }
    });
	stop_loading_animation();
}
