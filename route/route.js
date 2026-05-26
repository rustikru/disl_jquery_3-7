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
            url: '/data.php',
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
    
    setInterval(function() {
        test_auth();
        check_msg_to_users();
    }, 1000*5*60);
    check_msg_to_users();   
    
    $.ajax({
        url: '/data.php',
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
            url: '/data.php',
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
    this.route_statuses = [];
    this.route_smena = [];
    this.route_stations = [];
    this.gt_employees = [];
    this.conductors = [];
    this.train_drivers = [];
    this.locomotives = [];
    this.operations = [];
    this.fuel_loco = [];
    this.fuel_standart_spr = [];
    
    $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_fuel_standart_spr'},
        success: function (data) {
            l_this.fuel_standart_spr = JSON.parse(data);
        }
    });
    
    $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_locomotives_from_oebs'},
        success: function (data) {l_this.locomotives = JSON.parse(data);}
    });
    $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_fuel_loco'},
        success: function (data) {l_this.fuel_loco = JSON.parse(data);}
    });    
    $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_route_smena'},
        success: function (data) {l_this.route_smena = JSON.parse(data);}
    });
    $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'returnStations'},
        success: function (data) {l_this.route_stations = JSON.parse(data);}
    });
    
    this.tab1 = $('#tabs-1');
    
    this.section = $('<div>')
        .addClass('section')
        .css({'width':'auto','float':'none','height':'800px'})
        .appendTo(this.tab1);
    
    if (r_route_add){
        this.add_route_btn = $('<button>')
            .addClass('button')
            .css({'margin-left':'0.5em','margin-right':'0.5em','margin-top':'0.5em'})
            .append($('<span>').addClass('button-text button-text-size-3').text('Добавить маршрут'))
            .appendTo(this.section)
            .on('click', function(){
                create_route_window(l_this);
            });
    }
    //var open_window_date_add = new Date();
    //open_window_date_add.setHours(open_window_date_add.getHours()-24);
    var l_date = get_server_current_time();
    var l_date_from = add_day_to_date_trunc(l_date,0);
    var l_date_to = add_day_to_date_trunc(l_date,1);
    
    this.date_from_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'9em'}}).val(l_date_from);
    this.date_to_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'9em'}}).val(l_date_to);
    this.loco_select_filter = $('<select>',{class:''});
    this.smena_select_filter = $('<select>',{class:''});
    this.station_select_filter = $('<select>',{class:''});
    this.loco_select_filter.append($('<option>',{'val':'','text':''}));
    this.smena_select_filter.append($('<option>',{'val':'','text':''}));
    this.station_select_filter.append($('<option>',{'val':'','text':''}));
    this.go_filter_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Поиск'))
        .on('click', function(){
            l_this.refresh_routes(false);
            create_info_modal_dialog_new('Оповещение','Поиск завершен!');
        });
    this.clear_filter_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Очистить'))
        .on('click', function(){
            l_this.date_from_filter.val('');
            l_this.date_to_filter.val('');
            l_this.loco_select_filter.val('');
            l_this.smena_select_filter.val('');
            l_this.station_select_filter.val('');
        });
        
    init_date_time_input(this.date_from_filter);
    init_date_time_input(this.date_to_filter);
    this.locomotives.forEach(function(item){
		var l_option = $('<option>');
			$(l_option).val(item.ID);
			$(l_option).text(item.NAME);
			$(l_option).css({'color':(item.MAINTAINABLE_FLAG=='Y'?'black':'red')});
			l_this.loco_select_filter.append($(l_option));
    });
    this.route_smena.forEach(function(item){
        l_this.smena_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    this.route_stations.forEach(function(item){
        if (item.ID!='1'){
            l_this.station_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
        }
    });
    
    this.filter_div = $('<div>')
        .addClass('route-filter-div')
        .append($('<label>',{text:'дата: c',class:'route-window-attr-item-text'}))
        .append(this.date_from_filter)
        .append($('<label>',{text:'по',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.date_to_filter)
        .append($('<label>',{text:'смена',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.smena_select_filter)
        .append($('<label>',{text:'станция',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.station_select_filter)
        .append($('<label>',{text:'локомотив',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.loco_select_filter)
        .append(this.go_filter_btn)
        .append(this.clear_filter_btn)
        .appendTo(this.section);

    var route_table = $('<table>')
        .addClass('route-table')
        .appendTo(this.section);

    $('<thead>')
        .appendTo(route_table)
        .append($('<tr>')
                    .append($('<th>').addClass('route-table-th').text('Номер'))
                    .append($('<th>').addClass('route-table-th').text('Статус'))
                    .append($('<th>').addClass('route-table-th').text('Дата с'))
                    .append($('<th>').addClass('route-table-th').text('Дата по'))
                    .append($('<th>').addClass('route-table-th').text('Смена'))
                    .append($('<th>').addClass('route-table-th').text('Станция'))
                    .append($('<th>').addClass('route-table-th').text('Дежурный по станции'))
                    .append($('<th>').addClass('route-table-th').text('Маршрут выдал'))
                    .append($('<th>').addClass('route-table-th').text('Локомотив'))
                    .append($('<th>').addClass('route-table-th').text('Машинист'))
                    .append($('<th>').addClass('route-table-th').text('Помошник машиниста'))
                    .append($('<th>').addClass('route-table-th').text('Кондуктор'))
                    .append($('<th>').addClass('route-table-th').text('Комментарий')));
    this.route_table_body = $('<tbody>')
        .appendTo(route_table);
        
    this.route_content_mas = [];    
        
    this.add_route_to_table = function(p_route){
        var l_route = $('<tr>').appendTo(l_this.route_table_body);
        l_route.route_id = p_route.ROUTE_ID;
        l_route.pos = l_this.route_content_mas.length;
        l_this.route_content_mas[l_route.pos] = l_route;
        
        l_route.data = p_route;
        
        l_route.route_num_td = $('<td>').appendTo(l_route).text((p_route.ROUTE_NUM===null?'':p_route.ROUTE_NUM)).addClass('reference-text');
        l_route.status_td = $('<td>').appendTo(l_route).text((p_route.STATUS_DESC===null?'':p_route.STATUS_DESC));
        l_route.date_from_td = $('<td>').appendTo(l_route).text((p_route.DATE_FROM===null?'':p_route.DATE_FROM));
        l_route.date_to_td = $('<td>').appendTo(l_route).text((p_route.DATE_TO===null?'':p_route.DATE_TO));
        l_route.smena_td= $('<td>').appendTo(l_route).text((p_route.SMENA_DESC===null?'':p_route.SMENA_DESC));
        l_route.station_td= $('<td>').appendTo(l_route).text((p_route.STATION_DESC===null?'':p_route.STATION_DESC));
        l_route.station_officer_td= $('<td>').appendTo(l_route).text((p_route.STATION_OFFICER_DESC===null?'':p_route.STATION_OFFICER_DESC));
        l_route.route_gave_td= $('<td>').appendTo(l_route).text((p_route.ROUTE_GAVE_DESC===null?'':p_route.ROUTE_GAVE_DESC));
        l_route.loco_td= $('<td>').appendTo(l_route).text((p_route.LOCO_DESC===null?'':p_route.LOCO_DESC));
        l_route.driver1_td= $('<td>').appendTo(l_route).text((p_route.DRIVER1_DESC===null?'':p_route.DRIVER1_DESC));
        l_route.driver2_td= $('<td>').appendTo(l_route).text((p_route.DRIVER2_DESC===null?'':p_route.DRIVER2_DESC));
        l_route.conductor_td= $('<td>').appendTo(l_route).text((p_route.CONDUCTOR_DESC===null?'':p_route.CONDUCTOR_DESC));
        l_route.com_td= $('<td>').appendTo(l_route).text((p_route.COM===null?'':p_route.COM));
        
        l_route.route_num_td.on('click', function(){create_route_window(l_this,l_route);});
        return l_route;
    };
    
    this.refresh_routes = function(p_async){
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: p_async,
            data: { date_from: l_this.date_from_filter.val()
                   ,date_to: l_this.date_to_filter.val()
                   ,smena: l_this.smena_select_filter.val()
                   ,station: l_this.station_select_filter.val()
                   ,loco: l_this.loco_select_filter.val()
                   ,ajax_action: 'get_routes'
                  },
            success: function (data) {
                var l_routes = JSON.parse(data);
                l_routes.forEach(function (item){
                    var l_exists_item = false;
                    l_this.route_content_mas.forEach(function(route){
                        if (item.ROUTE_ID == route.route_id){
                            l_exists_item = true;
                            if (route.data.last_update_date != item.LAST_UPDATE_DATE){
                                route.data = item;
                                route.route_num_td.text((item.ROUTE_NUM===null?'':item.ROUTE_NUM));
                                route.status_td.text((item.STATUS_DESC===null?'':item.STATUS_DESC));
                                route.date_from_td.text((item.DATE_FROM===null?'':item.DATE_FROM));
                                route.date_to_td.text((item.DATE_TO===null?'':item.DATE_TO));
                                route.smena_td.text((item.SMENA_DESC===null?'':item.SMENA_DESC));
                                route.station_td.text((item.STATION_DESC===null?'':item.STATION_DESC));
                                route.station_officer_td.text((item.STATION_OFFICER_DESC===null?'':item.STATION_OFFICER_DESC));
                                route.route_gave_td.text((item.ROUTE_GAVE_DESC===null?'':item.ROUTE_GAVE_DESC));
                                route.loco_td.text((item.LOCO_DESC===null?'':item.LOCO_DESC));
                                route.driver1_td.text((item.DRIVER1_DESC===null?'':item.DRIVER1_DESC));
                                route.driver2_td.text((item.DRIVER2_DESC===null?'':item.DRIVER2_DESC));
                                route.conductor_td.text((item.CONDUCTOR_DESC===null?'':item.CONDUCTOR_DESC));
                                route.com_td.text((item.COM===null?'':item.COM));
                            }
                        }
                    });
                    if (!l_exists_item) {
                        var l_cur_route= l_this.add_route_to_table(item);
                    }
                });
                
                l_this.route_content_mas.forEach(function(route){
                    var l_exists_item = false;
                    l_routes.forEach(function (item){
                        if (item.ROUTE_ID == route.route_id){
                            l_exists_item=true;
                        }
                    });
                    if (!l_exists_item) {
                        route.remove();
                        delete l_this.route_content_mas[route.pos];
                    }
                });
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        }); 
    };
    
    l_this.refresh_routes(false);
    setInterval(function() {
        l_this.refresh_routes(true);
    }, 1000*5*60);
    
    this.disable_filter_btn_tab1 = function(){    
        if (l_this.date_from_filter.hasClass('red_bckg_color')||l_this.date_from_filter.val()==''||
            l_this.date_to_filter.hasClass('red_bckg_color')) {
            l_this.go_filter_btn.prop( "disabled", true );
        }else{
            l_this.go_filter_btn.prop( "disabled", false );
        }    
    };
    this.date_from_filter.on('blur',function(){l_this.disable_filter_btn_tab1();});
    this.date_to_filter.on('blur',function(){l_this.disable_filter_btn_tab1();});
    this.disable_filter_btn_tab1();
    
    /***************************************** Операции *****************************************/
    $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_route_operations'},
        success: function (data) {l_this.operations = JSON.parse(data);}
    });
    
    this.tab2 = $('#tabs-2');

    this.tab2_section = $('<div>')
        .addClass('section')
        .css({'width':'auto','float':'none','overflow':'none'})
        .appendTo(this.tab2);
        
    if (r_route_processing) {
        this.tab2_add_route_btn = $('<button>')
            .prop('disabled',true)
            .addClass('button')
            .css({'margin-left':'0.5em'})
            .append($('<span>').addClass('button-text button-text-size-3').text('Добавить маршрут'))
            .appendTo(this.tab2_section)
            .on('click', function(){
                var l_cars = [];
                l_this.route_act_content_mas.forEach(function(item){
                    if (item.checkbox.prop("checked")!=''){
                        l_cars.push(item.data.OBJ_NUMBER);
                    }
                });
                if (l_cars.length != 0){
                    create_add_route_window(l_this);
                }else{
                    create_info_modal_dialog_new('Оповещение','Выберете операции!');
                }
            });

        this.tab2_del_route_btn = $('<button>')
            .prop('disabled',true)
            .addClass('button')
            .css({'margin-left':'0.5em'})
            .append($('<span>').addClass('button-text button-text-size-3').text('Убрать маршрут'))
            .appendTo(this.tab2_section)
            .on('click', function(){
                var l_cars = [];
                l_this.route_act_content_mas.forEach(function(item){
                    if (item.checkbox.prop("checked") && item.route_td.text()!=''){
                        l_cars.push(item.data.OBJ_NUMBER);
                    }
                });
                if (l_cars.length != 0){
                    create_del_route_window(l_this);
                }else{
                    create_info_modal_dialog_new('Оповещение','Выберете операции с маршрутами!');
                }
            });
        
        this.add_tab2_other_action_btn = $('<button>')
            .addClass('button')
            .css({'margin-left':'0.5em','margin-right':'0.5em','margin-top':'0.5em'})
            .append($('<span>').addClass('button-text button-text-size-3').text('Добавить прочую операцию'))
            .appendTo(this.tab2_section)
            .on('click', function(){
                var l_cars = [];
                l_this.route_act_content_mas.forEach(function(item){
                    if (item.checkbox.prop("checked")){
                        l_cars.push(item.data.OBJ_NUMBER);
                    }
                });
                if (l_cars.length != 0){
                    create_add_other_oper_window(l_this,null,true,l_cars);
                }else{
                    create_info_modal_dialog_new('Оповещение','Выберете операцию для создания прочей операции!');
                }
            });        
    }     
    //var open_window_date_add = new Date();
    //open_window_date_add.setHours(open_window_date_add.getHours());
        
    this.tab2_date_from_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'9em'}}).val(l_date_from);
    this.tab2_date_to_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'9em'}}).val(l_date_to);
    this.tab2_station_select_filter = $('<select>',{class:''});
    this.tab2_oper_select_filter = $('<select>',{class:''});
    this.tab2_route_select_filter = $('<select>',{class:''});
    this.tab2_go_filter_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Поиск'))
        .on('click', function(){
            l_this.refresh_route_acts();
            //create_info_modal_dialog_new('Оповещение','Поиск завершен!');
        });
    this.tab2_clear_filter_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Очистить'))
        .on('click', function(){
            l_this.tab2_date_from_filter.val('');
            l_this.tab2_date_to_filter.val('');
            l_this.tab2_station_select_filter.val('');
            l_this.tab2_oper_select_filter.val('');
            //l_this.tab2_route_select_filter.val('');
        });    
    
    init_date_time_input(this.tab2_date_from_filter);
    init_date_time_input(this.tab2_date_to_filter);
    l_this.tab2_oper_select_filter.append($('<option>',{'val':'','text':''}));
    l_this.tab2_station_select_filter.append($('<option>',{'val':'','text':''}));
    l_this.tab2_route_select_filter.append($('<option>',{'val':'','text':''}));
    l_this.tab2_route_select_filter.append($('<option>',{'val':'0','text':'Нет маршрута'}));
    l_this.tab2_route_select_filter.append($('<option>',{'val':'1','text':'Есть маршрут'}));
    this.operations.forEach(function(item){
        l_this.tab2_oper_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    this.route_stations.forEach(function(item){
        if (item.ID!='1'){
            l_this.tab2_station_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
        }
    });
    l_this.tab2_route_select_filter.val('0');
    
    this.tab2_filter_div = $('<div>')
        .addClass('route-filter-div')
        .append($('<label>',{text:'дата: c',class:'route-window-attr-item-text'}))
        .append(this.tab2_date_from_filter)
        .append($('<label>',{text:'по',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab2_date_to_filter)
        .append($('<label>',{text:'станция',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab2_station_select_filter)
        .append($('<label>',{text:'операция',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab2_oper_select_filter)
        .append($('<label>',{text:'маршрут',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab2_route_select_filter)
        .append(this.tab2_go_filter_btn)
        .append(this.tab2_clear_filter_btn)
        .appendTo(this.tab2_section);
        
    var route_act_table_div = $('<div>').appendTo(this.tab2_section);
    var route_act_table = $('<table>')
        .addClass('route-table route-act-table')
        .appendTo(route_act_table_div);
    
    var l_check_all = $('<input>',{'type':'checkbox'});
    $('<thead>')
        .appendTo(route_act_table)
        .append($('<tr>')
            .append($('<th>').addClass('route-table-th').append(l_check_all))
            .append($('<th>').addClass('route-table-th').text('Операция'))
            .append($('<th>').addClass('route-table-th').text('Дата операции'))
            .append($('<th>').addClass('route-table-th').text('Дата ввода'))
            .append($('<th>').addClass('route-table-th').text('Описание'))
            .append($('<th>').addClass('route-table-th').text('Вагон / Контейнер'))
            .append($('<th>').addClass('route-table-th').text('Стан.'))
            .append($('<th>').addClass('route-table-th').text('Груз'))
            .append($('<th>').addClass('route-table-th').text('Маршрут'))
            .append($('<th>').addClass('route-table-th').text('Время')));
    this.route_act_table_body = $('<tbody>')
        .appendTo(route_act_table);
        
    this.route_act_content_mas = [];
    
    this.add_route_act_to_table = function(p_route_act){
        var l_route_act = $('<tr>').appendTo(l_this.route_act_table_body);
        l_route_act.pos = l_this.route_act_content_mas.length;
        l_this.route_act_content_mas[l_route_act.pos] = l_route_act;
        
        l_route_act.data = p_route_act;
        
        l_route_act.checkbox = $('<input>',{'type':'checkbox'}).appendTo(l_route_act);
        l_route_act.operation_descr_td = $('<td>').appendTo(l_route_act).text((p_route_act.OPERATION_DESCR===null?'':p_route_act.OPERATION_DESCR));
        l_route_act.date_oper_custom_td = $('<td>').appendTo(l_route_act).text((p_route_act.DATE_OPER_CUSTOM===null?'':p_route_act.DATE_OPER_CUSTOM));
        l_route_act.date_oper_td = $('<td>').appendTo(l_route_act).text((p_route_act.DATE_OPER===null?'':p_route_act.DATE_OPER));
        l_route_act.action_desc_td = $('<td>').appendTo(l_route_act).text((p_route_act.ACTION_DESC===null?'':p_route_act.ACTION_DESC));
        l_route_act.obj_number_td= $('<td>').appendTo(l_route_act).text((p_route_act.OBJ_NUMBER===null?'':p_route_act.OBJ_NUMBER));
        l_route_act.station_td= $('<td>').appendTo(l_route_act).text((p_route_act.STATION===null?'':p_route_act.STATION));
        l_route_act.freight_td= $('<td>').appendTo(l_route_act).text((p_route_act.FREIGHT===null?'':p_route_act.FREIGHT));
        l_route_act.route_td= $('<td>').appendTo(l_route_act).text((p_route_act.ROUTE_DESC===null?'':p_route_act.ROUTE_DESC));
        l_route_act.route_time_td= $('<td>').appendTo(l_route_act).text((p_route_act.ROUTE_TIME===null?'':p_route_act.ROUTE_TIME));
        
        l_route_act.checkbox.on('mousedown', function(event) {
            /*нажатие правой кнопкой*/
            if (event.which === 3){
                if(l_route_act.checkbox.prop('checked')){l_route_act.checkbox.prop('checked',false);}
                else{l_route_act.checkbox.prop('checked',true);}
            }
        });
        l_route_act.checkbox.on('change', function() {
            l_this.route_act_content_mas.forEach(function(item){
                if (l_route_act.data.OPERATION_ID == item.data.OPERATION_ID && l_route_act.data.DATE_OPER_CUSTOM == item.data.DATE_OPER_CUSTOM && l_route_act.data.ACTION_ID != item.data.ACTION_ID){
                    item.checkbox.prop('checked',l_route_act.checkbox.prop('checked'));
                }
            });
        });
    };
    
    this.refresh_route_acts = function(){
        start_loading_animation();
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { date_from: l_this.tab2_date_from_filter.val()
                   ,date_to: l_this.tab2_date_to_filter.val()
                   ,station: l_this.tab2_station_select_filter.val()
                   ,oper: l_this.tab2_oper_select_filter.val()
                   ,exists_route: l_this.tab2_route_select_filter.val()
                   ,ajax_action: 'get_route_actions'},
            success: function (data) {
                var l_route_acts = JSON.parse(data);
                l_this.route_act_content_mas.length = 0;
                l_this.route_act_table_body.find('tr').remove(); 
                
                l_route_acts.forEach(function (item){
                    l_this.add_route_act_to_table(item);
                });
                if (l_this.route_act_content_mas.length == 0){
                    l_this.tab2_add_route_btn.prop('disabled',true);
                    l_this.tab2_del_route_btn.prop('disabled',true);
                }else{
                    l_this.tab2_add_route_btn.prop('disabled',false);
                    l_this.tab2_del_route_btn.prop('disabled',false);
                }
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        }); 
        stop_loading_animation();
    };
    
    var l_height = $('.wrapper').height() - $('header').height()-50;
    $('.section').height(l_height);
    l_height = l_height - 90;
    route_act_table_div.height(l_height);
    route_act_table_div.css({'overflow':'auto'});
    
    l_check_all.on('change', function() {
        l_this.route_act_content_mas.forEach(function(item){
            item.checkbox.prop('checked',l_check_all.prop('checked'));
        });
    });
    
    this.disable_filter_btn_tab2 = function(){    
        if (l_this.tab2_date_from_filter.hasClass('red_bckg_color')||l_this.tab2_date_from_filter.val()==''||
            l_this.tab2_date_to_filter.hasClass('red_bckg_color')) {
            l_this.tab2_go_filter_btn.prop( "disabled", true );
        }else{
            l_this.tab2_go_filter_btn.prop( "disabled", false );
        }    
    };
    this.tab2_date_from_filter.on('blur',function(){l_this.disable_filter_btn_tab2();});
    this.tab2_date_to_filter.on('blur',function(){l_this.disable_filter_btn_tab2();});
    this.disable_filter_btn_tab2();
    /********************************************       Прочие операции        ********************************************/
    $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_other_route_operations'},
        success: function (data) {l_this.other_operations = JSON.parse(data);}
    });
    
    $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_other_operation_descr'},
        success: function (data) {l_this.other_oper_descr = JSON.parse(data);}
    });
    
    this.tab3 = $('#tabs-3');

    this.tab3_section = $('<div>')
        .addClass('section')
        .css({'width':'auto','float':'none','overflow':'none'})
        .appendTo(this.tab3);
        
    if (r_route_processing) {
        this.add_other_action_btn = $('<button>')
            .addClass('button')
            .css({'margin-left':'0.5em','margin-right':'0.5em','margin-top':'0.5em'})
            .append($('<span>').addClass('button-text button-text-size-3').text('Добавить операцию'))
            .appendTo(this.tab3_section)
            .on('click', function(){
                create_add_other_oper_window(l_this);
            });

        this.del_other_action_btn = $('<button>')
            .addClass('button')
            .css({'margin-left':'0.5em','margin-right':'0.5em','margin-top':'0.5em'})
            .append($('<span>').addClass('button-text button-text-size-3').text('Удалить операцию'))
            .appendTo(this.tab3_section)
            .on('click', function(){
                var l_cars = [];
                l_this.route_other_act_content_mas.forEach(function(item){
                    if (item.checkbox.prop("checked") && item.route_td.text()!=''){
                        l_cars.push(item.data.OBJ_NUMBER);
                    }
                });
                if (l_cars.length != 0){
                    create_del_other_oper_window(l_this);
                }else{
                    create_info_modal_dialog_new('Оповещение','Выберете операции с маршрутами!');
                }
            });
    }
    //var open_window_date_add = new Date();
    //open_window_date_add.setHours(open_window_date_add.getHours());
        
    this.tab3_date_from_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'9em'}}).val(l_date_from);
    this.tab3_date_to_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'9em'}}).val(l_date_to);
    this.tab3_station_select_filter = $('<select>',{class:'',css:{'width':'7em'}});
    this.tab3_oper_select_filter = $('<select>',{class:'',css:{'width':'12em'}});
    this.tab3_route_select_filter = $('<select>',{css:{'width':'17em'}});
    this.tab3_go_filter_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Поиск'))
        .on('click', function(){
            l_this.refresh_route_other_acts();
            create_info_modal_dialog_new('Оповещение','Поиск завершен!');
        }); 
    this.tab3_clear_filter_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Очистить'))
        .on('click', function(){
            l_this.tab3_date_from_filter.val('');
            l_this.tab3_date_to_filter.val('');
            l_this.tab3_station_select_filter.val('');
            l_this.tab3_oper_select_filter.val('');
            l_this.tab3_route_select_filter.val('');
        });
    
    init_date_time_input(this.tab3_date_from_filter);
    init_date_time_input(this.tab3_date_to_filter);
    l_this.tab3_oper_select_filter.append($('<option>',{'val':'','text':''}));
    l_this.tab3_station_select_filter.append($('<option>',{'val':'','text':''}));
    this.other_operations.forEach(function(item){
        l_this.tab3_oper_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    this.route_stations.forEach(function(item){
        if (item.ID!='1'){
            l_this.tab3_station_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
        }
    });
    
    
    this.tab3_date_from_filter.on('blur',function(){
        if (!l_this.tab3_date_from_filter.hasClass('red_bckg_color')&&l_this.tab3_date_from_filter.val()!=''){
            $.ajax({
                url: '../data.php',
                type: 'POST',
                dataType: "text",
                async:false,
                // параметры запроса, передаваемые на сервер (последний - подстрока для поиска):
                data:{
                    date: l_this.tab3_date_from_filter.val(),
                    enter_text: '',
                    ajax_action: 'get_suitable_routes'},
                // обработка успешного выполнения запроса
                success: function(data){
                    var l_res = JSON.parse(data);
                    l_this.tab3_route_select_filter.find('option').remove();
                    l_this.tab3_route_select_filter.append($('<option>',{'val':'','text':''}));
                    l_res.forEach(function(item){
                         l_this.tab3_route_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
                    });
                }
            }); 
        }
    });  
    this.tab3_date_from_filter.triggerHandler('blur');
    
    this.tab3_filter_div = $('<div>')
        .addClass('route-filter-div')
        .append($('<label>',{text:'дата: c',class:'route-window-attr-item-text'}))
        .append(this.tab3_date_from_filter)
        .append($('<label>',{text:'по',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab3_date_to_filter)
        .append($('<label>',{text:'станция',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab3_station_select_filter)
        .append($('<label>',{text:'операция',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab3_oper_select_filter)
        .append($('<label>',{text:'маршрут',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab3_route_select_filter)
        .append(this.tab3_go_filter_btn)
        .append(this.tab3_clear_filter_btn)
        .append(this.tab3_add_route_btn)
        .appendTo(this.tab3_section);
        
    var route_other_act_table_div = $('<div>').appendTo(this.tab3_section);
    var route_other_act_table = $('<table>')
        .addClass('route-table route-act-table')
        .appendTo(route_other_act_table_div);
    
    //var l_tab3_check_all = $('<input>',{'type':'checkbox'});
    $('<thead>')
        .appendTo(route_other_act_table)
        .append($('<tr>')
            //.append($('<th>').addClass('route-table-th').append(l_tab3_check_all))
            .append($('<th>').addClass('route-table-th'))
            .append($('<th>').addClass('route-table-th').text('Операция'))
            .append($('<th>').addClass('route-table-th').text('Дата операции'))
            .append($('<th>').addClass('route-table-th').text('Дата ввода'))
            .append($('<th>').addClass('route-table-th').text('Описание'))
            .append($('<th>').addClass('route-table-th').text('Вагон / Контейнер'))
            .append($('<th>').addClass('route-table-th').text('Стан.'))
            .append($('<th>').addClass('route-table-th').text('Груз'))
            .append($('<th>').addClass('route-table-th').text('Маршрут'))
            .append($('<th>').addClass('route-table-th').text('Время')));
    this.route_other_act_table_body = $('<tbody>')
        .appendTo(route_other_act_table);

    this.route_other_act_content_mas = [];

    this.add_route_other_act_to_table = function(p_route_act){
        var l_route_act = $('<tr>').appendTo(l_this.route_other_act_table_body);
        l_route_act.pos = l_this.route_other_act_content_mas.length;
        l_this.route_other_act_content_mas[l_route_act.pos] = l_route_act;
        
        l_route_act.data = p_route_act;
        
        l_route_act.checkbox = $('<input>',{'type':'checkbox'}).appendTo(l_route_act);
        l_route_act.operation_descr_td = $('<td>').appendTo(l_route_act).text((p_route_act.OPERATION_DESCR===null?'':p_route_act.OPERATION_DESCR)).addClass('reference-text');
        l_route_act.date_oper_custom_td = $('<td>').appendTo(l_route_act).text((p_route_act.DATE_OPER_CUSTOM===null?'':p_route_act.DATE_OPER_CUSTOM));
        l_route_act.date_oper_td = $('<td>').appendTo(l_route_act).text((p_route_act.DATE_OPER===null?'':p_route_act.DATE_OPER));
        l_route_act.action_desc_td = $('<td>').appendTo(l_route_act).text((p_route_act.ACTION_DESC===null?'':p_route_act.ACTION_DESC));
        l_route_act.obj_number_td= $('<td>').appendTo(l_route_act).text((p_route_act.OBJ_NUMBER===null?'':p_route_act.OBJ_NUMBER));
        l_route_act.station_td= $('<td>').appendTo(l_route_act).text((p_route_act.STATION===null?'':p_route_act.STATION));
        l_route_act.freight_td= $('<td>').appendTo(l_route_act).text((p_route_act.FREIGHT===null?'':p_route_act.FREIGHT));
        l_route_act.route_td= $('<td>').appendTo(l_route_act).text((p_route_act.ROUTE_DESC===null?'':p_route_act.ROUTE_DESC));
        l_route_act.route_time_td= $('<td>').appendTo(l_route_act).text((p_route_act.ROUTE_TIME===null?'':p_route_act.ROUTE_TIME));
        
        l_route_act.operation_descr_td.on('click', function(){create_add_other_oper_window(l_this,l_route_act);});
        
        l_route_act.checkbox.on('mousedown', function(event) {
            /*нажатие правой кнопкой*/
            if (event.which === 3){
                if(l_route_act.checkbox.prop('checked')){l_route_act.checkbox.prop('checked',false);}
                else{l_route_act.checkbox.prop('checked',true);}
            }
        });
        l_route_act.checkbox.on('change', function() {
            l_this.route_other_act_content_mas.forEach(function(item){
                if (l_route_act.data.OPERATION_ID == item.data.OPERATION_ID && l_route_act.data.GENERAL_DATE_FROM == item.data.GENERAL_DATE_FROM && l_route_act.data.GENERAL_DATE_TO == item.data.GENERAL_DATE_TO && l_route_act.data.ACTION_ID != item.data.ACTION_ID){
                    item.checkbox.prop('checked',l_route_act.checkbox.prop('checked'));
                }
            });
        });
    };

    this.refresh_route_other_acts = function(p_action_id){
        start_loading_animation();
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { date_from: l_this.tab3_date_from_filter.val()
                   ,date_to: l_this.tab3_date_to_filter.val()
                   ,station: l_this.tab3_station_select_filter.val()
                   ,oper: l_this.tab3_oper_select_filter.val()
                   ,route: l_this.tab3_route_select_filter.val()
                   ,action_id: p_action_id
                   ,ajax_action: 'get_other_actions'},
            success: function (data) {
                var l_route_acts = JSON.parse(data);
                l_this.route_other_act_content_mas.length = 0;
                l_this.route_other_act_table_body.find('tr').remove(); 

                l_route_acts.forEach(function (item){
                    l_this.add_route_other_act_to_table(item);
                });
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        }); 
        stop_loading_animation();
    };

    this.disable_filter_btn_tab3 = function(){    
        if (l_this.tab3_date_from_filter.hasClass('red_bckg_color')||l_this.tab3_date_from_filter.val()==''||
            l_this.tab3_date_to_filter.hasClass('red_bckg_color')) {
            l_this.tab3_go_filter_btn.prop( "disabled", true );
        }else{
            l_this.tab3_go_filter_btn.prop( "disabled", false );
        }    
    };
    this.tab3_date_from_filter.on('blur',function(){l_this.disable_filter_btn_tab3();});
    this.tab3_date_to_filter.on('blur',function(){l_this.disable_filter_btn_tab3();});
    this.disable_filter_btn_tab3();
    
    //l_height = l_height - 90;
    route_other_act_table_div.height(l_height);
    route_other_act_table_div.css({'overflow':'auto'});
    
    /****************************************************************** Маршруты (Итоги)******************************************************************/
    this.tab4= $('#tabs-4');
    
    this.tab4_section = $('<div>')
        .addClass('section')
        .css({'width':'auto','float':'none'/*,'height':'800px'*/})
        .appendTo(this.tab4);
    
    this.tab4_date_from_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'9em'}}).val(l_date_from);
    this.tab4_date_to_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'9em'}}).val(l_date_to);
    this.tab4_loco_select_filter = $('<select>',{class:''});
    this.tab4_smena_select_filter = $('<select>',{class:''});
    this.tab4_station_select_filter = $('<select>',{class:''});
    this.tab4_loco_select_filter.append($('<option>',{'val':'','text':''}));
    this.tab4_smena_select_filter.append($('<option>',{'val':'','text':''}));
    this.tab4_station_select_filter.append($('<option>',{'val':'','text':''}));
    this.tab4_go_filter_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Поиск'))
        .on('click', function(){
            l_this.tab4_refresh_routes(false);
            create_info_modal_dialog_new('Оповещение','Поиск завершен!');
        });
    this.tab4_clear_filter_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Очистить'))
        .on('click', function(){
            l_this.tab4_date_from_filter.val('');
            l_this.tab4_date_to_filter.val('');
            l_this.tab4_loco_select_filter.val('');
            l_this.tab4_smena_select_filter.val('');
            l_this.tab4_station_select_filter.val('');
        });
        
    init_date_time_input(this.tab4_date_from_filter);
    init_date_time_input(this.tab4_date_to_filter);
    this.locomotives.forEach(function(item){
        var l_option = $('<option>');
			$(l_option).val(item.ID);
			$(l_option).text(item.NAME);
			$(l_option).css({'color':(item.MAINTAINABLE_FLAG=='Y'?'black':'red')});
			l_this.tab4_loco_select_filter.append($(l_option));
		//l_this.tab4_loco_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    this.route_smena.forEach(function(item){
        l_this.tab4_smena_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    this.route_stations.forEach(function(item){
        if (item.ID!='1'){
            l_this.tab4_station_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
        }
    });
    
    this.tab4_filter_div = $('<div>')
        .addClass('route-filter-div')
        .append($('<label>',{text:'дата: c',class:'route-window-attr-item-text'}))
        .append(this.tab4_date_from_filter)
        .append($('<label>',{text:'по',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab4_date_to_filter)
        .append($('<label>',{text:'смена',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab4_smena_select_filter)
        .append($('<label>',{text:'станция',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab4_station_select_filter)
        .append($('<label>',{text:'локомотив',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab4_loco_select_filter)
        .append(this.tab4_go_filter_btn)
        .append(this.tab4_clear_filter_btn)
        .appendTo(this.tab4_section);

    var tab4_route_table_div = $('<div>').appendTo(this.tab4_section);

    var tab4_route_table = $('<table>')
        .addClass('route-table')
        .appendTo(tab4_route_table_div);

    $('<thead>')
        .appendTo(tab4_route_table)
        .append($('<tr>')
                    .append($('<th>').addClass('route-table-th').text('Номер'))
                    .append($('<th>').addClass('route-table-th').text('Статус'))
                    .append($('<th>').addClass('route-table-th').text('Заправка,л'))
                    .append($('<th>').addClass('route-table-th').text('Приём,л'))
                    .append($('<th>').addClass('route-table-th').text('Сдача,л'))
                    .append($('<th>').addClass('route-table-th').text('Факт расхода,л'))
                    /*.append($('<th>').addClass('route-table-th').text('Факт расхода,кг'))*/
                    .append($('<th>').addClass('route-table-th').text('Норма раcхода,л'))
                    .append($('<th>').addClass('route-table-th').text('Экономия,л'))
                    .append($('<th>').addClass('route-table-th').text('Пережег,л'))
                    .append($('<th>').addClass('route-table-th').text('Ожидание (простой)'))
                    .append($('<th>').addClass('route-table-th').text('В горячем состоянии'))
                    .append($('<th>').addClass('route-table-th').text('В холодном состоянии'))
                    .append($('<th>').addClass('route-table-th').text('Маневровая работа'))
                    .append($('<th>').addClass('route-table-th').text('Грузовая (поездная) работа'))
                    .append($('<th>').addClass('route-table-th').text('Итого часов'))
                    .append($('<th>').addClass('route-table-th').text('Сверхнорм. работа')));
    this.tab4_route_table_body = $('<tbody>')
        .appendTo(tab4_route_table);
        
    l_height = l_height + 30;
    tab4_route_table_div.height(l_height);
    tab4_route_table_div.css({'overflow':'auto'});        
        
    this.tab4_route_content_mas = [];    
        
    this.tab4_add_route_to_table = function(p_route){
        var l_route = $('<tr>').appendTo(l_this.tab4_route_table_body);
        l_route.route_id = p_route.ROUTE_ID;
        l_route.pos = l_this.tab4_route_content_mas.length;
        l_this.tab4_route_content_mas[l_route.pos] = l_route;
        
        l_route.data = p_route;
        
        l_route.route_num_td = $('<td>').appendTo(l_route).text((p_route.ROUTE_NUM===null?'':p_route.ROUTE_NUM)).addClass('reference-text');
        l_route.status_td = $('<td>').appendTo(l_route).text((p_route.STATUS_DESC===null?'':p_route.STATUS_DESC));
        l_route.refill_td = $('<td>').appendTo(l_route).text((p_route.REFILL===null?'':p_route.REFILL));
        l_route.fuel_in_td = $('<td>').appendTo(l_route).text((p_route.FUEL_IN===null?'':p_route.FUEL_IN));
        l_route.fuel_out_td = $('<td>').appendTo(l_route).text((p_route.FUEL_OUT===null?'':p_route.FUEL_OUT));
        l_route.consumption_fact_td = $('<td>').appendTo(l_route).text((p_route.CONSUMPTION_FACT===null?'':p_route.CONSUMPTION_FACT));
        /*l_route.consumption_fact_kg_td = $('<td>').appendTo(l_route).text((p_route.CONSUMPTION_FACT_KG===null?'':p_route.CONSUMPTION_FACT_KG));*/
        l_route.consumption_norm_td = $('<td>').appendTo(l_route).text((p_route.CONSUMPTION_NORM===null?'':p_route.CONSUMPTION_NORM));
        l_route.consumption_plus_td = $('<td>').appendTo(l_route).text((p_route.CONSUMPTION_PLUS===null?'':p_route.CONSUMPTION_PLUS));
        l_route.consumption_minus_td = $('<td>').appendTo(l_route).text((p_route.CONSUMPTION_MINUS===null?'':p_route.CONSUMPTION_MINUS));
        l_route.waiting_td = $('<td>').appendTo(l_route).text((p_route.WAITING_HR===null?'':p_route.WAITING_HR));
        l_route.waiting_hot_td = $('<td>').appendTo(l_route).text((p_route.WAITING_HOT_HR===null?'':p_route.WAITING_HOT_HR));
        l_route.waiting_cold_td = $('<td>').appendTo(l_route).text((p_route.WAITING_COLD_HR===null?'':p_route.WAITING_COLD_HR));
        l_route.shunting_work_td = $('<td>').appendTo(l_route).text((p_route.SHUNTING_WORK_HR===null?'':p_route.SHUNTING_WORK_HR));
        l_route.freight_work_td = $('<td>').appendTo(l_route).text((p_route.FREIGHT_WORK_HR===null?'':p_route.FREIGHT_WORK_HR));
        l_route.total_work_td = $('<td>').appendTo(l_route).text((p_route.TOTAL_WORK_HR===null?'':p_route.TOTAL_WORK_HR)).addClass('reference-text');;
        l_route.excess_work_td = $('<td>').appendTo(l_route).text((p_route.EXCESS_WORK_HR===null?'':p_route.EXCESS_WORK_HR));
        
        l_route.route_num_td.on('click', function(){create_route_window_add(l_this,l_route);});
        l_route.total_work_td.on('click', function(){create_route_operations_window(l_this,p_route.ROUTE_ID);});
        return l_route;
    };

    this.tab4_refresh_routes = function(p_async){
        $.ajax({
            url: '/data.php',
            type: 'POST',
            dataType: "text",
            async: p_async,
            data: { date_from: l_this.tab4_date_from_filter.val()
                   ,date_to: l_this.tab4_date_to_filter.val()
                   ,smena: l_this.tab4_smena_select_filter.val()
                   ,station: l_this.tab4_station_select_filter.val()
                   ,loco: l_this.tab4_loco_select_filter.val()
                   ,ajax_action: 'get_routes_totals'
                  },
            success: function (data) {
                var l_routes = JSON.parse(data);
                l_routes.forEach(function (item){
                    var l_exists_item = false;
                    l_this.tab4_route_content_mas.forEach(function(route){
                        if (item.ROUTE_ID == route.route_id){
                            l_exists_item = true;
                            if (route.data.last_update_date != item.LAST_UPDATE_DATE || route.data.last_update_date != item.TOTAL_LAST_UPDATE_DATE){
                                route.data = item;
                                route.route_num_td.text((item.ROUTE_NUM===null?'':item.ROUTE_NUM));
                                route.status_td.text((item.STATUS_DESC===null?'':item.STATUS_DESC));
                                route.refill_td.text((item.REFILL===null?'':item.REFILL));
                                route.fuel_in_td.text((item.FUEL_IN===null?'':item.FUEL_IN));
                                route.fuel_out_td.text((item.FUEL_OUT===null?'':item.FUEL_OUT));
                                route.consumption_fact_td.text((item.CONSUMPTION_FACT===null?'':item.CONSUMPTION_FACT));
                                /*route.consumption_fact_kg_td.text((item.CONSUMPTION_FACT_KG===null?'':item.CONSUMPTION_FACT_KG));*/
                                route.consumption_norm_td.text((item.CONSUMPTION_NORM===null?'':item.CONSUMPTION_NORM));
                                route.consumption_plus_td.text((item.CONSUMPTION_PLUS===null?'':item.CONSUMPTION_PLUS));
                                route.consumption_minus_td.text((item.CONSUMPTION_MINUS===null?'':item.CONSUMPTION_MINUS));
                                route.waiting_td.text((item.WAITING_HR===null?'':item.WAITING_HR));
                                route.waiting_hot_td.text((item.WAITING_HOT_HR===null?'':item.WAITING_HOT_HR));
                                route.waiting_cold_td.text((item.WAITING_COLD_HR===null?'':item.WAITING_COLD_HR));
                                route.shunting_work_td.text((item.SHUNTING_WORK_HR===null?'':item.SHUNTING_WORK_HR));
                                route.freight_work_td.text((item.FREIGHT_WORK_HR===null?'':item.FREIGHT_WORK_HR));
                                route.total_work_td.text((item.TOTAL_WORK_HR===null?'':item.TOTAL_WORK_HR));
                                route.excess_work_td.text((item.EXCESS_WORK_HR===null?'':item.EXCESS_WORK_HR));
                            }
                        }
                    });
                    if (!l_exists_item) {
                        var l_cur_route= l_this.tab4_add_route_to_table(item);
                    }
                });
                
                l_this.tab4_route_content_mas.forEach(function(route){
                    var l_exists_item = false;
                    l_routes.forEach(function (item){
                        if (item.ROUTE_ID == route.route_id){
                            l_exists_item=true;
                        }
                    });
                    if (!l_exists_item) {
                        route.remove();
                        delete l_this.tab4_route_content_mas[route.pos];
                    }
                });
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        }); 
    };

    /****************************************************************** Нормы расход ГСМ******************************************************************/
    this.tab5 = $('#tabs-5');
    
    this.tab5_section = $('<div>')
        .addClass('section')
        .css({'width':'auto','float':'none','height':'800px'})
        .appendTo(this.tab5);
    
    this.tab5_fuel_standart_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em','margin-right':'0.5em','margin-top':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-3').text('Добавить норму'))
        .appendTo(this.tab5_section)
        .on('click', function(){
            open_fuel_standart_window(l_this);
        });
    
    this.tab5_date_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'7em'}}).val(trunc_date(l_date));
    this.tab5_base_type_select_filter = $('<select>',{class:''});
    this.tab5_base_num_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'7em'}});
    this.tab5_loco_par_inst_select_filter = $('<select>',{class:''});
    this.tab5_loco_select_filter = $('<select>',{class:'',css:{'width':'13em'}});
    
    this.tab5_base_type_select_filter.append($('<option>',{'val':'','text':''}));
    this.tab5_loco_par_inst_select_filter.append($('<option>',{'val':'','text':''}));
    
    this.tab5_go_filter_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Поиск'))
        .on('click', function(){
            l_this.refresh_fuel_standart(false);
            create_info_modal_dialog_new('Оповещение','Поиск завершен!');
        });
    this.tab5_clear_filter_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Очистить'))
        .on('click', function(){
            l_this.tab5_date_filter.val('');
            l_this.tab5_base_type_select_filter.val('');
            l_this.tab5_base_num_filter.val('');
            l_this.tab5_loco_par_inst_select_filter.val('');
            l_this.tab5_loco_select_filter.val('');

        });
        
    init_date_time_input_short(this.tab5_date_filter);
    
    l_this.fuel_standart_spr.forEach(function(item){
        if (item.SPR_TYPE==='BASE_TYPE') {
            l_this.tab5_base_type_select_filter.append($('<option>',{'val':item.ELEM_ID,'text':item.ELEM_DESCR}));
        }
    });  
    
    var prev_value;
    l_this.fuel_loco.forEach(function(item){
        if (prev_value !== item.PAR_INSTANCE_ID) {
            l_this.tab5_loco_par_inst_select_filter.append($('<option>',{'val':item.PAR_INSTANCE_ID,'text':item.PAR_INSTANCE_NUMBER}));
        }
        prev_value = item.PAR_INSTANCE_ID;
    });
    this.tab5_loco_par_inst_select_filter.on('change', function (){
        var l_val = $(this).val();
        l_this.tab5_loco_select_filter.find('option').remove();
        l_this.tab5_loco_select_filter.append($('<option>',{'val':'','text':''}));
        l_this.fuel_loco.forEach(function(item){
            if (item.PAR_INSTANCE_ID == l_val) {
                l_this.tab5_loco_select_filter.append($('<option>',{'val':item.INSTANCE_ID,'text':item.INSTANCE_NUMBER+'_'+item.CATEGORY}));
            }
        });
    });
    
    this.tab5_filter_div = $('<div>')
        .addClass('route-filter-div')
        .append($('<label>',{text:'основание',class:'route-window-attr-item-text'}))
        .append(this.tab5_base_type_select_filter)
        .append($('<label>',{text:'номер',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab5_base_num_filter)
        .append($('<label>',{text:'категория',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab5_loco_par_inst_select_filter)
        .append($('<label>',{text:'локомотив',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab5_loco_select_filter)
        .append($('<label>',{text:'дата контроля',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab5_date_filter)
        .append(this.tab5_go_filter_btn)
        .append(this.tab5_clear_filter_btn)
        .appendTo(this.tab5_section);
    
    var fuel_standart_table = $('<table>')
        .addClass('route-table')
        .appendTo(this.tab5_section);

    $('<thead>')
        .appendTo(fuel_standart_table)
        .append($('<tr>')
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Основание').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Номер').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Дата по приказу/приказа').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Номер актива').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Время').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Норма расхода').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Коэф. пересчета').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Груз. работа, л/ч').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Манев. работа, л/ч').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Горячий простой, л/ч').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('В ремонте, л/ч').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Обкат, л/ч').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Прочие, л/ч').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Период контроля норм').attr('colspan','2')))
        .append($('<tr>')
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('с'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('по')));
    this.fuel_standart_table_body = $('<tbody>')
        .appendTo(fuel_standart_table);    
    
    this.fuel_standart_mas = [];    
        
    this.add_fuel_standart_to_table = function(p_fuel_standart){
        var l_fuel_standart = $('<tr>').appendTo(l_this.fuel_standart_table_body);
        l_fuel_standart.row_id = p_fuel_standart.ROW_ID;
        l_fuel_standart.pos = l_this.fuel_standart_mas.length;
        l_this.fuel_standart_mas[l_fuel_standart.pos] = l_fuel_standart;
        
        l_fuel_standart.data = p_fuel_standart;
        
        l_fuel_standart.base_type_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.BASE_TYPE_DESCR===null?'':p_fuel_standart.BASE_TYPE_DESCR)).addClass('reference-text');
        l_fuel_standart.base_num_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.BASE_NUM===null?'':p_fuel_standart.BASE_NUM));
        l_fuel_standart.base_date_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.BASE_DATE===null?'':p_fuel_standart.BASE_DATE));
        l_fuel_standart.instance_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.INSTANCE_DESCR===null?'':p_fuel_standart.INSTANCE_DESCR));
        l_fuel_standart.season_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.SEASON_DESCR===null?'':p_fuel_standart.SEASON_DESCR));
        l_fuel_standart.cons_rate_type_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.CONS_RATE_TYPE_DESCR===null?'':p_fuel_standart.CONS_RATE_TYPE_DESCR));
        l_fuel_standart.base_date_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.CONVERSION_FACTOR===null?'':p_fuel_standart.CONVERSION_FACTOR));
        l_fuel_standart.freight_work_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.FREIGHT_WORK===null?'':p_fuel_standart.FREIGHT_WORK));
        l_fuel_standart.shunting_work_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.SHUNTING_WORK===null?'':p_fuel_standart.SHUNTING_WORK));
        l_fuel_standart.hot_simple_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.HOT_SIMPLE===null?'':p_fuel_standart.HOT_SIMPLE));
        l_fuel_standart.under_repair_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.UNDER_REPAIR===null?'':p_fuel_standart.UNDER_REPAIR));
        l_fuel_standart.rounding_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.ROUNDING===null?'':p_fuel_standart.ROUNDING));
        l_fuel_standart.other_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.OTHER===null?'':p_fuel_standart.OTHER));
        l_fuel_standart.contr_date_from_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.CONTR_DATE_FROM===null?'':p_fuel_standart.CONTR_DATE_FROM));
        l_fuel_standart.contr_date_to_td = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.CONTR_DATE_TO===null?'':p_fuel_standart.CONTR_DATE_TO));
        
        l_fuel_standart.base_type_td.on('click', function(){open_fuel_standart_window(l_this,l_fuel_standart);});
        
        return l_fuel_standart;
    };
    
    this.refresh_fuel_standart = function(p_async){
        start_loading_animation();
        var l_param = {};
        
        l_param.base_type = l_this.tab5_base_type_select_filter.val();
        l_param.base_num = l_this.tab5_base_num_filter.val();
        l_param.loco_par_inst = l_this.tab5_loco_par_inst_select_filter.val();
        l_param.loco = l_this.tab5_loco_select_filter.val();
        l_param.date = l_this.tab5_date_filter.val();
        
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: p_async,
            data: { params: JSON.stringify(l_param)
                   ,ajax_action: 'get_fuel_standart'
                  },
            success: function (data) {
                var l_fuel_standart = JSON.parse(data);
                l_fuel_standart.forEach(function (item){
                    var l_exists_item = false;
                    l_this.fuel_standart_mas.forEach(function(fuel_standart){
                        if (item.ROW_ID == fuel_standart.row_id){
                            l_exists_item = true;
                            if (fuel_standart.data.LAST_UPDATE_DATE != item.LAST_UPDATE_DATE){
                                fuel_standart.data = item;
                                
                                fuel_standart.base_type_td.text((item.BASE_TYPE_DESCR===null?'':item.BASE_TYPE_DESCR));
                                fuel_standart.base_num_td.text((item.BASE_NUM===null?'':item.BASE_NUM));
                                fuel_standart.base_date_td.text((item.BASE_DATE===null?'':item.BASE_DATE));
                                fuel_standart.instance_td.text((item.INSTANCE_DESCR===null?'':item.INSTANCE_DESCR));
                                fuel_standart.season_td.text((item.SEASON_DESCR===null?'':item.SEASON_DESCR));
                                fuel_standart.cons_rate_type_td.text((item.CONS_RATE_TYPE_DESCR===null?'':item.CONS_RATE_TYPE_DESCR));
                                fuel_standart.base_date_td.text((item.CONVERSION_FACTOR===null?'':item.CONVERSION_FACTOR));
                                fuel_standart.freight_work_td.text((item.FREIGHT_WORK===null?'':item.FREIGHT_WORK));
                                fuel_standart.shunting_work_td.text((item.SHUNTING_WORK===null?'':item.SHUNTING_WORK));
                                fuel_standart.hot_simple_td.text((item.HOT_SIMPLE===null?'':item.HOT_SIMPLE));
                                fuel_standart.under_repair_td.text((item.UNDER_REPAIR===null?'':item.UNDER_REPAIR));
                                fuel_standart.rounding_td.text((item.ROUNDING===null?'':item.ROUNDING));
                                fuel_standart.other_td.text((item.OTHER===null?'':item.OTHER));
                                fuel_standart.contr_date_from_td.text((item.CONTR_DATE_FROM===null?'':item.CONTR_DATE_FROM));
                                fuel_standart.contr_date_to_td.text((item.CONTR_DATE_TO===null?'':item.CONTR_DATE_TO));
                            }
                        }
                    });
                    if (!l_exists_item) {
                        var l_cur_fuel_standart = l_this.add_fuel_standart_to_table(item);
                    }
                });
                
                l_this.fuel_standart_mas.forEach(function(fuel_standart){
                    var l_exists_item = false;
                    l_fuel_standart.forEach(function (item){
                        if (item.ROW_ID == fuel_standart.row_id){
                            l_exists_item=true;
                        }
                    });
                    if (!l_exists_item) {
                        fuel_standart.remove();
                        delete l_this.fuel_standart_mas[fuel_standart.pos];
                    }
                });
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        }); 
        stop_loading_animation();
    };
    
    l_this.refresh_fuel_standart(false);
});

