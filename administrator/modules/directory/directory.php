<?php

global $user;
global $pwd;
global $db;

// Функция для построения дерева
function getTree($parentId, $catalogs)
{
    $html = '<ul>';
    foreach ($catalogs as $catalog) {
        if ($catalog['PARENT_ID'] == $parentId) {
            $icon = ($catalog['IS_FOLDER'] == 'Y') ? '🗂️' : '📋';
            $hasChildren = ($catalog['IS_FOLDER'] == 'Y') ? "has-children" : "";

            $html .= "<li data-id='{$catalog['OBJECT_ID']}' class='tree-item {$hasChildren}'>";
            $html .= "{$icon} {$catalog['OBJECT_NAME']}";

            if ($catalog['IS_FOLDER'] == 'Y') {
                $html .= "<span class='toggle'>[+]</span>";
                $html .= getTree($catalog['OBJECT_ID'], $catalogs);
            }

            $html .= "</li>";
        }
    }
    $html .= '</ul>';
    return $html;
}

// Список каталог (справочников)
function get_list_catalog()
{
    global $user;
    global $pwd;
    global $db;

    $conn = oci_connect($user, $pwd, $db, "AL32UTF8");
    if (!$conn) {
        $e = oci_error();
        trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
    }

    $catalog = array();
    $oci_child = oci_parse($conn, 'SELECT x.* FROM TABLE (xx_dislocation.get_list_catalog ()) x');
    oci_execute($oci_child);
    while ($tmp = oci_fetch_array($oci_child, OCI_ASSOC + OCI_RETURN_NULLS)) {
        array_push($catalog, $tmp);
    }
    oci_close($conn);

    return $catalog;
}

$catalogs = get_list_catalog();
// Получаем дерево
$treeHtml = getTree(0, $catalogs);
?>

<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Справочники</title>
</head>

