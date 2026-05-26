/**
 * idleControl.js — Контроль простоев
 *
 * Архитектура: Prototype-based OOP (аналогично control.js)
 *
 * Классы:
 *   IdleControlFilter   — панель фильтров
 *   IdleControlTable    — таблица записей
 *   IdleControlDialog   — диалог добавления / редактирования / удаления
 *   IdleControlApp      — точка входа
 *
 * ApiService из control.js переиспользуется — подключите control.js первым
 * либо вынесите ApiService в отдельный файл api.js
 */

/* ============================================================
   IdleControlFilter
   ============================================================ */

function IdleControlFilter(onSearch) {
    this.onSearch = onSearch;
    this.$el      = null;

    this.$carNumber   = null;
    this.$isExcluded  = null; // select: '' / 'Y' / 'N'
    this.$dateFrom    = null;
    this.$dateTo      = null;
    this.$idleReasonSelect = null;
}

IdleControlFilter.prototype.build = function () {
    var self = this;

    this.$carNumber  = $('<input>', { class: 'text ui-widget-content ui-corner-all', css: { width: '7em' } });
    this.$isExcluded = $('<select>');
    this.$idleReasonSelect = $('<select>');
    this.$dateFrom   = $('<input>', { class: 'text ui-widget-content ui-corner-all', css: { width: '7em' } });
    this.$dateTo     = $('<input>', { class: 'text ui-widget-content ui-corner-all', css: { width: '7em' } });

    // Справочник "Исключение из простоя"
    this.$isExcluded
        .append($('<option>', { val: '',  text: '' }))
        .append($('<option>', { val: 'Y', text: 'Да' }))
        .append($('<option>', { val: 'N', text: 'Нет' }));

    init_date_time_input_short(this.$dateFrom);
    init_date_time_input_short(this.$dateTo);

    // Дата по умолчанию — сегодня
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
        .append($('<label>', { text: 'Вагон',                class: 'route-window-attr-item-text route-window-attr-item-text-between' }))
        .append(this.$carNumber)
        .append($('<label>', { text: 'Исключение из простоя', class: 'route-window-attr-item-text route-window-attr-item-text-between' }))
        .append(this.$isExcluded)
        .append($('<label>', { text: 'Дата с',              class: 'route-window-attr-item-text route-window-attr-item-text-between' }))
        .append(this.$dateFrom)
        .append($('<label>', { text: 'по',                   class: 'route-window-attr-item-text route-window-attr-item-text-between' }))
        .append(this.$dateTo)
        .append($searchBtn)
        .append($clearBtn);

    return this.$el;
};

IdleControlFilter.prototype.getParams = function () {
    return {
        car_number:  this.$carNumber.val(),
        is_excluded: this.$isExcluded.val(),
        idle_reasons_id: this.$idleReasonSelect.val(),
        date_from:   this.$dateFrom.val(),
        date_to:     this.$dateTo.val()
    };
};

IdleControlFilter.prototype.clear = function () {
    this.$carNumber.val('');
    this.$isExcluded.val('');
    this.$idleReasonSelect.val('');
    this.$dateFrom.val('');
    this.$dateTo.val('');
};


/* ============================================================
   IdleControlTable
   ============================================================ */

function IdleControlTable(onRowClick) {
    this.onRowClick = onRowClick;
    this.$body      = null;
    this.rows       = [];
}

