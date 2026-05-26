function toggleNode(node) {
    // определить новый класс для узла
    var newClass = node.hasClass('tree_ExpandOpen') ? 'tree_ExpandClosed' : 'tree_ExpandOpen';

    node.removeClass('tree_ExpandOpen tree_ExpandClosed');
    
    node.addClass(newClass);
}

//Убираем стандартное контекстное меню
document.oncontextmenu = function() {return false;}; 

$(document).ready(function() {
    /*изменияем размеры tab-ов по размеру окна*/
    var l_height = $('.wrapper').height() - $('header').height() - $('.ui-tabs-nav').height() - 15;
    $('.ui-tabs-panel').height(l_height);
    
    $('#tabs').removeClass('ui-widget');
    
    $(document).on('mousedown', function(event) {       
        var target = $(event.target);
        var parent_target = target.parent();
        
        if (target.parents('.context-menu').length===0) {
            $('.context-menu').remove(); // Удаляем предыдущие вызванное контекстное меню
        } 
        
        /*обрабатываю закрытие/открытие узла*/
        if (event.which === 1&&target.hasClass('tree_Expand')&&!parent_target.hasClass('tree_ExpandLeaf') && parent_target.find('ul > li').length) { 
            toggleNode(parent_target);
        };
        
        if (target.hasClass('tree_Content')) {
            /*обрабатываем выделение элементов*/
            if (!target.hasClass('tree_selected')) {
                $('.tree_selected').removeClass('tree_selected');
                target.addClass('tree_selected'); 
            }
            /*вывод дополнительной информации по путям*/
            if (parent_target.attr('data-type')==='railway') {
                railway_add_info_ajax(parent_target.attr('data-id'));
            }
            /*вывод контексного меню*/
            if (event.which === 3) { 
                var ul = $('<ul/>');
                if (parent_target.attr('data-type')==='railway'||parent_target.attr('data-type')==='point') {
                    ul.append('<li data-action="up">Вверх</li>');
                    ul.append('<li data-action="down">Вниз</li>');
                }
                if (parent_target.attr('data-type')==='railway') {
                    ul.append('<li data-action="move_railway">Переместить путь</li>');
                    ul.append('<li data-action="change_railway_attr">Изменить аттрибуты</li>');
                    ul.append('<li data-action="add_point">Добавить точку обслуж-ия</li>');
                }
                if (parent_target.attr('data-type')==='railway'||parent_target.attr('data-type')==='station') {
                    ul.append('<li data-action="add_railway">Добавить путь</li>')
                }
                ul.on('click', function(event) {
                    /*Назначаяем действие на нажатие кнопки контексного меню 1-ого уровня*/
                    context_menu_action_1_lvl(event,parent_target);
                });
                
                $('<div/>',{class: 'context-menu'})  // Присваиваем блоку наш css класс контекстного меню:
                .attr('id','context-menu-1lvl')
                .css({                 
                    left: event.pageX+'px', // Задаем позицию меню на X                 
                    top: event.pageY+'px' // Задаем позицию меню по Y             
                })
                .appendTo('body') // Присоединяем наше меню к body документа:             
                .append(ul)
                .show('fast'); // Показываем меню с небольшим стандартным эффектом jQuery. Как раз очень хорошо подходит для меню
            }
        }
    });
    
});

/*Действие на нажатие кнопки контексного меню 1-ого уровня*/
function context_menu_action_1_lvl(event,p_clicked_li) {
    var target = $(event.target);
    var action = target.attr('data-action');
    
    switch (action) {
        case 'up':
            $('.context-menu').remove();
            if (change_order_for_railway_ajax(p_clicked_li.attr('data-id'),p_clicked_li.attr('data-type'),action) === 'done') {
                p_clicked_li.insertBefore(p_clicked_li.prev());
            }
            break;
        case 'down':
            $('.context-menu').remove();
            if (change_order_for_railway_ajax(p_clicked_li.attr('data-id'),p_clicked_li.attr('data-type'),action)==='done') {
                p_clicked_li.insertAfter(p_clicked_li.next());
            }
            break;
        case 'move_railway':
            $('.context-menu-2lvl').remove();
            /*создаем контексное меню (список путей, поездов, гр.вагонов) для перемещения объектов внутри станции*/
            create_contect_menu_2_lvl_move_railway('MoveRailway',p_clicked_li,target.offset().left+target.innerWidth(),target.offset().top);	
            break;
        case 'add_railway':
            create_modal_dialog_add_railway(p_clicked_li);	
            break;
        case 'change_railway_attr':
            create_modal_dialog_change_railway_attr(p_clicked_li);	
            break;
        case 'add_point':
            create_md_add_point(p_clicked_li);	
            break;
    }
    
}

