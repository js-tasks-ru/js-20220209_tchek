//решение преподавателя
export default class SortableList {
  subElements = {};

  dragNDrop() {
    const listElement = document.querySelector(`.sortable-list`);
    const elements = listElement.querySelectorAll(`.sortable-list__item`);

    for (const task of elements) {
      task.draggable = true;
    }

    listElement.addEventListener(`dragstart`, event => {
      event.target.closest('.sortable-list__item').classList.add(`selected`);
    });

    listElement.addEventListener(`dragend`, (event) => {
      event.target.classList.remove(`selected`);
    });

    listElement.addEventListener(`dragover`, (event) => {

      event.preventDefault();

      const activeElement = listElement.querySelector(`.selected`);
      const currentElement = event.target;
      const isMovable = activeElement !== currentElement &&
        currentElement.classList.contains(`sortable-list__item`);

      if (!isMovable) {
        return;
      }

      const nextElement = getNextElement(event.clientY, currentElement);
      if (nextElement && activeElement === nextElement.previousElementSibling || activeElement === nextElement) {
        return;
      }
      listElement.insertBefore(activeElement, nextElement);
    });

    const getNextElement = (cursorPosition, currentElement) => {
      const currentElementPosition = currentElement.getBoundingClientRect();
      const currentElementCenter = currentElementPosition.y + currentElementPosition.height / 2;

      return (cursorPosition < currentElementCenter) ?
        currentElement :
        currentElement.nextElementSibling;
    };
  }

  constructor({ items }) {
    this.items = items;

    this.render();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';

    this.addItems();
    this.subElements = this.element;
    this.initEventListeners();
  }

  addItems() {
    for (const item of this.items) {
      item.classList.add('sortable-list__item');
    }

    this.element.append(...this.items);
  }

  initEventListeners() {
    document.addEventListener('pointerdown', this.dragNDrop);

    this.subElements.addEventListener('pointerdown', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    });
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
}
