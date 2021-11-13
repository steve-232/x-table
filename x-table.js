"use strict";

class Xtable {
    constructor(args, {
        headers = [],
        items = [],
        rowsPerPage = 10,
        search = true
    } = args) {
        this.rows = [];
        this.searchResults = [];
        this.el = args.el;
        this.el.classList.add("x-table");
        this.table = document.createElement("table");
        this.table.classList.add("x-table__table");
        this.headers = headers;
        this.createAndInsertHeaders();
        this.rowsPerPage = rowsPerPage;
        this.itemsDefaultOrder = [ ...items ];
        this.items = [ ...items ];
        this.createAndInsertRows();
        const tableWrapper = document.createElement("div");
        tableWrapper.classList.add("x-table__inner-table-wrapper");
        tableWrapper.appendChild(this.table);
        this.el.appendChild(tableWrapper);
        if (this.rowsPerPage > 0) {
            tableWrapper.style.height = window.getComputedStyle(this.table).getPropertyValue("height");
            this.createAndInsertPagination();
        }
        this.search = search;
        if (this.search) this.createAndInsertSearchForm();
    }
    createAndInsertHeaders() {
        const row = document.createElement("tr");
        const sortIconsBucket = [];
        this.headers.forEach((header, i) => {
            const headerCell = document.createElement("th");
            headerCell.dataset.index = String(i);
            headerCell.textContent = typeof header === "object" ? header.text : header;
            if (typeof header === "object" && header.sortable) {
                const sortIcon = document.createElement("span");
                sortIcon.classList.add("x-table__sort-icon", "x-table__sort-icon--ascending");
                sortIcon.textContent = "«";
                headerCell.appendChild(sortIcon);
                sortIconsBucket.push(sortIcon);
                headerCell.dataset.order = "ascending";
                headerCell.classList.add("x-table--clickable");
                headerCell.addEventListener("click", e => {
                    var _a;
                    if (!((_a = this.itemsPrevOrder) === null || _a === void 0 ? void 0 : _a.length)) {
                        const t = e.target;
                        const order = t.dataset.order;
                        sortIconsBucket.forEach(sortIconSibling => {
                            if (sortIconSibling !== sortIcon) {
                                sortIconSibling.classList.remove("x-table--show");
                                if (sortIconSibling.parentElement) sortIconSibling.parentElement.dataset.order = "ascending";
                            }
                        });
                        if (order === "ascending" || order === "descending") {
                            this.items = this.sortData({
                                data: this.items,
                                dataIndex: Number(t.dataset.index),
                                order: order
                            });
                        } else {
                            this.items = this.itemsDefaultOrder;
                        }
                        this.updateUi(this.items);
                        sortIcon.classList.add("x-table--show");
                        if (order === "ascending") {
                            sortIcon.classList.remove("x-table__sort-icon--descending");
                            sortIcon.classList.add("x-table__sort-icon--ascending");
                            t.dataset.order = "descending";
                        } else if (order === "descending") {
                            sortIcon.classList.remove("x-table__sort-icon--ascending");
                            sortIcon.classList.add("x-table__sort-icon--descending");
                            t.dataset.order = "default";
                        } else if (order === "default") {
                            sortIcon.classList.remove("x-table__sort-icon--descending", "x-table--show");
                            sortIcon.classList.add("x-table__sort-icon--ascending");
                            t.dataset.order = "ascending";
                        }
                    }
                });
            }
            row.appendChild(headerCell);
        });
        this.table.appendChild(row);
    }
    createAndInsertRows() {
        let numberOfRows = this.rowsPerPage;
        if (this.rowsPerPage < 1) numberOfRows = this.items.length;
        for (let i = 0; i < numberOfRows; i += 1) {
            const row = document.createElement("tr");
            const values = this.items[i];
            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
            this.rows.push(row);
            this.table.appendChild(row);
        }
    }
    createAndInsertSearchForm() {
        const form = document.createElement("form");
        form.classList.add("x-table__search-form");
        const inputField = document.createElement("input");
        inputField.classList.add("x-table__search-form-input");
        inputField.type = "search";
        inputField.placeholder = "keyword";
        const submitBtn = document.createElement("button");
        submitBtn.classList.add("x-table__search-form-btn");
        submitBtn.type = "submit";
        submitBtn.textContent = "Search";
        const searchResults = document.createElement("span");
        searchResults.classList.add("x-table__search-form-result");
        searchResults.classList.add("x-table--hide");
        form.appendChild(inputField);
        form.appendChild(submitBtn);
        form.appendChild(searchResults);
        form.addEventListener("submit", e => {
            e.preventDefault();
            const keyword = inputField.value;
            this.itemsPrevOrder = [ ...this.items ];
            const results = this.items.filter(item => {
                const data = item.join("").toLowerCase();
                return data.includes(keyword);
            });
            this.items = [ ...results ];
            searchResults.classList.remove("x-table--hide");
            searchResults.textContent = `Number of results: ${results.length}`;
            this.table.querySelectorAll("th.x-table--clickable").forEach(header => header.classList.add("x-table--not-clickable"));
            this.updateUi(results);
            if (this.rowsPerPage) this.createAndInsertPagination(true);
        });
        inputField.addEventListener("input", () => {
            var _a;
            if (!inputField.value.length) {
                searchResults.classList.add("x-table--hide");
                searchResults.textContent = "";
                if ((_a = this.itemsPrevOrder) === null || _a === void 0 ? void 0 : _a.length) this.items = this.itemsPrevOrder;
                this.itemsPrevOrder = [];
                this.table.querySelectorAll("th.x-table--not-clickable").forEach(header => header.classList.remove("x-table--not-clickable"));
                this.updateUi(this.items);
                if (this.rowsPerPage) this.createAndInsertPagination(true);
            }
        });
        this.el.insertBefore(form, this.el.children[0]);
    }
    createAndInsertPagination(clean = false) {
        var _a;
        if (clean) (_a = this.el.querySelector(".x-table__pagination")) === null || _a === void 0 ? void 0 : _a.remove();
        const paginationList = document.createElement("ul");
        const numberOfPages = Math.ceil(this.items.length / this.rowsPerPage);
        const paginationListItems = [];
        let prevActivePage;
        paginationList.classList.add("x-table__pagination");
        for (let i = 0; i < numberOfPages; i += 1) {
            const paginationListItem = document.createElement("li");
            paginationListItem.classList.add("x-table__pagination-item");
            paginationListItem.dataset.index = String(i);
            paginationListItem.textContent = `${i + 1}`;
            paginationListItems.push(paginationListItem);
            if (i === 0) {
                paginationListItem.classList.add("x-table__pagination--active");
                prevActivePage = paginationListItem;
            }
            paginationList.appendChild(paginationListItem);
        }
        paginationListItems.forEach(paginationListItem => {
            paginationListItem.addEventListener("click", e => {
                const target = e.target;
                if (prevActivePage) prevActivePage.classList.remove("x-table__pagination--active");
                target.classList.add("x-table__pagination--active");
                prevActivePage = target;
                const pageNumber = Number(paginationListItem.dataset.index);
                this.updateUi(this.items.slice(this.rowsPerPage * pageNumber, this.rowsPerPage * pageNumber + this.rowsPerPage));
            });
        });
        this.el.appendChild(paginationList);
    }
    updateUi(data) {
        this.rows.forEach((row, rowIndex) => {
            const cells = Array.from(row.querySelectorAll("td"));
            cells.forEach((cell, cellIndex) => {
                var _a;
                const theCell = cell;
                if ((_a = data === null || data === void 0 ? void 0 : data[rowIndex]) === null || _a === void 0 ? void 0 : _a[cellIndex]) {
                    theCell.textContent = data[rowIndex][cellIndex];
                    theCell.hidden = false;
                } else {
                    theCell.textContent = "";
                    theCell.hidden = true;
                }
            });
        });
    }
    sortData(args, {
        data = [],
        dataIndex = 0,
        order = "ascending"
    } = args) {
        let sortedArray = [ ...data ];
        sortedArray = sortedArray.sort((a, b) => {
            const itemA = a[dataIndex].toLowerCase();
            const itemB = b[dataIndex].toLowerCase();
            if (order === "ascending") {
                if (itemA < itemB) return -1;
                if (itemA > itemB) return 1;
            } else {
                if (itemA < itemB) return 1;
                if (itemA > itemB) return -1;
            }
            return 0;
        });
        return sortedArray;
    }
}