// Полифилл для toLocaleFormat (полная версия)
if (!Date.prototype.toLocaleFormat) {
    Date.prototype.toLocaleFormat = function(format) {
        var date = this;
        
        function pad(num, len) {
            len = len || 2;
            var str = String(num);
            while (str.length < len) str = '0' + str;
            return str;
        }
        
        var replacements = {
            '%a': function() { return ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()]; },
            '%A': function() { return ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][date.getDay()]; },
            '%b': function() { return ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'][date.getMonth()]; },
            '%B': function() { return ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'][date.getMonth()]; },
            '%d': function() { return pad(date.getDate()); },
            '%H': function() { return pad(date.getHours()); },
            '%I': function() { var h = date.getHours() % 12; return pad(h === 0 ? 12 : h); },
            '%m': function() { return pad(date.getMonth() + 1); },
            '%M': function() { return pad(date.getMinutes()); },
            '%p': function() { return date.getHours() < 12 ? 'AM' : 'PM'; },
            '%S': function() { return pad(date.getSeconds()); },
            '%y': function() { return String(date.getFullYear()).slice(-2); },
            '%Y': function() { return date.getFullYear(); },
            '%%': function() { return '%'; }
        };
        
        return format.replace(/%[aAbBdHImMpS yY%]/g, function(match) {
            return replacements[match] ? replacements[match]() : match;
        });
    };
}

function check_car_number(p_car_number){
    function get_sum(p_number){
        var s = 0;
        
        while (p_number > 0){
         s += p_number % 10;
         p_number = Math.floor(p_number/10);
        }
        return s;
    }
    
    if (p_car_number==='00009138'||p_car_number==='00009874'){
        return true;
    }
    if (p_car_number.length != 8){
        return false;
    }
    /*Проверяем что строка состоит из цифр*/
    if (isNaN(+p_car_number)) {
        return false;
    }    
    
    var sum = 0;
    for (var i = 0; i <= 6; i++) {
        var num = +p_car_number.charAt(i);
        sum+=get_sum(num*(i%2==0?2:1));
    }

    if ((Math.ceil(sum/10)*10-sum) == p_car_number.charAt(7)) {
        return true;
    } else {
        return false;
    }   
}

function test_msg (msgText){
    create_info_modal_dialog_new('Test',msgText);
}

/*запускает заставку когда грузятся данные*/
function start_loading_animation(){
    // найдем элемент с изображением загрузки и уберем невидимость:
    var imgObj = $('.loadImg > img');

    // вычислим в какие координаты нужно поместить изображение загрузки,
    // чтобы оно оказалось в серидине страницы:
    var centerY = $(window).scrollTop() + $(window).height()/2;
    var centerX = $(window).scrollLeft() + $(window).width()/2;

    // поменяем координаты изображения на нужные:
    imgObj.css({top:centerY, left:centerX});
    
    $('.loadImg').show();
}
/*останавливает заставку после того как данные загрузились*/
function stop_loading_animation(){
    $('.loadImg').hide();
}

function create_info_modal_dialog_new(p_title,p_msg){
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
function create_info_modal_dialog_btn(p_title,p_msg, p_window){
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
                'Да': {
					text: "Да",
					click: function() {
							p_window.dialog("close");
							p_window.remove();
							$(this).dialog("close");
						}
				},
				'Отмена': function(){
                    $(this).dialog( "close" );
                }       
            },
            close: function() {
                $(this).remove();
            }
        });
}

function get_selected_option_text_mas(p_select){
    var rr = []; 
    p_select.children('option:selected').each(function(i, selected){ 
        rr[i] = $(selected).text(); 
    });
    return rr;
}

