export default class ColumnChart {

  _chartHeight = 50;

  get chartHeight() {
    return this._chartHeight;
  }

  constructor(obj) {
    if (obj === undefined) {
      this.render();
      return;
    }

    this.data = obj.data;
    this.title = obj.label;
    this.header = obj.value;
    this.link = obj.link;

    if (obj.formatHeading !== undefined) {
      this.formatHeading = obj.formatHeading;
    }
    else {
      this.formatHeading = format => `${format}`;
    }

    this.render();
  }

  getLink() {
    if (this.link === undefined) {
      return '';
    }

    return `<a class="column-chart__link" href="/${this.link}">View all</a>`
  }

  hasData() {
    return this.data !== undefined && this.data.length > 0;
  }

  getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
  }

  getSumOfArray(numArray) {
    return numArray.reduce((partialSum, a) => partialSum + a, 0);
  }

  getDataTags() {
    if (!this.hasData())
      return '';

    const maxValue = this.getMaxOfArray(this.data);
    const sum = this.getSumOfArray(this.data);
    const multiplier = this.chartHeight / maxValue;
    
    let result = '';
    for (const item of this.data) {
      result += `<div style="--value: ${Math.floor(item * multiplier)}"
                      data-tooltip="${(item * 100 / maxValue).toFixed(0) + '%'}">
                 </div>`;
    }

    return result;
  }

  getTemplate() {
    return `<div class="dashboard__chart_${this.title}
                        ${!this.hasData() ? 'column-chart_loading' : ''}">
      <div class="column-chart" style="--chart-height: 50">
        <div class="column-chart__title">
          Total ${this.title}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
              ${this.header !== undefined ? this.formatHeading(this.header) : '&nbsp'}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getDataTags()}
          </div>
        </div>
      </div>
    </div>`
  }

  update(newData) {
    this.data = newData;
    let body = this.element.getElementsByClassName('column-chart__chart')[0];
    body.innerHTML = `${ this.getDataTags() }`;
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