IdleControlTable.prototype.build = function () {
    var $table = $('<table>').addClass('route-table');

    $('<thead>').appendTo($table)
        .append(
            $('<tr>')
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Номер вагона').attr('rowspan', '2'))
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Дата создания').attr('rowspan', '2'))
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Кто создал').attr('rowspan', '2'))
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Исключение').attr('rowspan', '2'))
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Причины искл.из простоя').attr('rowspan', '2'))
                .append($('<th>').addClass('route-table-th fuel-stand-table-th').text('Примечание').attr('rowspan', '2'))
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

IdleControlTable.prototype._val = function (v) {
    return (v === null || v === undefined) ? '' : v;
};

IdleControlTable.prototype.addRow = function (item) {
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
    row.$isExcluded   = $('<td>').text(v(item.IS_EXCLUDED) === 'Y' ? 'Да' : 'Нет');
    row.$idleReasonsName         = $('<td>').text(v(item.IDLE_REASONS_NAME));
    row.$note         = $('<td>').text(v(item.NOTE));
    row.$startDate    = $('<td>').text(v(item.START_DATE));
    row.$endDate      = $('<td>').text(v(item.END_DATE));

    row.$tr.append(
        row.$carNumber, row.$creationDate, row.$createdName,
        row.$isExcluded, row.$idleReasonsName,
        row.$note,
        row.$startDate,  row.$endDate
    );

    row.$carNumber.on('click', function () {
        if (typeof self.onRowClick === 'function') { self.onRowClick(row); }
    });

    this.rows[row.pos] = row;
    return row;
};

IdleControlTable.prototype.updateRow = function (row, item) {
    var v = this._val.bind(this);
    row.data = item;
    row.$carNumber.text(v(item.CAR_NUMBER));
    row.$creationDate.text(v(item.CREATION_DATE));
    row.$createdName.text(v(item.CREATED_NAME));
    row.$isExcluded.text(v(item.IS_EXCLUDED) === 'Y' ? 'Да' : 'Нет');
    row.$idleReasonsName.text(v(item.IDLE_REASONS_NAME));
    row.$note.text(v(item.NOTE));
    row.$startDate.text(v(item.START_DATE));
    row.$endDate.text(v(item.END_DATE));
};

IdleControlTable.prototype.sync = function (freshList) {
    var self = this;

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
   IdleControlDialog
   ============================================================ */

function IdleControlDialog(api, dict, onSaved) {
    this.api     = api;
    this.dict    = dict;
    this.onSaved = onSaved;
}

IdleControlDialog.prototype.open = function (row) {
    var self    = this;
    var isNew   = (row === null || row === undefined);
    var rowData = isNew ? {} : row.data;
    var rowId   = isNew ? '' : rowData.ID_CONTROL;

    /* --- Поля формы --- */
    var $carNumber  = $('<input>', { class: 'text ui-widget-content ui-corner-all required' })
                        .css({ width: '10em' })
                        .attr('id_control', isNew ? '0' : rowId);
    var $isExcluded = $('<select>', { class: 'route-window-attr-item-elem required' }).css({ width: '10em' });
    var $idleReasonSelect = $('<select>', { class: 'route-window-attr-item-elem required' }).css({ width: '10em' });
    var $note       = $('<input>', { class: 'text ui-widget-content ui-corner-all' }).css({ width: '22em' });
    var $dateFrom   = $('<input>', { class: 'text ui-widget-content ui-corner-all required' }).css({ width: '7em' });
    var $dateTo     = $('<input>', { class: 'text ui-widget-content ui-corner-all' }).css({ width: '7em' });

    this.dict.fillIdleReasonSelect($idleReasonSelect, true);
    $isExcluded
        .append($('<option>', { val: '',  text: '' }))
        .append($('<option>', { val: 'Y', text: 'Да' }))
        .append($('<option>', { val: 'N', text: 'Нет' }));

    init_date_time_input_short($dateFrom);
    init_date_time_input_short($dateTo);

    /* --- Режим редактирования --- */
    if (!isNew) {
        $carNumber.val(rowData.CAR_NUMBER).prop('disabled', true).removeClass('required');
        $isExcluded.val(rowData.IS_EXCLUDED);
        $idleReasonSelect.val(rowData.IDLE_REASONS_ID);
        $note.val(rowData.NOTE);
        $dateFrom.val(rowData.START_DATE);
        $dateTo.val(rowData.END_DATE);
    }

    /* --- Компоновка --- */
    var $content = $('<div/>').addClass('md-lvl-1').attr('title', 'Контроль простоев').appendTo('body');

    $('<div>').addClass('route-window-attr').css({ width: '37em' })
        .append(self._row('Номер вагона',          $carNumber))
        .append(self._row('Исключение из простоя', $isExcluded))
        .append(self._row('Причины искл.из простоя', $idleReasonSelect))
        .append(self._row('Примечание',             $note))
        .append(self._row('Период контроля: с ',    $dateFrom, 'по ', $dateTo))
        .appendTo($content);

    /* --- Валидация --- */
    function validate() {
        if (isNew && $carNumber.val() === '') {
            create_info_modal_dialog_new('Оповещение', 'Не заполнено поле "Вагон"');
            return false;
        }
        if ($isExcluded.val() === '') {
            create_info_modal_dialog_new('Оповещение', 'Не заполнено поле "Исключение из простоя"');
            return false;
        }
        if ($dateFrom.val() === '') {
            create_info_modal_dialog_new('Оповещение', 'Не заполнено поле "Период контроля с"');
            return false;
        }
        return true;
    }

    /* --- Сбор параметров --- */
    function collectParams() {
        return {
            id_control:  $carNumber.attr('id_control'),
            car_number:  $carNumber.val(),
            is_excluded: $isExcluded.val(),
            idle_reasons_id: $idleReasonSelect.val(),
            note:        $note.val(),
            start_date:  $dateFrom.val(),
            end_date:    $dateTo.val()
        };
    }

    /* --- Обработка ответа --- */
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
                id:   'md_save_idle_control_btn',
                click: function () {
                    if (!validate()) { return; }
                    $('#md_save_idle_control_btn').prop('disabled', true);
                    var res = self.api.saveIdleControl(rowId, collectParams());
                    var ok  = handleResponse(res, isNew ? 'Запись создана!' : 'Запись обновлена!');
                    if (!ok) { $('#md_save_idle_control_btn').prop('disabled', false); }
                }
            },
            'Удалить': {
                text: 'Удалить',
                id:   'md_delete_idle_control_btn',
                click: function () {
                    $('#md_delete_idle_control_btn').prop('disabled', true);
                    var res = self.api.deleteIdleControl(rowId, { id_control: $carNumber.attr('id_control') });
                    var ok  = handleResponse(res, 'Запись удалена!');
                    if (!ok) { $('#md_delete_idle_control_btn').prop('disabled', false); }
                }
            },
            'Закрыть форму': {
                text: 'Закрыть форму',
                id:   'md_close_idle_control_btn',
                click: function () { $content.dialog('close'); }
            }
        },
        close: function () { $content.remove(); }
    });

    $('#md_save_idle_control_btn').prop('disabled', false);
};

