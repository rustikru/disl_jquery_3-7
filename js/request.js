let l_request_this;/*для вызова из других частей программы*/

const g_del_1 = '$';
const g_del_2 = '@';
const g_del_3 = '|';
const g_del_4 = '#';

$(document).ready(async function() {

    const l_this = this;
    l_request_this = l_this;

    try {
        const data = await $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: 'text',
            data: { ajax_action: 'getLoginData' }
        });
        const result = JSON.parse(data);
        l_this.r_create_request = (result.create_request === 'Y');
        l_this.r_change_request = (result.change_request === 'Y');
        l_this.r_view_request = (result.view_request === 'Y');
        l_this.r_autocreate_request_v = (result.autocreate_request_v === 'Y');
        l_this.r_autocreate_request_o = (result.autocreate_request_o === 'Y');
        l_this.r_autocreate_request_t = (result.autocreate_request_t === 'Y');
    } catch(e) {
        window.alert(e);
        return;
    }

    if (!l_this.r_create_request&&!l_this.r_change_request&&!l_this.r_view_request){
        return;
    }

    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        data:   {station_id: 3
                ,ajax_action: 'get_railways_for_request'
                },
        success: function (data) {
                l_this.railways_for_request = JSON.parse(data);
            }
    });

    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        data:   {station_id: 3
                ,ajax_action: 'get_tasks_for_request'
                },
        success: function (data) {
                l_this.tasks_for_request = JSON.parse(data);
            }
    });

    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        data:   {station_id: 3
                ,ajax_action: 'get_criteria_tasks_for_request'
                },
        success: function (data) {
                l_this.criteria_tasks_for_request = JSON.parse(data);
            }
    });

    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        data:   {station_id: 3
                ,ajax_action: 'get_criticality_for_request'
                },
        success: function (data) {
                l_this.criticality_for_request = JSON.parse(data);
            }
    });

    this.request_window = $('<div>')
        .addClass('request-window')
        .appendTo($('div.wrapper'));

    this.request_titlebar = $('<div>')
        .addClass('request-titlebar helper-clearfix')
        .appendTo(this.request_window);

    $('<span>')
        .text('Заявки')
        .addClass('request-title')
        .appendTo(this.request_titlebar);

    this.request_titlebar_add_button = $('<button>')
        .addClass('request-button request-titlebar-add-button')
        .attr('title','Добавить заявку')
        .append('<span class="request-button-icon request-titlebar-add-icon"></span>')
        .on('click', function(){
            create_request_window(l_this);
        })
        .appendTo(this.request_titlebar);
    if (!this.r_create_request) {
        this.request_titlebar_add_button.hide();
    }

    this.request_titlebar_turn_button = $('<button>')
        .addClass('request-button request-titlebar-turn-button')
        .attr('title','Скрыть список заявок')
        .append('<span class="request-button-icon request-titlebar-turn-icon"></span>')
        .on('click', function(){
            toggle_request_content(l_this);
        })
        .appendTo(this.request_titlebar);

    this.request_content = $('<div>')
        .addClass('request-content')
        .appendTo(this.request_window);
    this.request_content_mas = [];

    this.add_request_to_content = function (p_request_id,p_created_by_id,p_title){
        const l_request_item = $('<div>')
            .addClass('request-item')
            .prependTo(this.request_content);
        l_request_item.pos = this.request_content_mas.length;

        l_request_item.request_id = p_request_id;
        l_request_item.created_by_id = p_created_by_id;

        l_request_item.processing = $('<span>')
            .addClass('request-item-processing')
            .appendTo(l_request_item);

        l_request_item.part_closed = $('<span>')
            .addClass('request-item-part-closed')
            .appendTo(l_request_item);

        l_request_item.title = $('<span>')
            .addClass('request-item-title')
            .text(p_title)
            .prop('title', p_title)
            .appendTo(l_request_item);

        l_request_item.view_btn = $('<button>')
            .addClass('request-button request-item-view-btn')
            .attr('title','Открыть заявку')
            .append('<span class="request-button-icon request-item-view-btn-icon"></span>')
            .on('click', function(){
                create_request_window(l_this,l_request_item);
            })
            .appendTo(l_request_item);

        l_request_item.set_flag_need_close = function(){
            if (!l_request_item.hasClass('request-item-need-close')){
                l_request_item.addClass('request-item-need-close');
            }
        };

        l_request_item.add_flag_criticality = function(){
            if (!l_request_item.title.hasClass('request-item-title-criticality')){
                l_request_item.title.addClass('request-item-title-criticality');
            }
        };

        l_request_item.rem_flag_criticality = function(){
            l_request_item.title.removeClass('request-item-title-criticality');
        };

        l_request_item.toggle_flag_processing = function(p_bool){
            if (p_bool) {
                l_request_item.processing.show();
            }else{
                l_request_item.processing.hide();
            }
        };

        l_request_item.toggle_flag_part_complete = function(p_bool){
            if (p_bool) {
                l_request_item.processing.addClass('request-item-part-complete');
            }else{
                l_request_item.processing.removeClass('request-item-part-complete');
            }
        };

        l_request_item.toggle_flag_complete = function(p_bool){
            if (p_bool) {
                l_request_item.processing.addClass('request-item-complete');
            }else{
                l_request_item.processing.removeClass('request-item-complete');
            }
        };

	l_request_item.toggle_flag_check_railways = function(p_bool){
            if (p_bool) {
                if (!l_request_item.title.hasClass('title-check-railways')){
					l_request_item.title.addClass('title-check-railways');
				}
            }else{
				l_request_item.title.removeClass('title-check-railways');
			}
        };

        l_request_item.toggle_flag_part_closed = function(p_bool){
            if (p_bool) {
                l_request_item.part_closed.show();
            }else{
                l_request_item.part_closed.hide();
            }
        };

        this.request_content_mas[l_request_item.pos] = l_request_item;

        return l_request_item;
    };

    this.refresh_requests = function(){
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            data: { ajax_action: 'get_requests'
                  },
            success: function (data) {
                const l_requests = JSON.parse(data);
                l_requests.forEach(function (item){
                    let l_exists_item = false;
                    l_this.request_content_mas.forEach(function(request){
                        if (item.REQUEST_ID == request.request_id){
                            l_exists_item=true;

                            if (item.CARS_COUNT == item.DONE_CARS_COUNT && item.CARS_COUNT!='0') {
                                request.set_flag_need_close();
                            }
                            if (item.CRITICALITY_ID==='1') {
                                request.add_flag_criticality();
                            } else{
                                request.rem_flag_criticality();
                            }
                            if (item.STATUS === 'P') {
                                request.toggle_flag_processing(true);
                            } else{
                                request.toggle_flag_processing(false);
                            }
                            if (item.PART_COMPLETE === '1') {
                                request.toggle_flag_part_complete(true);
                            } else{
                                request.toggle_flag_part_complete(false);
                            }
                            if (item.COMPLETE === '1') {
                                request.toggle_flag_complete(true);
                            } else{
                                request.toggle_flag_complete(false);
                            }
                            if (item.PART_CLOSED === '1') {
                                request.toggle_flag_part_closed(true);
                            } else{
                                request.toggle_flag_part_closed(false);
                            }
							// add 04.03.2024
							if (item.CHECK_RAILWAYS === '1') {
                                request.toggle_flag_check_railways(true);
                            } else{
                                request.toggle_flag_check_railways(false);
                            }
                        }
                    });
                    if (!l_exists_item) {
                        let l_title = '№'+item.REQUEST_ID+' от '+item.CREATED_DATE
                        if (l_this.r_view_request){
                            l_title+=' ('+(item.DIVISION==null?'':item.DIVISION+' ')+item.TASK_DESCR+')';
                        }else{
                            l_title+=' ('+item.CREATED_BY+' '+item.TASK_DESCR+')';
                        }

                        const l_cur_request = l_this.add_request_to_content(item.REQUEST_ID,item.CREATED_BY_ID,l_title);

                        if (item.CARS_COUNT == item.DONE_CARS_COUNT && item.CARS_COUNT!='0') {
                            l_cur_request.set_flag_need_close();
                        }
                        if (item.CRITICALITY_ID==='1') {
                            l_cur_request.add_flag_criticality();
                        }

                        if (item.STATUS === 'P') {
                            l_cur_request.toggle_flag_processing(true);
                        } else{
                            l_cur_request.toggle_flag_processing(false);
                        }
                        if (item.PART_COMPLETE === '1') {
                            l_cur_request.toggle_flag_part_complete(true);
                        } else{
                            l_cur_request.toggle_flag_part_complete(false);
                        }
                        if (item.COMPLETE === '1') {
                            l_cur_request.toggle_flag_complete(true);
                        } else{
                            l_cur_request.toggle_flag_complete(false);
                        }
                        if (item.PART_CLOSED === '1') {
                            l_cur_request.toggle_flag_part_closed(true);
                        } else{
                            l_cur_request.toggle_flag_part_closed(false);
                        }
						// add 04.03.2024
						if (item.CHECK_RAILWAYS === '1') {
                            l_cur_request.toggle_flag_check_railways(true);
                        } else{
                            l_cur_request.toggle_flag_check_railways(false);
                        }
                    }
                });

                l_this.request_content_mas.forEach(function(request){
                    let l_exists_item = false;
                    l_requests.forEach(function (item){
                        if (item.REQUEST_ID == request.request_id){
                            l_exists_item=true;
                        }
                    });
                    if (!l_exists_item) {
                        request.remove();
                        delete l_this.request_content_mas[request.pos];
                    }
                });
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
    };

    l_this.refresh_requests();
    setInterval(function() {
        l_this.refresh_requests();
    }, 1000*5*60);

});

