class CatalogManager {
    constructor() {
        this.container = document.getElementById("attributes-container");
        this.tableHeader = document.getElementById("table-header");
        this.tableBody = document.getElementById("table-body");
        this.divContent = document.getElementById("content");
        this.modal = document.getElementById("modal");
        this.recordsData = {};
        this.attributesData = {};

        this.initEventListeners();
    }

    async fetchCatalog() {
        try {
            const response = await fetch("../../modules/directory/ajax_handler.php", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ajax_action: 'get_list_catalog' })
            });
            const data = await response.json();
            if (data.success) {
                return data.catalog;
            } else {
                throw new Error(data.error || "Ошибка получения данных каталога");
            }
        } catch (error) {
            console.error("Ошибка запроса каталога:", error);
        }
    }

    async fetchAttributes(objectId) {
        try {
            const response = await fetch("../../modules/directory/ajax_handler.php", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ajax_action: 'get_list_attributes', objectId })
            });
            const data = await response.json();
            if (data.success) {
                this.attributesData[objectId] = data.attributesData;
                this.recordsData[objectId] = data.recordsData;
                this.renderAttributes(objectId);
            } else {
                throw new Error(data.error || "Ошибка получения данных атрибутов");
            }
        } catch (error) {
            console.error("Ошибка запроса атрибутов:", error);
        }
    }

    renderAttributes(objectId) {
        this.clearTable();
        const attributes = this.attributesData[objectId];
        const records = this.recordsData[objectId];

        if (!attributes || !records) {
            this.container.textContent = "Нет данных для выбранного справочника.";
            return;
        }

        const searchRow = document.createElement("tr");
        searchRow.classList.add("search-row");

        attributes.forEach(attribute => {
            if (attribute.IS_DISPLAY_ON_LIST == 1) {
                const th = document.createElement("th");
                th.textContent = attribute.ATTRIBUTE_NAME;
                this.tableHeader.appendChild(th);

                const searchCell = document.createElement("td");
                if (attribute.IS_SEARCH === "1") {
                    const input = document.createElement("input");
                    input.type = "text";
                    input.placeholder = attribute.ATTRIBUTE_NAME;
                    input.dataset.attributeCode = attribute.ATTRIBUTE_CODE;
                    input.addEventListener("input", () => this.filterTable(objectId));
                    searchCell.appendChild(input);
                }
                searchRow.appendChild(searchCell);
            }
        });

        this.tableBody.appendChild(searchRow);

        records.forEach((record, index) => {
            const tr = document.createElement("tr");
            tr.dataset.objectId = objectId;
            tr.dataset.recordIndex = index;

            attributes.forEach(attribute => {
                if (attribute.IS_DISPLAY_ON_LIST == 1) {
                    const td = document.createElement("td");
                    td.textContent = record[attribute.ATTRIBUTE_CODE];
                    tr.appendChild(td);
                }
            });

            this.tableBody.appendChild(tr);
        });
    }

    clearTable() {
        this.tableHeader.innerHTML = "";
        this.tableBody.innerHTML = "";
    }

    displayAttributes(objectId) {
        this.clearTable();
        const selectedCatalog = JSON.parse('<?php echo json_encode($catalogs); ?>').find(
            catalog => catalog.OBJECT_ID == objectId
        );

        if (selectedCatalog && selectedCatalog.IS_FOLDER === "N") {
            this.divContent.querySelector("h3").textContent = `Данные справочника "${selectedCatalog.OBJECT_NAME}"`;
            this.fetchAttributes(objectId);
            document.getElementById("addRecordButton").style.display = "block";
        } else {
            document.getElementById("addRecordButton").style.display = "none";
        }
    }

    openModal(record, attributes, objectId, mode = "edit") {
        const formFields = document.getElementById("formFields");
        formFields.innerHTML = "";
        this.modal.setAttribute("data-id", objectId);
        this.modal.setAttribute("mode", mode);

        attributes.forEach(attribute => {
            if (attribute.IS_VISIBLE === "1") {
                const fieldWrapper = document.createElement("div");
                const label = document.createElement("label");
                const input = document.createElement("input");

                label.textContent = attribute.ATTRIBUTE_NAME;
                input.type = attribute.DATA_TYPE === "NUMBER" ? "number" :
                            attribute.DATA_TYPE === "DATE" ? "date" : "text";
                input.name = attribute.ATTRIBUTE_CODE;
                input.value = record[attribute.ATTRIBUTE_CODE] || "";

                if (attribute.IS_EDITABLE === "0") {
                    input.disabled = true;
                }
                if (attribute.IS_REQUIRED === "1") {
                    input.required = true;
                }

                fieldWrapper.appendChild(label);
                fieldWrapper.appendChild(input);
                formFields.appendChild(fieldWrapper);
            }
        });

        this.modal.style.display = "flex";
        this.modal.querySelector("h2").textContent = mode === "new" ? "Новая запись" : "Редактировать запись";
    }

    initEventListeners() {
        document.getElementById("addRecordButton").addEventListener("click", () => {
            const selectedObject = document.querySelector(".tree-item.selected");
            if (selectedObject) {
                const objectId = selectedObject.dataset.id;
                const attributes = this.attributesData[objectId] || [];
                this.openModal({}, attributes, objectId, "new");
            } else {
                alert('Пожалуйста, выберите справочник.');
            }
        });

        document.querySelector(".close-button").addEventListener("click", () => {
            this.modal.style.display = "none";
        });

        document.getElementById("table-body").addEventListener("click", (event) => {
            const row = event.target.closest("tr");
            if (row) {
                const objectId = row.dataset.objectId;
                const recordIndex = row.dataset.recordIndex;
                const record = this.recordsData[objectId][recordIndex];
                const attributes = this.attributesData[objectId];
                this.openModal(record, attributes, objectId);
            }
        });
    }
}
