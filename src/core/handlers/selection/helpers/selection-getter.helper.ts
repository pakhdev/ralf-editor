import { EditableNodes } from '../../../entities/editable-nodes/editable-nodes.entity.ts';
import { SelectedElement } from '../../../entities/selected-element/selected-element.entity.ts';
import { StoredSelection } from '../../../entities/stored-selection/stored-selection.entity.ts';
import { getPosition, isTextNode } from '../../../utils';

/**
 * A utility class to retrieve the current user selection from the editor.
 * and transform it into a structured {@link StoredSelection} object.
 */
export class SelectionGetter {

    /**
     * Retrieves the current selection inside a specified editable div and returns it
     * as a {@link StoredSelection} instance. If there is no valid selection, returns a fallback selection.
     *
     * @param editableDiv - The editable HTML div element from which to extract the selection.
     * @returns A {@link StoredSelection} object representing the current selection.
     */
    public static get(editableDiv: HTMLDivElement): StoredSelection {
        const selection = window.getSelection();
        if (!selection || !this.#isSelectionOnEditor(selection, editableDiv))
            return this.#getFallbackSelection(editableDiv);

        const range = selection.getRangeAt(0);
        return new StoredSelection(
            editableDiv,
            this.#getSelectedElement(range.startContainer, range.startOffset),
            this.#getSelectedElement(range.endContainer, range.endOffset),
            selection.isCollapsed,
        );
    }

    /**
     * Converts a DOM node and an offset into a {@link SelectedElement}.
     * Handles cases when the node is a text node or an element node.
     *
     * @param parent - The parent DOM node where the selection occurs.
     * @param offset - The character offset or child node index within the parent node.
     * @returns A {@link SelectedElement} representing the selection point.
     * @throws If the selected node cannot be identified.
     */
    static #getSelectedElement(parent: Node, offset: number): SelectedElement {
        if (parent.nodeType === Node.TEXT_NODE)
            return new SelectedElement(parent, offset);

        const previousNode = parent.childNodes[offset - 1];
        if (offset > 0 && previousNode?.nodeType !== Node.TEXT_NODE)
            return new SelectedElement(previousNode, 'after');

        const nextNode = parent.childNodes[offset];
        if (nextNode)
            return nextNode.nodeType === Node.TEXT_NODE
                ? new SelectedElement(nextNode, 0)
                : new SelectedElement(nextNode, 'before');

        throw new Error('Unable to identify selected element');
    }

    /**
     * Creates a fallback {@link StoredSelection} if there is no valid user selection.
     * It selects the first available content node inside the editable div.
     *
     * If no content node is found, a new empty text node will be created and the selection
     * will point to it.
     *
     * @param editableDiv - The editable div to generate a fallback selection from.
     * @returns A {@link StoredSelection} selecting the first available content node.
     */
    static #getFallbackSelection(editableDiv: HTMLDivElement): StoredSelection {
        const contentElement = EditableNodes.identifyContentNodes(editableDiv, true)[0];
        const { node, position } = isTextNode(contentElement)
            ? { node: contentElement, position: 0 }
            : getPosition(contentElement);

        return new StoredSelection(
            editableDiv,
            this.#getSelectedElement(node, position),
            this.#getSelectedElement(node, position),
            true,
        );
    }

    /**
     * Determines whether the current browser selection is inside the provided editable div.
     *
     * @param selection - The current {@link Selection} object from the window.
     * @param editableDiv - The editable div to check against.
     * @returns True if the selection is within the editable div, otherwise false.
     */
    static #isSelectionOnEditor(selection: Selection, editableDiv: HTMLDivElement): boolean {
        return !!(selection?.focusNode && editableDiv.contains(selection.anchorNode) && selection.rangeCount);
    }

}