function toggle_request_content(p_document){
    if (p_document.request_content.is(":visible")){
        p_document.request_content.hide();
    } else {
        p_document.request_content.show();
    }
}

/*p_task - задача; заполняется когда форма заявки вызывается из формы погрузки/разгрузки*/
/*p_cars_req_win - список вагонов заполняется когда форма заявки вызывается из формы погрузки/разгрузки. формат номер_вагона:номер_вагона:ном...*/
async function create_request_window(p_document,p_request_item,p_task,p_cars_req_win){
	function before_saving(l_md_content){
		let l_count_dop = 0;
        md_content.list_of_cars_item_mas.forEach(function(item){
            item.list_of_cars_mas.forEach(function(car){
                if (car.car_freight_dop.val() !== ''){
					l_count_dop++;
				}
            });
        });
		if (l_count_dop>0){
						$('<div/>')
							.attr('id','modalDialog')
							.attr('title','Оповещение')
							.appendTo('body') // Присоединяем наше меню к body документа:
							.append('<p>Вы действительно хотите закрыть без сохранения? Все изменения не будут сохранены! </p>');
									const dialog = $("#modalDialog").dialog({
										resizable:false,
										modal:true,
										width: 'auto',
										draggable: false,
										buttons:{
											'Да': function(){
												 md_content.dialog("close");
												 $(this).remove();
											},
											'Нет': function(){
												$(this).remove();
											}
										},
										close: function() {
											$(this).remove();
										}
									});
					} else {
						md_content.dialog("close");
					}

		return l_count_dop;
	}
    async function save_request_ajax(){
        let l_cars_item = '';

        md_content.list_of_cars_item_mas.forEach(function(item){
            let l_car_item = '';
            l_car_item += (item.criteria_id==''?'_':item.criteria_id) + g_del_2;
            l_car_item += (item.railway.val()==''||item.railway.val()===null?'_':item.railway.val()) + g_del_2;
            l_car_item += (item.point.val()==''?'_':item.point.val()) + g_del_2;
            l_car_item += (item.type.val()==''?'_':item.type.val()) + g_del_2;
            l_car_item += (item.status.val()==''?'_':item.status.val()) + g_del_2;
            l_car_item += (item.state.val()==''?'_':item.state.val()) + g_del_2;
            l_car_item += (item.freight.val()==''?'_':item.freight.val()) + g_del_2;
            l_car_item += (item.cars_count.val()==''?'_':item.cars_count.val()) + g_del_2;
            l_car_item += (item.task.val()==''?'_':item.task.val()) + g_del_2;
            l_car_item += (item.date_out.val()==''?'_':item.date_out.val()) + g_del_2;
            l_car_item += (item.descr.val()==''?'_':item.descr.val()) + g_del_2;

            let l_cars = '';
            item.list_of_cars_mas.forEach(function(car){
                let l_car = '';
                l_car += (car.car_number.val()==''?'_':car.car_number.val()) + g_del_4;
                l_car += (car.car_owner.val()==''?'_':car.car_owner.val()) + g_del_4;
                l_car += (car.car_station.val()==''?'_':car.car_station.val()) + g_del_4;
                l_car += (car.car_railway.val()==''?'_':car.car_railway.val()) + g_del_4;
                l_car += (car.car_status.val()==''?'_':car.car_status.val()) + g_del_4;
                l_car += (car.car_state.val()==''?'_':car.car_state.val()) + g_del_4;
                l_car += (car.car_freight.val()==''?'_':car.car_freight.val()) + g_del_4;
                l_car += (car.v.prop('checked')?'1':'0') + g_del_4;
                l_car += (car.o.prop('checked')?'1':'0') + g_del_4;
				l_car += (car.t.prop('checked')?'1':'0')+ g_del_4;//add 17.11.2020
				l_car += (car.car_freight_dop.val()==''?'_':car.car_freight_dop.val()); //add 17.11.2020


                l_cars+=l_car+g_del_3;
            });

            l_car_item+=(l_cars==''?'_':l_cars);

            l_cars_item+=l_car_item+g_del_1;
        });
        try {
            return await $.ajax({
                url: 'data.php',
                type: 'POST',
                dataType: "text",
                data: { request_id: md_content.request_id
                       ,deadline_date_in: md_content.deadline_date_in_input.val()
                       ,deadline_date_out: md_content.deadline_date_out_input.val()
                       ,task: md_content.task_select.val()
                       ,criticality: md_content.criticality_select.val()
                       ,cars: l_cars_item
                       ,ajax_action: 'save_request'}
            });
        } catch(e) {
            window.alert(e);
            return null;
        }
    }
    function disable_save_btn(){
        let l_need_fill = false;

        md_content.list_of_cars_item_mas.forEach(function(item){
            if (item.cars_count.val()=='' || item.date_out.hasClass('red_bckg_color')) {
                l_need_fill = true;
            }
        });

        if (md_content.deadline_date_in_input.hasClass('red_bckg_color')||md_content.deadline_date_in_input.val()==''||
            md_content.deadline_date_out_input.hasClass('red_bckg_color')||md_content.deadline_date_out_input.val()==''||
            md_content.task_select.val()==''||
            l_need_fill){
            $('#md_save_request_btn').prop( "disabled", true );
        }else{
            $('#md_save_request_btn').prop( "disabled", false );
        }
    }
    function disable_request(){
        md_content.deadline_date_out_input.prop('disabled', true);
        md_content.task_select.prop('disabled', true);
        md_content.criticality_select.prop('disabled', true);
        md_content.cars_add_button.hide();

        md_content.list_of_cars_item_mas.forEach(function(p_car_item){
            p_car_item.disable_item();
            p_car_item.list_of_cars_mas.forEach(function(p_car){
                p_car.disable_car();
            });
        });
    }
    function enable_request(){
        md_content.deadline_date_out_input.prop('disabled', false);
        md_content.task_select.prop('disabled', false);
        md_content.criticality_select.prop('disabled', false);
        md_content.cars_add_button.show();

        md_content.list_of_cars_item_mas.forEach(function(p_car_item){
            p_car_item.enable_item();
            p_car_item.list_of_cars_mas.forEach(function(p_car){
                p_car.enable_car();
            });
        });
    }
    function toggle_complete_btns(p_bool){
        md_content.list_of_cars_item_mas.forEach(function(p_car_item){
            p_car_item.complete_btn.prop('disabled', p_bool);
            p_car_item.list_of_cars_mas.forEach(function(p_car){
                p_car.complete_btn.prop('disabled', p_bool);
            });
        });
    }


    const md_content = $('<div/>')
        .addClass('md-lvl-1')
        .appendTo('body');

    let l_title;

    const open_window_date = new Date();

    if (p_request_item == null){

        md_content.deadline_date_in = date_to_string(open_window_date);
        const open_window_date_add = open_window_date;
        open_window_date_add.setHours(open_window_date_add.getHours()+12);
        md_content.deadline_date_out = date_to_string(open_window_date_add);

        md_content.request_id = null;
        l_title = 'Заявка';
        md_content.task_id = p_task;
    } else{
        md_content.request_id = p_request_item.request_id;
        try {
            const data = await $.ajax({
                url: 'data.php',
                type: 'POST',
                dataType: 'text',
                data: { request_id: md_content.request_id
                       ,ajax_action: 'get_request'}
            });
            const l_request = JSON.parse(data);
            md_content.deadline_date_in = l_request[0].DEADLINE_DATE_IN;
            md_content.deadline_date_out = l_request[0].DEADLINE_DATE_OUT;
            md_content.task_id = l_request[0].TASK_ID;
            md_content.criticality = l_request[0].CRITICALITY_ID;
            md_content.created_by = l_request[0].CREATED_BY;
            md_content.status = l_request[0].STATUS;
        } catch(e) { window.alert(e); return; }
        l_title = p_request_item.title.text();
    }

    md_content.attr('title',l_title);

    /*объявлеям элементы интерфейса для атрибутов заявки*/
    md_content.deadline_date_in_input = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'9em'}});  // срок выполнения с
    md_content.deadline_date_in_input.prop('disabled', true);
    md_content.deadline_date_out_input = $('<input>',{class:'text ui-widget-content ui-corner-all required',css:{'width':'9em'}}); // срок выполнения по
    md_content.task_select = $('<select>',{class:'request-window-attr-item-elem required'}); // задача
    md_content.task_select.append($('<option>',{'val':'','text':''}));
    p_document.tasks_for_request.forEach(function(item){
         md_content.task_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });

    md_content.criticality_select = $('<select>',{class:'request-window-attr-item-elem'}); // критичность
    md_content.criticality_select.append($('<option>',{'val':'','text':''}));
    p_document.criticality_for_request.forEach(function(item){
         md_content.criticality_select.append($('<option>',{'val':item.ID,'text':item.NAME}));
    });
    md_content.done_cars_count_input = $('<input>',{class:'request-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'5em'}});// кол-во выполн. вагонов
    md_content.done_cars_count_input.prop('disabled', true);
    md_content.created_by_input = $('<input>',{class:'request-window-attr-item-elem text ui-widget-content ui-corner-all',css:{'width':'12em'}});// кто создал заявку
    md_content.created_by_input.prop('disabled', true);

    /*инициализация элементов интерфейса атрибутов заявки*/
    init_date_time_input(md_content.deadline_date_in_input);
    init_date_time_input(md_content.deadline_date_out_input);
    md_content.deadline_date_in_input.val(md_content.deadline_date_in);
    md_content.deadline_date_out_input.val(md_content.deadline_date_out);
    md_content.task_select.val(md_content.task_id);
    md_content.criticality_select.val(md_content.criticality);
    if (p_request_item == null) {
        md_content.created_by_input.val(user_name); /*глобальная перенная из context_menu.js*/
    } else {
        md_content.created_by_input.val(md_content.created_by);
    }

    /*обработка обязательных полей на изменение*/
    md_content.deadline_date_in_input.on('blur',function(){
        disable_save_btn();
    });
    md_content.deadline_date_out_input.on('blur',function(){
        const l_deadline_in = string_to_date(md_content.deadline_date_in_input.val());
        const l_deadline_out = string_to_date(md_content.deadline_date_out_input.val());

        if (Math.floor((l_deadline_out - l_deadline_in)/1000/60/60) < 4) {
            md_content.deadline_date_out_input
                .addClass('red_bckg_color')
                .attr('title','Время должно быть больше начальной на 4 часа!')
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
            setTimeout(function() { md_content.deadline_date_out_input.tooltip( 'close' ) }, 2500);
        } else{
            md_content.deadline_date_out_input.attr('title','');
        }
        disable_save_btn();
    });
    md_content.task_select.on('change', function(){
        disable_save_btn();
    });

    /*строим шапку с атрибутами заявки*/
    const l_div_deadline = $('<div>')
        .addClass('request-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Срок выполнения (местное) c',class:'request-window-attr-item-text'}))
        .append(md_content.deadline_date_in_input)
        .append($('<label>',{text:'по',class:'request-window-attr-item-text request-window-attr-item-text-between'}))
        .append(md_content.deadline_date_out_input);

    const l_div_task = $('<div>')
        .addClass('request-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Задача',class:'request-window-attr-item-text request-window-attr-item-text-left'}))
        .append(md_content.task_select);
    const l_div_criticality = $('<div>')
        .addClass('request-window-attr-item helper-clearfix')
        .append($('<label>',{text:'Критичность',class:'request-window-attr-item-text request-window-attr-item-text-left'}))
        .append(md_content.criticality_select);
    const l_div_created_by = $('<div>')
            .addClass('request-window-attr-item helper-clearfix')
            .append($('<label>',{text:'Создал',class:'request-window-attr-item-text request-window-attr-item-text-left'}))
            .append(md_content.created_by_input);
    $('<div>')
        .addClass('request-window-attr')
        .append(l_div_deadline)
        .append(l_div_task)
        .append(l_div_criticality)
        .append(l_div_created_by)
        .appendTo(md_content);

    /*******    Вагоны    ********/
    md_content.list_of_cars_item_mas = [];

    md_content.list_of_cars_item = $('<div>')
        .addClass('list-cars')
        .appendTo(md_content);
    md_content.cars_header = $('<div>')
            .addClass('criteria-header')
            .text('Вагоны')
            .css({'width':'87px'})
            .appendTo(md_content.list_of_cars_item);
    md_content.cars_add_button = $('<button>')
        .addClass('request-button criteria-add-button')
        .attr('title','Добавить вагоны')
        .append('<span class="request-button-icon request-titlebar-add-icon"></span>')
        .appendTo(md_content.cars_header);

    /*p_cars - для заполнения формы при открытии заявки*/
    /*p_cars_add - для заполнения формы при вызове из другой формы*/
    md_content.cars_add_button.on('click', async function(e,p_cars,p_cars_add){
        const l_cars_item = $('<div>')
            .addClass('criteria-item cars-item-width helper-clearfix')
            .appendTo(md_content.list_of_cars_item);

        l_cars_item.pos = md_content.list_of_cars_item_mas.length;
        md_content.list_of_cars_item_mas[l_cars_item.pos] = l_cars_item;

        l_cars_item.disable_item = function(){
            l_cars_item.railway.prop('disabled', true);
            l_cars_item.railway.next().children('input').prop('disabled', true);
            l_cars_item.railway.next().children('a').hide();

            l_cars_item.point.prop('disabled', true);
            l_cars_item.type.prop('disabled', true);
            l_cars_item.status.prop('disabled', true);
            l_cars_item.state.prop('disabled', true);
            l_cars_item.freight.prop('disabled', true);
            l_cars_item.cars_count.prop('disabled', true);
            l_cars_item.task.prop('disabled', true);
            l_cars_item.date_out.prop('disabled', true);
            l_cars_item.descr.prop('disabled', true);
            l_cars_item.remove_btn.hide();

            l_cars_item.add_car_btn.hide();
        };
        l_cars_item.enable_item = function(){
            l_cars_item.railway.prop('disabled', false);
            l_cars_item.railway.next().children('input').prop('disabled', false);
            l_cars_item.railway.next().children('a').show();

            l_cars_item.point.prop('disabled', false);
            l_cars_item.type.prop('disabled', false);
            l_cars_item.status.prop('disabled', false);
            l_cars_item.state.prop('disabled', false);
            l_cars_item.freight.prop('disabled', false);
            l_cars_item.cars_count.prop('disabled', false);
            l_cars_item.task.prop('disabled', false);
            l_cars_item.date_out.prop('disabled', false);
            l_cars_item.descr.prop('disabled', false);
            l_cars_item.remove_btn.show();

            l_cars_item.add_car_btn.show();
        };

        l_cars_item.add_car =  function (p_car_number,p_owner,p_station,p_railway,p_status,p_state,p_freight,p_info_date,p_complete,p_complete_date,p_complete_by
                                        ,p_v,p_o,p_t,p_close,p_close_date,p_close_by,p_close_comment,p_exist_req){
            const l_car_descr = $('<div>',{'class':'cars-item-car-div'}).appendTo(l_cars_item.list_of_cars);
            l_car_descr.pos = l_cars_item.list_of_cars_mas.length;
            l_cars_item.list_of_cars_mas[l_car_descr.pos] = l_car_descr;

            l_car_descr.disable_car = function (){
                l_car_descr.remove_btn.hide();
            };
            l_car_descr.enable_car = function (){
                l_car_descr.remove_btn.show();
            };

            l_car_descr.complete = (p_complete==undefined?'0':p_complete);
            l_car_descr.complete_btn = $('<button>')
                .addClass('request-button cars-item-complete-btn')
                .attr('title',(p_complete_by==undefined?'Выполнить':p_complete_by+' '+p_complete_date))
                .append('<span class="request-button-icon '+(l_car_descr.complete=='0'?'complete-button-icon-blue':'complete-button-icon-green')+'"></span>')
                .appendTo(l_car_descr);

            l_car_descr.complete_btn.on('click', async function(){
                async function save_complete_flag_ajax(p_user_id,p_criteria_id,p_car_number,p_complete){
                    try {
                        return await $.ajax({
                            url: 'data.php',
                            type: 'POST',
                            dataType: 'text',
                            data: { user_id: p_user_id
                                   ,criteria_id: p_criteria_id
                                   ,car_number: p_car_number
                                   ,complete: p_complete
                                   ,ajax_action: 'save_car_complete_for_request'}
                        });
                    } catch(e) { window.alert(e); return null; }
                }

                if (l_car_descr.complete == '0'){
                    if (await save_complete_flag_ajax(user_id,l_cars_item.criteria_id,p_car_number,'1')=='done') {
                        l_car_descr.complete = '1';
                        $(this).children('span').removeClass('complete-button-icon-blue');
                        $(this).children('span').addClass('complete-button-icon-green');
                        $(this).attr('title',user_name);

                        let cars_count = 0;
                        let complete_cars_count = 0;
                        l_cars_item.list_of_cars_mas.forEach(function(item){
                            cars_count++;
                            if (item.complete == '1'){complete_cars_count++;}
                        });

                        if (cars_count == complete_cars_count) {
                            l_cars_item.complete = '1';
                            l_cars_item.complete_btn.children('span').removeClass('complete-button-icon-blue');
                            l_cars_item.complete_btn.children('span').addClass('complete-button-icon-green');
                            l_cars_item.complete_btn.attr('title',user_name);
                        }

                        let exists_elem = false;
                        md_content.list_of_cars_item_mas.forEach(function(p_car_item){
                            exists_elem = p_car_item.complete == '0'?true:exists_elem;
                            p_car_item.list_of_cars_mas.forEach(function(p_car){
                                exists_elem = p_car.complete == '0'?true:exists_elem;
                            });
                        });

                        if (!exists_elem){
                            p_request_item.toggle_flag_complete(true);
                        }

                        p_request_item.toggle_flag_part_complete(true);
                    }else{
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    }
                }else{
                    if (await save_complete_flag_ajax(user_id,l_cars_item.criteria_id,p_car_number,'0')=='done') {
                        l_car_descr.complete = '0';
                        $(this).children('span').removeClass('complete-button-icon-green');
                        $(this).children('span').addClass('complete-button-icon-blue');
                        $(this).attr('title',user_name);

                        l_cars_item.complete = '0';
                        l_cars_item.complete_btn.children('span').removeClass('complete-button-icon-green');
                        l_cars_item.complete_btn.children('span').addClass('complete-button-icon-blue');
                        l_cars_item.complete_btn.attr('title',user_name);

                        let exists_elem = false;

                        md_content.list_of_cars_item_mas.forEach(function(p_car_item){
                            exists_elem = p_car_item.complete == '1'?true:exists_elem;
                            p_car_item.list_of_cars_mas.forEach(function(p_car){
                                exists_elem = p_car.complete == '1'?true:exists_elem;
                            });
                        });

                        if (!exists_elem){
                            p_request_item.toggle_flag_part_complete(false);
                        }

                        p_request_item.toggle_flag_complete(false);
                    }else{
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    }
                }
            });

            l_car_descr.close = (p_close==undefined?'0':p_close);
            l_car_descr.close_btn = $('<button>')
                .addClass('request-button cars-item-close-btn')
                .attr('title',(p_close_by==undefined?'Закрыть':p_close_by+' '+p_close_date+' '+p_close_comment))
                .append('<span class="request-button-icon '+(l_car_descr.close=='0'?'close-button-icon-blue':'close-button-icon-green')+'"></span>')
                .appendTo(l_car_descr);

            l_car_descr.close_btn.on('click', async function(){
                async function save_close_flag_ajax(p_user_id,p_criteria_id,p_car_number,p_close,p_close_comment){
                    try {
                        return await $.ajax({
                            url: 'data.php',
                            type: 'POST',
                            dataType: 'text',
                            data: { user_id: p_user_id
                                   ,criteria_id: p_criteria_id
                                   ,car_number: p_car_number
                                   ,close: p_close
                                   ,close_comment:p_close_comment
                                   ,ajax_action: 'save_car_close_for_request'}
                        });
                    } catch(e) { window.alert(e); return null; }
                }

                if ($(this).hasClass('request-button-active')){
                    if (l_car_descr.close == '0'){
                        if (await save_close_flag_ajax(user_id,l_cars_item.criteria_id,p_car_number,'1',l_car_descr.close_comment.val())=='done') {
                            l_car_descr.close = '1';
                            $(this).children('span').removeClass('close-button-icon-blue');
                            $(this).children('span').addClass('close-button-icon-green');
                            $(this).attr('title',user_name);

                            let cars_count = 0;
                            let close_cars_count = 0;
                            l_cars_item.list_of_cars_mas.forEach(function(item){
                                cars_count++;
                                if (item.close == '1'){close_cars_count++;}
                            });

                            if (cars_count == close_cars_count) {
                                l_cars_item.close = '1';
                                l_cars_item.close_btn.children('span').removeClass('close-button-icon-blue');
                                l_cars_item.close_btn.children('span').addClass('close-button-icon-green');
                                l_cars_item.close_btn.attr('title',user_name);
                            }

                            p_request_item.toggle_flag_part_closed(true);
                        }else{
                            create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                        }
                    }else{
                        if (await save_close_flag_ajax(user_id,l_cars_item.criteria_id,p_car_number,'0',l_car_descr.close_comment.val())=='done') {
                            l_car_descr.close = '0';
                            $(this).children('span').removeClass('close-button-icon-green');
                            $(this).children('span').addClass('close-button-icon-blue');
                            $(this).attr('title',user_name);

                            l_cars_item.close = '0';
                            l_cars_item.close_btn.children('span').removeClass('close-button-icon-green');
                            l_cars_item.close_btn.children('span').addClass('close-button-icon-blue');
                            l_cars_item.close_btn.attr('title',user_name);

                            let exists_elem = false;

                            md_content.list_of_cars_item_mas.forEach(function(p_car_item){
                                exists_elem = p_car_item.close == '1'?true:exists_elem;
                                p_car_item.list_of_cars_mas.forEach(function(p_car){
                                    exists_elem = p_car.close == '1'?true:exists_elem;
                                });
                            });

                            if (!exists_elem){
                                p_request_item.toggle_flag_part_closed(false);
                            }

                        }else{
                            create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                        }
                    }
                } else{
                    return '';
                }
            });

            l_car_descr.close_comment = $('<input>')
                .addClass('text ui-widget-content ui-corner-all')
                .css({'width':'10em','margin-left':'3px'})
                .hide()
                .val(p_close_comment)
                .appendTo(l_car_descr);

            $('<span>').text('В:').css({'margin-left':'3px'}).appendTo(l_car_descr);
            l_car_descr.v = $('<input>',{'class':'text ui-widget-content ui-corner-all','type':'checkbox'}).css({'margin-left':'0.0em'}).attr('title','Взвешивание').appendTo(l_car_descr);
            l_car_descr.v.prop('checked',(p_v == '1'?true:false));
            $('<span>').text('О:').css({'margin-left':'0.0em'}).appendTo(l_car_descr);
            l_car_descr.o = $('<input>',{'class':'text ui-widget-content ui-corner-all','type':'checkbox'}).css({'margin-left':'0.0em'}).attr('title','Отправка на ПСП').appendTo(l_car_descr);
            l_car_descr.o.prop('checked',(p_o == '1'?true:false));
            $('<span>').text('Т:').css({'margin-left':'0.0em'}).appendTo(l_car_descr);
            l_car_descr.t = $('<input>',{'class':'text ui-widget-content ui-corner-all','type':'checkbox'}).css({'margin-left':'0.0em'}).attr('title','Таможенный контроль').appendTo(l_car_descr);
            l_car_descr.t.prop('checked',(p_t == '1'?true:false));
            if (md_content.request_id != null||!p_document.r_autocreate_request_v){
                l_car_descr.v.prop('disabled', true);
            }
            if (md_content.request_id != null||!p_document.r_autocreate_request_o){
                l_car_descr.o.prop('disabled', true);
            }
            if (md_content.request_id != null||!p_document.r_autocreate_request_t){
                l_car_descr.t.prop('disabled', true);
            }

            l_car_descr.car_number = $('<input>',{'class':'cars-item-car-input text ui-widget-content ui-corner-all','readonly':'true','css':{'background':'#DCDCDC'}/*,'disabled':true*/}).val(p_car_number).appendTo(l_car_descr);

            if (p_exist_req == '' || p_exist_req == null){
            }else{
                l_car_descr.car_number.addClass('cars-item-car-div-red-border');
                l_car_descr.car_number
                    .attr('title',p_exist_req)
                    .tooltip({
                        tooltipClass: "ui-red-border",
                        position: {
                            my: "left top",
                            at: "left+20 bottom+11",
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
            }

            const l_disabled = ((md_content.status==undefined?'O':md_content.status)==='O') ? 'N' : 'Y';

			// add 17.11.2020 Дать возможность изменять груз вагона
			/*********************************************************************/
            l_car_descr.car_freight_dop = $('<select>').css({'width':'7em'});
            l_car_descr.car_freight_dop.append($('<option>'));
            $.each(g_freight_list, function(i, item) {
                l_car_descr.car_freight_dop.append($('<option>',{'val':item.FREIGHT_NAME,'text':item.FREIGHT_NAME}));
            });
            if (l_disabled === 'N') {
                l_car_descr.car_freight_dop.appendTo(l_car_descr);
            } else {
                l_car_descr.car_freight_dop.val(''); // exists but not in DOM, val() still works
            }
			/*********************************************************************/
            l_car_descr.car_owner = $('<input>',{'class':'cars-item-owner-input text ui-widget-content ui-corner-all','disabled':true}).val(p_owner).appendTo(l_car_descr);
            l_car_descr.car_station = $('<input>',{'class':'cars-item-station-input text ui-widget-content ui-corner-all','disabled':true}).val(p_station).appendTo(l_car_descr);
            l_car_descr.car_railway = $('<input>',{'class':'cars-item-railway-input text ui-widget-content ui-corner-all','disabled':true}).val(p_railway).appendTo(l_car_descr);
            l_car_descr.car_status = $('<input>',{'class':'cars-item-status-input text ui-widget-content ui-corner-all','disabled':true}).val(p_status).appendTo(l_car_descr);
            l_car_descr.car_state = $('<input>',{'class':'cars-item-state-input text ui-widget-content ui-corner-all','disabled':true}).val(p_state).appendTo(l_car_descr);
            l_car_descr.car_freight = $('<input>',{'class':'cars-item-freight-input text ui-widget-content ui-corner-all','disabled':true}).val(p_freight).appendTo(l_car_descr); // rem
            l_car_descr.car_info_date = $('<input>').val(p_info_date).appendTo(l_car_descr);
            l_car_descr.remove_btn = $('<button>')
                .addClass('request-button cars-item-car-span-delete-button')
                .attr('title','Удалить вагон')
                .append('<span class="request-button-icon delete-button-icon"></span>')
                .appendTo(l_car_descr)
                .on('click', function(){
                    l_car_descr.remove();
                    delete l_cars_item.list_of_cars_mas[l_car_descr.pos];
                });
        };

        l_cars_item.criteria_id = '';

        l_cars_item.complete = '0';//(p_complete==undefined?'0':p_complete);
        l_cars_item.complete_btn = $('<button>')
            .addClass('request-button cars-item-complete-btn-parent')
            .attr('title','Выполнить')
            .append('<span class="request-button-icon"></span>')
            .appendTo(l_cars_item);

        l_cars_item.complete_btn.on('click', async function(){
            async function save_complete_flag_ajax(p_user_id,p_criteria_id,p_complete){
                try {
                    return await $.ajax({
                        url: 'data.php',
                        type: 'POST',
                        dataType: 'text',
                        data: { user_id: p_user_id
                               ,criteria_id: p_criteria_id
                               ,complete: p_complete
                               ,ajax_action: 'save_crit_complete_for_request'}
                    });
                } catch(e) { window.alert(e); return null; }
            }
            if (l_cars_item.complete == '0'){
                if (await save_complete_flag_ajax(user_id,l_cars_item.criteria_id,'1')=='done') {
                    l_cars_item.complete = '1';
                    $(this).children('span').removeClass('complete-button-icon-blue');
                    $(this).children('span').addClass('complete-button-icon-green');
                    $(this).attr('title',user_name);

                    l_cars_item.list_of_cars_mas.forEach(function(item){
                        item.complete = '1';
                        item.complete_btn.children('span').removeClass('complete-button-icon-blue');
                        item.complete_btn.children('span').addClass('complete-button-icon-green');
                        item.complete_btn.attr('title',user_name);
                    });

                    let exists_elem = false;
                    md_content.list_of_cars_item_mas.forEach(function(p_car_item){
                        exists_elem = p_car_item.complete == '0'?true:exists_elem;
                    });

                    if (!exists_elem){
                        p_request_item.toggle_flag_complete(true);
                    }

                    p_request_item.toggle_flag_part_complete(true);
                }else {
                    create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                }
            }else{
                if (await save_complete_flag_ajax(user_id,l_cars_item.criteria_id,'0')=='done') {
                    l_cars_item.complete = '0';
                    $(this).children('span').removeClass('complete-button-icon-green');
                    $(this).children('span').addClass('complete-button-icon-blue');

                    l_cars_item.list_of_cars_mas.forEach(function(item){
                        item.complete = '0';
                        item.complete_btn.children('span').removeClass('complete-button-icon-green');
                        item.complete_btn.children('span').addClass('complete-button-icon-blue');
                        item.complete_btn.attr('title',user_name);
                    });

                    let exists_elem = false;
                    md_content.list_of_cars_item_mas.forEach(function(p_car_item){
                        exists_elem = p_car_item.complete == '1'?true:exists_elem;
                    });

                    if (!exists_elem){
                        p_request_item.toggle_flag_part_complete(false);
                    }

                    p_request_item.toggle_flag_complete(false);
                }else {
                    create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                }
            }
        });

        l_cars_item.close = '0';//(p_complete==undefined?'0':p_complete);
        l_cars_item.close_btn = $('<button>')
            .addClass('request-button cars-item-close-btn-parent')
            .attr('title','Закрыть')

            .append('<span class="request-button-icon"></span>')
            .appendTo(l_cars_item);

        l_cars_item.close_btn.on('click', async function(){
            async function save_close_flag_ajax(p_user_id,p_criteria_id,p_close,p_close_comment){
                try {
                    return await $.ajax({
                        url: 'data.php',
                        type: 'POST',
                        dataType: 'text',
                        data: { user_id: p_user_id
                               ,criteria_id: p_criteria_id
                               ,close: p_close
                               ,close_comment:p_close_comment
                               ,ajax_action: 'save_crit_close_for_request'}
                    });
                } catch(e) { window.alert(e); return null; }
            }

            if ($(this).hasClass('request-button-active')){
                if (l_cars_item.close == '0'){
                    if (await save_close_flag_ajax(user_id,l_cars_item.criteria_id,'1',l_cars_item.close_comment.val())=='done') {
                        l_cars_item.close = '1';
                        $(this).children('span').removeClass('close-button-icon-blue');
                        $(this).children('span').addClass('close-button-icon-green');
                        $(this).attr('title',user_name);

                        l_cars_item.list_of_cars_mas.forEach(function(item){
                            item.close = '1';
                            item.close_btn.children('span').removeClass('close-button-icon-blue');
                            item.close_btn.children('span').addClass('close-button-icon-green');
                            item.close_btn.attr('title',user_name);
                        });

                        p_request_item.toggle_flag_part_closed(true);
                    }else {
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    }
                }else{
                    if (await save_close_flag_ajax(user_id,l_cars_item.criteria_id,'0',l_cars_item.close_comment.val())=='done') {
                        l_cars_item.close = '0';
                        $(this).children('span').removeClass('close-button-icon-green');
                        $(this).children('span').addClass('close-button-icon-blue');

                        l_cars_item.list_of_cars_mas.forEach(function(item){
                            item.close = '0';
                            item.close_btn.children('span').removeClass('close-button-icon-green');
                            item.close_btn.children('span').addClass('close-button-icon-blue');
                            item.close_btn.attr('title',user_name);
                        });

                        let exists_elem = false;
                        md_content.list_of_cars_item_mas.forEach(function(p_car_item){
                            exists_elem = p_car_item.close == '1'?true:exists_elem;
                            p_car_item.list_of_cars_mas.forEach(function(p_car){
                                exists_elem = p_car.close == '1'?true:exists_elem;
                            });
                        });

                        if (!exists_elem){
                            p_request_item.toggle_flag_part_closed(false);
                        }

                    }else {
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    }
                }
            } else{
                return '';
            }
        });

        l_cars_item.close_comment_div = $('<div>')
            .addClass('cars-item-div')
            .append($('<span>',{'text':'Коментарий','class':'criteria-item-span'}))
            .hide()
            .appendTo(l_cars_item);
        l_cars_item.close_comment = $('<input>',{'class':'text ui-widget-content ui-corner-all','maxlength':'250',})
            .css({'width':'10em'})
            .appendTo(l_cars_item.close_comment_div);

        /***************** Путь *****************/
        const div1 = $('<div>')
            .addClass('cars-item-div')
            .css({'margin-left': '3px'})
            .append($('<span>',{'text':'Путь','class':'criteria-item-span','style':'padding: 2px 0px 5px;'}))
            .appendTo(l_cars_item);
        l_cars_item.railway = $('<select>')
            .css({'width':'10em'})
            .appendTo(div1);
        l_cars_item.railway.append($('<option>'));
        $.each(p_document.railways_for_request, function( i, item ) {
            l_cars_item.railway.append($('<option>',{'val':item.ID,'text':item.NAME,'disabled':item.DISABLED=='Y'?true:false}).css({'margin-left':((item.LVL-1)*10 + 'px')}));
        });
        /***************** Путь *****************/

        /***************** Техн. точка *****************/
        const div2 = $('<div>')
            .addClass('cars-item-div')
            .append($('<span>',{'text':'Техн. точка','class':'criteria-item-span'}))
            .appendTo(l_cars_item);
        l_cars_item.point = $('<select>')
            .css({'width':'10em'})
            .appendTo(div2);
        l_cars_item.point.append($('<option>'));
        /***************** Техн. точка *****************/

        /***************** Тип *****************/
        const div3 = $('<div>')
            .addClass('cars-item-div')
            .append($('<span>',{'text':'Тип','class':'criteria-item-span'}))
            .appendTo(l_cars_item);
        l_cars_item.type = $('<select>')
            .appendTo(div3);
        l_cars_item.type.append($('<option>'));
        $.each(g_car_type_list, function( i, item ) {
            l_cars_item.type.append($('<option>',{'val':item.CAR_TYPE,'text':item.CAR_TYPE}));
        });
        /***************** Тип *****************/

        /***************** Статус *****************/
        const div4 = $('<div>')
            .addClass('cars-item-div')
            .append($('<span>',{'text':'Статус','class':'criteria-item-span'}))
            .appendTo(l_cars_item);
        l_cars_item.status = $('<select>')
            .css({'width':'6em'})
            .appendTo(div4);
        $.each(g_inspection_results, function( i, item ) {
            l_cars_item.status.append($('<option>',{'val':item.CODE,'text':item.CODE}));
        });
        /***************** Статус *****************/

        /***************** Состояние *****************/
        const div5 = $('<div>')
            .addClass('cars-item-div')
            .append($('<span>',{'text':'Состояние','class':'criteria-item-span'}))
            .appendTo(l_cars_item);
        l_cars_item.state = $('<select>')
            .appendTo(div5);
        l_cars_item.state.append($('<option>'));
        l_cars_item.state.append($('<option>',{'val':'пор.','text':'пор.'}));
        l_cars_item.state.append($('<option>',{'val':'гр.','text':'гр.'}));
        /***************** Состояние *****************/

        /***************** Груз *****************/
        const div10 = $('<div>')
            .addClass('cars-item-div')
            .append($('<span>',{'text':'Груз','class':'criteria-item-span'}))
            .appendTo(l_cars_item);
        l_cars_item.freight = $('<select>')
            .css({'width':'11em'})
            .appendTo(div10);
        l_cars_item.freight.append($('<option>'));
        $.each(g_freight_list, function( i, item ) {
            l_cars_item.freight.append($('<option>',{'val':item.FREIGHT_NAME,'text':item.FREIGHT_NAME}));
        });
        /***************** Груз *****************/

        /***************** Кол-во *****************/
        const div11 = $('<div>')
            .addClass('cars-item-div')
            .append($('<span>',{'text':'Кол-во','class':'criteria-item-span'}))
            .appendTo(l_cars_item);
        l_cars_item.cars_count = $('<input>',{'class':'criteria-item-cars-count text ui-widget-content ui-corner-all required','maxlength':'3'})
            .appendTo(div11);
        l_cars_item.cars_count.on('keypress', function (e){
            // Разрешаем: backspace, delete, влево, вправо
            if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
                return;
            }

            const chr = String.fromCharCode(e.charCode);

            if (chr < '0' || chr > '9') {
                return false;
            }
        });

        l_cars_item.cars_count.on('blur',function(){
            disable_save_btn();
        });
        /***************** Кол-во *****************/

        /***************** Задача *****************/
        const div6 = $('<div>')
            .addClass('cars-item-div')
            .append($('<span>',{'text':'Задача','class':'criteria-item-span'}))
            .appendTo(l_cars_item);
        l_cars_item.task = $('<select>',{class:'cars-item-task'})
            .css({'width':'11em'})
            .appendTo(div6);
        l_cars_item.task.append($('<option>'));
        p_document.criteria_tasks_for_request.forEach(function(item){
             l_cars_item.task.append($('<option>',{'val':item.ID,'text':item.NAME}));
        });
        /***************** Задача *****************/

        /***************** Время *****************/
        const div7 = $('<div>')
            .addClass('cars-item-div')
            .append($('<span>',{'text':'Время','class':'criteria-item-span'}))
            .appendTo(l_cars_item);
        l_cars_item.date_out = $('<input>',{class:'text ui-widget-content ui-corner-all',css:{'width':'9em'}})
            .appendTo(div7);
        init_date_time_input(l_cars_item.date_out);

        l_cars_item.date_out.on('blur',function(){

            if (l_cars_item.date_out.val() != '' && !l_cars_item.date_out.hasClass('red_bckg_color')){
                const l_deadline_in = string_to_date(md_content.deadline_date_in_input.val());
                const l_deadline_out = string_to_date(md_content.deadline_date_out_input.val());

                const l_date = string_to_date(l_cars_item.date_out.val());

                let l_msg = '';

                if (Math.floor((l_date - l_deadline_in)/1000/60/60) < 4) {
                    l_msg = 'Время должно быть больше начальной на 4 часа!';
                } else if ((l_deadline_out - l_date) < 0){
                    l_msg = 'Время должно быть меньше конечной!';
                }else{
                    l_cars_item.date_out.attr('title','');
                    l_msg = '';
                }

                if (l_msg!=''){
                    l_cars_item.date_out
                        .addClass('red_bckg_color')
                        .attr('title',l_msg)
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
                    setTimeout(function() { l_cars_item.date_out.tooltip( 'close' ) }, 2500);
                }
            }else{
                l_cars_item.date_out.attr('title','');
            }

            disable_save_btn();
        });

        /***************** Время *****************/

        /***************** Примечание *****************/
        const div8 = $('<div>')
            .addClass('cars-item-div')
            .append($('<span>',{'text':'Примечание','class':'criteria-item-span'}))
            .appendTo(l_cars_item);
        l_cars_item.descr = $('<input>',{'class':'cars-item-descr text ui-widget-content ui-corner-all','maxlength':'250'})
            .appendTo(div8);
        /***************** Примечание *****************/

        /***************** Список вагонов *****************/
        const div9 = $('<div>')
            .addClass('cars-item-div-list')
            .appendTo(l_cars_item);
        const div9_1 = $('<div>')
            .appendTo(div9);
        $('<span>',{'text':'Номера вагонов',css:{'margin-right':'0.5em'}}).appendTo(div9_1);
        const l_car_number = $('<input>',{'maxlength':'8','class':'cars-item-input ui-widget-content ui-corner-all'})
            .appendTo(div9_1);
        l_car_number.on('keypress', function (e){
            // Разрешаем: backspace, delete, влево, вправо
            if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
                return;
            }

            const chr = String.fromCharCode(e.charCode);

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

        l_cars_item.add_car_btn = $('<button>',{'class':'request-button cars-item-add-btn'})
            .append('<span class="">Добавить</span>')
            .appendTo(div9_1);
        l_cars_item.list_of_cars = $('<div>',{'class':'cars-item-list-of-cars helper-clearfix'})
            .appendTo(div9);

        l_car_number.autocomplete({
            source: function(request, response){
              // организуем кроссдоменный запрос
              $.ajax({
                url: 'data.php',
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
                    const l_res = JSON.parse(data);

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

        l_cars_item.list_of_cars_mas = [];

        l_cars_item.add_car_btn.on('click', async function(){
            if (!l_car_number.hasClass('true-car-number')) return;
            const l_car = l_car_number.val();
            try {
                const results = await Promise.all([1, 2, 3, 4, 5, 6, 7].map(function(info_type) {
                    return $.ajax({
                        url: 'data.php',
                        type: 'POST',
                        dataType: 'text',
                        data: { car_number: l_car, info_type: info_type, ajax_action: 'get_info_for_car_request' }
                    });
                }));
                const [l_owner, l_station, l_railway, l_status, l_state, l_freight, l_exist] = results;
                l_cars_item.add_car(l_car, l_owner, l_station, l_railway, l_status, l_state, l_freight, '', '0', '', '', '0', '0', '0', '0', '', '', '', l_exist);
            } catch(e) { window.alert(e); }
        });

        /***************** Кнопка удалить *****************/
        l_cars_item.remove_btn = $('<button>')
            .addClass('request-button criteria-item-delete-button')
            .attr('title','Удалить вагоны')
            .append('<span class="request-button-icon delete-button-icon"></span>')
            .appendTo(l_cars_item);

        l_cars_item.remove_btn.on('click', function(){
            l_cars_item.remove();
            delete md_content.list_of_cars_item_mas[l_cars_item.pos];
            disable_save_btn();
        });
        /***************** Кнопка удалить *****************/

        /*инициализация атрибутов*/
        if (p_cars != null){
            const l_criteria_mas  = p_cars.split(g_del_2);
            l_cars_item.criteria_id =l_criteria_mas[0];
            l_cars_item.railway.val(l_criteria_mas[1]);
            l_cars_item.point.val(l_criteria_mas[2]);
            l_cars_item.type .val(l_criteria_mas[3]);
            l_cars_item.status .val(l_criteria_mas[4]);
            l_cars_item.state.val(l_criteria_mas[5]);
            l_cars_item.freight.val(l_criteria_mas[6]);
            l_cars_item.cars_count.val(l_criteria_mas[7]);
            l_cars_item.task.val(l_criteria_mas[8]);
            l_cars_item.date_out.val(l_criteria_mas[9]);
            l_cars_item.descr.val(l_criteria_mas[10]);
            l_cars_item.complete = l_criteria_mas[11];
            l_cars_item.close = l_criteria_mas[14];

            l_cars_item.complete_btn.attr('title',(l_criteria_mas[13]==''?'Выполнить':l_criteria_mas[13]+' '+l_criteria_mas[12]));
            l_cars_item.close_btn.attr('title',(l_criteria_mas[16]==''?'Закрыть':l_criteria_mas[16]+' '+l_criteria_mas[15]+' '+l_criteria_mas[17]));
            l_cars_item.close_comment.val(l_criteria_mas[17]);

            try {
                const data = await $.ajax({
                    url: 'data.php',
                    type: 'POST',
                    dataType: 'text',
                    data: { criteria_id: l_cars_item.criteria_id
                           ,ajax_action: 'get_request_criteria_cars_new'}
                });
                const l_cars = JSON.parse(data);
                l_cars.forEach(function(item){
                    l_cars_item.add_car(item.CAR_NUMBER,item.OWNER,item.STATION,item.RAILWAY,item.STATUS,item.STATE,item.FREIGHT,item.INFO_DATE,item.COMPLETE
                                       ,item.COMPLETE_DATE,item.COM_FULL_NAME,item.V,item.O,item.T,item.CLOSE,item.CLOSE_DATE,item.CL_FULL_NAME,item.CLOSE_COMMENT
                                       ,item.EXIST_REQ);
                });
            } catch(e) { window.alert(e); }
        }

        if (p_cars_add != null && p_cars_add != undefined){
            const l_cars_add = p_cars_add.split('|');

            l_cars_item.railway.val((l_cars_add[0]==='_'?'':l_cars_add[0]));

            const l_cars_mas = l_cars_add[1].split(':');

            l_cars_item.cars_count.val(l_cars_mas.length);

            l_cars_mas.forEach(function(car){
                l_car_number.val(car);
                l_car_number.addClass('true-car-number');
                l_cars_item.add_car_btn.trigger('click');

                l_car_number.val('');
                l_car_number.removeClass('true-car-number');
            });
        }

        l_cars_item.complete_btn.children('span').addClass((l_cars_item.complete=='0'?'complete-button-icon-blue':'complete-button-icon-green'));
        l_cars_item.close_btn.children('span').addClass((l_cars_item.close=='0'?'close-button-icon-blue':'close-button-icon-green'));

        l_cars_item.railway.combobox({menuMaxHeight: '25em'});

        disable_save_btn();
    });

    /*инициализация критериев и вагонов по заявке*/
    md_content.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        position: { my: 'top', at: 'top+150' },
        buttons:{
            'Сохранить заявку':{
                text: "Сохранить",
                id: "md_save_request_btn",
                click: async function(){
                    const f_res = await save_request_ajax();
                    const f_res_mas = f_res.split('$');
                    if (f_res_mas[0]==='done') {
                        let l_mes = '';
                        if (p_request_item == null){
                            md_content.request_id = f_res_mas[1];
                            const l_title = '№'+md_content.request_id+' ('+user_name+')'; /*user_name - глобальная переменная из context_menu.js*/
                            const l_cur_request = p_document.add_request_to_content(md_content.request_id,user_id,l_title); /*user_id - глобальная переменная из context_menu.js*/

                            if (md_content.criticality_select.val()==='1') {
                                l_cur_request.add_flag_criticality();
                            }

                            l_cur_request.toggle_flag_processing(false);
                            l_cur_request.toggle_flag_part_closed(false);

                            l_mes = 'Заявка №'+md_content.request_id+' создана!';
                            if (f_res_mas[2] != ''){
                                l_mes+=' Созданы дочерние заявки с номерами '+f_res_mas[2];
                            }
                            l_request_this.refresh_requests();
                        } else{
                            if (md_content.criticality_select.val()==='1') {
                                p_request_item.add_flag_criticality();
                            } else {
                                p_request_item.rem_flag_criticality();
                            }

                            l_mes = 'Заявка №'+md_content.request_id+' обновлена!';
                        }
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Оповещение',l_mes);/*функция из файла context_menu.js*/
                    }else{
                        md_content.dialog("close");
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    };
                }
            },
            'Частичное закрытие': {
                text: "Частичное закрытие",
                id: "md_part_close_request_btn",
                click:function(){
                    $('#md_part_close_request_btn').toggleClass('request-button-active');

                    md_content.list_of_cars_item_mas.forEach(function(p_cars_item){
                        p_cars_item.close_btn.toggleClass('request-button-active');
                        p_cars_item.close_comment_div.toggle();
                        p_cars_item.close_comment.toggleClass('request-button-active');
                        p_cars_item.list_of_cars_mas.forEach(function(p_car){
                            p_car.close_btn.toggleClass('request-button-active');
                            p_car.close_comment.toggle().toggleClass('request-button-active');
                            p_car.toggleClass('cars-item-car-div-large');
                        });
                    });

                    /*md_content.close_comment_input.toggle();*/
                    $('#md_save_request_btn').prop('disabled', function(i, v) { return !v; });
                    $('#md_close_request_btn').prop('disabled', function(i, v) { return !v; });
                    $('#md_close_form_btn').prop('disabled', function(i, v) { return !v; });

                }
            },
            'Закрыть заявку': {
                text: "Закрыть заявку",
                id: "md_close_request_btn",
                click: async function(){
                    async function save_request_status_ajax(){
                        try {
                            return await $.ajax({
                                url: 'data.php',
                                type: 'POST',
                                dataType: 'text',
                                data: { request_id: md_content.request_id
                                       ,status: md_lvl_2_content.status_select.val()
                                       ,status_descr: md_lvl_2_content.status_descr_input.val()
                                       ,ajax_action: 'save_request_status'}
                            });
                        } catch(e) { window.alert(e); return null; }
                    }

                    const md_lvl_2_content = $('<div/>')
                        .addClass('md-lvl-2')
                        .attr('title','Закрыть заявку')
                        .appendTo('body');

                    md_lvl_2_content.status_select = $('<select>',{class:'request-window-attr-item-elem'});
                    md_lvl_2_content.status_select.append($('<option>',{'val':'D','text':'Выполнено'}));
                    md_lvl_2_content.status_select.append($('<option>',{'val':'R','text':'Выполнено с замечаниями'}));
                    md_lvl_2_content.status_select.append($('<option>',{'val':'F','text':'Не выполнено'}));
                    md_lvl_2_content.status_descr_input = $('<input>',{class:'request-window-attr-item-elem ui-widget-content ui-corner-all',css:{'width':'20em'}});

                    const l_div_status = $('<div>')
                        .addClass('request-window-attr-item helper-clearfix')
                        .append($('<label>',{text:'Статус',class:'request-window-attr-item-text'}))
                        .append(md_lvl_2_content.status_select);
                    const l_div_status_descr = $('<div>')
                        .addClass('request-window-attr-item helper-clearfix')
                        .append($('<label>',{text:'Комментарий',class:'request-window-attr-item-text'}))
                        .append(md_lvl_2_content.status_descr_input);

                    md_lvl_2_content.check_data = function (){
                        if (md_lvl_2_content.status_select.val()!='D' && md_lvl_2_content.status_descr_input.val()==''){
                            $('#md_save_request_status_btn').prop( "disabled",true);
                        }else{
                            $('#md_save_request_status_btn').prop( "disabled",false);
                        }
                    };

                    md_lvl_2_content.status_select.on('change', function(){
                        if ($(this).val()==='D'){
                            md_lvl_2_content.status_descr_input.removeClass('required');
                        }else{
                            md_lvl_2_content.status_descr_input.addClass('required');
                        }
                        md_lvl_2_content.check_data();
                    });

                    md_lvl_2_content.status_descr_input.on('keyup', function(){
                        md_lvl_2_content.check_data();
                    });

                    $('<div>')
                        .addClass('request-window-attr')
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
                                id: "md_save_request_status_btn",
                                click: async function(){
                                    md_content.dialog("close");
                                    md_lvl_2_content.dialog("close");

                                    if (await save_request_status_ajax()==='done'){
                                        p_request_item.remove();
                                        delete p_document.request_content_mas[p_request_item.pos];

                                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');/*функция из файла context_menu.js*/
                                    }else{
                                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
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
            'В обработке': {
                text: "В обработке",
                id: "md_processing_request_btn",
                click: async function(){
                    async function save_processing_status_ajax(){
                        try {
                            return await $.ajax({
                                url: 'data.php',
                                type: 'POST',
                                dataType: 'text',
                                data: { request_id: md_content.request_id
                                       ,ajax_action: 'save_processing_status'}
                            });
                        } catch(e) { window.alert(e); return null; }
                    }

                    if (await save_processing_status_ajax()==='done'){
                        $('#md_processing_request_btn').toggleClass('processing-status-on-btn');

                        if (md_content.status === 'O') {
                            md_content.status = 'P';
                            if (user_id==md_content.created_by || p_document.r_change_request){
                                $('#md_save_request_btn').hide();
                                disable_request();
                            }
                            if (r_complete_request&&md_content.request_id!=null) {
                                toggle_complete_btns(false);
                            }
                            p_request_item.toggle_flag_processing(true);
                        }else{
                            md_content.status = 'O';
                            if (user_id==md_content.created_by || p_document.r_change_request){
                                $('#md_save_request_btn').show();
                                enable_request();
                            }
                            if (r_complete_request&&md_content.request_id!=null) {
                                toggle_complete_btns(true);
                            }
                            p_request_item.toggle_flag_processing(false);
                        }
                        create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');/*функция из файла context_menu.js*/
                    }else{
                        create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!!!');
                    }
                }
            },
            'Закрыть форму': {
                text:'Закрыть форму',
                id:'md_close_form_btn',
                click: function(){
					before_saving(md_content);
                }
            }
        },
        close: function() {
            md_content.remove();
        }
    });

    if (p_request_item != null) {
        try {
            const data = await $.ajax({
                url: 'data.php',
                type: 'POST',
                dataType: 'text',
                data: { request_id: md_content.request_id
                       ,ajax_action: 'get_request_criterias'}
            });
            const l_criterias_mas = data.split(g_del_1);
            l_criterias_mas.pop();

            for (const item of l_criterias_mas) {
                await md_content.cars_add_button.triggerHandler('click', item);
            }
        } catch(e) { window.alert(e); }
    } else if (p_cars_req_win != null && p_cars_req_win !== undefined) {
        const l_cars_req_win_mas = p_cars_req_win.split('$');

        for (const item of l_cars_req_win_mas) {
            await md_content.cars_add_button.triggerHandler('click', [null, item]);
        }
    }

    disable_save_btn();

    if (p_request_item != null && !p_document.r_change_request){
        $('#md_save_request_btn').hide();
        disable_request();
    }

    if (p_request_item == null) {
        $('#md_processing_request_btn').hide();
    } else if (!r_complete_request){
        $('#md_processing_request_btn').prop('disabled', true);
    }

    if (md_content.status === 'P'){
        $('#md_processing_request_btn').addClass('processing-status-on-btn');
        $('#md_save_request_btn').hide();
        disable_request();
    }

    if (!r_complete_request||md_content.request_id==null||md_content.status != 'P') {
        toggle_complete_btns(true);
    }

    if (p_request_item == null || (user_id!=md_content.created_by&&!p_document.r_change_request)){
        $('#md_close_request_btn').hide();
        $('#md_part_close_request_btn').hide();
    }
}

/*p_cars - в формате номер_вагона:номер_вагона:номер_ва....*/
async function call_create_request_window(p_task,p_cars,p_need_railway){
    try {
        p_cars = await $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: 'text',
            data: { ajax_action: 'get_cars_with_railways'
                   ,cars: p_cars
                   ,need_railway: p_need_railway
                  }
        });
    } catch(e) { window.alert(e); return; }

    create_request_window(l_request_this,null,p_task,p_cars);
}
