var user_id;
var user_name;                  /*пользователь*/

$(document).ready(function() {
    $.ajax({
        url: '../data.php',
        type: 'POST',
        dataType: "text",
        data: { ajax_action: 'getLoginData'
              },
        success: function (data) {
            var result = JSON.parse(data);
            user_name = result.userName;
            user_id = result.user_id;
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
    
    var l_this = this;
    
    this.tab5 = $('#tabs-5');
    
    this.tab5.section = $('<div>')
        .addClass('section')
        .css({'width':'auto','float':'none'})
        .appendTo(this.tab5);
        
    /*объявлем таблицу для справочника "Периоды"*/
    var dir_table = $('<table>')
        .addClass('directory-period-table')
        .appendTo(this.tab5.section);
    $('<thead>')
        .appendTo(dir_table)
        .append($('<tr>')
                    .append($('<th>').addClass('directory-table-th').text('Период'))
                    .append($('<th>').addClass('directory-table-th').text('№ месяца'))
                    .append($('<th>').addClass('directory-table-th').text('Год'))
                    .append($('<th>').addClass('directory-table-th').text('Дата с'))
                    .append($('<th>').addClass('directory-table-th').text('Дата по'))
                    .append($('<th>').addClass('directory-table-th').text('Операция'))
                    .append($('<th>').addClass('directory-table-th').text('Статус'))
                    .append($('<th>').addClass('directory-table-th').text('Обновил'))
                    .append($('<th>').addClass('directory-table-th').text('Дата обновления')));
    this.tab5.section.table_body = $('<tbody>')
        .appendTo(dir_table);

    this.add_period = function(p_id,p_period,p_month,p_year,p_from,p_to, p_period_closing){
        var l_count_oper = '2';
        var l_period = $('<tr>').appendTo(l_this.tab5.section.table_body);
        l_period.id = p_id;
        l_period.period = $('<td>').appendTo(l_period).text((p_period===null?'':p_period)).attr({'rowspan':l_count_oper});
        l_period.month = $('<td>').appendTo(l_period).text((p_month===null?'':p_month)).attr({'rowspan':l_count_oper});
        l_period.year = $('<td>').appendTo(l_period).text((p_year===null?'':p_year)).attr({'rowspan':l_count_oper});
        l_period.from = $('<td>').appendTo(l_period).text((p_from===null?'':p_from)).attr({'rowspan':l_count_oper});
        l_period.to = $('<td>').appendTo(l_period).text((p_to===null?'':p_to)).attr({'rowspan':l_count_oper});
        $.each(p_period_closing,function(i,elem){
            var l_period_oper = {};
				l_period_oper.period_id = p_id;
                l_period_oper.period_descr = p_period;
                l_period_oper.operation_id = elem.operation_id;
                l_period_oper.operation_desc = elem.operation_desc;
                l_period_oper.status_id = elem.status_id;
				l_period_oper.status_descr = elem.status_descr;
                    
                var l_add_tr = {};
				if (i === 1){
					l_add_tr = l_period;
                }
				else{
                    l_add_tr = $('<tr>').appendTo(l_this.tab5.section.table_body);
                }
                $('<td>').appendTo(l_add_tr).text((l_period_oper.operation_desc===null?'':l_period_oper.operation_desc));
                l_period_oper.status_descr_td = $('<td>').appendTo(l_add_tr).text((l_period_oper.status_descr===null?'':l_period_oper.status_descr)).addClass('reference-text')
					.on('click', function(){
                        l_this.open_window_period_status(l_period_oper);
                    });
                l_period_oper.last_update_by_td = $('<td>').appendTo(l_add_tr).text((l_period_oper.last_update_by===null?'':l_period_oper.last_update_by));
                l_period_oper.last_update_date_td = $('<td>').appendTo(l_add_tr).text((l_period_oper.last_update_date===null?'':l_period_oper.last_update_date));
        });
    };
    
    this.open_window_period_status = function(p_period_oper){
        function save_ajax(){
            var res;
            $.ajax({
                url: 'adm_data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data: { period_id:p_period_oper.period_id
                       ,oper_id:p_period_oper.operation_id
                       ,status_id:attr_status.val()
                       ,ajax_action: 'save_period_status'
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
        var open_window = $('<div>')
            .attr('title','Редактирование')
            .appendTo('body');
        
        var attr_cont = $('<div>')
            .addClass('attr')
            //.css({'width':'30em'})
            .appendTo(open_window);
        
        var attr_period_descr = $('<input>').prop( "disabled", true ).addClass('text ui-widget-content ui-corner-all');
        var attr_oper = $('<input>').prop( "disabled", true ).addClass('text ui-widget-content ui-corner-all');
        
        var attr_status = $('<select>').css({'width':'15em'});
        $.ajax({
            url: 'adm_data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { ajax_action: 'get_period_status'
                  },
            success: function (data) {
                var l_status = JSON.parse(data);
                $.each(l_status, function( i, item ) {
                    attr_status.append('<option value="'+item.ID+'">'+item.NAME+'</option>');
                });
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        }); 
        
        if (p_period_oper != null){
            attr_period_descr.val(p_period_oper.period_descr);
            attr_oper.val(p_period_oper.operation_desc);
            attr_status.val(p_period_oper.status_id);
        }
        $('<div>')
            .append($('<label>').text('Период'))
            .append(attr_period_descr)
            .appendTo(attr_cont);
        $('<div>')
            .append($('<label>').text('Категория услуги'))
            .append(attr_oper)
            .appendTo(attr_cont); 
        $('<div>')
            .append($('<label>').text('Статус'))
            .append(attr_status)
            .appendTo(attr_cont); 
    

    
        open_window.dialog({
            resizable:false,
            modal:true,
            width: 'auto',
            draggable: false,
            buttons:{
                'Изменить':{
                    text: "Изменить",
                      id: "change_btn",
                   click: function(){
                        var l_res = save_ajax();
                        var l_res_mas = l_res.split('$');

                        if (l_res_mas[0]=='done') {
                            p_period_oper.status_id = attr_status.val();
                            
                            p_period_oper.status_descr_td.text(attr_status.find('option:selected').text());
                            p_period_oper.last_update_by_td.text(user_name);
                            p_period_oper.last_update_date_td.text(l_res_mas[1]);
                            create_info_modal_dialog_new('Оповещение','Запись обновлена!');
                        } else{
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
        if (p_period_oper.status_id == '3'){
            $('#change_btn').hide();
        } 
    };
    
    $.ajax({
        url: 'adm_data.php',
        type: 'POST',
        dataType: "text",
        async:false,
        data: { ajax_action: 'get_periods'},
        success: function (data) {
            var dataInfo = JSON.parse(data); 
			$.each(dataInfo, function( i, item ) {
				var periodClMS = JSON.parse(item.PERIOD_CLOSING);
				l_this.add_period(item.PER_ID,item.PERIOD,item.PER_MONTH,item.PER_YEAR,item.PER_FROM,item.PER_TO, periodClMS);
			});
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
});