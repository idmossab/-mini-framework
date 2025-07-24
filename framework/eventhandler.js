class EventRegistry {
  constructor() {
    this.handlers = {
      click: {},
      keydown: {},
      keyup: {},     
      dblclick: {},   
      scroll: {}
    };
  }

  register(type, id, fn) {
    if (!this.handlers[type]) {
      this.handlers[type] = {};
    }
    this.handlers[type][id] = fn;
  }

  dispatch(type, event) {
    let target = event.target;

    if (target.nodeType === Node.TEXT_NODE) {
      target = target.parentElement;
    }

    while (target && target !== document) {
      const handlerId = target.getAttribute(`data-on${type}`);
      if (handlerId && this.handlers[type] && this.handlers[type][handlerId]) {
        this.handlers[type][handlerId](event);
        break;
      }
      target = target.parentElement;
    }
  }

  init() {
    Object.keys(this.handlers).forEach((type) => {
      document.addEventListener(type, (event) => this.dispatch(type, event));
    });
  }
}

const eventRegistry = new EventRegistry();
eventRegistry.init();