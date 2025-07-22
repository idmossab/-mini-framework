class VDOMManager {
  constructor(body) {
    this.body = body;
    this.oldVNode = null;
  }
  store(newVNode) {
    updateElement(this.body, newVNode, this.oldVNode);
    this.oldVNode = newVNode;
  }
}

function updateElement(parent, newVNode, oldVNode, index = 0) {
  const existingEl = parent.childNodes[index];

  if (!oldVNode) {
    parent.appendChild(newVNode.render());
  } else if (!newVNode) {
    parent.removeChild(existingEl);
  } else if (changed(newVNode, oldVNode)) {
    parent.replaceChild(newVNode.render(), existingEl);
  } else if (newVNode.tag) {
    const newLen = newVNode.children.length;
    const oldLen = oldVNode.children.length;
    const max = Math.max(newLen, oldLen);
    for (let i = 0; i < max; i++) {
      updateElement(existingEl, newVNode.children[i], oldVNode.children[i], i);
    }
  }
}

function changed(node1, node2) {
  return typeof node1 !== typeof node2 ||
    (typeof node1 === 'string' && node1 !== node2) ||
    node1.tag !== node2.tag;
}