var g_need_return_focus = true;
function init_date_time_input(p_input){
    p_input.attr('placeholder','ддммгг ччмм');
    p_input.on('blur',function(){        
        var old_time = p_input.val();
        
        var pattern_1 = /(\d{2})(\d{2})(\d{4}) (\d{2})(\d{2})/;
        var pattern_2 = /(\d{2})(\d{2})(\d{2}) (\d{2})(\d{2})/;
        var pattern_3 = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/;
        
        if (old_time==''){
            g_need_return_focus = true;
            p_input.removeClass('red_bckg_color');
        }else{
            if (pattern_1.test(old_time)||pattern_2.test(old_time)||pattern_3.test(old_time)) {
                var new_time;
                if (pattern_1.test(old_time)){new_time = old_time.replace(pattern_1,'$1.$2.$3 $4:$5');}
                else if (pattern_2.test(old_time)){new_time = old_time.replace(pattern_2,'$1.$2.20$3 $4:$5');} 
                else if (pattern_3.test(old_time)){new_time = old_time;}

                var pattern = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2})\:(\d{2})/;

                var test_date = new Date(new_time.replace(pattern,'$3-$2-$1T$4:$5:00'));

                if (isNaN(test_date.getTime())) {
                    p_input.addClass('red_bckg_color');
                    if (g_need_return_focus) {
                        g_need_return_focus = false;
                        setTimeout(function(){p_input.focus();g_need_return_focus = true;},0);
                    }
                    //$('#'+p_id).focus();
                }else{
                    g_need_return_focus = true;
                    p_input.removeClass('red_bckg_color');
                    p_input.val(new_time);
                }   
            }else{
                p_input.addClass('red_bckg_color');
                if (g_need_return_focus) {
                    g_need_return_focus = false;
                    setTimeout(function(){p_input.focus();g_need_return_focus = true;},0);
                }
            }
        }
    });
}

function init_date_time_input_short(p_input){
    p_input.attr('placeholder','ддммгг');
    p_input.on('blur',function(){        
        var old_time = p_input.val();
        
        var pattern_1 = /(\d{2})(\d{2})(\d{4})/;
        var pattern_2 = /(\d{2})(\d{2})(\d{2})/;
        var pattern_3 = /(\d{2})\.(\d{2})\.(\d{4})/;
        
        if (old_time==''){
            g_need_return_focus = true;
            p_input.removeClass('red_bckg_color');
        }else{
            if (pattern_1.test(old_time)||pattern_2.test(old_time)||pattern_3.test(old_time)) {
                var new_time;
                if (pattern_1.test(old_time)){new_time = old_time.replace(pattern_1,'$1.$2.$3');}
                else if (pattern_2.test(old_time)){new_time = old_time.replace(pattern_2,'$1.$2.20$3');} 
                else if (pattern_3.test(old_time)){new_time = old_time;}

                var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;

                var test_date = new Date(new_time.replace(pattern,'$3-$2-$1'));

                if (isNaN(test_date.getTime())) {
                    p_input.addClass('red_bckg_color');
                    if (g_need_return_focus) {
                        g_need_return_focus = false;
                        setTimeout(function(){p_input.focus();g_need_return_focus = true;},0);
                    }
                    //$('#'+p_id).focus();
                }else{
                    g_need_return_focus = true;
                    p_input.removeClass('red_bckg_color');
                    p_input.val(new_time);
                }   
            }else{
                p_input.addClass('red_bckg_color');
                if (g_need_return_focus) {
                    g_need_return_focus = false;
                    setTimeout(function(){p_input.focus();g_need_return_focus = true;},0);
                }
            }
        }
    });
}

/*нельзя вводить даты большей чем введенная*/
function init_date_time_input_add(p_input,p_compare_date){    
    var pattern = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2})\:(\d{2})/;
    
    var l_compare_date = new Date(p_compare_date.toString().replace(pattern,'$3-$2-$1T$4:$5:00'));
    
    p_input.attr('placeholder','ддммгг ччмм');
    p_input.on('blur',function(){        
        var old_time = p_input.val();
        
        var pattern_1 = /(\d{2})(\d{2})(\d{4}) (\d{2})(\d{2})/;
        var pattern_2 = /(\d{2})(\d{2})(\d{2}) (\d{2})(\d{2})/;
        var pattern_3 = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/;
        
        if (old_time==''){
            g_need_return_focus = true;
            p_input.removeClass('red_bckg_color');
        }else{
            if (pattern_1.test(old_time)||pattern_2.test(old_time)||pattern_3.test(old_time)) {
                var new_time;
                if (pattern_1.test(old_time)){new_time = old_time.replace(pattern_1,'$1.$2.$3 $4:$5');}
                else if (pattern_2.test(old_time)){new_time = old_time.replace(pattern_2,'$1.$2.20$3 $4:$5');} 
                else if (pattern_3.test(old_time)){new_time = old_time;}

                var test_date = new Date(new_time.replace(pattern,'$3-$2-$1T$4:$5:00'));

                if (isNaN(test_date.getTime()) || (test_date-l_compare_date>0)) {
                    p_input.addClass('red_bckg_color');
                    if (g_need_return_focus) {
                        g_need_return_focus = false;
                        setTimeout(function(){p_input.focus();g_need_return_focus = true;},0);
                    }
                    //$('#'+p_id).focus();
                }else {
                    g_need_return_focus = true;
                    p_input.removeClass('red_bckg_color');
                    p_input.val(new_time);
                }   
            }else{
                p_input.addClass('red_bckg_color');
                if (g_need_return_focus) {
                    g_need_return_focus = false;
                    setTimeout(function(){p_input.focus();g_need_return_focus = true;},0);
                }
            }
        }
    });
}

