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
    
    /***********************************/
    /*************** ЗУ ****************/
    /***********************************/
    this.station_spr = [];
    this.fixing_side_spr = [];
    
    $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_stations'},
        success: function (data) {
            l_this.station_spr = JSON.parse(data);
        }
    });
    
    $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {ajax_action: 'get_fixing_side'},
        success: function (data) {
            l_this.fixing_side_spr = JSON.parse(data);
        }
    });    
    
    this.tab1 = $('#tabs-1');
    
    this.tab1_section = $('<div>')
        .addClass('section')
        .css({'width':'auto','float':'none','height':'850px'})
        .appendTo(this.tab1);

    if (r_fix_dev_rule){
        this.add_fixing_device_rule_btn = $('<button>')
            .addClass('button')
            .css({'margin-left':'0.5em','margin-right':'0.5em','margin-top':'0.5em'})
            .append($('<span>').addClass('button-text button-text-size-3').text('Добавить правило'))
            .appendTo(this.tab1_section)
            .on('click', function(){
                open_fixing_device_rule_window(l_this);
            });
    }
    
    var fixing_device_rule_tbl = $('<table>')
        .addClass('route-table')
        .appendTo(this.tab1_section);

    $('<thead>')
        .appendTo(fixing_device_rule_tbl)
        .append($('<tr>')
                    .append($('<th>').addClass('route-table-th').text('Путь'))
                    .append($('<th>').addClass('route-table-th').text('Часть пути'))
                    .append($('<th>').addClass('route-table-th').text('Закрепление'))
                    .append($('<th>').addClass('route-table-th').text('Кол-во тормоз-ных башма-ков'))
                    .append($('<th>').addClass('route-table-th').text('Норма по фор-муле 1 (ИДП)'))
                    .append($('<th>').addClass('route-table-th').text('Норма по фор-муле 2 (ИДП)'))
                    .append($('<th>').addClass('route-table-th').text('Комментарий')));
    this.fixing_device_rule_tbl_body = $('<tbody>')
        .appendTo(fixing_device_rule_tbl);
        
    this.fixing_device_rule_mas = [];   
    
    this.add_fixing_device_rule_to_table = function(p_fixing_device_rule){
        function count(p_mas){
            var count = 0;
            p_mas.forEach(function (item){
                count++;
            });  
            return count;
        }
        var l_count = count(p_fixing_device_rule.rules);
        
        p_fixing_device_rule.rules.forEach(function (item,i){
            var l_rule_tr = $('<tr>').appendTo(l_this.fixing_device_rule_tbl_body);
            
            if (i===0){
                l_rule_tr.railway_td = $('<td>').appendTo(l_rule_tr).text((p_fixing_device_rule.railway_number===null?'':p_fixing_device_rule.railway_number)).attr({'rowspan':l_count});
                l_rule_tr.part_td = $('<td>').appendTo(l_rule_tr).text((p_fixing_device_rule.part_descr===null?'':p_fixing_device_rule.part_descr)).attr({'rowspan':l_count}).addClass('reference-text');
            }

            l_rule_tr.side_td = $('<td>').appendTo(l_rule_tr).text((item.side_descr===null?'':item.side_descr));
            l_rule_tr.cnt_skid_td = $('<td>').appendTo(l_rule_tr).text((item.cnt_skid===null?'':item.cnt_skid));
            l_rule_tr.cnt_axis_1_td = $('<td>').appendTo(l_rule_tr).text((item.cnt_axis_1===null?'':item.cnt_axis_1));
            l_rule_tr.cnt_axis_2_td = $('<td>').appendTo(l_rule_tr).text((item.cnt_axis_2===null?'':item.cnt_axis_2));
            l_rule_tr.descr_td = $('<td>').appendTo(l_rule_tr).text((item.descr===null?'':item.descr));
            
            item.tr = l_rule_tr;
        });  
        /*var l_fuel_standart = $('<tr>').appendTo(l_this.fixing_device_rule_tbl_body);

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
        
        return l_fuel_standart;*/
    };
    
    this.refresh_fixing_device_rule = function(p_async,p_part_id){
        start_loading_animation();
        var l_param = {};
        l_param.part_id = p_part_id;
        
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: p_async,
            data: { params: JSON.stringify(l_param)
                   ,ajax_action: 'get_fixing_device_rule'
                  },
            success: function (data) {
                var l_fixing_device_rule = JSON.parse(data);
                var l_prev_part_id = 0;
                l_fixing_device_rule.forEach(function (item){
                    var l_rule = {rule_id:item.RULE_ID,side:item.SIDE,side_descr:item.SIDE_DESCR,cnt_skid:item.CNT_SKID
                                 ,cnt_axis_1:item.CNT_AXIS_1,cnt_axis_2:item.CNT_AXIS_2,descr:item.DESCR
                                 ,last_update_date:item.LAST_UPDATE_DATE};

                    if (l_prev_part_id!=item.PART_ID){
                        l_this.fixing_device_rule_mas[item.PART_ID] = {railway_id:item.RAILWAY_ID,railway_number:item.RAILWAY_NUMBER,part_id:item.PART_ID,part_descr:item.PART_DESCR,rules:[l_rule]};
                    } else{
                        l_this.fixing_device_rule_mas[item.PART_ID].rules.push(l_rule);
                    }

                    l_prev_part_id=item.PART_ID;
                    /*var l_exists_item = false;
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
                    }*/
                });
                
                if (p_part_id !== null){
                    l_this.add_fixing_device_rule_to_table(l_this.fixing_device_rule_mas[l_prev_part_id]);
                }else{
                    l_this.fixing_device_rule_mas.forEach(function (item){
                        l_this.add_fixing_device_rule_to_table(item);
                    });
                }
                
                /*l_this.fuel_standart_mas.forEach(function(fuel_standart){
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
                });*/
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        }); 
        stop_loading_animation();
    };

    l_this.refresh_fixing_device_rule(false,null);
    
    /***********************************/
    /********* Места хранения **********/
    /***********************************/
    this.tab2 = $('#tabs-2');
    
    this.tab2_section = $('<div>')
        .addClass('section')
        .css({'width':'auto','float':'none','height':'850px'})
        .appendTo(this.tab2);

    if (r_fix_dev_place){
        this.add_storage_place_btn = $('<button>')
            .addClass('button')
            .css({'margin-left':'0.5em','margin-right':'0.5em','margin-top':'0.5em'})
            .append($('<span>').addClass('button-text button-text-size-3').text('Добавить место'))
            .appendTo(this.tab2_section)
            .on('click', function(){
                open_storage_place_window(l_this);
            });
    }
    
    var storage_place_tbl = $('<table>')
        .addClass('storage-table storage-place-table')
        .appendTo(this.tab2_section);

    $('<thead>')
        .appendTo(storage_place_tbl)
        .append($('<tr>')
                    .append($('<th>').addClass('storage-place-table').text('Место хранения'))
                    .append($('<th>').addClass('storage-place-table').text('Контрольное кол-во'))
                    .append($('<th>').addClass('storage-place-table').text('Верхний уровень'))
                    .append($('<th>').addClass('storage-place-table').text('Родитель'))
                    .append($('<th>').addClass('storage-place-table').text('Клеймо'))
					.append($('<th>').addClass('storage-place-table').text('Путь'))
					.append($('<th>').addClass('storage-place-table').text('Закрепление/Снятие. Кто проводит'))
                    .append($('<th>').addClass('storage-place-table').text('Закрепление/Снятие. Кому докладывает'))
                    //.append($('<th>').addClass('storage-place-table').text('Снятие. Кто проводит'))
                    //.append($('<th>').addClass('storage-place-table').text('Снятие. Кому докладывает'))
                    .append($('<th>').addClass('storage-place-table').text('Ответсвенный за учет'))
                    .append($('<th>').addClass('storage-place-table').text('Ответсвенный Прием/Сдача смены'))
                    
					);
    
    this.storage_place_tbl_body = $('<tbody>')
        .appendTo(storage_place_tbl);
    
    this.storage_place_mas = [];   
    
    this.add_storage_place_to_table = function(p_storage_place){
        
		function count(p_mas){
            var count = 0;
            p_mas.forEach(function (item){
                count++;
            });  
            return count;
        }
        var l_count = count(p_storage_place.RAILWAY_MAS);
		
        
        p_storage_place.RAILWAY_MAS.forEach(function (item,i){
            var l_rule_tr = $('<tr>').appendTo(l_this.storage_place_tbl_body);

            if (i===0){
                l_rule_tr.railway_td = $('<td>').appendTo(l_rule_tr).text((p_storage_place.PLACE_NAME===null?'':p_storage_place.PLACE_NAME)).attr({'rowspan':l_count}).addClass('reference-text');
				l_rule_tr.railway_td.on('click', function(){/*console.log(l_rule_tr.railway_td);*/});
                l_rule_tr.part_td = $('<td>').appendTo(l_rule_tr).text((p_storage_place.CONTROL_COUNT===null?'':p_storage_place.CONTROL_COUNT)).attr({'rowspan':l_count});
                l_rule_tr.railway_td = $('<td>').appendTo(l_rule_tr).text((p_storage_place.TOP_LEVEL==='Y'?'Да':'Нет')).attr({'rowspan':l_count});
                l_rule_tr.part_td = $('<td>').appendTo(l_rule_tr).text((p_storage_place.PARENT_NAME===null?'':p_storage_place.PARENT_NAME)).attr({'rowspan':l_count});
				l_rule_tr.device_td = $('<td>').css({'word-wrap':'break-word'}).appendTo(l_rule_tr).text((p_storage_place.DEVICE_STR===null?'':p_storage_place.DEVICE_STR)).attr({'rowspan':l_count});
            }
			l_rule_tr.place_name_td = $('<td>').appendTo(l_rule_tr).text((item.railway_number===null?'':item.railway_number)); // Название путей    
			if (i===0){
			 //l_rule_tr.fixing_person_1 = $('<td>').appendTo(l_rule_tr).text((p_storage_place.FIXING_PERSON_1_DESCR===null?'':p_storage_place.FIXING_PERSON_1_DESCR)).attr({'rowspan':l_count});
				l_rule_tr.device_td = $('<td>').appendTo(l_rule_tr).text((p_storage_place.CON_PERSON_STR===null?'':p_storage_place.CON_PERSON_STR)).attr({'rowspan':l_count});
                //l_rule_tr.fixing_person_2 = $('<td>').appendTo(l_rule_tr).text((p_storage_place.FIXING_PERSON_2_DESCR===null?'':p_storage_place.FIXING_PERSON_2_DESCR)).attr({'rowspan':l_count});
				l_rule_tr.device_td = $('<td>').appendTo(l_rule_tr).text((p_storage_place.CON_PERSON_STR===null?'':p_storage_place.REP_PERSON_STR)).attr({'rowspan':l_count});
                
				//l_rule_tr.remove_person_1 = $('<td>').appendTo(l_rule_tr).text((p_storage_place.REMOVE_PERSON_1_DESCR===null?'':p_storage_place.REMOVE_PERSON_1_DESCR)).attr({'rowspan':l_count});
                //l_rule_tr.remove_person_2 = $('<td>').appendTo(l_rule_tr).text((p_storage_place.REMOVE_PERSON_2_DESCR===null?'':p_storage_place.REMOVE_PERSON_2_DESCR)).attr({'rowspan':l_count});
                //l_rule_tr.control_person_1 = $('<td>').appendTo(l_rule_tr).text((p_storage_place.CONTROL_PERSON_1_DESCR===null?'':p_storage_place.CONTROL_PERSON_1_DESCR)).attr({'rowspan':l_count});
                l_rule_tr.control_person_2 = $('<td>').appendTo(l_rule_tr).text((p_storage_place.CONTROL_PERSON_1_DESCR===null?'':p_storage_place.CONTROL_PERSON_1_DESCR)).attr({'rowspan':l_count});
				
				l_rule_tr.device_td = $('<td>').appendTo(l_rule_tr).text((p_storage_place.RES_PERSON_STR===null?'':p_storage_place.RES_PERSON_STR)).attr({'rowspan':l_count}); // Ответсвенный Прием/Сдача смены
				
            }
			
            
            
            item.tr = l_rule_tr;
        });  
    };
    
    this.refresh_storage_place = function(p_async,p_place_id){
        start_loading_animation();
        var l_param = {};
        l_param.place_id = p_place_id;
		//console.log('l_param='+JSON.stringify(l_param));
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: p_async,
            data: { params: JSON.stringify(l_param)
                   ,ajax_action: 'get_storage_place'
                  },
            success: function (data) {
				//console.log('data='+data);
				//return;
                var l_storage_place = JSON.parse(data);
                l_storage_place.forEach(function (item){
                    item.pos = l_this.storage_place_mas.length;
                    l_this.storage_place_mas[item.pos] = item;
					//console.log('RAILWAY_MAS='+item['RAILWAY_MAS']);
					//if (item.RAILWAY_MAS !== undefined){
						//console.log('RAILWAY_MAS='+item.RAILWAY_MAS);
						item.RAILWAY_MAS = JSON.parse(item.RAILWAY_MAS);
					//}
					//if (item.DEVICE_MAS !== undefined){
						//console.log('RAILWAY_MAS='+item.RAILWAY_MAS);
						 item.DEVICE_MAS = JSON.parse(item.DEVICE_MAS);
					//}
					//if (item.CON_PERSON_MAS !== undefined){
						//console.log('RAILWAY_MAS='+item.RAILWAY_MAS);
						item.PERSONC_MAS = JSON.parse(item.CON_PERSON_MAS);
					//}
					//console.log(item);
					l_this.add_storage_place_to_table(item);
                });
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        }); 
        stop_loading_animation();
    };  

    l_this.refresh_storage_place(false,null);
});

