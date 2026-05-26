var l_request_this;/*для вызова из других частей программы*/

var r_route_add;
var r_route_processing;
var r_route_closing;
var l_this;

/*Убираем стандартное контекстное меню*/
document.oncontextmenu = function() {return false;}; 

$(document).ready(function() {   
    function test_auth(){
        $.ajax({
            url: '../../data.php',
            type: 'POST',
            dataType: "text",
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
            url: '/data.php',
            type: 'POST',
            dataType: "text",
            data: { ajax_action: 'get_msg_to_users'},
            success: function (data) {
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
	
    
    function get_user_name(p_user_id, p_user_list) {
		// Ищем пользователя в переданном списке
		var found_user = p_user_list.find(function(user) {
			return user.ID === p_user_id;
		});

		// Проверяем, найден ли пользователь
		if (found_user) {
			//console.log("Пользователь найден:", found_user.USER_NAME);
			return found_user.USER_NAME; // Возвращаем имя пользователя
		} else {
			//console.log("Пользователь с ID " + p_user_id + " не найден.");
			return null; // Возвращаем null, если пользователь не найден
		}
	}
	
	function run_xx_etw_disl_009(){
		var l_param = {
			date_from: l_this.date_from_filter.val(),
			date_to: l_this.date_to_filter.val(),
			product_name: l_this.tab1_product_filter.val(),
			status: l_this.tab1_status_select_filter.val(),
			type: l_this.tab1_type_select_filter.val(),
		};
		
        var win = window.open('../../xx_etw_disl_009/xx_etw_disl_009.php?'+
                              'freight='+l_param.product_name+'&'+
							  'date_from='+l_param.date_from+'&'+
							  'date_to='+l_param.date_to+'&'+
							  'status='+l_param.status+'&'+
							  'type='+l_param.type
                             ,'_blank');
    }
    
    setInterval(function() {
        test_auth();
        check_msg_to_users();
    }, 1000*5*60);
    check_msg_to_users();   
    
    $.ajax({
        url: '../../data.php',
        type: 'POST',
        dataType: "text",
        data: { ajax_action: 'getLoginData'
              },
        success: function (data) {
            var result = JSON.parse(data);
            user_station_id = result.stationId;
            user_station_name = result.stationName;
            user_name = result.userName;
            user_id = result.user_id;
            
            r_route_add = (result.route_add==='Y');
            r_route_processing = (result.route_processing==='Y');
            r_route_closing = (result.route_closing==='Y');
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
    
    this.get_flag_route_closed = function (p_route_id){
        var l_res;
        $.ajax({
            url: '../../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   { route_id:p_route_id
                     ,ajax_action: 'get_flag_route_closed'},
            success: function (res) {
                l_res = (res=='1'?true:false);
            }
        });
        return l_res;
    };    
	
    
    l_this = this;
    this.product_list = [];
    this.status_list = [];
    this.type_list = [];
	this.user_list = [];
	
	$.ajax({
            url: '../../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   { ajax_action: 'get_users'},
            success: function (data) {
                l_this.user_list = JSON.parse(data);
            }
    });
		
    $.ajax({
        url: '../../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_product_name_list'},
        success: function (data) {
            l_this.product_list = JSON.parse(data);
			// Добавляем пустую строку в начало массива
			//l_this.product_list.unshift("");
        }
    });
    
    $.ajax({
        url: '../../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_loadind_status_oebs_list'},
        success: function (data) {
            l_this.status_list = JSON.parse(data);
			// Добавляем пустую строку в начало массива
			l_this.status_list.unshift("");
        }
    });
	
	$.ajax({
        url: '../../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_loadind_type_oebs_list'},
        success: function (data) {
            l_this.type_list = JSON.parse(data);
			// Добавляем пустую строку в начало массива
			l_this.type_list.unshift("");
        }
    });
	
    
    var l_date = get_server_current_time();
    var l_date_from = add_day_to_date_trunc(l_date,-2);
    var l_date_to = add_day_to_date_trunc(l_date,1);
    /****************************************************************** Отчет ******************************************************************/
    this.tab1 = $('#tabs-1');
    
    this.tab1_section = $('<div>')
        .addClass('section')
        .css({'width':'auto','float':'none','height':'850px'})
		
        .appendTo(this.tab1);
    
    this.date_from_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'10em'}}).val(l_date_from);
    this.date_to_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'10em'}}).val(l_date_to);
	
    this.tab1_product_filter = $('<select>',{class:'text ui-widget-content ui-corner-all'});
    this.tab1_status_select_filter = $('<select>',{class:''});
    this.tab1_type_select_filter = $('<select>',{class:''});
    
    
    this.tab1_go_filter_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Поиск'))
        .on('click', function(){
            l_this.refresh_fuel_standart(false);
            //create_info_modal_dialog_new('Оповещение','Поиск завершен!');
        });
    this.tab1_go_report_excel_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Выгрузить в Excel'))
        .on('click', function(){
            run_xx_etw_disl_009();
        });   
    init_date_time_input(this.date_from_filter);
    init_date_time_input(this.date_to_filter);
    l_this.product_list.forEach(function(item){
		l_this.tab1_product_filter.append($('<option>',{'val':item.ITEM_NAME,'text':item.ITEM_NAME}));
	});  
    l_this.status_list.forEach(function(item){
		l_this.tab1_status_select_filter.append($('<option>',{'val':item.ID,'text':item.STATUS_NAME}));
    });
	l_this.type_list.forEach(function(item){
		l_this.tab1_type_select_filter.append($('<option>',{'val':item.TYPE_CODE,'text':item.TYPE_NAME}));
    });
    
    this.tab1_filter_div = $('<div>')
        .addClass('route-filter-div')
		
		
		.append($('<label>',{text:'Дата постановки: c',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.date_from_filter)
        .append($('<label>',{text:'по',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.date_to_filter)
		.append('<br><br>')
        .append($('<label>',{text:'Груз',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab1_product_filter)
		.append($('<label>',{text:' Статус загрузки в OeBS',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab1_status_select_filter)
        .append($('<label>',{text:'По виду загрузки',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab1_type_select_filter)
		.append(this.tab1_go_filter_btn)
		.append('<br><br>')
        
		.append(this.tab1_go_report_excel_btn)
        .appendTo(this.tab1_section);
    
    var fuel_standart_table = $('<table>')
        .addClass('route-table')
        .appendTo(this.tab1_section);

    $('<thead>')
        .appendTo(fuel_standart_table)
        .append($('<tr>')
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Груз'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Груз(OeBS)'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Номер задания'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Постановка<br>(местное)'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Нач.опер-и<br>(местное)'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Кон.опер-и<br>(местное)'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Заявка на увод<br>(местное)'))
					.append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Увод (местное)'))
					.append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Контейнер'))
					.append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Вес груза'))
					.append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Отказ от налива'))
					.append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Осмотрел'))
					.append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Операцию начал'))
					.append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Операцию закончил'))
					.append($('<th>').addClass('route-table-th fuel-stand-table-th').html('Заявил'))
					
					);
    this.fuel_standart_table_body = $('<tbody>')
        .appendTo(fuel_standart_table);    
    

    this.refresh_fuel_standart = function(p_async) {
		start_loading_animation();

		var l_param = {
			date_from: l_this.date_from_filter.val(),
			date_to: l_this.date_to_filter.val(),
			product_name: l_this.tab1_product_filter.val(),
			status: l_this.tab1_status_select_filter.val(),
			type: l_this.tab1_type_select_filter.val(),
		};

		//console.log('l_param=' + JSON.stringify(l_param));

		$.ajax({
			url: '../../data.php',
			type: 'POST',
			dataType: "text",
			async: p_async,
			data: {
				freight: l_param.product_name,
				date_from: l_param.date_from,
				date_to: l_param.date_to,
				status: l_param.status,
				type: l_param.type,
				ajax_action: 'get_cars_from_shop_for_oebs'
			},
			success: function(data) {
				var l_report = JSON.parse(data);
				//console.log(l_report);

				// Очищаем содержимое tbody перед добавлением новых данных
				l_this.fuel_standart_table_body.empty();

				// Добавляем данные в таблицу
				$.each(l_report, function(index, item) {
					$('<tr>')
						.append($('<td>').addClass('route-table-td').text(item.FREIGHT_NAME || '')) // Груз
						.append($('<td>').addClass('route-table-td').text(item.PRODUCT || '')) // Груз(OeBS)
						.append($('<td>').addClass('route-table-td').text(item.BATCH_NO || '')) // Номер задания
						.append($('<td>').addClass('route-table-td').text(item.DATE_POST || '')) // Постановка(местное)
						.append($('<td>').addClass('route-table-td').text(item.DATE_START || '')) // Нач. операции(местное)
						.append($('<td>').addClass('route-table-td').text(item.DATE_END || '')) // Кон. операции(местное)
						.append($('<td>').addClass('route-table-td').text(item.DATE_ZAYAVKA_UVOD || '')) // Заявка на увод(местное)
						.append($('<td>').addClass('route-table-td').text(item.DATE_UVOD || '')) // Увод (местное)
						.append($('<td>').addClass('route-table-td').text(item.CONT_NUMBER || '')) // Контейнер
						.append($('<td>').addClass('route-table-td').text(item.WEIGHT_NET || '')) // Вес груза
						.append($('<td>').addClass('route-table-td').text(item.REFUSAL || '')) // Отказ от налива
						.append($('<td>').addClass('route-table-td').text(item.WHO_LOOKED_FIO|| '')) // Осмотрел
						.append($('<td>').addClass('route-table-td').text(item.WHO_START_FIO || '')) // Операцию начал
						.append($('<td>').addClass('route-table-td').text(item.WHO_END_FIO || '')) // Операцию закончил
						.append($('<td>').addClass('route-table-td').text(item.WHO_ZAYAVKA_FIO || '')) // Заявил
						.appendTo(l_this.fuel_standart_table_body);
				});
			}
		});

		stop_loading_animation();
	};

    
});
