import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  start = 0;
  end = 20;
  size = 20

  constructor(headersConfig, {
    url = '',
    isSortLocally = false,
    embed = '',
    data = [],
    sorted = {
      order: 'asc'
    }
  } = {}) {

    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.embed = embed;
    this.headerConfig = headersConfig;
    this.data = data;
    if (!sorted.id) {
      const column = this.headerConfig.find(column => column.sortable);
      sorted.id = column.id;
    }

    this.sorted = sorted;

    for (const columnConfig of this.headerConfig) {
      if (!columnConfig.template) {
        columnConfig.template = (value) => {
          return `<div class="sortable-table__cell">${value}</div>`;
        }
      }
    }

    this.render();
    this.subElements = this.getSubElements();

    this.initEventListener();
  }

  setArrowAndSortOrder(column) {

    let order = 'asc';
    if (column.order) {
      order = this.inverse[column.order]
    }

    this.headerConfig.map(column => {
      column.order = null;
      column.element.dataset.order = '';
    });

    column.order = order;
    column.element.dataset.order = order;

    this.sorted.id = column.id;
    this.sorted.order = order;
  }

  inverse = {
    'asc': 'desc',
    'desc': 'asc'
  }

  handleClick = (event) => {
    const columnHeader = event.target.closest('div.sortable-table__cell');
    if (!columnHeader) {
      return;
    }

    const column = this.headerConfig.filter(column => column.id === columnHeader.dataset.id)[0];
    if (!column.sortable) {
      return;
    }

    this.setArrowAndSortOrder(column);
    this.sort(column.id, this.sorted.order);
  }

  initEventListener() {
    this.subElements.header.addEventListener('pointerdown', this.handleClick);
    window.addEventListener('scroll', this.handleScroll);
  }

  handleScroll = async (event) => {
    const elementBottom = this.element.offsetTop + this.element.offsetHeight;
    const windowBottom = window.innerHeight + window.pageYOffset;
    const nearBottomOffset = 50;
    if (elementBottom - windowBottom - nearBottomOffset > 0) {
      return;
    }
    const column = this.headerConfig.filter(column => column.order)[0];
    if (!column) {
      return;
    }
    if (this.inUpdate) {
      return;
    }
    this.inUpdate = true;

    try {
      const newData = await this.getDataFromServer(column.id,
        column.order,
        this.end,
        this.end + this.size);

      this.end += this.size;

      const newBody = this.getBody(newData);
      this.subElements.body.innerHTML += newBody;
    }
    finally {
      this.inUpdate = false;
    }
  }

  getHeader() {
    return this.headerConfig.map(item => {
      return `
      <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
        <span>${item.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span >
      </div>`;
    }).join('');
  }

  getBody(data) {
    return data.map(row => {
      return `
      <a href="${row.id}" class="sortable-table__row">
        ${this.headerConfig.map(columnConfig => {
        return `${columnConfig.template(row[columnConfig.id])}`;
      }).join('')}
      </a>`;
    }).join('');
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getTemplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeader()}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.getBody(this.data)}
        </div>

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    for (const column of this.headerConfig) {
      column.element = element.querySelector(`.sortable-table__cell[data-id="${column.id}"]`);
    }

    this.element = element.firstElementChild;

    await this.sort(this.sorted.id, this.sorted.order);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.subElements.header.removeEventListener('click', this.handleClick);
    this.remove();
    this.element = null;
  }

  async sort(field, order) {
    if (!order) {
      return;
    }

    this.headerConfig.map(column => {
      column.order = null;
      column.element.dataset.order = '';
    });

    const column = this.headerConfig.filter(column => column.id === field)[0];
    column.order = order;
    column.element.dataset.order = order;

    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      await this.sortOnServer(field, order);
    }
  }

  async sortOnServer(field, order) {
    const data = await this.getDataFromServer(field, order, this.start, this.size);
    this.subElements.body.innerHTML = this.getBody(data);
  }

  async getDataFromServer(field, order, start, end) {
    this.url.searchParams.set('_sort', field);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_embed', this.embed);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    return await fetchJson(this.url);
  }

  sortOnClient(field, order) {
    const column = this.headerConfig.filter(column => column.id === field)[0];
    const sortedData = this.sortInner(column);
    this.subElements.body.innerHTML = this.getBody(sortedData);
  }

  sortInner(column) {

    let comparer;
    const directions = {
      asc: 1,
      desc: -1
    }
    const direction = directions[column.order];

    switch (column.sortType) {
      case 'number':
        comparer = function compareNumeric(a, b) {
          return (a[column.id] - b[column.id]) * direction;
        }
        break;
      case 'string':
        const options = ['ru-RU', 'en-EN'];
        comparer = function compareString(a, b) {
          return direction * a[column.id].localeCompare(b[column.id], options);
        }
        break;
    }
    return [...this.data].sort(comparer);
  }
}

