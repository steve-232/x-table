/* eslint-disable max-len */
interface TableArgs {
  el: HTMLDivElement,
  headers?: (string | { text: string, sortable: boolean })[],
  items?: string[][],
  rowsPerPage?: number,
  search?: boolean
}

// eslint-disable-next-line no-unused-vars
class Xtable {
  el: HTMLDivElement;

  table: HTMLTableElement;

  headers: (string | { text: string, sortable: boolean })[];

  items: string[][];

  itemsDefaultOrder: string[][];

  itemsPrevOrder: string[][] | undefined;

  rows: HTMLTableRowElement[] = [];

  rowsPerPage: number;

  search: boolean;

  searchResults: string[][] = [];

  constructor(args: TableArgs, {
    headers = [], items = [], rowsPerPage = 10, search = true,
  } = args) {
    this.el = args.el;
    this.el.classList.add('x-table');

    this.table = document.createElement('table');
    this.table.classList.add('x-table__table');

    this.headers = headers;
    this.createAndInsertHeaders();

    this.rowsPerPage = rowsPerPage;

    this.itemsDefaultOrder = [...items];
    this.items = [...items];
    this.createAndInsertRows();

    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('x-table__inner-table-wrapper');
    tableWrapper.appendChild(this.table);
    this.el.appendChild(tableWrapper);

    if (this.rowsPerPage > 0) {
      tableWrapper.style.height = window.getComputedStyle(this.table).getPropertyValue('height');
      this.createAndInsertPagination();
    }

    this.search = search;
    if (this.search) this.createAndInsertSearchForm();
  }

