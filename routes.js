class Router {
  constructor(routes, initialState = {}) {
    this.routes = routes;
    this.state = initialState;
    this.init();
  }

  init() {
    window.addEventListener("hashchange", () => this.handleRouteChange());
    this.handleRouteChange();
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.handleRouteChange(); // re-render on state change
  }

  handleRouteChange() {
    const currentPath = window.location.hash.slice(1) || '/';
    const route = this.routes[currentPath];
    if (route) {
      route(this.state, this.setState.bind(this));
    } else if (this.routes["/404"]) {
      this.routes["/404"](this.state, this.setState.bind(this));
    }
  }
}

// Usage example
const router = new Router({
  "/": (state, setState) => {
    document.getElementById("root").innerHTML = `
      <h1>Home Page</h1>
      <p>Counter: ${state.counter || 0}</p>
      <button id="inc">Increment</button>
    `;
    document.getElementById("inc").onclick = () => {
      setState({ counter: (state.counter || 0) + 1 });
    };
  },
  "/about": (state) => {
    document.getElementById("root").innerHTML = `<h1>About Page</h1><p>Counter is ${state.counter || 0}</p>`;
  },
  "/404": () => {
    document.getElementById("root").innerHTML = "<h1>404 Page</h1>";
  },
}, { counter: 0 });