/*Создаем контексное меню 2-ого уровня для перемещения по уровням дерева*/
function create_contect_menu_2_lvl_move_railway(addId,p_clicked_li,p_x,p_y) {
    if ($('#context-menu-2lvl'+addId).length===0) {
        $.ajax({
            url: '../data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   {station_id: p_clicked_li.parents('li[data-type="station"]').attr('data-id')
                    ,ajax_action: 'get_all_station_child'
                    },
            success: function (data) {
                var records = JSON.parse(data);
                var ul = $('<ul/>');
                ul.append($('<li/>')
                    .text(p_clicked_li.parents('li[data-type="station"]').children('div.tree_Content').text())
                    .attr('data-id',p_clicked_li.parents('li[data-type="station"]').attr('data-id'))
                    .attr('data-type','station')
                );
                ul.on('click', function(event) {
                    context_menu_action_2lvl_move_railway(event,p_clicked_li);
                });
                $.each(records, function(i,item) {
                    if (item.TYPE==='railway'&&item.ID!==p_clicked_li.attr('data-id')){
                        ul.append($('<li/>')
                            .css({'margin-left': (item.LVL)*10 + 'px'})
                            .text(item.NAME)
                            .attr('data-id',item.ID)
                            .attr('data-type',item.TYPE)
                        );
                    }
                });
                $('<div/>',{class: 'context-menu context-menu-2lvl'})  // Присваиваем блоку наш css класс контекстного меню:
                .attr('id','context-menu-2lvl'+addId)
                .css({                 
                        left: p_x+'px', // Задаем позицию меню на X                 
                        top: p_y+'px' // Задаем позицию меню по Y             
                })
                .appendTo('body') // Присоединяем наше меню к body документа: 
                .append(ul)
                .show('fast'); // Показываем меню с небольшим стандартным эффектом jQuery. Как раз очень хорошо подходит для меню     
            }
        });
    }
}

