import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StoredSelection } from '../../../../../src/core/entities/stored-selection/stored-selection.entity';
import { SelectedElement } from '../../../../../src/core/entities/selected-element/selected-element.entity';
import { SelectionGetter } from '../../../../../src/core/handlers/selection/helpers/selection-getter.helper';
import { EditableNodes } from '../../../../../src/core/entities/editable-nodes/editable-nodes.entity';

describe('Selection Getter', () => {

    let editableDiv: HTMLDivElement;
    let textNode = EditableNodes.text.create();
    let imgNode = EditableNodes.image.create({ src: 'image.png' });

    beforeEach(() => {
        editableDiv = document.createElement('div');
        editableDiv.setAttribute('contenteditable', 'true');
        document.body.appendChild(editableDiv);
        textNode.textContent = 'Hello World';
    });

    afterEach(() => {
        editableDiv.remove();
    });

    const setSelectionRange = (
        startNode: Node,
        startOffset: number,
        endNode: Node,
        endOffset: number,
    ) => {
        const selection = window.getSelection();
        if (!selection) return;

        const range = document.createRange();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);

        selection.removeAllRanges();
        selection.addRange(range);
    };

    const clearSelection = () => {
        const selection = window.getSelection();
        if (!selection) return;

        selection.removeAllRanges();
    };

    it('should return the correct stored selection', () => {
        editableDiv.appendChild(textNode);
        setSelectionRange(textNode, 0, textNode, 5);
        const storedSelection = SelectionGetter.get(editableDiv);
        expect(storedSelection).toBeInstanceOf(StoredSelection);
        expect(storedSelection.startElement).toBeInstanceOf(SelectedElement);
        expect(storedSelection.endElement).toBeInstanceOf(SelectedElement);
        expect(storedSelection.isCollapsed).toBe(false);
    });

    it('should return the correct collapsed stored selection on a text node', () => {
        editableDiv.appendChild(textNode);
        setSelectionRange(textNode, 0, textNode, 0);
        const storedSelection = SelectionGetter.get(editableDiv);
        expect(storedSelection.startElement.node).toBe(textNode);
        expect(storedSelection.startElement.offset).toBe(0);
        expect(storedSelection.endElement.node).toBe(textNode);
        expect(storedSelection.endElement.offset).toBe(0);
        expect(storedSelection.isCollapsed).toBe(true);
    });

    it('should return the correct not collapsed stored selection on a text node', () => {
        editableDiv.appendChild(textNode);
        setSelectionRange(textNode, 0, textNode, 5);
        const storedSelection = SelectionGetter.get(editableDiv);
        expect(storedSelection.startElement.node).toBe(textNode);
        expect(storedSelection.startElement.offset).toBe(0);
        expect(storedSelection.endElement.node).toBe(textNode);
        expect(storedSelection.endElement.offset).toBe(5);
        expect(storedSelection.isCollapsed).toBe(false);
    });

    it('should return the correct selection on two different text nodes', () => {
        const textNode2 = document.createTextNode('Hello');
        editableDiv.append(textNode, textNode2);

        setSelectionRange(textNode, 5, textNode2, 5);
        const storedSelection = SelectionGetter.get(editableDiv);

        expect(storedSelection.startElement.node).toBe(textNode);
        expect(storedSelection.startElement.offset).toBe(5);
        expect(storedSelection.endElement.node).toBe(textNode2);
        expect(storedSelection.endElement.offset).toBe(5);
        expect(storedSelection.isCollapsed).toBe(false);
    });

    it('should return the correct selection before the image node', () => {
        editableDiv.appendChild(imgNode);
        setSelectionRange(editableDiv, 0, editableDiv, 0);

        const storedSelection = SelectionGetter.get(editableDiv);
        expect(storedSelection.startElement.node).toBe(imgNode);
        expect(storedSelection.startElement.position).toBe('before');
        expect(storedSelection.endElement.node).toBe(imgNode);
        expect(storedSelection.endElement.position).toBe('before');
        expect(storedSelection.isCollapsed).toBe(true);
    });

    it('should return the correct selection after the image node', () => {
        editableDiv.appendChild(imgNode);
        setSelectionRange(editableDiv, 1, editableDiv, 1);

        const storedSelection = SelectionGetter.get(editableDiv);
        expect(storedSelection.startElement.node).toBe(imgNode);
        expect(storedSelection.startElement.position).toBe('after');
        expect(storedSelection.endElement.node).toBe(imgNode);
        expect(storedSelection.endElement.position).toBe('after');
        expect(storedSelection.isCollapsed).toBe(true);
    });

    it('should return the correct selection of the image', () => {
        editableDiv.appendChild(imgNode);
        setSelectionRange(editableDiv, 0, editableDiv, 1);

        const storedSelection = SelectionGetter.get(editableDiv);
        expect(storedSelection.startElement.node).toBe(imgNode);
        expect(storedSelection.startElement.position).toBe('before');
        expect(storedSelection.endElement.node).toBe(imgNode);
        expect(storedSelection.endElement.position).toBe('after');
        expect(storedSelection.isCollapsed).toBe(false);
    });

    it('should return the fallback selection when no selection is made', () => {
        clearSelection();
        editableDiv.appendChild(textNode);
        const fallbackSelection = SelectionGetter.get(editableDiv);
        expect(fallbackSelection.startElement.node).toBe(textNode);
        expect(fallbackSelection.startElement.offset).toBe(0);
        expect(fallbackSelection.endElement.node).toBe(textNode);
        expect(fallbackSelection.endElement.offset).toBe(0);
        expect(fallbackSelection.isCollapsed).toBe(true);
    });

    it('should create a new text node if no content node is found', () => {
        clearSelection();
        const fallbackSelection = SelectionGetter.get(editableDiv);
        expect(editableDiv.childNodes.length).toBe(1);

        const newTextNode = editableDiv.childNodes[0];
        expect(fallbackSelection.startElement.node).toBe(newTextNode);
        expect(fallbackSelection.startElement.offset).toBe(0);
        expect(fallbackSelection.endElement.node).toBe(newTextNode);
        expect(fallbackSelection.endElement.offset).toBe(0);
        expect(fallbackSelection.isCollapsed).toBe(true);
    });
});