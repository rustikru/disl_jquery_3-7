/**
 * control.js — Контроль вагонов
 * Архитектура: Prototype-based OOP (совместимость с jQuery 1.x / 3.x)
 *
 * Классы:
 *   ApiService          — все AJAX-запросы к data.php
 *   Dictionary          — справочники (цвета, причины и т.д.)
 *   CarControlFilter    — панель фильтров
 *   CarControlTable     — таблица записей
 *   CarControlDialog    — диалог добавления / редактирования / удаления
 *   CarControlApp       — точка входа, оркестрирует остальные классы
 */

/* ============================================================
   ApiService — изолирует все обращения к серверу
   ============================================================ */

/**
 * @param {string} baseUrl  — корневой URL data.php (например '../data.php')
 */
function ApiService(baseUrl) {
    this.baseUrl = baseUrl;
}

/**
 * Универсальный синхронный POST-запрос.
 * Возвращает распарсенный JSON или строку (в зависимости от parse).
 *
 * @param {string}  action  — значение ajax_action
 * @param {Object}  data    — дополнительные поля
 * @param {boolean} parse   — парсить ли ответ как JSON (default: true)
 * @returns {*}
 */
ApiService.prototype.postSync = function (action, data, parse) {
    if (parse === undefined) { parse = true; }
    var result = null;
    var payload = $.extend({ ajax_action: action }, data || {});
    $.ajax({
        url:      this.baseUrl,
        type:     'POST',
        dataType: 'text',
        async:    false,
        data:     payload,
        success: function (raw) {
            result = parse ? JSON.parse(raw) : raw;
        },
        error: function (m1, m2) { window.alert(m1 + m2); }
    });
    return result;
};

/**
 * Асинхронный POST-запрос.
 *
 * @param {string}   action
 * @param {Object}   data
 * @param {Function} onSuccess  — callback(parsedData)
 */
ApiService.prototype.postAsync = function (action, data, onSuccess) {
    var payload = $.extend({ ajax_action: action }, data || {});
    $.ajax({
        url:      this.baseUrl,
        type:     'POST',
        dataType: 'text',
        data:     payload,
        success: function (raw) {
            var parsed;
            try { parsed = JSON.parse(raw); } catch (e) { parsed = raw; }
            if (typeof onSuccess === 'function') { onSuccess(parsed); }
        },
        error: function (m1, m2) { window.alert(m1 + m2); }
    });
};

/* -- Конкретные методы API -- */

ApiService.prototype.checkAuth = function (onSuccess) {
    this.postAsync('get_is_auth', {}, function (res) {
        if (typeof onSuccess === 'function') { onSuccess(res); }
    });
};

ApiService.prototype.getMessages = function (onSuccess) {
    this.postAsync('get_msg_to_users', {}, onSuccess);
};

ApiService.prototype.getLoginData = function (onSuccess) {
    this.postAsync('getLoginData', {}, onSuccess);
};

ApiService.prototype.getColors = function () {
    return this.postSync('get_car_color_select');
};

ApiService.prototype.getCodeCauses = function () {
    return this.postSync('get_control_code_cause');
};

ApiService.prototype.getControlList = function (params) {
    return this.postSync('get_control_standart', { params: JSON.stringify(params) });
};

ApiService.prototype.saveControl = function (rowId, params) {
    return this.postSync(
        'save_control_car',
        { row_id: rowId, add_data: JSON.stringify(params) },
        false  /* ответ — строка вида "done$..." */
    );
};

ApiService.prototype.deleteControl = function (rowId, params) {
    return this.postSync(
        'delete_control_car',
        { row_id: rowId, add_data: JSON.stringify(params) },
        false
    );
};


/* ============================================================
   Dictionary — хранит справочники, загруженные при старте
   ============================================================ */

/**
 * @param {ApiService} api
 */
function Dictionary(api) {
    this.api    = api;
    this.colors = [];
    this.causes = [];
    this.idleReason = [];
}

Dictionary.prototype.load = function () {
    this.colors = this.api.getColors()  || [];
    this.causes = this.api.getCodeCauses() || [];
};

/**
 * Заполняет <select> вариантами цветов (с CSS background).
 * @param {jQuery} $select
 * @param {boolean} addEmpty — добавить пустую опцию первой
 */
Dictionary.prototype.fillColorSelect = function ($select, addEmpty) {
    if (addEmpty) { $select.append($('<option>', { val: '', text: '' })); }
    this.colors.forEach(function (item) {
        $select.append(
            $('<option>').text(item.DESCRIPTION).val(item.ID).css({ background: item.CODE })
        );
    });
};