<body>
    <div id="modal" class="modal">
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>Редактировать запись</h2>
            <form id="editForm">
                <div id="formFields" class="form-fields"></div>
                <button type="button" id="saveButton" class="btn-save">Сохранить</button>
            </form>
        </div>
    </div>

    <div class="container">
        <div class="tree">
            <h3>Справочники</h3>
            <?php echo $treeHtml; ?>
        </div>
        <div class="content" id="content">
            <h3 class="caption-catalog">Данные справочника</h3>
            <button id="addRecordButton" hidden class="btn-add-record">Добавить запись</button>
            <div id="attributes-container"></div>
            <table id="records-table">
                <thead>
                    <tr id="table-header"></tr>
                </thead>
                <tbody id="table-body"></tbody>
            </table>
            <div id="loading-indicator" class="loading-hidden">
                <img src="../../../img/loading.gif" alt="Загрузка...">
            </div>
        </div>
    </div>


    <script>
        function showLoading() {
            const loadingIndicator = document.getElementById('loading-indicator');
            loadingIndicator.classList.remove('loading-hidden');
            loadingIndicator.classList.add('loading-visible');
        }

        function hideLoading() {
            const loadingIndicator = document.getElementById('loading-indicator');
            loadingIndicator.classList.remove('loading-visible');
            loadingIndicator.classList.add('loading-hidden');
        }
        var container, tableHeader, tableBody, recordsData, attributesData, divContent;
        function isEmpty(value) {
            // Проверяет, является ли значение пустым, null или undefined
            return value === null || value === undefined || value === "";
        }
        function get_msg_result(data) {
            if (!data.success) {
                const details = data.details ? data.details : '';
                alert('Ошибка: ' 
                        + data.error 
                        + (details ? ' ' + details : '')
                    ); 
            } 
        }
        function updateRecordData(recData, objData) {
            objData.forEach(obj => {
                const { ObjectID: objectId, recordIndex, Data: updates } = obj; // Деструктурируем необходимые поля
                // Получаем массив записей для данного objectId
                const records = recData[objectId];
                if (records) {
                    const recordToUpdate = findRecordByIndex(records, Number(recordIndex));
                    console.log(recordToUpdate);
                    if (recordToUpdate) {
                        updateFields(recordToUpdate, updates);
                    }
                }
            });
        }

        // Вспомогательная функция для поиска записи по индексу
        function findRecordByIndex(records, recordIndex) {
            return records.find(record => record.index === recordIndex);
        }

        // Вспомогательная функция для обновления полей записи
        function updateFields(record, updates) {
            updates.forEach(update => {
                const { fieldID, value } = update; // Деструктурируем поле и его новое значение
                if (record.hasOwnProperty(fieldID)) {
                    
                    record[fieldID] = value; // Обновляем значение поля
                }
            });
            //console.log(record);
        }

        function updateTableRow(objectId, objectData) {
            updateRecordData(recordsData, objectData);

            const row = document.querySelector('tr[data-object-id="'+objectData[0].ObjectID+'"][data-record-index="'+objectData[0].recordIndex+'"]');
            if (row) {
                // Пройдемся по всем атрибутам, которые нужно обновить
                objectData[0].Data.forEach(dataItem => {
                    // Находим ячейку для данного атрибута
                    //console.log(dataItem);
                    const cell = row.querySelector('td[data-attribute-code="'+dataItem.fieldID+'"]');
                    if (cell) {
                        if (dataItem.value === dataItem.valueText){
                            // Обновляем содержимое ячейки
                            cell.textContent = dataItem.value;
                        }else {
                            cell.textContent = dataItem.valueText;
                        }
                        
                    }
                });
            }
        }
        function get_source_for_column(objectId, attributeID, objectValue){
            showLoading();
            var select = document.createElement('select');;
            var option = document.createElement('option');
            var paramData = {};
                paramData.attributeID = attributeID;
                //console.log(JSON.stringify(paramData));
                option.value = '';
                option.text = '-- Выберите значение --';
                select.appendChild(option);
                fetch("'../../modules/directory/ajax_handler.php", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ajax_action: 'get_source_for_column',
                        objectId: objectId,
                        paramData: JSON.stringify(paramData)
                    })
                })
                .then(response => response.json())
                .then(data => {
                    //console.log(data);
                    if (data.success) {
                        var option = document.createElement('option');
                        data.result.forEach(item => {
                            option = document.createElement('option');
                            option.value = item.ID;
                            option.text = item.NAME;
                            if (objectValue === option.value){
                                option.selected = true;
                            }
                            select.appendChild(option);
                        });
                        hideLoading();
                    } else {
                        hideLoading();
                        alert('Ошибка получения данных: ' + data.error + data.details);
                    }
                    
                })
                .catch(error => {
                    hideLoading();
                    alert('Ошибка запроса:'+ error);
                });
            return select;
        }
        function sendUpdatedDataToServer(objectId, objectData, mode) {
            showLoading();
            fetch("'../../modules/directory/ajax_handler.php", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ajax_action: 'saveCatalogData',
                        objectId: objectId,
                        paramData: JSON.stringify(objectData),
                    })
                })
                .then(response => response.json())
                .then(data => {
                    //console.log(data);
                    if (data.success) {
                        // Закрываем модальное окно
                        modal.style.display = 'none';
                        modal.classList.remove('open');
                        // Обновляем строки в таблице
                        if (mode === 'new'){
                            displayAttributes(objectId);
                        } else{
                            updateTableRow(objectId, objectData); 
                        }
                        hideLoading();
                        return true; 
                    } else {
                        get_msg_result(data);
                        hideLoading();
                        return false; 
                    }
                    
                })
                .catch(error => {
                    hideLoading();
                    alert('Ошибка запроса:'+ error);
                });

        }
        
        // Список каталог(справочников)
        function fetchCatalog() {
            var catalog;
            fetch("'../../modules/directory/ajax_handler.php", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ajax_action: 'get_list_catalog'
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const catalog = data.catalog;
                    } else {
                        alert('Ошибка получения данных: ' + data.error + data.details);
                    }
                })
                .catch(error => {
                    alert('Ошибка запроса:'+ error);
                });
            return catalog;
        }
        function filterTable(objectId, attributeID, searchValue) {
            // Получаем таблицу и все строки
            const table = document.querySelector('#records-table');  // Таблица по ID объекта
            const rows = Array.from(table.querySelectorAll('tr'));  // Преобразуем NodeList в массив

            // Преобразуем значение поиска в нижний регистр для нечувствительности к регистру
            const lowerSearchValue = searchValue.toLowerCase();

            rows.forEach(row => {
                // Ищем ячейку с нужным атрибутом
                const cell = row.querySelector(`td[data-attribute-id="${attributeID}"]`);
                if (cell) {
                    // Если ячейка содержит <input>, получаем его значение
                    const cellText = cell.querySelector('input') 
                        ? cell.querySelector('input').value.trim().toLowerCase()  // Получаем значение из input
                        : cell.textContent.trim().toLowerCase();  // Получаем текстовое содержимое ячейки

                    // Сравниваем значение ячейки с поисковым значением
                    if (cellText.includes(lowerSearchValue)) {
                        row.style.display = '';  // Показываем строку, если текст совпадает с поисковым
                    } else {
                        row.style.display = 'none';  // Скрываем строку, если текст не совпадает
                    }
                }
            });
        }
        
        // Атрибуты по выбранному каталогу
        function fetchAttributes(objectId) {
            showLoading();
            fetch("'../../modules/directory/ajax_handler.php", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ajax_action: 'get_list_attributes',
                        objectId: objectId
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        
                        //console.log(data);
                        attributesData = data.attributesData;
                        recordsData = data.recordsData;
                        const searchRow = document.createElement('tr'); // Создаем строку для полей поиска
                        searchRow.classList.add('search-row'); // Добавляем класс search-row
                        // Создаем заголовки таблицы из атрибутов
                        //console.log(attributesData);
                        //console.log(recordsData);
                        if (attributesData[objectId]) {
                            attributesData[objectId].forEach(attribute => {
                                if (attribute.IS_DISPLAY_ON_LIST == 1) {
                                    const th = document.createElement('th');
                                    th.textContent = attribute.ATTRIBUTE_NAME;
                                    tableHeader.appendChild(th);

                                    // Если атрибут поддерживает поиск, добавляем поле поиска
                                    const searchCell = document.createElement('td');
                                    if (attribute.IS_SEARCH === '1') {
                                        const input = document.createElement('input');
                                        const attributeID = attribute.ATTRIBUTE_ID;
                                        input.type = 'text';
                                        input.placeholder = attribute.ATTRIBUTE_NAME;
                                        input.dataset.attributeCode = attribute.ATTRIBUTE_CODE;
                                        
                                        input.addEventListener('input', (event) => {
                                            const searchValue = event.target.value; // значение из input
                                            filterTable(objectId, attributeID, searchValue); // Передаем в filterTable
                                        });
                                        searchCell.appendChild(input);
                                    }
                                    searchRow.appendChild(searchCell);
                                }
                            });
                            tableBody.appendChild(searchRow); // Добавляем строку поиска под заголовки таблицы

                            // Заполняем таблицу данными из recordsData
                            if (recordsData[objectId]) {
                                
                                recordsData[objectId] = recordsData[objectId].map((record, index) => {
                                    return Object.assign({}, record, { index: index }); // Копируем все свойства и добавляем индекс
                                });
                                recordsData[objectId].forEach((record, index) => {
                                    const tr = document.createElement('tr');
                                    tr.dataset.objectId = objectId;
                                    tr.dataset.recordIndex = index; // Сохраняем индекс записи для доступа 

                                    attributesData[objectId].forEach(attribute => {
                                        if (attribute.IS_DISPLAY_ON_LIST == 1) {
                                            const td = document.createElement('td');
                                            var tbl_column = attribute.ATTRIBUTE_CODE;
                                            if (!isEmpty(attribute.LOOKUP_VALUE_COLUMN)){
                                                tbl_column = tbl_column+'_'+attribute.LOOKUP_VALUE_COLUMN;
                                            }
                                            //console.log(tbl_column);
                                            td.textContent = record[tbl_column];
                                            td.dataset.attributeCode = attribute.ATTRIBUTE_CODE;
                                            td.dataset.attributeId = attribute.ATTRIBUTE_ID;
                                            tr.appendChild(td);
                                        }
                                    });
                                    tableBody.appendChild(tr);
                                });
                            } else {
                                container.textContent = 'Нет данных для выбранного справочника.';
                            }
                        } else {
                            container.textContent = 'Нет атрибутов для выбранного справочника.';
                        }
                        hideLoading();
                    } else {
                        hideLoading();
                        alert('Ошибка получения данных: ' + data.error + data.details);
                    }
                })
                .catch(error => {
                    hideLoading();
                    alert('Ошибка запроса:'+error);
                });
        }

        function displayAttributes(objectId) {
            //console.log('Выбранный объект ID:', objectId); // Для отладки
            divContent = document.getElementById('content');
            container = document.getElementById("attributes-container");
            container.innerHTML = ''; // Очищаем контейнер

            tableHeader = document.getElementById("table-header");
            tableHeader.innerHTML = ''; // Очищаем заголовки таблицы
            tableBody = document.getElementById("table-body");
            tableBody.innerHTML = ''; // Очищаем данные таблицы

            // Проверяем, является ли объект справочником (IS_FOLDER = 'N')
            const selectedCatalog = <?php echo json_encode($catalogs); ?>.find(catalog => catalog.OBJECT_ID == objectId);

            if (selectedCatalog && selectedCatalog.IS_FOLDER === 'N') {
                const title = 'Данные справочника "'+selectedCatalog.OBJECT_NAME+'"';
                divContent.querySelector('h3').textContent = title; // Устанавливаем правильный заголовок
                
                const objectId = selectedCatalog.OBJECT_ID; // Или другой идентификатор
                fetchAttributes(objectId);
                document.getElementById('addRecordButton').style.display = 'block';
            } else {
                document.getElementById('addRecordButton').style.display = 'none';
            }
        }

        Array.from(document.querySelectorAll('.tree-item.has-children')).forEach(item => {
            const toggle = item.querySelector('.toggle');
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                item.classList.toggle('open');
                toggle.textContent = item.classList.contains('open') ? '[-]' : '[+]';
            });
        });

        // Обработка выбора элемента
        Array.from(document.querySelectorAll('.tree-item')).forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                // Удаляем класс selected у других элементов
                Array.from(document.querySelectorAll('.tree-item.selected')).forEach(
                    el => el.classList.remove('selected')
                );
                // Добавляем класс selected к текущему элементу
                item.classList.add('selected');
                const objectId = item.dataset.id;
                displayAttributes(objectId);
            });
        });


        document.addEventListener('DOMContentLoaded', () => {
            const modal = document.getElementById('modal');
            const closeModal = modal.querySelector('.close-button');
            const formFields = document.getElementById('form-fields');
            const saveButton = document.getElementById('saveButton');

            // Открытие модального окна
            function openModal(record, attributes, objectID, mode = 'edit', recIndex) {
                const modal = document.getElementById('modal');
                const formFields = document.getElementById('formFields');
                modal.setAttribute('data-id', objectID); // Устанавливаем data-id
                modal.setAttribute('mode', mode); // Устанавливаем data-id
                modal.setAttribute('record-index', recIndex); // Устанавливаем recIndex

                formFields.innerHTML = ''; // Очищаем форму

                attributes.forEach(attribute => {
                    //console.log(attribute)
                    // Проверяем, что атрибут видимый
                    if (attribute.IS_VISIBLE === "1") {
                        const fieldWrapper = document.createElement('div');
                        const label = document.createElement('label');
                        const input = document.createElement('input');
                        var select = document.createElement('select');
                        var isSourceColumn = false;

                        label.textContent = attribute.ATTRIBUTE_NAME;

                        // Устанавливаем тип поля в зависимости от типа данных
                        input.type = attribute.DATA_TYPE === 'NUMBER' ? 'number' : 'text';
                        input.name = attribute.ATTRIBUTE_CODE;
                        if  (attribute.DATA_TYPE === 'DATETIME'){
                            init_date_time_input($(input));
                        }
                        else if  (attribute.DATA_TYPE === 'DATE'){
                            init_date_time_input_short($(input));
                        }
                        
                        input.value = record[attribute.ATTRIBUTE_CODE] || '';
                        if (!isEmpty(attribute.LOOKUP_TABLE_NAME)){
                            select = get_source_for_column (objectID, attribute.ATTRIBUTE_ID, input.value );
                            select.name = attribute.ATTRIBUTE_CODE;
                            isSourceColumn = true;
                            
                            
                        }

                        // Проверяем, можно ли редактировать поле
                        if (attribute.IS_EDITABLE === "0") {
                            input.disabled = true;
                            select.disabled = true;   
                        }
                        // Если атрибут обязательный, добавляем атрибут 'required'
                        if (attribute.IS_REQUIRED === "1") {
                            input.required = true;
                            select.required = true;
                        }

                        fieldWrapper.appendChild(label);
                        if (isSourceColumn){
                            fieldWrapper.appendChild(select);
                        } else {
                            fieldWrapper.appendChild(input);
                        }
                        
                        formFields.appendChild(fieldWrapper);
                    }
                });
                const title = mode === 'new' ? 'Новая запись' : 'Редактировать запись';
                modal.querySelector('h2').textContent = title; // Устанавливаем правильный заголовок
                modal.style.display = 'flex'; // Показываем модальное окно
            }
            // Проверяем, что .tree-item.selected существует
            document.getElementById('addRecordButton').addEventListener('click', () => {
                const selectedObject = document.querySelector('.tree-item.selected');
                const selectedObjectId = attributesData && selectedObject ? selectedObject.dataset.id : undefined;

                if (selectedObjectId && attributesData[selectedObjectId]) {
                    const attributes = attributesData[selectedObjectId];
                    const recordData = [];
                    openModal(recordData, attributes, selectedObjectId, 'new', -1); // Открываем модальное окно для новой записи
                } else {
                    alert('Пожалуйста, выберите объект "Справочник" ');
                }
            });

            // Закрытие модального окна
            const closeButton = document.querySelector('.close-button');
            closeButton.addEventListener('click', () => {
                document.getElementById('modal').style.display = 'none';
            });

            document.addEventListener('click', (event) => {
                const modal = document.getElementById('modal');
                if (event.target === modal) {
                    modal.style.display = 'none'; // Закрываем окно, если кликнули на фон
                }
            });

            // Сохранение изменений
            document.getElementById('saveButton').addEventListener('click', () => {
                const modal = document.getElementById('modal');
                const updatedRecords = []; // Теперь это будет массив объектов с данными по ObjectID

                // Получаем ID из атрибута data-id модального окна (для "Выбранного объекта ID")
                const selectedObjectId = modal.getAttribute('data-id');
                const mode = modal.getAttribute('mode');
                const recordIndex = modal.getAttribute('record-index');
                // Если "Выбранный объект ID" существует, создаём объект для него
                if (selectedObjectId) {
                    // Инициализируем объект для этого ObjectID с массивом данных (Data)
                    const recordData = {
                        ObjectID: selectedObjectId,
                        recordIndex: recordIndex,
                        Mode:mode,
                        Data: [] // Это массив с полями, которые будут добавляться
                    };

                    // Проходим по всем полям формы в модальном окне
                    var allRequiredFieldsFilled = true;
                    const formFields = modal.querySelectorAll('input, select, textarea'); // Получаем все элементы формы
                    //console.log(formFields);
                    const formFieldsArray = Array.from(formFields);
                    formFieldsArray.forEach(field => {
                        const fieldName = field.name; // Получаем имя поля
                        const fieldValue = field.value; // Получаем значение поля
                        var fieldText = null; // Получаем значение поля
                        if (field.required && !field.value.trim()) {
                            allRequiredFieldsFilled = false;
                            field.style.borderColor = 'red'; // Выделяем незаполненные поля
                        } else {
                            field.style.borderColor = ''; // Сбрасываем стиль
                        }
                        if (field.tagName === 'SELECT') {
                            // Для select добавляем текст выбранной опции
                            const selectedOption = field.options[field.selectedIndex];
                            fieldText = selectedOption ? selectedOption.textContent : null;
                        } else {
                            // Для других полей текст равен значению
                            fieldText = fieldValue;
                        }
                        // Добавляем в массив, если поле имеет имя (name)
                        if (fieldName) {

                            recordData.Data.push({
                                fieldID: fieldName, // Код атрибута (name)
                                value: fieldValue, // Значение атрибута
                                valueText: fieldText // Значение атрибута Text
                            });
                        }
                    });
                    if (!allRequiredFieldsFilled) {
                        alert('Пожалуйста, заполните все обязательные поля.');
                        return; // Не сохраняем, если не все обязательные поля заполнены
                    }
                    // Добавляем объект с данными в массив
                    updatedRecords.push(recordData);
                }

                //console.log('Сохранённые данные:', updatedRecords);

                // отправка данных на сервер
                var result = sendUpdatedDataToServer(selectedObjectId, updatedRecords, mode);
                
            });

            document.querySelector('.close-button').addEventListener('click', () => {
                const modal = document.getElementById('modal');
                modal.style.display = 'none';
                modal.classList.remove('open');
            });

            // Обработчик клика по строкам таблицы
            document.getElementById('table-body').addEventListener('click', (event) => {
                const row = event.target.closest('tr');
                if (row && !row.classList.contains('search-row')) {
                    const objectId = row.dataset.objectId; // ID справочника
                    const recordIndex = row.dataset.recordIndex; // Индекс записи
                    const record = recordsData[objectId][recordIndex];
                    const attributes = attributesData[objectId];
                    openModal(record, attributes, objectId, 'edit', recordIndex); // Открываем модальное окно с данными записи
                }
            });
        });
    </script>

</body>

</html>