/*Действие на нажатие кнопки контексного меню 2-ого уровня: перемещение пути*/
function context_menu_action_2lvl_move_railway(event,p_clicked_li) {
    /*Изменяем предка на сервере*/
    function change_parent_ajax(p_id,p_type,p_new_parent_id,p_new_parent_type) {
        var res;
        $.ajax({
            url: 'adm_data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { id: p_id
                   ,type: p_type
                   ,new_parent_id: p_new_parent_id
                   ,new_parent_type: p_new_parent_type
                   ,ajax_action: 'change_parent_for_railway'
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

    //$('#modalDialog').remove();
    $('.context-menu').remove();
    
    var target = $(event.target);

    if (change_parent_ajax(p_clicked_li.attr('data-id'),p_clicked_li.attr('data-type'),target.attr('data-id'),target.attr('data-type'))==='done') {
        //Выбираем все элементы li с заданными аттрибутами внутри ul с заданным id и берем потомок ul
        var newParent = $('li[data-id='+target.attr('data-id')+'][data-type='+target.attr('data-type')+']');
        var newParentCont = newParent.children('ul');
        p_clicked_li.detach().appendTo(newParentCont);
    }
}
/*Создание модального окна добавления путей*/
function create_modal_dialog_add_railway(p_clicked_li){
    function add_railway_ajax(p_parentId,p_parentType,p_number,p_purpose,p_pointerFrom,p_pointerTo
                             ,p_lengthLimit,p_lengthUseful,p_capacity
                             ,p_addField1,p_addField2,p_addField3,p_addField4
                             ,p_clickedLi) 
    {
        $.ajax({
            url: 'adm_data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { parent_id: p_parentId
                   ,parent_type: p_parentType
                   ,number: p_number
                   ,purpose: p_purpose
                   ,pointer_from: p_pointerFrom
                   ,pointer_to: p_pointerTo
                   ,length_limit: p_lengthLimit
                   ,length_useful: p_lengthUseful
                   ,capacity: p_capacity
                   ,add_field1: p_addField1
                   ,add_field2: p_addField2
                   ,add_field3: p_addField3
                   ,add_field4: p_addField4
                   ,ajax_action: 'add_railway'
                  },
            success: function (data) {
                if (data!=='0'){
                    var li = $('<li/>');
                    li.attr('data-id',data);
                    li.attr('data-type','railway');
                    li.addClass('tree_Node tree_ExpandLeaf');
                    li.append('<div class="tree_Expand"></div><div class="tree_Content">Путь '+p_number+'</div>');
                    li.append('<ul class="tree_Container"></ul>');
                    var newParentCont = p_clickedLi.children('ul');
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
    var l_parentId;
    var l_parentType;
    var l_clickedLi;
    
    $('.context-menu').remove();
    
    l_parentId = p_clicked_li.attr('data-id');
    l_parentType = p_clicked_li.attr('data-type');
    l_clickedLi = p_clicked_li;

    
    $('<div/>')
        .attr('id','modalDialog')
        .attr('title','Добавление путей')
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append('<label for="modalDialogNumber">Номер пути</label><br>'+
                '<input id="modalDialogNumber" type="text" maxlength="20" size="10" class="text ui-widget-content ui-corner-all"><br>' +
                '<label for="modalDialogPurpose">Назначение</label><br>'+
                '<input id="modalDialogPurpose" type="text" maxlength="100" size="40" class="text ui-widget-content ui-corner-all"><br>' +
                '<label for="modalDialogPointerFrom">Стрелки ограничивающие путь: от и до</label><br>'+
                '<input id="modalDialogPointerFrom" type="text" maxlength="20" size="8" class="text ui-widget-content ui-corner-all">'+
                '<input id="modalDialogPointerTo" type="text" maxlength="20" size="8" style="margin-left: 10px;"class="text ui-widget-content ui-corner-all"><br>'+
                '<label for="modalDialogLengthLimit">Длина предельная (метры)</label><br>'+
                '<input id="modalDialogLengthLimit" type="text" size="10" class="text ui-widget-content ui-corner-all"><br>' +
                '<label for="modalDialogLengthLimit">Длина полезная (метры)</label><br>'+
                '<input id="modalDialogLengthUseful" type="text" size="10" class="text ui-widget-content ui-corner-all"><br>' +
                '<label for="modalDialogСapacity">Вместимость</label><br>'+
                '<input id="modalDialogСapacity" type="text" maxlength="50" size="20" class="text ui-widget-content ui-corner-all"><br>'+
                '<label for="modalDialogAddField1">Доп. поле 1</label><br>'+
                '<input id="modalDialogAddField1" type="text" maxlength="50" size="20" class="text ui-widget-content ui-corner-all"><br>'+
                '<label for="modalDialogAddField2">Доп. поле 2</label><br>'+
                '<input id="modalDialogAddField2" type="text" maxlength="50" size="20" class="text ui-widget-content ui-corner-all"><br>'+
                '<label for="modalDialogAddField3">Доп. поле 3</label><br>'+
                '<input id="modalDialogAddField3" type="text" maxlength="50" size="20" class="text ui-widget-content ui-corner-all"><br>'+
                '<label for="modalDialogAddField4">Доп. поле 4</label><br>'+
                '<input id="modalDialogAddField4" type="text" maxlength="50" size="20" class="text ui-widget-content ui-corner-all"><br>'
            );
    dialog = $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Добавить': function(){
                add_railway_ajax(l_parentId,l_parentType
                               ,$('#modalDialogNumber').val()
                               ,$('#modalDialogPurpose').val()
                               ,$('#modalDialogPointerFrom').val()
                               ,$('#modalDialogPointerTo').val()
                               ,$('#modalDialogLengthLimit').val()
                               ,$('#modalDialogLengthUseful').val()
                               ,$('#modalDialogСapacity').val()
                               ,$('#modalDialogAddField1').val()
                               ,$('#modalDialogAddField2').val()
                               ,$('#modalDialogAddField3').val()
                               ,$('#modalDialogAddField4').val()
                               ,l_clickedLi        
                              );
                $(this).dialog( "close" );
            },
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        }
    });
}

/*Создание модального окна изменение атрибутов*/
function create_modal_dialog_change_railway_attr(p_clicked_li){
    function chg_railway_attr_ajax(p_railwayId,p_number,p_purpose,p_pointerFrom,p_pointerTo
                                  ,p_lengthLimit,p_lengthUseful,p_capacity
                                  ,p_addField1,p_addField2,p_addField3,p_disabled) 
    {
        $.ajax({
            url: 'adm_data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { railway_id: p_railwayId
                   ,number: p_number
                   ,purpose: p_purpose
                   ,pointer_from: p_pointerFrom
                   ,pointer_to: p_pointerTo
                   ,length_limit: p_lengthLimit
                   ,length_useful: p_lengthUseful
                   ,capacity: p_capacity
                   ,add_field1: p_addField1
                   ,add_field2: p_addField2
                   ,add_field3: p_addField3
                   ,disabled: p_disabled
                   ,ajax_action: 'change_railway_attr'
                  },
            success: function (data) {
                if (data==='done') {
                    $('table.railway_info_table > tbody > tr:first-child > td:nth-child(1)').text(p_number);
                    $('table.railway_info_table > tbody > tr:first-child > td:nth-child(2)').text(p_purpose);
                    $('table.railway_info_table > tbody > tr:first-child > td:nth-child(3)').text(p_pointerFrom);
                    $('table.railway_info_table > tbody > tr:first-child > td:nth-child(4)').text(p_pointerTo);
                    $('table.railway_info_table > tbody > tr:first-child > td:nth-child(5)').text(p_lengthLimit);
                    $('table.railway_info_table > tbody > tr:first-child > td:nth-child(6)').text(p_lengthUseful);
                    $('table.railway_info_table > tbody > tr:first-child > td:nth-child(7)').text(p_capacity);
                    $('table.railway_info_table > tbody > tr:first-child > td:nth-child(8)').text(p_addField1);
                    $('table.railway_info_table > tbody > tr:first-child > td:nth-child(9)').text(p_addField2);
                    $('table.railway_info_table > tbody > tr:first-child > td:nth-child(10)').text(p_addField3);
                    $('table.railway_info_table > tbody > tr:first-child > td:nth-child(11)').text(((p_disabled == 'Y') ? 'Да' : 'Нет'));
                }
            },
            error: function (m1,m2) {
                window.alert(m1+m2);
            }
        });
    }
    var l_railwayId;
    var l_clickedLi;
    
    $('#modalDialog').remove();
    $('.context-menu').remove();
    
    l_railwayId = p_clicked_li.attr('data-id');
    l_clickedLi = p_clicked_li;
    
    $('<div/>')
        .attr('id','modalDialog')
        .attr('title','Изменение атрибутов')
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append('<label for="modalDialogNumber">Номер пути</label><br>'+
                '<input id="modalDialogNumber" type="text" maxlength="20" size="10" class="text ui-widget-content ui-corner-all" value="'+$('table.railway_info_table > tbody > tr:first-child > td:nth-child(1)').text()+'"><br>' +
                '<label for="modalDialogPurpose">Назначение</label><br>'+
                '<input id="modalDialogPurpose" type="text" maxlength="100" size="40" class="text ui-widget-content ui-corner-all" value="'+$('table.railway_info_table > tbody > tr:first-child > td:nth-child(2)').text()+'"><br>' +
                '<label for="modalDialogPointerFrom">Стрелки ограничивающие путь: от и до</label><br>'+
                '<input id="modalDialogPointerFrom" type="text" maxlength="20" size="8" class="text ui-widget-content ui-corner-all" value="'+$('table.railway_info_table > tbody > tr:first-child > td:nth-child(3)').text()+'">'+
                '<input id="modalDialogPointerTo" type="text" maxlength="20" size="8" style="margin-left: 10px;"class="text ui-widget-content ui-corner-all" value="'+$('table.railway_info_table > tbody > tr:first-child > td:nth-child(4)').text()+'"><br>'+
                '<label for="modalDialogLengthLimit">Длина предельная (метры)</label><br>'+
                '<input id="modalDialogLengthLimit" type="text" size="10" class="text ui-widget-content ui-corner-all" value="'+$('table.railway_info_table > tbody > tr:first-child > td:nth-child(5)').text()+'"><br>' +
                '<label for="modalDialogLengthLimit">Длина полезная (метры)</label><br>'+
                '<input id="modalDialogLengthUseful" type="text" size="10" class="text ui-widget-content ui-corner-all" value="'+$('table.railway_info_table > tbody > tr:first-child > td:nth-child(6)').text()+'"><br>' +
                '<label for="modalDialogСapacity">Вместимость</label><br>'+
                '<input id="modalDialogСapacity" type="text" maxlength="50" size="20" class="text ui-widget-content ui-corner-all" value="'+$('table.railway_info_table > tbody > tr:first-child > td:nth-child(7)').text()+'"><br>'+
                '<label for="modalDialogAddField1">Доп. поле 1</label><br>'+
                '<input id="modalDialogAddField1" type="text" maxlength="50" size="20" class="text ui-widget-content ui-corner-all" value="'+$('table.railway_info_table > tbody > tr:first-child > td:nth-child(8)').text()+'"><br>'+
                '<label for="modalDialogAddField2">Доп. поле 2</label><br>'+
                '<input id="modalDialogAddField2" type="text" maxlength="50" size="20" class="text ui-widget-content ui-corner-all" value="'+$('table.railway_info_table > tbody > tr:first-child > td:nth-child(9)').text()+'"><br>'+
                '<label for="modalDialogAddField3">Доп. поле 3</label><br>'+
                '<input id="modalDialogAddField3" type="text" maxlength="50" size="20" class="text ui-widget-content ui-corner-all" value="'+$('table.railway_info_table > tbody > tr:first-child > td:nth-child(10)').text()+'"><br>'+
                '<label for="modalDialogDisabled">Не доступен</label><br>'+
                '<select id="modalDialogDisabled">'+
                    '<option value="Y">Да</option>'+
                    '<option value="N">Нет</option>'+
                '</select>'
            );
    $('#modalDialogDisabled').val((($('table.railway_info_table > tbody > tr:first-child > td:nth-child(11)').text()=='Да')?'Y':'N'));
    
    dialog = $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Изменить': function(){
                chg_railway_attr_ajax(l_railwayId
                                     ,$('#modalDialogNumber').val()
                                     ,$('#modalDialogPurpose').val()
                                     ,$('#modalDialogPointerFrom').val()
                                     ,$('#modalDialogPointerTo').val()
                                     ,$('#modalDialogLengthLimit').val()
                                     ,$('#modalDialogLengthUseful').val()
                                     ,$('#modalDialogСapacity').val()
                                     ,$('#modalDialogAddField1').val()
                                     ,$('#modalDialogAddField2').val()
                                     ,$('#modalDialogAddField3').val()
                                     ,$('#modalDialogDisabled').val()
                                     ,l_clickedLi        
                                    );
                $(this).dialog( "close" );
            },
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        }
    });
}

