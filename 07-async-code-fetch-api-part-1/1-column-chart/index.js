import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {

  _chartHeight = 50;

  get chartHeight() {
    return this._chartHeight;
  }

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date()
    },
    label = '',
    header = '',
    link = '',
    formatHeading = format => `${format}`
  }
    = {}) {

    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.header = header;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
    this.subElements = this.getSubElements();

    this.update(this.range.from, this.range.to);
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

  getLink() {
    return this.link ? `<a class="column-chart__link" href="/${this.link}">View all</a>` : '';
  }

  hasData() {
    return this.data !== undefined;
  }

  getMaxOfArray(numArray) {
    return Math.max(...numArray);
  }

  getSumOfArray(numArray) {
    return numArray.reduce((partialSum, a) => partialSum + a, 0);
  }

  getDataTags() {
    if (!this.hasData())
      return '';

    const values = Object.values(this.data);

    const maxValue = this.getMaxOfArray(values);
    const sum = this.getSumOfArray(values);
    const multiplier = this.chartHeight / maxValue;

    let result = '';
    for (const item of values) {
      result += `<div style="--value: ${Math.floor(item * multiplier)}"
                      data-tooltip="${(item * 100 / maxValue).toFixed(0) + '%'}">
                 </div>`;
    }

    return result;
  }

  getTemplate() {
    return `<div class="dashboard__chart_${this.label}
                        ${!this.hasData() ? 'column-chart_loading' : ''}">
      <div class="column-chart" style="--chart-height: 50">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getDataTags()}
          </div>
        </div>
      </div>
    </div>`
  }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');

    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    const data = await fetchJson(this.url);

    this.data = data;
    this.subElements.body.innerHTML = `${this.getDataTags()}`;
    this.element.classList.remove('column-chart_loading');
    this.range.from = from;
    this.range.to = to;

    return this.data;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