/*нельзя вводить даты большей чем введенная*/
function init_date_time_input_btw(p_input,p_compare_date_from,p_compare_date_to){    
    var pattern = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2})\:(\d{2})/;
    
    var l_compare_date_from = new Date(p_compare_date_from.toString().replace(pattern,'$3-$2-$1T$4:$5:00'));
    var l_compare_date_to = new Date(p_compare_date_to.toString().replace(pattern,'$3-$2-$1T$4:$5:00'));
    
    p_input.attr('placeholder','ддммгг ччмм');
    p_input.on('blur',function(){        
        var old_time = p_input.val();
        
        var pattern_1 = /(\d{2})(\d{2})(\d{4}) (\d{2})(\d{2})/;
        var pattern_2 = /(\d{2})(\d{2})(\d{2}) (\d{2})(\d{2})/;
        var pattern_3 = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/;
        
        if (old_time==''){
            g_need_return_focus = true;
            p_input.removeClass('red_bckg_color');
        }else{
            if (pattern_1.test(old_time)||pattern_2.test(old_time)||pattern_3.test(old_time)) {
                var new_time;
                if (pattern_1.test(old_time)){new_time = old_time.replace(pattern_1,'$1.$2.$3 $4:$5');}
                else if (pattern_2.test(old_time)){new_time = old_time.replace(pattern_2,'$1.$2.20$3 $4:$5');} 
                else if (pattern_3.test(old_time)){new_time = old_time;}

                var test_date = new Date(new_time.replace(pattern,'$3-$2-$1T$4:$5:00'));

                if (isNaN(test_date.getTime()) || (test_date-l_compare_date_from<0) ||(test_date-l_compare_date_to>0)) {
                    p_input.addClass('red_bckg_color');
                    if (g_need_return_focus) {
                        g_need_return_focus = false;
                        setTimeout(function(){p_input.focus();g_need_return_focus = true;},0);
                    }
                    //$('#'+p_id).focus();
                }else {
                    g_need_return_focus = true;
                    p_input.removeClass('red_bckg_color');
                    p_input.val(new_time);
                }   
            }else{
                p_input.addClass('red_bckg_color');
                if (g_need_return_focus) {
                    g_need_return_focus = false;
                    setTimeout(function(){p_input.focus();g_need_return_focus = true;},0);
                }
            }
        }
    });
}

function get_server_current_time(){
    var server_current_time;
    $.ajax({
        url: '/data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { ajax_action: 'get_current_time'
        },
        success: function (data) {
            server_current_time = data;
        },
        error: function (data) {
            server_current_time = 'fail';
        }
    });
    return server_current_time;
}

function add_day_to_date(p_date,p_day){
        var pattern = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2})\:(\d{2})/;
        var l_date = new Date(p_date.replace(pattern,'$3-$2-$1T$4:$5:00'));
        l_date.setDate(l_date.getDate() + p_day);

        return l_date.toLocaleFormat("%d.%m.%Y %H:%M");
}

function add_hours_to_date(p_date,p_hour){
        var pattern = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2})\:(\d{2})/;
        var l_date = new Date(p_date.replace(pattern,'$3-$2-$1T$4:$5:00'));
        l_date.setMilliseconds(p_hour * 60 * 60 * 1000);

        return l_date.toLocaleFormat("%d.%m.%Y %H:%M");
}