function create_route_operations_window(p_document,p_route_id){
    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .attr('id','modalDialog')
        .appendTo('body');
    md_content.attr('title','Детализация');
    
    var return_table = $('<div>');
    return_table.append(
        '<table class="cars_table route-operation-descr-table">'+
            '<thead>'+
                '<tr>'+
                    '<th>Дата с</th>'+
                    '<th>Дата по</th>'+
                    '<th>Время (мин)</th>'+
                    '<th>Операция</th>'+
                    '<th>Тип операции</th>'+
                '</tr>'+
            '</thead>'+
        '</table>'
    );
    
    return_table.table_body = $('<table>',{class:'cars_table route-operation-descr-table'}).append($('<tbody>'));
    return_table.append(
        $('<div>',{class:'modalDialogContainer',css:{'display':'inline-block','width':'610px','max-height':'400px','height':'400px'}})  
        .append(return_table.table_body)
    );
    
    $.ajax({
        url: '/data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { route_id: p_route_id
               ,ajax_action: 'get_route_operation_details'
              },
        success: function (data) {
            var l_routes = JSON.parse(data);
            l_routes.forEach(function (item){
                var tr = $('<tr/>');
                tr.append('<td>'+((item.GENERAL_DATE_FROM !== null) ? item.GENERAL_DATE_FROM : '')+'</td>');
                tr.append('<td>'+((item.GENERAL_DATE_TO !== null) ? item.GENERAL_DATE_TO : '')+'</td>');
                tr.append('<td>'+((item.DIFF_TIME !== null) ? item.DIFF_TIME : '')+'</td>');
                tr.append('<td>'+((item.OPER_DESCR !== null) ? item.OPER_DESCR : '')+'</td>');
                tr.append('<td>'+((item.OPER_TYPE !== null) ? item.OPER_TYPE : '')+'</td>');
                
                tr.appendTo(return_table.table_body); 
            });
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
    
    md_content.append(return_table);
    
    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Закрыть форму': {
                text:'Закрыть',
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
}

function create_route_window_add(p_document,p_route_item){
    function save_route_add_ajax(){
        var l_route = p_route_item.data.ROUTE_ID;

        var res = null;
        $.ajax({
            url: '/data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { route_id: l_route
                   ,fuel_in: md_content.fuel_in_input.val()
                   ,fuel_out: md_content.fuel_out_input.val()
                   ,waiting: md_content.waiting_input.val()
                   ,waiting_hot: md_content.waiting_hot_input.val()
                   ,waiting_cold: md_content.waiting_cold_input.val()
                   ,excess_work: md_content.excess_work_input.val()
                   ,refill: md_content.refill_input.val()
                   ,fuel_in_input_who: md_content.fuel_in_who_input.val()
                   ,refill_who: md_content.refill_who_input.val()
                   ,fuel_out_input_who: md_content.fuel_out_who_input.val()
                   ,ajax_action: 'save_route_add'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }    
    
    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .appendTo('body');

    md_content.attr('title','Маршрут');

    md_content.number_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'20em'}}).attr('disabled',true);
    md_content.fuel_in_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'5em'}});
    md_content.fuel_out_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'5em'}});
    md_content.waiting_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'5em'}});
    md_content.waiting_hot_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'5em'}});
    md_content.waiting_cold_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'5em'}});
    md_content.excess_work_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'5em'}});
    md_content.refill_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'5em'}});
    md_content.fuel_in_who_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'15em'}});
    md_content.refill_who_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'15em'}});
    md_content.fuel_out_who_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'15em'}});
    
   
    md_content.number_input.val(p_route_item.data.ROUTE_NUM);
    md_content.fuel_in_input.val(p_route_item.data.FUEL_IN);
    md_content.fuel_out_input.val(p_route_item.data.FUEL_OUT);
    md_content.waiting_input.val(p_route_item.data.WAITING);
    md_content.waiting_hot_input.val(p_route_item.data.WAITING_HOT);
    md_content.waiting_cold_input.val(p_route_item.data.WAITING_COLD);
    md_content.excess_work_input.val(p_route_item.data.EXCESS_WORK); 
    md_content.refill_input.val(p_route_item.data.REFILL);
    md_content.fuel_in_who_input.val(p_route_item.data.FUEL_IN_WHO);
    md_content.refill_who_input.val(p_route_item.data.REFILL_WHO);
    md_content.fuel_out_who_input.val(p_route_item.data.FUEL_OUT_WHO);
    
    limit_input_only_numbers(md_content.fuel_in_input);
    limit_input_only_numbers(md_content.fuel_out_input);
    limit_input_only_numbers(md_content.waiting_input);
    limit_input_only_numbers(md_content.waiting_hot_input);
    limit_input_only_numbers(md_content.waiting_cold_input);
    limit_input_only_numbers(md_content.excess_work_input);
    limit_input_only_numbers(md_content.refill_input);

    var l_div_number = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Номер',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.number_input); 
    var l_div_refill = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Заправка,л',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.refill_input);
    var l_div_refill_who = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кто заправил(ФИО)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.refill_who_input);
    var l_div_fuel_in = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Приём,л',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.fuel_in_input);
    var l_div_fuel_in_who = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кто принял(ФИО)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.fuel_in_who_input);
    var l_div_fuel_out = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Сдача,л',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.fuel_out_input);
    var l_div_fuel_out_who = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кто сдал(ФИО)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.fuel_out_who_input);
    var l_div_waiting = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Ожидание(простой) (мин)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.waiting_input);
    var l_div_waiting_hot = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'В горячем состоянии (мин)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.waiting_hot_input);
    var l_div_waiting_cold = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'В холодном состоянии (мин)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.waiting_cold_input);
    var l_div_excess_work = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Сверхнормативная работа (мин)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.excess_work_input);

    $('<div>')
        .addClass('route-window-attr')
        .css({'width':'30em'})
        .append(l_div_number)
        .append(l_div_refill)
        .append(l_div_refill_who)
        .append(l_div_fuel_in)
        .append(l_div_fuel_in_who)
        .append(l_div_fuel_out)
        .append(l_div_fuel_out_who)
        .append(l_div_waiting)
        .append(l_div_waiting_hot)
        .append(l_div_waiting_cold)
        .append(l_div_excess_work)
        .appendTo(md_content);

    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Сохранить заявку':{
                text: "Сохранить",
                id: "md_save_route_btn",
                click: function(){    
                    var f_res = save_route_add_ajax();
                    var f_res_mas = f_res.split('$');
                    if (f_res_mas[0]=='done') {
                        var l_mes = '';

                        l_mes = 'Маршрут обновлен!';

                        p_document.tab4_refresh_routes(false);
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение',l_mes);/*функция из файла context_menu.js*/
                    }else{
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
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
}

function create_add_other_oper_window(p_document,p_action,p_flag_add_car,p_cars){
    function add_other_oper_ajax(p_action_id,p_date_from,p_date_to,p_routes,p_station,p_oper,p_oper_descr,p_descr,p_cars){
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { action_id: p_action_id
                   ,date_from: p_date_from
                   ,date_to: p_date_to
                   ,routes: p_routes
                   ,station: p_station
                   ,oper: p_oper
                   ,oper_descr: p_oper_descr
                   ,descr: p_descr
                   ,cars: p_cars
                   ,ajax_action: 'save_other_actions'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }      
    
    function disable_add_btn(){   
        var l_count = 0;
        l_list_of_cars_mas.forEach(function(item){
            l_count++;
        });
        
        var l_txt = l_estimated_time.val();
        
        if (l_date_from.hasClass('red_bckg_color')||l_date_from.val()==''||
            l_date_to.hasClass('red_bckg_color')||l_date_to.val()==''||
            l_txt.indexOf('-') != -1||
            l_route1.val()==''||l_station.val()==''||l_oper_type.val()==''||l_descr.val()==''||l_count==0||
            ((l_oper_type.val()=='13'||l_oper_type.val()=='14'||l_oper_type.val()=='12')&&l_oper_descr.val()=='')) {
            $('#md_add_other_oper_btn').prop( "disabled", true );
        }else{
            $('#md_add_other_oper_btn').prop( "disabled", false );
        }    
    }   
    
    var l_title = '';
    
    if (p_action == null){
        l_title = 'Добавление операции';
    }else{
        l_title = 'Изменение операции по вагону '+p_action.data.OBJ_NUMBER;
    }
    
    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .attr('id','modalDialog')
        .appendTo('body');
    md_content.attr('title',l_title);

    var l_date_from = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'9em'}});
    var l_date_to = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'9em'}});
    
    var l_estimated_time = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'9em'}}).prop('disabled',true);
    
    var l_route1 = $('<select>',{class:'required',css:{'width':'20em'}});
    var l_route2 = $('<select>',{class:'',css:{'width':'20em'}});
    var l_station = $('<select>',{class:'required'});
    var l_oper_type = $('<select>',{class:'required'});
    var l_oper_descr = $('<select>',{class:'required'});
    var l_descr = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'28em'}});
    
    init_date_time_input(l_date_from);
    init_date_time_input(l_date_to);
    l_station.append($('<option>',{'val':'','text':''}));
    l_oper_type.append($('<option>',{'val':'','text':''}));
    l_oper_descr.append($('<option>',{'val':'','text':''}));
    p_document.route_stations.forEach(function(item){
        if (item.ID != '1') {
            l_station.append($('<option>',{'val':item.ID,'text':item.NAME}));
        }
    });
    p_document.other_operations.forEach(function(item){
        l_oper_type.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    p_document.other_oper_descr.forEach(function(item){
        l_oper_descr.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    
    var l_date_from_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата выполнения работ с',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_date_from); 
    var l_date_to_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата выполнения работ по',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_date_to); 
    var l_estimated_time_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Расчетное время',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_estimated_time); 
    var l_route1_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Маршрут 1',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_route1); 
    var l_route2_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Маршрут 2',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_route2);
    var l_station_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Станция',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_station); 
    var l_oper_type_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Операция',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_oper_type); 
    var l_oper_descr_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Корпус',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_oper_descr); 
    var l_descr_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Описание',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_descr); 

    var div9 = $('<div>')
        .addClass('cars-item-div-list')
        .css({'margin-right':'0em'});
    var div9_1 = $('<div>')
        .appendTo(div9);
    $('<span>',{'text':'Номера вагонов',css:{'margin-right':'0.5em'}}).appendTo(div9_1);
    var l_car_number = $('<input>',{'maxlength':'8','class':'cars-item-input ui-widget-content ui-corner-all'})
        .appendTo(div9_1);
    l_car_number.on('keypress', function (e){
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
    l_car_number.on('keyup', function (e){        
        if (check_car_number($(this).val())){                
            $(this).addClass('true-car-number');
        } else{
            $(this).removeClass('true-car-number'); 
        }
    });

    var l_add_car_btn = $('<button>',{'class':'request-button cars-item-add-btn'})
        .append('<span class="">Добавить</span>')
        .appendTo(div9_1);
    var l_list_of_cars = $('<div>',{'class':'cars-item-list-of-cars helper-clearfix'})
        .appendTo(div9);
    
    l_car_number.autocomplete({
        source: function(request, response){
          // организуем кроссдоменный запрос 
          $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            // параметры запроса, передаваемые на сервер (последний - подстрока для поиска):
            data:{
                enter_text: request.term,
                ajax_action: 'get_suitable_cars'

            },
            // обработка успешного выполнения запроса
            success: function(data){
              // приведем полученные данные к необходимому формату и передадим в предоставленную функцию response
                //alert(data);
                var l_res = JSON.parse(data);

                response($.map(l_res, function(item){
                return{
                  label: item.ID,
                  value: item.ID
                };
              }));
            }
          });
        },
        minLength: 4
    });
    
    var l_list_of_cars_mas = [];
 
    function add_car(p_car_number){
        function get_info(p_car_number,p_info_type){
            var res;
            $.ajax({
                url: '/data.php',
                type: 'POST',
                dataType: "text",
                async:false,
                data: { car_number: p_car_number
                       ,info_type: p_info_type
                       ,ajax_action: 'get_info_for_car_request'
                      },
                success: function (data) {
                    res = data;
                },
                error: function (m1,m2) {window.alert(m1+m2);}
            });

            return res;
        };
        
        var l_freight = get_info(p_car_number,6);
        
        var l_car_descr = $('<div>',{'class':'cars-item-car-div','css':{'width':'18em'}}).appendTo(l_list_of_cars);
        l_car_descr.pos = l_list_of_cars_mas.length;
        l_list_of_cars_mas[l_car_descr.pos] = l_car_descr;
        

        
        l_car_descr.car_number = $('<input>',{'class':'cars-item-car-input text ui-widget-content ui-corner-all','readonly':'true','css':{'background':'#DCDCDC'}/*,'disabled':true*/}).val(p_car_number).appendTo(l_car_descr);
        l_car_descr.car_freight = $('<input>',{'class':'cars-item-freight-input text ui-widget-content ui-corner-all','disabled':true}).val(l_freight).appendTo(l_car_descr);  
        l_car_descr.remove_btn = $('<button>')
            .addClass('request-button cars-item-car-span-delete-button')
            .attr('title','Удалить вагон')
            .append('<span class="request-button-icon delete-button-icon"></span>')
            .appendTo(l_car_descr)
            .on('click', function(){
                l_car_descr.remove();
                delete l_list_of_cars_mas[l_car_descr.pos];
                disable_add_btn();
            });
    }
    
    l_add_car_btn.on('click', function(){
        if (l_car_number.hasClass('true-car-number')) {                             
            var l_car = l_car_number.val();
            add_car(l_car);
            l_car_number.val('');
            l_car_number.removeClass('true-car-number');
            disable_add_btn();
        }
    });

    function calc_estimate(){
        var l_sending_time = l_date_from.val();
        var l_arrival_time = l_date_to.val();
        
        var pattern = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2})\:(\d{2})/;
        var l_sending_time_d = new Date(l_sending_time.replace(pattern,'$3-$2-$1T$4:$5:00'));
        var l_arrival_time_d = new Date(l_arrival_time.replace(pattern,'$3-$2-$1T$4:$5:00'));
        
        var diff_hh = parseInt((l_arrival_time_d - l_sending_time_d)/1000/60/60);
        var diff_mi = ((l_arrival_time_d - l_sending_time_d)/1000/60)%60;
        
        l_estimated_time.val((diff_hh<0||diff_mi<0?'-':'')+Math.abs(diff_hh)+':'+Math.abs(diff_mi));  
    }

    l_date_from.on('blur',function(){calc_estimate(); disable_add_btn();});
    l_date_to.on('blur',function(){calc_estimate(); disable_add_btn();});
    l_route1.on('change', function(){disable_add_btn();});
    l_route2.on('change', function(){disable_add_btn();});
    l_station.on('change', function(){disable_add_btn();});
    l_oper_type.on('change', function(){
        if ($(this).val()== '13' || $(this).val()== '14'||$(this).val()== '12'){
            if ($(this).val()== '13' || $(this).val()== '14'){
                l_oper_descr.children('option[value="5"],option[value="6"],option[value="7"]').hide();
                l_oper_descr.children('option[value="1"],option[value="2"],option[value="3"],option[value="4"]').show();
            }else{
                l_oper_descr.children('option[value="1"],option[value="2"],option[value="3"],option[value="4"]').hide();
                l_oper_descr.children('option[value="5"],option[value="6"],option[value="7"]').show();
            }
            l_oper_descr_div.show();
        }else{
            l_oper_descr.val('');
            l_oper_descr_div.hide();
        }
        disable_add_btn();
    });
    l_oper_descr.on('change', function(){disable_add_btn();});
    l_descr.on('blur',function(){disable_add_btn();});
    
    $('<div>')
        .addClass('route-window-attr')
        .css({'width':'38.5em'})
        .append(l_date_from_div)
        .append(l_date_to_div)
        .append(l_estimated_time_div)
        .append(l_route1_div)
        .append(l_route2_div)
        .append(l_station_div)
        .append(l_oper_type_div)
        .append(l_oper_descr_div)
        .append(l_descr_div)
        .append(div9)
        .appendTo(md_content);
    
    if (p_cars != null && p_flag_add_car != null) {
        p_cars.forEach(function(car){
            l_car_number.val(car);
            l_car_number.addClass('true-car-number');
            l_add_car_btn.triggerHandler('click');
        });
    }
    
    l_oper_descr_div.hide();
    
    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Добавить':{
                text: "Добавить",
                id: "md_add_other_oper_btn",
                click: function(){ 
                    var l_cars = '';
                    l_list_of_cars_mas.forEach(function(item){
                        l_cars += item.car_number.val()+'$';
                    });
                    var l_routes = l_route1.val()+'$'+(l_route2.val()==null?'':l_route2.val());
                    
                    var l_action_id = (p_action == null?null:p_action.data.ACTION_ID);
                    
                    var f_res = add_other_oper_ajax(l_action_id,l_date_from.val(),l_date_to.val(),l_routes,l_station.val(),l_oper_type.val(),l_oper_descr.val(),l_descr.val(),l_cars);
                    var f_res_mas = f_res.split('$');
                    if (f_res_mas[0]==='done') {
                        if (p_action==null){
                            var act_mas = f_res_mas[1].split(',');
                            act_mas.pop();
                            act_mas.forEach(function(item) {
                                p_document.refresh_route_other_acts(item);
                            });
                        }else{
                            p_document.refresh_route_other_acts(p_action.data.ACTION_ID);
                            p_action.remove();
                        }

                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение','Операция завершилась успешно!');/*функция из файла context_menu.js*/
                    }else{
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
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
    
    if (p_action == null){
        l_date_from.val(p_document.tab3_date_from_filter.val());
        l_date_to.val(p_document.tab3_date_to_filter.val());
        l_station.val(p_document.tab3_station_select_filter.val());
        l_oper_type.val(p_document.tab3_oper_select_filter.val());
        
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            // параметры запроса, передаваемые на сервер (последний - подстрока для поиска):
            data:{
                date: l_date_from.val(),
                enter_text: '',
                ajax_action: 'get_suitable_routes'},
            // обработка успешного выполнения запроса
            success: function(data){
                var l_res = JSON.parse(data);
                l_route1.find('option').remove();
                l_route2.find('option').remove();
                l_route1.append($('<option>',{'val':'','text':''}));
                l_route2.append($('<option>',{'val':'','text':''}));
                l_res.forEach(function(item){
                    l_route1.append($('<option>',{'val':item.ID,'text':item.NAME}));
                    l_route2.append($('<option>',{'val':item.ID,'text':item.NAME}));
                });
            }
        }); 
        l_descr.trigger('focus');
        l_route1.val(p_document.tab3_route_select_filter.val());
    }else{
        l_date_from.val(p_action.data.GENERAL_DATE_FROM);
        l_date_to.val(p_action.data.GENERAL_DATE_TO);
        l_station.val(p_action.data.STATION_ID);
        l_oper_type.val(p_action.data.OPERATION_ID);
        l_descr.val(p_action.data.ACTION_DESC);
        
        l_route1.append($('<option>',{'val':p_action.data.ROUTE1_ID,'text':p_action.data.ROUTE1_DESC}));
        l_route1.val(p_action.data.ROUTE1_ID);
        if (p_action.data.ROUTE2_ID != null){
            l_route2.append($('<option>',{'val':p_action.data.ROUTE2_ID,'text':p_action.data.ROUTE2_DESC}));
            l_route2.val(p_action.data.ROUTE2_ID);
        }

        l_descr.trigger('focus');
        
        l_car_number.val(p_action.data.OBJ_NUMBER);
        l_car_number.addClass('true-car-number');
        l_add_car_btn.triggerHandler('click');
        div9.hide();
        
        if (p_document.get_flag_route_closed(p_action.data.ROUTE1_ID)||p_document.get_flag_route_closed(p_action.data.ROUTE2_ID)||!r_route_processing){
            $('#md_add_other_oper_btn').hide();
            l_date_from.prop('disabled',true);
            l_date_to.prop('disabled',true);
            l_route1.prop('disabled',true);
            l_route2.prop('disabled',true);
            l_station.prop('disabled',true);
            l_oper_type.prop('disabled',true);
            l_oper_descr.prop('disabled',true);
            l_descr.prop('disabled',true);
        }
    }
    
    l_date_from.on('blur',function(){
        if (!l_date_from.hasClass('red_bckg_color')&&l_date_from.val()!=''){
            $.ajax({
                url: '../data.php',
                type: 'POST',
                dataType: "text",
                async:false,
                // параметры запроса, передаваемые на сервер (последний - подстрока для поиска):
                data:{
                    date: l_date_from.val(),
                    enter_text: '',
                    ajax_action: 'get_suitable_routes'},
                // обработка успешного выполнения запроса
                success: function(data){
                    var l_res = JSON.parse(data);
                    l_route1.find('option').remove();
                    l_route2.find('option').remove();
                    l_route1.append($('<option>',{'val':'','text':''}));
                    l_route2.append($('<option>',{'val':'','text':''}));
                    l_res.forEach(function(item){
                        l_route1.append($('<option>',{'val':item.ID,'text':item.NAME}));
                        l_route2.append($('<option>',{'val':item.ID,'text':item.NAME}));
                    });
                }
            }); 
        }
    });   
    //l_date_from.triggerHandler('blur');
    
    if (p_action != null){
        $('#md_add_other_oper_btn span').text('Изменить');
    }
    
    disable_add_btn();
}  

function create_del_other_oper_window(p_document){
    function del_other_oper_ajax(p_actions){
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { actions: p_actions
                   ,ajax_action: 'del_other_actions'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }        
    
    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .attr('id','modalDialog')
        .append('<p>Удалить выбранные прочие операции?</p>')
        .appendTo('body');
    md_content.attr('title','Оповещение');
    
    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Добавить':{
                text: "Удалить",
                id: "md_add_route_btn",
                click: function(){    
                    var l_action = '';
                    p_document.route_other_act_content_mas.forEach(function(item){
                        if (item.checkbox.prop("checked")){
                            l_action += item.data.ACTION_ID+'$';
                        }
                    });
                    var f_res = del_other_oper_ajax(l_action);
                    if (f_res=='done') {
                        p_document.route_other_act_content_mas.forEach(function(item){
                            if (item.checkbox.prop('checked')){
                                item.remove();
                                delete p_document.route_other_act_content_mas[item.pos];
                            }
                        });
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение','Операция завершилась успешно!');/*функция из файла context_menu.js*/
                    }else{
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение','Невозможно удалить операции, т.к. они относятся к закрытым маршрутам!');
                    };
                }   
            },
            'Закрыть форму': {
                text:'Закрыть',
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
}

function create_add_route_window(p_document){   
    function save_route_links_ajax(p_actions,p_routes,p_date_from,p_date_to){
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { actions: p_actions
                   ,routes: p_routes
                   ,date_from: p_date_from
                   ,date_to: p_date_to
                   ,ajax_action: 'save_route_links'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }       
    function disable_add_btn(){   
        var l_txt = l_estimated_time.val();
        if (l_date_from.hasClass('red_bckg_color')||l_date_from.val()==''||
            l_date_to.hasClass('red_bckg_color')||l_date_to.val()==''||
            l_txt.indexOf('-') != -1||
            (l_route1.val()==''&&l_route2.val()=='')) {
            $('#md_add_route_btn').prop( "disabled", true );
        }else{
            $('#md_add_route_btn').prop( "disabled", false );
        }    
    }    
    
    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .attr('id','modalDialog')
        .appendTo('body');
    md_content.attr('title','Добавление маршрута');
    
    var l_route1 = $('<select>').css({'float':'right'});
    var l_route2 = $('<select>').css({'float':'right'});
    
    l_route1.append($('<option>',{'val':'','text':''}));
    l_route2.append($('<option>',{'val':'','text':''}));
    
    var l_date_from = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'9em'}});
    var l_date_to = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'9em'}});
    
    var l_estimated_time = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'9em'}}).prop('disabled',true);
    
    init_date_time_input(l_date_from);
    init_date_time_input(l_date_to);
    
    var l_route1_number_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Маршрут 1',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_route1); 
    var l_route2_number_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Маршрут 2',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_route2); 
    var l_date_from_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата с',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_date_from); 
    var l_date_to_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата по',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_date_to); 
    var l_estimated_time_div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Расчетное время',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(l_estimated_time); 

    $('<div>')
        .addClass('route-window-attr')
        .css({'width':'30em'})
        .append(l_route1_number_div)
        .append(l_route2_number_div)
        .append(l_date_from_div)
        .append(l_date_to_div)
        .append(l_estimated_time_div)
        .appendTo(md_content);

    p_document.route_act_content_mas.forEach(function(item){
        if (item.checkbox.prop("checked")){
            l_date_from.val(item.data.DATE_OPER_CUSTOM);
        }
    });
    
    $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async:false,
        // параметры запроса, передаваемые на сервер (последний - подстрока для поиска):
        data:{
            date: l_date_from.val(),
            enter_text: '',
            ajax_action: 'get_suitable_routes'},
        // обработка успешного выполнения запроса
        success: function(data){
            var l_res = JSON.parse(data);
            l_res.forEach(function(item){
                 l_route1.append($('<option>',{'val':item.ID,'text':item.NAME}));
                 l_route2.append($('<option>',{'val':item.ID,'text':item.NAME}));
            });
        }
    });
    
    l_route1.combobox();
    l_route2.combobox();
    
    function calc_estimate(){
        var l_sending_time = l_date_from.val();
        var l_arrival_time = l_date_to.val();
        
        var pattern = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2})\:(\d{2})/;
        var l_sending_time_d = new Date(l_sending_time.replace(pattern,'$3-$2-$1T$4:$5:00'));
        var l_arrival_time_d = new Date(l_arrival_time.replace(pattern,'$3-$2-$1T$4:$5:00'));
        
        var diff_hh = parseInt((l_arrival_time_d - l_sending_time_d)/1000/60/60);
        var diff_mi = ((l_arrival_time_d - l_sending_time_d)/1000/60)%60;
        
        l_estimated_time.val((diff_hh<0||diff_mi<0?'-':'')+Math.abs(diff_hh)+':'+Math.abs(diff_mi));  
    }
    
    l_date_from.on('blur',function(){calc_estimate(); disable_add_btn();});
    l_date_to.on('blur',function(){calc_estimate(); disable_add_btn();});
    l_route1.select(function(){disable_add_btn();});
    l_route2.select(function(){disable_add_btn();});    
    
    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Добавить':{
                text: "Добавить",
                id: "md_add_route_btn",
                click: function(){    
                    var l_action = '';
                    p_document.route_act_content_mas.forEach(function(item){
                        if (item.checkbox.prop("checked")){
                            l_action += item.data.OPERATION_ID+'|'+item.data.ACTION_ID+'$';
                        }
                    });
                    var p_oper = l_route1.val()+'$'+l_route2.val();
                    var f_res = save_route_links_ajax(l_action,p_oper,l_date_from.val(),l_date_to.val());
                    if (f_res=='done') {
                        p_document.route_act_content_mas.forEach(function(item){
                            if (item.checkbox.prop('checked')){
                                item.route_td.text(l_route1.find('option:selected').text()+', '+l_route2.find('option:selected').text());
                                item.checkbox.prop('checked',false);
                            }
                        });
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение','Операция завершилась успешно!');/*функция из файла context_menu.js*/
                    }else{
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
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
    disable_add_btn();
}

function create_del_route_window(p_document){
    function del_route_links_ajax(p_actions){
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { actions: p_actions
                   ,ajax_action: 'del_route_links'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }        
    
    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .attr('id','modalDialog')
        .append('<p>Убрать маршрут с выбранных операций?</p>')
        .appendTo('body');
    md_content.attr('title','Оповещение');
    
    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Добавить':{
                text: "Убрать",
                id: "md_add_route_btn",
                click: function(){    
                    var l_action = '';
                    p_document.route_act_content_mas.forEach(function(item){
                        if (item.checkbox.prop("checked")){
                            l_action += item.data.OPERATION_ID+'|'+item.data.ACTION_ID+'$';
                        }
                    });
                    var f_res = del_route_links_ajax(l_action);
                    if (f_res=='done') {
                        p_document.route_act_content_mas.forEach(function(item){
                            if (item.checkbox.prop('checked')){
                                item.route_td.text('');
                                item.route_time_td.text('');
                                item.checkbox.prop('checked',false);
                            }
                        });
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение','Операция завершилась успешно!');/*функция из файла context_menu.js*/
                    }else{
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение','Невозможно удалить операции, т.к. они относятся к закрытым маршрутам!');
                    };
                }   
            },
            'Закрыть форму': {
                text:'Закрыть',
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
}  

function create_route_window(p_document,p_route_item){
    if (p_document.route_statuses.length == 0) {
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_route_statuses'},
            success: function (data) {p_document.route_statuses = JSON.parse(data);}
        });
    }
    if (p_document.route_smena.length == 0) {
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_route_smena'},
            success: function (data) {p_document.route_smena = JSON.parse(data);}
        });
    }
    if (p_document.route_stations.length == 0) {
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'returnStations'},
            success: function (data) {p_document.route_stations = JSON.parse(data);}
        });
    }
    if (p_document.gt_employees.length == 0) {
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_users_for_route'},
            success: function (data) {p_document.gt_employees = JSON.parse(data);}
        });
    }
    if (p_document.conductors.length == 0) {
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_conductors'},
            success: function (data) {p_document.conductors = JSON.parse(data);}
        });
    }
    if (p_document.train_drivers.length == 0) {
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_train_drivers'},
            success: function (data) {p_document.train_drivers = JSON.parse(data);}
        });
    }
    if (p_document.locomotives.length == 0) {
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_locomotives_from_oebs'},
            success: function (data) {p_document.locomotives = JSON.parse(data);}
        });
    }

    function disable_save_btn(){        
        if (md_content.date_from_input.hasClass('red_bckg_color')||md_content.date_from_input.val()==''||
            md_content.date_to_input.hasClass('red_bckg_color')||md_content.date_to_input.val()==''||
            md_content.route_gave_select.val()==''||
            md_content.loco_select.val()=='') {
            $('#md_save_route_btn').prop( "disabled", true );
        }else{
            $('#md_save_route_btn').prop( "disabled", false );
        }    
    }
    function save_route_ajax(){
        var l_route = '';
        if (p_route_item != null){
            l_route = p_route_item.data.ROUTE_ID;
        }
        
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { route_id: l_route
                   ,date_from: md_content.date_from_input.val()
                   ,date_to: md_content.date_to_input.val()
                   ,status: md_content.status_select.val()
                   ,smena: md_content.smena_select.val()
                   ,station: md_content.station_select.val()
                   ,station_officer: md_content.station_officer_select.val()
                   ,route_gave: md_content.route_gave_select.val()
                   ,loco: md_content.loco_select.val()
                   ,driver1: md_content.driver1_select.val()
                   ,driver2: md_content.driver2_select.val()
                   ,conductor: md_content.conductor_select.val()
                   ,com: md_content.com_input.val()
                   ,ajax_action: 'save_route'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }

    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .appendTo('body');

    var l_title = 'Маршрут';

    md_content.attr('title',l_title);

    md_content.number_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'20em'}}).attr('disabled',true);
    md_content.status_select = $('<select>',{class:'route-window-attr-item-elem'}).attr('disabled',true); 
    md_content.date_from_input = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'9em'}});  
    md_content.date_to_input = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'9em'}});
    md_content.smena_select = $('<select>',{class:'route-window-attr-item-elem'});
    md_content.station_select = $('<select>',{class:'route-window-attr-item-elem'});
    md_content.station_officer_select = $('<select>',{class:'route-window-attr-item-elem'});
    md_content.route_gave_select = $('<select>',{class:'route-window-attr-item-elem required'});
    md_content.loco_select = $('<select>',{class:'route-window-attr-item-elem required'});
    md_content.driver1_select = $('<select>',{class:'route-window-attr-item-elem'});
    md_content.driver2_select = $('<select>',{class:'route-window-attr-item-elem'});
    md_content.conductor_select = $('<select>',{class:'route-window-attr-item-elem'});
    md_content.com_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'20em'}});
    
    md_content.loco_select.append($('<option>',{'val':'','text':''}));
    md_content.station_officer_select.append($('<option>',{'val':'','text':''}));
    md_content.route_gave_select.append($('<option>',{'val':'','text':''}));
    md_content.driver1_select.append($('<option>',{'val':'','text':''}));
    md_content.driver2_select.append($('<option>',{'val':'','text':''}));
    md_content.conductor_select.append($('<option>',{'val':'','text':''}));

    p_document.route_statuses.forEach(function(item){
         md_content.status_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    p_document.route_smena.forEach(function(item){
         md_content.smena_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    p_document.route_stations.forEach(function(item){
        if (item.ID != '1') {
            md_content.station_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
        }
    });
    p_document.gt_employees.forEach(function(item){
		var selected_gave;
		var l_option_gave = $('<option>').text(item.NAME).val(item.ID);
		var l_option_officer = $('<option>').text(item.NAME).val(item.ID);
		var f_res_mas = item.SECTION.split('$');
		
		if (contains(f_res_mas,'STATION_OFFICER_SELECT')) {
			$(l_option_officer).attr('selected','selected');
		}
		if (contains(f_res_mas,'ROUTE_GAVE_SELECT')){
			$(l_option_gave).attr('selected','selected');
		}
		
        md_content.station_officer_select.append(l_option_officer);
		md_content.route_gave_select.append(l_option_gave);
		 
    });
    p_document.locomotives.forEach(function(item){
		if (item.MAINTAINABLE_FLAG === 'Y'){
			md_content.loco_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
		}
    });
    p_document.train_drivers.forEach(function(item){
         md_content.driver1_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
         md_content.driver2_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    p_document.conductors.forEach(function(item){
         md_content.conductor_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });

    init_date_time_input(md_content.date_from_input);
    init_date_time_input(md_content.date_to_input);

    //md_content.route_gave_select.val('243');

    var l_div_number = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Номер',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.number_input); 
    var l_div_status = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Статус',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.status_select);
    var l_div_date_from_to = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата(мск): c',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.date_from_input)
        .append($('<label>',{text:'по',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(md_content.date_to_input);
    var l_div_smena = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Смена',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.smena_select);
    var l_div_station = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Станция',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.station_select);
    var l_div_station_officer = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дежурный по станции',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.station_officer_select);
    var l_div_route_gave = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Маршрут выдал',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.route_gave_select);
    var l_div_loco = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Локомотив',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.loco_select);
    var l_div_driver1 = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Машинист',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.driver1_select);
    var l_div_driver2 = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Помошник машиниста',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.driver2_select);
    var l_div_conductor= $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Кондуктор',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.conductor_select);
    var l_div_com = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Комментарий',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.com_input); 

    $('<div>')
        .addClass('route-window-attr')
        .css({'width':'30em'})
        .append(l_div_number)
        .append(l_div_status)
        .append(l_div_date_from_to)
        .append(l_div_smena)
        .append(l_div_station)
        .append(l_div_station_officer)
        .append(l_div_route_gave)
        .append(l_div_loco)
        .append(l_div_driver1)
        .append(l_div_driver2)
        .append(l_div_conductor)
        .append(l_div_com)
        .appendTo(md_content);
    
    if (p_route_item != null){
        md_content.number_input.val(p_route_item.data.ROUTE_NUM);
        md_content.status_select.val(p_route_item.data.STATUS);
        md_content.date_from_input.val(p_route_item.data.DATE_FROM);
        md_content.date_to_input.val(p_route_item.data.DATE_TO);
        md_content.smena_select.val(p_route_item.data.SMENA);
        md_content.station_select.val(p_route_item.data.STATION);
        md_content.station_officer_select.val(p_route_item.data.STATION_OFFICER);
        md_content.route_gave_select.val(p_route_item.data.ROUTE_GAVE);
        md_content.loco_select.val(p_route_item.data.LOCO);
        md_content.driver1_select.val(p_route_item.data.DRIVER1);
        md_content.driver2_select.val(p_route_item.data.DRIVER2);
        md_content.conductor_select.val(p_route_item.data.CONDUCTOR);
        md_content.com_input.val(p_route_item.data.COM);
    }
    
    /*обработка обязательных полей на изменение*/
    md_content.date_from_input.on('blur',function(){
        disable_save_btn();
    });
    md_content.date_to_input.on('blur',function(){
        disable_save_btn();
    });
    md_content.route_gave_select.on('change', function(){
        disable_save_btn();
    });
    md_content.loco_select.on('change', function(){
        disable_save_btn();
    });
    
    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Сохранить заявку':{
                text: "Сохранить",
                id: "md_save_route_btn",
                click: function(){    
                    var f_res = save_route_ajax();
                    var f_res_mas = f_res.split('$');
                    if (f_res_mas[0]=='done') {
                        var l_mes = '';
                        if (p_route_item == null){
                            l_mes = 'Маршрут создан!';
                        } else{
                            l_mes = 'Маршрут обновлен!';
                        }
                        p_document.refresh_routes(false);
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение',l_mes);/*функция из файла context_menu.js*/
                    }else if(f_res_mas[0]=='mistake'){
                        if (p_route_item == null){
                            l_mes = 'Создать';
                        } else{
                            l_mes = 'Обновить';
                        }
                        l_mes += ' маршрут не возможно! Так как существуют пересекающиеся маршруты: ';
                        l_mes += f_res_mas[1];
                        create_info_modal_dialog_new('Оповещение',l_mes);/*функция из файла context_menu.js*/
                    }else{
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    };
                }   
            },
            'Изменить статус':{
                text: "Изм. статус",
                id: "md_change_status_route_btn",
                click: function(){  
                    function save_route_status_ajax(){
                        var res = null;
                        $.ajax({
                            url: '../data.php',
                            type: 'POST',
                            dataType: "text",
                            async:false,
                            data: { route_id: p_route_item.data.ROUTE_ID
                                   ,status: md_lvl_2_content.status_select.val()
                                   ,status_descr: md_lvl_2_content.status_descr_input.val()
                                   ,ajax_action: 'save_route_status'},
                            success: function (data) {
                                res = data;
                            },
                            error: function (m1,m2) {window.alert(m1+m2);}
                        });
                        return res;
                    }
                    
                    var md_lvl_2_content = $('<div/>')
                        .addClass('md-lvl-2')
                        .attr('title','Изменение статуса маршрута')
                        .appendTo('body');
                    md_lvl_2_content.status_select = $('<select>',{class:'route-window-attr-item-elem'});
                    md_lvl_2_content.status_descr_input = $('<input>',{class:'route-window-attr-item-elem ui-widget-content ui-corner-all',css:{'width':'20em'}});
                    
                    p_document.route_statuses.forEach(function(item){
                        if (item.ID != md_content.status_select.val()){
                            md_lvl_2_content.status_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
                        }
                    });
                    
                    var l_div_status = $('<div>')
                        .addClass('request-window-attr-item helper-clearfix')
                        .append($('<label>',{text:'Статус',class:'request-window-attr-item-text'}))
                        .append(md_lvl_2_content.status_select);
                    var l_div_status_descr = $('<div>')
                        .addClass('request-window-attr-item helper-clearfix')
                        .append($('<label>',{text:'Комментарий',class:'request-window-attr-item-text'}))
                        .append(md_lvl_2_content.status_descr_input);
                
                    $('<div>')
                        .addClass('route-window-attr')
                        .append(l_div_status)
                        .append(l_div_status_descr)
                        .appendTo(md_lvl_2_content);
                
                    md_lvl_2_content.dialog({
                        resizable:false,
                        modal:true,
                        width: 'auto',
                        buttons:{
                            'Сохранить': {
                                text: "Сохранить",
                                id: "md_save_route_status_btn",
                                click: function(){
                                    md_content.dialog("close");
                                    md_lvl_2_content.dialog("close");
                                    
                                    var f_res = save_route_status_ajax();
                                    var f_res_mas = f_res.split('|');

                                    if (f_res_mas[0]=='done'){
                                        p_document.refresh_routes(false);
                                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');/*функция из файла context_menu.js*/
                                    }else{
                                        create_info_modal_dialog_new('Ошибка',f_res_mas[1]);
                                    }
                                }   
                            },
                            'Закрыть': function(){
                                md_lvl_2_content.dialog("close");
                            }
                        },
                        close: function() {
                            md_lvl_2_content.remove();
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
    
    disable_save_btn();
    if (p_route_item == null){
        $('#md_change_status_route_btn').hide();
    }else{
        if (!r_route_add||p_route_item.data.STATUS == '3' ||p_route_item.data.STATUS == '5') {
            md_content.date_from_input.prop( "disabled", true );
            md_content.date_to_input.prop( "disabled", true );
            md_content.smena_select.prop( "disabled", true );
            md_content.station_select.prop( "disabled", true );
            md_content.station_officer_select.prop( "disabled", true );
            md_content.route_gave_select.prop( "disabled", true );
            md_content.loco_select.prop( "disabled", true );
            md_content.driver1_select.prop( "disabled", true );
            md_content.driver2_select.prop( "disabled", true );
            md_content.conductor_select.prop( "disabled", true );
            md_content.com_input.prop( "disabled", true );
            $('#md_save_route_btn').hide();
        }
        if ((p_route_item.data.STATUS == '3' ||p_route_item.data.STATUS == '5') && !r_route_closing ){
            $('#md_change_status_route_btn').hide();
        }
    }
    
}

function open_fuel_standart_window(p_document,p_fuel_standart){
    function save_fuel_standart_ajax(){
        var l_row_id = '';
        if (p_fuel_standart != null){
            l_row_id = p_fuel_standart.data.ROW_ID;
        }
        
        var l_param = {};
        l_param.base_type = md_content.base_type_select.val();
        l_param.base_num = md_content.base_num_input.val();
        l_param.base_date = md_content.base_date_input.val();
        l_param.date_to = md_content.date_to_input.val();
        l_param.base_descr = md_content.base_descr_input.val();
        l_param.loco = md_content.loco_select.val();
        l_param.season = md_content.season_select.val();
        l_param.cons_rate_type = md_content.cons_rate_type_select.val();
        l_param.fuel_type = md_content.fuel_type_select.val();
        l_param.conversion_factor = md_content.conversion_factor_input.val();
        l_param.freight_work = md_content.freight_work_input.val();
        l_param.shunting_work = md_content.shunting_work_input.val();
        l_param.hot_simple = md_content.hot_simple_input.val();
        l_param.under_repair = md_content.under_repair_input.val();
        l_param.rounding = md_content.rounding_input.val();
        l_param.other = md_content.other_input.val();
        l_param.contr_date_from = md_content.contr_date_from_input.val();
        l_param.contr_date_to = md_content.contr_date_to_input.val();
        l_param.term = md_content.term_input.val();
        l_param.doc = md_content.doc_input.val();
        l_param.comm = md_content.comm_input.val();
        
        //alert(JSON.stringify(l_param));
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { row_id: l_row_id
                   ,add_data: JSON.stringify(l_param)
                   ,ajax_action: 'save_fuel_standart'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }
    
    function disable_save_btn(){
        if (md_content.base_type_select.val()==''||md_content.base_num_input.val()==''||md_content.loco_select.val()==''||
            md_content.base_date_input.hasClass('red_bckg_color')||md_content.base_date_input.val()==''||
            md_content.contr_date_from_input.hasClass('red_bckg_color')||md_content.contr_date_from_input.val()==''){
            $('#md_save_fuel_standart_btn').prop( "disabled", true );
        }else{
            $('#md_save_fuel_standart_btn').prop( "disabled", false );
        }
    }  
    
    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .appendTo('body');

    var l_title = 'Норма расхода ГСМ';

    md_content.attr('title',l_title);    
    
    md_content.base_type_select = $('<select>',{class:'route-window-attr-item-elem required'});
    md_content.base_num_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all required',css:{'width':'15em'}});
    md_content.base_date_input = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'7em'}});
    md_content.date_to_input = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'7em'}});
    md_content.base_descr_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'20em'}});
    md_content.loco_select = $('<select>',{class:'route-window-attr-item-elem required'});
    md_content.season_select = $('<select>',{class:'route-window-attr-item-elem'});
    md_content.cons_rate_type_select = $('<select>',{class:'route-window-attr-item-elem'});
    md_content.fuel_type_select = $('<select>',{class:'route-window-attr-item-elem'});
    md_content.conversion_factor_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'10em'}});
    md_content.freight_work_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'10em'}});
    md_content.shunting_work_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'10em'}});
    md_content.hot_simple_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'10em'}});
    md_content.under_repair_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'10em'}});
    md_content.rounding_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'10em'}});
    md_content.other_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'10em'}});
    md_content.contr_date_from_input = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'7em'}});
    md_content.contr_date_to_input = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'7em'}});
    md_content.term_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'20em'}});
    md_content.doc_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'20em'}});
    md_content.comm_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'20em'}});
    
    md_content.base_type_select.append($('<option>',{'val':'','text':''}));
    md_content.loco_select.append($('<option>',{'val':'','text':''}));
    md_content.season_select.append($('<option>',{'val':'','text':''}));
    md_content.cons_rate_type_select.append($('<option>',{'val':'','text':''}));
    md_content.fuel_type_select.append($('<option>',{'val':'','text':''}));
   
    l_this.fuel_standart_spr.forEach(function(item){
        if (item.SPR_TYPE==='BASE_TYPE') {
            md_content.base_type_select.append($('<option>',{'val':item.ELEM_ID,'text':item.ELEM_DESCR}));
        } else if(item.SPR_TYPE==='SEASON'){
            md_content.season_select.append($('<option>',{'val':item.ELEM_ID,'text':item.ELEM_DESCR+' '+item.ELEM_ADD_INFO}));
        } else if(item.SPR_TYPE==='CONS_RATE_TYPE'){
            md_content.cons_rate_type_select.append($('<option>',{'val':item.ELEM_ID,'text':item.ELEM_DESCR}));
        }else if(item.SPR_TYPE==='FUEL_TYPE'){
            md_content.fuel_type_select.append($('<option>',{'val':item.ELEM_ID,'text':item.ELEM_DESCR}));
        }
    });      

    l_this.fuel_loco.forEach(function(item){
        md_content.loco_select.append($('<option>',{'val':item.INSTANCE_ID,'text':item.INSTANCE_NUMBER+'_'+item.CATEGORY}));
    });
    md_content.fuel_type_select.val(1);
    
    var l_div_base_type = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Основание',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.base_type_select); 
    var l_div_base_num = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Номер',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.base_num_input);
    var l_div_base_date = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата по приказу/приказа',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.base_date_input);
    var l_div_date_to = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'дата по',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.date_to_input);
    var l_div_base_descr = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Комментарий к приказу',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.base_descr_input);
    var l_div_loco = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Номер актива',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.loco_select);
    var l_div_season = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Время (зима/лето)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.season_select);
    var l_div_cons_rate_type = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Норма расхода',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.cons_rate_type_select);
    var l_div_fuel_type = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Вид топлива',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.fuel_type_select);
    var l_div_conversion_factor = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Коэффициент пересчета',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.conversion_factor_input);
    var l_div_freight_work = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Грузовая работа, л/час',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.freight_work_input);
    var l_div_shunting_work = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Маневровая работа, л/час',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.shunting_work_input);
    var l_div_hot_simple = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Горячий простой, л/час',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.hot_simple_input);
    var l_div_under_repair = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'В ремонте, л/час',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.under_repair_input);
    var l_div_rounding = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Обкат, л/час',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.rounding_input);
    var l_div_other = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Прочие, л/час',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.other_input);
    var l_div_contr_date_from = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Период контроля норм: с ',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.contr_date_from_input)
        .append($('<label>',{text:'по ',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(md_content.contr_date_to_input);
    var l_div_doc = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Срок',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.doc_input);
    var l_div_comm = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Комментарий к записи',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.comm_input); 
    
    $('<div>')
        .addClass('route-window-attr')
        .css({'width':'37em'})
        .append(l_div_base_type)
        .append(l_div_base_num)
        .append(l_div_base_date)
        .append(l_div_date_to)
        .append(l_div_base_descr)
        .append(l_div_loco)
        .append(l_div_season)
        .append(l_div_cons_rate_type)
        .append(l_div_fuel_type)
        .append(l_div_conversion_factor)
        .append(l_div_freight_work)
        .append(l_div_shunting_work)
        .append(l_div_hot_simple)
        .append(l_div_under_repair)
        .append(l_div_rounding)
        .append(l_div_other)
        .append(l_div_contr_date_from)
        .append(l_div_doc)
        .append(l_div_comm)
        .appendTo(md_content);    
    
    init_date_time_input_short(md_content.base_date_input);
    init_date_time_input_short(md_content.date_to_input);
    init_date_time_input_short(md_content.contr_date_from_input);
    init_date_time_input_short(md_content.contr_date_to_input);
    limit_input_only_numbers(md_content.conversion_factor_input);
    limit_input_only_numbers(md_content.freight_work_input);
    limit_input_only_numbers(md_content.shunting_work_input);
    limit_input_only_numbers(md_content.hot_simple_input);
    limit_input_only_numbers(md_content.under_repair_input);
    limit_input_only_numbers(md_content.rounding_input);
    limit_input_only_numbers(md_content.other_input);
    
    if (p_fuel_standart != null){
        md_content.base_type_select.val(p_fuel_standart.data.BASE_TYPE);
        md_content.base_num_input.val(p_fuel_standart.data.BASE_NUM);
        md_content.base_date_input.val(p_fuel_standart.data.BASE_DATE);
        md_content.date_to_input.val(p_fuel_standart.data.DATE_TO);
        md_content.base_descr_input.val(p_fuel_standart.data.BASE_DESCR);
        md_content.loco_select.val(p_fuel_standart.data.INSTANCE_ID);
        md_content.season_select.val(p_fuel_standart.data.SEASON);
        md_content.cons_rate_type_select.val(p_fuel_standart.data.CONS_RATE_TYPE);
        md_content.fuel_type_select.val(p_fuel_standart.data.FUEL_TYPE);
        md_content.conversion_factor_input.val(p_fuel_standart.data.CONVERSION_FACTOR);
        md_content.freight_work_input.val(p_fuel_standart.data.FREIGHT_WORK);
        md_content.shunting_work_input.val(p_fuel_standart.data.SHUNTING_WORK);
        md_content.hot_simple_input.val(p_fuel_standart.data.HOT_SIMPLE);
        md_content.under_repair_input.val(p_fuel_standart.data.UNDER_REPAIR);
        md_content.rounding_input.val(p_fuel_standart.data.ROUNDING);
        md_content.other_input.val(p_fuel_standart.data.OTHER);
        md_content.contr_date_from_input.val(p_fuel_standart.data.CONTR_DATE_FROM);
        md_content.contr_date_to_input.val(p_fuel_standart.data.CONTR_DATE_TO);
        md_content.term_input.val(p_fuel_standart.data.TERM);
        md_content.doc_input.val(p_fuel_standart.data.DOC);
        md_content.comm_input.val(p_fuel_standart.data.COMM);
    }
    
    md_content.base_type_select.on('change', function(){disable_save_btn();});
    md_content.base_num_input.on('blur',function(){disable_save_btn();});
    md_content.base_date_input.on('blur',function(){disable_save_btn();});
    md_content.loco_select.on('change', function(){disable_save_btn();});
    md_content.contr_date_from_input.on('blur',function(){disable_save_btn();});
    
    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Сохранить':{
                text: "Сохранить",
                id: "md_save_fuel_standart_btn",
                click: function(){   
                    $('#md_save_fuel_standart_btn').prop( "disabled", true );
                    var f_res = save_fuel_standart_ajax();
                    var f_res_mas = f_res.split('$');
                    if (f_res_mas[0]=='done') {
                        var l_mes = '';
                        if (p_fuel_standart == null){
                            l_mes = 'Норма создана!';
                        } else{
                            l_mes = 'Норма обновлена!';
                        }
                        p_document.refresh_fuel_standart(false);
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение',l_mes);
                    }else{
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
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
    
    disable_save_btn();
}