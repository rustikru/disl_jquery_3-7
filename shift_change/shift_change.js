var l_this;

var r_fix_dev_rule;
var r_fix_dev_place;
var r_recep_shift_add;
var user_id;
var user_name;                  /*пользователь*/
var user_station_id;            /*станция пользователя*/
var user_station_name;          /*станция пользователя*/
var r_shift_update;
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
    
    this.cond_train_dr = [];
    this.users = [];
    
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
            
            r_fix_dev_rule = (result.fix_dev_rule==='Y');
            r_fix_dev_place = (result.fix_dev_place==='Y');
			
			r_shift_update = (result.shift_update==='Y');
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });

    l_this = this;

	/**************************************/
    /********* Прием-сдачи смены **********/
    /**************************************/
	this.tab3 = $('#tabs-3');
	this.section = $('<div>')
        .addClass('section')
        .css({'width':'auto','float':'none','height':'850px'})
        .appendTo(this.tab3);
	l_this = this;
	this.change_smena = [];		/*Смена*/
	this.change_stations = []; 	/*Станции*/
	this.change_user = []; 		/*Юзер сдал смену*/
	this.reception_user = [];	/*Юзер принял смену*/
	this.status_id = [];
	//if (r_recep_shift_add){
        this.add_route_btn = $('<button>')
            .addClass('button')
            .css({'margin-left':'0.5em','margin-right':'0.5em','margin-top':'0.5em'})
            .append($('<span>').addClass('button-text button-text-size-3').text('Добавить смену'))
            .appendTo(this.section)
            .on('click', function(){
                open_shift_change_window(l_this);
            });
    //}
	$.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_route_smena_change'},
        success: function (data) {l_this.change_smena = JSON.parse(data);}
    });
	$.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'returnStations'},
        success: function (data) {l_this.change_stations = JSON.parse(data);}
    });
	$.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_users_for_change'},
        success: function (data) {l_this.change_user = JSON.parse(data);}
    });
	$.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_users_for_change'},
        success: function (data) {l_this.reception_user = JSON.parse(data);}
    });
	$.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_status_shift'},
        success: function (data) {l_this.status_id = JSON.parse(data);}
    });
	var l_date = get_server_current_time();
    var l_date_from = add_day_to_date_trunc(l_date,-2);
    var l_date_to = add_day_to_date_trunc(l_date,1);
    
    this.date_from_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'7em'}}).val(l_date_from);
    this.date_to_filter = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'7em'}}).val(l_date_to);
	this.smena_select_filter = $('<select>',{class:'route-change-select'});
	this.station_select_filter = $('<select>',{class:'route-change-select'});
	this.status_select_filter = $('<select>',{class:'route-change-select'});
	this.ch_user_select_filter = $('<select>',{class:'route-change-select'});
	this.rep_user_select_filter = $('<select>',{class:'route-change-select'});
	
	this.status_select_filter.append($('<option>',{'val':'','text':''}));
	this.smena_select_filter.append($('<option>',{'val':'','text':''}));
	this.station_select_filter.append($('<option>',{'val':'','text':''}));
	this.ch_user_select_filter.append($('<option>',{'val':'','text':''}));
	this.rep_user_select_filter.append($('<option>',{'val':'','text':''}));
	this.go_filter_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Поиск'))
        .on('click', function(){
            l_this.refresh_smena(false);
            create_info_modal_dialog_new('Оповещение','Поиск завершен!');
        });
    this.clear_filter_btn = $('<button>')
        .addClass('button')
        .css({'margin-left':'0.5em'})
        .append($('<span>').addClass('button-text button-text-size-2').text('Очистить'))
        .on('click', function(){
            l_this.date_from_filter.val('');
            l_this.date_to_filter.val('');
			l_this.status_select_filter.val('');
            l_this.smena_select_filter.val('');
            l_this.station_select_filter.val('');
			l_this.ch_user_select_filter.val('');
			l_this.rep_user_select_filter.val('');
        });
      
	
	this.filter_div = $('<div>')
        .addClass('route-filter-div')
        .append($('<label>',{text:'дата: c',class:'route-window-attr-item-text'}))
        .append(this.date_from_filter)
        .append($('<label>',{text:'по',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.date_to_filter)
		.append($('<label>',{text:'Статус',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.status_select_filter)
        .append($('<label>',{text:'смена',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.smena_select_filter)
        .append($('<label>',{text:'станция',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.station_select_filter)
        .append($('<label>',{text:'Смену сдал',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.ch_user_select_filter)
		.append($('<label>',{text:'Смену принял',class:'route-window-attr-item-text route-window-attr-item-text-between'}))
        .append(this.rep_user_select_filter)
        .append(this.go_filter_btn)
        .append(this.clear_filter_btn)
        .appendTo(this.section);
	var route_table = $('<table>')
        .addClass('route-table')
        .appendTo(this.section);
	
	init_date_time_input(this.date_from_filter);
    init_date_time_input(this.date_to_filter);
	this.status_id.forEach(function(item){
        l_this.status_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
	this.change_smena.forEach(function(item){
        l_this.smena_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
	this.change_stations.forEach(function(item){
        if (item.ID!='1'){
            l_this.station_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
        }
    });
	this.change_user.forEach(function(item){
        l_this.ch_user_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
	this.reception_user.forEach(function(item){
        l_this.rep_user_select_filter.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    $('<thead>')
        .appendTo(route_table)
        .append($('<tr>')
                    .append($('<th>').addClass('route-table-th').text('Номер'))
					.append($('<th>').addClass('route-table-th').text('Станция'))
                    .append($('<th>').addClass('route-table-th').text('Статус'))
                    .append($('<th>').addClass('route-table-th').text('Дата по'))
                    .append($('<th>').addClass('route-table-th').text('Назначено'))
					.append($('<th>').addClass('route-table-th').text('В Запасах'))
					.append($('<th>').addClass('route-table-th').text('Итого'))
                    .append($('<th>').addClass('route-table-th').text('В т.ч. не годных'))
					.append($('<th>').addClass('route-table-th').text('Смену сдал'))
					.append($('<th>').addClass('route-table-th').text('Смену принял'))
					.append($('<th>').addClass('route-table-th').text('Дата время приема смены'))
                    .append($('<th>').addClass('route-table-th').text('Комментарий')));
    this.smena_table_body = $('<tbody>')
        .appendTo(route_table);
		
	this.smena_content_mas = [];
	this.add_shift_to_table = function(p_smena){
		//console.log(p_smena);
        var l_smena = $('<tr>').appendTo(l_this.smena_table_body);
		var l_total_zu = 0;
		var l_note='';
		
        
        l_smena.pos = l_this.smena_content_mas.length;
        l_this.smena_content_mas[l_smena.pos] = l_smena;
        l_smena.data = p_smena;
		
        l_total_zu = (parseInt(p_smena.PLACE_COUNT, 10)+parseInt(p_smena.RAILWAYS_COUNT,10));
		l_note = (p_smena.NOTE_CHANGE===null?'':p_smena.NOTE_CHANGE)+'|'+(p_smena.NOTE_RECEPTION===null?'':p_smena.NOTE_RECEPTION);
		l_smena.shift_change_id = p_smena.SHIFT_CHANGE_ID;
        l_smena.smena_num_td = $('<td>').appendTo(l_smena).text((p_smena.SMENA_NUM===null?'':p_smena.SMENA_NUM)).addClass('reference-text');
		l_smena.station_short_name = $('<td>').appendTo(l_smena).text((p_smena.STATION_SHORT_NAME===null?'':p_smena.STATION_SHORT_NAME));
		l_smena.status_name = $('<td>').appendTo(l_smena).text((p_smena.STATUS_NAME===null?'':p_smena.STATUS_NAME));
		
		l_smena.date_change = $('<td>').appendTo(l_smena).text((p_smena.DATE_CHANGE===null?'':p_smena.DATE_CHANGE));
		
		l_smena.railways_count = $('<td>').appendTo(l_smena).text((p_smena.RAILWAYS_COUNT===null?'0':p_smena.RAILWAYS_COUNT));
		l_smena.place_count = $('<td>').appendTo(l_smena).text((p_smena.PLACE_COUNT===null?'0':p_smena.PLACE_COUNT));
		l_smena.total_zu = $('<td>').appendTo(l_smena).text((l_total_zu===null?'0':l_total_zu));
		l_smena.inccorect_total = $('<td>').appendTo(l_smena).text((p_smena.INCCORECT_TOTAL===null?'0':p_smena.INCCORECT_TOTAL));
		
		l_smena.user_change = $('<td>').appendTo(l_smena).text((p_smena.USER_CHANGE===null?'':p_smena.USER_CHANGE));
		l_smena.user_reception = $('<td>').appendTo(l_smena).text((p_smena.USER_RECEPTION===null?'':p_smena.USER_RECEPTION));
		
		l_smena.date_reception = $('<td>').appendTo(l_smena).text((p_smena.DATE_RECEPTION===null?'':p_smena.DATE_RECEPTION));
		l_smena.note_change = $('<td>').appendTo(l_smena).text((l_note===null?'':l_note));
		
        l_smena.smena_num_td.on('click', function(){ open_shift_change_window(l_this,l_smena);});
        return l_smena;
    };
	this.refresh_smena = function(p_async){
		var l_param = {};
			l_param.date_from = l_this.date_from_filter.val();
			l_param.date_to = l_this.date_to_filter.val();
			l_param.smena = l_this.smena_select_filter.val();
			l_param.ch_user = l_this.ch_user_select_filter.val();
			l_param.rep_user = l_this.rep_user_select_filter.val();
			l_param.station_id =  l_this.station_select_filter.val();
			l_param.status_id =  l_this.status_select_filter.val();;
		//console.log('l_param='+JSON.stringify(l_param));
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: p_async,
            data: { params: JSON.stringify(l_param)
                   ,ajax_action: 'get_smena_change'
                  },
            success: function (data) {
                var l_routes = JSON.parse(data);
                l_routes.forEach(function (item){
                    var l_exists_item = false;
                    l_this.smena_content_mas.forEach(function(route){
                        if (item.SHIFT_CHANGE_ID == route.shift_change_id){
                            l_exists_item = true;
							
                            if (route.data.last_update_date != item.LAST_UPDATE_DATE){
                                route.data = item;
								var l_total_zu = 0;
								var l_note='';
								
								l_total_zu = (parseInt(item.PLACE_COUNT, 10)+parseInt(item.RAILWAYS_COUNT,10));
								l_note = (item.NOTE_CHANGE===null?'':item.NOTE_CHANGE)+'|'+(item.NOTE_RECEPTION===null?'':item.NOTE_RECEPTION);
								route.shift_change_id = item.SHIFT_CHANGE_ID;
								route.smena_num_td.text((item.SMENA_NUM===null?'':item.SMENA_NUM));
								route.station_short_name.text((item.STATION_SHORT_NAME===null?'':item.STATION_SHORT_NAME));
								route.status_name.text((item.STATUS_NAME===null?'':item.STATUS_NAME));
								route.date_change.text((item.DATE_CHANGE===null?'':item.DATE_CHANGE));
								route.railways_count.text((item.RAILWAYS_COUNT===null?'0':item.RAILWAYS_COUNT));
								route.place_count.text((item.PLACE_COUNT===null?'0':item.PLACE_COUNT));
								route.total_zu.text((l_total_zu===null?'0':l_total_zu));
								route.inccorect_total.text((item.INCCORECT_TOTAL===null?'0':item.INCCORECT_TOTAL));
								route.user_change.text((item.USER_CHANGE===null?'':item.USER_CHANGE));
								route.user_reception.text((item.USER_RECEPTION===null?'':item.USER_RECEPTION));
								route.date_reception.text((item.DATE_RECEPTION===null?'':item.DATE_RECEPTION));
								route.note_change.text((l_note===null?'':l_note));

                            }
                        }
                    });
					
                    if (!l_exists_item) {
                        var l_cur_route= l_this.add_shift_to_table(item);
                    }
                });
                
                l_this.smena_content_mas.forEach(function(route){
                    var l_exists_item = false;
                    l_routes.forEach(function (item){
                        if (item.SHIFT_CHANGE_ID == route.shift_change_id){
                            l_exists_item=true;
                        }
                    });
                    if (!l_exists_item) {
                        route.remove();
                        delete l_this.smena_content_mas[route.pos];
                    }
                });
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        }); 
    };
    
    l_this.refresh_smena(false);
    setInterval(function() {
        l_this.refresh_smena(true);
    }, 1000*5*60);
});

/* Открыть окно сдача смены*/
function open_shift_change_window(p_document,p_smena_item){
	//console.log(p_document);
	//console.log(p_smena_item.data);
	var l_data_save = 'N';
    var l_param = {};
		l_param.status = '1';
	if (p_document.change_smena.length == 0) {
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_route_smena_change'},
            success: function (data) {p_document.change_smena = JSON.parse(data);}
        });
    }
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
	function railcar_table_for_fix_device(){
		var self = this;
        this.add_error_msg = null;
        this.cars_table_total_row;
        this.cars_count = 0;
        
        this.cars_mas = [];
		var return_table = $('<div>');
        return_table.append(
            '<table id="shift_dev_table_head" class="shift_dev_table fix_shift_dev_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th>№</th>'+
                        '<th>Место Хранения/Закрепления</th>'+
                        '<th>Количество</th>'+
						'<th>Негодные</th>'+
                        '<th>Перечень номеров</th>'+
						'<th>Примечание</th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'
        );
		return_table.cars_table = $('<table>',{class:'shift_dev_table'}).append($('<tbody>'));
        return_table.append(
            $('<div>',{class:'modalDialogContainerShift',css:{'display':'inline-block'}})  
            .append(return_table.cars_table)
        );
		this.storage_snapshot_mas = [];
		this.mass_dev_shift = [];
		this.cars_mas = [];
		this.add_cars_in_table = function(p_station_id,p_need_check){
			var params = {};
                params.station_id = p_station_id;
				params.date_to =md_content.start_date_shift.val();
				self.mass_dev_shift = [];
				//console.log(JSON.stringify(params));
				//return;
				$.ajax({
					url: '../data.php',
					type: 'POST',
					dataType: "text",
					async: false,
                    data: { params: JSON.stringify(params)
                           ,ajax_action: 'get_snapshot_wagon'
                          },
                    success: function (data) {
						//console.log(data);
						var tr = $('<tr>');
						var l_storage_place = JSON.parse(data);
						l_storage_place.forEach(function (item){
							item.pos = self.storage_snapshot_mas.length;
							self.storage_snapshot_mas[item.pos] = item;
							item.SNAPSHOT_SHORT = JSON.parse(item.SNAPSHOT_SHORT);
							item.SNAPSHOT_DETAILED = JSON.parse(item.SNAPSHOT_DETAILED);
							self.add_storage_place_to_table(item);
						});
					},
					error: function (m1,m2) {window.alert(m1+m2);}
				});
		};
		this.add_data_existing = function (p_str_place){
			self.add_storage_place_to_table(p_str_place);
		};
		this.add_storage_place_to_table = function(p_storage_place){
			//console.log(p_storage_place);
			$(return_table).find("tr:gt(0)").remove();
			self.cars_mas = [];
			function count(p_mas){
				var count = 0;
				p_mas.forEach(function (item){
					count++;
				});  
				return count;
			}
			function contains (p_val){
				if(typeof p_val == 'undefined') {
					return false;
				} else if (p_val === null) { return false;}
				else {				
					return true;
				}
			}
			if (typeof(p_storage_place.SNAPSHOT_SHORT) != "undefined") {
				var l_count = count(p_storage_place.SNAPSHOT_SHORT);
				p_storage_place.SNAPSHOT_SHORT.forEach(function (item,i){
					var tr = $('<tr>');
					tr.pos = self.cars_mas.length;
					tr.append($('<td>').text(i+1));
					tr.append($('<td>').text(item.railway_number));
					tr.correct = item.count;
					tr.incorrect = item.count_fit;
					tr.attr('correct',item.count)
						.append($('<td>').text(item.count));
					tr.attr('incorrect',item.count_fit)
						.append($('<td>').text(item.count_fit));
					tr.append($('<td>').text(item.device));
					tr.append($('<td>').text(item.note));
					tr.appendTo(return_table.cars_table);
					self.cars_mas[tr.pos] = tr;
				});
			}
			if (typeof(p_storage_place.SNAPSHOT_DETAILED) != "undefined") {
				p_storage_place.SNAPSHOT_DETAILED.forEach(function (item,i){
				var l_item = {};
				if (!contains(item.transactions_header_id)) {l_item.transactions_header_id = null;} else {l_item.transactions_header_id = item.transactions_header_id.toString();}
				if (!contains(item.transactions_lines_id)) {l_item.transactions_lines_id = null;} else {l_item.transactions_lines_id = item.transactions_lines_id.toString();}
				l_item.transaction_type = item.transaction_type;
				
				if (!contains(item.station_id)) {l_item.station_id = null;} else {l_item.station_id = item.station_id.toString();}
				if (!contains(item.part_id)) {l_item.part_id = null;} else {l_item.part_id = item.part_id.toString();}
				if (!contains(item.railway_id)) {l_item.railway_id = null;} else {l_item.railway_id = item.railway_id.toString();}
				if (!contains(item.instance_id)) {l_item.instance_id = null;} else {l_item.instance_id = item.instance_id.toString();}
				l_item.side_type = item.side_type;
				if (!contains(item.side_id)) {l_item.side_id = null;} else {l_item.side_id = item.side_id.toString();}
				
				l_item.created_date = item.created_date;
				if (!contains(item.created_user)) {l_item.created_user = null;} else {l_item.created_user = item.created_user.toString();}
				
				l_item.date_fix_odd = item.date_fix_odd;
				if (!contains(item.user_fix_txt)) {l_item.user_fix_txt = null;} else {l_item.user_fix_txt = item.user_fix_txt.toString();}
				if (!contains(item.user_rep_txt)) {l_item.user_rep_txt = null;} else {l_item.user_rep_txt = item.user_rep_txt.toString();}
				
				if (!contains(item.user_fix_even)) {l_item.user_fix_even = null;} else {l_item.user_fix_even = item.user_fix_even.toString();}
				l_item.date_fix_odd = item.date_fix_odd;
				if (!contains(item.user_fix_odd)) {l_item.user_fix_odd = null;} else {l_item.user_fix_odd = item.user_fix_odd.toString();}
				l_item.date_fix_even = item.date_fix_even;
				
				if (!contains(item.user_rep_even)) {l_item.user_rep_even = null;} else {l_item.user_rep_even = item.user_rep_even.toString();}
				if (!contains(item.user_rep_odd)) {l_item.user_rep_odd = null;} else {l_item.user_rep_odd = item.user_rep_odd.toString();}
				if (!contains(item.inspection_id)) {l_item.inspection_id = null;} else {l_item.inspection_id = item.inspection_id.toString();}
				l_item.inspection_date = item.inspection_date;
				l_item.fit_device = '';
				l_item.place = item.place;
				if (!contains(item.place_id)) {l_item.place_id = null;} else {l_item.place_id = item.place_id.toString();}
				l_item.date_fix_odd_txt = item.date_fix_odd_txt;
				
			    self.mass_dev_shift.push(l_item);
			});
			}
			
			
			change_cars_table_total_tr(); 
		};
		
		function change_cars_table_total_tr(){
			//alert($('#shift_dev_table_head').outerWidth());
			var l_table_total;
			if (typeof(return_table.cars_table_total_row) != "undefined"){
				return_table.cars_table_total_row.find('td').remove();
				return_table.cars_table_total_row = $('<tr>',{css:{'background':'#EBEBEB','font-weight':'bold'}});
				self.cars_table_total_row = return_table.cars_table_total_row;
				
				return_table.append(
					$('#shift_dev_table_total')
					.append(return_table.cars_table_total_row));
			}
			else{
				return_table.cars_table_total_row = $('<tr>',{css:{'background':'#EBEBEB','font-weight':'bold'}});
				self.cars_table_total_row = return_table.cars_table_total_row;
				l_table_total =$('<table>',{'id':'shift_dev_table_total', class:'shift_dev_table fix_shift_dev_table',css:{'margin-top':'-4px'}})
				return_table.append(
					$(l_table_total)
					.append(
					$('<tbody>').append(return_table.cars_table_total_row)
				));
			}
			
            var l_count_of_axles = 0;
			var l_count_of_fit = 0;
			
            return_table.cars_table.find('tr td:nth-child(3)').each(function(){
                l_count_of_axles+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
            });
			return_table.cars_table.find('tr td:nth-child(4)').each(function(){
                l_count_of_fit+=parseFloat((($(this).text() !== '') ? $(this).text() : '0'));
            });
            return_table.cars_table_total_row.append('<td></td>');
            return_table.cars_table_total_row.append('<td>Кол-во:</td>');
            return_table.cars_table_total_row.append('<td>'+Math.round(l_count_of_axles * 100)/100+'</td>');
			return_table.cars_table_total_row.append('<td>'+Math.round(l_count_of_fit * 100)/100+'</td>');
			return_table.cars_table_total_row.append('<td></td>');
			return_table.cars_table_total_row.append('<td></td>');
			set_val_zu();
			
        }
		this.get_table = function(){
            return return_table;
        };

		this.get_mass_shift = function(){
			return self.mass_dev_shift;
		}
		function set_val_zu(){
			var l_correct_zu = 0;
			var l_total = 0;
			var l_inccorect = 0;
			
			self.cars_mas.forEach(function(tr){
                l_correct_zu = l_correct_zu + tr.correct;
				l_inccorect = l_inccorect + tr.incorrect;
            });
			l_total = l_correct_zu + l_inccorect;
			
			md_content.zu_total_change.val(l_total);
			md_content.zu_correct_change.val(l_correct_zu);
			md_content.zu_incorrect_change.val(l_inccorect);
			
			//md_content.zu_total_reception.val(l_total);
			//md_content.zu_correct_reception.val(l_correct_zu);
			//md_content.zu_incorrect_reception.val(l_inccorect);
		}
	};
	function fill_smena_for_shift(p_select){
		p_select.empty();
        p_select.append($('<option>'));
			$.ajax({
				url: '../data.php',
				type: 'POST',
				dataType: "text",
				async: false,
				data:   {ajax_action: 'get_route_smena_change'},
				success: function (data) {
					var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.NAME).attr('from_time',item.FROM_TIME).val(item.ID);
                        p_select.append(l_option);
                    }); 
				
				},
				error: function (m1,m2) {window.alert(m1+m2);}
			});
    }
	function fill_status_for_shift(p_select){
		p_select.empty();
        p_select.append($('<option>'));
			$.ajax({
				url: '../data.php',
				type: 'POST',
				dataType: "text",
				async: false,
				data:   {ajax_action: 'get_status_shift'},
				success: function (data) {
					var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        var l_option = $('<option>').text(item.NAME).val(item.ID);
                        p_select.append(l_option);
                    }); 
				
				},
				error: function (m1,m2) {window.alert(m1+m2);}
			});
    }
	function fill_users_for_notification(p_select){
		p_select.empty();
        p_select.append($('<option>'));
			$.ajax({
				url: '../data.php',
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
				
				},
				error: function (m1,m2) {window.alert(m1+m2);}
				
			});
    }
	function validation_save (p_btn){
		if (p_btn == 'btn_save') {
			if (md_content.start_date_shift.val() == ''){
				create_info_modal_dialog_new('Оповещение.Сдача смены','Не заполнено поле "Дата и время начала смены(Мск)"');
				return false;
			}
		}
		// сдача смены
		if (p_btn == 'btn_change') {
			if (md_content.change_smena.val() == ''){
				create_info_modal_dialog_new('Оповещение.Сдача смены','Не заполнено поле "Смена"');
				return false;
			}
			if (md_content.change_user.val() == ''){
				create_info_modal_dialog_new('Оповещение.Сдача смены','Не заполнено поле "Сдача смены"');
				return false;
			}
			if (md_content.time_change.val() == ''){
				create_info_modal_dialog_new('Оповещение.Сдача смены','Не заполнено поле "Дата и время сдачи(Мск)"');
				return false;
			}
			if (md_content.start_date_shift.val() == ''){
				create_info_modal_dialog_new('Оповещение.Сдача смены','Не заполнено поле "Дата и время начала смены(Мск)"');
				return false;
			}
			if (!date_comparison(md_content.start_date_shift.val(),md_content.time_change.val(),'<')){
				create_info_modal_dialog_new('Оповещение.Сдача смены','"Дата и время начала смены(Мск)" больше "Дата и время сдачи(Мск)"');
				return false;
			}
			//console.log( md_content.shift_num.attr('shift_change_id'));
			if (md_content.zu_total_change.val() =='0' || md_content.zu_total_change.val() ==''){
				create_info_modal_dialog_new('Оповещение.Сдача смены','Отсутствует снимок места нахождения');
				return false;
			}
		}
		// прием смены
		if (p_btn == 'btn_reception') {
			if (md_content.reception_smena.val() == ''){
				create_info_modal_dialog_new('Оповещение.Прием смены','Не заполнено поле "Смена"');
				return false;
			}
			if (md_content.reception_user.val() == ''){
				create_info_modal_dialog_new('Оповещение.Прием смены','Не заполнено поле "Смену принял"');
				return false;
			}
			if (md_content.time_reception.val() == ''){
				create_info_modal_dialog_new('Оповещение.Прием смены','Не заполнено поле "Дата и время приема(Мск)"');
				return false;
			}
			
		}
		return true;
	}
	function create_array_from_save (){
		var v_params = {};
			v_params.button='btn_save';
			v_params.shift_change_id=md_content.shift_num.attr('shift_change_id');
			v_params.station_id=user_station_id;
			v_params.status_id=md_content.status.val();
			v_params.smena_change_id=md_content.change_smena.val();
			v_params.user_change_id=md_content.change_user.val();
			v_params.date_change=md_content.time_change.val();
			v_params.note_change=md_content.note_change.val();
			v_params.start_date_shift=md_content.start_date_shift.val();;
			v_params.dev_change_total=md_content.zu_total_change.val();
			v_params.dev_change_correct=md_content.zu_correct_change.val();
			v_params.dev_change_inccorect=md_content.zu_incorrect_change.val();
			v_params.smena_reception_id= md_content.reception_smena.val();
			v_params.user_reception_id = md_content.reception_user.val();
			v_params.date_reception = md_content.time_reception.val();
			v_params.note_reception = md_content.note_reception.val();
			v_params.dev_reception_total = md_content.zu_total_reception.val();
			v_params.dev_reception_correct = md_content.zu_correct_reception.val();
			v_params.dev_reception_inccorect = md_content.zu_incorrect_reception.val();
			v_params.mass_shift = railcar_table.get_mass_shift(); // массив с подробной сводкой
			v_params.sign_of_change = 'N';
			v_params.sign_of_reception = 'N';
			if(typeof p_smena_item !== 'undefined') {
				v_params.sign_of_change = p_smena_item.data.SIGN_OF_CHANGE;
			} 
			if(typeof p_smena_item !== 'undefined') {
				v_params.sign_of_reception = p_smena_item.data.SIGN_OF_RECEPTION;
			} 
			
		return v_params;
	}
	function message_after_close(){
					var md_lvl_3_content = $('<div/>')
                        .addClass('md-lvl-2')
                        .attr('title','Оповещение')
                        .appendTo('body');
                    md_lvl_3_content.status_select = $('<select>',{class:'route-window-attr-item-elem'});
                    md_lvl_3_content.status_descr_input = $('<input>',{class:'route-window-attr-item-elem ui-widget-content ui-corner-all',css:{'width':'20em'}});
                    
					fill_status_for_shift(md_lvl_3_content.status_select);

                    
                    var l_div_status = $('<div>')
                        .addClass('request-window-attr-item helper-clearfix')
                        .append($('<label>',{text:'Вы действительно хотите закрыть без сохранения? Все изменения не будут сохранены!',class:'request-window-attr-item-text'}))
                
                    $('<div>')
                        .addClass('route-window-attr')
                        .append(l_div_status)
                        .appendTo(md_lvl_3_content);
                
                    md_lvl_3_content.dialog({
                        resizable:false,
                        modal:true,
                        width: 'auto',
                        buttons:{
                            'Да': {
                                text: "Да",
                                id: "md_save_shift_status_btn",
                                click: function(){
                                    md_content.dialog("close");
									md_content.remove();
                                    md_lvl_3_content.dialog("close");
                                }   
                            },
                            'Отмена': function(){
                                md_lvl_3_content.dialog("close");
                            }
                        },
                        close: function() {
                            md_lvl_3_content.remove();
                        }
                    });
	}
	/* Сохранить данные */
    function save_shift_change(p_add_data){                
	
		//console.log(JSON.stringify(p_add_data));
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { add_data: JSON.stringify(p_add_data)
                   ,ajax_action: 'save_shift_change'},
            success: function (data) {
				//console.log(data);
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }
	function get_curren_date_time(p_time){
		var Data = new Date();
		var Year = Data.getFullYear();
		var Month = Data.getMonth()+1;
		var Day = Data.getDate();
		var l_date;
		if (Day < 10){
			Day = '0'+Day;
		}
		if (Month < 10){
			Month = '0'+Month;
		}
		l_date = Day+'.'+Month+'.'+Year+' '+p_time;
		return l_date
	}
    function disable_save_btn(){
		var l_sign_of_change;
		var l_status='1';
		var l_sign_of_reception;
		var l_shift_change_id; 
		if(typeof p_smena_item !== 'undefined') {
			l_sign_of_change = p_smena_item.data.SIGN_OF_CHANGE;
			l_sign_of_reception = p_smena_item.data.SIGN_OF_RECEPTION;
			l_status = p_smena_item.data.STATUS_ID;
		} 
		l_shift_change_id = md_content.shift_num.attr('shift_change_id')
		//console.log('l_sign_of_change='+l_sign_of_change);
		//console.log('l_sign_of_reception='+l_sign_of_reception);
		//console.log('l_status='+l_status);
		//console.log('l_shift_change_id='+l_shift_change_id);
		
				//$('#md_change_status_btn').prop( "disabled", true );
		md_content.status.prop( "disabled", true );
		/*Для того, кто сдает смену итоги для редактирования не доступны*/
		md_content.zu_total_change.prop( "disabled", true );
		md_content.zu_correct_change.prop( "disabled", true );
		md_content.zu_incorrect_change.prop( "disabled", true );
		md_content.zu_total_reception.prop( "disabled", true );
		// Если новая запись
		if (l_shift_change_id == '0' && l_status == '1') {
			//console.log('// Если новая запись');
			$('#md_shift_reception_btn').hide(); // Принять смену смену
			md_content.reception_smena.prop( "disabled", true );
			md_content.reception_user.prop( "disabled", true );
			md_content.note_reception.prop( "disabled", true );
			md_content.time_reception.prop( "disabled", true );
			md_content.zu_total_reception.prop( "disabled", true );
			md_content.zu_correct_reception.prop( "disabled", true );
			md_content.zu_incorrect_reception.prop( "disabled", true );
		}
		// Если еще не сдал смену 
		if (l_sign_of_change =='N' && l_sign_of_reception =='N' && l_status !== '3'){
			//console.log('Если еще не сдал смену ');
			$('#md_shift_reception_btn').hide();
			md_content.zu_total_reception.prop( "disabled", true );
			md_content.zu_correct_reception.prop( "disabled", true );
			md_content.zu_incorrect_reception.prop( "disabled", true );
			md_content.reception_smena.prop( "disabled", true );
			md_content.reception_user.prop( "disabled", true );
			md_content.note_reception.prop( "disabled", true );
			md_content.time_reception.prop( "disabled", true );
			$('#md_shift_reception_btn').hide(); // Принять смену смену
		}
		/*Если смену сдал*/
		if (l_sign_of_change =='Y'){
			//console.log('/*Если смену сдал*/');
			$('#md_snapshot_wagon_btn').hide(); // Снимок местонахождения
			$('#md_shift_change_btn').hide(); // Сдать смену
			
			md_content.change_smena.prop("disabled", true );// Смена
			md_content.change_user.prop("disabled", true );// Сдача смены
			md_content.start_date_shift.prop( "disabled", true );// Дата и время начала смены(Мск)
			md_content.time_change.prop("disabled", true );// Дата и время сдачи(Мск)
			md_content.note_change.prop("disabled", true );// Дата и время сдачи(Мск)
		}
		/*Если смену принял*/
		if (l_sign_of_change =='Y' && l_sign_of_reception =='Y' ){
			//console.log('/*Если смену принял*/');
			$('#md_snapshot_wagon_btn').hide();// Снимок местонахождения
			//$('#md_shift_reception_btn').prop( "disabled", true ); // Принять смену смену
			$('#md_shift_reception_btn').hide(); // Сдать смену смену
			md_content.reception_smena.prop( "disabled", true );
			md_content.reception_user.prop( "disabled", true );
			md_content.note_reception.prop( "disabled", true );
			md_content.time_reception.prop( "disabled", true );
			
			md_content.zu_total_reception.prop( "disabled", true );
			md_content.zu_correct_reception.prop( "disabled", true );
			md_content.zu_incorrect_reception.prop( "disabled", true );
		}
		
		/* Статус = Обновить */
		if (l_status == '3'){
			//console.log('/* Статус = Обновить */ l_status == 3');
			$('#md_shift_change_btn').hide(); // Сдать смену смену
			$('#md_shift_reception_btn').hide(); // Принять смену смену
			$('#md_snapshot_wagon_btn').hide(); // Снимок местонахождения
			
			md_content.reception_smena.prop( "disabled", false );
			md_content.reception_user.prop( "disabled", false );
			md_content.note_reception.prop( "disabled", false );
			md_content.time_reception.prop( "disabled", false );
			
			md_content.change_smena.prop("disabled", false );// Смена
			md_content.change_user.prop("disabled", false );// Сдача смены
			md_content.start_date_shift.prop( "disabled", false );// Дата и время начала смены(Мск)
			md_content.time_change.prop("disabled", false );// Дата и время сдачи(Мск)
			md_content.note_change.prop("disabled", false );// Дата и время сдачи(Мск)
			md_content.zu_correct_reception.prop( "disabled", false );
			md_content.zu_incorrect_reception.prop( "disabled", false );
		}
		/* Статус = Завершен */
		if (l_status == '2'){
			//console.log('/* Статус = Завершен */l_status == 2');
			$('#md_shift_change_btn').hide(); // Сдать смену смену
			$('#md_shift_reception_btn').hide(); // Принять смену смену
			$('#md_snapshot_wagon_btn').hide(); // Снимок местонахождения
			$('#md_save_shift_btn').hide();
		}
		if (!r_shift_update){
			//console.log('!r_shift_update');
			$('#md_change_status_btn').hide();
		}
	}
    start_loading_animation();
    
    
    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .appendTo('body');

    var l_title = 'Прием-Сдача смены';

    md_content.attr('title',l_title);
    
    
	md_content.railway_input = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(user_station_name);
	md_content.shift_num = $('<input>',{disabled:'','shift_change_id':'0',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}});
	md_content.users = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto','margin-left': '5px'}}).val(user_name);
	md_content.server_time = $('<input>',{disabled:'',type:'text', class:'text ui-widget-content ui-corner-all',css:{'width':'auto'}}).val(get_server_current_time());
	md_content.status = $('<select>');
	/*********************** Смену сдал *****************************/
	md_content.change_smena = $('<select>',{'requir':'Y',class:'required'});
	md_content.change_user = $('<select>',{'requir':'Y',class:'required'});
	md_content.start_date_shift = $('<input>',{type:'text','requir':'Y',class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
	md_content.time_change = $('<input>',{type:'text','requir':'Y',class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
	md_content.note_change = $('<input>',{type:'text', 'requir':'N',class:'text ui-widget-content ui-corner-all'});
	md_content.zu_total_change = $('<input>',{type:'text', 'requir':'N',class:'text ui-widget-content ui-corner-all'});
	md_content.zu_correct_change = $('<input>',{type:'text', 'requir':'N',class:'text ui-widget-content ui-corner-all'});
	md_content.zu_incorrect_change = $('<input>',{type:'text', 'requir':'N',class:'text ui-widget-content ui-corner-all'});
	/***************************************************************/
	
	/************************* Смену принял *****************************/
	md_content.reception_smena = $('<select>',{'requir':'Y',class:'required'});
	md_content.reception_user = $('<select>',{'requir':'Y',class:'required'});
	md_content.time_reception = $('<input>',{type:'text','requir':'Y',class:'text ui-widget-content ui-corner-all required'}).attr('size', '15');
	md_content.note_reception = $('<input>',{type:'text', 'requir':'N',class:'text ui-widget-content ui-corner-all'});
	md_content.zu_total_reception = $('<input>',{type:'text', 'requir':'N',class:'text ui-widget-content ui-corner-all'});
	md_content.zu_correct_reception = $('<input>',{type:'text', 'requir':'N',class:'text ui-widget-content ui-corner-all'});
	md_content.zu_incorrect_reception = $('<input>',{type:'text', 'requir':'N',class:'text ui-widget-content ui-corner-all'});
	/***************************************************************/
    
    var l_div_place_name = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Станция',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.railway_input);
	var l_div_shift_num = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Номер',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.shift_num); 
		
	/*********************** Смену сдал *****************************/
	var l_div_change_smena = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Смена',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.change_smena);
	var l_div_change_user = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Сдача смены',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.change_user);
	var l_div_start_date_shift = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата и время начала смены(Мск)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.start_date_shift); 
	var l_div_time_change = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата и время сдачи(Мск)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.time_change); 
	var l_div_note_change = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Примечание',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.note_change);
	var l_div_zu_total_change = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Итого ЗУ',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.zu_total_change); 
	var l_div_zu_correct_change = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Годных',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.zu_correct_change); 
	var l_div_zu_incorrect_change = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Исключены из использования',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.zu_incorrect_change); 
	/***************************************************************/
	
	/************************* Смену принял *****************************/
    var l_div_reception_smena = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Смена',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.reception_smena);
	var l_div_reception_user = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Смену принял',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.reception_user);
	var l_div_time_reception = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Дата и время приема(Мск)',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.time_reception); 
	
	var l_div_note_reception = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Примечание',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.note_reception); 
	var l_div_zu_total_reception = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Итого ЗУ',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.zu_total_reception);
	var l_div_zu_correct_reception = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Годных',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.zu_correct_reception); 
	var l_div_zu_incorrect_reception = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Исключены из использования',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.zu_incorrect_reception); 
	/************************************************************************/
	var l_div_info = 
            $('<div>',{css:{'display':'table','float':'left','padding-right':'10px'}})
			.append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'400px'}})
                        .append(l_div_shift_num)
						.append(l_div_place_name)
                    )
                )
            );    
    var l_div_users = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
		.append($('<label>',{text:'Статус',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
		.append(md_content.status)
		
	var l_div_server_time = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
		.append(md_content.server_time)
		.append(md_content.users);
		
	
	var l_div_info2 = 
            $('<div>',{css:{'display':'table','padding-right':'10px'}})
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
	var l_div_shift_change = 
            $('<div>',{css:{'display':'table','float':'left','padding-right':'10px'}}).append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{class:'header',css:{'width':'380px'}}).text('Сдача смены')
                )
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'400px'}})
                        .append(l_div_change_user)
						.append(l_div_change_smena)
						.append(l_div_start_date_shift)
						.append(l_div_time_change)
						.append(l_div_note_change)
						.append('<br>')
						.append(l_div_zu_total_change)
						.append(l_div_zu_correct_change)
						.append(l_div_zu_incorrect_change)
                    )
                )
            );
	var l_div_shift_reception = 
            $('<div>',{css:{'display':'table','float': 'left','padding-right':'10px'}}).append(
                $('<div>',{class:'border',css:{'clear':'both'}})
                .append(
                    $('<div>',{class:'header',css:{'width':'380px'}}).text('Прием смены')
                )
                .append(
                    $('<div>',{css:{'display':'inline-table'}}).append(
                        $('<div>',{class:'attr',css:{'border':'none','width':'400px'}})
                        .append(l_div_reception_user)
						.append(l_div_reception_smena)
						.append(l_div_time_reception)
						.append(l_div_note_reception)
						.append('<br>')
						.append(l_div_zu_total_reception)
						.append(l_div_zu_correct_reception)
						.append(l_div_zu_incorrect_reception)
						
                    )
                )
            );
	var railcar_table = new railcar_table_for_fix_device();
	var l_data_smena=
	fill_users_for_notification(md_content.change_user);
	fill_smena_for_shift(md_content.change_smena);
	fill_smena_for_shift(md_content.reception_smena);
	$(md_content.change_smena).on('change', function(){
		md_content.start_date_shift.val(get_curren_date_time(md_content.change_smena.find('option:selected').attr('from_time')));
	});
	$(md_content.reception_smena).on('change', function(){
		md_content.time_reception.val(get_curren_date_time(md_content.reception_smena.find('option:selected').attr('from_time')));
	});
	fill_status_for_shift(md_content.status);
	fill_users_for_notification(md_content.reception_user);
	
	init_date_time_input(md_content.time_change);
	init_date_time_input(md_content.start_date_shift);
	init_date_time_input(md_content.time_reception);
    $('<div>')
        .addClass('route-window-attr')
        //.css({'width':'38em'})
        .append(l_div_info)
		.append(l_div_info2)
		.append(l_div_shift_change)
		.append(l_div_shift_reception)
        .appendTo(md_content);
	md_content.append(railcar_table.get_table());
  
	md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+50' },
        buttons:{
            'Снимок места нахождения':{
                text: "Снимок места нахождения",
                id: "md_snapshot_wagon_btn",
                click: function(){
					railcar_table.add_cars_in_table(user_station_id,null);
                }   
            },
			'Сохранить':{
                text: "Сохранить",
                id: "md_save_shift_btn",
                click: function(){
					var l_btn = 'btn_save';
					var l_params_json = create_array_from_save();		
					if (!validation_save(l_btn)){
						 return;
					}
					$('#md_save_shift_btn').prop( "disabled", true);
					
					console.log(JSON.stringify(l_params_json));
					return;
					var f_res = save_shift_change(l_params_json);
					
					 var f_res_mas = f_res.split('$');
                     if (f_res_mas[0]=='done') {
                        var l_mes = '';
							l_data_save = 'Y';
                            l_mes = 'Данные сохранены!';//.ID='+f_res_mas[1];
						p_document.refresh_smena(false);
                        md_content.dialog("close");
						
                        create_info_modal_dialog_new('Оповещение',l_mes);
                    }else{
						l_data_save = 'N';
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!'+f_res_mas[1]);
                    };
                }   
            },
			'Сдать смену':{
                text: "Сдать смену",
                id: "md_shift_change_btn",
                click: function(){
					
					var l_btn = 'btn_change';
					var l_params_json = create_array_from_save();
						l_params_json.sign_of_change = 'Y';	
						l_params_json.button='btn_change';						
					if (!validation_save(l_btn)){
						 return;
					}
					$('#md_shift_change_btn').prop( "disabled", true);
					var f_res = save_shift_change(l_params_json);
					 var f_res_mas = f_res.split('$');
                     if (f_res_mas[0]=='done') {
                        var l_mes = '';
							l_data_save = 'Y';
                            l_mes = 'Данные сохранены!';//.ID='+f_res_mas[1];
						p_document.refresh_smena(false);
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение',l_mes);
                    }else{
						l_data_save = 'N';
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!'+f_res_mas[1]);
                    };
					
                }   
            },
			'Принять смену':{
                text: "Принять смену",
                id: "md_shift_reception_btn",
                click: function(){
					var l_btn = 'btn_reception';
					var l_params_json = create_array_from_save();
						l_params_json.sign_of_reception = 'Y';	
						l_params_json.button='btn_reception';						
					if (!validation_save(l_btn)){
						 return;
					}
					$('#md_shift_reception_btn').prop( "disabled", true);
					 var f_res = save_shift_change(l_params_json);
					 var f_res_mas = f_res.split('$');
                     if (f_res_mas[0]=='done') {
                        var l_mes = '';
							l_data_save = 'Y';
                            l_mes = 'Данные сохранены!';//.ID='+f_res_mas[1];
						p_document.refresh_smena(false);
                        md_content.dialog("close");
						
                        create_info_modal_dialog_new('Оповещение',l_mes);
                    }else{
						l_data_save = 'N';
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!'+f_res_mas[1]);
                    };
                }   
            },
			'Изменить статус': {
                text:'Изменить статус',
                id:'md_change_status_btn',
                click: function(){
                    function save_shift_status_ajax(){
						var v_params = {};
							v_params.shift_change_id=md_content.shift_num.attr('shift_change_id');
							v_params.status=md_lvl_2_content.status_select.val();
							v_params.status_descr=md_lvl_2_content.status_descr_input.val();
						var res = null;
                        $.ajax({
                            url: '../data.php',
                            type: 'POST',
                            dataType: "text",
                            async:false,
                            data: { params: JSON.stringify(v_params)
								   ,ajax_action: 'save_shift_status'},
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
                    
					fill_status_for_shift(md_lvl_2_content.status_select);

                    
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
                                id: "md_save_shift_status_btn",
                                click: function(){
                                    md_content.dialog("close");
                                    md_lvl_2_content.dialog("close");
                                    
                                     var f_res = save_shift_status_ajax();
                                     var f_res_mas = f_res.split('$');
									 if (f_res_mas[0]=='done') {
										var l_mes = '';
											l_data_save = 'Y';
											l_mes = 'Данные сохранены!';//.ID='+f_res_mas[1];
										p_document.refresh_smena(false);
										create_info_modal_dialog_new('Оповещение',l_mes);
									}else{
										l_data_save == 'N';
										create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!'+f_res_mas[1]);
									};
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
					if (l_data_save == 'N' && md_content.status.val() == '3'){
						message_after_close();
					} else {
						md_content.dialog("close");
						md_content.remove();
					}
					
                }
            }
        },
        close: function() {			
			md_content.dialog("close");
			md_content.remove();
        }
    });
	if (p_smena_item != null){
		//console.log(p_smena_item.data);
		var l_mass_short_wag = JSON.parse(p_smena_item.data.MASS_SHORT_WAG);
		var l_item = new Object();
		l_item.SNAPSHOT_SHORT=l_mass_short_wag;
		railcar_table.add_data_existing(l_item);
        md_content.shift_num.val(p_smena_item.data.SMENA_NUM);
		md_content.shift_num.attr('shift_change_id',p_smena_item.data.SHIFT_CHANGE_ID);
		md_content.status.val(p_smena_item.data.STATUS_ID);
		md_content.users.val(p_smena_item.data.CREATED_NAME);
		md_content.server_time.val(p_smena_item.data.CREATED_DATE);
		
		md_content.zu_total_change.val(p_smena_item.data.DEV_CHANGE_TOTAL);
		md_content.zu_correct_change.val(p_smena_item.data.DEV_CHANGE_CORRECT);
		md_content.zu_incorrect_change.val(p_smena_item.data.DEV_CHANGE_INCCORECT);

		md_content.change_smena.val(p_smena_item.data.SMENA_CHANGE_ID);
		md_content.change_user.val(p_smena_item.data.USER_CHANGE_ID);
		md_content.time_change.val(p_smena_item.data.DATE_CHANGE);
		md_content.note_change.val(p_smena_item.data.NOTE_CHANGE);
		md_content.start_date_shift.val(p_smena_item.data.START_DATE_SHIFT);
		
		md_content.reception_smena.val(p_smena_item.data.SMENA_RECEPTION_ID);
		md_content.reception_user.val(p_smena_item.data.USER_RECEPTION_ID);
		md_content.time_reception.val(p_smena_item.data.DATE_RECEPTION);
		md_content.note_reception.val(p_smena_item.data.NOTE_RECEPTION);
		
		if (p_smena_item.data.DEV_RECEPTION_TOTAL == '0' && p_smena_item.data.DEV_RECEPTION_CORRECT == '0' && p_smena_item.data.DEV_RECEPTION_INCCORECT){
			md_content.zu_total_reception.val(p_smena_item.data.DEV_CHANGE_TOTAL);
			md_content.zu_correct_reception.val(p_smena_item.data.DEV_CHANGE_CORRECT);
			md_content.zu_incorrect_reception.val(p_smena_item.data.DEV_CHANGE_INCCORECT);
		} else {
			md_content.zu_total_reception.val(p_smena_item.data.DEV_RECEPTION_TOTAL);
			md_content.zu_correct_reception.val(p_smena_item.data.DEV_RECEPTION_CORRECT);
			md_content.zu_incorrect_reception.val(p_smena_item.data.DEV_RECEPTION_INCCORECT);
		}
		
		//$('#md_save_shift_btn').prop( "disabled", true);
		
		//md_content.reception_smena.val(p_smena_item.data.SMENA_RECEPTION_ID);
    } else{
		md_content.status.val(1);
	}
    disable_save_btn();   
    stop_loading_animation();
}