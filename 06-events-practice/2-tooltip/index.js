class Tooltip {
  static _component;
  constructor() {
    if (Tooltip._component) {
      return Tooltip._component;
    }

    Tooltip._component = this;
  }

  initialize() {
    document.addEventListener('pointerover', this.pointerOver);
    document.addEventListener('pointerout', this.pointerOut);
  }

  pointerOver = (event) => {
    const toolTip = event.target.dataset.tooltip;
    if (!toolTip) {
      return;
    }

    this.render(toolTip);
    this.element.toolTipElement = event.target.closest('div[data-tooltip]');
    this.element.toolTipElement.addEventListener('pointermove', this.mouseMove);
  }

  mouseMove = (e) => {
    const { clientX: x, clientY: y } = e;
    this.element.style.top = (y + 20) + 'px';
    this.element.style.left = (x + 20) + 'px';
  }

  pointerOut = (event) => {
    if (this.element) {
      this.element.toolTipElement.removeEventListener('pointermove', this.mouseMove);
      this.element.remove();
    }
    this.element = null;
  }

  destroy() {
    document.removeEventListener('pointerover', this.pointerOver);
    document.removeEventListener('pointerover', this.pointerOut);
    if (this.element && this.element.toolTipElement) {
      this.element.toolTipElement.removeEventListener('pointermove', this.mouseMove);
    }
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