/**
 * Заполняет <select> вариантами причин.
 * @param {jQuery} $select
 * @param {boolean} addEmpty
 */
Dictionary.prototype.fillCauseSelect = function ($select, addEmpty) {
    if (addEmpty) { $select.append($('<option>', { val: '', text: '' })); }
    this.causes.forEach(function (item) {
        $select.append(
            $('<option>', { val: item.ID, text: item.CODE + ' (' + item.DESCRIPTION + ')' })
        );
    });
};


/* ============================================================
   CarControlFilter — панель фильтрации над таблицей
   ============================================================ */

/**
 * @param {Dictionary} dict
 * @param {Function}   onSearch   — callback при нажатии "Поиск"
 */
function CarControlFilter(dict, onSearch) {
    this.dict     = dict;
    this.onSearch = onSearch;
    this.$el      = null; // корневой jQuery-элемент

    this.$carNumber  = null;
    this.$causeSelect = null;
    this.$colorSelect = null;
    this.$dateFrom   = null;
    this.$dateTo     = null;
}

CarControlFilter.prototype.build = function () {
    var self = this;

    this.$carNumber   = $('<input>',  { class: 'text ui-widget-content ui-corner-all', css: { width: '7em' } });
    this.$causeSelect = $('<select>');
    this.$colorSelect = $('<select>');
    this.$dateFrom    = $('<input>',  { class: 'text ui-widget-content ui-corner-all', css: { width: '7em' } });
    this.$dateTo      = $('<input>',  { class: 'text ui-widget-content ui-corner-all', css: { width: '7em' } });

    // Заполняем справочники
    this.dict.fillCauseSelect(this.$causeSelect, true);
    this.dict.fillColorSelect(this.$colorSelect, true);

    // Инициализируем datepicker-обёртки из general_function.js
    init_date_time_input_short(this.$dateFrom);
    init_date_time_input_short(this.$dateTo);

    // Устанавливаем текущую дату по умолчанию
    this.$dateFrom.val(trunc_date(get_server_current_time()));

    var $searchBtn = $('<button>')
        .addClass('button')
        .css({ 'margin-left': '0.5em' })
        .append($('<span>').addClass('button-text button-text-size-2').text('Поиск'))
        .on('click', function () {
            self.onSearch();
            create_info_modal_dialog_new('Оповещение', 'Поиск завершен!');
        });

    var $clearBtn = $('<button>')
        .addClass('button')
        .css({ 'margin-left': '0.5em' })
        .append($('<span>').addClass('button-text button-text-size-2').text('Очистить'))
        .on('click', function () { self.clear(); });

    this.$el = $('<div>')
        .addClass('route-filter-div')
        .append($('<label>', { text: 'Вагон',        class: 'route-window-attr-item-text route-window-attr-item-text-between' }))
        .append(this.$carNumber)
        .append($('<label>', { text: ' Код причины', class: 'route-window-attr-item-text' }))
        .append(this.$causeSelect)
        .append($('<label>', { text: 'Цвет',         class: 'route-window-attr-item-text route-window-attr-item-text-between' }))
        .append(this.$colorSelect)
        .append($('<label>', { text: 'Дата контроля',class: 'route-window-attr-item-text route-window-attr-item-text-between' }))
        .append(this.$dateFrom)
        .append($searchBtn)
        .append($clearBtn);

    return this.$el;
};

/** Возвращает объект с текущими значениями фильтров */
CarControlFilter.prototype.getParams = function () {
    return {
        car_number: this.$carNumber.val(),
        cause_id:   this.$causeSelect.val(),
        color_id:   this.$colorSelect.val(),
        date_from:  this.$dateFrom.val(),
        date_to:    this.$dateTo.val()
    };
};

CarControlFilter.prototype.clear = function () {
    this.$carNumber.val('');
    this.$causeSelect.val('');
    this.$colorSelect.val('');
    this.$dateFrom.val('');
    this.$dateTo.val('');
};


/* ============================================================
   CarControlTable — управляет таблицей записей
   ============================================================ */

/**
 * @param {Function} onRowClick — callback(rowData) при клике на номер вагона
 */
function CarControlTable(onRowClick) {
    this.onRowClick = onRowClick;
    this.$body      = null; // <tbody>
    this.rows       = [];   // массив объектов-строк
}

CarControlTable.prototype.build = function () {
    var $table = $('<table>').addClass('route-table');

    $('<thead>').appendTo($table)
        .append(
            $('<tr>')
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Номер вагона').attr('rowspan', '2'))
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Дата создания').attr('rowspan', '2'))
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Кто создал').attr('rowspan', '2'))
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Код причины').attr('rowspan', '2'))
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Описание').attr('rowspan', '2'))
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Комментарий').attr('rowspan', '2'))
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Цвет').attr('rowspan', '2'))
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Период контроля').attr('colspan', '2'))
        )
        .append(
            $('<tr>')
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('с'))
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('по'))
        );

    this.$body = $('<tbody>').appendTo($table);
    return $table;
};

