import { EditableNodes } from '../../entities/editable-nodes/editable-nodes.entity.ts';

/**
 * Searches for the nearest content node starting from the given node, moving in the specified direction.
 *
 * The search behavior depends on the `checkStartElement` flag:
 * - If `checkStartElement` is `true`, the function first checks whether the starting node itself is a content node.
 *   - If yes, it returns that node immediately.
 *   - If no, and the node has children, it recursively searches starting from the first child node.
 * - If `checkStartElement` is `false`, the function skips the starting node and immediately looks for the next node in the given direction.
 *
 * After the initial check:
 * - It traverses the DOM tree using `getNextNode`, moving either forward (next sibling or up to parent) or backward (previous sibling or up to parent).
 * - At each step, it checks:
 *   - If the current node itself is a content node, it returns it.
 *   - Otherwise, it searches recursively through the node's children (using `findChildContentNode`) in the specified direction.
 * - If no content node is found during traversal, the function returns `null`.
 *
 * A "content node" is defined as a node that satisfies the condition `EditableNodes.isContentNode`.
 *
 * @param node - The starting node from which to begin the search.
 * @param direction - The direction to move in the DOM: `'forward'` (toward next siblings) or `'backward'` (toward previous siblings).
 * @param checkStartElement - Whether to check the starting node itself before moving to siblings or children. Defaults to `false`.
 * @returns The found content node, or `null` if none is found.
 */
export function findContentNode(node: Node, direction: 'forward' | 'backward', checkStartElement: boolean = false): Node | null {
    if (checkStartElement) {
        if (EditableNodes.isContentNode(node))
            return node;
        else if (node.hasChildNodes())
            return findContentNode(node.childNodes[0], direction, true);
    }

    let currentNode: Node | null = node;
    while (currentNode) {
        currentNode = getNextNode(currentNode, direction);
        if (!currentNode) return null;
        if (EditableNodes.isContentNode(currentNode)) return currentNode;
        const contentChild = findChildContentNode(currentNode, direction);
        if (contentChild) return contentChild;
    }
    return null;
}

/**
 * Finds the first content node within the given parent node.
 *
 * @param node - The parent node to search inside.
 * @returns The first found content node or null if none is found.
 */
export function findFirstContentNodeOf(node: Node): Node | null {
    return findContentNode(node, 'forward', true);
}

/**
 * Finds the last content node within the given parent node.
 *
 * @param node - The parent node to search inside.
 * @returns The last found content node or null if none is found.
 */
export function findLastContentNodeOf(node: Node): Node | null {
    if (EditableNodes.isContentNode(node)) return node;
    const contentNodes = EditableNodes.identifyContentNodes(node);
    const length = contentNodes.length;
    return length
        ? contentNodes[length - 1]
        : null;
}

/**
 * Finds the next (or previous) sibling node, skipping over nodes without the `contenteditable` attribute.
 *
 * @param node - The current node to start searching from.
 * @param direction - The direction of traversal: 'forward' (next sibling) or 'backward' (previous sibling).
 * @returns The next valid node or null if none is found.
 */
export function getNextNode(node: Node | null, direction: 'forward' | 'backward'): Node | null {
    while (node && (!('getAttribute' in node) || !(node as HTMLElement).getAttribute('contenteditable'))) {
        const sibling = direction === 'forward' ? node.nextSibling : node.previousSibling;
        if (sibling) return sibling;
        node = node.parentNode;
    }
    return null;
}

/**
 * Recursively searches for a child content node in the given direction.
 *
 * @param node - The parent node to search inside.
 * @param direction - The direction to traverse child nodes: 'forward' (from first to last) or 'backward' (from last to first).
 * @returns A found child content node or null if none is found.
 */
export function findChildContentNode(node: Node, direction: 'forward' | 'backward'): Node | null {
    const children = direction === 'backward'
        ? Array.from(node.childNodes).reverse()
        : node.childNodes;

    for (const child of children) {
        if (EditableNodes.isContentNode(child)) return child;
        if (child.hasChildNodes()) {
            const contentChild = findChildContentNode(child, direction);
            if (contentChild) return contentChild;
        }
    }
    return null;
}