function add_day_to_date_trunc(p_date,p_day){
        var pattern = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2})\:(\d{2})/;
        var l_date = new Date(p_date.replace(pattern,'$3-$2-$1T$4:$5:00'));
        l_date.setDate(l_date.getDate() + p_day);
        l_date.setHours(0, 0, 0, 0);

        return l_date.toLocaleFormat("%d.%m.%Y %H:%M");
}
/*Дата с конкретным временем*/
function add_date_set_hh_mm(p_date,p_day, p_hh, p_mm){
        var pattern = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2})\:(\d{2})/;
        var l_date = new Date(p_date.replace(pattern,'$3-$2-$1T$4:$5:00'));
        l_date.setDate(l_date.getDate() + p_day);
        l_date.setHours(p_hh, p_mm, 0, 0);

        return l_date.toLocaleFormat("%d.%m.%Y %H:%M");
}

/*режим дату с формата dd.mm.yyyy hh24:mi до dd.mm.yyyy*/
function trunc_date(p_date){
        var pattern = /(\d{2})\.(\d{2})\.(\d{4}) (\d{2})\:(\d{2})/;
        var l_date = new Date(p_date.replace(pattern,'$3-$2-$1T$4:$5:00'));
        return l_date.toLocaleFormat("%d.%m.%Y");
}

function limit_input_only_numbers(p_input) {
        p_input.on('keypress',function (e){
            // Разрешаем: backspace, delete, влево, вправо
            if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
                return;
            }

            var chr = String.fromCharCode(e.charCode);

            if (chr == null) return;

            if (chr === '.') {
                return;
            }

            if (chr < '0' || chr > '9') {
                return false;
            }
        });
}

function limit_input_only_rus(p_input) {
        p_input.on('keypress',function (e){
            // Разрешаем: backspace, delete, влево, вправо
            if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 37 || e.keyCode === 39) {
                return;
            }

            var chr = String.fromCharCode(e.charCode);

            if (chr == null) return;
            
            if(!/[А-ЯЁа-яё]/.test(chr)) {
                return false;
            }else{
                var text = $( this ).val();
                if ($(this).val().length == 0){
                    $(this).val(chr.toUpperCase());
                }
                //$(this).val(chr.toUpperCase());
            }
        });
}

function check_open_period(p_oper_id,p_date){
    var l_result;
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { oper_id: p_oper_id
               ,date: p_date
               ,ajax_action: 'check_open_period'
        },
        success: function (data) {
            l_result = '1';
        },
        error: function (data) {
            l_result = '0';
        }
    });
    return l_result;
}

/*p_str_date в формате dd.mm.yyyy hh24:mi*/
function string_to_date(p_str_date){
    function get_time(p_date,p_type){
        var res;
        switch (p_type){
            case '1':
                res = p_date.substring(0,2);
                break;
            case '2':
                res = p_date.substring(3,5);
                break;
            case '3':
                res = p_date.substring(6,10);
                break;
            case '4':
                res = p_date.substring(11,13);
                break;
            case '5':
                res = p_date.substring(14,16);
                break;
        }
        if (p_type=='1'&&p_type=='2'&&p_type=='4'&&p_type=='5'){
            res = res.substring(0,1) == '0'?res.substring(1,2):res;
        }
        if (p_type=='2'){
            res = res - 1;
        }
        
        return res;
    }
    var l_date = new Date(get_time(p_str_date,'3')
                         ,get_time(p_str_date,'2')
                         ,get_time(p_str_date,'1')
                         ,get_time(p_str_date,'4')
                         ,get_time(p_str_date,'5'));
    return l_date;
}

