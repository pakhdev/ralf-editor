import { describe, it, expect, beforeEach } from 'vitest';
import { StoredSelection } from '../../../../src/core/entities/stored-selection/stored-selection.entity';
import { SelectedElement } from '../../../../src/core/entities/selected-element/selected-element.entity';
import { EditableNodes } from '../../../../src/core/entities/editable-nodes/editable-nodes.entity';

describe('StoredSelection', () => {

    let editor: HTMLDivElement;
    let img = EditableNodes.image.create({ src: 'https://example.com/image.jpg' });
    let textNode = EditableNodes.text.create({ text: 'Hello, world!' });

    beforeEach(() => {
        editor = document.createElement('div');
        editor.setAttribute('contenteditable', 'true');
        textNode.textContent = 'Hello, world!';
    });

    describe('SelectedNodes', () => {
        it('should treat a selection that starts before and ends after an image as a selected element', () => {
            editor.appendChild(img);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(img, 'before'),
                new SelectedElement(img, 'after'),
                false,
            );
            expect(selection.selectedNodes.length).toBe(1);
            expect(selection.selectedNodes[0]).toBe(img);
        });

        it('should treat a fully selected text node as a selected element', () => {
            editor.appendChild(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(textNode, (textNode as unknown as Text).length),
                false,
            );

            expect(selection.selectedNodes.length).toBe(1);
            expect(selection.selectedNodes[0]).toBe(textNode);
        });

        it('should treat a collapsed selection in an empty text node as a selected element', () => {
            const emptyText = EditableNodes.text.create({ text: '' });
            editor.appendChild(emptyText);

            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(emptyText, 0),
                new SelectedElement(emptyText, 0),
                true,
            );
            expect(selection.selectedNodes.length).toBe(1);
            expect(selection.selectedNodes[0]).toBe(emptyText);
        });

        it('should include partially selected nodes at the start and end of the selection', () => {
            const secondTextNode = EditableNodes.text.create({ text: 'Hello, world!' });
            editor.append(textNode, secondTextNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 1),
                new SelectedElement(secondTextNode, 1),
                false,
            );
            expect(selection.selectedNodes.length).toBe(2);
            expect(selection.selectedNodes[0]).toBe(textNode);
            expect(selection.selectedNodes[1]).toBe(secondTextNode);
        });

        it('should not have selected nodes when selection is collapsed at start of a non-empty text node', () => {
            editor.append(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(textNode, 0),
                true,
            );
            expect(selection.selectedNodes.length).toBe(0);
        });

        it('should not have selected elements when selection is collapsed at end of a non-empty text node', () => {
            editor.append(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, (textNode as unknown as Text).length),
                new SelectedElement(textNode, (textNode as unknown as Text).length),
                true,
            );
            expect(selection.selectedNodes.length).toBe(0);
        });

        it('should not have selected elements when selection is collapsed before an image', () => {
            editor.append(img);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(img, 'before'),
                new SelectedElement(img, 'before'),
                true,
            );
            expect(selection.selectedNodes.length).toBe(0);
        });

        it('should not have selected elements when selection is collapsed after an image', () => {
            editor.append(img);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(img, 'after'),
                new SelectedElement(img, 'after'),
                true,
            );
            expect(selection.selectedNodes.length).toBe(0);
        });
    });

    describe('Insertion Point', () => {
        it('should set insertion point after an image at image position +1', () => {
            editor.appendChild(img);
            const selection = new StoredSelection(
                editor,
                new SelectedElement(img, 'after'),
                new SelectedElement(img, 'after'),
                true,
            );
            expect(selection.insertionPoint.node).toBe(editor);
            expect(selection.insertionPoint.position).toBe(1);
        });

        it('should set insertion point before an image at image position', () => {
            editor.appendChild(img);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(img, 'before'),
                new SelectedElement(img, 'before'),
                true,
            );
            expect(selection.insertionPoint.node).toBe(editor);
            expect(selection.insertionPoint.position).toBe(0);
        });

        it('should set insertion point at the position of the text node', () => {
            editor.appendChild(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(textNode, 0),
                true,
            );
            expect(selection.insertionPoint.node).toBe(editor);
            expect(selection.insertionPoint.position).toBe(0);
        });

        it('should set insertion point after the position of the text node', () => {
            editor.appendChild(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 1),
                new SelectedElement(textNode, 1),
                true,
            );
            expect(selection.insertionPoint.node).toBe(editor);
            expect(selection.insertionPoint.position).toBe(1);
        });
    });

    describe('isAtStart', () => {
        it('true - first text node, caret at start', () => {
            editor.appendChild(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(textNode, 0),
                true,
            );
            expect(selection.isAtStart).toBe(true);
        });

        it('false - first text node, caret not at start', () => {
            editor.appendChild(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 1),
                new SelectedElement(textNode, 1),
                true,
            );
            expect(selection.isAtStart).toBe(false);
        });

        it('false - not first text node, caret at start', () => {
            const secondTextNode = EditableNodes.text.create({ text: 'Hello, world!' });
            editor.append(textNode, secondTextNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(secondTextNode, 0),
                new SelectedElement(secondTextNode, 0),
                true,
            );
            expect(selection.isAtStart).toBe(false);
        });

        it('false - not first text node, caret not at start', () => {
            const secondTextNode = EditableNodes.text.create({ text: 'Hello, world!' });
            editor.append(textNode, secondTextNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(secondTextNode, 1),
                new SelectedElement(secondTextNode, 1),
                true,
            );
            expect(selection.isAtStart).toBe(false);
        });

        it('true - first image, selection position before', () => {
            editor.appendChild(img);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(img, 'before'),
                new SelectedElement(img, 'before'),
                true,
            );
            expect(selection.isAtStart).toBe(true);
        });

        it('false - first image, selection position after', () => {
            editor.appendChild(img);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(img, 'after'),
                new SelectedElement(img, 'after'),
                true,
            );
            expect(selection.isAtStart).toBe(false);
        });

        it('false - not first image, selection position before', () => {
            const secondImg = EditableNodes.image.create({ src: 'https://example.com/image2.jpg' });
            editor.append(img, secondImg);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(secondImg, 'before'),
                new SelectedElement(secondImg, 'before'),
                true,
            );
            expect(selection.isAtStart).toBe(false);
        });

        it('false - not first image, selection position after', () => {
            const secondImg = EditableNodes.image.create({ src: 'https://example.com/image2.jpg' });
            editor.append(img, secondImg);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(secondImg, 'after'),
                new SelectedElement(secondImg, 'after'),
                true,
            );
            expect(selection.isAtStart).toBe(false);
        });
    });

    describe('isAtEnd', () => {
        it('true - last text node, caret at end', () => {
            editor.appendChild(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, (textNode as unknown as Text).length),
                new SelectedElement(textNode, (textNode as unknown as Text).length),
                true,
            );
            expect(selection.isAtEnd).toBe(true);
        });

        it('false - last text node, caret not at end', () => {
            editor.appendChild(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 1),
                new SelectedElement(textNode, 1),
                true,
            );
            expect(selection.isAtEnd).toBe(false);
        });

        it('false - not last text node, caret at end', () => {
            const secondTextNode = EditableNodes.text.create({ text: 'Hello, world!' });
            editor.append(textNode, secondTextNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, (secondTextNode as unknown as Text).length),
                new SelectedElement(textNode, (secondTextNode as unknown as Text).length),
                true,
            );
            expect(selection.isAtEnd).toBe(false);
        });

        it('false - not last text node, caret not at end', () => {
            const secondTextNode = EditableNodes.text.create({ text: 'Hello, world!' });
            editor.append(textNode, secondTextNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 1),
                new SelectedElement(textNode, 1),
                true,
            );
            expect(selection.isAtEnd).toBe(false);
        });

        it('true - last image, selection position after', () => {
            editor.appendChild(img);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(img, 'after'),
                new SelectedElement(img, 'after'),
                true,
            );
            expect(selection.isAtEnd).toBe(true);
        });

        it('false - last image, selection position before', () => {
            editor.appendChild(img);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(img, 'before'),
                new SelectedElement(img, 'before'),
                true,
            );
            expect(selection.isAtEnd).toBe(false);
        });

        it('false - not last image, selection position after', () => {
            const secondImg = EditableNodes.image.create({ src: 'https://example.com/image2.jpg' });
            editor.append(img, secondImg);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(img, 'after'),
                new SelectedElement(img, 'after'),
                true,
            );
            expect(selection.isAtEnd).toBe(false);
        });

        it('false - not last image, selection position before', () => {
            const secondImg = EditableNodes.image.create({ src: 'https://example.com/image2.jpg' });
            editor.append(img, secondImg);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(img, 'before'),
                new SelectedElement(img, 'before'),
                true,
            );
            expect(selection.isAtEnd).toBe(false);
        });

    });

    describe('isTextNodeRange', () => {
        it('should return true for a selection within a single text node', () => {
            editor.appendChild(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(textNode, 5),
                false,
            );
            expect(selection.isTextNodeRange).toBe(true);
        });

        it('should return false for a selection across multiple text nodes', () => {
            const secondTextNode = EditableNodes.text.create({ text: 'Hello, world!' });
            editor.append(textNode, secondTextNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(secondTextNode, 5),
                false,
            );
            expect(selection.isTextNodeRange).toBe(false);
        });
    });

    describe('selectedText', () => {
        it('should return the selected text as a Text node', () => {
            editor.appendChild(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(textNode, 5),
                false,
            );
            expect(selection.selectedText.textContent).toBe('Hello');
        });

        it('should throw an error if the selection is not within a single text node', () => {
            const secondTextNode = EditableNodes.text.create({ text: 'Hello, world!' });
            editor.append(textNode, secondTextNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(secondTextNode, 5),
                false,
            );
            expect(() => selection.selectedText).toThrow('Selected content is not text');
        });
    });

    describe('findTextNodeOffsets', () => {
        it('should return the correct offsets for a fully selected text node', () => {
            const secondTextNode = EditableNodes.text.create({ text: 'Hello, world!' });
            const thirdTextNode = EditableNodes.text.create({ text: 'Hello, world!' });
            editor.append(textNode, secondTextNode, thirdTextNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(thirdTextNode, (thirdTextNode as unknown as Text).length),
                false,
            );
            expect(selection.findTextNodeOffsets(textNode).start).toBe(0);
            expect(selection.findTextNodeOffsets(textNode).end).toBe((textNode as unknown as Text).length);
            expect(selection.findTextNodeOffsets(secondTextNode).start).toBe(0);
            expect(selection.findTextNodeOffsets(secondTextNode).end).toBe((secondTextNode as unknown as Text).length);
            expect(selection.findTextNodeOffsets(thirdTextNode).start).toBe(0);
            expect(selection.findTextNodeOffsets(thirdTextNode).end).toBe((thirdTextNode as unknown as Text).length);
        });

        it('should return the correct offsets for a partially selected text node', () => {
            const secondTextNode = EditableNodes.text.create({ text: 'Hello, world!' });
            const thirdTextNode = EditableNodes.text.create({ text: 'Hello, world!' });
            editor.append(textNode, secondTextNode, thirdTextNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 1),
                new SelectedElement(thirdTextNode, 1),
                false,
            );
            expect(selection.findTextNodeOffsets(textNode).start).toBe(1);
            expect(selection.findTextNodeOffsets(textNode).end).toBe((textNode as unknown as Text).length);
            expect(selection.findTextNodeOffsets(thirdTextNode).start).toBe(0);
            expect(selection.findTextNodeOffsets(thirdTextNode).end).toBe(1);
        });

        it('should throw an error if the node is not selected', () => {
            const selectedTextNode = EditableNodes.text.create({ text: 'Hello, world!' });
            editor.append(textNode, selectedTextNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(textNode, 5),
                false,
            );
            expect(() => selection.findTextNodeOffsets(selectedTextNode)).toThrow('Node is not selected');
        });
    });

    describe('isNodeSelected', () => {
        it('should return true for a selected node', () => {
            editor.append(textNode, img);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(img, 'after'),
                false,
            );
            expect(selection.isNodeSelected(img)).toBe(true);
        });

        it('should return false for a non-selected node', () => {
            editor.append(textNode, img);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(img, 'before'),
                false,
            );
            expect(selection.isNodeSelected(img)).toBe(false);
        });
    });

    describe('isTextFullySelected', () => {
        it('should return true for a fully selected text node', () => {
            editor.append(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(textNode, (textNode as unknown as Text).length),
                false,
            );
            expect(selection.isTextFullySelected(textNode)).toBe(true);
        });

        it('should return false for a partially selected text node', () => {
            editor.append(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 1),
                new SelectedElement(textNode, (textNode as unknown as Text).length),
                false,
            );
            expect(selection.isTextFullySelected(textNode)).toBe(false);
        });

        it('should return false for a non-selected text node', () => {
            const secondTextNode = EditableNodes.text.create({ text: 'Hello, world!' });
            editor.append(textNode, secondTextNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 0),
                new SelectedElement(textNode, (textNode as unknown as Text).length),
                false,
            );
            expect(selection.isTextFullySelected(secondTextNode)).toBe(false);
        });
    });

    describe('decreaseOffsetsBy', () => {
        it('should decrease the start and end offsets of the selection', () => {
            editor.appendChild(textNode);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(textNode, 5),
                new SelectedElement(textNode, 10),
                false,
            );
            selection.decreaseOffsetsBy(2);
            expect(selection.startElement.offset).toBe(3);
            expect(selection.endElement.offset).toBe(8);
        });
    });

    describe('decreaseInsertionPositionBy', () => {
        it('should decrease the insertion point position', () => {
            editor.appendChild(img);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(img, 'after'),
                new SelectedElement(img, 'after'),
                false,
            );
            selection.decreaseInsertionPositionBy(1);
            expect(selection.insertionPoint.position).toBe(0);
        });

        it('should throw an error if the resulting position is negative', () => {
            editor.appendChild(img);
            const selection = new StoredSelection(
                editor as HTMLDivElement,
                new SelectedElement(img, 'before'),
                new SelectedElement(img, 'before'),
                false,
            );
            expect(() => selection.decreaseInsertionPositionBy(1)).toThrow('Error: The assigned position is less than 0');
        });
    });
});