/**
 * Вспомогательная функция: безопасное значение поля.
 * @param {*} v
 * @returns {string}
 */
CarControlTable.prototype._val = function (v) {
    return (v === null || v === undefined) ? '' : v;
};

/**
 * Добавляет строку в таблицу.
 * @param {Object} item — данные с сервера
 * @returns {Object} row — внутренний объект строки
 */
CarControlTable.prototype.addRow = function (item) {
    var self = this;
    var v    = this._val.bind(this);

    var row = {
        id:   item.ID_CONTROL,
        pos:  this.rows.length,
        data: item,
        $tr:  $('<tr>').appendTo(this.$body)
    };

    row.$carNumber    = $('<td>').text(v(item.CAR_NUMBER)).addClass('reference-text');
    row.$creationDate = $('<td>').text(v(item.CREATION_DATE));
    row.$createdName  = $('<td>').text(v(item.CREATED_NAME));
    row.$causeCode    = $('<td>').text(v(item.CAUSE_CODE));
    row.$causeDesc    = $('<td>').text(v(item.CAUSE_DESC));
    row.$note         = $('<td>').text(v(item.NOTE));
    row.$colorName    = $('<td>').text(v(item.COLOR_NAME));
    row.$startDate    = $('<td>').text(v(item.START_DATE));
    row.$endDate      = $('<td>').text(v(item.END_DATE));

    row.$tr.append(
        row.$carNumber, row.$creationDate, row.$createdName,
        row.$causeCode, row.$causeDesc,    row.$note,
        row.$colorName, row.$startDate,    row.$endDate
    );

    row.$carNumber.on('click', function () {
        if (typeof self.onRowClick === 'function') { self.onRowClick(row); }
    });

    this.rows[row.pos] = row;
    return row;
};

/**
 * Обновляет данные существующей строки.
 * @param {Object} row  — внутренний объект строки
 * @param {Object} item — свежие данные с сервера
 */
CarControlTable.prototype.updateRow = function (row, item) {
    var v = this._val.bind(this);
    row.data          = item;
    row.$carNumber.text(v(item.CAR_NUMBER));
    row.$creationDate.text(v(item.CREATION_DATE));
    row.$createdName.text(v(item.CREATED_NAME));
    row.$causeCode.text(v(item.CAUSE_CODE));
    row.$causeDesc.text(v(item.CAUSE_DESC));
    row.$note.text(v(item.NOTE));
    row.$colorName.text(v(item.COLOR_NAME));
    row.$startDate.text(v(item.START_DATE));
    row.$endDate.text(v(item.END_DATE));
};

/**
 * Синхронизирует таблицу со свежим массивом данных с сервера.
 * @param {Array} freshList
 */
CarControlTable.prototype.sync = function (freshList) {
    var self = this;

    // Добавляем новые / обновляем существующие
    freshList.forEach(function (item) {
        var existing = null;
        self.rows.forEach(function (row) {
            if (row && row.id == item.ID_CONTROL) { existing = row; }
        });

        if (existing) {
            if (existing.data.LAST_UPDATE_DATE !== item.LAST_UPDATE_DATE) {
                self.updateRow(existing, item);
            }
        } else {
            self.addRow(item);
        }
    });

    // Удаляем строки, которых больше нет
    self.rows.forEach(function (row) {
        if (!row) { return; }
        var found = false;
        freshList.forEach(function (item) {
            if (item.ID_CONTROL == row.id) { found = true; }
        });
        if (!found) {
            row.$tr.remove();
            delete self.rows[row.pos];
        }
    });
};


/* ============================================================
   CarControlDialog — диалог создания / редактирования
   ============================================================ */

/**
 * @param {Dictionary} dict
 * @param {ApiService} api
 * @param {Function}   onSaved   — callback после сохранения / удаления
 */
function CarControlDialog(dict, api, onSaved) {
    this.dict    = dict;
    this.api     = api;
    this.onSaved = onSaved;
}

/**
 * Открывает диалог.
 * @param {Object|null} row — строка из CarControlTable (null = создание новой)
 */
