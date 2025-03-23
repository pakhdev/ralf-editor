import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SelectionHandler } from '../../../../src/core/handlers/selection/selection.handler';
import { SelectedElement } from '../../../../src/core/entities/selected-element/selected-element.entity';
import { StoredSelection } from '../../../../src/core/entities/stored-selection/stored-selection.entity';

const { mockGetSelection } = vi.hoisted(() => {
    return {
        mockGetSelection: vi.fn(),
    };
});

vi.mock('../../../../src/core/handlers/selection/helpers/selection-getter.helper', () => {
    return {
        SelectionGetter: {
            get: mockGetSelection,
        },
    };
});

class MockRalf {
    editableDiv: HTMLElement;

    constructor(editableDiv: HTMLElement) {
        this.editableDiv = editableDiv;
        document.body.appendChild(this.editableDiv);
    }
}

describe('SelectionHandler', () => {
    const editableDiv = document.createElement('div');
    editableDiv.setAttribute('contenteditable', 'true');
    const textNode = document.createTextNode('Hello, world!');
    editableDiv.appendChild(textNode);

    const fallbackSelectedElement = new SelectedElement(textNode, 0);
    const initialSelection = {
        startElement: fallbackSelectedElement,
        endElement: fallbackSelectedElement,
        isCollapsed: true,
    } as StoredSelection;

    const updatedSelectedElement = new SelectedElement(textNode, 5);
    const updatedSelection = {
        startElement: updatedSelectedElement,
        endElement: updatedSelectedElement,
        isCollapsed: false,
    } as StoredSelection;

    let handler: SelectionHandler;

    beforeEach(() => {
        mockGetSelection.mockReset();
        mockGetSelection.mockReturnValueOnce(initialSelection);
        handler = new SelectionHandler(() => new MockRalf(editableDiv) as any);
    });

    it('should initialize with correct state', () => {
        expect(handler.currentSelection.startElement).toEqual(fallbackSelectedElement);
        expect(handler.currentSelection.endElement).toEqual(fallbackSelectedElement);
        expect(handler.currentSelection.isCollapsed).toBe(true);
        expect(handler.previousSelection.startElement).toEqual(fallbackSelectedElement);
        expect(handler.previousSelection.endElement).toEqual(fallbackSelectedElement);
        expect(handler.previousSelection.isCollapsed).toBe(true);
    });

    it('should update state correctly', () => {
        mockGetSelection.mockReturnValueOnce(updatedSelection);
        handler.storeSelection();

        expect(handler.previousSelection).toEqual(initialSelection);
        expect(handler.currentSelection).toEqual(updatedSelection);
    });
});

