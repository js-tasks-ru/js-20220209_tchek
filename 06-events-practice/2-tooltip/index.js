class Tooltip {
  static _component;
  constructor() {
    if (Tooltip._component) {
      return Tooltip._component;
    }

    Tooltip._component = this;

    this.pointerOver = this.pointerOver.bind(this);
    this.pointerOut = this.pointerOut.bind(this);
  }

  initialize() {
    document.addEventListener('pointerover', this.pointerOver);
    document.addEventListener('pointerout', this.pointerOut);
  }

  pointerOver(event) {
    const toolTip = event.target.dataset.tooltip;
    if (!toolTip) {
      return;
    }

    this.render(toolTip);
  }

  pointerOut(event) {
    if (this.element) {
      this.element.remove();
    }
    this.element = null;
  }

  destroy() {
    document.removeEventListener('pointerover', this.pointerOver);
    document.removeEventListener('pointerover', this.pointerOut);
    this.element = null;
    Tooltip._component = null;
  }

  render(toolTip) {
    const element = document.createElement('div');
    element.className = 'tooltip';
    element.innerHTML = toolTip;
    document.body.append(element);

    this.element = element;
  }
}

export default Tooltip;