  createAndInsertHeaders() {
    const row = document.createElement('tr') as HTMLTableRowElement;
    const sortIconsBucket: HTMLSpanElement[] = [];

    this.headers.forEach((header, i) => {
      const headerCell = document.createElement('th') as HTMLTableCellElement;

      headerCell.dataset.index = String(i);
      headerCell.textContent = typeof header === 'object' ? header.text : header;

      if (typeof header === 'object' && header.sortable) {
        const sortIcon = document.createElement('span');
        sortIcon.classList.add('x-table__sort-icon', 'x-table__sort-icon--ascending');
        sortIcon.textContent = '«';

        headerCell.appendChild(sortIcon);
        sortIconsBucket.push(sortIcon);

        headerCell.dataset.order = 'ascending';
        headerCell.classList.add('x-table--clickable');

        headerCell.addEventListener('click', (e) => {
          if (!this.itemsPrevOrder?.length) {
            const t = e.target as HTMLTableElement;
            const order = t.dataset.order as 'ascending' | 'descending' | 'default';

            sortIconsBucket.forEach((sortIconSibling) => {
              if (sortIconSibling !== sortIcon) {
                sortIconSibling.classList.remove('x-table--show');
                // eslint-disable-next-line no-param-reassign
                if (sortIconSibling.parentElement) sortIconSibling.parentElement.dataset.order = 'ascending';
              }
            });

            if (order === 'ascending' || order === 'descending') {
              this.items = this.sortData({ data: this.items, dataIndex: Number(t.dataset.index), order });
            } else {
              this.items = this.itemsDefaultOrder;
            }

            this.updateUi(this.items);

            sortIcon.classList.add('x-table--show');

            if (order === 'ascending') {
              sortIcon.classList.remove('x-table__sort-icon--descending');
              sortIcon.classList.add('x-table__sort-icon--ascending');
              t.dataset.order = 'descending';
            } else if (order === 'descending') {
              sortIcon.classList.remove('x-table__sort-icon--ascending');
              sortIcon.classList.add('x-table__sort-icon--descending');
              t.dataset.order = 'default';
            } else if (order === 'default') {
              sortIcon.classList.remove('x-table__sort-icon--descending', 'x-table--show');
              sortIcon.classList.add('x-table__sort-icon--ascending');
              t.dataset.order = 'ascending';
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
      const row = document.createElement('tr') as HTMLTableRowElement;
      const values = this.items[i];

      values.forEach((value) => {
        const cell = document.createElement('td') as HTMLTableCellElement;
        cell.textContent = value;

        row.appendChild(cell);
      });

      this.rows.push(row);
      this.table.appendChild(row);
    }
  }

  createAndInsertSearchForm() {
    const form = document.createElement('form');
    form.classList.add('x-table__search-form');

    const inputField = document.createElement('input');
    inputField.classList.add('x-table__search-form-input');
    inputField.type = 'search';
    inputField.placeholder = 'keyword';

    const submitBtn = document.createElement('button');
    submitBtn.classList.add('x-table__search-form-btn');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Search';

    const searchResults = document.createElement('span');
    searchResults.classList.add('x-table__search-form-result');
    searchResults.classList.add('x-table--hide');

    form.appendChild(inputField);
    form.appendChild(submitBtn);
    form.appendChild(searchResults);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const keyword = inputField.value;

      this.itemsPrevOrder = [...this.items];

      const results = this.items.filter((item) => {
        const data = item.join('').toLowerCase();

        return data.includes(keyword);
      });

      this.items = [...results];
      searchResults.classList.remove('x-table--hide');
      searchResults.textContent = `Number of results: ${results.length}`;

      this.table.querySelectorAll('th.x-table--clickable').forEach((header) => header.classList.add('x-table--not-clickable'));

      this.updateUi(results);
      if (this.rowsPerPage) this.createAndInsertPagination(true);
    });

    inputField.addEventListener('input', () => {
      if (!inputField.value.length) {
        searchResults.classList.add('x-table--hide');
        searchResults.textContent = '';

        if (this.itemsPrevOrder?.length) this.items = this.itemsPrevOrder;
        this.itemsPrevOrder = [];

        this.table.querySelectorAll('th.x-table--not-clickable').forEach((header) => header.classList.remove('x-table--not-clickable'));

        this.updateUi(this.items);

        if (this.rowsPerPage) this.createAndInsertPagination(true);
      }
    });

    this.el.insertBefore(form, this.el.children[0]);
  }

  createAndInsertPagination(clean = false) {
    if (clean) this.el.querySelector('.x-table__pagination')?.remove();

    const paginationList = document.createElement('ul');
    const numberOfPages = Math.ceil(this.items.length / this.rowsPerPage);
    const paginationListItems: HTMLLIElement[] = [];

    let prevActivePage: HTMLLIElement;
    paginationList.classList.add('x-table__pagination');

    for (let i = 0; i < numberOfPages; i += 1) {
      const paginationListItem = document.createElement('li');
      paginationListItem.classList.add('x-table__pagination-item');
      paginationListItem.dataset.index = String(i);
      paginationListItem.textContent = `${i + 1}`;
      paginationListItems.push(paginationListItem);

      if (i === 0) {
        paginationListItem.classList.add('x-table__pagination--active');
        prevActivePage = paginationListItem;
      }

      paginationList.appendChild(paginationListItem);
    }

    paginationListItems.forEach((paginationListItem) => {
      paginationListItem.addEventListener('click', (e) => {
        const target = e.target as HTMLLIElement;

        if (prevActivePage) prevActivePage.classList.remove('x-table__pagination--active');
        target.classList.add('x-table__pagination--active');
        prevActivePage = target;

        const pageNumber = Number(paginationListItem.dataset.index);
        this.updateUi(this.items.slice(this.rowsPerPage * pageNumber, (this.rowsPerPage * pageNumber) + this.rowsPerPage));
      });
    });

    this.el.appendChild(paginationList);
  }

  updateUi(data: any[]) {
    this.rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('td')) as HTMLTableCellElement[];

      cells.forEach((cell, cellIndex) => {
        const theCell = cell;

        if (data?.[rowIndex]?.[cellIndex]) {
          theCell.textContent = data[rowIndex][cellIndex];
          theCell.hidden = false;
        } else {
          theCell.textContent = '';
          theCell.hidden = true;
        }
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  sortData(args: { data: string[][], dataIndex: number, order?: 'ascending' | 'descending' }, { data = [], dataIndex = 0, order = 'ascending' } = args) {
    let sortedArray = [...data];

    sortedArray = sortedArray.sort((a: string[], b: string[]) => {
      const itemA = a[dataIndex].toLowerCase();
      const itemB = b[dataIndex].toLowerCase();

      if (order === 'ascending') {
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