CarControlDialog.prototype.open = function (row) {
    var self      = this;
    var isNew     = (row === null || row === undefined);
    var rowData   = isNew ? {} : row.data;
    var rowId     = isNew ? '' : rowData.ID_CONTROL;

    /* --- Элементы формы (класс 'required' подсвечивает жёлтым обязательные поля) --- */
    var $carNumber    = $('<input>',  { class: 'route-window-attr-item-elem text ui-widget-content ui-corner-all required' })
                            .css({ width: '10em' })
                            .attr('id_control', isNew ? '0' : rowId);
    var $colorSelect  = $('<select>', { class: 'route-window-attr-item-elem required' }).css({ width: '22em' });
    var $causeSelect  = $('<select>', { class: 'route-window-attr-item-elem' }).css({ width: '22em' });
    var $dateFrom     = $('<input>',  { class: 'text ui-widget-content ui-corner-all required' }).css({ width: '7em' });
    var $dateTo       = $('<input>',  { class: 'text ui-widget-content ui-corner-all' }).css({ width: '7em' });
    var $note         = $('<input>',  { class: 'route-window-attr-item-elem text ui-widget-content ui-corner-all' }).css({ width: '22em' });

    /* --- Заполняем справочники --- */
    this.dict.fillColorSelect($colorSelect, true);
    this.dict.fillCauseSelect($causeSelect, true);

    /* --- Инициализируем datepicker --- */
    init_date_time_input_short($dateFrom);
    init_date_time_input_short($dateTo);

    /* --- Режим редактирования: подставляем значения --- */
    if (!isNew) {
        $carNumber.val(rowData.CAR_NUMBER).prop('disabled', true).removeClass('required'); // в режиме редактирования номер вагона не обязателен
        $causeSelect.val(rowData.CAUSE_ID);
        $colorSelect.val(rowData.COLOR_ID);
        $note.val(rowData.NOTE);
        $dateFrom.val(rowData.START_DATE);
        $dateTo.val(rowData.END_DATE);
    }

    /* --- Компоновка --- */
    var $content = $('<div/>').addClass('md-lvl-1').attr('title', 'Контроль вагонов').appendTo('body');

    $('<div>').addClass('route-window-attr').css({ width: '37em' })
        .append(self._row('Номер вагона',       $carNumber))
        .append(self._row('Цвет',               $colorSelect))
        .append(self._row('Код причины',         $causeSelect))
        .append(self._row('Период контроля: с ', $dateFrom, 'по ', $dateTo))
        .append(self._row('Примечание',          $note))
        .appendTo($content);

    /* --- Валидация --- */
    function validate() {
        if (isNew && $carNumber.val() === '') {
            create_info_modal_dialog_new('Оповещение', 'Не заполнено поле "Вагон"');
            return false;
        }
        if ($dateFrom.val() === '') {
            create_info_modal_dialog_new('Оповещение', 'Не заполнено поле "Период контроля с"');
            return false;
        }
        if ($colorSelect.val() === '') {
            create_info_modal_dialog_new('Оповещение', 'Не заполнено поле "Цвет"');
            return false;
        }
        return true;
    }

    /* --- Собираем параметры для сохранения --- */
    function collectParams() {
        return {
            id_control:  $carNumber.attr('id_control'),
            car_number:  $carNumber.val(),
            cause_id:    $causeSelect.val(),
            color_id:    $colorSelect.val(),
            note:        $note.val(),
            start_date:  $dateFrom.val(),
            end_date:    $dateTo.val()
        };
    }

    /* --- Обработка ответа сервера --- */
    function handleResponse(rawResult, successMsg) {
        var parts = rawResult.split('$');
        if (parts[0] === 'done') {
            $content.dialog('close');
            if (typeof self.onSaved === 'function') { self.onSaved(); }
            create_info_modal_dialog_new('Оповещение', successMsg);
            return true;
        }
        create_info_modal_dialog_new('Ошибка', 'Процедура завершилась с ошибкой! Причина: ' + parts[1]);
        return false;
    }

    /* --- Диалог jQuery UI --- */
    $content.dialog({
        resizable: false,
        modal:     true,
        width:     'auto',
        position:  { my: 'top', at: 'top+150' },
        buttons: {
            'Сохранить': {
                text: 'Сохранить',
                id:   'md_save_fuel_standart_btn',
                click: function () {
                    if (!validate()) { return; }
                    $('#md_save_fuel_standart_btn').prop('disabled', true);
                    var res = self.api.saveControl(rowId, collectParams());
                    var ok  = handleResponse(res, isNew ? 'Контроль создан!' : 'Контроль обновлен!');
                    if (!ok) { $('#md_save_fuel_standart_btn').prop('disabled', false); }
                }
            },
            'Удалить': {
                text: 'Удалить',
                id:   'md_delete_form_btn',
                click: function () {
                    $('#md_delete_form_btn').prop('disabled', true);
                    var res = self.api.deleteControl(rowId, { id_control: $carNumber.attr('id_control') });
                    var ok  = handleResponse(res, 'Контроль удален!');
                    if (!ok) { $('#md_delete_form_btn').prop('disabled', false); }
                }
            },
            'Закрыть форму': {
                text: 'Закрыть форму',
                id:   'md_close_form_btn',
                click: function () { $content.dialog('close'); }
            }
        },
        close: function () { $content.remove(); }
    });

    // Кнопка сохранить сразу активна
    $('#md_save_fuel_standart_btn').prop('disabled', false);
};

