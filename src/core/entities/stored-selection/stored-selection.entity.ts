import { SelectedElement } from '../selected-element/selected-element.entity.ts';
import { EditableNodes } from '../editable-nodes/editable-nodes.entity.ts';
import { findFirstContentNodeOf, findLastContentNodeOf, getPosition, isTextNode } from '../../utils';
import { PositionReference } from '../mutations/interfaces/position-reference.interface.ts';

export class StoredSelection {
    insertionPoint: PositionReference = { node: this.editableDiv, position: 0 };
    selectedElements: Node[] = [];

    constructor(
        readonly editableDiv: HTMLDivElement,
        readonly startElement: SelectedElement,
        readonly endElement: SelectedElement,
        readonly isCollapsed: boolean,
    ) {
        this.insertionPoint = this.#getInsertionPoint();
        this.selectedElements = this.#getSelectedContent();
    }

    get isAtStart(): boolean {
        return this.startElement.isFirstElement && this.startElement.isCaretAtStart;
    }

    get isAtEnd(): boolean {
        return this.endElement.isLastElement && this.endElement.isCaretAtEnd;
    }

    get isTextNodeRange(): boolean {
        return this.startElement.node === this.endElement.node && isTextNode(this.startElement.node);
    }

    get selectedText(): Text {
        if (!this.isTextNodeRange) throw new Error('Selected content is not text');
        const { startElement: { node, offset: start }, endElement: { offset: end } } = this;
        return document.createTextNode((node.textContent || '').slice(start, end));
    }

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

    isNodeSelected(node: Node): boolean {
        return this.selectedElements.includes(node);
    }

    isTextFullySelected(node: Node): boolean {
        const { startElement, endElement, isTextNodeRange, selectedElements } = this;

        if (node === startElement.node && startElement.isTextNode) {
            return startElement.isCaretAtStart && (!isTextNodeRange || endElement.isCaretAtEnd);
        }

        if (node === endElement.node && endElement.isTextNode) {
            return endElement.isCaretAtEnd && (!isTextNodeRange || startElement.isCaretAtStart);
        }

        return selectedElements.includes(node);
    }

    decreaseOffsetsBy(amount: number): void {
        this.startElement.offset -= amount;
        this.endElement.offset -= amount;
    }

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
