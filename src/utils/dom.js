// Small DOM helpers shared across views to keep rendering clean and safe.

/**
 * Create an element with attributes, dataset and children in one call.
 * @param {string} tag
 * @param {Object} [props] - attributes; supports `class`, `dataset`, `on*` events and `html`.
 * @param {(Node|string)[]} [children]
 * @returns {HTMLElement}
 */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key in node) {
      node[key] = value;
    } else {
      node.setAttribute(key, value);
    }
  }

  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }

  return node;
}

/** Replace all the content of a container with the given nodes. */
export function mount(container, ...nodes) {
  container.replaceChildren(...nodes);
}

/** Remove every child of a node. */
export function clear(node) {
  node.replaceChildren();
}

/** Shortcut for querySelector scoped to an optional root. */
export function qs(selector, root = document) {
  return root.querySelector(selector);
}