function railway_add_info_ajax(p_railway_id) {
    $.ajax({
        url: 'adm_data.php',
        type: 'POST',
        dataType: "text",
        data: { railway_id: p_railway_id
               ,ajax_action: 'railway_add_info'
              },
        success: function (data) {railway_add_info(data);},
        error: function (m1,m2) {window.alert(m1+m2);}
    });
}
function railway_add_info(p_data) {
    var records = JSON.parse(p_data);

    $('table.railway_info_table tbody').empty();
    
    var table = $('table.railway_info_table');

    for(var i=0; i<records.length; i++) {
        var child = records[i];
        var tr = $('<tr/>');
        tr.append('<td>'+((child.RAILWAY_NUMBER !== null) ? child.RAILWAY_NUMBER : '')+'</td>'); 
        tr.append('<td>'+((child.PURPOSE !== null) ? child.PURPOSE : '')+'</td>'); 
        tr.append('<td>'+((child.POINTER_FROM !== null) ? child.POINTER_FROM : '')+'</td>'); 
        tr.append('<td>'+((child.POINTER_TO !== null) ? child.POINTER_TO : '')+'</td>');
        tr.append('<td>'+((child.LENGTH_LIMIT !== null) ? child.LENGTH_LIMIT : '')+'</td>');
        tr.append('<td>'+((child.LENGTH_USEFUL !== null) ? child.LENGTH_USEFUL : '')+'</td>');
        tr.append('<td>'+((child.CAPACITY !== null) ? child.CAPACITY : '')+'</td>');
        tr.append('<td>'+((child.ADD_FIELD1 !== null) ? child.ADD_FIELD1 : '')+'</td>');
        tr.append('<td>'+((child.ADD_FIELD2 !== null) ? child.ADD_FIELD2 : '')+'</td>'); 
        tr.append('<td>'+((child.ADD_FIELD3 !== null) ? child.ADD_FIELD3 : '')+'</td>'); 
        tr.append('<td>'+((child.DISABLED !== null) ? ((child.DISABLED == 'Y') ? 'Да' : 'Нет') : 'Нет') +'</td>');
        tr.appendTo(table);
    }
}

