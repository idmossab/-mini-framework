class VDOMManager {
  constructor(body) {
    this.body = body;          
    this.oldVNode = null;     
    this.state = {};           
  }
  // to change the data state ... 
  setState(newState) {
    this.state = { ...this.state, ...newState }; 
    const newVNode = this.render();              
    updateElement(this.body, newVNode, this.oldVNode); 
    this.oldVNode = newVNode;                     
  }

  //  append in body
  mount() {
    this.oldVNode = this.render();     
    this.body.appendChild(this.oldVNode.render()); 
  }
  // store thr prev node 
  store(newVNode) {
    updateElement(this.body, newVNode, this.oldVNode);
    this.oldVNode = newVNode;
  }
}

// update  in real Dom
function updateElement(parent, newVNode, oldVNode, index = 0) {
  const existingEl = parent.childNodes[index];

  // Convert a VNode or string into a real DOM node
  function createDOMNode(vnode) {
    if (typeof vnode === 'string') {
      return document.createTextNode(vnode);
    }
    return vnode.render(); // call VNode.render()
  }

  // Case 1: Nothing existed before, just add it
  if (!oldVNode) {
    parent.appendChild(createDOMNode(newVNode));

  // Case 2: New one was removed
  } else if (!newVNode) {
    parent.removeChild(existingEl);

  // Case 3: They are different — replace
  } else if (changed(newVNode, oldVNode)) {
    parent.replaceChild(createDOMNode(newVNode), existingEl);

  // Case 4: They are the same — compare their children recursively
  } else if (newVNode.tag) {
    const newLen = newVNode.children.length;
    const oldLen = oldVNode.children.length;
    const max = Math.max(newLen, oldLen);

    for (let i = 0; i < max; i++) {
      updateElement(
        existingEl,                     // Recurse on the matching real DOM child
        newVNode.children[i],          // New child
        oldVNode.children[i],          // Old child
        i                              // Position in list
      );
    }
  }
}

// diffing
function changed(node1, node2) {
  return typeof node1 !== typeof node2 ||
    (typeof node1 === 'string' && node1 !== node2) ||
    node1.tag !== node2.tag;
}