function open_railway_part_window(_callback,p_railway,p_part_id){
    function save_part_ajax(){
        var l_part_id = '';
        if (p_part_id != null){
            l_part_id = p_part_id;
        }
        
        var l_param = {};
        l_param.railway_id = p_railway;
        l_param.descr = md_content.part_descr.val();
        
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { partid: l_part_id
                   ,add_data: JSON.stringify(l_param)
                   ,ajax_action: 'save_railway_part'},
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

    var l_title = 'Часть пути';
    
    md_content.attr('title',l_title);
    
    md_content.part_descr = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'15em'}}).val('Весь путь');
    
    var l_div_station = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Наименование',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.part_descr);     

    $('<div>')
        .addClass('route-window-attr')
        .css({'width':'30em'})
        .append(l_div_station)
        .appendTo(md_content);
    
    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Сохранить':{
                text: "Сохранить",
                id: "md_save_part_btn",
                click: function(){    
                    var f_res = save_part_ajax();
                    var f_res_mas = f_res.split('$');
                    if (f_res_mas[0]=='done') {
                        var l_mes = '';
                        //if (p_fuel_standart == null){
                            l_mes = 'Часть пути создана!';
                        //} else{
                        //    l_mes = 'Норма обновлена!';
                        //}
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
            _callback(p_railway); 
        }
    });
}

