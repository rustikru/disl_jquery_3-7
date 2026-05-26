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
    
    
    var tab3 = $('div#tabs-3');
    tab3.aside = tab3.children('div.aside');
    tab3.aside.railways= $('div#railways_list').appendTo(tab3.aside);
    
    tab3.section = tab3.children('div.section');  
    tab3.section.rw_number = $('input#rw_number');
    tab3.section.rw_purpose = $('input#rw_purpose');
    tab3.section.rw_pointer_from = $('input#rw_pointer_from');
    tab3.section.rw_pointer_to = $('input#rw_pointer_to');
    tab3.section.rw_length_limit = $('input#rw_length_limit');
    tab3.section.rw_length_useful = $('input#rw_length_useful');
    tab3.section.rw_capacity = $('input#rw_capacity');
    tab3.section.rw_add_field_1 = $('input#rw_add_field_1');
    tab3.section.rw_add_field_2 = $('input#rw_add_field_2');
    tab3.section.rw_add_field_3 = $('input#rw_add_field_3');
    tab3.section.rw_disabled = $('select#rw_disabled');
    tab3.section.rw_type = $('select#rw_type');
    
    tab3.section.save_new_railway_btn = $('button#save_new_railway_btn').hide();
    tab3.section.change_railway_btn = $('button#change_railway_btn').hide();
    
    tab3.aside.on('mousedown', function(event) {       
        var target = $(event.target);
        var parent_target = target.parent();
        
        tab3.aside.railways.selected_item = parent_target;
        tab3.section.save_new_railway_btn.hide();
        tab3.section.change_railway_btn.show();
        
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
                $.ajax({
                    url: 'adm_data.php',
                    type: 'POST',
                    dataType: "text",
                    data: { railway_id: parent_target.attr('data-id')
                           ,ajax_action: 'railway_add_info'
                          },
                    success: function (data) {
                        var l_rw_descr = JSON.parse(data);

                        l_rw_descr.forEach(function(item){
                            tab3.section.rw_number.val(item.RAILWAY_NUMBER);
                            tab3.section.rw_purpose.val(item.PURPOSE);
                            tab3.section.rw_pointer_from.val(item.POINTER_FROM);
                            tab3.section.rw_pointer_to.val(item.POINTER_TO);
                            tab3.section.rw_length_limit.val(item.LENGTH_LIMIT);
                            tab3.section.rw_length_useful.val(item.LENGTH_USEFUL);
                            tab3.section.rw_capacity.val(item.CAPACITY);
                            tab3.section.rw_add_field_1.val(item.ADD_FIELD1);
                            tab3.section.rw_add_field_2.val(item.ADD_FIELD2);
                            tab3.section.rw_add_field_3.val(item.ADD_FIELD3);
                            tab3.section.rw_disabled.val(item.DISABLED);
                            tab3.section.rw_type.val(item.TYPE);
                        });
                        
                    },
                    error: function (m1,m2) {window.alert(m1+m2);}
                });
                
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
                    /*ul.append('<li data-action="change_railway_attr">Изменить аттрибуты</li>');*/
                    ul.append('<li data-action="add_point">Добавить точку обслуж-ия</li>');
                }
                if (parent_target.attr('data-type')==='railway'||parent_target.attr('data-type')==='station') {
                    ul.append('<li data-action="add_railway">Добавить путь</li>');
                }
                if (parent_target.attr('data-type')==='railway') {
                    ul.append('<li data-action="add_area">Добавить площадку</li>');
                }
                ul.on('click', function(event) {
                    /*Назначаяем действие на нажатие кнопки контексного меню 1-ого уровня*/
                    context_menu_action_1_lvl(event,parent_target,tab3);
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
    
    tab3.section.change_railway_btn.on('mousedown', function(event) {
        function chg_railway_attr_ajax(p_railwayId,p_number,p_purpose,p_pointerFrom,p_pointerTo
                                      ,p_lengthLimit,p_lengthUseful,p_capacity
                                      ,p_addField1,p_addField2,p_addField3,p_disabled,p_type) 
        {
            var res;
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
                       ,type:p_type
                       ,ajax_action: 'change_railway_attr'
                      },
                success: function (data) {
                    res = data;
                },
                error: function (m1,m2) {
                    window.alert(m1+m2);
                }
            });
            
            return res;
        }
        
        var l_result = chg_railway_attr_ajax (tab3.aside.railways.selected_item.attr('data-id') 
                                             ,tab3.section.rw_number.val()
                                             ,tab3.section.rw_purpose.val()
                                             ,tab3.section.rw_pointer_from.val()
                                             ,tab3.section.rw_pointer_to.val()
                                             ,tab3.section.rw_length_limit.val()
                                             ,tab3.section.rw_length_useful.val()
                                             ,tab3.section.rw_capacity.val()        
                                             ,tab3.section.rw_add_field_1.val()       
                                             ,tab3.section.rw_add_field_2.val() 
                                             ,tab3.section.rw_add_field_3.val() 
                                             ,tab3.section.rw_disabled.val()
                                             ,tab3.section.rw_type.val()
                                             );
        if (l_result=='done') {           
            tab3.aside.railways.selected_item.children('div.tree_Content').text(tab3.section.rw_number.val());
            
            create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
        }else{
            create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
        }
        
    });
    
    tab3.section.save_new_railway_btn.on('mousedown', function(event){
        function add_railway_ajax(p_clickedLi
                                 ,p_number,p_purpose,p_pointerFrom,p_pointerTo
                                 ,p_lengthLimit,p_lengthUseful,p_capacity
                                 ,p_addField1,p_addField2,p_addField3,p_disabled,p_type
                                 ) 
        {
            $.ajax({
                url: 'adm_data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data: { parent_id: p_clickedLi.attr('data-id') 
                       ,parent_type: p_clickedLi.attr('data-type')
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
                       ,type:p_type
                       ,ajax_action: 'add_railway'
                      },
                success: function (data) {
                    if (data!=='0'){
                        $('.tree_selected').removeClass('tree_selected');
                        tab3.section.save_new_railway_btn.hide();
                        tab3.section.change_railway_btn.show();
            
                        var li = $('<li/>');
                        li.attr('data-id',data);
                        li.attr('data-type','railway');
                        li.addClass('tree_Node tree_ExpandLeaf');
                        li.append('<div class="tree_Expand"></div><div class="tree_img tree_img_railway"></div><div class="tree_Content tree_selected">Путь '+p_number+'</div>');
                        li.append('<ul class="tree_Container"></ul>');
                        var newParentCont = p_clickedLi.children('ul');
                        li.appendTo(newParentCont);
                        
                        tab3.aside.railways.selected_item = li;
                    } else {
                        window.alert('Ошибка при добавлении!!!');
                    }
                },
                error: function (m1,m2) {
                    window.alert(m1+m2);
                }
            });
        }
    
        add_railway_ajax(tab3.aside.railways.selected_item 
                        ,tab3.section.rw_number.val()
                        ,tab3.section.rw_purpose.val()
                        ,tab3.section.rw_pointer_from.val()
                        ,tab3.section.rw_pointer_to.val()
                        ,tab3.section.rw_length_limit.val()
                        ,tab3.section.rw_length_useful.val()
                        ,tab3.section.rw_capacity.val()        
                        ,tab3.section.rw_add_field_1.val()       
                        ,tab3.section.rw_add_field_2.val() 
                        ,tab3.section.rw_add_field_3.val() 
                        ,tab3.section.rw_disabled.val()
                        ,tab3.section.rw_type.val()
                      );
    });
});

