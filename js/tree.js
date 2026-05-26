function selectFindElements() {  
    function get_cars_rows_for_find_table(p_location_of_cars){
        var l_location_of_cars = p_location_of_cars;
        
        var res = '';
        l_location_of_cars.forEach(function(item){
            res+='<tr>';
            res+='<td>'+item.CAR_NUMBER+'</td>';
            res+='<td>'+item.STATION+'</td>';
            res+='<td>'+item.LOCATION+'</td>';
            res+='<td>'+item.RAILWAY+'</td>';
            res+='<td>'+item.STATUS+'</td>';
            res+='<td>'+item.STATE+'</td>';
            res+='<td>'+item.FREIGHT_NAME+'</td>';
            res+='<td>'+item.OWNER+'</td>';
            res+='</tr>';
        });
        return res;
    }
    
    var l_find_car = $('#inputFind').val();
    
    $('.tree_selectedFind').removeClass('tree_selectedFind');
    
    if (l_find_car !== '') {
        $('li.tree_ExpandOpen').removeClass('tree_ExpandOpen').addClass('tree_ExpandClosed');
    }
    var l_flag_find_element = false;
    $('.tree_Content:contains("'+((l_find_car === '') ? '?' : l_find_car)+'")').each(function(indx){
        $(this).addClass('tree_selectedFind');
        $(this).parents('li.tree_ExpandClosed').removeClass('tree_ExpandClosed').addClass('tree_ExpandOpen');
        $('aside').scrollTop(0);
        $('aside').scrollTop($(this).offset().top-$('aside').height()/2);
        l_flag_find_element = true;
    });
    
    if (!l_flag_find_element&&l_find_car !== '') {
        $.ajax({
            url: 'data.php',
            type: 'POST',
            dataType: "text",
            data: {find_car: l_find_car
                  ,ajax_action: 'get_location_of_cars'
                  },
            success: function (data) {
                $('#modalDialog').remove();
                $('.context-menu').remove();
                $('.xdsoft_datetimepicker').remove();
                
                var l_location_of_cars = JSON.parse(data);
                if (l_location_of_cars.length===0){
                    create_info_modal_dialog_new('Результат поиска','Вагоны не найдены!');
                }else{
                    $('<div/>')
                    .attr('id','modalDialog')
                    .attr('title','Результат поиска')
                    .appendTo('body') // Присоединяем наше меню к body документа: 
                    .append('<table class="find_cars_table">'+
                                '<thead>'+
                                    '<tr>'+
                                        '<th>№ вагона</th>'+
                                        '<th>Станция</th>'+
                                        '<th>Расположение</th>'+
                                        '<th>Путь</th>'+
                                        '<th>Статус</th>'+
                                        '<th>Сост.</th>'+
                                        '<th>Наим. груза</th>'+
                                        '<th>Пред.</th>'+
                                    '</tr>'+
                                '</thead>'+
                            '</table>'+
                            '<div class="modalDialogContainer" style="display: inline-block;">'+
                                '<table class="find_cars_table">'+
                                    '<tbody>'+
                                        get_cars_rows_for_find_table(l_location_of_cars)+
                                    '</tbody>'+
                                '</table>'+
                            '</div>'
                           );
                    // вызываем модальное окно 
                    $("#modalDialog").dialog({
                        resizable:false,
                        modal:true,
                        width: 'auto',
                        buttons:{
                            'Закрыть': function(){
                                $(this).dialog( "close" );
                            }
                        }
                    });
                }
            },
            error: function (m1,m2) {window.alert(m1+m2);}
        });
    }
}

function toggleNode(node) {
    // определить новый класс для узла
    var newClass = node.hasClass('tree_ExpandOpen') ? 'tree_ExpandClosed' : 'tree_ExpandOpen';
    node.removeClass('tree_ExpandOpen tree_ExpandClosed');
    node.addClass(newClass);
}