function open_fixing_device_rule_window(p_document,p_fixing_device_rule_item){
    function rule_tbl(){
        var self = this;
        this.rule_count = 0;
        
        var tr_mas = [];
        
        var return_table = $('<div>');
        return_table.append(
            '<table class="weigh_import_table cars_table">'+
                '<thead>'+
                    '<tr>'+
                        '<th>Сторона закрепления</th>'+
                        '<th>Кол-во торм. башмаков</th>'+
                        '<th>Норма по фор-муле 1 (ИДП)</th>'+
                        '<th>Норма по фор-муле 2 (ИДП)</th>'+
                        '<th>Комментарий</th>'+
                    '</tr>'+
                '</thead>'+
            '</table>'
        );

        return_table.rule_table = $('<table>',{class:'weigh_import_table cars_table'}).append($('<tbody>'));
        return_table.append(
            $('<div>',{class:'modalDialogContainer',css:{'display':'inline-block'}})  
            .append(return_table.rule_table)
        );
            
        function del_cars_table_tr(p_tr){
            delete tr_mas[p_tr.pos];
            p_tr.remove();
            self.rule_count--;
        }    
        
        this.empty_table = function(){
            return_table.find('tbody').empty();
            tr_mas = [];
            self.rule_count = 0;
        };

        this.add_rule_in_table = function(p_rule_id,p_side,p_cnt_skid,p_cnt_axis_1,p_cnt_axis_2){
            self.rule_count++;
            
            var tr = $('<tr/>');

            tr.side_select = $('<select>')
                .css({'width':'7em'})
                .addClass('text ui-widget-content ui-corner-all');
            
            l_this.fixing_side_spr.forEach(function(item){
                tr.side_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
            }); 
            

            tr.cnt_skid = $('<input>')
                .attr({'type':'text','maxlength':'6'})
                .css({'width':'6em'})
                .addClass('text ui-widget-content ui-corner-all')
                .on('keyup', function(){
                    $(this).val($(this).val().replace (/[^0-9,]/, ''));
                });
                                
            tr.cnt_axis_1 = $('<input>')
                .attr({'type':'text','maxlength':'6'})
                .css({'width':'6em'})
                .addClass('text ui-widget-content ui-corner-all')
                .on('keyup', function(){
                    $(this).val($(this).val().replace (/[^0-9,]/, ''));
                });
                
            tr.cnt_axis_2 = $('<input>')
                .attr({'type':'text','maxlength':'6'})
                .css({'width':'6em'})
                .addClass('text ui-widget-content ui-corner-all')
                .on('keyup', function(){
                    $(this).val($(this).val().replace (/[^0-9,]/, ''));
                });
                
            tr.descr = $('<input>')
                .attr({'type':'text','maxlength':'50'})
                .css({'width':'15em'})
                .addClass('text ui-widget-content ui-corner-all');

            tr.append($('<td>').append(tr.side_select));
            tr.append($('<td>').append(tr.cnt_skid));
            tr.append($('<td>').append(tr.cnt_axis_1));
            tr.append($('<td>').append(tr.cnt_axis_2));
            tr.append($('<td>').append(tr.descr));
            tr.append(
                $('<td>').append(
                    $('<div>',{class:'deleteImage deleteImage13px'}).on('click', function(){
                        del_cars_table_tr(tr);
                    })
                )
            );

            tr.appendTo(return_table.rule_table);
            
            tr.pos = tr_mas.length;
            tr_mas[tr.pos] = tr;
        };

        this.get_rules_in_table = function(){
            var l_result = [];
            tr_mas.forEach(function(tr){
                var l_item = {};
                l_item.side = tr.side_select.val()==''?'':tr.side_select.val();
                l_item.cnt_skid = tr.cnt_skid.val()==''?'':tr.cnt_skid.val();
                l_item.cnt_axis_1 = tr.cnt_axis_1.val()==''?'':tr.cnt_axis_1.val();
                l_item.cnt_axis_2 = tr.cnt_axis_2.val()==''?'':tr.cnt_axis_2.val();
                l_item.descr = tr.descr.val()==''?'':tr.descr.val();
                l_result.push(l_item);
            });
            return l_result;
        };
        
        this.get_rules_date_in_table = function(){
            var l_result = [];
            tr_mas.forEach(function(item){
                l_result.push(item.date_input.val()==''?'_':item.date_input.val());
            });
            return l_result;
        };

        this.get_table = function(){
            return return_table;
        };
    };
    function refresh_part_select(p_railway_id){
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {railway_id: p_railway_id
                    ,ajax_action: 'get_railway_part'},
            success: function (data) {
                var l_part_mas = JSON.parse(data);
                
                md_content.railway_part_select.find('option').remove();
                md_content.railway_part_select.combobox("clear");
                md_content.railway_part_select.val('');

                md_content.railway_part_select.append($('<option>',{'val':'','text':''}));
                
                $.each(l_part_mas, function(i, item) {
                    md_content.railway_part_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
                });  
            }
        });
    }
	/* Сохранить правило (ЗУ) */
    function save_fixing_device_rule_ajax(p_add_data){                
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { add_data: p_add_data
                   ,ajax_action: 'save_fixing_device_rule'},
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

    var l_title = 'Правило';

    md_content.attr('title',l_title);
    
    md_content.station_select = $('<select>',{class:'route-window-attr-item-elem'}); 
    md_content.railway_select = $('<select>',{class:'route-window-attr-item-elem',css:{'width':'15em'}}); 
    md_content.railway_part_select = $('<select>',{class:'route-window-attr-item-elem',css:{'width':'15em'}}); 
    md_content.add_rule_btn = $('<input>',{type:'button', class:'btnFind'}).val('Добавить правило');
    
    md_content.add_railway_part_btn = $('<button>')
        .addClass('request-button request-titlebar-add-button part-titlebar-add-button')
        .attr('title','Добавить часть пути')
        .append('<span class="request-button-icon request-titlebar-add-icon"></span>')
        .on('click', function(){
            open_railway_part_window(refresh_part_select,md_content.railway_select.val());
        });
    md_content.add_railway_part_btn.hide();
    
    md_content.station_select.append($('<option>',{'val':'','text':''}));
    l_this.station_spr.forEach(function(item){
        if (item.ID !== '1'){
            md_content.station_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
        }
    }); 
    
    md_content.station_select.on('select',function(){
        var l_railways = [];
        $.ajax({
            url: '/data.php',
            type: 'POST',
            dataType: "text",
            data:   {station_id: md_content.station_select.val()
                    ,ajax_action: 'get_railways_for_request'},
            success: function (data) {
                    l_railways = JSON.parse(data);
                    
                    md_content.railway_select.find('option').remove();
                    md_content.railway_select.combobox("clear");
                    md_content.railway_select.val('');
                    
                    md_content.railway_select.append($('<option>',{'val':'','text':''}));
                    $.each(l_railways, function(i, item) {
                        md_content.railway_select.append($('<option>',{'val':item.ID,'text':item.NAME}).css({'margin-left':((item.LVL-1)*10 + 'px')}));
                    });  
                    
                    md_content.add_railway_part_btn.hide();
                }
        });  
    });   
    
    md_content.railway_select.on('select',function(){
        refresh_part_select(md_content.railway_select.val());
        if ($(this).val() == null){
            md_content.add_railway_part_btn.hide();
        }else{
            md_content.add_railway_part_btn.show();
        }
    }); 

    var l_div_station = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Станция',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.station_select);     
    var l_div_railway = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Путь',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.railway_select); 
    var l_div_railway_part = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Часть пути',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.railway_part_select)
        .append(md_content.add_railway_part_btn);
    var l_add_rule_div = $('<div>',{css:{'text-align':'left'}})
        .addClass('route-window-attr-item helper-clearfix')
        .append(md_content.add_rule_btn); 

    var rule_table = new rule_tbl(); 

    $('<div>')
        .addClass('route-window-attr')
        .css({'width':'38em'})
        .append(l_div_station)
        .append(l_div_railway)
        .append(l_div_railway_part)
        .append(l_add_rule_div)
        .append(rule_table.get_table())
        .appendTo(md_content);

    md_content.add_rule_btn.on('click', function(){
        rule_table.add_rule_in_table();
    });

    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Сохранить норму':{
                text: "Сохранить",
                id: "md_save_route_btn",
                click: function(){  
                    var l_rule = {};
                    l_rule.railway_id = md_content.railway_select.val();
                    l_rule.part_id = md_content.railway_part_select.val();
                    l_rule.rule_mas = rule_table.get_rules_in_table();
                    var l_rule_json = JSON.stringify(l_rule);
                    
                    var f_res = save_fixing_device_rule_ajax(l_rule_json);
                    var f_res_mas = f_res.split('$');
                    if (f_res_mas[0]=='done') {
                        var l_mes = '';
                        //if (p_fuel_standart == null){
                            l_mes = 'Правила сохранены';
                            p_document.refresh_fixing_device_rule(false,l_rule.part_id);
                        //} else{
                        //    l_mes = 'Норма обновлена!';
                        //}
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
    
    md_content.station_select.combobox({menuMaxHeight: '25em'});
    md_content.railway_select.combobox({menuMaxHeight: '25em'});
    md_content.railway_part_select.combobox({menuMaxHeight: '25em'});
}
/* Открыть окно места хранения */
function open_storage_place_window(p_document,p_fixing_device_rule_item){
    /* Список стаций(chexbox) */
	function railway_list(){
        var self = this;
        
        var l_return_div = $('<div>');
        
        var l_station_select = $('<select>',{class:'',css:{'margin-left':'8px'}}); 
        
        var l_ul = $('<ul>',{class:'ui-autocomplete ui-front ui-menu ui-widget ui-widget-content',css:{'max-height':'30em','height':'30em','display':'block','position':'static'}});

        //l_station_select.append($('<option>',{'val':'','text':''}));
        l_this.station_spr.forEach(function(item){
            if (item.ID !== '1'){
                l_station_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
            }
        }); 

        l_station_select.on('change',function(){
            l_ul.find('li').remove();
            $.ajax({
                url: '/data.php',
                type: 'POST',
                dataType: "text",
                data:   {station_id: l_station_select.val()
                        ,ajax_action: 'get_railways_for_request'},
                success: function (data) {
                        var l_railways = JSON.parse(data);

                        $.each(l_railways, function(i, item) {
                            l_ul.append($('<li>',{'class':'ui-menu-item','css':{'margin-left':((item.LVL-1)*10 + 'px')}})
                                            .append($('<input>',{'station_id': l_station_select.val(),'id':item.ID,'type':'checkbox','css':{'position':'relative','top':'2px'}}))
                                            .append(item.NAME));
                        });  
                    }
            });  
        });   
        
        l_station_select.triggerHandler('change');

        l_return_div
            .appendTo(md_content)
            .css({'display':'inline-table'})
            .append(
                $('<div>')
                    .addClass('border')
                    .css({'clear':'both'})
                    .append(
                        $('<div>')
                            .addClass('header')
                            .css({'width':'220px'})
                            .append('Станция')
                            .append(l_station_select)
                            
                    )
                    .append(
                        $('<div>')
                            .css({'display':'inline-table'})
                            .append(l_ul)
                    )
            );

        this.get_railways_in_list = function(){
            var l_result = [];
            l_ul.find('li > input:checked').each(function(index){
                var l_item = {};
				l_item.station_id = $(this).attr('station_id');
                l_item.railway_id = $(this).attr('id');
                l_result.push(l_item);
            });
            return l_result;
        };

        this.get_list = function(){
            return l_return_div;
        };
    };
	/* Закрепление/Снятие.Кто проводит */
	function fixing_person_list(){
        var self = this;
        
        var l_return_div = $('<div>');
        
        //var l_station_select = $('<select>',{class:'',css:{'margin-left':'8px'}}); 
        
        var l_ul = $('<ul>',{class:'ui-autocomplete ui-front ui-menu ui-widget ui-widget-content',css:{'max-height':'30em','height':'30em','max-width':'20em','width':'15em','display':'block','position':'static'}});

        //l_station_select.append($('<option>',{'val':'','text':''}));
        /*l_this.station_spr.forEach(function(item){
            if (item.ID !== '1'){
                l_station_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
            }
        }); */
        l_ul.find('li').remove();
        $.ajax({
            url: '/data.php',
            type: 'POST',
            dataType: "text",
            data:   {ajax_action: 'get_fixing_person_for_request'},
            success: function (data) {
                     var l_fix_person = JSON.parse(data);
                     
					 $.each(l_fix_person, function(i, item) {
                        l_ul.append($('<li>',{'class':'ui-menu-item'})
                                        .append($('<input>',{'id':item.ID,'type':'checkbox','css':{'position':'relative','top':'2px'}}))
                                        .append(item.NAME));
                     });  
                }
        });  
        
        
        //l_station_select.triggerHandler('change');

        l_return_div
            .appendTo(md_content)
            .css({'display':'inline-table','margin-left':'1em'})
            .append(
                $('<div>')
                    .addClass('border')
                    .css({'clear':'both'})
                    .append(
                        $('<div>')
                            .addClass('header')
                            .css({'width':'150px'})
                            .append('Кто проводит')
                            //.append(l_station_select)
                            
                    )
                    .append(
                        $('<div>')
                            .css({'display':'inline-table'})
                            .append(l_ul)
                    )
            );
		
        this.fixing_person_in_list = function(){
            var l_result = [];
            l_ul.find('li > input:checked').each(function(index){
                var l_item = {};
                l_item.person_id = $(this).attr('id');
                l_result.push(l_item);
            });
            return l_result;
        };
		
        this.get_list = function(){
            return l_return_div;
        };
    };
	/* Закрепление/Снятие.Кому докладывают */
	function control_person_list(){
        var self = this;
        
        var l_return_div = $('<div>');
        
        //var l_station_select = $('<select>',{class:'',css:{'margin-left':'8px'}}); 
        
        var l_ul = $('<ul>',{class:'ui-autocomplete ui-front ui-menu ui-widget ui-widget-content',css:{'max-height':'30em','height':'30em','max-width':'20em','width':'15em','display':'block','position':'static'}});

        //l_station_select.append($('<option>',{'val':'','text':''}));
        /*l_this.station_spr.forEach(function(item){
            if (item.ID !== '1'){
                l_station_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
            }
        }); */
        l_ul.find('li').remove();
        $.ajax({
            url: '/data.php',
            type: 'POST',
            dataType: "text",
            data:   {ajax_action: 'get_control_person_for_request'},
            success: function (data) {
                     var l_fix_person = JSON.parse(data);
                     
					 $.each(l_fix_person, function(i, item) {
                        l_ul.append($('<li>',{'class':'ui-menu-item'})
                                        .append($('<input>',{'id':item.ID,'type':'checkbox','css':{'position':'relative','top':'2px'}}))
                                        .append(item.NAME));
                     });  
                }
        });  
        
        
        //l_station_select.triggerHandler('change');

        l_return_div
            .appendTo(md_content)
            .css({'display':'inline-table','margin-left':'1em'})
            .append(
                $('<div>')
                    .addClass('border')
                    .css({'clear':'both'})
                    .append(
                        $('<div>')
                            .addClass('header')
                            .css({'width':'150px'})
                            .append('Кому докладывает')
                            //.append(l_station_select)
                            
                    )
                    .append(
                        $('<div>')
                            .css({'display':'inline-table'})
                            .append(l_ul)
                    )
            );
		
        this.control_person_in_list = function(){
            var l_result = [];
            l_ul.find('li > input:checked').each(function(index){
                var l_item = {};
                l_item.person_id = $(this).attr('id');
                l_result.push(l_item);
            });
            return l_result;
        };
		
        this.get_list = function(){
            return l_return_div;
        };
    };
	/* Ответсвенный за прием/сдачу смены */
	function respon_person_list(){
        var self = this;
        
        var l_return_div = $('<div>');
        
        //var l_station_select = $('<select>',{class:'',css:{'margin-left':'8px'}}); 
        
        var l_ul = $('<ul>',{class:'ui-autocomplete ui-front ui-menu ui-widget ui-widget-content',css:{'max-height':'30em','height':'30em','max-width':'20em','width':'15em','display':'block','position':'static'}});

        //l_station_select.append($('<option>',{'val':'','text':''}));
        /*l_this.station_spr.forEach(function(item){
            if (item.ID !== '1'){
                l_station_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
            }
        }); */
        l_ul.find('li').remove();
        $.ajax({
            url: '/data.php',
            type: 'POST',
            dataType: "text",
            data:   {ajax_action: 'get_respon_person_for_request'},
            success: function (data) {
                     var l_fix_person = JSON.parse(data);
                     
					 $.each(l_fix_person, function(i, item) {
                        l_ul.append($('<li>',{'class':'ui-menu-item'})
                                        .append($('<input>',{'id':item.ID,'type':'checkbox','css':{'position':'relative','top':'2px'}}))
                                        .append(item.NAME));
                     });  
                }
        });  
        
        
        //l_station_select.triggerHandler('change');

        l_return_div
            .appendTo(md_content)
            .css({'display':'inline-table','margin-left':'1em'})
            .append(
                $('<div>')
                    .addClass('border')
                    .css({'clear':'both'})
                    .append(
                        $('<div>')
                            .addClass('header')
                            .css({'width':'150px'})
                            .append('Ответсвенный за прием/сдачу смены')
                            //.append(l_station_select)
                            
                    )
                    .append(
                        $('<div>')
                            .css({'display':'inline-table'})
                            .append(l_ul)
                    )
            );
		
        this.respon_person_in_list = function(){
            var l_result = [];
            l_ul.find('li > input:checked').each(function(index){
                var l_item = {};
                l_item.person_id = $(this).attr('id');
                l_result.push(l_item);
            });
            return l_result;
        };
		
        this.get_list = function(){
            return l_return_div;
        };
    };
	/* Список башмаков(chexbox) */
    function fixing_device_list(){
        var self = this;
        
        var l_return_div = $('<div>');
        
        var l_ul = $('<ul>',{class:'ui-autocomplete ui-front ui-menu ui-widget ui-widget-content',css:{'max-height':'30em','height':'30em','display':'block','position':'static'}});
        
        var l_seg_2 = $('<select>',{class:'',css:{'width':'3.5em'}}); 
        var l_seg_4_f = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'2em'}});
        var l_seg_4_l = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'2em'}});
        var l_seg_5 = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'1em'}});
        
        l_seg_2.append($('<option>',{'val':'','text':''}));
        l_seg_2.append($('<option>',{'val':'БО','text':'БО'}));
        l_seg_2.append($('<option>',{'val':'СН','text':'СН'}));
        
        var l_refresh_btn = $('<div>',{class:'refresh',title:'Обновить',css:{'position':'relative','float':'right','top':'1px','right':'2px'}});
        
        l_refresh_btn.on('click',function(){
            l_ul.find('li > input:not(:checked)').parent().remove();
            
            var l_param = {};
            
            l_param.seg2 = l_seg_2.val();
            l_param.seg4f = l_seg_4_f.val();
            l_param.seg4l = l_seg_4_l.val();
            l_param.seg5 = l_seg_5.val();
            
            $.ajax({
                url: '/data.php',
                type: 'POST',
                dataType: "text",
                data:   {params: JSON.stringify(l_param)
                        ,ajax_action: 'get_fixing_device'},
                success: function (data) {
                        var l_fd = JSON.parse(data);

                        $.each(l_fd, function(i, item) {
                            if (l_ul.find('li > input[id="'+item.ID+'"]').length===0){
                                l_ul.append($('<li>',{'class':'ui-menu-item'})
                                                .append($('<input>',{'id':item.ID,'type':'checkbox','css':{'position':'relative','top':'2px'}}))
                                                .append(item.NAME));
                            }        
                        });  
                    }
            });  
        }); 

        l_return_div
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
                            .css({'display':'inline-table'})
                            .append(l_ul)
                    )
            );

        this.get_fixing_device_in_list = function(){
            var l_result = [];
            l_ul.find('li > input:checked').each(function(index){
                var l_item = {};
                l_item.device_id = $(this).attr('id');
                l_result.push(l_item);
            });
            return l_result;
        };

        this.get_list = function(){
            return l_return_div;
        };
    };
	/* Сохранить данные */
    function save_storage_place_ajax(p_add_data){                
        var res = null;
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async:false,
            data: { add_data: p_add_data
                   ,ajax_action: 'save_storage_place'},
            success: function (data) {
                res = data;
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
        return res;
    }
    
    start_loading_animation();
    
    if (p_document.cond_train_dr.length == 0) {
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_cond_train_dr'},
            success: function (data) {p_document.cond_train_dr = JSON.parse(data);}
        });
    }
    if (p_document.users.length == 0) {
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {ajax_action: 'get_open_users'},
            success: function (data) {p_document.users = JSON.parse(data);}
        });
    }
    
    var md_content = $('<div/>')
        .addClass('md-lvl-1')
        .appendTo('body');

    var l_title = 'Места хранения';

    md_content.attr('title',l_title);
    
    md_content.place_name_input = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'20em'}});
    md_content.control_count_input = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'5em'}});
    md_content.top_level_select = $('<select>',{class:'route-window-attr-item-elem'}); 
    md_content.parent_select = $('<select>',{class:'route-window-attr-item-elem',css:{'width':'15em'}}); 
    md_content.fixing_person_1 = $('<select>',{class:'route-window-attr-item-elem',css:{'width':'15em'}});
    md_content.fixing_person_2 = $('<select>',{class:'route-window-attr-item-elem',css:{'width':'15em'}});
    md_content.remove_person_1 = $('<select>',{class:'route-window-attr-item-elem',css:{'width':'15em'}});
    md_content.remove_person_2 = $('<select>',{class:'route-window-attr-item-elem',css:{'width':'15em'}});
    md_content.control_person_1 = $('<select>',{class:'route-window-attr-item-elem',css:{'width':'15em'}});
    md_content.control_person_2 = $('<select>',{class:'route-window-attr-item-elem',css:{'width':'15em'}});
    
    md_content.control_count_input.on('keyup', function(){
        $(this).val($(this).val().replace (/[^0-9,]/, ''));
    });
    
    md_content.top_level_select.append($('<option>',{'val':'Y','text':'Да'}));
    md_content.top_level_select.append($('<option>',{'val':'N','text':'Нет'}));
    md_content.top_level_select.val('N');
    
    md_content.fixing_person_1.append($('<option>',{'val':'','text':''}));
    md_content.remove_person_1.append($('<option>',{'val':'','text':''}));
    md_content.fixing_person_2.append($('<option>',{'val':'','text':''}));
    md_content.remove_person_2.append($('<option>',{'val':'','text':''}));
    md_content.control_person_1.append($('<option>',{'val':'','text':''}));
    md_content.control_person_2.append($('<option>',{'val':'','text':''}));
    
    p_document.cond_train_dr.forEach(function(item){
        md_content.fixing_person_1.append($('<option>',{'val':item.ID,'text':item.NAME}));
        md_content.remove_person_1.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    
    p_document.users.forEach(function(item){
        md_content.fixing_person_2.append($('<option>',{'val':item.ID,'text':item.NAME}));
        md_content.remove_person_2.append($('<option>',{'val':item.ID,'text':item.NAME}));
        md_content.control_person_1.append($('<option>',{'val':item.ID,'text':item.NAME}));
        md_content.control_person_2.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    
    md_content.parent_select.append($('<option>',{'val':'','text':''}));
    $.ajax({
        url: '/data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data:   {params: ''
                ,ajax_action: 'get_parent_storage_place'},
        success: function (data) {
                var l_fd = JSON.parse(data);
                
                $.each(l_fd, function(i, item) {
                    md_content.parent_select.append($('<option>',{'val':item.ID,'text':item.NAME}));     
                });  
            }
    });   
    
    var l_div_place_name = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Наименование',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.place_name_input);     
    var l_div_control_count = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Контрольное кол-во',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.control_count_input); 
    var l_div_top_level = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Верхний уровень',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.top_level_select);
    var l_div_parent = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Родитель',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.parent_select);
    var l_div_fixing_person_1 = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Закрепление. Кто проводит',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.fixing_person_1);
    var l_div_fixing_person_2 = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Закрепление. Кому докладывает',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.fixing_person_2);
    var l_div_remove_person_1 = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Снятие. Кто проводит',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.remove_person_1);
    var l_div_remove_person_2 = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Снятие. Кому докладывает',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.remove_person_2);
    var l_div_control_person_1 = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Ответсвенный за учет',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.control_person_1);
    var l_div_control_person_2 = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Ответсвенный Прием/Сдача смены',class:'route-window-attr-item-text route-window-attr-item-text-left'}))
        .append(md_content.control_person_2);
        
    var l_railway_list = new railway_list(); 
    var l_fixing_device_list = new fixing_device_list(); 
	var l_fixing_person_list = new fixing_person_list();
	var l_control_person_list = new control_person_list();
	var l_respon_person_list = new respon_person_list(); 
	
    
    $('<div>')
        .addClass('route-window-attr')
        //.css({'width':'38em'})
        .append(l_div_place_name)
        .append(l_div_control_count)
        .append(l_div_top_level)
        .append(l_div_parent)
        //.append(l_div_fixing_person_1)
        //.append(l_div_fixing_person_2)
        //.append(l_div_remove_person_1)
        //.append(l_div_remove_person_2)
        .append(l_div_control_person_1)
        //.append(l_div_control_person_2)
        .append(l_railway_list.get_list)
        .append(l_fixing_device_list.get_list)
		.append(l_fixing_person_list.get_list)
		.append(l_control_person_list.get_list)
		.append(l_respon_person_list.get_list)
        .appendTo(md_content);

    md_content.top_level_select.on('select',function(){
        if (md_content.top_level_select.val()==='Y'){
            l_div_parent.hide();
        } else{
            l_div_parent.show();
        }
    }); 

    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Сохранить норму':{
                text: "Сохранить",
                id: "md_save_route_btn",
                click: function(){  
                    var l_storage_place = {};
                    l_storage_place.place_id = '';
                    l_storage_place.place_name = md_content.place_name_input.val();
                    l_storage_place.control_count = md_content.control_count_input.val();
                    l_storage_place.top_level = md_content.top_level_select.val();
                    l_storage_place.parent_id = md_content.parent_select.val();
                    
                    l_storage_place.fixing_person_1 = md_content.fixing_person_1.val();
                    l_storage_place.fixing_person_2 = md_content.fixing_person_2.val();
                    l_storage_place.remove_person_1 = md_content.remove_person_1.val();
                    l_storage_place.remove_person_2 = md_content.remove_person_2.val();
                    l_storage_place.control_person_1 = md_content.control_person_1.val();
                    l_storage_place.control_person_2 = md_content.control_person_2.val();
                    
                    l_storage_place.railway_mas = l_railway_list.get_railways_in_list();  // Список путей
                    l_storage_place.device_mas = l_fixing_device_list.get_fixing_device_in_list(); // Список башмаков
					l_storage_place.fix_person_mas = l_fixing_person_list.fixing_person_in_list(); // Список кто проводит(закрепление/снятие)
					l_storage_place.control_person_mas = l_control_person_list.control_person_in_list(); // Список кому докладывают(закрепление/снятие)
					l_storage_place.respon_person_mas = l_respon_person_list.respon_person_in_list(); // Ответсвенный за прием/снятие смены
                    var l_storage_place_json = JSON.stringify(l_storage_place);
					
					//console.log(l_storage_place_json);return;
                    var f_res = save_storage_place_ajax(l_storage_place_json);
                    var f_res_mas = f_res.split('$');
                    if (f_res_mas[0]=='done') {
                        var l_mes = '';
                        //if (p_fuel_standart == null){
                            l_mes = 'Правила сохранены';
                            p_document.refresh_storage_place(false,f_res_mas[1]);
                        //} else{
                        //    l_mes = 'Место хранения сохранено!';
                        //}
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
    
    md_content.top_level_select.combobox({menuMaxHeight: '25em'});
    md_content.parent_select.combobox({menuMaxHeight: '25em'});
    md_content.fixing_person_1.combobox({menuMaxHeight: '25em'});
    md_content.fixing_person_2.combobox({menuMaxHeight: '25em'});
    md_content.remove_person_1.combobox({menuMaxHeight: '25em'});
    md_content.remove_person_2.combobox({menuMaxHeight: '25em'});
    md_content.control_person_1.combobox({menuMaxHeight: '25em'});
    md_content.control_person_2.combobox({menuMaxHeight: '25em'});
    
    stop_loading_animation();
}