IdleControlDialog.prototype._row = function (labelText, $field, label2, $field2) {
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
   ApiService — дополнительные методы для IdleControl
   Добавляем к уже существующему ApiService из control.js
   ============================================================ */

ApiService.prototype.getIdleControlList = function (params) {
    return this.postSync('get_idle_control_list', { params: JSON.stringify(params) });
};

ApiService.prototype.getIdleReasonList = function () {
    return this.postSync('get_idle_reason_list');
};

ApiService.prototype.saveIdleControl = function (rowId, params) {
    return this.postSync(
        'save_idle_control',
        { row_id: rowId, add_data: JSON.stringify(params) },
        false
    );
};

ApiService.prototype.deleteIdleControl = function (rowId, params) {
    return this.postSync(
        'delete_idle_control',
        { row_id: rowId, add_data: JSON.stringify(params) },
        false
    );
};


Dictionary.prototype.fillIdleReasonSelect = function ($select, addEmpty) {
    
    if (addEmpty) { $select.append($('<option>', { val: '', text: '' })); }
    this.idleReason.forEach(function (item) {
        $select.append(
            $('<option>').text(item.NAME).val(item.ID)
        );
    });
};



/* ============================================================
   IdleControlApp — точка входа, вкладка #tabs-6
   ============================================================ */

function IdleControlApp() {
    this.api    = new ApiService('../data.php');
    this.dict   = new Dictionary('../data.php');
    this.filter = null;
    this.table  = null;
    this.dialog = null;
}

IdleControlApp.prototype.init = function () {
    var self = this;
    this._load();  
    this._buildUI();    
    this.refresh();
};

IdleControlApp.prototype._load = function () {
    this.dict.idleReason = this.api.getIdleReasonList();
}

IdleControlApp.prototype._buildUI = function () {
    
    var freshList = this.api.getIdleControlList(params);
    
}
IdleControlApp.prototype._buildUI = function () {
    var self = this;
    var $tab = $('#tabs-6');

    var $section = $('<div>')
        .addClass('section')
        .css({ width: 'auto', float: 'none', height: '90vh' })
        .appendTo($tab);

    /* Кнопка "Добавить" */
    $('<button>').addClass('button')
        .css({ 'margin-left': '0.5em', 'margin-right': '0.5em', 'margin-top': '0.5em' })
        .append($('<span>').addClass('button-text button-text-size-3').text('Добавить запись'))
        .appendTo($section)
        .on('click', function () { self.dialog.open(null); });

    /* Фильтр */
    this.filter = new IdleControlFilter(function () { self.refresh(); });
    $section.append(this.filter.build());

    /* Таблица */
    this.table = new IdleControlTable(function (row) { self.dialog.open(row); });
    $section.append(this.table.build());

    /* Диалог */
    this.dialog = new IdleControlDialog(this.api, this.dict, function () { self.refresh(); });
};

IdleControlApp.prototype.refresh = function () {
    var params    = this.filter ? this.filter.getParams() : {};
    var freshList = this.api.getIdleControlList(params);
    if (freshList) {
        this.table.sync(freshList);
    }
};

/* --- Запуск --- */
$(document).ready(function () {
    var app = new IdleControlApp();
    app.init();
});