
# Mini JavaScript Framework Documentation

Welcome to the documentation for your minimal virtual DOM framework. This document covers everything a developer needs to understand, use, and extend the framework efficiently.

---

## ✨ Features

- **Virtual DOM rendering** with diffing and keyed reconciliation
- **Declarative element creation** using `VNode`
- **Event handling** via attributes (e.g., `onClick`, `onInput`) or with an `EventRegistry`
- **Component state management** with `VDOMManager`
- **Hash-based routing** with the `Router` class
- **Support for dynamic updatclass VDOMManager {
  constructor(container, renderFn, initialState = {}) {
    this.container = container;
    this.oldVNode = null;
    this.renderFn = renderFn;
    this.state = initialState;
  }

  setState = (newState) => {
    this.state = { ...this.state, ...newState };
    const newVNode = this.renderFn(this.state, this.setState);
    updateElement(this.container, newVNode, this.oldVNode);
    this.oldVNode = newVNode;
  };

  mount() {
    this.oldVNode = this.renderFn(this.state, this.setState);
    this.container.appendChild(this.oldVNode.render());
  }
}

function updateElement(parent, newVNode, oldVNode, index = 0) {
  const existingEl = parent.childNodes[index];

  if (!newVNode && oldVNode) {
    if (existingEl) parent.removeChild(existingEl);
    return;
  }
  if (newVNode && !oldVNode) {
    parent.appendChild(createDOMNode(newVNode));
    return;
  }
  if (!newVNode && !oldVNode) return;

  if (changed(newVNode, oldVNode)) {
    parent.replaceChild(createDOMNode(newVNode), existingEl);
    return;
  }

  if (typeof newVNode === "string") {
    if (existingEl.textContent !== newVNode) {
      existingEl.textContent = newVNode;
    }
    return;
  }

  updateAttributes(existingEl, newVNode.attrs, oldVNode.attrs);

  const newChildren = newVNode.children || [];
  const oldChildren = oldVNode.children || [];

  // Efficient keyed reconciliation
  reconcileKeyedChildren(existingEl, newChildren, oldChildren);
}

