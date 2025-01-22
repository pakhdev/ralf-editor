export function getParentNode(node: Node): Node {
    if (!node.parentNode) throw new Error('Node has no parent');
    return node.parentNode;
}

export function getPosition(node: Node): { node: Node, position: number } {
    const parentNode = getParentNode(node);
    const position = Array.from(parentNode.childNodes).indexOf(node as ChildNode);
    if (position === -1) throw new Error('Node not found in parent');

    return { node: parentNode, position };
}