/*Изменяем порядок на сервере*/
function change_order_for_railway_ajax(p_id,p_type,p_action) {
    var res;
    $.ajax({
        url: 'adm_data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { id: p_id
               ,type: p_type
               ,action: p_action
               ,ajax_action: 'change_order_for_railway'
              },
        success: function (data) {res = data;},
        error: function () {res = 'fail';}
    });
    return res;
}
/*создание модального окна создания пользователя*/
function create_modal_dialog_add_user(){
    function createSelectForAddUser(p_id,p_ajax_action){  
        var result = '<select id="'+p_id+'">';
        $.ajax({
            url: 'adm_data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data:   { ajax_action: p_ajax_action
                    },
            success: function (data) {
                    var records = JSON.parse(data);
                    $.each(records, function( i, item ) {
                        result += '<option data-id="'+item.ID+'" data-type="'+item.TYPE+'" value="'+item.ID+'">'+item.NAME+'</option>'
                    }); 
                }
        });
        result += '</select>';
        return result;
    }
    
    function addUserAjax(p_login,p_full_name,p_station,p_credential) 
    {
        $.ajax({
            url: 'adm_data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: {login:p_login
                  ,full_name:p_full_name
                  ,station:p_station
                  ,credential:p_credential
                  ,ajax_action: 'add_user'
                  },
            success: function (data) {
                        create_info_modal_dialog('Уведомление','Пользователь '+p_full_name+' успешно создан.');
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
        .attr('title','Добавление пользователя')
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append('<label for="modalDialogLogin">Логин</label><br>'+
                '<input id="modalDialogLogin" type="text" maxlength="30" size="30" class="text ui-widget-content ui-corner-all"><br>'+
                '<label for="modalDialogFullName">Фамилия И.О.</label><br>'+
                '<input id="modalDialogFullName" type="text" maxlength="30" size="30" class="text ui-widget-content ui-corner-all"><br>'+
                '<label for="modalDialogStation">Станция</label><br>'+
                createSelectForAddUser('modalDialogStation','get_stations')+'<br>'+
                '<label for="modalDialogStation">Полномочия</label><br>'+
                createSelectForAddUser('modalDialogCredential','get_credentials')
        );
    dialog = $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Добавить': function(){
                addUserAjax($('#modalDialogLogin').val(),$('#modalDialogFullName').val(),$('#modalDialogStation').val(),$('#modalDialogCredential').val());
                $(this).dialog( "close" );
            },
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        }
    });
}

