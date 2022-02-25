export default class NotificationMessage {
  static element;
  static subElements;
  static timerId;

  constructor(message, { duration = 2000, type = 'success' } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this._durationString = duration / 1000 + "s";
  }

  getTemplate() {
    return `<div class="notification">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header"></div>
        <div class="notification-body"></div>
      </div>
    </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    NotificationMessage.element = element.firstElementChild;
    NotificationMessage.subElements = this.getSubelements();
  }

  getSubelements() {
    const result = {};
    const elements = NotificationMessage.element.querySelectorAll('[class^="notification-"]');

    for (const elem of elements) {
      result[elem.className] = elem;
    }

    return result;
  }

  show(parent = document.body) {

    if (!NotificationMessage.element) {
      this.render();
    }

    if (NotificationMessage.timerId) {
      clearTimeout(NotificationMessage.timerId);
    }

    NotificationMessage.timerId = setTimeout(this.destroy, this.duration);

    NotificationMessage.element.classList.remove(...NotificationMessage.element.classList);
    NotificationMessage.element.classList.add('notification', this.type);
    NotificationMessage.element.style = `--value: ${this._durationString}`;

    NotificationMessage.subElements['notification-header'].innerHTML = this.type;
    NotificationMessage.subElements['notification-body'].innerHTML = this.message;

    parent.append(NotificationMessage.element);
  }

  destroy() {
    NotificationMessage.element.remove();
    NotificationMessage.element = null;
    NotificationMessage.timerId = null;
  }
}