function reconcileKeyedChildren(parentEl, newChildren, oldChildren) {
  // Check if we have keys
  const hasKeys =
    newChildren.some((child) => child?.attrs?.key != null) ||
    oldChildren.some((child) => child?.attrs?.key != null);

  if (!hasKeys) {
    // No keys - CORRECTED simple index-based diffing
    const newLen = newChildren.length;
    const oldLen = oldChildren.length;
    const commonLen = Math.min(newLen, oldLen);

    // 1. Update the nodes that exist in both old and new VDOM
    for (let i = 0; i < commonLen; i++) {
      updateElement(parentEl, newChildren[i], oldChildren[i], i);
    }

    // 2. Add any new nodes if the new list is longer
    if (newLen > oldLen) {
      for (let i = commonLen; i < newLen; i++) {
        updateElement(parentEl, newChildren[i], null, i);
      }
    }
    // 3. Remove surplus nodes if the old list was longer
    else if (oldLen > newLen) {
      // Iterate backwards to avoid issues with the live NodeList
      for (let i = oldLen - 1; i >= newLen; i--) {
        const childToRemove = parentEl.childNodes[i];
        if (childToRemove) {
          parentEl.removeChild(childToRemove);
        }
      }
    }
    return;
  }

  // Build key maps for efficient lookups
  const oldKeyToElement = new Map();
  const oldKeyToVNode = new Map();

  oldChildren.forEach((child, index) => {
    const key = child?.attrs?.key;
    if (key != null) {
      oldKeyToElement.set(key, parentEl.childNodes[index]);
      oldKeyToVNode.set(key, child);
    }
  });

  const newElements = [];
  const usedKeys = new Set();

  // Process each new child
  newChildren.forEach((newChild, newIndex) => {
    const key = newChild?.attrs?.key;

    if (key != null && oldKeyToElement.has(key)) {
      // Reuse existing element with this key
      const existingElement = oldKeyToElement.get(key);
      const oldVNode = oldKeyToVNode.get(key);

      // (NEW) 
      if (changed(newChild, oldVNode)) {
        const newEl = createDOMNode(newChild);
        parentEl.replaceChild(newEl, existingElement);
        newElements[newIndex] = newEl;
        usedKeys.add(key);
        return;
      }

      // Update the existing element in place
      updateAttributes(existingElement, newChild.attrs, oldVNode.attrs);
      reconcileKeyedChildren(
        existingElement,
        newChild.children || [],
        oldVNode.children || []
      );

      newElements[newIndex] = existingElement;
      usedKeys.add(key);
    } else {
      // Create new element
      newElements[newIndex] = createDOMNode(newChild);
    }
  });

  // Remove unused elements
  oldChildren.forEach((oldChild, index) => {
    const key = oldChild?.attrs?.key;
    if (key != null && !usedKeys.has(key)) {
      const elementToRemove = parentEl.childNodes[index];
      if (elementToRemove && elementToRemove.parentNode === parentEl) {
        parentEl.removeChild(elementToRemove);
      }
    }
  });

  // Reorder elements to match new order
  newElements.forEach((element, targetIndex) => {
    const currentElement = parentEl.childNodes[targetIndex];
    if (currentElement !== element) {
      if (element.parentNode === parentEl) {
        // Move existing element
        parentEl.insertBefore(element, currentElement || null);
      } else {
        // Insert new element
        parentEl.insertBefore(element, currentElement || null);
      }
    }
  });

  // Remove any remaining extra elements
  while (parentEl.childNodes.length > newChildren.length) {
    parentEl.removeChild(parentEl.lastChild);
  }
}

function createDOMNode(vnode) {
  if (vnode === null || vnode === undefined) return document.createTextNode("");
  if (typeof vnode === "string") return document.createTextNode(vnode);
  return vnode.render();
}

function changed(node1, node2) {
  if (node1 == null || node2 == null) return node1 !== node2;
  if (typeof node1 !== typeof node2) return true;
  if (typeof node1 === "string") return node1 !== node2;
  return node1.tag !== node2.tag || node1.attrs?.key !== node2.attrs?.key;
}

function updateAttributes(el, newAttrs = {}, oldAttrs = {}) {
  for (const key in oldAttrs) {
    if (!(key in newAttrs)) {
      if (key.startsWith("on") && typeof oldAttrs[key] === "function") {
        el.removeEventListener(key.slice(2).toLowerCase(), oldAttrs[key]);
      } else {
        el.removeAttribute(key);
      }
    }
  }

  for (const key in newAttrs) {
    const newVal = newAttrs[key];
    const oldVal = oldAttrs[key];
    if (newVal === oldVal) continue;

    if (key.startsWith("on") && typeof newVal === "function") {
      if (oldVal) el.removeEventListener(key.slice(2).toLowerCase(), oldVal);
      el.addEventListener(key.slice(2).toLowerCase(), newVal);
    } else if (key === "checked" && el.tagName === "INPUT") {
      el.checked = Boolean(newVal);
    } else if (key === "value" && el.tagName === "INPUT") {
      if (el.value !== newVal) el.value = newVal;
    } else if (key !== "key") {
      el.setAttribute(key, newVal);
    }
  }
}
es** through `setState`

---

## 📦 Core Concepts

### 1. `VNode` – Virtual Node

This class represents a virtual DOM element.

#### How to create an element

```js
const myDiv = new VNode("div", { id: "main" }, ["Hello World"]);
document.body.appendChild(myDiv.render());
```

#### How it works

- `tag` is the element tag (`div`, `input`, `button`, etc.)
- `attrs` is an object for attributes like `id`, `class`, or events like `onClick`
- `children` is an array of strings or other VNodes

