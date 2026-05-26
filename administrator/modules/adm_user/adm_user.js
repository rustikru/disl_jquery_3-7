$(document).ready(function() {
    /*Загрузим список пользователей*/
    var tab2 = $('div#tabs-2');
    tab2.aside = tab2.children('div.aside');
    $.ajax({
        url: 'adm_data.php',
        type: 'POST',
        dataType: "text",
        data: { ajax_action: 'get_users'
              },
        success: function (data) {
            var l_users = JSON.parse(data);

            tab2.aside.users= $('<div>').attr({'id':'users_list'}).appendTo(tab2.aside);
            l_users.forEach(function(item){
                $('<li>')
                    .attr({'data-type':'user','data-id':item.ID})
                    .addClass('tree_Node tree_ExpandLeaf')
                    .append($('<div>',{
                                'class':'tree_Content',
                                'text':item.NAME
                             })
                           )
                    //.css({'margin-left':'0px'})
                    .appendTo(tab2.aside.users);
            });
        },
        error: function (m1,m2) {window.alert(m1+m2);}
    });
    
    tab2.section = tab2.children('div.section');  
    tab2.section.login = $('input#user_login');
    tab2.section.full_name = $('input#user_full_name');
    tab2.section.enterprise = $('select#user_enterprise');
    tab2.section.division = $('select#user_division');
    tab2.section.change_pwd = $('select#user_change_pwd');
    tab2.section.open = $('select#user_open');
    tab2.section.phone_num = $('input#user_phone_num');
    tab2.section.default_station = $('select#user_default_station');
    tab2.section.stations = $('div#user_stations');
    tab2.section.credentials = $('div#user_credentials');
    
    tab2.section.add_new_user_btn = $('button#add_new_user_btn');
    tab2.section.save_new_user_btn = $('button#save_new_user_btn').hide();
    tab2.section.change_user_btn = $('button#change_user_btn').hide();
    
    tab2.section.add_new_user_btn.on('click', function(event){
        tab2.section.save_new_user_btn.show();
        tab2.section.change_user_btn.hide();
        
        tab2.section.login.val('');
        tab2.section.full_name.val('');
        tab2.section.enterprise.val('');
        tab2.section.division.val('');
        tab2.section.change_pwd.val('Y');
        tab2.section.open.val('Y');
        tab2.section.phone_num.val('');
        tab2.section.default_station.val('');
        tab2.section.stations.find('input').prop('checked',false);
        tab2.section.credentials.find('input').prop('checked',false);
        
        tab2.aside.users.selected_item = null;
        tab2.aside.users.find('li > div').removeClass('tree_selected');
    });
    
    tab2.section.save_new_user_btn.on('mousedown', function(event) {    
        function add_user_ajax(p_login,p_full_name,p_enterprise,p_division,p_change_pwd,p_open,p_phone_num,p_default_station,p_stations,p_credentials) 
        {
            var res;
            $.ajax({
                url: 'adm_data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data: {login:p_login
                      ,full_name:p_full_name
                      ,enterprise:p_enterprise
                      ,division:p_division
                      ,change_pwd:p_change_pwd
                      ,open:p_open
                      ,phone_num:p_phone_num
                      ,default_station:p_default_station
                      ,stations:p_stations
                      ,credentials:p_credentials
                      ,ajax_action: 'add_user'
                      },
                success: function (data) {
                    //alert(data);
                    res = data;
                },
                error: function (m1,m2) {
                    res = 0;
                }
            });
            return res;
        }
        
        var l_stations = '';
        tab2.section.stations.find('input:checked').each(function(){
            l_stations+=$(this).val()+'|';
        });
        
        var l_credentials = '';
        tab2.section.credentials.find('input:checked').each(function(){
            l_credentials+=$(this).val()+'|';
        });
        
        var l_user_id = add_user_ajax( tab2.section.login.val()
                                    ,tab2.section.full_name.val()
                                    ,tab2.section.enterprise.val()
                                    ,tab2.section.division.val()
                                    ,tab2.section.change_pwd.val()
                                    ,tab2.section.open.val()
                                    ,tab2.section.phone_num.val()
                                    ,tab2.section.default_station.val()        
                                    ,l_stations       
                                    ,l_credentials
                                    );
        if (l_user_id!=0) {           
            $('<li>')
                .attr({'data-type':'user','data-id':l_user_id})
                .addClass('tree_Node tree_ExpandLeaf')
                .append($('<div>',{
                            'class':'tree_Content',
                            'text':tab2.section.full_name.val()
                         })
                       )
                .appendTo(tab2.aside.users);
            
            create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
        }else{
            create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
        }
        
        tab2.section.add_new_user_btn.triggerHandler('click');
        tab2.section.save_new_user_btn.hide();
    });
    
    tab2.section.change_user_btn.on('mousedown', function(event) {    
        function change_user_ajax(p_user_id,p_login,p_full_name,p_enterprise,p_division,p_change_pwd,p_open,p_phone_num,p_default_station,p_stations,p_credentials) 
        {
            var res;
            $.ajax({
                url: 'adm_data.php',
                type: 'POST',
                dataType: "text",
                async: false,
                data: {user_id:p_user_id
                      ,login:p_login
                      ,full_name:p_full_name
                      ,enterprise:p_enterprise
                      ,division:p_division
                      ,change_pwd:p_change_pwd
                      ,open:p_open
                      ,phone_num:p_phone_num
                      ,default_station:p_default_station
                      ,stations:p_stations
                      ,credentials:p_credentials
                      ,ajax_action: 'change_user'
                      },
                success: function (data) {
                    res = data;
                },
                error: function (m1,m2) {
                    res = 0;
                }
            });
            return res;
        }
        
        var l_stations = '';
        tab2.section.stations.find('input:checked').each(function(){
            l_stations+=$(this).val()+'|';
        });
        
        var l_credentials = '';
        tab2.section.credentials.find('input:checked').each(function(){
            l_credentials+=$(this).val()+'|';
        });
        
        var l_user_id = change_user_ajax(tab2.aside.users.selected_item.attr('data-id') 
                                        ,tab2.section.login.val()
                                        ,tab2.section.full_name.val()
                                        ,tab2.section.enterprise.val()
                                        ,tab2.section.division.val()
                                        ,tab2.section.change_pwd.val()
                                        ,tab2.section.open.val()
                                        ,tab2.section.phone_num.val()
                                        ,tab2.section.default_station.val()        
                                        ,l_stations       
                                        ,l_credentials
                                        );
        if (l_user_id=='done') {           
            tab2.aside.users.selected_item.children('div.tree_Content').text(tab2.section.full_name.val());
            
            create_info_modal_dialog_new('Оповещение','Процедура завершилась успешно!');
        }else{
            create_info_modal_dialog_new('Ошибка','Процедура завершилась с ошибкой!');
        }
        
        //tab2.section.add_new_user_btn.triggerHandler('click');
        //tab2.section.save_new_user_btn.hide();
    });

    
    tab2.aside.on('mousedown', function(event) {       
        var target = $(event.target);
        var parent_target = target.parent();
        
        if (event.which === 1 && target.hasClass('tree_Content')) {
            /*обрабатываем выделение элементов*/
            if (!target.hasClass('tree_selected')) {
                $('.tree_selected').removeClass('tree_selected');
                target.addClass('tree_selected'); 
            }
            
            tab2.aside.users.selected_item = parent_target;
            
            $.ajax({
                url: 'adm_data.php',
                type: 'POST',
                dataType: "text",
                data: { user_id: parent_target.attr('data-id')
                       ,ajax_action: 'get_user_descr'
                      },
                success: function (data) {
                    var l_user_descr = JSON.parse(data);

                    l_user_descr.forEach(function(item){
                        tab2.section.login.val(item.LOGIN);
                        tab2.section.full_name.val(item.FULL_NAME);
                        tab2.section.enterprise.val(item.ENTERPRISE);
                        tab2.section.division.val(item.DIVISION_ID);
                        tab2.section.change_pwd.val(item.FLAG_CHANGE_PWD);
                        tab2.section.open.val(item.OPEN);
                        tab2.section.phone_num.val(item.PHONE_NUM);
                        tab2.section.default_station.val(item.USER_DEFAULT_STATION);
                        
                        tab2.section.stations.find('input').prop('checked',false);
                        
                        if (item.USER_STATIONS != null) {
                            var arr_user_stations = item.USER_STATIONS.split('|');
                            arr_user_stations.forEach(function(item){
                                tab2.section.stations.find('input[value='+item+']').prop('checked',true);
                            });
                        }
                        
                        tab2.section.credentials.find('input').prop('checked',false);
                        if (item.USER_CREDENTIALS != null) {
                            var arr_user_credentials = item.USER_CREDENTIALS.split('|');
                            arr_user_credentials.forEach(function(item){
                                tab2.section.credentials.find('input[value='+item+']').prop('checked',true);
                            });
                        }
                    });
                    tab2.section.save_new_user_btn.hide();
                    tab2.section.change_user_btn.show();
                },
                error: function (m1,m2) {window.alert(m1+m2);}
            });
        }
    });
});