import { EditableNodes } from '../editable-nodes/editable-nodes.entity.ts';
import { isTextNode, findContentNode } from '../../utils';

/**
 * Represents a single node within a selection, with information about its position and offset.
 */
export class SelectedElement {

    /**
     * Offset within the node (only relevant if the node is a text node).
     */
    offset: number = 0;
    /**
     * Position relative to the node:
     * - 'before': before the node
     * - 'after': after the node
     * - 'exact': at a specific node
     */
    position: 'before' | 'after' | 'exact' = 'exact';

    /**
     * Creates a SelectedElement instance.
     *
     * @param node - The DOM node associated with the selection point.
     * @param position - Either a numeric offset (for text nodes) or a relative position keyword ('before' | 'after' | 'inside' | 'exact').
     */
    constructor(public readonly node: Node, position: number | 'before' | 'after' | 'exact' = 'exact') {
        if (typeof position === 'number') {
            this.offset = position;
        } else {
            this.position = position;
        }
    }

    /**
     * Checks if the node is a text node.
     */
    get isTextNode(): boolean {
        return isTextNode(this.node);
    }

    /**
     * Checks if the node is a content node according to EditableNodes rules.
     */
    get isContentNode(): boolean {
        return EditableNodes.isContentNode(this.node);
    }

    /**
     * Determines whether this node is the first editable content node.
     */
    get isFirstElement(): boolean {
        return !findContentNode(this.node, 'backward');
    }

    /**
     * Determines whether this node is the last editable content node.
     */
    get isLastElement(): boolean {
        return !findContentNode(this.node, 'forward');
    }

    /**
     * Determines whether the caret is positioned at the start of the node.
     */
    get isCaretAtStart(): boolean {
        return isTextNode(this.node)
            ? this.position === 'exact' && this.offset === 0
            : this.position === 'before';
    }

    /**
     * Determines whether the caret is positioned at the end of the node.
     */
    get isCaretAtEnd(): boolean {
        return isTextNode(this.node)
            ? this.position === 'exact' && this.offset === this.node.textContent?.length
            : this.position === 'after';
    }
}