---

## 🔗 Nesting Elements

```js
const nested = new VNode("div", {}, [
  new VNode("h1", {}, ["Welcome"]),
  new VNode("p", {}, ["This is a paragraph."]),
]);
```

---

## ⚡ Adding Events

You can bind DOM events directly using attributes starting with `on`:

```js
const button = new VNode("button", {
  onClick: () => alert("Clicked!")
}, ["Click Me"]);
```

Internally, this attaches the event using `addEventListener`.

---

## 🧩 Adding Attributes

Just include any attributes in the `attrs` object:

```js
new VNode("input", {
  type: "text",
  value: "Type here",
  placeholder: "Your name",
  id: "username"
});
```

Special handling is applied for:
- `checked` (boolean)
- `value` (for inputs)
- `key` (used in keyed diffing logic)

---

## 🧠 VDOMManager – State + Diff + Render

`VDOMManager` handles rendering and updating the DOM efficiently when the state changes.

### Example:

```js
function App(state, setState) {
  return new VNode("div", {}, [
    new VNode("h2", {}, [`Counter: ${state.count}`]),
    new VNode("button", { onClick: () => setState({ count: state.count + 1 }) }, ["+"])
  ]);
}

const manager = new VDOMManager(document.getElementById("app"), App, { count: 0 });
manager.mount();
```

### How it works:

- `mount()` renders the initial DOM
- `setState()` triggers a diff + update using `updateElement`

---

## 🔁 Diffing & Reconciliation

The `updateElement()` function compares the new virtual DOM to the old one and updates the real DOM as needed.

- If keys are present, keyed diffing is used (more efficient)
- Otherwise, elements are diffed by index
- Changes in attributes or tag types will cause the node to be replaced

---

## 🧭 Router – Hash-Based Client Routing

You can define route handlers using the `Router` class.

### Example

```js
const routes = {
  "/": (state, setState) => { /* render home */ },
  "/about": (state, setState) => { /* render about */ },
  "/404": (state, setState) => { /* render not found */ },
};

const router = new Router(routes);
```

This will call the appropriate function whenever the `#hash` changes in the URL.

---

## 🧷 EventRegistry – Global Delegated Events

`EventRegistry` provides advanced global event management including:

- Double-click detection
- Global `click`, `keydown`, `scroll`, `input`, and `change` listeners

### Registering and Using

```js
const registry = new EventRegistry();
registry.register("click", "myButton", () => console.log("Clicked!"));
registry.init();
```

In your HTML or VNode:
```js
new VNode("button", { "data-onclick": "myButton" }, ["Click Me"]);
```

This allows global delegated event handling with consistent IDs.

---

## 🧪 Why This Design Works

- **Declarative**: VNode allows for a JSX-like structure without needing a compiler.
- **Efficient**: Only changed parts of the DOM are updated.
- **Simple**: Small surface area, easy to learn.
- **Composable**: Everything is just JavaScript objects and functions.
- **Keyed Diffing**: Improves performance for dynamic lists (e.g., to-do apps).

---

## ✅ Summary

| Feature               | Supported |
|-----------------------|-----------|
| Virtual DOM           | ✅         |
| Event Binding         | ✅         |
| Attribute Management  | ✅         |
| Keyed Reconciliation  | ✅         |
| State Management      | ✅         |
| Hash Routing          | ✅         |
| Global Event Delegation | ✅      |

---

## 📁 File Structure (suggested)

```
framework/
│
├── VNode.js           # Virtual node definitions
├── VDOMManager.js     # Main rendering logic with diffing
├── Router.js          # Client-side routing
└── EventRegistry.js   # Centralized event delegation
```

---

## 🧱 Extendability

You can extend this framework by adding:

- JSX support (via Babel or a compiler)
- Components with lifecycle methods
- Server-side rendering (SSR)
- Effects and memoization

---

Happy coding! 🚀