function create_info_modal_dialog (p_title,p_msg){
    $('#modalDialog').remove();
    $('<div/>')
        .attr('id','modalDialog')
        .attr('title',p_title)
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append('<p>'+p_msg+'</p>');
    dialog = $("#modalDialog").dialog({
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

/*Создание модального окна добавления путей*/
function create_md_add_point(p_clicked_li){
    function add_railway_ajax(p_parentId,p_parentType,p_name,p_descr,p_clickedLi) 
    {
        $.ajax({
            url: 'adm_data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { parent_id: p_parentId
                   ,parent_type: p_parentType
                   ,name: p_name
                   ,descr: p_descr
                   ,ajax_action: 'add_point'
                  },
            success: function (data) {
                if (data!=='0'){
                    var li = $('<li/>');
                    li.attr('data-id',data);
                    li.attr('data-type','point');
                    li.addClass('tree_Node tree_ExpandLeaf');
                    li.append('<div class="tree_Expand"></div><div class="tree_Content">'+p_name+'</div>');
                    li.append('<ul class="tree_Container"></ul>');
                    var newParentCont = p_clickedLi.children('ul');
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
    var l_parentId;
    var l_parentType;
    var l_clickedLi;
    
    $('.context-menu').remove();
    
    l_parentId = p_clicked_li.attr('data-id');
    l_parentType = p_clicked_li.attr('data-type');
    l_clickedLi = p_clicked_li;

    
    $('<div/>')
        .attr('id','modalDialog')
        .attr('title','Добавление точки обслуживания')
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append('<label for="md_point_name">Название</label><br>'+
                '<input id="md_point_name" type="text" maxlength="20" size="10" class="text ui-widget-content ui-corner-all"><br>' +
                '<label for="md_point_descr">Описание</label><br>'+
                '<input id="md_point_descr" type="text" maxlength="100" size="40" class="text ui-widget-content ui-corner-all"><br>'
            );
    dialog = $("#modalDialog").dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Добавить': function(){
                add_railway_ajax(l_parentId,l_parentType
                               ,$('#md_point_name').val()
                               ,$('#md_point_descr').val()
                               ,l_clickedLi        
                              );
                $(this).dialog( "close" );
            },
            'Закрыть': function(){
                $(this).dialog( "close" );
            }
        }
    });
}