/*Действие на нажатие кнопки контексного меню 1-ого уровня*/
function context_menu_action_1_lvl(event,p_clicked_li,tab3) {
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
            tab3.section.save_new_railway_btn.show();
            tab3.section.change_railway_btn.hide();
            
            tab3.section.rw_number.val('');
            tab3.section.rw_purpose.val('');
            tab3.section.rw_pointer_from.val('');
            tab3.section.rw_pointer_to.val('');
            tab3.section.rw_length_limit.val('');
            tab3.section.rw_length_useful.val('');
            tab3.section.rw_capacity.val('');
            tab3.section.rw_add_field_1.val('');
            tab3.section.rw_add_field_2.val('');
            tab3.section.rw_add_field_3.val('');
            tab3.section.rw_disabled.val('');
            
            $('.context-menu').remove();
            
            break;
        case 'add_point':
            create_md_add_point(p_clicked_li);	
            break;
        case 'add_area':
            create_md_add_area(p_clicked_li);	
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

function create_info_modal_dialog_new (p_title,p_msg){
    $('<div/>')
        .attr('title',p_title)
        .appendTo('body') // Присоединяем наше меню к body документа: 
        .append('<p>'+p_msg+'</p>')
        .dialog({
            resizable:false,
            modal:true,
            width: '400px',
            draggable: false,
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
        },
        close: function() {
            $(this).remove();
        }
    });
}

function create_md_add_area(p_clicked_li){   
    function add_area_ajax(p_parent_id,p_parent_type,p_name,p_descr){
        var l_result;
        $.ajax({
            url: 'adm_data.php',
            type: 'POST',
            dataType: "text",
            async: false,
            data: { parent_id: p_parent_id
                   ,parent_type: p_parent_type
                   ,name: p_name
                   ,descr: p_descr
                   ,ajax_action: 'add_area'
                  },
            success: function (p_result) {
                l_result = p_result;
            },
            error: function (m1,m2) {
                window.alert(m1+m2);
            }
        });
        return l_result;
    }
    
    var l_parent_id = p_clicked_li.attr('data-id');
    var l_parent_type = p_clicked_li.attr('data-type');
    
    $('.context-menu').remove();
    
    var md_div = $('<div/>')
        .attr('title','Добавление площадки под контейнера')
        .appendTo('body');
    
    var name_input = $('<input>',{type:'text', maxlength:'30',class:'text ui-widget-content ui-corner-all'}).attr({size:'15'});
    var name_descr = $('<input>',{type:'text', maxlength:'100',class:'text ui-widget-content ui-corner-all'}).attr({size:'30'});
    
    md_div.append(
        $('<div>',{class:'attr',css:{'border':'none','width':'350px'}})
        .append(
            $('<div>')
            .append($('<label>').text('Название'))
            .append(name_input)
        )
        .append(
            $('<div>')
            .append($('<label>').text('Описание'))
            .append(name_descr)
        )
    );
  

    md_div.dialog({
        resizable:false,
        modal:true,
        width: 'auto',
        draggable: false,
        buttons:{
            'Добавить': function(){
                var l_result = add_area_ajax(l_parent_id,l_parent_type,name_input.val(),name_descr.val());
                if (l_result!='0'){
                    var li = $('<li/>');
                    li.attr('data-id',l_result);
                    li.attr('data-type','area');
                    li.addClass('tree_Node tree_ExpandLeaf');
                    li.append('<div class="tree_Expand"></div><div class="tree_img tree_img_area"></div><div class="tree_Content">'+name_input.val()+'</div>');
                    li.append('<ul class="tree_Container"></ul>');
                    var new_parent_cont = p_clicked_li.children('ul');
                    li.appendTo(new_parent_cont);
                    
                    create_info_modal_dialog_new('Оповещение','Площадка под выгрузку контейнеров успешно создана.');
                } else {
                    create_info_modal_dialog_new('Ошибка','При работе функции произошла ошибка. Обрататитесь к разработчику!');
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
}

