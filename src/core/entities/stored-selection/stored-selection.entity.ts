import { SelectedElement } from '../selected-element/selected-element.entity.ts';
import { EditableNodes } from '../editable-nodes/editable-nodes.entity.ts';
import { findFirstContentNodeOf, findLastContentNodeOf, getPosition, isTextNode } from '../../utils';
import { PositionReference } from '../mutations/interfaces/position-reference.interface.ts';

/**
 * Represents a stored selection, including its start and end points,
 * and provides methods to manipulate or query the selected content.
 */
export class StoredSelection {

    insertionPoint: PositionReference = { node: this.editableDiv, position: 0 };
    selectedNodes: Node[] = [];

    /**
     * Creates a StoredSelection instance.
     *
     * @param editableDiv - The main editable container element
     * @param startElement - The start point of the selection
     * @param endElement - The end point of the selection
     * @param isCollapsed - Whether the selection is collapsed (i.e., a caret without a range)
     */
    constructor(
        readonly editableDiv: HTMLDivElement,
        readonly startElement: SelectedElement,
        readonly endElement: SelectedElement,
        readonly isCollapsed: boolean,
    ) {
        this.insertionPoint = this.#getInsertionPoint();
        this.selectedNodes = this.#getSelectedContent();
    }

    /**
     * Whether the selection is at the start of the editable content.
     */
    get isAtStart(): boolean {
        return this.startElement.isFirstElement && this.startElement.isCaretAtStart;
    }

    /**
     * Whether the selection is at the end of the editable content.
     */
    get isAtEnd(): boolean {
        return this.endElement.isLastElement && this.endElement.isCaretAtEnd;
    }

    /**
     * Checks if the selection is entirely within a single text node.
     */
    get isTextNodeRange(): boolean {
        return this.startElement.node === this.endElement.node && isTextNode(this.startElement.node);
    }

    /**
     * Retrieves the selected text as a Text node.
     * Throws an error if the selection does not cover a single text node.
     */
    get selectedText(): Text {
        if (!this.isTextNodeRange) throw new Error('Selected content is not text');
        const { startElement: { node, offset: start }, endElement: { offset: end } } = this;
        return document.createTextNode((node.textContent || '').slice(start, end));
    }

    /**
     * Finds the selection offsets for a given text node.
     *
     * @param node - The node to find offsets for.
     * @returns An object containing start and end offsets.
     * @throws If the node is not selected.
     */
    findTextNodeOffsets(node: Node): { start: number, end: number } {
        if (this.isTextNodeRange && this.startElement.node === node) {
            return { start: this.startElement.offset, end: this.endElement.offset };
        } else if (node === this.startElement.node) {
            return { start: this.startElement.offset, end: node.textContent?.length || 0 };
        } else if (node === this.endElement.node) {
            return { start: 0, end: this.endElement.offset };
        } else if (this.isNodeSelected(node)) {
            return { start: 0, end: node.textContent?.length || 0 };
        } else throw new Error('Node is not selected');
    }

    /**
     * Checks whether a given node is part of the selected content.
     *
     * @param node - The node to check.
     * @returns True if the node is selected, false otherwise.
     */
    isNodeSelected(node: Node): boolean {
        return this.selectedNodes.includes(node);
    }

    /**
     * Determines if an entire text node is fully selected.
     *
     * @param node - The text node to check.
     * @returns True if fully selected, false otherwise.
     */
    isTextFullySelected(node: Node): boolean {
        const { startElement, endElement, isTextNodeRange, selectedNodes } = this;

        if (node === startElement.node && startElement.isTextNode) {
            return startElement.isCaretAtStart && (!isTextNodeRange || endElement.isCaretAtEnd);
        }

        if (node === endElement.node && endElement.isTextNode) {
            return endElement.isCaretAtEnd && (!isTextNodeRange || startElement.isCaretAtStart);
        }

        return selectedNodes.includes(node);
    }

    /**
     * Decreases the start and end offsets of the selection by a specified amount.
     *
     * @param amount - The number of characters to decrease by.
     */
    decreaseOffsetsBy(amount: number): void {
        this.startElement.offset -= amount;
        this.endElement.offset -= amount;
    }

    /**
     * Decreases the insertion point's position by a specified amount.
     *
     * @param amount - The number of positions to decrease by.
     * @throws If the resulting position becomes negative.
     */
    decreaseInsertionPositionBy(amount: number): void {
        this.insertionPoint.position -= amount;
        if (this.insertionPoint.position < 0)
            throw new Error('Error: The assigned position is less than 0');
    }

    #getSelectedContent(): Node[] {
        const commonAncestor = this.#findCommonAncestor(this.startElement.node, this.endElement.node);
        const parentContentNodes = EditableNodes.identifyContentNodes(commonAncestor);

        const isEmptyTextNode = (element: SelectedElement) =>
            isTextNode(element.node) && !(element.node as Text).data.length;

        const skipStart = this.startElement.isCaretAtEnd && !isEmptyTextNode(this.startElement);
        const skipEnd = this.endElement.isCaretAtStart && !isEmptyTextNode(this.endElement);

        return this.#getSliceBetween(
            parentContentNodes,
            findLastContentNodeOf(this.startElement.node),
            findFirstContentNodeOf(this.endElement.node),
            skipStart,
            skipEnd,
        );
    }

    #getInsertionPoint(): PositionReference {
        const insertionPoint = getPosition(this.startElement.node);

        if (
            (this.startElement.isTextNode && !this.startElement.isCaretAtStart)
            ||
            (!this.startElement.isTextNode && this.startElement.position === 'after')
        ) insertionPoint.position++;

        return insertionPoint;
    }

    #findCommonAncestor(startNode: Node, endNode: Node): Node {
        let currentNode: Node | null = startNode.parentNode;
        while (currentNode) {
            if (currentNode.contains(endNode))
                return currentNode;
            currentNode = currentNode.parentNode;
        }
        throw new Error('No common ancestor found');
    }

    #getSliceBetween(
        list: Node[],
        startNode: Node | null, endNode: Node | null,
        skipStart: boolean, skipEnd: boolean,
    ): Node[] {
        if (!startNode || !endNode)
            throw new Error('Start or end node not found');

        let startIndex = list.indexOf(startNode);
        if (skipStart) startIndex++;

        let endIndex = list.indexOf(endNode);
        if (skipEnd) endIndex--;

        if (startIndex === -1 || endIndex === -1 || startIndex > endIndex)
            return [];
        return list.slice(startIndex, endIndex + 1);
    }
}
