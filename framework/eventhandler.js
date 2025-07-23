class EventRegistry {
  constructor() {
    this.handlers = {
      click: {},
      keydown: {},
      scroll: {}
    };
  }

  register(type, id, fn) {
    this.handlers[type][id] = fn;
  }

  dispatch(type, event) {
    let target = event.target;
    while (target && target !== document) {
      const handlerId = target.getAttribute(`data-on${type}`);
      if (handlerId && this.handlers[type][handlerId]) {
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