function date_to_string(p_date) {
    var formatDate = p_date.getDate().toString().length > 1 ? p_date.getDate() : '0' + p_date.getDate();
    formatDate +='.';
    formatDate += (p_date.getMonth()+1).toString().length > 1 ? (p_date.getMonth()+1) : '0' + (p_date.getMonth()+1);
    formatDate +='.';
    formatDate += p_date.getFullYear();
    formatDate +=' ';
    formatDate += p_date.getHours().toString().length > 1 ? p_date.getHours() : '0' + p_date.getHours();
    formatDate +=':';
    formatDate += p_date.getMinutes().toString().length > 1 ? p_date.getMinutes() : '0' + p_date.getMinutes();
    return formatDate;
}
// Проверка: существует ли объект
function check_undefined (p_obj){
	if (typeof p_obj !== typeof undefined && p_obj !== false) {
		return 1;
	}
	else {
		return 0;
	}
}
// Есть элемент в массиве
function contains(arr, elem) {
   return arr.indexOf(elem) != -1;
}
function check_carnumber_in_db (p_obj){
	var l_result;
    $.ajax({
        url: 'data.php',
        type: 'POST',
        dataType: "text",
        async: false,
        data: { car_number: p_obj
               ,ajax_action: 'check_carnumber_in_db'
        },
        success: function (data) {
            l_result = data;
        },
        error: function (data) {
            l_result = '0';
        }
    });
    return l_result;
}
// Сравнение двух дат
function date_comparison (p_firstDate, p_secondDate,p_oper){
		/*
		console.log('p_firstDate='+p_firstDate);
		console.log('p_secondDate='+p_secondDate);
		console.log('p_oper='+p_oper);
		*/
		var datetime_regex = /(\d\d)\.(\d\d)\.(\d\d\d\d)\s(\d\d):(\d\d)/; // Формат даты
		
		var first_date_arr = datetime_regex.exec(p_firstDate);
		//var first_datetime = new Date(first_date_arr[3]+'-'+first_date_arr[2],first_date_arr[1],first_date_arr[4],first_date_arr[5]);
		var first_datetime = new Date(p_firstDate.replace(datetime_regex,'$3-$2-$1T$4:$5:00'));
		
		var second_date_arr = datetime_regex.exec(p_secondDate);
		//var second_datetime = new Date(second_date_arr[3],second_date_arr[2],second_date_arr[1],second_date_arr[4],second_date_arr[5]);
		var second_datetime = new Date(p_secondDate.replace(datetime_regex,'$3-$2-$1T$4:$5:00'));
		
		/*console.log(first_datetime);
		console.log(second_datetime);
		console.log('1='+first_datetime.getTime());
		console.log('2='+second_datetime.getTime());
		*/
		if(first_datetime.getTime() >= second_datetime.getTime()) {
			console.log('*=   >==');
			return true;	
		} else {
			console.log('*=   <==');
			return false;
		}
		//console.log('true');
		return true;
}

function old_date_comparison (p_firstDate, p_secondDate,p_oper){
		
		console.log('p_firstDate='+p_firstDate);
		console.log('p_secondDate='+p_secondDate);
		console.log('p_oper='+p_oper);
		var datetime_regex = /(\d\d)\.(\d\d)\.(\d\d\d\d)\s(\d\d):(\d\d)/; // Формат даты
		var first_date_arr = datetime_regex.exec(p_firstDate);
		//var first_datetime = new Date(first_date_arr[3], first_date_arr[2], first_date_arr[1], first_date_arr[4], first_date_arr[5]);
		var first_datetime = new Date(first_date_arr[3]+'-'+first_date_arr[2]+'-'+first_date_arr[1]+' '+first_date_arr[4]+':'+first_date_arr[5]);
		var second_date_arr = datetime_regex.exec(p_secondDate);
		//var second_datetime = new Date(second_date_arr[3], second_date_arr[2], second_date_arr[1], second_date_arr[4], second_date_arr[5]);
		var second_datetime = new Date(second_date_arr[3]+'-'+second_date_arr[2]+'-'+second_date_arr[1]+' '+second_date_arr[4]+':'+second_date_arr[5]);
		/*
		console.log('second_date_arr[3]='+second_date_arr[3]);
		console.log('second_date_arr[2]='+second_date_arr[2]);
		console.log('second_date_arr[1]='+second_date_arr[1]);
		console.log('second_date_arr[4]='+second_date_arr[4]);
		console.log('second_date_arr[5]='+second_date_arr[5]);
		
		
		console.log('first_datetime='+first_datetime.getTime());
		console.log('second_datetime='+second_datetime.getTime());
		*/
		if (p_oper == '<'){
			if(first_datetime.getTime() <= second_datetime.getTime()) {
				//console.log('=  <');
				return true;
			} else {
				return false;
			}
		}
		
		if (p_oper == '>'){
			if(first_datetime.getTime() >= second_datetime.getTime()) {
				//console.log('=   >');
				return true;
				
			} else {
				//console.log('=   <');
				return false;
			}
		}
		//console.log('true');
		return true;
}

function isNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

function getIsEmpty(value) {
  // Проверка на null и undefined
  if (value === null || value === undefined) {
    return true;
  }

  // Проверка на пустую строку
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }

  // Проверка на пустой массив
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  // Проверка на пустой объект
  if (typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value).length === 0;
  }
 
  // Во всех остальных случаях значение не считается пустым
  return false;
}
