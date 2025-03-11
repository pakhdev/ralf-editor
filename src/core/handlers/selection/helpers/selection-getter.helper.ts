import { EditableNodes } from '../../../entities/editable-nodes/editable-nodes.entity.ts';
import { SelectedElement } from '../../../entities/selected-element/selected-element.entity.ts';
import { StoredSelection } from '../../../entities/stored-selection/stored-selection.entity.ts';
import { getPosition, isTextNode } from '../../../utils';

export class SelectionGetter {
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

    static #isSelectionOnEditor(selection: Selection, editableDiv: HTMLDivElement): boolean {
        return !!(selection?.focusNode && editableDiv.contains(selection.anchorNode) && selection.rangeCount);
    }

}
