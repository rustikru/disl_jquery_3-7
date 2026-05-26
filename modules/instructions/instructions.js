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
	this.control_color = [];
	this.code_cause = [];
	
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
	// Цвета
	 $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_car_color_select'},
        success: function (data) {l_this.control_color = JSON.parse(data);}
    }); 
	// Причины
	 $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_control_code_cause'},
        success: function (data) {l_this.code_cause = JSON.parse(data);}
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
    
    var l_date = get_server_current_time();
    var l_date_from = add_day_to_date_trunc(l_date,0);
    var l_date_to = add_day_to_date_trunc(l_date,1);
    /****************************************************************** Контроль вагонов ******************************************************************/
    this.tab5 = $('#tabs-5');
    
    this.tab5_section = $('<div>')
        .addClass('section')
        .css({'width':'auto','float':'none','height':'90vh'})
        .appendTo(this.tab5);
    
    this.tab5_fuel_standart_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em','margin-right':'0.5em','margin-top':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-3').text('Добавить контроль'))
        .appendTo(this.tab5_section)
        .on('click', function(){
            open_fuel_standart_window(l_this);
        });
    
    this.tab5_date_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'7em'}}).val(trunc_date(l_date));
	this.tab5_date_to_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'7em'}});
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
			l_this.tab5_date_to_filter.val('');
            l_this.tab5_base_type_select_filter.val('');
            l_this.tab5_base_num_filter.val('');
            l_this.tab5_loco_par_inst_select_filter.val('');
            l_this.tab5_loco_select_filter.val('');

        });
        
    init_date_time_input_short(this.tab5_date_filter);
	init_date_time_input_short(this.tab5_date_to_filter);
    
    l_this.code_cause.forEach(function(item){
        l_this.tab5_base_type_select_filter.append($('<option>',{'val':item.ID,'text':item.CODE+' ('+item.DESCRIPTION+')'}));
    });  
    
    var prev_value;
    l_this.control_color.forEach(function(item){
		var l_option = $('<option>').text(item.DESCRIPTION).val(item.ID).css({'background':item.CODE});
		//l_this.tab5_loco_par_inst_select_filter.append($('<option>',{'val':item.ID,'text':item.DESCRIPTION}));
		l_this.tab5_loco_par_inst_select_filter.append(l_option);
    });
    
    this.tab5_filter_div = $('<div>')
        .addClass('route-filter-div')
		.append($('<label>',{text:'Вагон',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab5_base_num_filter)
        .append($('<label>',{text:' Код причины',class:'route-window-attr-item-text'}))
        .append(this.tab5_base_type_select_filter)
        .append($('<label>',{text:'Цвет',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab5_loco_par_inst_select_filter)
        //.append($('<label>',{text:'локомотив',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        //.append(this.tab5_loco_select_filter)
        .append($('<label>',{text:'Дата контроля',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.tab5_date_filter)
		//.append($('<label>',{text:'по',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        //.append(this.tab5_date_to_filter)
        .append(this.tab5_go_filter_btn)
        .append(this.tab5_clear_filter_btn)
        .appendTo(this.tab5_section);
    
    var fuel_standart_table = $('<table>')
        .addClass('route-table')
        .appendTo(this.tab5_section);

    $('<thead>')
        .appendTo(fuel_standart_table)
        .append($('<tr>')
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Номер вагона').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Дата создания').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Кто создал').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Код причины').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Описание').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Комментарий').attr('rowspan','2'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Цвет').attr('rowspan','2'))
					.append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Период контроля').attr('colspan','2')))
					.append($('<tr>')
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('с'))
                    .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('по'))
                    );
    this.fuel_standart_table_body = $('<tbody>')
        .appendTo(fuel_standart_table);    
    
    this.fuel_standart_mas = [];    
        
    this.add_fuel_standart_to_table = function(p_fuel_standart){
        var l_fuel_standart = $('<tr>').appendTo(l_this.fuel_standart_table_body);
        l_fuel_standart.id_control = p_fuel_standart.ID_CONTROL;
        l_fuel_standart.pos = l_this.fuel_standart_mas.length;
        l_this.fuel_standart_mas[l_fuel_standart.pos] = l_fuel_standart;
        
        l_fuel_standart.data = p_fuel_standart;
        
        l_fuel_standart.car_number = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.CAR_NUMBER===null?'':p_fuel_standart.CAR_NUMBER)).addClass('reference-text');
        l_fuel_standart.creation_date = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.CREATION_DATE===null?'':p_fuel_standart.CREATION_DATE));
        l_fuel_standart.created_name = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.CREATED_NAME===null?'':p_fuel_standart.CREATED_NAME));
        l_fuel_standart.cause_code = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.CAUSE_CODE===null?'':p_fuel_standart.CAUSE_CODE));
        l_fuel_standart.cause_desc = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.CAUSE_DESC===null?'':p_fuel_standart.CAUSE_DESC));
        l_fuel_standart.note = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.NOTE===null?'':p_fuel_standart.NOTE));
        l_fuel_standart.color_name = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.COLOR_NAME===null?'':p_fuel_standart.COLOR_NAME));
        l_fuel_standart.start_date = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.START_DATE===null?'':p_fuel_standart.START_DATE));
        l_fuel_standart.end_date = $('<td>').appendTo(l_fuel_standart).text((p_fuel_standart.END_DATE===null?'':p_fuel_standart.END_DATE));
        
        l_fuel_standart.car_number.on('click', function(){open_fuel_standart_window(l_this,l_fuel_standart);});
        
        return l_fuel_standart;
    };
    
    this.refresh_fuel_standart = function(p_async){
        start_loading_animation();
        var l_param = {};
        
        l_param.cause_id = l_this.tab5_base_type_select_filter.val();
        l_param.car_number = l_this.tab5_base_num_filter.val();
        l_param.color_id = l_this.tab5_loco_par_inst_select_filter.val();
        l_param.date_from = l_this.tab5_date_filter.val();
		l_param.date_to = l_this.tab5_date_to_filter.val();
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: p_async,
            data: { params: JSON.stringify(l_param)
                   ,ajax_action: 'get_control_standart'
                  },
            success: function (data) {
				//console.log(data);
                var l_fuel_standart = JSON.parse(data);
                l_fuel_standart.forEach(function (item){
                    var l_exists_item = false;
                    l_this.fuel_standart_mas.forEach(function(control_standart){
                        if (item.ID_CONTROL == control_standart.id_control){
                            l_exists_item = true;
                            if (control_standart.data.LAST_UPDATE_DATE != item.LAST_UPDATE_DATE){
                                control_standart.data = item;
                                
								//control_standart.id_control.text((item.ID_CONTROL===null?'':item.ID_CONTROL));
                                control_standart.car_number.text((item.CAR_NUMBER===null?'':item.CAR_NUMBER));
                                control_standart.start_date.text((item.START_DATE===null?'':item.START_DATE));
								control_standart.created_name.text((item.CREATED_NAME===null?'':item.CREATED_NAME));
								
                                control_standart.end_date.text((item.END_DATE===null?'':item.END_DATE));
                                control_standart.creation_date.text((item.CREATION_DATE===null?'':item.CREATION_DATE));
                                control_standart.cause_code.text((item.CAUSE_CODE===null?'':item.CAUSE_CODE));
								control_standart.cause_desc.text((item.CAUSE_DESC===null?'':item.CAUSE_DESC));
								//control_standart.cause_id.text((item.CAUSE_ID===null?'':item.CAUSE_ID));
								//control_standart.color_id.text((item.COLOR_ID===null?'':item.COLOR_ID));
								control_standart.color_name.text((item.COLOR_NAME===null?'':item.COLOR_NAME));
								control_standart.note.text((item.NOTE===null?'':item.NOTE));
                            }
                        }
                    });
                    if (!l_exists_item) {
                        var l_cur_fuel_standart = l_this.add_fuel_standart_to_table(item);
                    }
                });
                
                l_this.fuel_standart_mas.forEach(function(control_standart){
                    var l_exists_item = false;
                    l_fuel_standart.forEach(function (item){
                        if (item.ID_CONTROL == control_standart.id_control){
                            l_exists_item=true;
                        }
                    });
                    if (!l_exists_item) {
                        control_standart.remove();
                        delete l_this.fuel_standart_mas[control_standart.pos];
                    }
                });
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        }); 
        stop_loading_animation();
    };
    
    l_this.refresh_fuel_standart(false);
});

