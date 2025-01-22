export function isTextNode(node: Node): boolean {
    return node.nodeType === Node.TEXT_NODE;
}
