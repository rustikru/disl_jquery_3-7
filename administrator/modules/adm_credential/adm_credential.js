$(document).ready(function() {

    // Сбрасываем все галочки
    function resetCheckboxes() {
        $('input.credential-input').prop('checked', false);
    }

    // Проставляем галочку, если найден элемент по ID
    function checkById(id, val) {
        var checkbox = jQuery("#"+id); // Конкатенация строк через '+'
        if (checkbox.length) {
            if (val == 'Y'){
                checkbox.prop('checked', true); // Устанавливаем состояние галочки
            }
        } 
    }
    function save_new_credential_ajax(rightsCredential) {
            var l_param = {};
                if (tab1 && tab1.aside && tab1.aside.credential && tab1.aside.credential.selected_item) {
                    l_param.credential_id = tab1.aside.credential.selected_item.attr('data-id');
                } else {
                    l_param.credential_id = 0;
                }
                l_param.credential_name = tab1.section.credential_name.val();
                l_param.rightsCredential = rightsCredential;
            console.log (JSON.stringify(l_param));
            $.ajax({
                url: 'adm_data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data: { 
                        params: JSON.stringify(l_param)
                       ,ajax_action: 'save_new_credential'
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

    function getCredentialInputs() {
        var elementsArray = [];
        
        // Проходим по всем input с классом credential-input
        $('input.credential-input').each(function() {
            var id = $(this).attr('id'); // Получаем ID элемента
            var val = $(this).prop('checked') ? 'Y' : 'N'; // Преобразуем true/false в Y/N
            
            // Добавляем в массив как объект
            elementsArray.push({
                id: id,
                value: val
            });
        });
        
        return elementsArray; // Возвращаем результат
    }
    

    /*Загрузим список полномочий*/
    var tab1 = $('div#tabs-1');
    tab1.aside = tab1.children('div.aside');
    $.ajax({
        url: 'adm_data.php',
        type: 'POST',
        dataType: "text",
        data: { ajax_action: 'get_credentials'},
        success: function (data) {
            var l_credential = JSON.parse(data);
            
            //var ul = $('<ul>').addClass('tree_Container').appendTo(tab1.aside);
            tab1.aside.credential = $('<div>').attr({'id':'credential_list'}).appendTo(tab1.aside);
            l_credential.forEach(function(item){
                $('<li>')
                    .attr({'data-type':'credential','data-id':item.ID})
                    .addClass('tree_Node tree_ExpandLeaf')
                    .append($('<div>',{
                                'class':'tree_Content',
                                'text':item.NAME
                             })
                           )
                    //.css({'margin-left':'0px'})
                    .appendTo(tab1.aside.credential);
            });
        },
        error: function (m1,m2) {
            window.alert(m1+m2);
        }
    });
    
    tab1.section = tab1.children('div.section');
    
    tab1.section.credential_name = $('input#credential_name');
    tab1.section.add_new_credential_btn = $('button#add_new_credential_btn');
    tab1.section.save_new_credential_btn = $('button#save_new_credential_btn').hide();
    tab1.section.change_credential_btn = $('button#change_credential_btn').hide();
    tab1.section.delete_credential_btn = $('button#delete_credential_btn').hide();
    
    tab1.section.add_new_credential_btn.on('click', function(event){
        tab1.section.save_new_credential_btn.show();
        tab1.section.change_credential_btn.hide();
        tab1.section.delete_credential_btn.hide();
        
        tab1.section.credential_name.val('');
        
        tab1.aside.credential.selected_item = null;
        tab1.aside.credential.find('li > div').removeClass('tree_selected');
    });
    
    tab1.section.save_new_credential_btn.on('click', function(event){
        
        var rightsCredential = getCredentialInputs();
        //console.log(rightsCredential); // Выводим результат в консоль
        var resultAjax = save_new_credential_ajax(rightsCredential);
            resultAjax = resultAjax.split('$');
        if (resultAjax[0]==='done') {     
            var l_credential_id = resultAjax[1];      
            $('<li>')
                .attr({'data-type':'credential','data-id':l_credential_id})
                .addClass('tree_Node tree_ExpandLeaf')
                .append($('<div>',{
                            'class':'tree_Content',
                            'text':tab1.section.credential_name.val()
                         })
                       )
                .appendTo(tab1.aside.credential);
            resetCheckboxes();
            create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
        }else{
            create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!'+ resultAjax[1]);
        }
        
        tab1.section.add_new_credential_btn.triggerHandler('click');
        tab1.section.save_new_credential_btn.hide();
    });
    
    tab1.section.change_credential_btn.on('click', function(event){
        var rightsCredential = getCredentialInputs();
        var resultAjax = save_new_credential_ajax(rightsCredential);
            resultAjax = resultAjax.split('$');
        if (resultAjax[0]=='done') {
            tab1.aside.credential.selected_item.children('div.tree_Content').text(tab1.section.credential_name.val());
            resetCheckboxes();
            create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
        }else{
            create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!'+resultAjax[0]);
        }
        
    });
    
    tab1.section.delete_credential_btn.on('click', function(event){
        function delete_credential_ajax(p_credential_id) 
        {
            var res;
            $.ajax({
                url: 'adm_data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data: { credential_id: p_credential_id
                       ,ajax_action: 'delete_credential'
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
        
        var l_result = delete_credential_ajax(tab1.aside.credential.selected_item.attr('data-id'));
        if (l_result=='done') {
            tab1.aside.credential.selected_item.remove();
            tab1.aside.credential.selected_item = null;
            resetCheckboxes();
            create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
        }else{
            create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
        }
        
        tab1.section.add_new_credential_btn.triggerHandler('click');
        tab1.section.save_new_credential_btn.hide();
    });
    
    tab1.aside.on('mousedown', function(event) {       
        var target = $(event.target);
        var parent_target = target.parent();
        
        if (event.which === 1 && target.hasClass('tree_Content')) {
            /*обрабатываем выделение элементов*/
            if (!target.hasClass('tree_selected')) {
                $('.tree_selected').removeClass('tree_selected');
                target.addClass('tree_selected'); 
            }
            
            tab1.aside.credential.selected_item = parent_target;
            resetCheckboxes();

            $.ajax({
                url: 'adm_data.php',
                type: 'POST',
                dataType: "text",
                data: { credential_id: parent_target.attr('data-id')
                       ,ajax_action: 'get_credential_descr'
                      },
                success: function (data) {
                    var l_credential_descr = JSON.parse(data);
                    l_credential_descr.forEach(function(item){

                        tab1.section.credential_name.val(item.CREDENTIAL_NAME);
                        checkById('rights_'+item.RIGTH_ID, item.RIGTH_VAL);
                    });
                },
                error: function (m1,m2) {window.alert(m1+m2);}
            });
            
            tab1.section.save_new_credential_btn.hide();
            tab1.section.change_credential_btn.show();
            tab1.section.delete_credential_btn.show();
            /*вывод дополнительной информации по путям*/
            /*if (parent_target.attr('data-type')==='railway') {
                railway_add_info_ajax(parent_target.attr('data-id'));
            }*/
        }
    });
    
    
});