function open_fuel_standart_window(p_document,p_fuel_standart){
    function save_fuel_standart_ajax(){
        var l_row_id = '';
        if (p_fuel_standart != null){
            l_row_id = p_fuel_standart.data.ID_CONTROL;
        }
		
        
        var l_param = {};
			l_param.id_control = md_content.base_num_input.attr('id_control');
            l_param.car_number = md_content.base_num_input.val(); // Номер вагона
            l_param.cause_id = md_content.loco_select.val(); // Код причины
			l_param.color_id = md_content.color_select.val(); // Цвет
			l_param.note = md_content.comm_input.val(); // Примечание
			l_param.start_date = md_content.contr_date_from_input.val();
			l_param.end_date = md_content.contr_date_to_input.val();
		//console.log(JSON.stringify(l_param));
		//return;
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { row_id: l_row_id
                   ,add_data: JSON.stringify(l_param)
                   ,ajax_action: 'save_control_car'},
            success: function (data) {
				//console.log(data);
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }
    function delete_fuel_standart_ajax (){
		var l_row_id = '';
        if (p_fuel_standart != null){
            l_row_id = p_fuel_standart.data.ID_CONTROL;
        }
		var l_param = {};
			l_param.id_control = md_content.base_num_input.attr('id_control');
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { row_id: l_row_id
                   ,add_data: JSON.stringify(l_param)
                   ,ajax_action: 'delete_control_car'},
            success: function (data) {
				//console.log(data);
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
	}
    function disable_save_btn(){
         $('#md_save_fuel_standart_btn').prop( "disabled", false );
    }  
    
    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .appendTo('body');

    var l_title = 'Контроль вагонов';

    md_content.attr('title',l_title);    
    
    md_content.color_select = $('<select>',{class:'route-window-attr-item-elem required'});
    md_content.base_num_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all required',css:{'width':'10em'}});
	md_content.base_num_input.attr('id_control',"0");    
    md_content.loco_select = $('<select>',{class:'route-window-attr-item-elem required'});

    md_content.contr_date_from_input = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'7em'}});
    md_content.contr_date_to_input = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'7em'}});
    md_content.comm_input = $('<input>',{class:'route-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'20em'}});
    
    md_content.color_select.append($('<option>',{'val':'','text':''}));
    md_content.loco_select.append($('<option>',{'val':'','text':''}));

	l_this.control_color.forEach(function(item){
        //md_content.color_select.append($('<option>',{'val':item.ID,'text':item.DESCRIPTION}));
		var l_option = $('<option>').text(item.DESCRIPTION).val(item.ID).css({'background':item.CODE});
		md_content.color_select.append(l_option);
		
    });
    l_this.code_cause.forEach(function(item){
        md_content.loco_select.append($('<option>',{'val':item.ID,'text':item.CODE+' ('+item.DESCRIPTION+')'}));
    });
    
    var l_div_base_type = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Цвет',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.color_select); 
    var l_div_base_num = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Номер вагона',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.base_num_input);
    var l_div_loco = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Код причины',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.loco_select);
    var l_div_contr_date_from = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Период контроля: с ',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.contr_date_from_input)
        .append($('<label>',{text:'по ',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(md_content.contr_date_to_input);
    var l_div_comm = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Примечание',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.comm_input); 
    
    $('<div>')
        .addClass('route-window-attr')
        .css({'width':'37em'})
        .append(l_div_base_num)
		.append(l_div_base_type)
        .append(l_div_loco)
        .append(l_div_contr_date_from)
        .append(l_div_comm)
        .appendTo(md_content);    
	
    init_date_time_input_short(md_content.contr_date_from_input);
    init_date_time_input_short(md_content.contr_date_to_input);
    
    if (p_fuel_standart != null){
		md_content.base_num_input.attr('id_control',p_fuel_standart.data.ID_CONTROL);  // Номер вагона
        md_content.base_num_input.val(p_fuel_standart.data.CAR_NUMBER); // Номер вагона
		md_content.base_num_input.prop( "disabled", true ); // Номер вагона
		md_content.base_num_input.removeClass("required"); 
		md_content.loco_select.val(p_fuel_standart.data.CAUSE_ID); // Код причины
		md_content.color_select.val(p_fuel_standart.data.COLOR_ID); // Цвет
		md_content.comm_input.val(p_fuel_standart.data.NOTE); // Примечание
		md_content.contr_date_from_input.val(p_fuel_standart.data.START_DATE);
        md_content.contr_date_to_input.val(p_fuel_standart.data.END_DATE);
		
    }
    
    md_content.color_select.on('change', function(){disable_save_btn();});
    md_content.base_num_input.on('blur',function(){disable_save_btn();});
    md_content.loco_select.on('change', function(){disable_save_btn();});
    
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
					if (p_fuel_standart == null){
						if (md_content.base_num_input.val() == ''){
							create_info_modal_dialog_new('Оповещение','Не заполнено поле "Вагон"');
							return false;
						}
					}
					if (md_content.contr_date_from_input.val() == ''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Период контроля с"');
						return false;
					}
					
					if (md_content.color_select.val() == ''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Цвет"');
						return false;
					}
					/*
					if (md_content.loco_select.val() == ''){
						create_info_modal_dialog_new('Оповещение','Не заполнено поле "Код причины"');
						return false;
					}*/
					
					$('#md_save_fuel_standart_btn').prop( "disabled", true );
                    var f_res = save_fuel_standart_ajax();
                    var f_res_mas = f_res.split('$');
                    if (f_res_mas[0]=='done') {
                        var l_mes = '';
                        if (p_fuel_standart == null){
                            l_mes = 'Контроль создан!';
                        } else{
                            l_mes = 'Контроль обновлен!';
                        }
                        p_document.refresh_fuel_standart(false);
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение',l_mes);
                    }else{
                        //md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой! Причина:'+f_res_mas[1]);
						$('#md_save_fuel_standart_btn').prop( "disabled", false );
                    };
                }   
            },
			'Удалить': {
                text:'Удалить',
                id:'md_delete_form_btn',
                click: function(){
                    $('#md_delete_form_btn').prop( "disabled", true );
                    var f_res = delete_fuel_standart_ajax();
                    var f_res_mas = f_res.split('$');
                    if (f_res_mas[0]=='done') {
                        var l_mes = '';
                        l_mes = 'Контроль удален!';
                        p_document.refresh_fuel_standart(false);
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение',l_mes);
                    }else{
                        //md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой! Причина:'+f_res_mas[1]);
						$('#md_save_fuel_standart_btn').prop( "disabled", false );
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