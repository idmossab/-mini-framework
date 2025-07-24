class VDOMManager {
  constructor(body, renderFn, initialState = {}) {
    this.body = body;
    this.oldVNode = null;
    this.renderFn = renderFn;
    this.state = initialState;
  }

  setState(newState) {
    console.log("setState called");
    if (typeof newState === 'function') {
      this.state = newState(this.state);
    } else {
      this.state = { ...this.state, ...newState };
    }
  
    const newVNode = this.renderFn(this.state, this.setState.bind(this));
    updateElement(this.body, newVNode, this.oldVNode);
    this.oldVNode = newVNode;
  }



  mount() {
    this.oldVNode = this.renderFn(this.state, this.setState.bind(this));
    this.body.appendChild(this.oldVNode.render());
  }

  store(newVNode) {
    updateElement(this.body, newVNode, this.oldVNode);
    this.oldVNode = newVNode;
  }
}

function updateElement(parent, newVNode, oldVNode, index = 0) {
  if (!parent || parent.nodeType !== Node.ELEMENT_NODE) return;

  const existingEl = parent.childNodes[index];

  function createDOMNode(vnode) {
    if (!vnode) return null;
    if (typeof vnode === 'string') {
      console.log(` createDOMNode: text -> "${vnode}"`);
      return document.createTextNode(vnode);
    }
    console.log(` createDOMNode: element -> <${vnode.tag}>`);
    return vnode.render();
  }

  if (!oldVNode && newVNode) {
    console.log(` Appending new node at index ${index}`);
    const newEl = createDOMNode(newVNode);
    if (newEl) parent.appendChild(newEl);
    return;
  }

  if (!newVNode && oldVNode) {
    console.log(`Removing node at index ${index}`);
    if (existingEl) parent.removeChild(existingEl);
    return;
  }

  if (changed(newVNode, oldVNode)) {
    console.log(` Replacing node at index ${index}`);
    const newEl = createDOMNode(newVNode);
    if (newEl && existingEl) parent.replaceChild(newEl, existingEl);
    return;
  }

  if (newVNode && oldVNode && newVNode.tag) {
    const existingParent = existingEl;
    if (!existingParent) return;

    const oldChildrenMap = {};
    const newChildren = newVNode.children;
    const oldChildren = oldVNode.children;

    oldChildren.forEach((child, i) => {
      const key = child?.attrs?.key ?? i;
      oldChildrenMap[key] = { vnode: child, index: i };
    });

    const newDomChildren = [];

    for (let i = 0; i < newChildren.length; i++) {
      const newChild = newChildren[i];
      const key = newChild?.attrs?.key ?? i;
      const oldEntry = oldChildrenMap[key];
      const oldChild = oldEntry?.vnode ?? null;

      updateElement(existingParent, newChild, oldChild, i);

      newDomChildren.push(key);
    }

    // Remove any old children not in the new VNode
    for (const key in oldChildrenMap) {
      if (!newDomChildren.includes(key)) {
        const { index: oldIndex } = oldChildrenMap[key];
        const toRemove = existingParent.childNodes[oldIndex];
        if (toRemove) {
          console.log(`Removing old DOM element with key ${key}`);
          existingParent.removeChild(toRemove);
        }
      }
    }
  }
}

function changed(node1, node2) {
  if (typeof node1 !== typeof node2) return true;
  if (typeof node1 === 'string') return node1 !== node2;
  if (node1.tag !== node2.tag) return true;

  const attrs1 = node1.attrs || {};
  const attrs2 = node2.attrs || {};
  const keys1 = Object.keys(attrs1);
  const keys2 = Object.keys(attrs2);

  if (keys1.length !== keys2.length) return true;
  for (const key of keys1) {
    if (attrs1[key] !== attrs2[key]) return true;
  }

  if ((node1.children?.length || 0) !== (node2.children?.length || 0)) return true;
  for (let i = 0; i < node1.children.length; i++) {
    const c1 = node1.children[i];
    const c2 = node2.children[i];

    if (typeof c1 !== typeof c2) return true;
    if (typeof c1 === 'string' && c1 !== c2) return true;
    if (typeof c1 !== 'string' && changed(c1, c2)) return true;
  }

  return false;
}