$(document).ready(function() {
    $('#add_btn_turn').on('click',function(){
        var l_add_btn_content = $('#add_btn_content');
        if (l_add_btn_content.is(":visible")){
            l_add_btn_content.hide();
        } else {
            l_add_btn_content.show();
        } 
    });
    
    /*нажатие Enter в поле поиска вагона*/
    $('#inputFind').on('keypress', function(e){
        if(e.keyCode===13){
            selectFindElements();
        }
    });
    
    /*клик по дереву*/
    $('#currentCarstree,#comingCarsTree').on('click',function(event) {       
        var target = $(event.target);
        var parent_target = target.parent();
        
        /*обрабатываю закрытие/открытие узла*/
        if (target.hasClass('tree_Expand')&&!parent_target.hasClass('tree_ExpandLeaf') /*&& parent_target.find('ul > li').length*/) { 
            toggleNode(parent_target);
        }
    });
    
    start_loading_animation();
    $.when(
        tree('currentCarstree', null, 'Y'),
        tree('comingCarsTree', null, 'N')
    ).always(function() {
        stop_loading_animation();
    });
    
    $('#selectStation').on('change', function(event) {
        start_loading_animation();
        if ($(this).val()===user_station_id){
            $('#received_into_station_btn').show();
        } else {
            $('#received_into_station_btn').hide();
        }
        
        if ($(this).val()==='1'){
            $('#notification_btn').show();
            $('#entry_foreign_railcar_btn').show();
        }else{
            $('#notification_btn').hide();
            $('#entry_foreign_railcar_btn').hide();
        }
        if ($(this).val()==='2'){
            $('#notification_gu_btn').show();
        }else{
            $('#notification_gu_btn').hide();
        }
        
             
        $('#currentCarstree > li, #comingCarsTree > li').addClass('tree_ExpandOpen');
        $('#currentCarstree > li, #comingCarsTree > li').removeClass('tree_ExpandClosed');
        $('#currentCarstree > li > ul *, #comingCarsTree > li > ul *').remove();
        $('#currentCarstree > li, #comingCarsTree > li').attr('data-id',$(this).val());
        $('table.addInfoTable tbody').empty();
        $('#notification_btn').attr('disabled',false);
        $.when(
            tree('currentCarstree', null, 'Y'),
            tree('comingCarsTree', null, 'N')
        ).always(function() {
            stop_loading_animation();
        });
    });
    
    $('#refreshComingRailcar').on('click',function(event) {
        start_loading_animation();
        $('#comingCarsTree > li').addClass('tree_ExpandOpen');
        $('#comingCarsTree > li').removeClass('tree_ExpandClosed');
        $('#comingCarsTree > li > ul *').remove();
        tree('comingCarsTree', null, 'N').always(function() {
            stop_loading_animation();
        });
    });

    $('#refreshRailcar').on('click',function(event) {
        start_loading_animation();
        $('#currentCarstree > li').addClass('tree_ExpandOpen');
        $('#currentCarstree > li').removeClass('tree_ExpandClosed');
        $('#currentCarstree > li > ul *').remove();
        tree('currentCarstree', null, 'Y').always(function() {
            stop_loading_animation();
        });
    });
});

function updateCarsForUgleuralskaya(){
    var refresh;
    $('#modalDialog').remove();
    $('<div/>')
        .attr('id','modalDialog')
        .attr('title','Обновление данных')
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append('<p>Идет обновление. Пожалуйста подождите.</p>');
    var dialog = $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: '400px',
        draggable: false,
        open:function() {
            $(this).parents(".ui-dialog:first").find(".ui-dialog-titlebar-close").remove();
        }
    });
    
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { ajax_action: 'updateCarsForUgleuralskaya'},
        success: function (data) {
                    refresh = data;
                },
        error: function () {
                    refresh = 'fail';
                }

    });

    if (refresh!=='done') {
        $('#modalDialog p').text('Обновление данных по станции Углеуральской прошло с ошибкой. Обратитесь к разработчикам!');
    } else {
        $('#refreshComingRailcar,#refreshRailcar').triggerHandler('click');
        
        $('#modalDialog p').text('Обновление данных по станции Углеуральской прошло успешно!');
    }
    dialog.dialog({
        buttons:{
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        }});
}