/**
 * Вспомогательный метод: строка формы.
 * @returns {jQuery}
 */
CarControlDialog.prototype._row = function (labelText, $field, label2, $field2) {
    var $label = $('<label>')
        .text(labelText)
        .addClass('route-window-attr-item-text route-window-attr-item-text-left')
        .css({ display: 'inline-block', width: '13em', verticalAlign: 'middle' });

    var $div = $('<div>')
        .addClass('route-window-attr-item helper-clearfix')
        .css({ marginBottom: '0.4em', lineHeight: '2em' })
        .append($label)
        .append($field);

    if (label2 && $field2) {
        $div.append(
            $('<label>')
                .text(label2)
                .addClass('route-window-attr-item-text route-window-attr-item-text-between')
                .css({ display: 'inline-block', margin: '0 0.3em', verticalAlign: 'middle' })
        ).append($field2);
    }
    return $div;
};


/* ============================================================
   CarControlApp — точка входа, собирает всё вместе
   ============================================================ */

function CarControlApp() {
    this.api    = new ApiService('../data.php');
    this.authApi = new ApiService('/data.php'); // для auth/msg — корневой путь
    this.dict   = new Dictionary(this.api);
    this.filter = null;
    this.table  = null;
    this.dialog = null;
}

CarControlApp.prototype.init = function () {
    var self = this;

    /* --- Убираем стандартное контекстное меню --- */
    document.oncontextmenu = function () { return false; };

    /* --- Периодическая проверка авторизации и сообщений --- */
    function checkAuth() {
        self.authApi.checkAuth(function (res) {
            if (res !== '1') { document.location.href = './index.php'; }
        });
    }
    function checkMessages() {
        self.authApi.getMessages(function (result) {
            if (result.TYPE == '2') {
                document.location.href = './index.php';
            } else if (result.TYPE == '1') {
                $('#msg_box').text(result.TEXT).show();
            } else {
                $('#msg_box').hide();
            }
        });
    }
    setInterval(function () { checkAuth(); checkMessages(); }, 1000 * 5 * 60);
    checkMessages();

    /* --- Загружаем данные пользователя --- */
    this.authApi.getLoginData(function (result) {
        window.user_station_id   = result.stationId;
        window.user_station_name = result.stationName;
        window.user_name         = result.userName;
        window.user_id           = result.user_id;
    });

    /* --- Загружаем справочники --- */
    this.dict.load();

    /* --- Строим интерфейс --- */
    this._buildUI();

    /* --- Первичная загрузка данных --- */
    this.refresh();
};

CarControlApp.prototype._buildUI = function () {
    var self = this;
    var $tab = $('#tabs-5');

    var $section = $('<div>')
        .addClass('section')
        .css({ width: 'auto', float: 'none', height: '90vh' })
        .appendTo($tab);

    /* Кнопка "Добавить контроль" */
    $('<button>').addClass('button')
        .css({ 'margin-left': '0.5em', 'margin-right': '0.5em', 'margin-top': '0.5em' })
        .append($('<span>').addClass('button-text button-text-size-3').text('Добавить контроль'))
        .appendTo($section)
        .on('click', function () { self.dialog.open(null); });

    /* Фильтр */
    this.filter = new CarControlFilter(this.dict, function () { self.refresh(); });
    $section.append(this.filter.build());

    /* Таблица */
    this.table = new CarControlTable(function (row) { self.dialog.open(row); });
    $section.append(this.table.build());

    /* Диалог */
    this.dialog = new CarControlDialog(this.dict, this.api, function () { self.refresh(); });
};

CarControlApp.prototype.refresh = function () {
    var self   = this;
    var params = this.filter ? this.filter.getParams() : {};

    start_loading_animation();
    var freshList = this.api.getControlList(params);
    if (freshList) {
        this.table.sync(freshList);
    }
    stop_loading_animation();
};

/* ============================================================
   Запуск приложения
   ============================================================ */
$(document).ready(function () {
    var app = new CarControlApp();
    app.init();
});