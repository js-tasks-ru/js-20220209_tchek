export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    for (const columnConfig of this.headerConfig) {
      if (!columnConfig.template) {
        columnConfig.template = (value) => {
          return `<div class="sortable-table__cell">${value}</div>`;
        }
      }
    }

    this.render();
    this.subElements = this.getSubElements();
  }

  getOrderTag(item) {
    return item.order ? `data-order="${item.order}"` : '';
  }

  getHeader() {
    return this.headerConfig.map(item => {
      return `
      <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" ${this.getOrderTag(item)} >
        <span>${item.title}</span>
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

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }

  sort(field, order) {
    const column = this.headerConfig.filter(column => column.id === field)[0];
    column.order = order;
    const sortedData = this.sortInner(column);
    this.subElements['body'].innerHTML = this.getBody(sortedData);
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
          if (a[column.id] > b[column.id]) return 1 * direction;
          if (a[column.id] == b[column.id]) return 0 * direction;
          if (a[column.id] < b[column.id]) return -1 * direction;
        }
        break;
      case 'string':
        const options = ['ru-RU-u-kf-upper', 'en-EN-u-kf-upper'];
        comparer = function compareString(a, b) {
          return direction * a[column.id].localeCompare(b[column.id], options);
        }
        break;
    }
    return  [...this.data].sort(comparer);
  }
}

