class VNode {
    constructor(tag, attrs = {}, children = []) {
        this.tag = tag.toLowerCase();
        this.attrs = attrs;
        this.children = children;
    }

    static fromDOM(node) {
        const tag = node.tagName.toLowerCase();
        const attrs = {};

        for (const name of node.getAttributeNames()) {
            attrs[name] = node.getAttribute(name);
        }

        const children = [];
        for (const child of node.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                if (child.textContent.trim()) {
                    children.push(child.textContent.trim());
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                children.push(VNode.fromDOM(child));
            }
        }
        return new VNode(tag, attrs, children);
    }
}