function tree(p_ul_id, mode,p_flag) {
    var l_ul = $('#'+p_ul_id);
    
    var l_tree = new Array();

    function load(node) {
        function showLoading(on) {
            var expand = node.children('div.tree_Expand');
            expand.removeClass;
            expand.addClass((on ? 'tree_ExpandLoading' : 'tree_Expand'));
        }
        
        showLoading(true);
        for(var i=0; i<l_tree.length; i++) {
            var child = l_tree[i];
            if (child.PARENT_ID===node.attr('data-id')&&child.PARENT_TYPE===node.attr('data-type')){
                var li = $('<li/>');
                li.attr('data-id',child.ID);
                li.attr('data-type',child.TYPE);
                li.attr('data-from_station_id',child.FROM_STATION_ID);
                li.attr('data-notification',child.NOTIFICATION);
				li.attr('output-defective-cars',child.OUTPUT_DEFECTIVE_CARS);
				li.attr('movement-un-loading',child.MOVEMENT_UN_LOADING);   
				
                li.attr('data-notification-gu',(child.NOTIFICATION_GU !== null?'Y':'N'));
                li.addClass('tree_Node');
                switch (child.TYPE) {
                    case 'railcar':
                        li.addClass('tree_ExpandLeaf');
                        break;
                    case 'cont':
                        li.addClass('tree_ExpandLeaf');
                        break;
                    case 'railway':
                        li.addClass('tree_ExpandClosed');
                        break;
                    default:
                        li.addClass('tree_ExpandClosed');
                        break;
                }
                
                if (child.TYPE === 'railcar' && child.NEED_FILL_ATTR==='Y') {
                    li.addClass('need_fill_attr');
                }

                li.append('<div class="tree_Expand"></div>');
                if (child.TYPE === 'railway' && child.DISABLED==='N') {
                    li.append('<div class="tree_img tree_img_railway '+(child.LIKE_RAILWAY==='Y'?'tree_img_like_railway':'')+'"></div>');
                } else if (child.TYPE === 'point') {
                    li.append('<div class="tree_img tree_img_point"></div>');
                } else if (child.TYPE === 'area') {
                    li.append('<div class="tree_img tree_img_area '+(child.LIKE_RAILWAY==='Y'?'tree_img_like_area':'')+'"></div>');
                } //else if (child.TYPE === 'cont') {
                //    li.append('<div class="tree_img tree_img_cont"></div>');
                //}
                
                if (child.TYPE==='railcar' || child.TYPE==='cont'){
                    li.append('<span class="tree-content-order">'+child.R_ORDER+'</span>');
                }
				
				
				if (p_flag ==='Y' && child.TYPE =='railway' && child.DISABLED==='N') {
					var l_count_railcars = '';
						l_count_railcars = child.COUNT_RAILCARS;
					var l_fix_even = '';
					var l_fix_odd = '';
					if (child.COUNT_FIX_DEV_EVEN !== '0' || child.COUNT_FIX_DEV_EVEN !== '' ){
						l_fix_even = child.COUNT_FIX_DEV_EVEN; 
					} else {
						l_fix_even = '0'; 
					}
					if (child.COUNT_FIX_DEV_ODD !== '0' || child.COUNT_FIX_DEV_ODD !== '' ){
						l_fix_odd = child.COUNT_FIX_DEV_ODD; 
					} else {
						l_fix_odd = '0'; 
					}
					// Если есть вагоны на путях и не назначены ЗУ или Нет вагонов, но назначены ЗУ
					if (((l_fix_even !=='0' || l_fix_odd !=='0') && child.COUNT_RAILCARS =='0') || (child.COUNT_RAILCARS !=='0' && (l_fix_even =='0' && l_fix_odd =='0'))){
						li.append('<div class="tree_Content '+(child.TYPE==='railway'?'tree_content_railway':'')+'" style="color: red">'+child.NAME+'</div>');
						
					} else {
						li.append('<div class="tree_Content '+(child.TYPE==='railway'?'tree_content_railway':'')+'">'+child.NAME+'</div>');
					}
					
                
				} else {
					// Подсвечиваем вагон
					if (child.CAR_TYPE_CONTROL == 'Y') {
						var l_car_name = child.NAME+child.CAR_CONTROL_KW;
						var l_note = '"'+child.CAR_CONTROL_NOTE+'"';
						var l_color = child.CAR_CONTROL_COLOR;
						li.append('<div title='+l_note+' class="tree_Content '+(child.TYPE==='railway'?'tree_content_railway':'')+'" style="background:'+l_color+'">'+l_car_name+'</div>'); 
					} else {
						li.append('<div class="tree_Content '+(child.TYPE==='railway'?'tree_content_railway':'')+'">'+child.NAME+'</div>');
					}
				}
                
                if (child.TYPE === 'railcar' && child.NOT_INFO_FROM_SHOP === 'Y'){
                    li.append('<div class="tree_img tree_img_info" title="Нет информации о погрузке/разгрузке"></div>');
					
                }
				
                
                if (child.TYPE === 'railcar' && child.TRUE_NUMBER==='N') {
                    li.addClass('wrong_number');
                    li.append('<div class="tree_img tree_img_info" title="Неправильный номер вагона/платформы!"></div>');
                }
                
                if (child.NOTIFICATION_GU !== null) {
                    li.append('<span>('+ child.NOTIFICATION_GU+')</span>');
                }
                
                if (p_flag ==='N' && child.FROM_STATION !== null) {
                    li.append('<span>('+ child.FROM_STATION+')</span>');
                }
                if (p_flag ==='Y' && child.TYPE!=='railcar' && child.TYPE!=='bandwagon' && child.TYPE!=='cont') {
					var l_fix_even = '';
					var l_fix_odd = '';
					var l_count_fix = '';
					var l_count_railcars = '';
						l_count_railcars = child.COUNT_RAILCARS;	
						if (child.COUNT_FIX_DEV_EVEN !== '0' || child.COUNT_FIX_DEV_EVEN !== '' ){
							l_fix_even = child.COUNT_FIX_DEV_EVEN; 
						} else {
							l_fix_even = '0'; 
						}
						if (child.COUNT_FIX_DEV_ODD !== '0' || child.COUNT_FIX_DEV_ODD !== '' ){
							l_fix_odd = child.COUNT_FIX_DEV_ODD; 
						} else {
							l_fix_odd = '0'; 
						}
						if (l_fix_even !=='0' || l_fix_odd !=='0'){
							l_count_fix = '/<span style="color: blue">'+l_fix_even+'_'+l_fix_odd+'</span>';
						}
						
						if ((l_fix_even !=='0' || l_fix_odd !=='0') && child.COUNT_RAILCARS =='0'){
							l_count_railcars = '<span style="color: red">'+l_count_railcars+'</span>';
							
						}
					// li.append('<span>('+ child.COUNT_RAILCARS+l_count_fix+')</span>');  // rem 05.12.2019
                    li.append('<span>('+ l_count_railcars+l_count_fix+')</span>');
                }
                
                if (child.TYPE !== 'railcar') {
                    li.append('<ul class="tree_Container"></ul>');
                }
                node.children('ul').append(li); //appendChild(li);

                if (child.TYPE !== 'railcar') {load(li);}
            }
        }
        $('#currentCarstree li[data-type = railway] > div.tree_img_like_railway').parents('li[data-type = railway]').addClass('tree_ExpandOpen').removeClass('tree_ExpandClosed');
        $('#currentCarstree li[data-type = area] > div.tree_img_like_area').parents('li[data-type = area]').addClass('tree_ExpandOpen').removeClass('tree_ExpandClosed');
        
        showLoading(false);
    }
    return $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: 'text',
        data: { station_id: l_ul.children('li').attr('data-id'),
                flag_come: p_flag,
                ajax_action: 'get_tree_station' },
        success: function(data) {
            l_tree = JSON.parse(data);
            load(l_ul.children('li'));
            l_tree = [];
        }
    });
}